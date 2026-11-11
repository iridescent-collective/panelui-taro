import { View } from "@tarojs/components";
import { Combobox } from "panelui-taro/combobox";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const SUBJECTS = ["Mathematics", "Language", "Music", "Science"];
export const ComboboxShowcase = () => {
  const [single, setSingle] = useState<string>();
  const [multiple, setMultiple] = useState<string[]>(["Music"]);
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography id="panel-combobox-result">
        {JSON.stringify({ multiple, single })}
      </Typography>
      <Combobox
        value={single}
        onValueChange={setSingle}
        clearable
        openOnFocus
        accessibilityLabel="Subject"
        placeholder="Choose a subject"
      >
        <Combobox.Group label="Subjects">
          {SUBJECTS.map((label) => (
            <Combobox.Item
              key={label}
              value={label}
              label={label}
              description={`Study ${label.toLowerCase()}`}
            />
          ))}
          <Combobox.Item value="disabled" label="Unavailable" disabled />
        </Combobox.Group>
      </Combobox>
      <Combobox
        mode="multiple"
        value={multiple}
        onValueChange={setMultiple}
        presentation="inline"
        allowCustomValue
        clearable
        placeholder="Choose or create subjects"
        accessibilityLabel="Subjects"
      >
        <Combobox.Group label="Subjects">
          {SUBJECTS.map((label) => (
            <Combobox.Item key={label} value={label} label={label} />
          ))}
        </Combobox.Group>
      </Combobox>
    </View>
  );
};
