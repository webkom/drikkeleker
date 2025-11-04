export type Color =
  | "amber"
  | "blue"
  | "red"
  | "green"
  | "fuchsia"
  | "teal"
  | "orange"
  | "violet"
  | "slate"
  | "rose";

export const colorVariants: Record<Color, string> = {
  amber: "bg-amber-500 hover:bg-amber-500/90",
  blue: "bg-blue-500 hover:bg-blue-500/90",
  red: "bg-red-500 hover:bg-red-500/90",
  green: "bg-green-500 hover:bg-green-500/90",
  fuchsia: "bg-fuchsia-500 hover:bg-fuchsia-500/90",
  teal: "bg-teal-500 hover:bg-teal-500/90",
  orange: "bg-orange-500 hover:bg-orange-500/90",
  violet: "bg-violet-500 hover:bg-violet-500/90",
  slate: "bg-slate-500 hover:bg-slate-500/90",
  rose: "bg-rose-500 hover:bg-rose-500/90",
};

export const getColorClasses = (color?: Color, fallback: Color = "violet") =>
  colorVariants[color ?? fallback];
