import type { ButtonHTMLAttributes } from "react";

import styles from "./PaperTab.module.css";

export type PaperTabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function PaperTab({
  children,
  active = false,
  className,
  type = "button",
  ...buttonProps
}: PaperTabProps) {
  const classNames = [styles.tab, active ? styles.active : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      aria-pressed={active}
      className={classNames}
      type={type}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
