import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Signature } from "panelui-taro/signature";
import type { SignatureHandle } from "panelui-taro/signature";
import { Typography } from "panelui-taro/typography";
import { useRef, useState } from "react";

export const SignatureShowcase = () => {
  const ref = useRef<SignatureHandle>(null);
  const [count, setCount] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [output, setOutput] = useState("");
  const exportImage = async (format: "svg" | "png") => {
    try {
      const file = await ref.current?.save({
        filename: `panel-preview-${Date.now()}`,
        format,
      });
      setOutput(file ? JSON.stringify(file) : "No pad");
    } catch (error) {
      setOutput(error instanceof Error ? error.message : String(error));
    }
  };
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography id="panel-signature-result">
        {JSON.stringify({ count, disabled })}
      </Typography>
      <Signature
        ref={ref}
        size="lg"
        guideline
        guidelineLabel="Demo"
        disabled={disabled}
        onChange={setCount}
      />
      <Signature.Toolbar>
        <Signature.Undo
          onPress={() => ref.current?.undo()}
          disabled={disabled || count === 0}
        />
        <Signature.Redo
          onPress={() => ref.current?.redo()}
          disabled={disabled}
        />
        <Signature.Clear
          onPress={() => ref.current?.clear()}
          disabled={disabled || count === 0}
        />
      </Signature.Toolbar>
      <Button
        id="panel-signature-disable"
        variant="outline"
        onPress={() => setDisabled((value) => !value)}
      >
        {disabled ? "Enable pad" : "Disable pad"}
      </Button>
      <Button
        id="panel-signature-svg"
        variant="outline"
        onPress={() => {
          void exportImage("svg");
        }}
        disabled={count === 0}
      >
        Save SVG
      </Button>
      <Button
        id="panel-signature-png"
        variant="outline"
        onPress={() => {
          void exportImage("png");
        }}
        disabled={count === 0}
      >
        Save PNG
      </Button>
      <Typography id="panel-signature-export">{output}</Typography>
    </View>
  );
};
