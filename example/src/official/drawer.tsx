import { Avatar } from "panelui-taro/avatar";
import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { Chip } from "panelui-taro/chip";
import { Direction } from "panelui-taro/direction";
import { Drawer } from "panelui-taro/drawer";
import {
  BellIcon,
  CardIcon,
  ChevronRightIcon,
  PackageIcon,
  ShieldCheckIcon,
} from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Label } from "panelui-taro/label";
import { Text } from "panelui-taro/primitives/text";
import { Rating } from "panelui-taro/rating";
import { Separator } from "panelui-taro/separator";
import { Slider } from "panelui-taro/slider";
import { Switch } from "panelui-taro/switch";
import { Fragment, useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function DrawerNavigationDemo() {
  const [destination, setDestination] = useState("Projects");
  const places = [
    { label: "Projects", icon: <PackageIcon size={16} />, detail: "12 active" },
    { label: "Members", icon: <BellIcon size={16} />, detail: "8 people" },
    { label: "Billing", icon: <CardIcon size={16} />, detail: "Pro plan" },
  ];
  return (
    <Drawer>
      <Drawer.Trigger>
        <Button variant="outline">Open menu</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header
          title="Acme Studio"
          description="Switch project or manage members."
        />
        <Drawer.Body>
          <View className="gap-4 pb-4">
            <Item.Group>
              {places.map(({ label, icon, detail }, index) => (
                <Fragment key={label}>
                  {index > 0 ? <Item.Separator /> : null}
                  <Item
                    variant={destination === label ? "muted" : "default"}
                    onPress={() => setDestination(label)}
                    accessibilityState={{ selected: destination === label }}
                  >
                    <Item.Media variant="icon">{icon}</Item.Media>
                    <Item.Content>
                      <Item.Title>{label}</Item.Title>
                      <Item.Description>{detail}</Item.Description>
                    </Item.Content>
                    <Item.Actions>
                      {destination === label ? (
                        <Badge variant="secondary">Here</Badge>
                      ) : (
                        <ChevronRightIcon size={16} />
                      )}
                    </Item.Actions>
                  </Item>
                </Fragment>
              ))}
            </Item.Group>

            <Separator />

            <Item.Group>
              <Item>
                <Item.Media variant="icon">
                  <ShieldCheckIcon size={16} />
                </Item.Media>
                <Item.Content>
                  <Item.Title>Security</Item.Title>
                  <Item.Description>Two-factor is on</Item.Description>
                </Item.Content>
                <Item.Actions>
                  <ChevronRightIcon size={16} />
                </Item.Actions>
              </Item>
              <Item.Separator />
              <Item>
                <Item.Media variant="icon">
                  <BellIcon size={16} />
                </Item.Media>
                <Item.Content>
                  <Item.Title>Notifications</Item.Title>
                  <Item.Description>Badges, sounds, banners</Item.Description>
                </Item.Content>
                <Item.Actions>
                  <ChevronRightIcon size={16} />
                </Item.Actions>
              </Item>
            </Item.Group>
          </View>
        </Drawer.Body>
        <Drawer.Footer>
          <Avatar size="sm" fallback="KA" />
          <View className="min-w-0 flex-1">
            <Text size="sm" weight="medium" numberOfLines={1}>
              Khalid Abdi
            </Text>
            <Text size="xs" muted numberOfLines={1}>
              khalid@acme.studio
            </Text>
          </View>
          <Drawer.Close>
            <Button variant="outline" size="sm">
              Sign out
            </Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
const DRAWER_SIZES = [
  {
    size: "sm",
    asks: "62% of the width",
    capped: "never past 280pt",
    use: "A short list of destinations.",
  },
  {
    size: "md",
    asks: "78% of the width",
    capped: "never past 320pt",
    use: "The default. Navigation, filters, a form.",
  },
  {
    size: "lg",
    asks: "88% of the width",
    capped: "never past 400pt",
    use: "Anything with two columns of content.",
  },
  {
    size: "full",
    asks: "94% of the width",
    capped: "no cap",
    use: "A takeover that still shows the app behind it.",
  },
] as const;
function DrawerSizesDemo() {
  return (
    <View className="w-full flex-row flex-wrap justify-center gap-2">
      {DRAWER_SIZES.map(({ size, asks, capped, use }) => (
        <Drawer key={size}>
          <Drawer.Trigger>
            <Button variant="outline" size="sm">
              {size}
            </Button>
          </Drawer.Trigger>
          <Drawer.Content size={size}>
            <Drawer.Header title={`size="${size}"`} description={use} />
            <Drawer.Body>
              <View className="gap-4 pb-4">
                <Item.Group>
                  <Item>
                    <Item.Content>
                      <Item.Title>Asks for</Item.Title>
                    </Item.Content>
                    <Item.Actions>
                      <Text size="sm" muted>
                        {asks}
                      </Text>
                    </Item.Actions>
                  </Item>
                  <Item.Separator />
                  <Item>
                    <Item.Content>
                      <Item.Title>Capped at</Item.Title>
                    </Item.Content>
                    <Item.Actions>
                      <Text size="sm" muted>
                        {capped}
                      </Text>
                    </Item.Actions>
                  </Item>
                </Item.Group>
                <Text size="sm" muted>
                  The cap is what a fraction cannot do on its own: 78% of a
                  tablet is a navigation list with a column of whitespace beside
                  it.
                </Text>
                <Text size="sm" muted>
                  Drag the panel back toward its edge to dismiss it.
                </Text>
              </View>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>
      ))}
    </View>
  );
}
const DRAWER_CATEGORIES = ["Chairs", "Desks", "Lighting", "Storage", "Rugs"];
function DrawerFiltersDemo() {
  const [categories, setCategories] = useState<string[]>(["Chairs"]);
  const [budget, setBudget] = useState(320);
  const [rating, setRating] = useState(4);
  const [inStock, setInStock] = useState(true);
  const [onSale, setOnSale] = useState(false);
  const toggleCategory = (name: string) =>
    setCategories((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    );
  const reset = () => {
    setCategories([]);
    setBudget(500);
    setRating(0);
    setInStock(false);
    setOnSale(false);
  };
  const results =
    240 -
    categories.length * 26 -
    Math.round((500 - budget) / 8) -
    rating * 11 -
    (inStock ? 18 : 0) -
    (onSale ? 34 : 0);
  const applied =
    categories.length +
    (budget < 500 ? 1 : 0) +
    (rating > 0 ? 1 : 0) +
    (inStock ? 1 : 0) +
    (onSale ? 1 : 0);
  return (
    <Drawer>
      <Drawer.Trigger>
        <Button variant="outline">Filters</Button>
      </Drawer.Trigger>
      <Drawer.Content side="end" closeSide="end">
        <Drawer.Header
          title="Filters"
          description={applied === 0 ? "Nothing applied" : `${applied} applied`}
        />
        <Drawer.Body>
          <View className="gap-6 pb-6">
            <View className="gap-3">
              <Label>Category</Label>
              <View className="flex-row flex-wrap gap-2">
                {DRAWER_CATEGORIES.map((name) => (
                  <Chip
                    key={name}
                    selected={categories.includes(name)}
                    onPress={() => toggleCategory(name)}
                  >
                    {name}
                  </Chip>
                ))}
              </View>
            </View>

            <Separator />

            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Label>Budget</Label>
                <Text size="sm" muted>
                  Up to ${budget}
                </Text>
              </View>
              <Slider
                value={budget}
                onValueChange={setBudget}
                min={40}
                max={500}
                step={20}
              />
            </View>

            <Separator />

            <View className="gap-2">
              <Label>Minimum rating</Label>
              <Rating value={rating} onValueChange={setRating} allowClear />
            </View>

            <Separator />

            <Item.Group>
              <Item>
                <Item.Content>
                  <Item.Title>In stock only</Item.Title>
                  <Item.Description>
                    Hide anything on backorder
                  </Item.Description>
                </Item.Content>
                <Item.Actions>
                  <Switch value={inStock} onValueChange={setInStock} />
                </Item.Actions>
              </Item>
              <Item.Separator />
              <Item>
                <Item.Content>
                  <Item.Title>On sale</Item.Title>
                  <Item.Description>
                    Reduced in the last 30 days
                  </Item.Description>
                </Item.Content>
                <Item.Actions>
                  <Switch value={onSale} onValueChange={setOnSale} />
                </Item.Actions>
              </Item>
            </Item.Group>
          </View>
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="ghost" onPress={reset}>
            Reset
          </Button>
          <Drawer.Close>
            <Button className="flex-1">
              Show {Math.max(results, 0)} results
            </Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
export const entry: ComponentEntry = {
  slug: "drawer",
  name: "Drawer",
  summary: "A panel that comes in from an edge of the screen",
  demos: [
    { label: "Navigation drawer", render: () => <DrawerNavigationDemo /> },
    {
      label: "From the end edge",
      render: () => <DrawerFiltersDemo />,
    },
    { label: "Sizes", render: () => <DrawerSizesDemo /> },
    {
      label: "From the top",
      render: () => (
        <Drawer>
          <Drawer.Trigger>
            <Button variant="outline">Notifications</Button>
          </Drawer.Trigger>
          <Drawer.Content side="top" size="sm">
            <Drawer.Header title="Notifications" />
            <Drawer.Body>
              <Item>
                <Item.Content>
                  <Item.Title>Build passed</Item.Title>
                  <Item.Description>2 minutes ago</Item.Description>
                </Item.Content>
              </Item>
              <Item>
                <Item.Content>
                  <Item.Title>New comment</Item.Title>
                  <Item.Description>1 hour ago</Item.Description>
                </Item.Content>
              </Item>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>
      ),
    },
    {
      label: "Right to left",
      render: () => (
        <Direction dir="rtl" className="w-full">
          <Drawer>
            <Drawer.Trigger>
              <Button variant="outline">افتح القائمة</Button>
            </Drawer.Trigger>
            <Drawer.Content side="start">
              <Drawer.Header title="مساحة العمل" />
              <Drawer.Body>
                {["المشاريع", "الأعضاء"].map((label) => (
                  <Item key={label}>
                    <Item.Content>
                      <Item.Title>{label}</Item.Title>
                    </Item.Content>
                  </Item>
                ))}
              </Drawer.Body>
            </Drawer.Content>
          </Drawer>
        </Direction>
      ),
    },
  ],
};
