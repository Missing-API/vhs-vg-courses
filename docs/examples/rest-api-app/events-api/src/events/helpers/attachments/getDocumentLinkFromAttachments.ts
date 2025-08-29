import { calendar_v3 } from "@googleapis/calendar";
import Schema$EventAttachment = calendar_v3.Schema$EventAttachment;

export const getDocumentLinkFromAttachments = (
  attachments?: Schema$EventAttachment[]
): string | null => {
  if (!attachments) return null;
  if (attachments.length === 0) return null;

  const images: Schema$EventAttachment[] = attachments.filter(
    (attachment) => attachment.mimeType === "application/pdf"
  );

  if (images.length > 0) {
    return images[0].fileUrl || null;
  }
  return null;
};
