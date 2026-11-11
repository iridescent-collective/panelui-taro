import {
  AlertTriangleIcon,
  CheckCircleIcon,
  CircleIcon,
  SearchIcon,
} from "../../icons";
import { useThemeToken } from "../../theme/use-theme";
import type { TaskStatus } from "./types";

export const TaskStatusIcon = ({ status }: { status: TaskStatus }) => {
  const muted = useThemeToken("muted-foreground");
  const success = useThemeToken("success");
  const destructive = useThemeToken("destructive");
  switch (status) {
    case "pending": {
      return <CircleIcon size={16} color={muted} />;
    }
    case "error": {
      return <AlertTriangleIcon size={16} color={destructive} />;
    }
    case "complete": {
      return <CheckCircleIcon size={16} color={success} />;
    }
    default: {
      return <SearchIcon size={16} color={muted} />;
    }
  }
};
