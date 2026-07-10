import type { ReactNode } from "react";

import styles from "./PageShell.module.css";

export type PageShellProps = {
  children: ReactNode;
  className?: string;
  hasBottomNav?: boolean;
  hasTopBar?: boolean;
};

export function PageShell({
  children,
  className,
  hasBottomNav = false,
  hasTopBar = false,
}: PageShellProps) {
  const classNames = [styles.page, className].filter(Boolean).join(" ");

  return (
    <main
      className={classNames}
      data-has-bottom-nav={hasBottomNav || undefined}
      data-has-top-bar={hasTopBar || undefined}
    >
      {children}
    </main>
  );
}
