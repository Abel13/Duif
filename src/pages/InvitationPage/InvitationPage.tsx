import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../../components/layout";
import { SketchPanel, StampButton } from "../../components/ui";
import { resolveReferralInvitation, referralTokenStorageKey } from "../../integrations/supabase/referrals";
import { useTranslation } from "../../i18n";
import styles from "./InvitationPage.module.css";

export function InvitationPage() {
  const { token = "" } = useParams(); const navigate = useNavigate(); const { t } = useTranslation();
  const [state, setState] = useState<{ loading: boolean; name: string }>({ loading: true, name: "" });
  useEffect(() => { let active = true; void resolveReferralInvitation(token).then((result) => {
    if (active) setState({ loading: false, name: result.valid ? result.inviterName : "" });
  }).catch(() => active && setState({ loading: false, name: "" })); return () => { active = false; }; }, [token]);
  function accept() { window.sessionStorage.setItem(referralTokenStorageKey, token); navigate("/auth?mode=signup"); }
  const title = state.loading ? t("common.loading") : state.name ? t("referrals.invitationTitle").replace("{name}", state.name) : t("referrals.invalidInvitationTitle");
  return <PageShell><main className={styles.page}><SketchPanel eyebrow={t("referrals.invitationEyebrow")} title={title} variant="note">
    <p className={styles.description}>{state.loading ? t("referrals.invitationLoading") : state.name ? t("referrals.invitationDescription") : t("referrals.invalidInvitationDescription")}</p>
    {state.name ? <StampButton onClick={accept}>{t("referrals.acceptInvitation")}</StampButton> : <StampButton onClick={() => navigate("/auth?mode=signup")} variant="secondary">{t("auth.signUp")}</StampButton>}
  </SketchPanel></main></PageShell>;
}
