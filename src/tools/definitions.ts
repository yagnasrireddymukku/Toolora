import type { ToolDefinition } from "@/lib/tools/types";
import { CAREER_TOOLS } from "./career/definitions";
import { DEVELOPER_TOOLS } from "./developer/definitions";
import { EDUCATION_TOOLS } from "./education/definitions";
import { SALARY_TOOLS } from "./salary/definitions";
import { UTILITY_TOOLS } from "./utility/definitions";

/** Add each new tool group here, and register its component in ./components.ts. */
export const TOOL_DEFINITIONS: ToolDefinition[] = [
  ...EDUCATION_TOOLS,
  ...CAREER_TOOLS,
  ...SALARY_TOOLS,
  ...DEVELOPER_TOOLS,
  ...UTILITY_TOOLS,
];
