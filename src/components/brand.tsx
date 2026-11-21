// tinig labs logo family (see BRAND.md). The marks are the approved files in public/brand, shown
// as <img> so they are never redrawn, and so their internal mask ids can't clash on one page.

type MarkName = "corpus" | "tinig-labs" | "notebook";
type MarkVersion = "primary" | "reversed" | "mono-ink" | "mono-white";

export const markSrc = (name: MarkName, version: MarkVersion = "primary") =>
  `/brand/${name}-mark${version === "primary" ? "" : `-${version}`}.svg`;

/** A mark on its own. Decorative by default: pair it with text, or pass `alt`. */
export function Mark({
  name = "corpus",
  version = "primary",
  size = 32,
  alt = "",
  className = "",
}: {
  name?: MarkName;
  version?: MarkVersion;
  size?: number;
  alt?: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG from /public; no optimisation needed
    <img
      src={markSrc(name, version)}
      width={size}
      height={size}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={`block shrink-0 ${className}`}
      draggable={false}
    />
  );
}

/** The brand name inside running text: Montserrat 600, always lowercase. */
export function Brand({ children = "tinig labs" }: { children?: string }) {
  return <span className="font-brand text-[0.94em] font-semibold tracking-[-0.02em]">{children}</span>;
}

/**
 * The speech corpus lockup: Banig weave, "tinig labs" in Montserrat 600, "speech corpus" in Figtree 500 (abo).
 * Proportions from the guide: mark ≈ 1.75× the wordmark size, gap ≈ 0.55×, product name ≈ 0.75×.
 * md is the site header (32 / 18 / 10 px). On phones it steps down to 28 / 16 / 9 px so it fits beside the header action.
 */
export function Wordmark({ size = "md" }: { size?: "md" | "sm" }) {
  const md = size === "md";
  return (
    <span className={`flex items-center ${md ? "gap-[9px] sm:gap-2.5" : "gap-[9px]"}`}>
      <Mark name="corpus" size={32} className={md ? "size-7 sm:size-8" : "size-7"} />
      <span className="flex items-baseline gap-[0.4em] whitespace-nowrap">
        <span className={`font-brand font-semibold tracking-[-0.02em] text-text ${md ? "text-base sm:text-lg" : "text-base"}`}>
          tinig labs
        </span>
        <span className={`font-medium text-muted ${md ? "text-xs sm:text-[0.8125rem]" : "text-xs"}`}>speech corpus</span>
      </span>
    </span>
  );
}

/** The parent lab: Echo t and the plain wordmark. Used wherever the app points back to tinig labs itself. */
export function LabWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <Mark name="tinig-labs" size={24} className="size-6" />
      <span className="whitespace-nowrap font-brand text-sm font-semibold tracking-[-0.02em] text-text">tinig labs</span>
    </span>
  );
}

/**
 * Any lockup at any size, from the guide's proportions: mark 1.75× the wordmark size, gap 0.55×,
 * product name 0.75× in Figtree 500. `tone="reversed"` is for pandan or tinta grounds only.
 */
export function Lockup({
  name,
  product,
  fontSize = 18,
  tone = "primary",
}: {
  name: MarkName;
  product?: string;
  fontSize?: number;
  tone?: "primary" | "reversed";
}) {
  const rev = tone === "reversed";
  return (
    <span className="inline-flex items-center" style={{ gap: Math.round(fontSize * 0.55) }}>
      <Mark name={name} version={rev ? "reversed" : "primary"} size={Math.round(fontSize * 1.75)} />
      <span className="flex items-baseline whitespace-nowrap" style={{ gap: "0.4em" }}>
        <span
          className={`font-brand font-semibold tracking-[-0.02em] ${rev ? "text-[var(--gatas)]" : "text-text"}`}
          style={{ fontSize, lineHeight: 1.2 }}
        >
          tinig labs
        </span>
        {product && (
          <span className={`font-medium ${rev ? "text-[var(--mint)]" : "text-muted"}`} style={{ fontSize: Math.round(fontSize * 0.75 * 10) / 10 }}>
            {product}
          </span>
        )}
      </span>
    </span>
  );
}
