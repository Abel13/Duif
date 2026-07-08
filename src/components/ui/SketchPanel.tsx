import type { ReactNode } from "react";

import styles from "./SketchPanel.module.css";

type SketchPanelVariant = "default" | "note" | "map";

export type SketchPanelProps = {
  children: ReactNode;
  title?: string;
  eyebrow?: string;
  variant?: SketchPanelVariant;
  className?: string;
};

export function SketchPanel({
  children,
  title,
  eyebrow,
  variant = "default",
  className,
}: SketchPanelProps) {
  const classNames = [styles.panel, styles[variant], className].filter(Boolean).join(" ");

  return (
    <section className={classNames}>
      {(eyebrow || title) && (
        <header className={styles.header}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          {title && <h2 className={styles.title}>{title}</h2>}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
