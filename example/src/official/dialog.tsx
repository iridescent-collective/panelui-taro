import { Button } from "panelui-taro/button";
import { Dialog } from "panelui-taro/dialog";
import { Input } from "panelui-taro/input";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";

export const entry: ComponentEntry = {
  slug: "dialog",
  name: "Dialog",
  summary: "Modal confirmation overlay",
  demos: [
    {
      label: "Confirmation",
      render: () => (
        <Dialog>
          <Dialog.Trigger>
            <Button variant="outline">Open dialog</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>Delete project?</Dialog.Title>
            <Dialog.Description>
              This action cannot be undone. The project and all of its data will
              be permanently removed.
            </Dialog.Description>
            <Dialog.Footer>
              <Dialog.Close>
                <Button size="sm" variant="ghost">
                  Cancel
                </Button>
              </Dialog.Close>
              <Dialog.Close>
                <Button size="sm" variant="destructive">
                  Delete
                </Button>
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
    },
    {
      label: "Informational",
      render: () => (
        <Dialog>
          <Dialog.Trigger>
            <Button variant="outline">What's new</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>PanelUI 0.4</Dialog.Title>
            <Dialog.Description>
              Themes now change corner radius as well as colour, and there is a
              new Steps component for multi-step flows.
            </Dialog.Description>
            <Dialog.Footer>
              <Dialog.Close>
                <Button size="sm">Got it</Button>
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
    },
    {
      label: "Actions on their own surface",
      render: () => (
        <Dialog>
          <Dialog.Trigger>
            <Button variant="outline">Edit profile</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>Edit profile</Dialog.Title>
            <Dialog.Description>
              Make changes to your profile here. Save when you're done.
            </Dialog.Description>
            <View className="gap-4 py-4">
              <Input label="Name" defaultValue="Pedro Duarte" />
              <Input label="Username" defaultValue="@peduarte" />
            </View>

            <Dialog.Footer variant="panel">
              <Dialog.Close>
                <Button size="sm" variant="outline">
                  Cancel
                </Button>
              </Dialog.Close>
              <Dialog.Close>
                <Button size="sm">Save changes</Button>
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
    },
    {
      label: "Blurred background",
      render: () => (
        <Dialog>
          <Dialog.Trigger>
            <Button variant="outline">Open, blurred</Button>
          </Dialog.Trigger>

          <Dialog.Content blur>
            <Dialog.Title>Leave without saving?</Dialog.Title>
            <Dialog.Description>
              Your changes will be lost. The screen behind is blurred so the
              choice is the only thing in focus.
            </Dialog.Description>
            <Dialog.Footer>
              <Dialog.Close>
                <Button size="sm" variant="ghost">
                  Keep editing
                </Button>
              </Dialog.Close>
              <Dialog.Close>
                <Button size="sm" variant="destructive">
                  Discard
                </Button>
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
    },
  ],
};
