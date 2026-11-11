import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Input } from "panelui-taro/input";
import { Text } from "panelui-taro/primitives/text";

import { demoAction } from "../runtime/demo-action";
import { Image, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const PHOTO =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=60";
export const entry: ComponentEntry = {
  slug: "card",
  name: "Card",
  summary: "Grouped content surface",
  demos: [
    {
      label: "Basic card",
      render: () => (
        <Card className="w-full">
          <Card.Header>
            <Card.Title>Living room Sofa</Card.Title>
            <Card.Description>
              This sofa is perfect for modern tropical spaces, baroque inspired
              spaces.
            </Card.Description>
          </Card.Header>
          <Card.Footer className="gap-2">
            <Button fullWidth onPress={demoAction("Buy now")}>
              Buy now
            </Button>
          </Card.Footer>
        </Card>
      ),
    },
    {
      label: "With form",
      render: () => (
        <Card className="w-full">
          <Card.Header>
            <Card.Title>Project settings</Card.Title>
            <Card.Description>
              Manage how your project appears to others.
            </Card.Description>
          </Card.Header>
          <Card.Content className="gap-4">
            <Input label="Project name" placeholder="PanelUI" />
            <Input
              label="Description"
              placeholder="A short description"
              description="Shown on your public profile."
            />
          </Card.Content>
          <Card.Footer>
            <Button size="sm" onPress={demoAction("Save")}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onPress={demoAction("Cancel")}>
              Cancel
            </Button>
          </Card.Footer>
        </Card>
      ),
    },
    {
      label: "With image",
      render: () => (
        <Card className="w-full overflow-hidden">
          <Image
            source={{ uri: PHOTO }}
            style={{ width: "100%", height: 180 }}
            resizeMode="cover"
          />
          <Card.Header>
            <Text size="sm" weight="medium" className="text-info-foreground">
              $450
            </Text>
            <Card.Title>Living room Sofa</Card.Title>
            <Card.Description>
              Perfect for modern tropical spaces and baroque inspired rooms.
            </Card.Description>
          </Card.Header>
          <Card.Footer>
            <Button fullWidth onPress={demoAction("Buy now")}>
              Buy now
            </Button>
          </Card.Footer>
        </Card>
      ),
    },
    {
      label: "Actions on their own surface",
      render: () => (
        <Card className="w-full">
          <Card.Header>
            <Card.Title>Login to your account</Card.Title>
            <Card.Description>
              Enter your email below to login to your account.
            </Card.Description>
          </Card.Header>
          <Card.Content className="gap-4">
            <Input label="Email" placeholder="m@example.com" />
            <Input label="Password" placeholder="••••••••" secureTextEntry />
          </Card.Content>
          <Card.Footer variant="panel" className="flex-col gap-2">
            <Button fullWidth onPress={demoAction("Login")}>
              Login
            </Button>
            <Button
              fullWidth
              variant="outline"
              onPress={demoAction("Login with Google")}
            >
              Login with Google
            </Button>
          </Card.Footer>
        </Card>
      ),
    },
    {
      label: "Horizontal",
      render: () => (
        <Card className="w-full overflow-hidden">
          <Card.Content className="flex-row items-center gap-4 p-3">
            <Image
              source={{ uri: PHOTO }}
              style={{ width: 72, height: 72, borderRadius: 12 }}
              resizeMode="cover"
            />
            <View className="flex-1 gap-0.5">
              <Text weight="semibold">Accent chair</Text>
              <Text size="sm" muted>
                Walnut and boucle
              </Text>
              <Badge variant="success">In stock</Badge>
            </View>
          </Card.Content>
        </Card>
      ),
    },
  ],
};
