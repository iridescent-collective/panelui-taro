import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Tour } from "panelui-taro/tour";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const TourShowcase = () => {
  const [open, setOpen] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState("");
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography id="panel-tour-result">
        {JSON.stringify({ interactive, open, result, step })}
      </Typography>
      <Button variant="outline" onPress={() => setInteractive(!interactive)}>
        {interactive ? "Block target" : "Allow target interaction"}
      </Button>
      <Tour
        open={open}
        onOpenChange={setOpen}
        onStepChange={setStep}
        onFinish={() => setResult("Finished")}
        onSkip={() => setResult("Skipped")}
        interactive={interactive}
      >
        <Tour.Step
          order={10}
          title="Reading"
          description="The first target uses the default rectangular spotlight."
        >
          <View className="rounded-[24px] bg-[var(--panel-card)] p-[40px]">
            <Typography>Reading plan</Typography>
          </View>
        </Tour.Step>
        <Tour.Step
          order={20}
          title="Create"
          description="This target uses a circle. Interaction can pass through the spotlight."
          shape="circle"
          className="self-center"
        >
          <Button onPress={() => setResult("Target pressed")}>
            Create plan
          </Button>
        </Tour.Step>
        <Tour.Step
          order={30}
          title="Review"
          description="The final step can place its card above the target."
          placement="top"
        >
          <View className="rounded-[24px] border-[2px] border-solid border-[var(--panel-border)] p-[40px]">
            <Typography>Review the day</Typography>
          </View>
        </Tour.Step>
      </Tour>
      <Button
        onPress={() => {
          setResult("");
          setOpen(true);
        }}
      >
        Start tour
      </Button>
    </View>
  );
};
