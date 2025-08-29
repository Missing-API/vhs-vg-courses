import { describe, expect, test } from "vitest";

import { calendar_v3 } from "@googleapis/calendar";
import { getImageLinkFromAttachments } from "./getImageLinkFromAttachments";
import Schema$EventAttachment = calendar_v3.Schema$EventAttachment;

describe("should extract the first image link from google event ATTACHMENTS", () => {
  test("get the only image link", () => {
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
    expect(getImageLinkFromAttachments(attachments)).toBe(
      "https://drive.google.com/open?id=vIsual123&authuser=0"
    );
  });

  test("get first image link", () => {
    const attachments: Schema$EventAttachment[] = [
      {
        fileUrl: "https://drive.google.com/open?id=vIsual999&authuser=0",
        title: "Visual999.jpg",
        mimeType: "image/jpeg",
        iconLink:
          "https://drive-thirdparty.googleusercontent.com/16/type/image/jpeg",
        fileId: "vIsual999",
      },
      {
        fileUrl: "https://drive.google.com/open?id=vIsual123&authuser=0",
        title: "Visual123.jpg",
        mimeType: "image/jpeg",
        iconLink:
          "https://drive-thirdparty.googleusercontent.com/16/type/image/jpeg",
        fileId: "vIsual123",
      },
    ];
    expect(getImageLinkFromAttachments(attachments)).toBe(
      "https://drive.google.com/open?id=vIsual999&authuser=0"
    );
  });

  test("return null if no image exists", () => {
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
    expect(getImageLinkFromAttachments(attachments)).toBeNull();
  });
});
