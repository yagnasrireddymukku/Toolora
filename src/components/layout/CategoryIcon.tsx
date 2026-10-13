import {
  BriefcaseIcon,
  CapIcon,
  CodeIcon,
  CoinsIcon,
  GridIcon,
  SparkIcon,
} from "@/components/ui/icons";
import { categoryStyle } from "@/lib/tools/categoryStyle";

const ICONS = {
  education: CapIcon,
  career: BriefcaseIcon,
  salary: CoinsIcon,
  developer: CodeIcon,
  utility: GridIcon,
} as const;

/** Decorative coloured icon tile for a category (always aria-hidden: the name is next to it). */
export function CategoryIcon({
  id,
  size = "md",
}: {
  id: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = ICONS[id as keyof typeof ICONS] ?? SparkIcon;
  const box =
    size === "lg"
      ? "size-14 rounded-2xl"
      : size === "sm"
        ? "size-8 rounded-lg"
        : "size-11 rounded-xl";
  const icon = size === "lg" ? "size-7" : size === "sm" ? "size-4" : "size-5";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center ${box} ${categoryStyle(id).tile}`}
    >
      <Icon className={icon} />
    </span>
  );
}
