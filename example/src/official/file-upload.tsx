import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import {
  FileUpload,
  useFileUpload,
  type FileUploadFile,
  type FileUploadHandler,
} from "panelui-taro/file-upload";
import { CameraIcon, PaperclipIcon, SendIcon } from "panelui-taro/icons";
import { Input } from "panelui-taro/input";
import { Message } from "panelui-taro/message";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import { demoAction } from "../runtime/demo-action";
import { useSafeAreaInsets } from "../runtime/native";
import { ScrollView, View, Image } from "../runtime/native";
import { ComponentEntry } from "../types";
const MB = 1024 * 1024;
const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const failedOnce = new Set<string>();
function useFreshFailures() {
  useState(() => failedOnce.clear());
}
const FLAKY = new Set(["claim-frame", "listing-lenses"]);
const fakeUpload: FileUploadHandler = (
  file,
  { signal, onProgress, setProcessing }
) =>
  new Promise((resolve, reject) => {
    const seed = hash(file.name);
    const duration = 3600 + (seed % 3200);
    const failAt =
      FLAKY.has(file.id) && !failedOnce.has(file.id)
        ? 0.58 + (seed % 20) / 100
        : null;
    let elapsed = 0;
    let tick = 0;
    const timer = setInterval(() => {
      tick += 1;
      elapsed += 60 + (hash(`${file.id}:${tick}`) % 140);
      const progress = Math.min(1, elapsed / duration);
      onProgress(progress);
      if (failAt !== null && progress >= failAt) {
        clearInterval(timer);
        failedOnce.add(file.id);
        reject(new Error("Connection lost. Tap retry."));
      } else if (progress >= 1) {
        clearInterval(timer);
        setProcessing();
        setTimeout(
          () => resolve({ url: `https://files.example.com/${file.id}` }),
          700
        );
      }
    }, 120);
    signal.addEventListener("abort", () => {
      clearInterval(timer);
      reject(new Error("Canceled"));
    });
  });
const seeded = (
  file: Omit<FileUploadFile, "kind"> & {
    kind?: FileUploadFile["kind"];
  }
): FileUploadFile => ({
  kind: "document",
  ...file,
});
const CLAIM_FILES: FileUploadFile[] = [
  seeded({
    id: "claim-police",
    uri: "file:///claim/police-report-0412.pdf",
    name: "police-report-0412.pdf",
    size: 1.8 * MB,
    mimeType: "application/pdf",
    status: "done",
    progress: 1,
  }),
  seeded({
    id: "claim-receipt",
    uri: "file:///claim/receipt-velo-workshop.pdf",
    name: "receipt-velo-workshop.pdf",
    size: 642 * 1024,
    mimeType: "application/pdf",
    status: "queued",
  }),
  seeded({
    id: "claim-bike",
    uri: photo("photo-1485965120184-e220f721d03e"),
    name: "bike-side-view.jpg",
    size: 3.4 * MB,
    mimeType: "image/jpeg",
    kind: "image",
    width: 900,
    height: 900,
    status: "queued",
  }),
  seeded({
    id: "claim-frame",
    uri: "file:///claim/frame-registration.pdf",
    name: "frame-registration.pdf",
    size: 1.1 * MB,
    mimeType: "application/pdf",
    status: "queued",
  }),
];
function ClaimFooter() {
  const { files } = useFileUpload();
  const done = files.filter((file) => file.status === "done").length;
  const busy = files.some((file) => file.status !== "done");
  return (
    <View className="gap-2 pt-2">
      <Text size="sm" muted className="text-center">
        {files.length === 0
          ? "Add at least one document to submit."
          : busy
            ? `${done} of ${files.length} uploaded`
            : `All ${files.length} files uploaded`}
      </Text>
      <Button disabled={files.length === 0 || busy}>Submit claim</Button>
    </View>
  );
}
function FileUploadClaimVersion() {
  useFreshFailures();
  const insets = useSafeAreaInsets();
  const [files, setFiles] = useState<FileUploadFile[]>(CLAIM_FILES);
  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-5 px-5 pt-2"
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
    >
      <View className="gap-1.5">
        <Badge variant="secondary" className="self-start">
          Claim BK-20417
        </Badge>
        <Text size="2xl" weight="bold">
          Stolen bicycle
        </Text>
        <Text size="sm" muted>
          Send the police report, proof of purchase and any photos of the bike.
          Each file starts uploading as soon as it is added.
        </Text>
      </View>
      <FileUpload
        value={files}
        onValueChange={setFiles}
        sources={["camera", "library", "files"]}
        accept={["application/pdf", "image/*"]}
        multiple
        maxFiles={6}
        maxSize={10 * MB}
        upload={fakeUpload}
        concurrency={2}
      >
        <View className="gap-3">
          <Text size="sm" weight="semibold">
            Supporting documents
          </Text>
          <FileUpload.Dropzone title="Add documents or photos" />
          <FileUpload.List />
        </View>
        <ClaimFooter />
      </FileUpload>
    </ScrollView>
  );
}
const LISTING_FILES: FileUploadFile[] = [
  seeded({
    id: "listing-rollei",
    uri: photo("photo-1495121553079-4c61bcce1894"),
    name: "twin-lens.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    width: 900,
    height: 900,
    status: "done",
    progress: 1,
  }),
  seeded({
    id: "listing-instant",
    uri: photo("photo-1526170375885-4d8ecf77b99f"),
    name: "instant.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    width: 900,
    height: 900,
    status: "done",
    progress: 1,
  }),
  seeded({
    id: "listing-rangefinder",
    uri: photo("photo-1510127034890-ba27508e9f1c"),
    name: "rangefinder.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    width: 900,
    height: 900,
    status: "queued",
  }),
  seeded({
    id: "listing-lenses",
    uri: photo("photo-1516035069371-29a1b244cc32"),
    name: "lenses.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    width: 900,
    height: 900,
    status: "queued",
  }),
];
function FileUploadListingVersion() {
  useFreshFailures();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="gap-6 px-5 pt-2"
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
    >
      <View className="gap-1">
        <Text
          size="xs"
          weight="semibold"
          muted
          className="tracking-wider uppercase"
        >
          Step 1 of 3
        </Text>
        <Text size="2xl" weight="bold">
          Photos
        </Text>
        <Text size="sm" muted>
          Listings with five or more photos sell faster. The first one is the
          cover.
        </Text>
      </View>
      <FileUpload
        defaultValue={LISTING_FILES}
        sources={["camera", "library"]}
        accept={["image/*"]}
        multiple
        maxFiles={8}
        image={{ maxWidth: 1600, quality: 0.85 }}
        upload={fakeUpload}
        concurrency={2}
      >
        <FileUpload.Grid columns={3} cover placeholders />
      </FileUpload>
      <View className="gap-4">
        <Input label="Title" defaultValue="Camera clear-out, three bodies" />
        <Input
          label="Price"
          defaultValue="420"
          keyboardType="number-pad"
          startContent={<Text muted>£</Text>}
        />
      </View>
      <Button onPress={demoAction("Continue")}>Continue</Button>
    </ScrollView>
  );
}
const PROFILE_FILES: FileUploadFile[] = [
  seeded({
    id: "profile-current",
    uri: "https://avatars.githubusercontent.com/u/127331761?v=4&s=512",
    name: "profile.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    width: 512,
    height: 512,
    status: "queued",
  }),
];
function ProfileSlot() {
  const { files, remove } = useFileUpload();
  const current = files[0];
  const uploading =
    current && current.status !== "done" && current.status !== "error";
  const percent = Math.round((current?.progress ?? 0) * 100);
  return (
    <View className="items-center gap-6">
      <View className="h-36 w-36">
        <View className="border-border bg-muted h-36 w-36 items-center justify-center overflow-hidden rounded-full border">
          {current ? (
            <Image
              source={{ uri: current.uri }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <Text size="3xl" weight="semibold" muted>
              KA
            </Text>
          )}
          {uploading ? (
            <View className="absolute inset-0 items-center justify-center bg-black/45">
              <Text weight="semibold" className="text-white">
                {current.status === "processing" ? "Saving" : `${percent}%`}
              </Text>
            </View>
          ) : null}
        </View>
        <View className="absolute right-0 bottom-0">
          <FileUpload.Trigger>
            <Button
              size="sm"
              accessibilityLabel="Change photo"
              className="border-background rounded-full border-2"
            >
              <CameraIcon size={16} />
            </Button>
          </FileUpload.Trigger>
        </View>
      </View>
      <View className="items-center gap-1">
        <Text size="xl" weight="semibold">
          Khalid Abdi
        </Text>
        <Text size="sm" muted className="text-center">
          {current?.status === "error"
            ? current.error
            : uploading
              ? "Uploading your new photo…"
              : current
                ? "Shown on your profile and next to your comments."
                : "Add a photo so people recognise you."}
        </Text>
      </View>
      <View className="w-full gap-2">
        <FileUpload.Trigger>
          <Button variant="secondary">
            {current ? "Change photo" : "Add photo"}
          </Button>
        </FileUpload.Trigger>
        {current ? (
          <Button variant="ghost" onPress={() => remove(current.id)}>
            Remove photo
          </Button>
        ) : null}
      </View>
    </View>
  );
}
function FileUploadProfileVersion() {
  const insets = useSafeAreaInsets();
  const [files, setFiles] = useState<FileUploadFile[]>(PROFILE_FILES);
  return (
    <View
      className="bg-background flex-1 justify-center px-6"
      style={{ paddingBottom: insets.bottom + 24 }}
    >
      <FileUpload
        value={files}
        onValueChange={setFiles}
        sources={["camera", "library"]}
        accept={["image/*"]}
        image={{ maxWidth: 1024, quality: 0.85, crop: { aspect: [1, 1] } }}
        upload={fakeUpload}
      >
        <ProfileSlot />
      </FileUpload>
    </View>
  );
}
const CHAT_FILES: FileUploadFile[] = [
  seeded({
    id: "chat-bike",
    uri: photo("photo-1532298229144-0ec0c57515c7"),
    name: "rear-derailleur.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    size: 2.7 * MB,
    width: 900,
    height: 900,
    status: "queued",
  }),
  seeded({
    id: "chat-history",
    uri: "file:///chat/service-history-2025.pdf",
    name: "service-history-2025.pdf",
    mimeType: "application/pdf",
    size: 412 * 1024,
    status: "queued",
  }),
];
const CHAT: Array<{
  from: "me" | "them";
  body: string;
  at: string;
}> = [
  {
    from: "them",
    body: "Morning! Still good to drop the bike off on Thursday?",
    at: "09:12",
  },
  {
    from: "me",
    body: "Yes. The gears skip on the two smallest cogs, could you look at that too?",
    at: "09:14",
  },
  {
    from: "them",
    body: "Sure. Send a photo of the derailleur and the last service sheet if you have it.",
    at: "09:15",
  },
];
function Composer() {
  const { files } = useFileUpload();
  return (
    <View className="border-border bg-background gap-2 border-t px-3 pt-2">
      {files.length > 0 ? <FileUpload.List horizontal size="sm" /> : null}
      <View className="flex-row items-center gap-2">
        <FileUpload.Trigger>
          <Button variant="ghost" size="sm" accessibilityLabel="Attach">
            <PaperclipIcon size={20} />
          </Button>
        </FileUpload.Trigger>
        <Input placeholder="Message" containerClassName="flex-1" />
        <Button
          size="sm"
          accessibilityLabel="Send"
          onPress={demoAction("Send")}
        >
          <SendIcon size={18} />
        </Button>
      </View>
    </View>
  );
}
function FileUploadChatVersion() {
  useFreshFailures();
  const insets = useSafeAreaInsets();
  return (
    <View
      className="bg-background flex-1"
      style={{ paddingBottom: insets.bottom }}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-4 py-3"
      >
        {CHAT.map((turn) => (
          <Message key={turn.at} align={turn.from === "me" ? "end" : "start"}>
            <Message.Content>
              <Message.Bubble>
                <Message.BubbleContent>{turn.body}</Message.BubbleContent>
              </Message.Bubble>
              <Message.Footer>{turn.at}</Message.Footer>
            </Message.Content>
          </Message>
        ))}
      </ScrollView>
      <FileUpload
        defaultValue={CHAT_FILES}
        sources={["camera", "library", "files"]}
        multiple
        maxFiles={10}
        maxSize={25 * MB}
        upload={fakeUpload}
        concurrency={3}
      >
        <Composer />
      </FileUpload>
    </View>
  );
}
function FileUploadBasicDemo() {
  return (
    <FileUpload sources={["files"]} multiple>
      <View className="w-full gap-3">
        <FileUpload.Trigger>
          <Button variant="outline" className="self-start">
            Select files
          </Button>
        </FileUpload.Trigger>
        <FileUpload.List
          empty={
            <Text size="sm" muted>
              No files yet.
            </Text>
          }
        />
      </View>
    </FileUpload>
  );
}
function FileUploadRulesDemo() {
  const [rejected, setRejected] = useState<string[]>([]);
  return (
    <FileUpload
      sources={["files"]}
      accept={["application/pdf"]}
      multiple
      maxFiles={3}
      maxSize={2 * MB}
      onReject={(rejections) =>
        setRejected(rejections.map((entry) => entry.file.name))
      }
    >
      <View className="w-full gap-3">
        <FileUpload.Dropzone title="Upload invoices" />
        <FileUpload.List />
        {rejected.length > 0 ? (
          <Text size="xs" muted>
            onReject: {rejected.join(", ")}
          </Text>
        ) : null}
      </View>
    </FileUpload>
  );
}
function FileUploadStripDemo() {
  return (
    <FileUpload
      defaultValue={LISTING_FILES.slice(0, 2)}
      sources={["library"]}
      accept={["image/*"]}
      multiple
      maxFiles={6}
    >
      <FileUpload.Grid
        horizontal
        tileSize={84}
        placeholders
        className="w-full"
      />
    </FileUpload>
  );
}
function FileUploadDisabledDemo() {
  return (
    <FileUpload
      defaultValue={CLAIM_FILES.slice(0, 1)}
      disabled
      accept={["application/pdf"]}
    >
      <View className="w-full gap-3">
        <FileUpload.Dropzone description="Uploads are closed for this claim." />
        <FileUpload.List />
      </View>
    </FileUpload>
  );
}
export const entry: ComponentEntry = {
  slug: "file-upload",
  name: "FileUpload",
  summary: "Pick files and photos, check them, and run their uploads",
  demos: [
    {
      label: "Claim documents",
      id: "claim",
      fullPage: true,
      description:
        "A dropzone over a list of rows. Two files upload at a time while the rest wait, and one drops its connection so the retry can be tried.",
      render: () => <FileUploadClaimVersion />,
    },
    {
      label: "Listing photos",
      id: "listing",
      fullPage: true,
      description:
        "A grid led by an add tile that counts against the limit. Tap a photo to see it full screen.",
      render: () => <FileUploadListingVersion />,
    },
    {
      label: "Profile photo",
      id: "profile",
      fullPage: true,
      description:
        "One photo, cropped square by the system editor. The camera badge and the button open the same choice.",
      render: () => <FileUploadProfileVersion />,
    },
    {
      label: "Message attachments",
      id: "chat",
      fullPage: true,
      description:
        "A paperclip in a composer, with each attachment uploading in a strip above the field.",
      render: () => <FileUploadChatVersion />,
    },
    { label: "Trigger and list", render: () => <FileUploadBasicDemo /> },
    { label: "Rules and rejections", render: () => <FileUploadRulesDemo /> },
    { label: "Photo strip", render: () => <FileUploadStripDemo /> },
    { label: "Disabled", render: () => <FileUploadDisabledDemo /> },
  ],
};
