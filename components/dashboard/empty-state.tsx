import ui from "./ui.module.css";

/**
 * The designed card shown instead of data. "empty" explains what will appear;
 * "error" says the read failed. Icon and words both carry the meaning, not
 * colour alone.
 */
export function EmptyState({
  title,
  body,
  tone = "empty",
  children,
}: {
  title: string;
  body?: string;
  tone?: "empty" | "error";
  children?: React.ReactNode;
}) {
  const isError = tone === "error";
  return (
    <div className={`${ui.empty} ${isError ? ui.emptyError : ""}`} role={isError ? "alert" : undefined}>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        {isError ? (
          <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        ) : (
          <>
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="M3 10h18M8 15h5" />
          </>
        )}
      </svg>
      <p className={ui.emptyTitle}>{title}</p>
      {body && <p>{body}</p>}
      {children}
    </div>
  );
}
