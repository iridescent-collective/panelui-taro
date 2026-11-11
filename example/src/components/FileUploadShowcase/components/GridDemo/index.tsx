import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { FileUpload } from "panelui-taro/file-upload";
import type { FileUploadFile } from "panelui-taro/file-upload";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

import { GRID_FIXTURE } from "../../constant";
import { useFixtureUpload } from "../../use-fixture-upload";
import { GridActions } from "../GridActions";

export const GridDemo = () => {
  const [files, setFiles] = useState<FileUploadFile[]>([]);
  const [horizontal, setHorizontal] = useState(false);
  const [event, setEvent] = useState("");
  const fixture = useFixtureUpload();
  const active = files.some(
    (file) =>
      file.status === "uploading" ||
      file.status === "processing" ||
      file.status === "queued"
  );
  return (
    <View id="panel-file-upload-grid" className="flex flex-col gap-[16px]">
      <Typography type="h6">Listing photos · cover and placeholders</Typography>
      <View className="flex flex-row flex-wrap gap-[12px]">
        <Button
          size="sm"
          variant="outline"
          disabled={active}
          onPress={() =>
            setFiles(GRID_FIXTURE.map((file) => ({ ...file, status: "idle" })))
          }
        >
          Load grid fixture
        </Button>
        <Button
          size="sm"
          variant="outline"
          onPress={() => setHorizontal((value) => !value)}
        >
          {horizontal ? "Grid layout" : "Horizontal grid"}
        </Button>
      </View>
      <FileUpload
        value={files}
        onValueChange={setFiles}
        sources={["camera", "library"]}
        accept={["image/*"]}
        upload={fixture.upload}
        autoUpload={false}
        concurrency={2}
        onUploadComplete={(file) => setEvent(`Uploaded ${file.name}`)}
        multiple
        maxFiles={8}
        image={{ maxWidth: 1600, quality: 0.85 }}
        onError={(error) => setEvent(error.message)}
        onReject={(rejected) =>
          setEvent(rejected.map(({ message }) => message).join(" · "))
        }
      >
        <FileUpload.Grid
          columns={3}
          cover
          placeholders
          horizontal={horizontal}
        />
        <GridActions />
      </FileUpload>
      <View className="flex flex-row flex-wrap gap-[12px]">
        <Button size="sm" variant="outline" onPress={fixture.progress}>
          Grid report 50%
        </Button>
        <Button size="sm" variant="outline" onPress={fixture.process}>
          Grid process uploads
        </Button>
        <Button size="sm" variant="outline" onPress={fixture.fail}>
          Grid fail uploads
        </Button>
        <Button size="sm" variant="outline" onPress={fixture.complete}>
          Grid complete uploads
        </Button>
      </View>
      <Typography type="body-sm" id="panel-file-upload-grid-events">
        {event}
      </Typography>
    </View>
  );
};
