import type { PrivacySection } from "./privacy";
import { privacySectionsOneToSix } from "./privacy-sections-1";
import { privacySectionsSevenToEleven } from "./privacy-sections-2";

/**
 * The privacy policy, in the order parents read it (spec 012, FR-003).
 *
 * Editing the wording: change privacy-sections-1.ts (sections 1–6) or
 * privacy-sections-2.ts (sections 7–11). Only wording lives there, so the page
 * layout never needs to change. Every sentence must stay true to what the
 * system actually does — specs/012-privacy-policy/research.md D-8 lists where
 * each statement comes from. If the system changes, change the sentence.
 *
 * Approving the policy: once the school has signed off both languages, set
 * PRIVACY_POLICY_APPROVED to true and update PRIVACY_LAST_UPDATED in
 * lib/strings/privacy.ts. That removes the "Draft" notice.
 *
 * Split in two files only to stay under the ~200-line limit (Constitution VIII).
 */
export const privacySections: PrivacySection[] = [...privacySectionsOneToSix, ...privacySectionsSevenToEleven];
