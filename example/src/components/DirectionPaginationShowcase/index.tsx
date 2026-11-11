import { View } from "@tarojs/components";
import { Direction } from "panelui-taro/direction";
import { Pagination } from "panelui-taro/pagination";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const DirectionPaginationShowcase = () => {
  const [page, setPage] = useState(1);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">分页与排版方向</Typography.Heading>
      <Pagination count={8} page={page} onPageChange={setPage} />
      <Pagination
        variant="compact"
        count={12}
        page={page}
        onPageChange={setPage}
      />
      <Direction dir="rtl">
        <Pagination
          variant="simple"
          count={8}
          page={page}
          onPageChange={setPage}
        />
      </Direction>
      <Typography id="panel-pagination-result">当前页：{page}</Typography>
    </View>
  );
};
