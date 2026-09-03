import { NavLink, Outlet } from "react-router-dom";

import { useTranslation } from "../../i18n";
import styles from "./AdminLayout.module.css";

const links = [
  { to: "/admin", end: true, labelKey: "adminPanel.nav.hub" as const },
  { to: "/admin/assets", end: false, labelKey: "adminPanel.nav.assets" as const },
  { to: "/admin/geonames", end: false, labelKey: "adminPanel.nav.geonames" as const },
  { to: "/admin/encounters", end: false, labelKey: "adminPanel.nav.encounters" as const },
];

export function AdminLayout() {
  const { t } = useTranslation();
  return (
    <div className={styles.shell}>
      <header className={styles.top}>
        <div>
          <span>{t("adminPanel.eyebrow")}</span>
          <p className={styles.brand}>{t("adminPanel.title")}</p>
        </div>
        <nav aria-label={t("adminPanel.navLabel")} className={styles.nav}>
          {links.map((link) => (
            <NavLink
              className={({ isActive }) => (isActive ? styles.active : undefined)}
              end={link.end}
              key={link.to}
              to={link.to}
            >
              {t(link.labelKey)}
            </NavLink>
          ))}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
