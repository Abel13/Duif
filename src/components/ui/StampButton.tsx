import type { ButtonHTMLAttributes } from "react";

import styles from "./StampButton.module.css";

type StampButtonVariant = "primary" | "secondary";

export type StampButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: StampButtonVariant;
};

export function StampButton({
  children,
  variant = "primary",
  className,
  type = "button",
  ...buttonProps
}: StampButtonProps) {
  const classNames = [styles.button, styles[variant], className].filter(Boolean).join(" ");

  return (
    <button className={classNames} type={type} {...buttonProps}>
      {children}
    </button>
  );
}
