import { ActionShowcase } from "../ActionShowcase";
import { AIChatTemplateLauncher } from "../AIChatTemplate/components/Launcher";
import { AIInputShowcase } from "../AIInputShowcase";
import { AnimatedBadgeShowcase } from "../AnimatedBadgeShowcase";
import { AreaChartShowcase } from "../AreaChartShowcase";
import { AttachmentShowcase } from "../AttachmentShowcase";
import { AvatarCropperShowcase } from "../AvatarCropperShowcase";
import { BarChartShowcase } from "../BarChartShowcase";
import { BubbleChartShowcase } from "../BubbleChartShowcase";
import { BumpChartShowcase } from "../BumpChartShowcase";
import { CalendarShowcase } from "../CalendarShowcase";
import { CandlestickChartShowcase } from "../CandlestickChartShowcase";
import { CarouselShowcase } from "../CarouselShowcase";
import { CircularTextShowcase } from "../CircularTextShowcase";
import { ColorPickerShowcase } from "../ColorPickerShowcase";
import { ComboboxShowcase } from "../ComboboxShowcase";
import { CompareShowcase } from "../CompareShowcase";
import { ContentShowcase } from "../ContentShowcase";
import { ContextMenuShowcase } from "../ContextMenuShowcase";
import { DateTimePickerShowcase } from "../DateTimePickerShowcase";
import { DirectionPaginationShowcase } from "../DirectionPaginationShowcase";
import { DrawerShowcase } from "../DrawerShowcase";
import { FabShowcase } from "../FabShowcase";
import { FeedbackShowcase } from "../FeedbackShowcase";
import { FileUploadShowcase } from "../FileUploadShowcase";
import { FlipCardShowcase } from "../FlipCardShowcase";
import { FlowShowcase } from "../FlowShowcase";
import { FormRuntimeShowcase } from "../FormRuntimeShowcase";
import { FormShowcase } from "../FormShowcase";
import { FunnelChartShowcase } from "../FunnelChartShowcase";
import { HeatmapChartShowcase } from "../HeatmapChartShowcase";
import { HexChartShowcase } from "../HexChartShowcase";
import { ImageGenerationShowcase } from "../ImageGenerationShowcase";
import { ImageViewerShowcase } from "../ImageViewerShowcase";
import { KpiShowcase } from "../KpiShowcase";
import { LeaderboardShowcase } from "../LeaderboardShowcase";
import { LineChartShowcase } from "../LineChartShowcase";
import { LiveLineChartShowcase } from "../LiveLineChartShowcase";
import { LoaderShowcase } from "../LoaderShowcase";
import { MapShowcase } from "../MapShowcase";
import { MarkdownEditorShowcase } from "../MarkdownEditorShowcase";
import { MarqueeShowcase } from "../MarqueeShowcase";
import { MenuShowcase } from "../MenuShowcase";
import { MessageScrollerShowcase } from "../MessageScrollerShowcase";
import { MirrorAreaChartShowcase } from "../MirrorAreaChartShowcase";
import { OfficialTemplateLauncher } from "../OfficialTemplate/components/Launcher";
import { OtpInputShowcase } from "../OtpInputShowcase";
import { OverlayShowcase } from "../OverlayShowcase";
import { PageHeaderShowcase } from "../PageHeaderShowcase";
import { PanelsideShowcase } from "../PanelsideShowcase";
import { PieChartShowcase } from "../PieChartShowcase";
import { PlannerShowcase } from "../PlannerShowcase";
import { PlanShowcase } from "../PlanShowcase";
import { PlotShowcase } from "../PlotShowcase";
import { PolarAreaChartShowcase } from "../PolarAreaChartShowcase";
import { PopoverShowcase } from "../PopoverShowcase";
import { PostShowcase } from "../PostShowcase";
import { PresentationShowcase } from "../PresentationShowcase";
import { ProgressButtonShowcase } from "../ProgressButtonShowcase";
import { PyramidChartShowcase } from "../PyramidChartShowcase";
import { QRCodeShowcase } from "../QRCodeShowcase";
import { QuestionnaireShowcase } from "../QuestionnaireShowcase";
import { RadarChartShowcase } from "../RadarChartShowcase";
import { RatingShowcase } from "../RatingShowcase";
import { ReasoningShowcase } from "../ReasoningShowcase";
import { RingChartShowcase } from "../RingChartShowcase";
import { SankeyChartShowcase } from "../SankeyChartShowcase";
import { ScatterChartShowcase } from "../ScatterChartShowcase";
import { ScrollBlurShowcase } from "../ScrollBlurShowcase";
import { ScrollCanvasShowcase } from "../ScrollCanvasShowcase";
import { ScrollFadeShowcase } from "../ScrollFadeShowcase";
import { ScrollHeaderShowcase } from "../ScrollHeaderShowcase";
import { SearchBarShowcase } from "../SearchBarShowcase";
import { SectionProgressShowcase } from "../SectionProgressShowcase";
import { SectionRailShowcase } from "../SectionRailShowcase";
import { SelectionModeShowcase } from "../SelectionModeShowcase";
import { SelectShowcase } from "../SelectShowcase";
import { SheetShowcase } from "../SheetShowcase";
import { ShimmerShowcase } from "../ShimmerShowcase";
import { SignatureShowcase } from "../SignatureShowcase";
import { SketchShowcase } from "../SketchShowcase";
import { SlideButtonShowcase } from "../SlideButtonShowcase";
import { SliderShowcase } from "../SliderShowcase";
import { SortableShowcase } from "../SortableShowcase";
import { SoundwaveShowcase } from "../SoundwaveShowcase";
import { SourcesShowcase } from "../SourcesShowcase";
import { SplitterShowcase } from "../SplitterShowcase";
import { SplitViewShowcase } from "../SplitViewShowcase";
import { StackCardShowcase } from "../StackCardShowcase";
import { StepsShowcase } from "../StepsShowcase";
import { StructureShowcase } from "../StructureShowcase";
import { SupportShowcase } from "../SupportShowcase";
import { SwipeShowcase } from "../SwipeShowcase";
import { TabsShowcase } from "../TabsShowcase";
import { TagInputShowcase } from "../TagInputShowcase";
import { TaskShowcase } from "../TaskShowcase";
import { TextAnimationShowcase } from "../TextAnimationShowcase";
import { ThinkingOrbShowcase } from "../ThinkingOrbShowcase";
import { TimelineShowcase } from "../TimelineShowcase";
import { TimePickerShowcase } from "../TimePickerShowcase";
import { ToastShowcase } from "../ToastShowcase";
import { TooltipShowcase } from "../TooltipShowcase";
import { TourShowcase } from "../TourShowcase";
import { TranscriptShowcase } from "../TranscriptShowcase";
import { TreemapChartShowcase } from "../TreemapChartShowcase";
import { TreeShowcase } from "../TreeShowcase";
import { WaterfallChartShowcase } from "../WaterfallChartShowcase";

export const PREVIEW_STORIES = [
  {
    component: AIChatTemplateLauncher,
    id: "ai-template",
    label: "Official AI Template · Assistant 完整模板",
    modules: [
      "ai-input",
      "message",
      "reasoning",
      "task",
      "plan",
      "sources",
      "response",
      "message-scroller",
    ],
  },
  {
    component: OfficialTemplateLauncher,
    id: "official-template",
    label: "Official Template · Daily Life 完整模板",
    modules: [
      "accordion",
      "frame",
      "tabs",
      "ring-chart",
      "area-chart",
      "slide-button",
    ],
  },
  {
    component: FileUploadShowcase,
    id: "file-upload",
    label: "FileUpload",
    modules: ["file-upload"],
  },
  { component: PlotShowcase, id: "plot", label: "Plot", modules: ["plot"] },
  {
    component: AvatarCropperShowcase,
    id: "avatar-cropper",
    label: "AvatarCropper",
    modules: ["avatar-cropper"],
  },
  { component: MapShowcase, id: "map", label: "Map", modules: ["map"] },
  {
    component: SankeyChartShowcase,
    id: "sankey-chart",
    label: "SankeyChart",
    modules: ["sankey-chart"],
  },
  { component: FlowShowcase, id: "flow", label: "Flow", modules: ["flow"] },
  {
    component: TreemapChartShowcase,
    id: "treemap-chart",
    label: "TreemapChart",
    modules: ["treemap-chart"],
  },
  {
    component: MirrorAreaChartShowcase,
    id: "mirror-area-chart",
    label: "MirrorAreaChart",
    modules: ["mirror-area-chart"],
  },
  {
    component: PanelsideShowcase,
    id: "panelside",
    label: "Panelside",
    modules: ["panelside"],
  },
  {
    component: SketchShowcase,
    id: "sketch",
    label: "Sketch",
    modules: ["sketch"],
  },
  {
    component: MarkdownEditorShowcase,
    id: "markdown-editor",
    label: "MarkdownEditor",
    modules: ["markdown-editor"],
  },
  {
    component: LiveLineChartShowcase,
    id: "live-line-chart",
    label: "LiveLineChart",
    modules: ["live-line-chart"],
  },
  {
    component: BumpChartShowcase,
    id: "bump-chart",
    label: "BumpChart",
    modules: ["bump-chart"],
  },
  {
    component: CandlestickChartShowcase,
    id: "candlestick-chart",
    label: "CandlestickChart",
    modules: ["candlestick-chart"],
  },
  {
    component: MessageScrollerShowcase,
    id: "message-scroller",
    label: "MessageScroller",
    modules: ["message-scroller"],
  },
  { component: TourShowcase, id: "tour", label: "Tour", modules: ["tour"] },
  {
    component: QuestionnaireShowcase,
    id: "questionnaire",
    label: "Questionnaire",
    modules: ["questionnaire"],
  },
  {
    component: HexChartShowcase,
    id: "hex-chart",
    label: "HexChart",
    modules: ["hex-chart"],
  },
  {
    component: SortableShowcase,
    id: "sortable",
    label: "Sortable",
    modules: ["sortable"],
  },
  {
    component: PlannerShowcase,
    id: "planner",
    label: "Planner",
    modules: ["planner"],
  },
  {
    component: HeatmapChartShowcase,
    id: "heatmap-chart",
    label: "HeatmapChart",
    modules: ["heatmap-chart"],
  },
  {
    component: ImageViewerShowcase,
    id: "image-viewer",
    label: "ImageViewer",
    modules: ["image-viewer"],
  },
  {
    component: AIInputShowcase,
    id: "ai-input",
    label: "AIInput",
    modules: ["ai-input"],
  },
  {
    component: ComboboxShowcase,
    id: "combobox",
    label: "Combobox",
    modules: ["combobox"],
  },
  {
    component: ScatterChartShowcase,
    id: "scatter-chart",
    label: "ScatterChart",
    modules: ["scatter-chart"],
  },
  {
    component: BubbleChartShowcase,
    id: "bubble-chart",
    label: "BubbleChart",
    modules: ["bubble-chart"],
  },
  { component: PostShowcase, id: "post", label: "Post", modules: ["post"] },
  {
    component: ColorPickerShowcase,
    id: "color-picker",
    label: "ColorPicker",
    modules: ["color-picker"],
  },
  {
    component: StackCardShowcase,
    id: "stack-card",
    label: "StackCard",
    modules: ["stack-card"],
  },
  {
    component: WaterfallChartShowcase,
    id: "waterfall-chart",
    label: "WaterfallChart",
    modules: ["waterfall-chart"],
  },
  {
    component: TimelineShowcase,
    id: "timeline",
    label: "Timeline",
    modules: ["timeline"],
  },
  {
    component: TextAnimationShowcase,
    id: "text-animation",
    label: "TextAnimation",
    modules: ["text-animation"],
  },
  {
    component: PyramidChartShowcase,
    id: "pyramid-chart",
    label: "PyramidChart",
    modules: ["pyramid-chart"],
  },
  { component: FabShowcase, id: "fab", label: "Fab", modules: ["fab"] },
  {
    component: FunnelChartShowcase,
    id: "funnel-chart",
    label: "FunnelChart",
    modules: ["funnel-chart"],
  },
  { component: SwipeShowcase, id: "swipe", label: "Swipe", modules: ["swipe"] },
  {
    component: SignatureShowcase,
    id: "signature",
    label: "Signature",
    modules: ["signature"],
  },
  {
    component: DrawerShowcase,
    id: "drawer",
    label: "Drawer",
    modules: ["drawer"],
  },
  {
    component: RadarChartShowcase,
    id: "radar-chart",
    label: "RadarChart",
    modules: ["radar-chart"],
  },
  {
    component: PolarAreaChartShowcase,
    id: "polar-area-chart",
    label: "PolarAreaChart",
    modules: ["polar-area-chart"],
  },
  {
    component: PieChartShowcase,
    id: "pie-chart",
    label: "PieChart",
    modules: ["pie-chart"],
  },
  {
    component: RingChartShowcase,
    id: "ring-chart",
    label: "RingChart",
    modules: ["ring-chart"],
  },
  {
    component: BarChartShowcase,
    id: "bar-chart",
    label: "BarChart",
    modules: ["bar-chart"],
  },
  {
    component: AreaChartShowcase,
    id: "area-chart",
    label: "AreaChart",
    modules: ["area-chart"],
  },
  { component: KpiShowcase, id: "kpi", label: "Kpi", modules: ["kpi"] },
  {
    component: LineChartShowcase,
    id: "line-chart",
    label: "LineChart",
    modules: ["line-chart"],
  },
  {
    component: CarouselShowcase,
    id: "carousel",
    label: "Carousel",
    modules: ["carousel"],
  },
  {
    component: ContextMenuShowcase,
    id: "context-menu",
    label: "ContextMenu",
    modules: ["context-menu"],
  },
  { component: MenuShowcase, id: "menu", label: "Menu", modules: ["menu"] },
  {
    component: DateTimePickerShowcase,
    id: "date-time-picker",
    label: "DateTimePicker",
    modules: ["date-time-picker"],
  },
  {
    component: TimePickerShowcase,
    id: "time-picker",
    label: "TimePicker",
    modules: ["time-picker"],
  },
  {
    component: SearchBarShowcase,
    id: "search-bar",
    label: "SearchBar",
    modules: ["search-bar"],
  },
  {
    component: SelectionModeShowcase,
    id: "selection-mode",
    label: "SelectionMode",
    modules: ["selection-mode"],
  },
  {
    component: SoundwaveShowcase,
    id: "soundwave",
    label: "Soundwave",
    modules: ["soundwave"],
  },
  {
    component: ScrollHeaderShowcase,
    id: "scroll-header",
    label: "ScrollHeader",
    modules: ["scroll-header"],
  },
  {
    component: ThinkingOrbShowcase,
    id: "thinking-orb",
    label: "ThinkingOrb",
    modules: ["thinking-orb"],
  },
  {
    component: SlideButtonShowcase,
    id: "slide-button",
    label: "SlideButton",
    modules: ["slide-button"],
  },
  { component: ToastShowcase, id: "toast", label: "Toast", modules: ["toast"] },
  {
    component: SliderShowcase,
    id: "slider",
    label: "Slider",
    modules: ["slider"],
  },
  {
    component: SectionProgressShowcase,
    id: "section-progress",
    label: "SectionProgress",
    modules: ["section-progress"],
  },
  {
    component: ProgressButtonShowcase,
    id: "progress-button",
    label: "ProgressButton",
    modules: ["progress-button"],
  },
  {
    component: SectionRailShowcase,
    id: "section-rail",
    label: "SectionRail",
    modules: ["section-rail"],
  },
  {
    component: TagInputShowcase,
    id: "tag-input",
    label: "TagInput",
    modules: ["tag-input"],
  },
  {
    component: LoaderShowcase,
    id: "loader",
    label: "Loader",
    modules: ["loader"],
  },
  {
    component: CompareShowcase,
    id: "compare",
    label: "Compare · 裁剪对比",
    modules: ["compare"],
  },
  {
    component: SplitViewShowcase,
    id: "split-view",
    label: "SplitView · 吸附分栏",
    modules: ["split-view"],
  },
  {
    component: SplitterShowcase,
    id: "splitter",
    label: "Splitter · 分栏",
    modules: ["splitter"],
  },
  {
    component: LeaderboardShowcase,
    id: "leaderboard",
    label: "Leaderboard · 排名",
    modules: ["leaderboard"],
  },
  {
    component: OtpInputShowcase,
    id: "otp-input",
    label: "OtpInput · 验证码",
    modules: ["otp-input"],
  },
  {
    component: MarqueeShowcase,
    id: "marquee",
    label: "Marquee · 连续滚动",
    modules: ["marquee"],
  },
  {
    component: QRCodeShowcase,
    id: "qr-code",
    label: "QRCode · 二维码",
    modules: ["qr-code"],
  },
  {
    component: FormRuntimeShowcase,
    id: "form-runtime",
    label: "Form · 表单状态与校验",
    modules: ["form"],
  },
  {
    component: DirectionPaginationShowcase,
    id: "direction-pagination",
    label: "Direction、Pagination",
    modules: ["direction", "pagination"],
  },
  {
    component: ScrollBlurShowcase,
    id: "scroll-blur",
    label: "ScrollBlur · 滚动材质边缘",
    modules: ["scroll-blur", "typography"],
  },
  {
    component: FlipCardShowcase,
    id: "flip-card",
    label: "FlipCard · 双面卡片",
    modules: ["flip-card", "typography"],
  },
  {
    component: CircularTextShowcase,
    id: "circular-text",
    label: "CircularText · 圆周文字",
    modules: ["button", "circular-text", "typography"],
  },
  {
    component: ScrollFadeShowcase,
    id: "scroll-fade",
    label: "ScrollFade · 边缘渐隐",
    modules: ["scroll-fade", "typography"],
  },
  {
    component: AnimatedBadgeShowcase,
    id: "animated-badge",
    label: "AnimatedBadge · 动态标签",
    modules: ["animated-badge", "button", "typography"],
  },
  {
    component: ImageGenerationShowcase,
    id: "image-generation",
    label: "ImageGeneration · 图像生成",
    modules: ["button", "image-generation", "typography"],
  },
  {
    component: PlanShowcase,
    id: "plan",
    label: "Plan · 计划",
    modules: ["button", "plan", "typography"],
  },
  {
    component: PageHeaderShowcase,
    id: "page-header",
    label: "PageHeader、Marker",
    modules: ["marker", "page-header", "typography"],
  },
  {
    component: TaskShowcase,
    id: "task",
    label: "Task · 任务",
    modules: ["task", "typography"],
  },
  {
    component: ReasoningShowcase,
    id: "reasoning",
    label: "Reasoning · 思考过程",
    modules: ["button", "reasoning", "typography"],
  },
  {
    component: AttachmentShowcase,
    id: "attachment",
    label: "Attachment · 附件",
    modules: ["attachment", "typography"],
  },
  {
    component: ShimmerShowcase,
    id: "shimmer",
    label: "Shimmer · 字形扫光",
    modules: ["shimmer", "typography"],
  },
  {
    component: FeedbackShowcase,
    id: "feedback",
    label: "Feedback · 意见反馈",
    modules: ["button", "feedback", "typography"],
  },
  {
    component: TreeShowcase,
    id: "tree",
    label: "Tree · 层级树",
    modules: ["tree", "typography"],
  },
  {
    component: SupportShowcase,
    id: "support",
    label: "Support · 帮助与支持",
    modules: ["support", "typography"],
  },
  {
    component: ScrollCanvasShowcase,
    id: "scroll-canvas",
    label: "ScrollCanvas、ScrollText",
    modules: ["button", "scroll-canvas", "scroll-text", "typography"],
  },
  {
    component: SelectShowcase,
    id: "select",
    label: "Select · 选择器",
    modules: ["select", "typography"],
  },
  {
    component: TabsShowcase,
    id: "tabs",
    label: "Tabs · 页签",
    modules: ["input", "tabs", "typography"],
  },
  {
    component: TooltipShowcase,
    id: "tooltip",
    label: "Tooltip · 提示",
    modules: ["button", "tooltip", "typography"],
  },
  {
    component: RatingShowcase,
    id: "rating",
    label: "Rating · 评分",
    modules: ["rating", "typography"],
  },
  {
    component: SourcesShowcase,
    id: "sources",
    label: "Sources · 引用来源",
    modules: ["sources", "typography"],
  },
  {
    component: StepsShowcase,
    id: "steps",
    label: "Steps · 步骤",
    modules: ["steps", "typography"],
  },
  {
    component: CalendarShowcase,
    id: "calendar",
    label: "Calendar、DatePicker",
    modules: ["calendar", "date-picker", "typography"],
  },
  {
    component: PopoverShowcase,
    id: "popover",
    label: "Popover · 浮层",
    modules: ["button", "popover", "typography"],
  },
  {
    component: SheetShowcase,
    id: "sheet",
    label: "BottomSheet · 底部面板",
    modules: ["bottom-sheet", "button", "typography"],
  },
  {
    component: TranscriptShowcase,
    id: "transcript",
    label: "Message、CodeBlock、Response",
    modules: ["code-block", "message", "response", "table", "typography"],
  },
  {
    component: OverlayShowcase,
    id: "overlay",
    label: "Dialog、Frame",
    modules: [
      "button",
      "dialog",
      "frame",
      "grid-item",
      "meter",
      "number-input",
      "switch",
      "typography",
    ],
  },
  {
    component: StructureShowcase,
    id: "structure",
    label: "Accordion、Collapsible、InputGroup、ThemeSelector",
    modules: [
      "accordion",
      "button",
      "collapsible",
      "input",
      "input-group",
      "theme-selector",
      "typography",
    ],
  },
  {
    component: PresentationShowcase,
    id: "presentation",
    label: "Avatar、Chip、Item、Countdown、EmptyState",
    modules: [
      "avatar",
      "breadcrumb",
      "chip",
      "countdown",
      "empty-state",
      "item",
      "typography",
    ],
  },
  {
    component: FormShowcase,
    id: "form",
    label: "Input、Textarea、Checkbox、Field、RadioGroup、Switch、ToggleButton",
    modules: [
      "alert",
      "button",
      "checkbox",
      "field",
      "input",
      "radio-group",
      "switch",
      "textarea",
      "toggle-button",
      "typography",
    ],
  },
  {
    component: ActionShowcase,
    id: "action",
    label: "Button、Badge、ButtonGroup",
    modules: ["badge", "button", "button-group", "card", "typography"],
  },
  {
    component: ContentShowcase,
    id: "content",
    label:
      "Typography、Card、Label、Surface、Progress、Meter、NumberInput、Skeleton、Spinner、Separator、GridItem",
    modules: [
      "card",
      "label",
      "progress",
      "separator",
      "skeleton",
      "spinner",
      "surface",
      "typography",
    ],
  },
] as const;
