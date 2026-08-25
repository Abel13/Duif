import { useState } from "react";
import type { Mascot } from "../../game";
import { useTranslation } from "../../i18n";
import { chooseMascotIndividualSkill, resolveSoftLandingMigration } from "../../integrations/supabase/mascotSkills";
import { SketchPanel, StampButton } from "../ui";
import styles from "./MascotSkillNotice.module.css";

export function MascotSkillNotice({ mascot }: { mascot: Mascot }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const state = mascot.skillState;
  const pendingChoice = mascot.level >= 5 && !state?.chosenSkillId;
  const pending = state?.migrationPending || pendingChoice || (mascot.level < 10 && state?.chosenSkillId && !state.freeChangeUsed);
  if (!pending) return null;
  const choices = mascot.skills.filter((skill) => skill.category === "individual");
  async function select(skillId: string) {
    setBusy(true);
    try {
      if (state?.migrationPending) await resolveSoftLandingMigration(mascot.id, skillId as "skill-nuvem-long-route" | "skill-nuvem-postal-memory");
      else await chooseMascotIndividualSkill(mascot.id, skillId);
      window.location.reload();
    } finally { setBusy(false); }
  }
  const options = state?.migrationPending ? mascot.skills.filter((skill) => skill.id === "skill-nuvem-long-route" || skill.id === "skill-nuvem-postal-memory") : choices;
  return <>
    <SketchPanel className={styles.banner} eyebrow={t("mascot.skills")} title={t("mascot.specialTrait")}>
      <p>{t("mascot.skills")}</p><StampButton onClick={() => setOpen(true)}>{t("mascot.chooseMascot")}</StampButton>
    </SketchPanel>
    {open ? <dialog aria-label={t("mascot.skills")} className={styles.dialog} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }} open>
      <section className={styles.paper}><button className={styles.close} onClick={() => setOpen(false)} type="button">×</button><h2>{t("mascot.skills")}</h2>
        <ul>{options.map((skill) => <li key={skill.id}><h3>{t(skill.nameKey)}</h3><p>{t(skill.descriptionKey)}</p><StampButton disabled={busy} onClick={() => void select(skill.id)}>{t("mascot.chooseMascot")}</StampButton></li>)}</ul>
      </section>
    </dialog> : null}
  </>;
}
