import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { AppBottomNav, PageShell } from "../../components/layout";
import { ItemCard, SketchPanel, StampButton } from "../../components/ui";
import { useTranslation } from "../../i18n";
import { formatPostalLocationLabel } from "../../game";
import { regeneratePostalFriendCode, requestPostalFriendship, respondToPostalFriendRequest } from "../../integrations/supabase/postalFriends";
import { usePostalFriends } from "../../integrations/supabase/usePostalFriends";
import { claimReferralOwl, getMyReferralInvitation } from "../../integrations/supabase/referrals";
import { useReferrals } from "../../integrations/supabase/useReferrals";
import styles from "./FriendsPage.module.css";

export function FriendsPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { code, connections, isLoading, refresh, setCode } = usePostalFriends();
  const { progress: referralProgress, isLoading: referralsLoading, refresh: refreshReferrals } = useReferrals();
  const [submittedCode, setSubmittedCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [firstFriendId, setFirstFriendId] = useState<string>();
  const [connectionMode, setConnectionMode] = useState<"use" | "mine" | "invite">("use");
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");
  const [owlName, setOwlName] = useState("");
  const connectionTitleRef = useRef<HTMLHeadingElement>(null);
  const hasFriends = connections.accepted.length > 0;

  useEffect(() => {
    if (searchParams.get("mode") === "invite") setConnectionMode("invite");
  }, [searchParams]);

  async function copyCode() {
    if (!code) return;
    await navigator.clipboard?.writeText(code.code);
    setMessage(t("friends.copiedCode"));
  }
  async function shareCode() {
    if (!code) return;
    if (navigator.share) await navigator.share({ text: code.code, title: t("friends.postalCodeTitle") });
    else await copyCode();
  }
  async function rotateCode() {
    if (!window.confirm(t("friends.regenerateConfirm"))) return;
    setBusy(true); try { setCode(await regeneratePostalFriendCode()); setMessage(""); } catch { setMessage(t("friends.requestUnavailable")); } finally { setBusy(false); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!submittedCode.trim()) return;
    setBusy(true); try {
      const outcome = await requestPostalFriendship(submittedCode);
      const key = outcome === "sent" ? "friends.requestSent" : outcome === "alreadyPending" ? "friends.requestAlreadyPending" : outcome === "alreadyFriends" ? "friends.requestAlreadyFriends" : outcome === "receivedPending" ? "friends.requestReceivedPending" : "friends.requestUnavailable";
      setMessage(t(key)); setSubmittedCode(""); await refresh();
    } catch { setMessage(t("friends.requestUnavailable")); } finally { setBusy(false); }
  }
  async function respond(id: string, accept: boolean) {
    setBusy(true); try { const result = await respondToPostalFriendRequest(id, accept); await refresh(); if (result.accepted && !hasFriends) setFirstFriendId(result.profileId); } catch { setMessage(t("friends.requestUnavailable")); } finally { setBusy(false); }
  }
  async function prepareInvitation(rotate = false) {
    setBusy(true); try {
      const token = await getMyReferralInvitation(rotate);
      const link = `${window.location.origin}/invite/${token}`;
      setInvitationLink(link); await refreshReferrals(); return link;
    } catch { setMessage(t("referrals.unavailable")); } finally { setBusy(false); }
  }
  async function copyInvitation() { const link = invitationLink || await prepareInvitation(); if (link) { await navigator.clipboard?.writeText(link); setMessage(t("referrals.copied")); } }
  async function shareInvitation() { const link = invitationLink || await prepareInvitation(); if (link && navigator.share) await navigator.share({ title: t("referrals.title"), text: link }); else if (link) await copyInvitation(); }
  async function claimOwl() { if (!owlName.trim()) return; setBusy(true); try { await claimReferralOwl(owlName); setOwlName(""); await refreshReferrals(); } catch { setMessage(t("referrals.claimError")); } finally { setBusy(false); } }
  function selectConnectionMode(mode: "use" | "mine" | "invite") {
    setConnectionMode(mode);
    requestAnimationFrame(() => connectionTitleRef.current?.focus());
  }

  return <PageShell hasBottomNav>
    <div className={styles.shell}>
      {firstFriendId ? <SketchPanel title={t("friends.firstFriendTitle")}><p className={styles.subtitle}>{t("friends.firstFriendDescription")}</p><Link className={styles.primaryLink} to={`/send?friendId=${firstFriendId}`}>{t("friends.prepareFirstLetter")}</Link></SketchPanel> : null}
      <SketchPanel title={t("friends.connectTitle")}>
        <div className={styles.segmented} aria-label={t("friends.connectTitle")}><button aria-pressed={connectionMode === "use"} onClick={() => selectConnectionMode("use")} type="button">{t("friends.useCode")}</button><button aria-pressed={connectionMode === "mine"} onClick={() => selectConnectionMode("mine")} type="button">{t("friends.myCode")}</button><button aria-pressed={connectionMode === "invite"} onClick={() => selectConnectionMode("invite")} type="button">{t("referrals.tab")}</button></div>
        {connectionMode === "use" ? <section className={styles.connectionContent}><h2 ref={connectionTitleRef} tabIndex={-1}>{t("friends.addCodeTitle")}</h2><p className={styles.subtitle}>{t("friends.addCodeDescription")}</p><form className={styles.codeForm} onSubmit={(event) => void submit(event)}><label>{t("friends.codeLabel")}<input autoCapitalize="characters" autoComplete="off" maxLength={12} onChange={(event) => setSubmittedCode(event.target.value.toUpperCase())} value={submittedCode} /></label><StampButton disabled={busy || !submittedCode.trim()} type="submit">{t("friends.sendRequest")}</StampButton></form></section> : connectionMode === "mine" ? <section className={styles.connectionContent}><h2 ref={connectionTitleRef} tabIndex={-1}>{t("friends.postalCodeTitle")}</h2><p className={styles.subtitle}>{t("friends.postalCodeDescription")}</p>{isCodeVisible ? <><output className={styles.code}>{isLoading ? "········" : code?.code}</output><div className={styles.actions}><StampButton disabled={!code || busy} onClick={() => void copyCode()}>{t("friends.copyCode")}</StampButton><StampButton disabled={!code || busy} onClick={() => void shareCode()} variant="secondary">{t("friends.shareCode")}</StampButton></div><button className={styles.textAction} disabled={!code || busy} onClick={() => void rotateCode()} type="button">{t("friends.regenerateCode")}</button></> : <StampButton disabled={!code || isLoading} onClick={() => setIsCodeVisible(true)} variant="secondary">{t("friends.showCode")}</StampButton>}</section> : <section className={styles.connectionContent}><h2 ref={connectionTitleRef} tabIndex={-1}>{t("referrals.title")}</h2><p className={styles.subtitle}>{t("referrals.description")}</p><p>{t("referrals.progress").replace("{current}", String(referralProgress.qualifiedCount)).replace("{target}", String(referralProgress.targetCount))}</p>{invitationLink ? <output className={styles.code}>{invitationLink}</output> : <StampButton disabled={busy || referralsLoading} onClick={() => void prepareInvitation()}>{t("referrals.share")}</StampButton>}<div className={styles.actions}>{invitationLink ? <><StampButton disabled={busy} onClick={() => void copyInvitation()}>{t("referrals.copy")}</StampButton><StampButton disabled={busy} onClick={() => void shareInvitation()} variant="secondary">{t("referrals.share")}</StampButton><button className={styles.textAction} disabled={busy} onClick={() => { if (window.confirm(t("referrals.regenerateConfirm"))) void prepareInvitation(true); }} type="button">{t("referrals.regenerate")}</button></> : null}</div>{referralProgress.owlStatus === "pending" ? <form className={styles.codeForm} onSubmit={(event) => { event.preventDefault(); void claimOwl(); }}><h3>{t("referrals.pendingTitle")}</h3><p>{t("referrals.pendingDescription")}</p><label>{t("referrals.owlName")}<input maxLength={24} onChange={(event) => setOwlName(event.target.value)} value={owlName} /></label><StampButton disabled={busy || !owlName.trim()} type="submit">{t("referrals.claimOwl")}</StampButton></form> : referralProgress.owlStatus === "claimed" ? <p>{t("referrals.claimed")}</p> : null}</section>}
        {message ? <p className={styles.message} role="status">{message}</p> : null}
      </SketchPanel>
      {connections.incoming.length > 0 ? <RequestSection busy={busy} onRespond={respond} title={t("friends.requestsReceived")} empty={t("friends.noRequests")} accept={t("friends.acceptRequest")} decline={t("friends.declineRequest")} requests={connections.incoming} /> : null}
      {connections.outgoing.length > 0 ? <RequestSection busy={busy} title={t("friends.requestsSent")} empty={t("friends.noRequests")} requests={connections.outgoing} /> : null}
      {hasFriends ? <section className={styles.grid} aria-label={t("friends.title")}>{connections.accepted.map((friend) => <article className={styles.friendCard} key={friend.id}><ItemCard label={formatPostalLocationLabel(friend)} title={friend.displayName} meta={`${t("friends.friendshipLevel")} ${friend.friendshipLevel}`} /><dl className={styles.stats}><div><dt>{t("friends.exchangeCount")}</dt><dd>{friend.exchangeCount}</dd></div></dl><div className={styles.actions}><Link className={styles.primaryLink} to={`/send?friendId=${friend.profileId}`}>{t("friends.quickSend")}</Link></div></article>)}</section> : null}
    </div><AppBottomNav />
  </PageShell>;
}

function RequestSection({ title, empty, requests, accept, decline, onRespond, busy }: { title: string; empty: string; requests: { id: string; displayName: string }[]; accept?: string; decline?: string; onRespond?: (id: string, accept: boolean) => Promise<void>; busy: boolean }) {
  return <SketchPanel title={title}>{requests.length === 0 ? <p className={styles.subtitle}>{empty}</p> : <ul className={styles.requests}>{requests.map((request) => <li key={request.id}><strong>{request.displayName}</strong>{onRespond ? <span><StampButton disabled={busy} onClick={() => void onRespond(request.id, true)}>{accept}</StampButton><StampButton disabled={busy} onClick={() => void onRespond(request.id, false)} variant="secondary">{decline}</StampButton></span> : null}</li>)}</ul>}</SketchPanel>;
}
