interface WeappAccessibilityConfig {
  buildAdapter?: string;
  template?: { internalComponents: Record<string, Record<string, string>> };
}
interface PluginContext {
  modifyComponentConfig: (
    callback: (options: {
      componentConfig: unknown;
      config: WeappAccessibilityConfig;
    }) => void
  ) => void;
}
declare const plugin: {
  (context: PluginContext): void;
  configureWeappAccessibility: (
    components: unknown,
    config: WeappAccessibilityConfig
  ) => void;
};
export = plugin;
