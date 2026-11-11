import { DrawerContent } from "./content";
import { DrawerHeader, DrawerBody, DrawerFooter } from "./parts";
import { DrawerRoot, DrawerTrigger, DrawerClose } from "./root";

export type {
  DrawerSide,
  DrawerSize,
  DrawerCloseSide,
  DrawerProps,
  DrawerTriggerProps,
  DrawerCloseProps,
  DrawerContentProps,
  DrawerHeaderProps,
  DrawerBodyProps,
  DrawerFooterProps,
} from "./types";
export const Drawer = Object.assign(DrawerRoot, {
  Body: DrawerBody,
  Close: DrawerClose,
  Content: DrawerContent,
  Footer: DrawerFooter,
  Header: DrawerHeader,
  Trigger: DrawerTrigger,
});
