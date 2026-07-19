import { Link, Navigate, useParams } from "react-router-dom";
import type { CSSProperties } from "react";

import { MobileTopBar, PageShell } from "../../components/layout";
import { AssetImage, ItemCard, SketchPanel } from "../../components/ui";
import {
  getFriendById,
  getFriendCorrespondence,
  getFriendLocationLabel,
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
    <PageShell hasTopBar>
      <MobileTopBar backLabelKey="navigation.backToFriends" backTo="/friends" title={friend.name} />
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
            </div>
          </div>
        </SketchPanel>

        <div className={styles.grid}>
          <SketchPanel title={t("friends.profileTitle")} variant="note">
            <dl className={styles.summary}>
              <SummaryRow
                label={t("friends.location")}
                value={getFriendLocationLabel(friend.location, t)}
              />
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
    </PageShell>
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
      <AssetImage
        alt={t(mascot.appearance.portraitPlaceholderKey)}
        className={styles.assetFrame}
        height={192}
        assetKey={mascot.appearance.portraitAssetKey}
        style={
          {
            "--friend-primary": mascot.appearance.primaryColor,
            "--friend-accent": mascot.appearance.accentColor,
          } as CSSProperties
        }
        width={192}
      >
        <div
          aria-label={t(mascot.appearance.portraitPlaceholderKey)}
          className={styles.mascotBadge}
          role="img"
        >
          <span />
        </div>
      </AssetImage>
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
