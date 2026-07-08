import type { ReactNode } from "react";

import styles from "./ItemCard.module.css";

export type ItemCardProps = {
  title: string;
  label?: string;
  description?: string;
  meta?: string;
  selected?: boolean;
  children?: ReactNode;
  className?: string;
};

export function ItemCard({
  title,
  label,
  description,
  meta,
  selected = false,
  children,
  className,
}: ItemCardProps) {
  const classNames = [styles.card, selected ? styles.selected : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classNames} data-selected={selected || undefined}>
      {label && <p className={styles.label}>{label}</p>}
      <div className={styles.visual}>{children}</div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
        {meta && <p className={styles.meta}>{meta}</p>}
      </div>
    </article>
  );
}
