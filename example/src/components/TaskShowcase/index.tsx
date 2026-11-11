import { View } from "@tarojs/components";
import { Task } from "panelui-taro/task";
import { Typography } from "panelui-taro/typography";

export const TaskShowcase = () => (
  <View className="flex flex-col gap-[24px]">
    <Typography.Heading type="h3">任务记录</Typography.Heading>
    <Task status="running">
      <Task.Trigger className="panel-task-toggle" title="正在检索教材" />
      <Task.Content id="panel-task-content">
        <Task.Item>
          读取 <Task.File>数学.pdf</Task.File>
        </Task.Item>
        <Task.Item>整理章节信息</Task.Item>
      </Task.Content>
    </Task>
    <Task status="complete">
      <Task.Trigger title="教材索引完成" />
    </Task>
    <Task status="pending">
      <Task.Trigger title="等待上传" />
    </Task>
    <Task status="error">
      <Task.Trigger title="解析失败" />
    </Task>
  </View>
);
