import { createContext, useContext } from "react";

import type { ObservableNumber } from "../../primitives/observable-number";
import type {
  CarouselAlign,
  CarouselOrientation,
  CarouselVariant,
} from "./types";

export interface CarouselContextValue {
  progress: ObservableNumber;
  engaged: ObservableNumber;
  count: number;
  setCount: (count: number) => void;
  index: number;
  scrollTo: (index: number) => void;
  next: () => void;
  previous: () => void;
  variant: CarouselVariant;
  orientation: CarouselOrientation;
  align: CarouselAlign;
  loop: boolean;
  itemSize: number;
}
export const CarouselContext = createContext<CarouselContextValue | null>(null);
export const CarouselItemIndexContext = createContext(0);
export const useCarousel = (component: string) => {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Carousel>`);
  }
  return context;
};
export const useCarouselState = () => {
  const { index, count, scrollTo, next, previous } =
    useCarousel("useCarouselState");
  return { count, index, next, previous, scrollTo };
};
