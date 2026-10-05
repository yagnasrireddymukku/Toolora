import type { ToolDefinition } from "@/lib/tools/types";
import { EDUCATION_TOOLS } from "./education/definitions";

/** Add each new tool group here, and register its component in ./components.ts. */
export const TOOL_DEFINITIONS: ToolDefinition[] = [...EDUCATION_TOOLS];
