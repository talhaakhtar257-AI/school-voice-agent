import ui from "@/components/dashboard/ui.module.css";

/**
 * One look for every Add and Remove button in the content editor, so they match
 * the dashboard's green buttons instead of the browser's default grey ones.
 */
export const addButton = `${ui.btn} ${ui.btnSmall} ${ui.btnPrimary}`;
export const removeButton = `${ui.btn} ${ui.btnSmall} ${ui.btnSoft}`;
export const confirmButton = `${ui.btn} ${ui.btnPrimary}`;
export const cancelButton = `${ui.btn} ${ui.btnGhost}`;

// Buttons sit in column layouts; without this they stretch to full width.
export const fitContent = { alignSelf: "flex-start" } as const;
