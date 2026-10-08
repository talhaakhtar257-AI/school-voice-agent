/**
 * Constitution VI: CNIC and B-Form numbers are never stored. The agent is told
 * never to collect one, but a parent may read one out anyway and Retell will
 * transcribe it. Both have the 13-digit shape 12345-1234567-1, with or without
 * dashes or spaces. A Pakistani phone number has 11 digits, so it is untouched.
 *
 * In an Urdu conversation Retell can write the number in Urdu (۰–۹) or Arabic
 * (٠–٩) digits, which a plain \d does not match. The privacy policy promises a
 * spoken ID number is hidden, so every digit form counts (feature 012, D-7).
 */
const DIGIT = "[0-9۰-۹٠-٩]";
const ID_NUMBER = new RegExp(`(?<!${DIGIT})${DIGIT}{5}[-\\s]?${DIGIT}{7}[-\\s]?${DIGIT}(?!${DIGIT})`, "g");
const ANY_DIGIT = new RegExp(DIGIT, "g");

export function maskIdNumbers(text: string): string {
  return text.replace(ID_NUMBER, (match) => match.replace(ANY_DIGIT, "*"));
}

export type Turn = { role: "agent" | "user"; content: string };

export function maskTranscript(turns: Turn[]): Turn[] {
  return turns.map((turn) => ({ ...turn, content: maskIdNumbers(turn.content) }));
}
