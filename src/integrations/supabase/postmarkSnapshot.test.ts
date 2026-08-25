import { describe, expect, it } from "vitest";

import { mapAuthoritativePostmark } from "./postmarkSnapshot";

describe("authoritative postmark snapshots", () => {
  it("maps the persisted civil-date context", () => {
    expect(mapAuthoritativePostmark({city:"Nova Friburgo",country:"BR",date:"2026-08-24",dateSource:"origin-local-v1",model:"wing",color:"blue",stampedAt:"2026-08-25T02:30:00Z",timeZone:"America/Sao_Paulo"})).toEqual({
      city:"Nova Friburgo",country:"BR",date:"2026-08-24",dateSource:"origin-local-v1",model:"wing",color:"blue",stampedAt:"2026-08-25T02:30:00Z",timeZone:"America/Sao_Paulo",
    });
  });

  it("accepts legacy snapshots and rejects missing civil dates", () => {
    expect(mapAuthoritativePostmark({city:"Londrina",country:"BR",date:"2026-08-25"})).toMatchObject({model:"classic",color:"brown"});
    expect(mapAuthoritativePostmark({city:"Londrina",country:"BR"})).toBeUndefined();
  });
});
