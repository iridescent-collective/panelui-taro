import { Image, View } from "@tarojs/components";
import {
  AvatarCropper,
  pickAvatarImage,
} from "panelui-taro/avatar-cropper";
import type {
  AvatarCropperHandle,
  AvatarCropperShape,
  AvatarCropperSource,
} from "panelui-taro/avatar-cropper";
import { Button } from "panelui-taro/button";
import { Typography } from "panelui-taro/typography";
import { useRef, useState } from "react";

import { FILLS, PORTRAIT, SHAPES } from "./constant";

export const AvatarCropperShowcase = () => {
  const cropper = useRef<AvatarCropperHandle>(null);
  const [photo, setPhoto] = useState<AvatarCropperSource>(PORTRAIT);
  const [shape, setShape] = useState<AvatarCropperShape>("circle");
  const [cover, setCover] = useState(true);
  const [fill, setFill] = useState<keyof typeof FILLS>("theme");
  const [result, setResult] = useState("");
  const [output, setOutput] = useState("");
  const [saving, setSaving] = useState(false);
  const choose = async (from: "library" | "camera") => {
    try {
      const selected = await pickAvatarImage({ from });
      if (selected) {
        setPhoto(selected);
        setOutput("Photo selected");
      } else {
        setOutput("Picker cancelled");
      }
    } catch (error) {
      setOutput(error instanceof Error ? error.message : String(error));
    }
  };
  const crop = async (format: "jpeg" | "png") => {
    setSaving(true);
    try {
      const written = await cropper.current?.crop({ format, size: 512 });
      if (written) {
        setResult(written.uri);
        setOutput(JSON.stringify(written));
      }
    } catch (error) {
      setOutput(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography id="panel-avatar-cropper-result">
        {JSON.stringify({ cover, fill, shape })}
      </Typography>
      <View className="flex flex-row flex-wrap gap-[12px]">
        {SHAPES.map((value) => (
          <Button
            key={value}
            variant={shape === value ? "primary" : "outline"}
            size="sm"
            onPress={() => setShape(value)}
          >
            {value}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onPress={() => setCover((value) => !value)}
        >
          {cover ? "Allow zoom out" : "Cover outline"}
        </Button>
      </View>
      <View className="flex flex-row flex-wrap gap-[12px]">
        {(Object.keys(FILLS) as (keyof typeof FILLS)[]).map((value) => (
          <Button
            key={value}
            variant={fill === value ? "primary" : "outline"}
            size="sm"
            onPress={() => setFill(value)}
          >
            {value}
          </Button>
        ))}
      </View>
      <AvatarCropper
        ref={cropper}
        source={photo}
        shape={shape}
        cover={cover}
        background={FILLS[fill]}
        className="border-border h-[768px] w-full flex-none overflow-hidden rounded-[32px] border"
      >
        <AvatarCropper.Canvas />
        <View className="flex flex-row items-center justify-between px-[24px] py-[16px]">
          <AvatarCropper.Reset />
          <AvatarCropper.Rotate direction="counterclockwise" />
          <AvatarCropper.Rotate />
        </View>
      </AvatarCropper>
      <View className="flex flex-row flex-wrap items-center gap-[12px]">
        <Button
          variant="secondary"
          loading={saving}
          onPress={() => crop("jpeg")}
        >
          Crop JPEG
        </Button>
        <Button
          variant="secondary"
          loading={saving}
          onPress={() => crop("png")}
        >
          Crop PNG
        </Button>
        <Button
          variant="outline"
          onPress={() =>
            setOutput(JSON.stringify(cropper.current?.getCrop() ?? null))
          }
        >
          Inspect crop
        </Button>
        <Button variant="outline" onPress={() => choose("library")}>
          Choose photo
        </Button>
        <Button variant="outline" onPress={() => choose("camera")}>
          Take photo
        </Button>
        <Button
          variant="ghost"
          onPress={() => {
            setPhoto(PORTRAIT);
            cropper.current?.reset();
            setResult("");
            setOutput("");
          }}
        >
          Reset photo
        </Button>
      </View>
      {result ? (
        <Image
          src={result}
          mode="aspectFit"
          className="h-[160px] w-[160px] rounded-full"
        />
      ) : null}
      <Typography type="body-sm" muted id="panel-avatar-cropper-output">
        {output || "Drag, pinch and twist to crop a photo"}
      </Typography>
    </View>
  );
};
