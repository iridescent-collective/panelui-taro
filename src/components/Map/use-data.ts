import { request } from "@tarojs/taro";
import { useEffect, useState } from "react";

import { useMap } from "./context";

export const useMapData = (data: unknown) => {
  const { issue } = useMap();
  const [remote, setRemote] = useState<{
    url: string;
    value: unknown;
  } | null>(null);
  useEffect(() => {
    if (typeof data !== "string") {
      return;
    }
    let active = true;
    const load = async () => {
      try {
        const result = await request({
          dataType: "json",
          method: "GET",
          url: data,
        });
        if (result.statusCode < 200 || result.statusCode >= 300) {
          throw new Error(`Map: GeoJSON request returned ${result.statusCode}`);
        }
        if (active) {
          setRemote({ url: data, value: result.data });
        }
      } catch (error) {
        if (active) {
          issue({
            capability: "geojson-source",
            message:
              error instanceof Error
                ? error.message
                : "GeoJSON could not be loaded",
          });
        }
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [data, issue]);
  if (typeof data !== "string") {
    return data;
  }
  return remote?.url === data ? remote.value : null;
};
