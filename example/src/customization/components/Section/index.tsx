import { Card } from "panelui-taro/card";
import type { ReactNode } from "react";

export const CustomizationSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <Card>
    <Card.Header>
      <Card.Title>{title}</Card.Title>
      {description ? <Card.Description>{description}</Card.Description> : null}
    </Card.Header>
    <Card.Content className="flex flex-col gap-[24px]">{children}</Card.Content>
  </Card>
);
