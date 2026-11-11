import {
  ChoroplethBlock,
  DeliveryTrackerBlock,
  HeatmapBlock,
  LogisticsNetworkBlock,
  PlacesBlock,
  RunSummaryBlock,
  StoreLocatorBlock,
  UptimeMonitorBlock,
} from "../extras/map-blocks";
import { ComponentEntry } from "../types";

export const entry: ComponentEntry = {
  slug: "map",
  name: "Map",
  summary: "Vector map drawn from your theme tokens",
  demos: [
    {
      label: "Places",
      id: "places",
      fullPage: true,
      fullBleed: true,
      description:
        "A street map that is the whole screen — search, pins and a place card.",
      render: () => <PlacesBlock />,
    },
    {
      label: "Choropleth",
      id: "choropleth",
      fullPage: true,
      description:
        "One layer shaded by a style expression — switch the metric.",
      render: () => <ChoroplethBlock />,
    },
    {
      label: "Heatmap",
      id: "heatmap",
      fullPage: true,
      description:
        "Density as a field, handing over to the points it was made of.",
      render: () => <HeatmapBlock />,
    },
    {
      label: "Delivery tracker",
      id: "delivery",
      fullPage: true,
      description: "A driven leg and a planned one, told apart by dash.",
      render: () => <DeliveryTrackerBlock />,
    },
    {
      label: "Store locator",
      id: "stores",
      fullPage: true,
      description: "A list and a map on one selection.",
      render: () => <StoreLocatorBlock />,
    },
    {
      label: "Logistics network",
      id: "network",
      fullPage: true,
      description:
        "Arcs between sites, bowed so lanes sharing a hub stay legible.",
      render: () => <LogisticsNetworkBlock />,
    },
    {
      label: "Uptime monitor",
      id: "uptime",
      fullPage: true,
      description: "Edge nodes coloured by state, spread across the world.",
      render: () => <UptimeMonitorBlock />,
    },
    {
      label: "Cards over the map",
      id: "overlays",
      fullPage: true,
      fullBleed: true,
      description:
        "Cards along the top and bottom, and controls that move past them.",
      render: () => <RunSummaryBlock />,
    },
  ],
};
