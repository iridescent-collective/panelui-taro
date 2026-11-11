export const TEMPLATE_QUERY = "template";
export const TEMPLATE_ENABLED = "1";
export const TEMPLATE_URL = "/showcases/daily-life/index";
export const SCREENS = [
  {
    id: "home",
    label: "Home",
    subtitle: "4 rooms · Your space, your pace",
    title: "Home",
  },
  {
    id: "wallet",
    label: "Wallet",
    subtitle: "3 cards · Maya Lindqvist",
    title: "Wallet",
  },
  {
    id: "activity",
    label: "Activity",
    subtitle: "Every little move counts",
    title: "Activity",
  },
  {
    id: "travel",
    label: "Travel",
    subtitle: "Today · NW 1482",
    title: "Boarding pass",
  },
  {
    id: "settings",
    label: "More",
    subtitle: "Appearance, preferences & support",
    title: "Make it yours",
  },
] as const;
export const ROOMS = [
  {
    current: 20.4,
    devices: [
      "Ceiling light",
      "Floor lamp",
      "Television",
      "Speaker",
      "Blinds",
      "Ceiling fan",
    ],
    id: "living",
    label: "Living room",
    target: 21.5,
  },
  {
    current: 21.8,
    devices: ["Pendants", "Under-cabinet", "Coffee machine", "Dishwasher"],
    id: "kitchen",
    label: "Kitchen",
    target: 21,
  },
  {
    current: 19.1,
    devices: ["Bedside lamp", "Blinds", "Humidifier", "Fan"],
    id: "bedroom",
    label: "Bedroom",
    target: 18.5,
  },
  {
    current: 20.9,
    devices: ["Desk lamp", "Light strip", "Heater", "Speaker"],
    id: "office",
    label: "Office",
    target: 21,
  },
];
export const SCENES = ["Morning", "Away", "Movie", "Night"];
export const CARDS = [
  {
    balance: 324_018,
    expiry: "09/29",
    id: "everyday",
    last4: "4821",
    name: "Everyday",
  },
  {
    balance: 118_640,
    expiry: "03/28",
    id: "travel",
    last4: "7713",
    name: "Travel",
  },
  {
    balance: 805_378,
    expiry: "11/30",
    id: "savings",
    last4: "0094",
    name: "Savings",
  },
];
export const PERIODS = ["Day", "Week", "Month"];
export const ACTIVITY = [
  {
    bars: [720, 1100, 420, 1800, 920, 1454, 1800],
    distance: "6.1 km",
    energy: 486,
    energyGoal: 600,
    heart: "58 bpm",
    sleep: "7h 12m",
    steps: 8214,
    stepsGoal: 10_000,
    workout: 34,
    workoutGoal: 45,
  },
  {
    bars: [8214, 9420, 7650, 10_120, 8920, 8102, 9414],
    distance: "44.8 km",
    energy: 3712,
    energyGoal: 4200,
    heart: "59 bpm",
    sleep: "6h 58m",
    steps: 61_840,
    stepsGoal: 70_000,
    workout: 268,
    workoutGoal: 315,
  },
  {
    bars: [61_840, 65_420, 58_100, 65_940],
    distance: "183 km",
    energy: 14_920,
    energyGoal: 18_000,
    heart: "60 bpm",
    sleep: "7h 04m",
    steps: 251_300,
    stepsGoal: 300_000,
    workout: 1104,
    workoutGoal: 1350,
  },
];
export const FAQ = [
  {
    body: "Adapted from PanelUI’s own Smart Home, Wallet, Activity and Boarding Pass blocks, using the local official source and preview images. The navigation and settings screen connect them into one demo template.",
    id: "source",
    title: "Where does this design come from?",
  },
  {
    body: "All data and actions belong to this local demonstration. No device command, bank transfer or airline check-in is sent.",
    id: "demo",
    title: "Are these real devices and payments?",
  },
  {
    body: "Each screen is composed from the existing PanelUI Taro components. Replace the fixtures and local state with your application data, while keeping the same composition and theme tokens.",
    id: "reuse",
    title: "Can I build on this template?",
  },
];
export const money = (cents: number) =>
  new Intl.NumberFormat("en-IE", { currency: "EUR", style: "currency" }).format(
    cents / 100
  );
