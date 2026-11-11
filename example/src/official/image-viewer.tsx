import { ImageViewer } from "panelui-taro/image-viewer";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
function photo(
  id: string,
  crop?: {
    width: number;
    height: number;
  }
) {
  const url = (width: number) => {
    const size = crop
      ? `w=${width}&h=${Math.round((width * crop.height) / crop.width)}&fit=crop`
      : `w=${width}`;
    return { uri: `https://images.unsplash.com/photo-${id}?${size}&q=70` };
  };
  return { source: url(480), fullSource: url(1600) };
}
function ImageViewerSingleDemo() {
  return (
    <ImageViewer>
      <ImageViewer.Trigger
        {...photo("1501785888041-af3ef285b470")}
        alt="A rowing boat on a turquoise lake under limestone peaks"
        caption="Rented a boat for an hour and stayed for three."
        radius={16}
        className="h-56 w-full rounded-2xl"
      />
    </ImageViewer>
  );
}
const ROW_OF_THREE = [
  {
    id: "1418065460487-3e41a6c84dc5",
    alt: "Pine trees disappearing into fog",
    caption: "Nothing past the second row of trees until noon.",
  },
  {
    id: "1505765050516-f72dcac9c60e",
    alt: "A snow-covered summit breaking through cloud",
    caption: "The summit came out for about a minute.",
  },
  {
    id: "1482192596544-9eb780fc7f66",
    alt: "Fog lying over a forest seen from above",
    caption: "From the ridge, the fog sitting in the canopy.",
  },
];
function ImageViewerRowDemo() {
  return (
    <ImageViewer>
      <View className="w-full flex-row gap-1.5">
        {ROW_OF_THREE.map((entry) => (
          <ImageViewer.Trigger
            key={entry.id}
            {...photo(entry.id)}
            alt={entry.alt}
            caption={entry.caption}
            radius={10}
            className="aspect-square flex-1 rounded-[10px]"
          />
        ))}
      </View>
    </ImageViewer>
  );
}
interface JournalPhoto {
  id: string;
  alt: string;
  caption: string;
}
interface JournalDay {
  title: string;
  note: string;
  rows: JournalPhoto[][];
}
const JOURNAL: JournalDay[] = [
  {
    title: "Day 1 · Into the valley",
    note: "Off the bus at nine, and walking by ten.",
    rows: [
      [
        {
          id: "1464822759023-fed622ff2c3b",
          alt: "A wide valley between snowy mountains, pines in the foreground",
          caption:
            "The first view down the valley, before the path drops into the trees.",
        },
      ],
      [
        {
          id: "1447752875215-b2761acb3c5d",
          alt: "A metal footbridge leading into dense forest",
          caption:
            "The footbridge at the bottom, slick with the morning's rain.",
        },
        {
          id: "1433086966358-54859d0ed716",
          alt: "A tall waterfall with a stone bridge across it",
          caption: "Forty minutes on, the falls the bridge was built to cross.",
        },
        {
          id: "1506744038136-46273834b3fb",
          alt: "A shallow river at sunrise between tree-lined cliffs",
          caption: "Camp by the river, the first night.",
        },
      ],
    ],
  },
  {
    title: "Day 2 · Fog, all day",
    note: "We saw about thirty metres of anything.",
    rows: [
      [
        {
          id: "1511884642898-4c92249e20b6",
          alt: "A river running through a steep, misty forested valley",
          caption: "The river we followed down, still in cloud.",
        },
      ],
      ROW_OF_THREE,
    ],
  },
  {
    title: "Day 3 · Over the pass",
    note: "Up at five for this, and worth it.",
    rows: [
      [
        {
          id: "1506905925346-21bda4d32df4",
          alt: "Mountain peaks above a sea of cloud at sunrise",
          caption:
            "Twenty to six, above the cloud we walked through yesterday.",
        },
      ],
      [
        {
          id: "1469474968028-56623f02e42e",
          alt: "A hiker standing on a boulder above a misty valley",
          caption: "Tom, refusing to come down off that rock.",
        },
        {
          id: "1519681393784-d120267933ba",
          alt: "The Milky Way over snowy mountains",
          caption: "The only night clear enough to see anything.",
        },
      ],
    ],
  },
  {
    title: "Day 4 · Lakes",
    note: "Three of them, each a different colour.",
    rows: [
      [
        {
          id: "1501785888041-af3ef285b470",
          alt: "A rowing boat on a turquoise lake under limestone peaks",
          caption: "Rented a boat for an hour and stayed for three.",
        },
      ],
      [
        {
          id: "1476514525535-07fb3b4ae5f1",
          alt: "The wooden bow of a boat pointing across a mountain lake",
          caption: "The view from the front seat.",
        },
        {
          id: "1493246507139-91e8fad9978e",
          alt: "Red peaks reflected in a still lake at dusk",
          caption: "The other end of the valley, at dusk.",
        },
        {
          id: "1439853949127-fa647821eba0",
          alt: "A glacial lake between steep forested mountains",
          caption: "And the next one along, which nobody had told us about.",
        },
      ],
    ],
  },
  {
    title: "Day 5 · The drive south",
    note: "Four hundred kilometres, and one petrol station.",
    rows: [
      [
        {
          id: "1500530855697-b586d89ba3ee",
          alt: "An empty road running between red rock formations",
          caption: "Most of the day looked like this.",
        },
      ],
      [
        {
          id: "1426604966848-d7adac402bff",
          alt: "A granite cliff rising above pine trees and a meadow",
          caption: "Stopped for lunch under the big wall.",
        },
        {
          id: "1500534314209-a25ddb2bd429",
          alt: "Layers of hazy hills fading into the distance",
          caption: "Hills going blue, one behind the other, all afternoon.",
        },
      ],
    ],
  },
  {
    title: "Day 6 · The coast",
    note: "Finally somewhere flat.",
    rows: [
      [
        {
          id: "1504893524553-b855bce32c67",
          alt: "A river winding through a deep, moss-covered canyon",
          caption: "The canyon the river cut on its way out to sea.",
        },
      ],
      [
        {
          id: "1510414842594-a61c69b5ae57",
          alt: "A turquoise cove below a wooded cliff",
          caption: "A beach you can only look at from the cliff.",
        },
        {
          id: "1518837695005-2083093ee35b",
          alt: "A close view of a dark ocean swell",
          caption: "In the water, at last.",
        },
        {
          id: "1465146344425-f00d5f5c8f07",
          alt: "Red poppies in long grass",
          caption: "Poppies along the car park, of all places.",
        },
      ],
    ],
  },
  {
    title: "Day 7 · Home",
    note: "Unpacked, mostly.",
    rows: [
      [
        {
          id: "1470071459604-3b5ec3a7fe05",
          alt: "A green valley with low cloud at sunset",
          caption: "Last evening, from the hill above the house.",
        },
      ],
      [
        {
          id: "1441974231531-c6227db76b6e",
          alt: "A dirt path through a sunlit forest",
          caption: "The walk to the station.",
        },
        {
          id: "1502082553048-f009c37129b9",
          alt: "A single broad tree in a field under a blue sky",
          caption: "The tree at the end of our road, which had not moved.",
        },
      ],
    ],
  },
];
function ImageViewerJournalVersion() {
  return (
    <ScrollView
      contentContainerClassName="gap-8 px-4 pb-16 pt-2"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-1">
        <Text size="2xl" weight="bold">
          A week on foot
        </Text>
        <Text muted>Seven days, twenty-five photographs. Tap any of them.</Text>
      </View>

      <ImageViewer>
        <View className="gap-8">
          {JOURNAL.map((day) => (
            <View key={day.title} className="gap-3">
              <View className="gap-0.5">
                <Text weight="semibold">{day.title}</Text>
                <Text size="sm" muted>
                  {day.note}
                </Text>
              </View>
              <View className="gap-1.5">
                {day.rows.map((row, rowIndex) => (
                  <View key={rowIndex} className="flex-row gap-1.5">
                    {row.map((entry) => (
                      <ImageViewer.Trigger
                        key={entry.id}
                        {...photo(entry.id)}
                        alt={entry.alt}
                        caption={entry.caption}
                        radius={row.length === 1 ? 14 : 8}
                        className={
                          row.length === 1
                            ? "aspect-[16/10] flex-1 rounded-[14px]"
                            : "aspect-square flex-1 rounded-lg"
                        }
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ImageViewer>
    </ScrollView>
  );
}
const SHAPES = [
  {
    label: "A portrait in a square",
    id: "1433086966358-54859d0ed716",
    crop: { width: 900, height: 1400 },
    alt: "A tall waterfall with a stone bridge across it",
    className: "aspect-square w-full rounded-xl",
  },
  {
    label: "A landscape in a portrait",
    id: "1464822759023-fed622ff2c3b",
    crop: { width: 1500, height: 1000 },
    alt: "A wide valley between snowy mountains, pines in the foreground",
    className: "aspect-[3/4] w-full rounded-xl",
  },
];
function ImageViewerShapesVersion() {
  return (
    <ScrollView contentContainerClassName="gap-6 px-4 pb-16 pt-2">
      <Text muted>
        Every thumbnail below crops its photo to a different shape. Open one to
        see the whole picture, then drag it away to watch it crop back down.
      </Text>

      <ImageViewer>
        <View className="gap-6">
          <View className="flex-row gap-3">
            {SHAPES.map((shape) => (
              <View key={shape.id} className="flex-1 gap-2">
                <ImageViewer.Trigger
                  {...photo(shape.id, shape.crop)}
                  width={shape.crop.width}
                  height={shape.crop.height}
                  alt={shape.alt}
                  caption={shape.label}
                  radius={12}
                  className={shape.className}
                />
                <Text size="sm" muted>
                  {shape.label}
                </Text>
              </View>
            ))}
          </View>

          <View className="gap-2">
            <ImageViewer.Trigger
              {...photo("1506905925346-21bda4d32df4", {
                width: 2400,
                height: 800,
              })}
              width={2400}
              height={800}
              alt="Mountain peaks above a sea of cloud at sunrise"
              caption="A panorama in a square"
              radius={12}
              className="aspect-square w-full rounded-xl"
            />
            <Text size="sm" muted>
              A panorama in a square
            </Text>
          </View>

          <View className="gap-2">
            <ImageViewer.Trigger
              {...photo("1519681393784-d120267933ba", {
                width: 1200,
                height: 1200,
              })}
              width={1200}
              height={1200}
              alt="The Milky Way over snowy mountains"
              caption="A square in a strip"
              radius={12}
              className="h-24 w-full rounded-xl"
            />
            <Text size="sm" muted>
              A square in a strip
            </Text>
          </View>
        </View>
      </ImageViewer>
    </ScrollView>
  );
}
function ImageViewerRtlDemo() {
  const [index, setIndex] = useState(0);
  return (
    <View className="w-full gap-4">
      <Text>{`Image ${index + 1} of 3 · swipe right for next`}</Text>
      <ImageViewer dir="rtl" index={index} onIndexChange={setIndex}>
        <View className="flex-row-reverse gap-3">
          {["First", "Second", "Third"].map((label, at) => (
            <ImageViewer.Trigger
              key={label}
              source={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="${["#406e8e", "#8e6b40", "#468e6b"][at]}"/><text x="200" y="155" text-anchor="middle" font-size="32" fill="white">${label}</text></svg>`)}`}
              width={400}
              height={300}
              alt={label}
              caption={label}
              className="h-28 flex-1"
            />
          ))}
        </View>
      </ImageViewer>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "image-viewer",
  name: "ImageViewer",
  summary:
    "An image that opens out of the page over a blur, to zoom into and swipe through",
  demos: [
    { label: "Right to left", id: "rtl", render: () => <ImageViewerRtlDemo /> },
    { label: "One photo", render: () => <ImageViewerSingleDemo /> },
    { label: "Three under one root", render: () => <ImageViewerRowDemo /> },
    {
      label: "Photo journal",
      id: "journal",
      fullPage: true,
      description:
        "A week of photographs in one long scroll. Every one is a page of the same gallery, so swipe across days once a photo is open.",
      render: () => <ImageViewerJournalVersion />,
    },
    {
      label: "Tall and wide",
      id: "shapes",
      fullPage: true,
      description:
        "Portrait, landscape, panorama and square photos in thumbnails of other shapes, each opened out to the whole picture.",
      render: () => <ImageViewerShapesVersion />,
    },
  ],
};
