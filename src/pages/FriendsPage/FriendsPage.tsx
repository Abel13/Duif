import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { AppBottomNav, PageShell } from "../../components/layout";
import { ItemCard, SketchPanel, StampButton } from "../../components/ui";
import { useTranslation } from "../../i18n";
import { regeneratePostalFriendCode, requestPostalFriendship, respondToPostalFriendRequest } from "../../integrations/supabase/postalFriends";
import { usePostalFriends } from "../../integrations/supabase/usePostalFriends";
import styles from "./FriendsPage.module.css";

export function FriendsPage() {
  const { t } = useTranslation();
  const { code, connections, isLoading, refresh, setCode } = usePostalFriends();
  const [submittedCode, setSubmittedCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [firstFriendId, setFirstFriendId] = useState<string>();
  const [connectionMode, setConnectionMode] = useState<"use" | "mine">("use");
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const connectionTitleRef = useRef<HTMLHeadingElement>(null);
  const hasFriends = connections.accepted.length > 0;

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
  function selectConnectionMode(mode: "use" | "mine") {
    setConnectionMode(mode);
    requestAnimationFrame(() => connectionTitleRef.current?.focus());
  }

  return <PageShell hasBottomNav>
    <div className={styles.shell}>
      {firstFriendId ? <SketchPanel title={t("friends.firstFriendTitle")}><p className={styles.subtitle}>{t("friends.firstFriendDescription")}</p><Link className={styles.primaryLink} to={`/send?friendId=${firstFriendId}`}>{t("friends.prepareFirstLetter")}</Link></SketchPanel> : <SketchPanel title={t("friends.connectTitle")}>
        <div className={styles.segmented} aria-label={t("friends.connectTitle")}><button aria-pressed={connectionMode === "use"} onClick={() => selectConnectionMode("use")} type="button">{t("friends.useCode")}</button><button aria-pressed={connectionMode === "mine"} onClick={() => selectConnectionMode("mine")} type="button">{t("friends.myCode")}</button></div>
        {connectionMode === "use" ? <section className={styles.connectionContent}><h2 ref={connectionTitleRef} tabIndex={-1}>{t("friends.addCodeTitle")}</h2><p className={styles.subtitle}>{t("friends.addCodeDescription")}</p><form className={styles.codeForm} onSubmit={(event) => void submit(event)}><label>{t("friends.codeLabel")}<input autoCapitalize="characters" autoComplete="off" maxLength={12} onChange={(event) => setSubmittedCode(event.target.value.toUpperCase())} value={submittedCode} /></label><StampButton disabled={busy || !submittedCode.trim()} type="submit">{t("friends.sendRequest")}</StampButton></form></section> : <section className={styles.connectionContent}><h2 ref={connectionTitleRef} tabIndex={-1}>{t("friends.postalCodeTitle")}</h2><p className={styles.subtitle}>{t("friends.postalCodeDescription")}</p>{isCodeVisible ? <><output className={styles.code}>{isLoading ? "········" : code?.code}</output><div className={styles.actions}><StampButton disabled={!code || busy} onClick={() => void copyCode()}>{t("friends.copyCode")}</StampButton><StampButton disabled={!code || busy} onClick={() => void shareCode()} variant="secondary">{t("friends.shareCode")}</StampButton></div><button className={styles.textAction} disabled={!code || busy} onClick={() => void rotateCode()} type="button">{t("friends.regenerateCode")}</button></> : <StampButton disabled={!code || isLoading} onClick={() => setIsCodeVisible(true)} variant="secondary">{t("friends.showCode")}</StampButton>}</section>}
        {message ? <p className={styles.message} role="status">{message}</p> : null}
      </SketchPanel>}
      {connections.incoming.length > 0 ? <RequestSection busy={busy} onRespond={respond} title={t("friends.requestsReceived")} empty={t("friends.noRequests")} accept={t("friends.acceptRequest")} decline={t("friends.declineRequest")} requests={connections.incoming} /> : null}
      {connections.outgoing.length > 0 ? <RequestSection busy={busy} title={t("friends.requestsSent")} empty={t("friends.noRequests")} requests={connections.outgoing} /> : null}
      {hasFriends ? <section className={styles.grid} aria-label={t("friends.title")}>{connections.accepted.map((friend) => <article className={styles.friendCard} key={friend.id}><ItemCard label={[friend.city, friend.state, friend.country].filter(Boolean).join(", ")} title={friend.displayName} meta={`${t("friends.friendshipLevel")} ${friend.friendshipLevel}`} /><dl className={styles.stats}><div><dt>{t("friends.exchangeCount")}</dt><dd>{friend.exchangeCount}</dd></div></dl><div className={styles.actions}><Link className={styles.primaryLink} to={`/send?friendId=${friend.profileId}`}>{t("friends.quickSend")}</Link></div></article>)}</section> : null}
    </div><AppBottomNav />
  </PageShell>;
}

function RequestSection({ title, empty, requests, accept, decline, onRespond, busy }: { title: string; empty: string; requests: { id: string; displayName: string }[]; accept?: string; decline?: string; onRespond?: (id: string, accept: boolean) => Promise<void>; busy: boolean }) {
  return <SketchPanel title={title}>{requests.length === 0 ? <p className={styles.subtitle}>{empty}</p> : <ul className={styles.requests}>{requests.map((request) => <li key={request.id}><strong>{request.displayName}</strong>{onRespond ? <span><StampButton disabled={busy} onClick={() => void onRespond(request.id, true)}>{accept}</StampButton><StampButton disabled={busy} onClick={() => void onRespond(request.id, false)} variant="secondary">{decline}</StampButton></span> : null}</li>)}</ul>}</SketchPanel>;
}
