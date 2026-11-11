const artwork = (background: string, accent: string, label: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="${background}"/><circle cx="450" cy="100" r="120" fill="${accent}"/><path d="M0 400 L190 120 L390 400Z" fill="${accent}"/><text x="40" y="350" font-size="36" fill="white">${label}</text></svg>`)}`;
export const VIEWER_IMAGES = [
  { label: "Mountain", src: artwork("#14532d", "#4ade80", "Mountain") },
  { label: "Ocean", src: artwork("#1e3a8a", "#38bdf8", "Ocean") },
  { label: "Evening", src: artwork("#581c87", "#c084fc", "Evening") },
];
