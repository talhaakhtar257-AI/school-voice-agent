/**
 * Constitution VI: CNIC and B-Form numbers are never stored. The agent is told
 * never to collect one, but a parent may read one out anyway and Retell will
 * transcribe it. Both have the 13-digit shape 12345-1234567-1, with or without
 * dashes or spaces. A Pakistani phone number has 11 digits, so it is untouched.
 */
const ID_NUMBER = /(?<!\d)\d{5}[-\s]?\d{7}[-\s]?\d(?!\d)/g;

export function maskIdNumbers(text: string): string {
  return text.replace(ID_NUMBER, (match) => match.replace(/\d/g, "*"));
}

export type Turn = { role: "agent" | "user"; content: string };

export function maskTranscript(turns: Turn[]): Turn[] {
  return turns.map((turn) => ({ ...turn, content: maskIdNumbers(turn.content) }));
}
