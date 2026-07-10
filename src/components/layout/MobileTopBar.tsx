import { Link } from "react-router-dom";

import { useTranslation, type TranslationKey } from "../../i18n";
import styles from "./MobileTopBar.module.css";

export type MobileTopBarProps = {
  backLabelKey?: TranslationKey;
  backTo: string;
  title: string;
};

export function MobileTopBar({
  backLabelKey = "navigation.back",
  backTo,
  title,
}: MobileTopBarProps) {
  const { t } = useTranslation();

  return (
    <header className={styles.bar}>
      <Link className={styles.backLink} to={backTo} aria-label={t(backLabelKey)}>
        <span aria-hidden="true" />
        {t(backLabelKey)}
      </Link>
      <strong>{title}</strong>
    </header>
  );
}
