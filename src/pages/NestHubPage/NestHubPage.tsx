import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaretRight, CoffeeBean, GearSix, SketchLogo, X } from "@phosphor-icons/react";

import { AppBottomNav, PageShell } from "../../components/layout";
import { MascotPrestigeMedallion } from "../../components/mascot/MascotPrestigeMedallion";
import { AssetImage, PushNotificationSettings, StampButton } from "../../components/ui";
import {
  assetKeys,
  getDeliveryStatus,
  type Mascot,
  type ReceivedCorrespondence,
} from "../../game";
import { useMascotCatalog } from "../../game/useMascotCatalog";
import { useProfileProgression } from "../../game/useProfileProgression";
import { useTranslation } from "../../i18n";
import { useAuth } from "../../integrations/supabase/AuthProvider";
import { fetchReceivedCorrespondence } from "../../integrations/supabase/mailbox";
import {
  enablePushNotifications,
  fetchPushPreferences,
  isPushOptInAvailable,
} from "../../integrations/supabase/pushNotifications";
import { formatPostalLocationLabel } from "../../game/locationLabels";
import styles from "./NestHubPage.module.css";

const pushPromptStorageKey = "duif.push.optInDismissed";

export function NestHubPage() {
  const { profile } = useAuth();
  const { mascots, isLoading: isMascotsLoading } = useMascotCatalog();
  const progression = useProfileProgression();
  const { locale, t } = useTranslation();
  const navigate = useNavigate();
  const [letters, setLetters] = useState<ReceivedCorrespondence[]>([]);
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    void fetchReceivedCorrespondence()
      .then(setLetters)
      .catch(() => setLetters([]));
  }, []);

  useEffect(() => {
    if (!isPushOptInAvailable()) return;
    if (window.sessionStorage.getItem(pushPromptStorageKey) === "1") return;
    let active = true;
    void fetchPushPreferences()
      .then((prefs) => {
        if (active && !prefs.enabled) setShowPushPrompt(true);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
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

  async function acceptPushPrompt() {
    setPushBusy(true);
    try {
      await enablePushNotifications(locale);
      window.sessionStorage.setItem(pushPromptStorageKey, "1");
      setShowPushPrompt(false);
    } catch {
      setShowPushPrompt(false);
      setSettingsOpen(true);
    } finally {
      setPushBusy(false);
    }
  }

  function dismissPushPrompt() {
    window.sessionStorage.setItem(pushPromptStorageKey, "1");
    setShowPushPrompt(false);
  }

  return (
    <PageShell hasBottomNav>
      <main className={styles.shell}>
        <header className={styles.header}>
          <div
            className={styles.currencyRow}
            aria-label={t("nestHub.currencySummary")}
          >
            <Currency currency="seeds" label={t("nestHub.seeds")} value={progression.isLoading ? "..." : progression.seeds} />
            <Currency currency="crystals" label={t("nestHub.crystals")} value="0" />
            <button
              aria-label={t("nestHub.settings")}
              className={styles.settings}
              onClick={() => setSettingsOpen(true)}
              title={t("nestHub.settings")}
              type="button"
            >
              <GearSix aria-hidden="true" size={20} weight="duotone" />
            </button>
          </div>
          {showPushPrompt ? (
            <section className={styles.pushPrompt} aria-label={t("profile.push.title")}>
              <p>{t("profile.push.description")}</p>
              <div className={styles.pushPromptActions}>
                <StampButton disabled={pushBusy} onClick={() => void acceptPushPrompt()} type="button">
                  {t("profile.push.enable")}
                </StampButton>
                <button className={styles.pushPromptDismiss} onClick={dismissPushPrompt} type="button">
                  {t("profile.push.later")}
                </button>
              </div>
            </section>
          ) : null}
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
              <strong>{progression.isLoading ? "..." : `${t("mascot.level")} ${progression.level}`}</strong>
              <span>{progression.isLoading ? "..." : `${progression.xp.toLocaleString()} XP`}</span>
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
            assetKey={assetKeys.nest.availableJobs}
            description={t("postalJobs.description")}
            title={t("postalJobs.title")}
            onClick={() => navigate("/jobs")}
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
      {settingsOpen ? <NestSettingsDialog onClose={() => setSettingsOpen(false)} /> : null}
    </PageShell>
  );
}

function NestSettingsDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (!element.open) element.showModal();
    return () => {
      if (element.open) element.close();
    };
  }, []);

  return (
    <dialog
      aria-labelledby={titleId}
      className={styles.settingsDialog}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      ref={dialog}
    >
      <div className={styles.settingsDialogBody}>
        <header className={styles.settingsDialogHeader}>
          <h2 id={titleId}>{t("nestHub.settings")}</h2>
          <button
            aria-label={t("nestHub.closeSettings")}
            className={styles.settingsClose}
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={22} weight="bold" />
          </button>
        </header>
        <PushNotificationSettings />
      </div>
    </dialog>
  );
}

function Currency({ currency, label, value }: { currency: "seeds" | "crystals"; label: string; value: string | number }) {
  const Icon = currency === "seeds" ? CoffeeBean : SketchLogo;
  return (
    <span className={styles.currency} data-currency={currency}>
      <Icon aria-hidden="true" size={23} weight="duotone" />
      <strong>{typeof value === "number" ? value.toLocaleString() : value}</strong>
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
      <MascotPrestigeMedallion
        alt=""
        borderAssetKey={mascot.flightState?.borders.find((border) => border.selected)?.assetKey}
        className={styles.travelPortrait}
        portraitAssetKey={mascot.appearance.portraitAssetKey}
        size="small"
      />
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
