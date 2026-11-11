import type { FileUploadFile } from "panelui-taro/file-upload";

const PHOTO_URI = "https://avatars.githubusercontent.com/u/127331761?v=4&s=512";
export const UPLOAD_LIMIT = 10 * 1024 * 1024;
export const QUEUE_FIXTURE: FileUploadFile[] = [
  {
    id: "fixture-claim",
    kind: "document",
    mimeType: "application/pdf",
    name: "claim.pdf",
    size: 24_576,
    status: "idle",
    uri: "fixture://claim.pdf",
  },
  {
    id: "fixture-receipt",
    kind: "image",
    mimeType: "image/jpeg",
    name: "receipt.jpg",
    size: 98_304,
    status: "idle",
    uri: PHOTO_URI,
  },
];
export const AVATAR_FIXTURE: FileUploadFile[] = [
  {
    id: "fixture-profile",
    kind: "image",
    name: "profile.jpg",
    status: "done",
    uri: PHOTO_URI,
  },
];
export const GRID_FIXTURE: FileUploadFile[] = [
  {
    id: "fixture-cover",
    kind: "image",
    name: "cover.jpg",
    status: "done",
    uri: PHOTO_URI,
  },
  {
    id: "fixture-room",
    kind: "image",
    name: "room.jpg",
    status: "done",
    uri: PHOTO_URI,
  },
];
export const ATTACHMENT_FIXTURE: FileUploadFile[] = [
  {
    id: "fixture-message",
    kind: "document",
    mimeType: "application/pdf",
    name: "message.pdf",
    size: 8192,
    status: "idle",
    uri: "fixture://message.pdf",
  },
];
