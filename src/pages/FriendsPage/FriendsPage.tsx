import { Link } from "react-router-dom";

import { ItemCard, SketchPanel } from "../../components/ui";
import { mockFriends } from "../../game";
import { useTranslation } from "../../i18n";
import styles from "./FriendsPage.module.css";

export function FriendsPage() {
  const { t } = useTranslation();

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <SketchPanel eyebrow={t("friends.eyebrow")} title={t("friends.title")}>
          <p className={styles.subtitle}>{t("friends.subtitle")}</p>
        </SketchPanel>

        <section className={styles.grid} aria-label={t("friends.title")}>
          {mockFriends.map((friend) => (
            <article className={styles.friendCard} key={friend.id}>
              <ItemCard
                label={t(friend.location.labelKey)}
                title={friend.name}
                description={friend.favoriteNoteKey ? t(friend.favoriteNoteKey) : undefined}
                meta={`${t("friends.friendshipLevel")} ${friend.friendshipLevel}`}
              >
                <div className={styles.postmark} aria-hidden="true">
                  {friend.name.slice(0, 1)}
                </div>
              </ItemCard>
              <dl className={styles.stats}>
                <div>
                  <dt>{t("friends.exchangeCount")}</dt>
                  <dd>{friend.exchangeCount}</dd>
                </div>
                <div>
                  <dt>{t("friends.friendMascots")}</dt>
                  <dd>{friend.mascotIds.length}</dd>
                </div>
              </dl>
              <div className={styles.actions}>
                <Link className={styles.primaryLink} to={`/friends/${friend.id}`}>
                  {t("friends.viewProfile")}
                </Link>
                <Link className={styles.secondaryLink} to={`/send?friendId=${friend.id}`}>
                  {t("friends.quickSend")}
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
