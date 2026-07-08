import { Navigate, Route, Routes } from "react-router-dom";

import { useTranslation } from "../i18n";

function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="app-shell" aria-labelledby="home-title">
      <section className="starter-page">
        <img
          className="starter-page__icon"
          src="/assets/icons/icon.png"
          alt={t("home.iconAlt")}
          width="128"
          height="128"
        />
        <p className="starter-page__eyebrow">{t("home.eyebrow")}</p>
        <h1 id="home-title">{t("home.title")}</h1>
        <p className="starter-page__subtitle">{t("home.subtitle")}</p>
        <div className="starter-page__note" aria-label={t("home.noteLabel")}>
          <span>{t("home.noteTitle")}</span>
          <p>{t("home.noteBody")}</p>
        </div>
      </section>
    </main>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
