import { renderToStaticMarkup } from "react-dom/server";
import { describe,expect,it } from "vitest";
import { MascotPrestigeMedallion } from "./MascotPrestigeMedallion";

describe("MascotPrestigeMedallion",()=>{
 it("uses a circular framed portrait with accessible text",()=>{const html=renderToStaticMarkup(<MascotPrestigeMedallion alt="Nuvem — Primeiro Horizonte" borderAssetKey="prestige.border.firstHorizon" portraitAssetKey="mascot.portrait.nuvem"/>);expect(html).toContain('role="img"');expect(html).toContain('aria-label="Nuvem — Primeiro Horizonte"');expect(html).toContain("portrait");expect(html).toContain("border")});
 it("preserves the ordinary portrait fallback without a border",()=>{const html=renderToStaticMarkup(<MascotPrestigeMedallion alt="Nuvem" portraitAssetKey="mascot.portrait.nuvem"/>);expect(html).not.toContain('role="img"');expect(html.match(/<div/g)).toHaveLength(1)});
});
