export const resolvePreviewStoryId = (
  requested: string | undefined,
  stories: readonly { id: string }[]
): string => {
  const match = stories.find((story) => story.id === requested);
  return match?.id ?? stories[0].id;
};
