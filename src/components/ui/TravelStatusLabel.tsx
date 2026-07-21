import styles from "./TravelStatusLabel.module.css";

export type TravelStatusLabelProps = {
  mascotName: string;
  statusLabel: string;
  className?: string;
};

export function TravelStatusLabel({ mascotName, statusLabel, className }: TravelStatusLabelProps) {
  return (
    <p className={[styles.label, className].filter(Boolean).join(" ")} role="status">
      <strong>{mascotName}</strong>
      <span>{statusLabel}</span>
    </p>
  );
}
