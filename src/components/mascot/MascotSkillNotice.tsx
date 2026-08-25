import { useEffect, useRef, useState } from "react";
import type { Mascot } from "../../game";
import { useTranslation } from "../../i18n";
import { chooseMascotIndividualSkill, resolveRetiredUrbanStartTransfer, resolveRetiredWaterPathTransfer, resolveSoftLandingMigration } from "../../integrations/supabase/mascotSkills";
import { StampButton } from "../ui";
import styles from "./MascotSkillNotice.module.css";

export function MascotSkillNotice({ mascot }: { mascot: Mascot }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);
  const state = mascot.skillState;
  const pendingChoice = mascot.level >= 5 && !state?.chosenSkillId;
  const pending = state?.migrationPending || state?.pendingTransfer || pendingChoice || (mascot.level < 10 && state?.chosenSkillId && !state.freeChangeUsed);
  if (!pending) return null;
  const choices = mascot.skills.filter((skill) => skill.category === "individual");
  async function select(skillId: string) {
    setBusy(true);
    try {
      if (state?.pendingTransfer?.kind === "urbanStartRetired") await resolveRetiredUrbanStartTransfer(mascot.id, skillId as "skill-trovao-solar-wing" | "skill-trovao-aerodynamic-load");
      else if (state?.pendingTransfer?.kind === "waterPathRetired") await resolveRetiredWaterPathTransfer(mascot.id, skillId as "skill-pipoca-waterproof-feathers" | "skill-pipoca-first-trip");
      else if (state?.migrationPending) await resolveSoftLandingMigration(mascot.id, skillId as "skill-nuvem-long-route" | "skill-nuvem-postal-memory");
      else await chooseMascotIndividualSkill(mascot.id, skillId);
      window.location.reload();
    } finally { setBusy(false); }
  }
  const options = state?.pendingTransfer
    ? choices.filter((skill) => state.pendingTransfer?.targets.some((target) => target.skillId === skill.id))
    : state?.migrationPending
    ? mascot.skills.filter((skill) => skill.id === "skill-nuvem-long-route" || skill.id === "skill-nuvem-postal-memory")
    : choices.filter((skill) => skill.id !== state?.chosenSkillId);

  function closeDialog() {
    dialogRef.current?.close();
    setOpen(false);
  }

  return <>
    <section className={styles.banner} aria-labelledby={`skill-notice-${mascot.id}`}>
      <h3 id={`skill-notice-${mascot.id}`}>{t("mascot.skillNotice.title")}</h3>
      <p>{t(state?.pendingTransfer?.kind === "waterPathRetired" ? "mascot.skillNotice.waterPathRetiredDescription" : state?.pendingTransfer ? "mascot.skillNotice.retiredDescription" : "mascot.skillNotice.description")}</p>
      <StampButton onClick={() => setOpen(true)}>{t("mascot.skillNotice.open")}</StampButton>
    </section>
    {open ? <dialog ref={dialogRef} aria-labelledby={`skill-dialog-${mascot.id}`} className={styles.dialog}
      onCancel={(event) => { event.preventDefault(); closeDialog(); }}
      onClick={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
      <section className={styles.paper}><button aria-label={t("mascot.skillNotice.close")} autoFocus className={styles.close} onClick={closeDialog} type="button">×</button><h2 id={`skill-dialog-${mascot.id}`}>{t("mascot.skillNotice.dialogTitle")}</h2>
        <ul>{options.map((skill) => {const projection=state?.pendingTransfer?.targets.find((target)=>target.skillId===skill.id);return <li key={skill.id}><h3>{t(skill.nameKey)}</h3><p>{t(skill.descriptionKey)}</p>{projection?<p>{t("mascot.skillNotice.transferPreview")} {t("mascot.level")} {projection.level} · {projection.xp} / {projection.nextLevelXp} XP</p>:null}<StampButton disabled={busy} onClick={() => void select(skill.id)}>{t(state?.pendingTransfer ? "mascot.skillNotice.transfer" : "mascot.skillNotice.choose")}</StampButton></li>})}</ul>
      </section>
    </dialog> : null}
  </>;
}
