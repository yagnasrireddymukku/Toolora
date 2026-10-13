/**
 * Visual identity per category. Class names are written out in full so Tailwind can see them.
 * Every tile pairs a dark text colour with a light tint (contrast well above 4.5:1).
 */
export interface CategoryStyle {
  tile: string;
  chip: string;
  bar: string;
}

const STYLES: Record<string, CategoryStyle> = {
  education: {
    tile: "bg-sky-100 text-sky-900",
    chip: "bg-sky-100 text-sky-900",
    bar: "bg-sky-500",
  },
  career: {
    tile: "bg-violet-100 text-violet-900",
    chip: "bg-violet-100 text-violet-900",
    bar: "bg-violet-500",
  },
  salary: {
    tile: "bg-amber-100 text-amber-900",
    chip: "bg-amber-100 text-amber-900",
    bar: "bg-amber-500",
  },
  developer: {
    tile: "bg-emerald-100 text-emerald-900",
    chip: "bg-emerald-100 text-emerald-900",
    bar: "bg-emerald-500",
  },
  utility: {
    tile: "bg-fuchsia-100 text-fuchsia-900",
    chip: "bg-fuchsia-100 text-fuchsia-900",
    bar: "bg-fuchsia-500",
  },
};

const FALLBACK: CategoryStyle = {
  tile: "bg-brand-100 text-brand-900",
  chip: "bg-brand-100 text-brand-900",
  bar: "bg-brand-600",
};

export function categoryStyle(id: string): CategoryStyle {
  return STYLES[id] ?? FALLBACK;
}
