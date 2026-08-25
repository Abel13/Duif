import type { Skill } from "../../game";
import { useTranslation } from "../../i18n";
import styles from "./MascotSkillsPanel.module.css";

type MascotSkillsPanelProps = {
  skills: Skill[];
};

export function getVisibleMascotSkills(skills: Skill[]) {
  return skills.filter((skill) => skill.category !== "individual" || skill.isSelected === true);
}

export function MascotSkillsPanel({ skills }: MascotSkillsPanelProps) {
  const { t } = useTranslation();
  const visibleSkills = getVisibleMascotSkills(skills);

  return (
    <ul className={styles.list}>
      {visibleSkills.map((skill) => (
        <li className={styles.skill} key={skill.id}>
          <span className={styles.name}>{t(skill.nameKey)}</span>
          <span className={styles.level}>
            {t("mascot.level")} {skill.level}
          </span>
          {skill.category ? <span className={styles.category}>{t(skill.category === "fixed" ? "skills.fixed" : "skills.individual")}</span> : null}
          <p>{t(skill.descriptionKey)}</p>
          {skill.xp !== undefined && skill.nextLevelXp !== undefined ? <p className={styles.progress}>{skill.xp} / {skill.nextLevelXp} XP</p> : null}
        </li>
      ))}
    </ul>
  );
}
