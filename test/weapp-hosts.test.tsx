// @vitest-environment happy-dom
import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import type { ComponentRef } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  CoverImage,
  CoverView,
  Image,
  Map,
  Picker,
  PickerView,
  PickerViewColumn,
  ScrollView,
  Textarea,
} from "../src/primitives/weapp-hosts";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

const requireElement = (container: HTMLElement, selector: string) => {
  const element = container.querySelector(selector);
  if (!element) {
    throw new Error(`Missing host element: ${selector}`);
  }
  return element;
};

describe("WeChat platform host compatibility", () => {
  it("preserves map ids, native overlay children, refs and region events", () => {
    const ref = createRef<ComponentRef<typeof Map>>();
    const onRegionChange = vi.fn();
    const { container } = render(
      <Map
        ref={ref}
        id="device-map"
        latitude={30}
        longitude={120}
        onRegionChange={onRegionChange}
        onError={vi.fn()}
      >
        <CoverView>
          <CoverImage src="/marker.png" />
        </CoverView>
      </Map>
    );
    const map = requireElement(container, "#device-map");
    expect(map).not.toBeNull();
    expect(ref.current).toBe(map);
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "/marker.png"
    );
    dispatchTaroEvent(map, TARO_TEST_EVENTS.regionChange, { type: "end" });
    expect(onRegionChange).toHaveBeenCalledWith({ detail: { type: "end" } });
  });

  it("keeps region and wheel picker events in their native shape", () => {
    const onRegion = vi.fn();
    const onWheel = vi.fn();
    const { container } = render(
      <>
        <Picker id="region" mode="region" onChange={onRegion}>
          <CoverView />
        </Picker>
        <PickerView id="wheel" value={[1]} onChange={onWheel}>
          <PickerViewColumn>
            <CoverView />
          </PickerViewColumn>
        </PickerView>
      </>
    );
    dispatchTaroEvent(
      requireElement(container, "#region"),
      TARO_TEST_EVENTS.pickerChange,
      { value: ["浙江省", "杭州市", "西湖区"] }
    );
    dispatchTaroEvent(
      requireElement(container, "#wheel"),
      TARO_TEST_EVENTS.pickerChange,
      { value: [2] }
    );
    expect(onRegion).toHaveBeenCalledWith({
      detail: { value: ["浙江省", "杭州市", "西湖区"] },
    });
    expect(onWheel).toHaveBeenCalledWith({ detail: { value: [2] } });
  });

  it("forwards scroll, image and textarea events without adding layout wrappers", () => {
    const onScroll = vi.fn();
    const onLoad = vi.fn();
    const onInput = vi.fn();
    const { container } = render(
      <ScrollView id="messages" scrollY onScroll={onScroll}>
        <Image src="/child.png" onLoad={onLoad} />
        <Textarea onInput={onInput} />
      </ScrollView>
    );
    const scroll = requireElement(container, "#messages");
    expect(scroll.children).toHaveLength(2);
    dispatchTaroEvent(scroll, TARO_TEST_EVENTS.scroll, { scrollTop: 20 });
    fireEvent.load(requireElement(container, "img"));
    fireEvent.input(requireElement(container, "textarea"), {
      target: { value: "留言" },
    });
    expect(onScroll).toHaveBeenCalledWith({ detail: { scrollTop: 20 } });
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onInput).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({ value: "留言" }),
      })
    );
  });
});
