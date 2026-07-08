import { ItemCard, PaperTab, SketchPanel, StampButton } from "../components/ui";
import { useTranslation } from "../i18n";
import styles from "./HomePage.module.css";

export function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="app-shell">
      <div className={styles.page}>
        <img
          className={styles.icon}
          src="/assets/icons/icon.png"
          alt={t("home.iconAlt")}
          width="128"
          height="128"
        />

        <SketchPanel eyebrow={t("home.eyebrow")} title={t("home.title")}>
          <p className={styles.subtitle}>{t("home.subtitle")}</p>

          <div className={styles.actions} aria-label={t("home.demo.actionsLabel")}>
            <StampButton>{t("home.demo.primaryAction")}</StampButton>
            <StampButton variant="secondary">{t("home.demo.secondaryAction")}</StampButton>
          </div>
        </SketchPanel>

        <nav className={styles.tabs} aria-label={t("home.demo.tabsLabel")}>
          <PaperTab active>{t("navigation.nest")}</PaperTab>
          <PaperTab>{t("navigation.letters")}</PaperTab>
          <PaperTab>{t("navigation.friends")}</PaperTab>
        </nav>

        <section className={styles.cards} aria-label={t("home.demo.cardsLabel")}>
          <ItemCard
            description={t("home.demo.firstCardDescription")}
            label={t("home.demo.firstCardLabel")}
            meta={t("home.demo.firstCardMeta")}
            selected
            title={t("home.demo.firstCardTitle")}
          />
          <ItemCard
            description={t("home.demo.secondCardDescription")}
            label={t("home.demo.secondCardLabel")}
            meta={t("home.demo.secondCardMeta")}
            title={t("home.demo.secondCardTitle")}
          />
        </section>
      </div>
    </main>
  );
}
