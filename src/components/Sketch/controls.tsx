import { ScrollView, View } from "@tarojs/components";
import type { ReactNode } from "react";

import { selectionTick } from "../../lib/haptics";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { ColorPicker } from "../ColorPicker";
import { SHAPE_LABEL, TOOL_LABEL } from "./constants";
import { CustomColorRing, Glyph, ShapeGlyph } from "./drawing";
import type { useSketchModel } from "./use-model";

export type SketchModel = ReturnType<typeof useSketchModel>;
export const RoundButton = ({
  label,
  onPress,
  disabled,
  children,
  className,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}) => (
  <AnimatedPressable
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled: Boolean(disabled) }}
    disabled={disabled}
    onPress={onPress}
    hitSlop={4}
    className={cn(
      "flex h-[96px] w-[96px] items-center justify-center rounded-full bg-[var(--panel-muted)]",
      disabled && "opacity-[0.4]",
      className
    )}
  >
    {children}
  </AnimatedPressable>
);
export const SketchHeader = ({ model: m }: { model: SketchModel }) => (
  <View className="flex flex-row items-center justify-between px-[32px] pt-[32px] pb-[16px]">
    {m.onClose ? (
      <RoundButton label="Close" onPress={m.onClose}>
        <Glyph name="close" color={m.foreground} />
      </RoundButton>
    ) : (
      <View className="h-[96px] w-[96px]" />
    )}
    <View
      aria-role="tablist"
      className="flex flex-row items-center gap-[8px] rounded-full bg-[var(--panel-muted)] p-[8px]"
    >
      {(["pen", "shape", "eraser"] as const).map((entry) => (
        <AnimatedPressable
          key={entry}
          accessibilityRole="tab"
          accessibilityLabel={
            entry === "shape" && m.shapePicked
              ? `${TOOL_LABEL.shape}, ${SHAPE_LABEL[m.shape]}`
              : TOOL_LABEL[entry]
          }
          accessibilityState={{ selected: m.tool === entry }}
          onPress={() => m.pickTool(entry)}
          className={cn(
            "flex h-[88px] w-[96px] items-center justify-center rounded-full",
            m.tool === entry && "bg-[var(--panel-muted)]"
          )}
        >
          {entry === "shape" && m.shapePicked ? (
            <ShapeGlyph shape={m.shape} color={m.foreground} />
          ) : (
            <Glyph name={entry} color={m.foreground} />
          )}
        </AnimatedPressable>
      ))}
    </View>
    <RoundButton label="Undo" onPress={m.undo} disabled={!m.items.length}>
      <Glyph name="undo" color={m.foreground} />
    </RoundButton>
  </View>
);
export const SketchCards = ({ model: m }: { model: SketchModel }) => (
  <>
    {m.card ? (
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={() => m.setCard(null)}
        className="absolute inset-0 z-20"
      />
    ) : null}
    {m.card === "shapes" ? (
      <View className="absolute top-[16px] right-[32px] left-[32px] z-30 overflow-hidden rounded-[var(--panel-radius-3xl)] bg-[var(--panel-popover)] shadow-lg">
        <View className="flex flex-row flex-wrap bg-[var(--panel-muted)] p-[16px]">
          {m.visibleShapes.map((entry) => (
            <AnimatedPressable
              key={entry}
              accessibilityRole="button"
              accessibilityLabel={SHAPE_LABEL[entry]}
              accessibilityState={{
                selected: m.tool === "shape" && m.shape === entry,
              }}
              onPress={() => m.pickShape(entry)}
              className="flex h-[128px] w-1/4 items-center justify-center rounded-[var(--panel-radius-2xl)]"
            >
              <ShapeGlyph shape={entry} color={m.foreground} size={28} />
            </AnimatedPressable>
          ))}
        </View>
      </View>
    ) : null}
    {m.card === "color" ? (
      <View className="absolute right-[32px] bottom-[16px] left-[32px] z-30 rounded-[var(--panel-radius-3xl)] border border-[var(--panel-border)] bg-[var(--panel-popover)] p-[24px] shadow-lg">
        <View className="flex flex-col gap-[24px] rounded-[var(--panel-radius-2xl)]">
          <ColorPicker
            value={m.custom ?? m.ink}
            onValueChange={m.pickCustom}
            size="sm"
          >
            <ColorPicker.Area height={150} />
            <ColorPicker.Hue />
          </ColorPicker>
        </View>
      </View>
    ) : null}
  </>
);
export const SketchPalette = ({ model: m }: { model: SketchModel }) => (
  <View className="flex flex-row items-center gap-[24px] px-[32px] pt-[16px] pb-[32px]">
    {m.customColor ? (
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel="Custom colour"
        accessibilityState={{
          expanded: m.card === "color",
          selected: m.custom !== null,
        }}
        onPress={() => {
          void selectionTick();
          m.setCard((value) => (value === "color" ? null : "color"));
        }}
        className="flex h-[96px] w-[96px] items-center justify-center"
      >
        <CustomColorRing color={m.custom ?? m.ink} size={36} />
      </AnimatedPressable>
    ) : null}
    <View className="relative min-w-0 flex-1">
      <ScrollView scrollX showScrollbar={false}>
        <View className="flex flex-row items-center gap-[8px] pe-[48px]">
          {m.colors.map((swatch) => (
            <AnimatedPressable
              key={swatch}
              accessibilityRole="button"
              accessibilityLabel={`Colour ${swatch}`}
              accessibilityState={{
                selected:
                  m.custom === null &&
                  m.ink.toLowerCase() === swatch.toLowerCase(),
              }}
              onPress={() => m.pickColor(swatch)}
              className={cn(
                "flex h-[96px] w-[96px] shrink-0 items-center justify-center rounded-full border-[4px]",
                m.custom === null &&
                  m.ink.toLowerCase() === swatch.toLowerCase()
                  ? "border-[var(--panel-foreground)]"
                  : "border-transparent"
              )}
            >
              <View
                className="h-[72px] w-[72px] rounded-full border border-[var(--panel-border)]"
                style={{ backgroundColor: swatch }}
              />
            </AnimatedPressable>
          ))}
        </View>
      </ScrollView>
      <View
        aria-hidden
        className="absolute top-0 right-0 bottom-0 w-[56px]"
        style={{
          background: `linear-gradient(to right, transparent, ${m.surface})`,
          pointerEvents: "none",
        }}
      />
    </View>
    {m.onDone ? (
      <RoundButton
        label="Done"
        onPress={m.done}
        disabled={!m.items.length}
        className="h-[112px] w-[112px] bg-[var(--panel-primary)]"
      >
        <Glyph name="done" color={m.primaryFg} size={24} />
      </RoundButton>
    ) : null}
  </View>
);
