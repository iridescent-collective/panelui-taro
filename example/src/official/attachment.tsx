import { Attachment } from "panelui-taro/attachment";
import { Button } from "panelui-taro/button";
import { FileIcon, ImageIcon, XIcon } from "panelui-taro/icons";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function AttachmentStatesDemo() {
  const states = [
    { state: "uploading" as const, desc: "Uploading…" },
    { state: "processing" as const, desc: "Processing…" },
    { state: "error" as const, desc: "Upload failed — tap to retry" },
    { state: "done" as const, desc: "PDF · 2.4 MB" },
  ];
  return (
    <View className="w-full gap-3">
      {states.map(({ state, desc }) => (
        <Attachment key={state} state={state}>
          <Attachment.Media>
            <FileIcon size={18} />
          </Attachment.Media>
          <Attachment.Content>
            <Attachment.Title>report.pdf</Attachment.Title>
            <Attachment.Description>{desc}</Attachment.Description>
          </Attachment.Content>
          <Attachment.Actions>
            <Attachment.Action
              accessibilityLabel={`Remove report.pdf (${state})`}
            >
              <XIcon size={16} />
            </Attachment.Action>
          </Attachment.Actions>
        </Attachment>
      ))}
    </View>
  );
}
function AttachmentUploadDemo() {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const start = () => {
    if (running) return;
    setRunning(true);
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((current) => {
        const next = current + 0.08;
        if (next >= 1) {
          clearInterval(timer);
          setRunning(false);
          return 1;
        }
        return next;
      });
    }, 160);
  };
  const state = running ? "uploading" : progress >= 1 ? "done" : "idle";
  return (
    <View className="w-full gap-3">
      <Attachment state={state} progress={progress}>
        <Attachment.Media>
          <ImageIcon size={18} />
        </Attachment.Media>
        <Attachment.Content>
          <Attachment.Title>screenshot.png</Attachment.Title>
          <Attachment.Description>
            {running
              ? `Uploading — ${Math.round(progress * 100)}%`
              : progress >= 1
                ? "PNG · 1.1 MB"
                : "Ready to upload"}
          </Attachment.Description>
        </Attachment.Content>
      </Attachment>

      <Button variant="outline" onPress={start} loading={running}>
        {progress >= 1 ? "Upload again" : "Start upload"}
      </Button>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "attachment",
  name: "Attachment",
  summary: "File row with upload states, built on Item",
  demos: [
    {
      label: "Done",
      render: () => (
        <Attachment className="w-full">
          <Attachment.Media>
            <FileIcon size={18} />
          </Attachment.Media>
          <Attachment.Content>
            <Attachment.Title>sales-dashboard.pdf</Attachment.Title>
            <Attachment.Description>PDF · 2.4 MB</Attachment.Description>
          </Attachment.Content>
          <Attachment.Actions>
            <Attachment.Action accessibilityLabel="Remove sales-dashboard.pdf">
              <XIcon size={16} />
            </Attachment.Action>
          </Attachment.Actions>
        </Attachment>
      ),
    },
    { label: "Upload states", render: () => <AttachmentStatesDemo /> },
    { label: "A live upload", render: () => <AttachmentUploadDemo /> },
    {
      label: "A group of thumbnails",
      render: () => (
        <Attachment.Group orientation="horizontal" className="w-full">
          {["cover.png", "hero.jpg", "logo.svg"].map((name) => (
            <Attachment key={name} orientation="vertical" className="w-32">
              <Attachment.Media variant="icon">
                <ImageIcon size={18} />
              </Attachment.Media>
              <Attachment.Content>
                <Attachment.Title className="text-sm">{name}</Attachment.Title>
                <Attachment.Description>Image</Attachment.Description>
              </Attachment.Content>
            </Attachment>
          ))}
        </Attachment.Group>
      ),
    },
  ],
};
