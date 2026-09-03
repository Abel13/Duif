import { Link, Navigate, useParams } from "react-router-dom";

import { FriendshipProgress } from "../../components/friends/FriendshipProgress";
import { MobileTopBar, PageShell } from "../../components/layout";
import { SketchPanel } from "../../components/ui";
import { formatPostalLocationLabel } from "../../game";
import { useTranslation } from "../../i18n";
import { usePostalFriends } from "../../integrations/supabase/usePostalFriends";
import styles from "./FriendProfilePage.module.css";

export function FriendProfilePage() {
  const { t } = useTranslation();
  const { friendId } = useParams();
  const { connections, isLoading } = usePostalFriends(false);
  const friend = friendId
    ? connections.accepted.find((entry) => entry.profileId === friendId)
    : undefined;

  if (isLoading) {
    return (
      <PageShell hasTopBar>
        <MobileTopBar backLabelKey="navigation.backToFriends" backTo="/friends" title={t("friends.profileTitle")} />
        <div className={styles.shell}>
          <SketchPanel eyebrow={t("friends.eyebrow")} title={t("friends.profileTitle")}>
            <p className={styles.subtitle}>{t("friends.profileTitle")}</p>
          </SketchPanel>
        </div>
      </PageShell>
    );
  }

  if (!friend) {
    return <Navigate replace to="/friends" />;
  }

  const locationLabel = formatPostalLocationLabel(friend) || t("common.unavailable");

  return (
    <PageShell hasTopBar>
      <MobileTopBar backLabelKey="navigation.backToFriends" backTo="/friends" title={friend.displayName} />
      <div className={styles.shell}>
        <SketchPanel eyebrow={t("friends.eyebrow")} title={friend.displayName}>
          <div className={styles.hero}>
            <p className={styles.subtitle}>{t("friends.profileTitle")}</p>
            <div className={styles.actions}>
              <Link className={styles.primaryLink} to={`/send?friendId=${friend.profileId}`}>
                {t("friends.sendToFriend")}
              </Link>
            </div>
          </div>
        </SketchPanel>

        <div className={styles.grid}>
          <SketchPanel title={t("friends.profileTitle")} variant="note">
            <dl className={styles.summary}>
              <SummaryRow label={t("friends.location")} value={locationLabel} />
              <SummaryRow label={t("friends.exchangeCount")} value={`${friend.exchangeCount}`} />
            </dl>
            <div className={styles.progressBlock}>
              <FriendshipProgress exchangeCount={friend.exchangeCount} variant="full" />
            </div>
          </SketchPanel>

          <SketchPanel title={t("friends.friendMascots")}>
            <p className={styles.empty}>{t("friends.noMascots")}</p>
          </SketchPanel>

          <SketchPanel title={t("friends.receivedCorrespondence")} variant="map">
            <p className={styles.empty}>{t("friends.noCorrespondence")}</p>
          </SketchPanel>
        </div>
      </div>
    </PageShell>
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
