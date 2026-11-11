import { Breadcrumb } from "panelui-taro/breadcrumb";
import { Item } from "panelui-taro/item";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import { demoAction } from "../runtime/demo-action";
import { ComponentEntry } from "../types";

function CollapsedBreadcrumbDemo() {
  const [expanded, setExpanded] = useState(false);
  return (
    <Breadcrumb>
      <Breadcrumb.List
        maxItems={expanded ? undefined : 3}
        onEllipsisPress={() => setExpanded(true)}
      >
        <Breadcrumb.Item>
          <Breadcrumb.Link onPress={demoAction("Home")}>Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link onPress={demoAction("Library")}>
            Library
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link onPress={demoAction("Components")}>
            Components
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Page>Breadcrumb</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
}
export const entry: ComponentEntry = {
  slug: "breadcrumb",
  name: "Breadcrumb",
  summary: "The trail back up to the current page",
  demos: [
    {
      label: "A trail",
      render: () => (
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link onPress={demoAction("Home")}>
                Home
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Link onPress={demoAction("Components")}>
                Components
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Page>Breadcrumb</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      ),
    },
    {
      label: "Custom separator",
      render: () => (
        <Breadcrumb
          separator={
            <Text size="sm" muted>
              /
            </Text>
          }
        >
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link onPress={demoAction("Docs")}>
                Docs
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Link onPress={demoAction("Guides")}>
                Guides
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Page>Theming</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      ),
    },
    {
      label: "Collapsed",
      render: () => <CollapsedBreadcrumbDemo />,
    },
    {
      label: "Dense header",
      render: () => (
        <Breadcrumb size="sm">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link onPress={demoAction("Settings")}>
                Settings
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Page>Billing</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      ),
    },
  ],
};
