import { describe, expect, it } from "vitest";

import {
  clearStoredReferralInvitation,
  getStoredReferralInvitation,
  referralInvitationLifetimeMs,
  referralTokenStorageKey,
  storeReferralInvitation,
} from "./referrals";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

describe("referral invitation storage", () => {
  const token = "signed-referral-token-that-is-long-enough-for-storage";

  it("keeps an accepted invitation for seven days", () => {
    const local = memoryStorage();
    const session = memoryStorage();
    storeReferralInvitation(token, local, 1_000);
    expect(getStoredReferralInvitation(local, session, 1_000 + referralInvitationLifetimeMs - 1)).toBe(token);
    expect(getStoredReferralInvitation(local, session, 1_000 + referralInvitationLifetimeMs)).toBeNull();
  });

  it("migrates the legacy session token into expiring local storage", () => {
    const local = memoryStorage();
    const session = memoryStorage({ [referralTokenStorageKey]: token });
    expect(getStoredReferralInvitation(local, session, 5_000)).toBe(token);
    expect(session.getItem(referralTokenStorageKey)).toBeNull();
    expect(getStoredReferralInvitation(local, session, 5_001)).toBe(token);
  });

  it("clears both current and legacy storage", () => {
    const local = memoryStorage({ [referralTokenStorageKey]: token });
    const session = memoryStorage({ [referralTokenStorageKey]: token });
    clearStoredReferralInvitation(local, session);
    expect(local.getItem(referralTokenStorageKey)).toBeNull();
    expect(session.getItem(referralTokenStorageKey)).toBeNull();
  });
});
