// An omitted React scrollTop still becomes scroll-top="{{undefined}}" in Taro's
// template and can be replayed as zero during ancestor animation updates. Keep
// an opt-in branch with no position attributes, without changing default views.
const nativeScrollTemplates = new WeakSet();
const configureNativeScroll = (config) => {
  const template = config.template;
  if (
    config.buildAdapter !== "weapp" ||
    !template ||
    nativeScrollTemplates.has(template)
  )
    return;
  nativeScrollTemplates.add(template);
  const previous = template.modifyTemplateResult;
  template.modifyTemplateResult = function (result, nodeName, ...rest) {
    const rendered = previous
      ? previous.call(this, result, nodeName, ...rest)
      : result;
    if (nodeName !== "scroll-view") return rendered;
    return rendered.replace(
      /<scroll-view\b[\s\S]*?<\/scroll-view>/gu,
      (controlled) => {
        const native = controlled.replace(
          /\s(?:scroll-top|scroll-left|scroll-into-view)="[^"]*"/gu,
          ""
        );
        return `<block wx:if="{{i.paneluiNativeScroll}}">${native}</block><block wx:else>${controlled}</block>`;
      }
    );
  };
};

const plugin = (context) => {
  context.modifyComponentConfig(({ config }) => configureNativeScroll(config));
};
plugin.configureNativeScroll = configureNativeScroll;
module.exports = plugin;
