import styles from "./lead-details.module.css";

/**
 * A round badge with the parent's initials — Urdu or English — so rows are
 * easy to scan. A lead with no confirmed name gets a neutral "?".
 */
export function LeadAvatar({ name, large = false }: { name: string | null; large?: boolean }) {
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => Array.from(word)[0] ?? "")
        .join("")
        .toUpperCase()
    : "?";
  return (
    <span
      className={`${styles.avatar} ${name ? "" : styles.avatarEmpty} ${large ? styles.avatarLarge : ""}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
