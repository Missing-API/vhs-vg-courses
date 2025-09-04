import { describe, it, expect } from "vitest";
import { htmlToText } from "./htmlToText";

describe("htmlToText", () => {
  it("should convert HTML to plain text", () => {
    const html = '<p>Hello <strong>world</strong></p><br><div>Line 2</div>';
    const result = htmlToText(html);
    expect(result).toBe("Hello world\n\nLine 2");
  });

  it("should handle empty or no HTML", () => {
    expect(htmlToText("")).toBe("");
    expect(htmlToText("Plain text")).toBe("Plain text");
  });

  it("should decode HTML entities", () => {
    const html = "Hello &amp; &lt;world&gt; &quot;test&quot;";
    const result = htmlToText(html);
    expect(result).toBe('Hello & <world> "test"');
  });

  it("should preserve line breaks from block elements", () => {
    const html = '<p>Paragraph 1</p><p>Paragraph 2</p>';
    const result = htmlToText(html);
    expect(result).toBe("Paragraph 1\nParagraph 2");
  });

  it("should remove scripts and styles", () => {
    const html = '<p>Text</p><script>alert("bad")</script><style>body{}</style><p>More text</p>';
    const result = htmlToText(html);
    expect(result).toBe("Text\nMore text");
  });

  it("should clean up multiple spaces and newlines", () => {
    const html = '<p>Text   with     spaces</p>\n\n\n<p>Another paragraph</p>';
    const result = htmlToText(html);
    expect(result).toBe("Text with spaces\n\nAnother paragraph");
  });
});
