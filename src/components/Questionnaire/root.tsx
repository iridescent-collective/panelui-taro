import { View } from "@tarojs/components";

import { cn } from "../../lib/utils";
import { Frame } from "../Frame";
import { Text, textChildren } from "../primitives/Text";
import { QuestionnaireBody } from "./body";
import { QuestionnaireContext } from "./context";
import { bandActions } from "./parts";
import type { QuestionnaireProps } from "./types";
import { useQuestionnaireModel } from "./use-model";

export const QuestionnaireRoot = (properties: QuestionnaireProps) => {
  const {
    context,
    activeName,
    activeItem,
    activeIndex,
    frame,
    swipeable,
    last,
    first,
    goNext,
    goBack,
    titleNode,
    progressNode,
    footerNode,
    stripQuestion,
    className,
    viewProps: props,
  } = useQuestionnaireModel(properties);
  const body = (
    <QuestionnaireBody
      activeName={activeName}
      activeItem={activeItem}
      activeIndex={activeIndex}
      framed={frame}
      swipeable={swipeable}
      canAdvance={!last}
      canRetreat={!first}
      onNext={goNext}
      onBack={goBack}
    />
  );
  const header = (
    <Frame.Header className="pt-[12px] pb-[24px]">
      {titleNode ??
        textChildren(stripQuestion, (text) => (
          <Text
            size="sm"
            weight="medium"
            numberOfLines={1}
            className="min-w-[0px] shrink"
          >
            {text}
          </Text>
        ))}
      {progressNode ? <Frame.Action>{progressNode}</Frame.Action> : null}
    </Frame.Header>
  );
  return (
    <QuestionnaireContext.Provider value={context}>
      {frame ? (
        <Frame variant="inset" className={className} {...props}>
          {header}
          <Frame.Panel dividers={false}>{body}</Frame.Panel>
          {footerNode ? (
            <Frame.Footer className="gap-[16px]">
              {bandActions(footerNode)}
            </Frame.Footer>
          ) : null}
        </Frame>
      ) : (
        <View className={cn("w-full", className)} {...props}>
          {titleNode || progressNode ? (
            <View
              className={cn(
                "flex flex-row items-center gap-[24px] pb-[24px]",
                titleNode ? "justify-between" : "justify-center"
              )}
            >
              {titleNode}
              {progressNode}
            </View>
          ) : null}
          {body}
          {footerNode}
        </View>
      )}
    </QuestionnaireContext.Provider>
  );
};
