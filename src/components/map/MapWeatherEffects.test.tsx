import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../integrations/supabase/OfficialAssetProvider", () => ({
  useOfficialAssets: () => ({ resolve: (key?: string) => key ? `/assets/${key}.webp` : undefined }),
}));

import { MapWeatherEffects } from "./MapWeatherEffects";

describe("MapWeatherEffects", () => {
  it("keeps a seasonal layer without a weather overlay for clear skies", () => {
    const html = renderToStaticMarkup(<MapWeatherEffects isNight={false} motionPreference="full" season="spring" weatherCategory="clear" />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-season="spring"');
    expect(html).not.toContain("data-weather=");
    expect(html).toContain("texture.mapWeatherParticle.season.springPetal");
  });

  it.each(["fogDrizzle", "rain", "snow", "heavyFreezingRain", "thunderstorm"] as const)("renders %s as an active overlay", (weatherCategory) => {
    const html = renderToStaticMarkup(<MapWeatherEffects isNight motionPreference="reduced" season="winter" weatherCategory={weatherCategory} />);
    expect(html).toContain(`data-weather="${weatherCategory}"`);
    expect(html).toContain('data-motion="reduced"');
    expect(html).toContain('data-night="true"');
  });

  it("uses independently positioned raster particles", () => {
    const html = renderToStaticMarkup(<MapWeatherEffects isNight={false} motionPreference="full" season="autumn" weatherCategory="rain" />);
    expect((html.match(/<img/g) ?? [])).toHaveLength(18);
    expect(html).toContain('data-particle-motion="drift"');
    expect(html).toContain('data-particle-motion="fall"');
  });
});
