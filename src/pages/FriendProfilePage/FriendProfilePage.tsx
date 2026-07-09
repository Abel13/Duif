import { Link, Navigate, useParams } from "react-router-dom";
import type { CSSProperties } from "react";

import { ItemCard, SketchPanel } from "../../components/ui";
import {
  getFriendById,
  getFriendCorrespondence,
  getFriendMascots,
  type FriendMascotPreview,
  type ReceivedCorrespondencePreview,
} from "../../game";
import { useTranslation } from "../../i18n";
import styles from "./FriendProfilePage.module.css";

export function FriendProfilePage() {
  const { t } = useTranslation();
  const { friendId } = useParams();
  const friend = friendId ? getFriendById(friendId) : undefined;

  if (!friend) {
    return <Navigate replace to="/friends" />;
  }

  const mascots = getFriendMascots(friend.id);
  const correspondence = getFriendCorrespondence(friend.id);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <SketchPanel eyebrow={t("friends.eyebrow")} title={friend.name}>
          <div className={styles.hero}>
            <p className={styles.subtitle}>
              {friend.favoriteNoteKey ? t(friend.favoriteNoteKey) : t("friends.profileTitle")}
            </p>
            <div className={styles.actions}>
              <Link className={styles.primaryLink} to={`/send?friendId=${friend.id}`}>
                {t("friends.sendToFriend")}
              </Link>
              <Link className={styles.secondaryLink} to="/friends">
                {t("friends.backToFriends")}
              </Link>
            </div>
          </div>
        </SketchPanel>

        <div className={styles.grid}>
          <SketchPanel title={t("friends.profileTitle")} variant="note">
            <dl className={styles.summary}>
              <SummaryRow label={t("friends.location")} value={t(friend.location.labelKey)} />
              <SummaryRow
                label={t("friends.friendshipLevel")}
                value={`${friend.friendshipLevel}`}
              />
              <SummaryRow label={t("friends.exchangeCount")} value={`${friend.exchangeCount}`} />
            </dl>
          </SketchPanel>

          <SketchPanel title={t("friends.friendMascots")}>
            <div className={styles.cardGrid}>
              {mascots.map((mascot) => (
                <FriendMascotCard key={mascot.id} mascot={mascot} />
              ))}
            </div>
          </SketchPanel>

          <SketchPanel title={t("friends.receivedCorrespondence")} variant="map">
            {correspondence.length > 0 ? (
              <div className={styles.cardGrid}>
                {correspondence.map((item) => (
                  <CorrespondenceCard item={item} key={item.id} />
                ))}
              </div>
            ) : (
              <p className={styles.empty}>{t("friends.noCorrespondence")}</p>
            )}
          </SketchPanel>
        </div>
      </div>
    </main>
  );
}

function FriendMascotCard({ mascot }: { mascot: FriendMascotPreview }) {
  const { t } = useTranslation();

  return (
    <ItemCard
      label={t("friends.mascotLabel")}
      title={mascot.name}
      description={t(mascot.speciesKey)}
      meta={`${t("mascot.level")} ${mascot.level}`}
    >
      <div
        className={styles.mascotBadge}
        style={
          {
            "--friend-primary": mascot.appearance.primaryColor,
            "--friend-accent": mascot.appearance.accentColor,
        } as CSSProperties
        }
        aria-label={t(mascot.appearance.portraitPlaceholderKey)}
        role="img"
      >
        <span />
      </div>
    </ItemCard>
  );
}

function CorrespondenceCard({ item }: { item: ReceivedCorrespondencePreview }) {
  const { t } = useTranslation();

  return (
    <ItemCard
      label={t(`correspondence.${item.type}.name`)}
      title={t(item.titleKey)}
      description={t(item.descriptionKey)}
      meta={item.fromName}
    />
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
