import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaretRight, GearSix } from "@phosphor-icons/react";

import { AppBottomNav, PageShell } from "../../components/layout";
import { AssetImage } from "../../components/ui";
import {
  assetKeys,
  getDeliveryStatus,
  type Mascot,
  type ReceivedLetter,
} from "../../game";
import { useMascotCatalog } from "../../game/useMascotCatalog";
import { useTranslation } from "../../i18n";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import { fetchReceivedLetters } from "../../integrations/supabase/mailbox";
import { formatPostalLocationLabel } from "../../game/locationLabels";
import styles from "./NestHubPage.module.css";

export function NestHubPage() {
  const { profile } = useAuth();
  const { mascots, isLoading: isMascotsLoading } = useMascotCatalog();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [letters, setLetters] = useState<ReceivedLetter[]>([]);

  useEffect(() => {
    void fetchReceivedLetters()
      .then(setLetters)
      .catch(() => setLetters([]));
  }, []);
  const traveling = useMemo(
    () =>
      mascots.filter(
        (mascot) =>
          mascot.currentDelivery &&
          ["preparing", "outbound", "delivered", "returning"].includes(
            getDeliveryStatus(mascot.currentDelivery),
          ),
      ),
    [mascots],
  );
  const atNest = Math.max(0, mascots.length - traveling.length);
  const location = profile
    ? formatPostalLocationLabel({
        city: profile.postal_base_city,
        state: profile.postal_base_state,
        country: profile.postal_base_country,
      })
    : t("common.unavailable");
  const name = profile?.display_name || t("common.unavailable");

  return (
    <PageShell hasBottomNav>
      <main className={styles.shell}>
        <header className={styles.header}>
          <div
            className={styles.currencyRow}
            aria-label={t("nestHub.currencySummary")}
          >
            <Currency
              assetKey={assetKeys.currency.stamp}
              label={t("nestHub.stamps")}
            />
            <Currency
              assetKey={assetKeys.currency.crystal}
              label={t("nestHub.crystals")}
            />
            <span
              className={styles.settings}
              aria-label={t("nestHub.settingsSoon")}
              title={t("nestHub.settingsSoon")}
            >
              <GearSix aria-hidden="true" size={20} weight="duotone" />
            </span>
          </div>
          <div className={styles.identity}>
            <AssetImage
              alt={t("nestHub.defaultAvatar")}
              assetKey={assetKeys.profile.defaultSilhouette}
              className={styles.avatar}
              loading="eager"
            >
              <span aria-hidden="true" />
            </AssetImage>
            <div>
              <p className={styles.eyebrow}>{t("nestHub.eyebrow")}</p>
              <h1>{name}</h1>
              <p className={styles.tagline}>
                {t("nestHub.nestOf")} {name}
              </p>
            </div>
            <dl className={styles.identityDetails}>
              <div>
                <dt>{t("nestHub.profileName")}</dt>
                <dd>{name}</dd>
              </div>
              <div>
                <dt>{t("nestHub.nestName")}</dt>
                <dd>
                  {t("nestHub.nestOf")} {name}
                </dd>
              </div>
              <div>
                <dt>{t("nestHub.location")}</dt>
                <dd>{location}</dd>
              </div>
            </dl>
            <div className={styles.level}>
              <strong>{t("nestHub.levelZero")}</strong>
              <span>{t("nestHub.xpZero")}</span>
            </div>
          </div>
        </header>
        <section className={styles.cards} aria-label={t("nestHub.sections")}>
          <HubCard
            assetKey={assetKeys.nest.profileNook}
            badge={undefined}
            description={t("nestHub.profileDescription")}
            title={t("nestHub.profileTitle")}
            onClick={() => navigate("/profile")}
          />
          <HubCard
            assetKey={assetKeys.nest.mascotRoost}
            badge={
              isMascotsLoading
                ? t("common.loading")
                : `${atNest} ${t("nestHub.atNest")} · ${traveling.length} ${t("nestHub.traveling")}`
            }
            description={t("nestHub.mascotDescription")}
            title={t("nestHub.mascotTitle")}
            onClick={() => navigate("/mascots")}
          />
          <HubCard
            assetKey={assetKeys.nest.mailbox}
            badge={
              letters.length
                ? `${letters.length} ${t("nestHub.newCorrespondence")}`
                : undefined
            }
            description={t("nestHub.mailboxDescription")}
            title={t("nestHub.mailboxTitle")}
            onClick={() => navigate("/mailbox")}
          />
        </section>
        {traveling.length ? (
          <section className={styles.travelSection}>
            <h2>{t("nestHub.travelingTitle")}</h2>
            <div className={styles.travelList}>
              {traveling.map((mascot) => (
                <TravelRow
                  key={mascot.id}
                  mascot={mascot}
                  onClick={() => navigate(`/map?mascotId=${mascot.id}`)}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className={styles.emptyTravel}>
            <h2>{t("nestHub.noTravelTitle")}</h2>
            <p>{t("nestHub.noTravelDescription")}</p>
          </section>
        )}
      </main>
      <AppBottomNav />
    </PageShell>
  );
}

function Currency({ assetKey, label }: { assetKey: string; label: string }) {
  return (
    <span className={styles.currency}>
      <AssetImage alt="" assetKey={assetKey} loading="eager">
        <span />
      </AssetImage>
      <strong>0</strong>
      <small>{label}</small>
    </span>
  );
}
function HubCard({
  assetKey,
  badge,
  description,
  onClick,
  title,
}: {
  assetKey: string;
  badge?: string;
  description: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button className={styles.hubCard} type="button" onClick={onClick}>
      <AssetImage
        alt=""
        assetKey={assetKey}
        className={styles.cardArt}
        loading="lazy"
      >
        <span className={styles.artFallback} />
      </AssetImage>
      <span className={styles.cardContent}>
        <strong>{title}</strong>
        <span>{description}</span>
        {badge ? <em>{badge}</em> : null}
      </span>
      <CaretRight
        className={styles.arrow}
        aria-hidden="true"
        size={30}
        weight="bold"
      />
    </button>
  );
}
function TravelRow({
  mascot,
  onClick,
}: {
  mascot: Mascot;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button className={styles.travelRow} type="button" onClick={onClick}>
      <AssetImage
        alt=""
        assetKey={mascot.appearance.portraitAssetKey}
        className={styles.travelPortrait}
      >
        <span />
      </AssetImage>
      <span>
        <strong>{mascot.name}</strong>
        <small>
          {t(`delivery.status.${getDeliveryStatus(mascot.currentDelivery!)}`)}
        </small>
      </span>
      <CaretRight aria-hidden="true" size={24} weight="bold" />
    </button>
  );
}
