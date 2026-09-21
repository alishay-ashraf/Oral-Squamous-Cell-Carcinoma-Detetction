import { HTMLAttributes } from "react";
import { cx } from "@/lib/utils";

export default function Panel({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "bg-panel/80 backdrop-blur-sm border border-line rounded-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
