import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { FileUpload } from "panelui-taro/file-upload";
import type { FileUploadFile } from "panelui-taro/file-upload";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

import { QUEUE_FIXTURE, UPLOAD_LIMIT } from "../../constant";
import { useFixtureUpload } from "../../use-fixture-upload";
import { QueueActions } from "../QueueActions";

export const QueueDemo = () => {
  const [files, setFiles] = useState<FileUploadFile[]>([]);
  const [events, setEvents] = useState("No picker events");
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const fixture = useFixtureUpload();
  const active = files.some(
    (file) =>
      file.status === "uploading" ||
      file.status === "processing" ||
      file.status === "queued"
  );
  return (
    <View className="flex flex-col gap-[16px]">
      <Typography type="h6">Claim documents · list and queue</Typography>
      <Typography type="body-sm" muted>
        Fixture controls simulate a consumer upload handler. They do not send
        files to a server. Choose files uses the real WeChat picker.
      </Typography>
      <View className="flex flex-row flex-wrap gap-[12px]">
        <Button
          size="sm"
          variant="outline"
          disabled={active}
          onPress={() => setFiles(QUEUE_FIXTURE.map((file) => ({ ...file })))}
        >
          Load queue fixture
        </Button>
        <Button
          size="sm"
          variant="outline"
          onPress={() => setDisabled((value) => !value)}
        >
          {disabled ? "Enable uploads" : "Disable uploads"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onPress={() => setInvalid((value) => !value)}
        >
          {invalid ? "Clear invalid state" : "Show invalid state"}
        </Button>
      </View>
      <FileUpload
        value={files}
        onValueChange={setFiles}
        sources={["camera", "library", "files"]}
        accept={["application/pdf", "image/*"]}
        multiple
        maxFiles={6}
        maxSize={UPLOAD_LIMIT}
        upload={fixture.upload}
        concurrency={2}
        autoUpload={false}
        disabled={disabled}
        invalid={invalid}
        validate={(file) =>
          file.name.startsWith("draft") ? "Drafts cannot be submitted." : null
        }
        onReject={(rejections) =>
          setEvents(
            JSON.stringify(
              rejections.map(({ reason, message }) => ({ message, reason }))
            )
          )
        }
        onError={(error) => setEvents(`Picker error: ${error.message}`)}
        onUploadComplete={(file) => setEvents(`Uploaded ${file.name}`)}
      >
        <FileUpload.Dropzone title="Add documents or photos" />
        <FileUpload.List />
        <QueueActions />
      </FileUpload>
      <View className="flex flex-row flex-wrap gap-[12px]">
        <Button size="sm" variant="outline" onPress={fixture.progress}>
          Report 50%
        </Button>
        <Button size="sm" variant="outline" onPress={fixture.process}>
          Process uploads
        </Button>
        <Button size="sm" variant="outline" onPress={fixture.fail}>
          Fail uploads
        </Button>
        <Button size="sm" variant="outline" onPress={fixture.complete}>
          Complete uploads
        </Button>
      </View>
      <Typography type="body-sm" id="panel-file-upload-events">
        {events}
      </Typography>
    </View>
  );
};
