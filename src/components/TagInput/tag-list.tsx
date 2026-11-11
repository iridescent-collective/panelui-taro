import type { ElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { Chip } from "../Chip";
import type { ChipSize } from "../Chip";
import { TagMotion } from "./tag-motion";
import type { TagInputProps, TagInputSize } from "./types";
import { useTagRecords } from "./use-records";
import type { TagsState } from "./use-tags";

const CHIP_SIZE: Record<TagInputSize, ChipSize> = {
  lg: "md",
  md: "sm",
  sm: "sm",
};
export const TagList = ({
  state,
  props,
  interactive,
  size,
  container,
}: {
  state: TagsState;
  props: TagInputProps;
  interactive: boolean;
  size: TagInputSize;
  container: ElementLayout | null;
}) => {
  const reduced = usePanelReducedMotion();
  const records = useTagRecords(state.tags, reduced);
  return (
    <>
      {records.map(({ key, tag, index, expires }) => (
        <TagMotion
          key={key}
          present={expires === null}
          reduced={reduced}
          container={container}
        >
          {props.renderTag ? (
            props.renderTag(tag, index)
          ) : (
            <Chip
              size={CHIP_SIZE[size]}
              variant={
                state.marked?.index === index && expires === null
                  ? "destructive"
                  : (props.chipVariant ?? "default")
              }
              onClose={
                interactive && expires === null
                  ? () => state.removeAt(index)
                  : undefined
              }
              closeLabel={`Remove ${tag}`}
              haptics={props.haptics}
            >
              {tag}
            </Chip>
          )}
        </TagMotion>
      ))}
    </>
  );
};
