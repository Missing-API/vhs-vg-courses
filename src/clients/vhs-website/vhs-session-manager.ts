import logger from "@/logging/logger";
import { withCategory } from "@/logging/helpers";

type CookieRecord = {
  value: string;
  domain?: string;
  path?: string;
  expires?: Date;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
};

type DomainKey = string;

export class VhsSessionManager {
  private cookies: Map<DomainKey, Map<string, CookieRecord>> = new Map();
  private readonly defaultDomain = "vhs-vg.de";
  private readonly sessionTimeoutMs: number;
  private readonly enableDebug: boolean;
  private readonly allowFallback: boolean;
  private lastUpdated = 0;
  private lockPromise: Promise<void> | null = null;
  private lockRelease: (() => void) | null = null;
  private log = withCategory(logger, "vhsSession");

  constructor(opts?: {
    sessionTimeoutMs?: number;
    enableDebug?: boolean;
    allowFallback?: boolean;
  }) {
    this.sessionTimeoutMs =
      opts?.sessionTimeoutMs ??
      (Number(process.env.VHS_SESSION_TIMEOUT) || 15 * 60 * 1000);
    this.enableDebug =
      opts?.enableDebug ??
      (process.env.VHS_COOKIE_DEBUG === "1" ||
        process.env.VHS_COOKIE_DEBUG === "true");
    this.allowFallback =
      opts?.allowFallback ??
      (process.env.VHS_SESSION_FALLBACK === "1" ||
        process.env.VHS_SESSION_FALLBACK === "true");
  }

  private dkeyFromUrl(url: string): DomainKey {
    try {
      const u = new URL(url);
      const host = u.hostname;
      const parts = host.split(".");
      if (parts.length >= 2) {
        return parts.slice(-2).join(".");
      }
      return host;
    } catch {
      return this.defaultDomain;
    }
  }

  private async lock() {
    while (this.lockPromise) {
      await this.lockPromise;
    }
    this.lockPromise = new Promise<void>((resolve) => {
      this.lockRelease = resolve;
    });
  }

  private release() {
    if (this.lockRelease) {
      this.lockRelease();
    }
    this.lockPromise = null;
    this.lockRelease = null;
  }

  isExpired(): boolean {
    const expired =
      !this.lastUpdated || Date.now() - this.lastUpdated > this.sessionTimeoutMs;
    return expired;
  }

  reset() {
    this.cookies.clear();
    this.lastUpdated = 0;
  }

  getCookieHeader(url: string): string | undefined {
    const dkey = this.dkeyFromUrl(url);
    const domainCookies = this.cookies.get(dkey);
    if (!domainCookies || domainCookies.size === 0) return undefined;

    const parts: string[] = [];
    domainCookies.forEach((rec, name) => {
      if (rec.expires && rec.expires.getTime() < Date.now()) {
        return;
      }
      parts.push(`${name}=${rec.value}`);
    });
    if (parts.length === 0) return undefined;
    const header = parts.join("; ");
    if (this.enableDebug) {
      this.log.debug({ op: "cookie.header", dkey, header }, "Attach cookies");
    }
    return header;
  }

  updateFromResponse(url: string, res: Response) {
    const setCookie = res.headers.get("set-cookie");
    if (!setCookie) return;

    // Node/undici may fold multiple Set-Cookie with comma, but commas can appear in Expires.
    // Split robustly: look for occurrences of ", " followed by token and "=" and a ";" later
    const raw = this.safeSplitSetCookie(setCookie);

    for (const sc of raw) {
      const parsed = this.parseSetCookie(sc);
      if (!parsed) continue;

      const dkey = parsed.domain || this.dkeyFromUrl(url);
      if (!this.cookies.has(dkey)) {
        this.cookies.set(dkey, new Map());
      }
      const domainMap = this.cookies.get(dkey)!;
      domainMap.set(parsed.name, {
        value: parsed.value,
        domain: parsed.domain,
        path: parsed.path,
        expires: parsed.expires,
        secure: parsed.secure,
        httpOnly: parsed.httpOnly,
        sameSite: parsed.sameSite,
      });

      if (this.enableDebug) {
        this.log.debug(
          { op: "cookie.store", dkey, name: parsed.name, attrs: { ...parsed, value: undefined } },
          "Stored cookie"
        );
      }
    }
    this.lastUpdated = Date.now();
  }

  private safeSplitSetCookie(header: string): string[] {
    const parts: string[] = [];
    let current = "";
    let inExpires = false;

    for (let i = 0; i < header.length; i++) {
      const ch = header[i];
      const next2 = header.slice(i, i + 2);

      if (next2 === ", ") {
        if (!inExpires) {
          parts.push(current.trim());
          current = "";
          i++; // skip space after comma
          continue;
        }
      }
      current += ch;

      // Track Expires=...; which contains a comma
      if (header.slice(i - 7, i + 1).toLowerCase() === "expires=") {
        inExpires = true;
      }
      if (inExpires && ch === ";") {
        inExpires = false;
      }
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }

  private parseSetCookie(sc: string):
    | (CookieRecord & { name: string })
    | null {
    const parts = sc.split(";").map((p) => p.trim());
    if (parts.length === 0) return null;

    const [nv, ...attrs] = parts;
    const eqIdx = nv.indexOf("=");
    if (eqIdx <= 0) return null;
    const name = nv.slice(0, eqIdx).trim();
    const value = nv.slice(eqIdx + 1).trim();

    const rec: CookieRecord & { name: string } = { name, value };

    for (const attr of attrs) {
      const [kRaw, vRaw] = attr.split("=").map((s) => s?.trim());
      const k = (kRaw || "").toLowerCase();
      switch (k) {
        case "domain":
          rec.domain = vRaw?.replace(/^\./, "");
          break;
        case "path":
          rec.path = vRaw;
          break;
        case "expires":
          if (vRaw) {
            const d = new Date(vRaw);
            if (!isNaN(d.getTime())) {
              rec.expires = d;
            }
          }
          break;
        case "secure":
          rec.secure = true;
          break;
        case "httponly":
          rec.httpOnly = true;
          break;
        case "samesite":
          rec.sameSite = vRaw;
          break;
        default:
          // ignore unknown attributes
          break;
      }
    }

    return rec;
  }
}

export type { CookieRecord };