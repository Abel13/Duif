import type { Skill } from "../../game";
import { useTranslation } from "../../i18n";
import styles from "./MascotSkillsPanel.module.css";

type MascotSkillsPanelProps = {
  skills: Skill[];
};

export function MascotSkillsPanel({ skills }: MascotSkillsPanelProps) {
  const { t } = useTranslation();

  return (
    <ul className={styles.list}>
      {skills.map((skill) => (
        <li className={styles.skill} key={skill.id}>
          <span className={styles.name}>{t(skill.nameKey)}</span>
          <span className={styles.level}>
            {t("mascot.level")} {skill.level}
          </span>
          <p>{t(skill.descriptionKey)}</p>
        </li>
      ))}
    </ul>
  );
}
