import { describe, expect, test } from "vitest";

import { calendar_v3 } from "@googleapis/calendar";
import { getDocumentLinkFromAttachments } from "./getDocumentLinkFromAttachments";
import Schema$EventAttachment = calendar_v3.Schema$EventAttachment;

describe("should extract the first download link from google event ATTACHMENTS", () => {
  test("get the only pdf link", () => {
    const attachments: Schema$EventAttachment[] = [
      {
        fileUrl: "https://drive.google.com/open?id=aBc&authuser=0",
        title: "Abc.pdf",
        mimeType: "application/pdf",
        iconLink:
          "https://drive-thirdparty.googleusercontent.com/32/type/application/pdf",
        fileId: "aBc",
      },
    ];
    expect(getDocumentLinkFromAttachments(attachments)).toBe(
      "https://drive.google.com/open?id=aBc&authuser=0"
    );
  });

  test("get first pdf link", () => {
    const attachments: Schema$EventAttachment[] = [
      {
        fileUrl: "https://drive.google.com/open?id=aBc&authuser=0",
        title: "Abc.pdf",
        mimeType: "application/pdf",
        iconLink:
          "https://drive-thirdparty.googleusercontent.com/32/type/application/pdf",
        fileId: "aBc",
      },
      {
        fileUrl: "https://drive.google.com/open?id=XyZ&authuser=0",
        title: "Xyz.pdf",
        mimeType: "application/pdf",
        iconLink:
          "https://drive-thirdparty.googleusercontent.com/32/type/application/pdf",
        fileId: "XyZ",
      },
    ];
    expect(getDocumentLinkFromAttachments(attachments)).toBe(
      "https://drive.google.com/open?id=aBc&authuser=0"
    );
  });

  test("return null if no pdf exists", () => {
    const attachments: Schema$EventAttachment[] = [
      {
        fileUrl: "https://drive.google.com/open?id=vIsual123&authuser=0",
        title: "Visual123.jpg",
        mimeType: "image/jpeg",
        iconLink:
          "https://drive-thirdparty.googleusercontent.com/16/type/image/jpeg",
        fileId: "vIsual123",
      },
    ];
    expect(getDocumentLinkFromAttachments(attachments)).toBeNull();
  });
});
