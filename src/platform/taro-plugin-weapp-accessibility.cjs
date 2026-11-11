const {
  configureNativeScroll,
} = require("./taro-plugin-weapp-native-scroll.cjs");
const definition = require("./weapp-accessibility.json");

const COMPONENTS = definition.components;
const ATTRIBUTES = definition.attributes;

const configureWeappAccessibility = (_components, config) => {
  if (config.buildAdapter !== "weapp" || !config.template) {
    return;
  }
  for (const component of COMPONENTS) {
    const properties = config.template.internalComponents[component];
    if (!properties) {
      continue;
    }
    for (const attribute of ATTRIBUTES) {
      properties[attribute] ??= "";
    }
  }
};

const plugin = (context) => {
  context.modifyComponentConfig(({ componentConfig, config }) => {
    configureWeappAccessibility(componentConfig, config);
    configureNativeScroll(config);
  });
};
plugin.configureWeappAccessibility = configureWeappAccessibility;
module.exports = plugin;
