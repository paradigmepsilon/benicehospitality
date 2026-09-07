import type { NurtureSequence, NurtureSequenceKey } from "./types";
import { rrrWelcome } from "./sequences/rrr-welcome";
import { rrrBook } from "./sequences/rrr-book";
import { crrEbook } from "./sequences/crr-ebook";
import { crrCalculator } from "./sequences/crr-calculator";
import { crrWaitlist } from "./sequences/crr-waitlist";
import { mgmtApplicant } from "./sequences/mgmt-applicant";
import { estimateCar } from "./sequences/estimate-car";
import { estimateRooms } from "./sequences/estimate-rooms";

const SEQUENCES: Record<NurtureSequenceKey, NurtureSequence> = {
  rrr_welcome: rrrWelcome,
  rrr_book: rrrBook,
  crr_ebook: crrEbook,
  crr_calculator: crrCalculator,
  crr_waitlist: crrWaitlist,
  mgmt_applicant: mgmtApplicant,
  estimate_car: estimateCar,
  estimate_rooms: estimateRooms,
};

export function getSequence(key: NurtureSequenceKey): NurtureSequence {
  const seq = SEQUENCES[key];
  if (!seq) throw new Error(`[nurture] unknown sequence: ${key}`);
  return seq;
}

export function allSequences(): NurtureSequence[] {
  return Object.values(SEQUENCES);
}
