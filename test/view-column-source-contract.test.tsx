// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, it } from "vitest";

import { Accordion } from "../src/components/Accordion";
import { BottomSheet } from "../src/components/BottomSheet";
import { Card } from "../src/components/Card";
import { Collapsible } from "../src/components/Collapsible";
import { Text } from "../src/components/primitives/Text";
import { PanelUIProvider } from "../src/components/Provider";
import { Surface } from "../src/components/Surface";

const containers = [
  "card",
  "collapsible",
  "accordion",
  "sheet",
  "surface",
] as const;
type Container = (typeof containers)[number];
const subject = (name: Container, className?: string): ReactNode => {
  const children = (
    <>
      <Text>Title</Text>
      <Text>Description</Text>
    </>
  );
  switch (name) {
    case "card": {
      return <Card.Content className={className}>{children}</Card.Content>;
    }
    case "collapsible": {
      return (
        <Collapsible defaultOpen>
          <Collapsible.Content className={className}>
            {children}
          </Collapsible.Content>
        </Collapsible>
      );
    }
    case "accordion": {
      return (
        <Accordion defaultValue="page">
          <Accordion.Item value="page">
            <Accordion.Content className={className}>
              {children}
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      );
    }
    case "sheet": {
      return (
        <BottomSheet.Body
          className="h-0 flex-1"
          contentContainerClassName={className}
        >
          {children}
        </BottomSheet.Body>
      );
    }
    case "surface": {
      return <Surface className={className}>{children}</Surface>;
    }
    default: {
      throw new Error(`Unknown container: ${name}`);
    }
  }
};

it.each(containers)(
  "%s preserves upstream column layout for consecutive native Text children",
  (name) => {
    const style = document.createElement("style");
    style.textContent =
      ".flex{display:flex}.flex-col{flex-direction:column}.flex-row{flex-direction:row}";
    document.head.append(style);
    try {
      render(<PanelUIProvider reducedMotion>{subject(name)}</PanelUIProvider>);
      const content = screen.getByText("Title").parentElement as HTMLElement;
      expect(screen.getByText("Description").parentElement).toBe(content);
      expect(getComputedStyle(content).display).toBe("flex");
      expect(getComputedStyle(content).flexDirection).toBe("column");
      if (name === "sheet") {
        expect(content.parentElement?.className).toContain("h-0 flex-1");
        expect(content.parentElement?.classList.contains("flex")).toBe(false);
      }
    } finally {
      style.remove();
    }
  }
);

it.each(containers)(
  "%s retains consumer row classes at their original public boundary",
  (name) => {
    const style = document.createElement("style");
    style.textContent =
      ".flex{display:flex}.flex-col{flex-direction:column}.flex-row{flex-direction:row}";
    document.head.append(style);
    try {
      render(
        <PanelUIProvider reducedMotion>
          {subject(name, "flex flex-row")}
        </PanelUIProvider>
      );
      const content = screen.getByText("Title").parentElement as HTMLElement;
      expect(getComputedStyle(content).display).toBe("flex");
      if (name === "collapsible") {
        expect(getComputedStyle(content).flexDirection).toBe("column");
        expect(
          getComputedStyle(content.parentElement as Element).flexDirection
        ).toBe("row");
      } else {
        expect(getComputedStyle(content).flexDirection).toBe("row");
        expect(content.classList.contains("flex-col")).toBe(false);
      }
    } finally {
      style.remove();
    }
  }
);
