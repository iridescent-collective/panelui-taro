import { AIInput } from "panelui-taro/ai-input";

import { MODELS } from "../../constant";

export const ChatOptions = ({
  mode,
  configured,
  onMode,
  open,
  onOpenChange,
  model,
  onModel,
  failNext,
  onFailNext,
}: {
  mode: "demo" | "live";
  configured: boolean;
  onMode: (mode: "demo" | "live") => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: string;
  onModel: (model: string) => void;
  failNext: boolean;
  onFailNext: (value: boolean) => void;
}) => (
  <AIInput.Sheet
    open={open}
    onOpenChange={onOpenChange}
    initialScreen="options"
  >
    <AIInput.Sheet.Screen id="options" title="Assistant options">
      <AIInput.Sheet.Group
        footnote={
          configured
            ? "Connected service sends messages and the sample brief to your configured endpoint."
            : "Configure TARO_APP_PANELUI_AI_API_URL at build time to enable the connected service."
        }
      >
        <AIInput.Sheet.Choice
          label="Prepared examples"
          selected={mode === "demo"}
          onPress={() => {
            onMode("demo");
            onOpenChange(false);
          }}
        />
        <AIInput.Sheet.Choice
          label="Connected service"
          selected={mode === "live"}
          disabled={!configured}
          onPress={() => {
            onMode("live");
            onOpenChange(false);
          }}
        />
      </AIInput.Sheet.Group>
      {mode === "demo" ? (
        <>
          <AIInput.Sheet.Group footnote="Model names are interface options only. No model API is connected.">
            {MODELS.map((name) => (
              <AIInput.Sheet.Choice
                key={name}
                label={name}
                selected={model === name}
                onPress={() => {
                  onModel(name);
                  onOpenChange(false);
                }}
              />
            ))}
          </AIInput.Sheet.Group>
          <AIInput.Sheet.Group footnote="The next response will show an error; Retry then restores the normal demo.">
            <AIInput.Sheet.Toggle
              label="Simulate connection failure"
              value={failNext}
              onValueChange={onFailNext}
            />
          </AIInput.Sheet.Group>
        </>
      ) : null}
    </AIInput.Sheet.Screen>
  </AIInput.Sheet>
);
