import { CarouselContent } from "./content";
import {
  CarouselControls,
  CarouselDots,
  CarouselNext,
  CarouselPrevious,
} from "./controls";
import { CarouselCaption, CarouselItem } from "./item";
import { CarouselRoot } from "./root";

export { useCarouselState } from "./context";
export type {
  CarouselProps,
  CarouselVariant,
  CarouselOrientation,
  CarouselAlign,
  CarouselHandle,
  CarouselContentProps,
  CarouselItemProps,
  CarouselCaptionProps,
  CarouselDotsProps,
  CarouselArrowProps,
  CarouselControlsProps,
  CarouselLayoutEvent,
} from "./types";
export const Carousel = Object.assign(CarouselRoot, {
  Caption: CarouselCaption,
  Content: CarouselContent,
  Controls: CarouselControls,
  Dots: CarouselDots,
  Item: CarouselItem,
  Next: CarouselNext,
  Previous: CarouselPrevious,
});
