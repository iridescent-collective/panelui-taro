import { View } from "@tarojs/components";
import { Rating } from "panelui-taro/rating";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const RatingShowcase = () => {
  const [committed, setCommitted] = useState(2.5);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">评分与精度</Typography.Heading>
      <Rating
        id="panel-rating"
        label="课程评分"
        defaultValue={2.5}
        precision={0.5}
        allowClear
        color="primary"
        showValue
        onValueCommit={setCommitted}
      />
      <Rating
        id="panel-rating-readonly"
        value={4.5}
        readOnly
        label="只读评分"
        color="primary"
      />
      <Typography.Paragraph id="panel-rating-status">
        已提交 {committed} 分
      </Typography.Paragraph>
    </View>
  );
};
