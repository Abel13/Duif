import { useId, useState, type InputHTMLAttributes } from "react";

import { useTranslation } from "../../i18n";
import styles from "./AuthField.module.css";

type AuthFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  error?: string;
  label: string;
};

export function AuthField({ error, label, type = "text", ...inputProps }: AuthFieldProps) {
  const id = useId();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const errorId = error ? `${id}-error` : undefined;

  return (
    <label className={styles.field} htmlFor={id}>
      <span>{label}</span>
      <div className={styles.control}>
        <input
          {...inputProps}
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          id={id}
          type={isPassword && showPassword ? "text" : type}
        />
        {isPassword && (
          <button
            aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
            className={styles.reveal}
            onClick={() => setShowPassword((current) => !current)}
            type="button"
          >
            {showPassword ? t("auth.hide") : t("auth.show")}
          </button>
        )}
      </div>
      {error && <small className={styles.error} id={errorId}>{error}</small>}
    </label>
  );
}
