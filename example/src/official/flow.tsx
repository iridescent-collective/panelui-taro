import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { Chip } from "panelui-taro/chip";
import { Flow, type FlowConnection } from "panelui-taro/flow";
import { Frame } from "panelui-taro/frame";
import {
  PackageIcon,
  SendIcon,
  ShareNodesIcon,
  ShieldCheckIcon,
} from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import {
  ToggleButton,
  ToggleButtonGroup,
} from "panelui-taro/toggle-button";
import { useState, type ReactNode } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function ServiceNode({
  title,
  subtitle,
  icon,
  status,
  volume,
}: {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  status: string;
  volume?: string;
}) {
  return (
    <Frame className="w-56">
      <Frame.Header className="flex-row items-center gap-3 pt-3 pb-2">
        <Frame.Media>{icon}</Frame.Media>
        <Frame.Content>
          <Text weight="semibold" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text size="xs" muted numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </Frame.Content>
      </Frame.Header>
      <Frame.Panel>
        <Frame.Row>
          <Frame.Media>
            <View className="border-success h-4 w-4 items-center justify-center rounded-full border">
              <View className="bg-success h-1.5 w-1.5 rounded-full" />
            </View>
          </Frame.Media>
          <Frame.Content>
            <Text size="sm" muted>
              {status}
            </Text>
          </Frame.Content>
        </Frame.Row>
        {volume ? (
          <Frame.Row>
            <Frame.Media>
              <PackageIcon size={16} />
            </Frame.Media>
            <Frame.Content>
              <Text size="sm" muted numberOfLines={1}>
                {volume}
              </Text>
            </Frame.Content>
          </Frame.Row>
        ) : null}
      </Frame.Panel>
    </Frame>
  );
}
function FlowInlineDemo() {
  return (
    <View className="border-border h-64 w-full overflow-hidden rounded-2xl border">
      <Flow defaultViewport={{ x: 10, y: 16, zoom: 0.78 }}>
        <Flow.Background variant="dots" gap={20} />
        <Flow.Node id="queue" position={{ x: 10, y: 10 }}>
          <View className="border-border bg-card rounded-xl border px-3 py-2">
            <Text size="sm" weight="medium">
              queue
            </Text>
          </View>
        </Flow.Node>
        <Flow.Node id="worker" position={{ x: 190, y: 110 }}>
          <View className="border-border bg-card rounded-xl border px-3 py-2">
            <Text size="sm" weight="medium">
              worker
            </Text>
          </View>
        </Flow.Node>
        <Flow.Node id="store" position={{ x: 30, y: 210 }}>
          <View className="border-border bg-card rounded-xl border px-3 py-2">
            <Text size="sm" weight="medium">
              store
            </Text>
          </View>
        </Flow.Node>
        <Flow.Edge from="queue" to="worker" animated arrow />
        <Flow.Edge from="worker" to="store" dashed animated arrow />
      </Flow>
    </View>
  );
}
function FlowEdgeShapesDemo() {
  const [variant, setVariant] = useState("bezier");
  return (
    <View className="w-full gap-3">
      <View className="border-border h-56 overflow-hidden rounded-2xl border">
        <Flow defaultViewport={{ x: 20, y: 20, zoom: 0.9 }} panOnDrag={false}>
          <Flow.Background variant="dots" gap={20} />
          <Flow.Node id="a" position={{ x: 10, y: 10 }}>
            <View className="border-border bg-card rounded-xl border px-3 py-2">
              <Text size="sm">source</Text>
            </View>
          </Flow.Node>
          <Flow.Node id="b" position={{ x: 190, y: 150 }}>
            <View className="border-border bg-card rounded-xl border px-3 py-2">
              <Text size="sm">target</Text>
            </View>
          </Flow.Node>
          <Flow.Edge
            from="a"
            to="b"
            variant={variant as "bezier" | "smoothstep" | "step" | "straight"}
            arrow
            animated
          />
        </Flow>
      </View>
      <ToggleButtonGroup
        selectionMode="single"
        value={[variant]}
        onValueChange={(next) => setVariant(next[0] ?? "bezier")}
      >
        <ToggleButton id="bezier">Bezier</ToggleButton>
        <ToggleButton id="smoothstep">Smooth</ToggleButton>
        <ToggleButton id="step">Step</ToggleButton>
        <ToggleButton id="straight">Line</ToggleButton>
      </ToggleButtonGroup>
    </View>
  );
}
function FlowInfrastructureVersion() {
  return (
    <Flow fitViewOnMount minZoom={0.35}>
      <Flow.Background variant="dots" gap={22} />

      <Flow.Node id="db" position={{ x: 10, y: 20 }}>
        <ServiceNode
          icon={<PackageIcon size={20} />}
          title="blog-db"
          status="Online"
        />
      </Flow.Node>

      <Flow.Node id="ghost" position={{ x: 96, y: 250 }}>
        <ServiceNode
          icon={<ShareNodesIcon size={20} />}
          title="ghost-image"
          subtitle="blog.temetro.com"
          status="Online"
          volume="ghost-content"
        />
      </Flow.Node>

      <Flow.Node id="redis" position={{ x: 0, y: 470 }}>
        <ServiceNode
          icon={<SendIcon size={20} />}
          title="redis"
          status="Online"
        />
      </Flow.Node>

      <Flow.Edge
        from="ghost"
        to="db"
        variant="smoothstep"
        dashed
        animated
        arrow
      />
      <Flow.Edge from="ghost" to="redis" variant="smoothstep" arrow />

      <Flow.Controls />
    </Flow>
  );
}
function FlowPipelineVersion() {
  const [stage, setStage] = useState(1);
  const stages = [
    { id: "source", title: "Source", detail: "main@6d63e13" },
    { id: "build", title: "Build", detail: "bob · 76 files" },
    { id: "test", title: "Test", detail: "412 assertions" },
    { id: "publish", title: "Publish", detail: "npm · panelui-native" },
  ];
  return (
    <View className="flex-1">
      <Flow defaultViewport={{ x: 60, y: 24, zoom: 0.9 }} fitViewOnMount>
        <Flow.Background variant="lines" gap={28} />

        {stages.map((entry, index) => (
          <Flow.Node
            key={entry.id}
            id={entry.id}
            position={{ x: 40, y: index * 150 }}
          >
            <Frame className="w-52">
              <Frame.Header>
                <Frame.Title>{`Stage ${index + 1}`}</Frame.Title>
                <Frame.Action>
                  <Chip
                    size="sm"
                    variant={
                      index < stage
                        ? "success"
                        : index === stage
                          ? "info"
                          : "outline"
                    }
                  >
                    {index < stage
                      ? "Done"
                      : index === stage
                        ? "Running"
                        : "Queued"}
                  </Chip>
                </Frame.Action>
              </Frame.Header>
              <Frame.Panel>
                <Frame.Row>
                  <Frame.Content>
                    <Frame.Title>{entry.title}</Frame.Title>
                    <Frame.Description>{entry.detail}</Frame.Description>
                  </Frame.Content>
                </Frame.Row>
              </Frame.Panel>
            </Frame>
          </Flow.Node>
        ))}

        {stages.slice(0, -1).map((entry, index) => (
          <Flow.Edge
            key={`edge-${entry.id}`}
            from={entry.id}
            to={stages[index + 1]!.id}
            variant="smoothstep"
            arrow
            animated={index === stage - 1}
            dashed={index === stage - 1}
          />
        ))}

        <Flow.Controls />
      </Flow>

      <View className="border-border flex-row gap-2 border-t px-5 py-4">
        <Button
          variant="outline"
          className="flex-1"
          disabled={stage === 0}
          onPress={() => setStage((current) => current - 1)}
        >
          Back a stage
        </Button>
        <Button
          className="flex-1"
          disabled={stage === stages.length}
          onPress={() => setStage((current) => current + 1)}
        >
          Advance
        </Button>
      </View>
    </View>
  );
}
function FlowConnectVersion() {
  const [edges, setEdges] = useState<FlowConnection[]>([]);
  const nodes = [
    { id: "webhook", title: "Webhook", detail: "POST /orders", x: 20, y: 40 },
    {
      id: "enrich",
      title: "Enrich",
      detail: "Look up the customer",
      x: 40,
      y: 220,
    },
    { id: "notify", title: "Notify", detail: "Send to Slack", x: 60, y: 400 },
  ];
  return (
    <View className="flex-1">
      <Flow
        defaultViewport={{ x: 24, y: 20, zoom: 0.95 }}
        onConnect={(connection) => {
          setEdges((current) =>
            current.some(
              (edge) =>
                edge.source === connection.source &&
                edge.target === connection.target
            )
              ? current
              : [...current, connection]
          );
        }}
        isValidConnection={(connection) =>
          connection.source !== connection.target
        }
      >
        <Flow.Background variant="dots" />

        {nodes.map((node) => (
          <Flow.Node
            key={node.id}
            id={node.id}
            position={{ x: node.x, y: node.y }}
          >
            <Frame className="w-48">
              <Frame.Header>
                <Frame.Title>{node.title}</Frame.Title>
              </Frame.Header>
              <Frame.Panel>
                <Frame.Row>
                  <Frame.Content>
                    <Frame.Description>{node.detail}</Frame.Description>
                  </Frame.Content>
                </Frame.Row>
              </Frame.Panel>
            </Frame>
            <Flow.Handle id="in" position="top" type="target" />
            <Flow.Handle id="out" position="bottom" type="source" />
          </Flow.Node>
        ))}

        {edges.map((edge) => (
          <Flow.Edge
            key={`${edge.source}-${edge.target}`}
            from={edge.source}
            to={edge.target}
            variant="smoothstep"
            arrow
            animated
          />
        ))}

        <Flow.Controls />
      </Flow>

      <View className="border-border border-t px-5 py-4">
        <Text size="sm" muted>
          {edges.length === 0
            ? "Drag from a node’s bottom port to another node’s top port."
            : `${edges.length} connection${edges.length === 1 ? "" : "s"} — drag a node and the edges follow.`}
        </Text>
      </View>
    </View>
  );
}
function FlowMindMapVersion() {
  const branches = [
    { id: "tokens", label: "Tokens", x: -180, y: -140 },
    { id: "motion", label: "Motion", x: 200, y: -160 },
    { id: "a11y", label: "Accessibility", x: -200, y: 140 },
    { id: "docs", label: "Documentation", x: 210, y: 150 },
  ];
  return (
    <Flow
      defaultViewport={{ x: 180, y: 300, zoom: 0.9 }}
      minZoom={0.4}
      maxZoom={2}
    >
      <Flow.Background variant="cross" gap={32} />

      <Flow.Node id="core" position={{ x: -60, y: -20 }}>
        <View className="border-border bg-card rounded-2xl border px-5 py-4">
          <Text weight="semibold">Design system</Text>
        </View>
      </Flow.Node>

      {branches.map((branch) => (
        <Flow.Node
          key={branch.id}
          id={branch.id}
          position={{ x: branch.x, y: branch.y }}
        >
          <View className="border-border bg-surface rounded-2xl border px-4 py-3">
            <Text size="sm">{branch.label}</Text>
          </View>
        </Flow.Node>
      ))}

      {branches.map((branch) => (
        <Flow.Edge
          key={`edge-${branch.id}`}
          from="core"
          to={branch.id}
          variant="bezier"
        />
      ))}

      <Flow.Controls zoom={false} />
    </Flow>
  );
}
function GroupedNode({
  icon,
  title,
  detail,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <View className="border-border bg-card w-40 flex-row items-center gap-2.5 rounded-xl border px-3 py-2.5">
      <View className="shrink-0">{icon}</View>
      <View className="min-w-0 flex-1">
        <Text size="sm" weight="medium" numberOfLines={1}>
          {title}
        </Text>
        <Text size="xs" muted numberOfLines={1}>
          {detail}
        </Text>
      </View>
    </View>
  );
}
function FlowBuilderVersion() {
  const [nodes, setNodes] = useState([{ id: "n1", x: 40, y: 40 }]);
  const [links, setLinks] = useState<
    {
      from: string;
      to: string;
    }[]
  >([]);
  const add = (linked: boolean) => {
    const previous = nodes[nodes.length - 1];
    const index = nodes.length;
    const id = `n${index + 1}`;
    const next = {
      id,
      x: 40 + Math.floor(index / 4) * 230,
      y: 40 + (index % 4) * 150,
    };
    setNodes((current) => [...current, next]);
    if (linked && previous) {
      setLinks((current) => [...current, { from: previous.id, to: id }]);
    }
  };
  return (
    <View className="flex-1">
      <Flow minZoom={0.35}>
        <Flow.Background variant="dots" />

        {nodes.map((node) => (
          <Flow.Node
            key={node.id}
            id={node.id}
            position={{ x: node.x, y: node.y }}
          >
            <Frame className="w-44">
              <Frame.Header>
                <Frame.Title>{node.id}</Frame.Title>
                <Frame.Action>
                  <Badge variant="secondary">node</Badge>
                </Frame.Action>
              </Frame.Header>
              <Frame.Panel>
                <Frame.Row>
                  <Frame.Content>
                    <Frame.Description>Drag me anywhere</Frame.Description>
                  </Frame.Content>
                </Frame.Row>
              </Frame.Panel>
            </Frame>
          </Flow.Node>
        ))}

        {links.map((link) => (
          <Flow.Edge
            key={`${link.from}-${link.to}`}
            from={link.from}
            to={link.to}
            variant="smoothstep"
            arrow
          />
        ))}

        <Flow.Controls />
      </Flow>

      <View className="border-border gap-2 border-t px-5 py-4">
        <View className="flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => add(false)}
          >
            Add a frame
          </Button>
          <Button className="flex-1" onPress={() => add(true)}>
            Add and link
          </Button>
        </View>
        <Text size="xs" muted>
          {nodes.length} frame{nodes.length === 1 ? "" : "s"}, {links.length}{" "}
          link
          {links.length === 1 ? "" : "s"} — drag any of them and the edges
          re-route.
        </Text>
      </View>
    </View>
  );
}
function FlowPortsVersion() {
  return (
    <Flow fitViewOnMount minZoom={0.35}>
      <Flow.Background variant="cross" gap={26} />

      <Flow.Node id="ingest" position={{ x: 0, y: 0 }}>
        <Frame className="w-44">
          <Frame.Header>
            <Frame.Title>ingest</Frame.Title>
          </Frame.Header>
          <Frame.Panel>
            <Frame.Row>
              <Frame.Content>
                <Frame.Description>Two named outputs</Frame.Description>
              </Frame.Content>
            </Frame.Row>
          </Frame.Panel>
        </Frame>

        <Flow.Handle id="ok" position="right" type="source" offset={0.34} />
        <Flow.Handle id="fail" position="right" type="source" offset={0.78} />
      </Flow.Node>

      <Flow.Node id="index" position={{ x: 250, y: -70 }}>
        <Frame className="w-40">
          <Frame.Header>
            <Frame.Title>index</Frame.Title>
          </Frame.Header>
          <Frame.Panel>
            <Frame.Row>
              <Frame.Content>
                <Frame.Description>Accepted</Frame.Description>
              </Frame.Content>
            </Frame.Row>
          </Frame.Panel>
        </Frame>
        <Flow.Handle id="in" position="left" type="target" />
        <Flow.Handle id="out" position="right" type="source" />
      </Flow.Node>

      <Flow.Node id="deadletter" position={{ x: 250, y: 150 }}>
        <Frame className="w-40">
          <Frame.Header>
            <Frame.Title>dead-letter</Frame.Title>
          </Frame.Header>
          <Frame.Panel>
            <Frame.Row>
              <Frame.Content>
                <Frame.Description>Rejected</Frame.Description>
              </Frame.Content>
            </Frame.Row>
          </Frame.Panel>
        </Frame>
        <Flow.Handle id="in" position="left" type="target" />
        <Flow.Handle id="out" position="right" type="source" />
      </Flow.Node>

      <Flow.Node id="router" position={{ x: 520, y: 30 }}>
        <Frame className="w-44">
          <Frame.Header>
            <Frame.Title>router</Frame.Title>
            <Frame.Action>
              <Badge variant="secondary">4 ports</Badge>
            </Frame.Action>
          </Frame.Header>
          <Frame.Panel>
            <Frame.Row>
              <Frame.Content>
                <Frame.Title>in · retry</Frame.Title>
                <Frame.Description>Left face, two offsets</Frame.Description>
              </Frame.Content>
            </Frame.Row>
            <Frame.Row>
              <Frame.Content>
                <Frame.Title>metrics · logs</Frame.Title>
                <Frame.Description>Top and bottom, unwired</Frame.Description>
              </Frame.Content>
            </Frame.Row>
          </Frame.Panel>
        </Frame>
        <Flow.Handle id="in" position="left" type="target" offset={0.3} />
        <Flow.Handle id="retry" position="left" type="target" offset={0.78} />
        <Flow.Handle id="metrics" position="top" type="source" />
        <Flow.Handle id="logs" position="bottom" type="source" />
      </Flow.Node>

      <Flow.Edge from="ingest.ok" to="index.in" variant="smoothstep" arrow />
      <Flow.Edge
        from="ingest.fail"
        to="deadletter.in"
        variant="smoothstep"
        dashed
        arrow
      />
      <Flow.Edge from="index.out" to="router.in" variant="smoothstep" arrow />
      <Flow.Edge
        from="deadletter.out"
        to="router.retry"
        variant="smoothstep"
        dashed
        arrow
      />

      <Flow.Controls />
    </Flow>
  );
}
function FlowGroupedVersion() {
  return (
    <Flow defaultViewport={{ x: 24, y: 24, zoom: 1 }} minZoom={0.4}>
      <Flow.Background variant="dots" gap={24} />

      <Flow.Group
        id="edge-tier"
        label="Edge"
        position={{ x: 0, y: 0 }}
        size={{ width: 196, height: 178 }}
      >
        <Flow.Node id="cdn" pinned position={{ x: 14, y: 34 }}>
          <GroupedNode
            icon={<ShareNodesIcon size={16} />}
            title="cdn"
            detail="142 locations"
          />
        </Flow.Node>
        <Flow.Node id="waf" pinned position={{ x: 14, y: 110 }}>
          <GroupedNode
            icon={<ShieldCheckIcon size={16} />}
            title="waf"
            detail="Blocking 0.4%"
          />
        </Flow.Node>
      </Flow.Group>

      <Flow.Group
        id="core-tier"
        label="Core"
        position={{ x: 0, y: 248 }}
        size={{ width: 196, height: 178 }}
      >
        <Flow.Node id="api" pinned position={{ x: 14, y: 282 }}>
          <GroupedNode
            icon={<SendIcon size={16} />}
            title="api"
            detail="p95 84ms"
          />
        </Flow.Node>

        <Flow.Node id="pg" confine position={{ x: 14, y: 358 }}>
          <GroupedNode
            icon={<PackageIcon size={16} />}
            title="postgres"
            detail="2 replicas"
          />
        </Flow.Node>
      </Flow.Group>

      <Flow.Edge
        from="edge-tier"
        to="core-tier"
        variant="smoothstep"
        animated
        arrow
      />

      <Flow.MiniMap />
      <Flow.Controls />
    </Flow>
  );
}
export const entry: ComponentEntry = {
  slug: "flow",
  name: "Flow",
  summary: "Pan-and-zoom canvas of draggable nodes joined by animated edges",
  layout: "sections",
  demos: [
    { label: "In a box", render: () => <FlowInlineDemo /> },
    { label: "Edge shapes", render: () => <FlowEdgeShapesDemo /> },
    {
      label: "Infrastructure map",
      id: "infrastructure",
      fullPage: true,
      description:
        "Two services and the dependency between them. Drag a node and the edge follows it in real time.",
      render: () => <FlowInfrastructureVersion />,
    },
    {
      label: "Build pipeline",
      id: "pipeline",
      fullPage: true,
      description:
        "Stages running top to bottom, with only the live edge marching. Advance it and watch the animation move.",
      render: () => <FlowPipelineVersion />,
    },
    {
      label: "Wiring it up",
      id: "connect",
      fullPage: true,
      description:
        "Drag from one port to another to create an edge. The canvas reports the connection; the graph stays yours.",
      render: () => <FlowConnectVersion />,
    },
    {
      label: "Mind map",
      id: "mind-map",
      fullPage: true,
      description:
        "Curved edges radiating from a centre, and no fixed sides — drag a branch across and the edge re-routes.",
      render: () => <FlowMindMapVersion />,
    },
    {
      label: "Building a graph",
      id: "builder",
      fullPage: true,
      description:
        "One button adds a frame, the other adds one already wired to the last. The canvas holds no list of its own.",
      render: () => <FlowBuilderVersion />,
    },
    {
      label: "Named ports",
      id: "ports",
      fullPage: true,
      description:
        "Edges pinned to handles instead of routed automatically, for a diagram where the sides mean something.",
      render: () => <FlowPortsVersion />,
    },
    {
      label: "Groups and a minimap",
      id: "grouped",
      fullPage: true,
      description:
        "Two containers joined by one edge, holding contents that travel with them, and an overview of the parts off screen.",
      render: () => <FlowGroupedVersion />,
    },
  ],
};
