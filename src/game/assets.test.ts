import { describe, expect, it } from "vitest";

import { assetKeys, parseOfficialAssetManifest, resolveOfficialAssetPath } from "./assets";
import { starterMascots } from "./mockData";

const row = {
  version: 1,
  source: "packaged",
  status: "active",
  packaged_path: "/assets/mascots/portraits/nuvem.webp",
  mime_type: "image/webp",
  width: 640,
  height: 640,
  byte_size: 60810,
  alt_text_key: "appearance.nuvemPortrait",
  is_decorative: false,
  official_assets: { asset_key: assetKeys.mascots.nuvem, asset_type: "mascotPortrait" },
};

describe("official asset manifest", () => {
  it("resolves an active packaged version by its stable key", () => {
    const manifest = parseOfficialAssetManifest([row]);
    expect(resolveOfficialAssetPath(manifest, assetKeys.mascots.nuvem))
      .toBe("/assets/mascots/portraits/nuvem.webp");
    expect(resolveOfficialAssetPath(manifest, assetKeys.mascots.trovao)).toBeUndefined();
  });

  it("rejects duplicate, inactive, and free-form records while accepting registered-format keys", () => {
    expect(() => parseOfficialAssetManifest([row, row])).toThrow(/Duplicate/);
    expect(() => parseOfficialAssetManifest([{ ...row, status: "draft" }])).toThrow(/Invalid/);
    expect(() => parseOfficialAssetManifest([{ ...row, packaged_path: "https://example.com/image.webp" }])).toThrow(/Invalid/);
    expect(parseOfficialAssetManifest([{ ...row, official_assets: { ...row.official_assets, asset_key: "studio.testAsset" } }]).has("studio.testAsset")).toBe(true);
    expect(() => parseOfficialAssetManifest([{ ...row, official_assets: { ...row.official_assets, asset_key: "free path" } }])).toThrow(/Invalid/);
  });
  it("resolves an active Storage version through its public URL", () => {
    const manifest=parseOfficialAssetManifest([{ ...row, source:"storage", packaged_path:null, resolved_path:"https://project.supabase.co/storage/v1/object/public/duif-assets/assets/studio/test.webp", official_assets:{asset_key:"studio.testAsset",asset_type:"shopArtwork"} }]);
    expect(resolveOfficialAssetPath(manifest,"studio.testAsset")).toContain("duif-assets");
  });

  it("accepts an empty manifest without inventing fallback paths", () => {
    expect(parseOfficialAssetManifest([]).size).toBe(0);
  });
  it("parses the registered inaugural postcard artwork", () => {
    const manifest=parseOfficialAssetManifest([{ ...row, width:1024,height:683,byte_size:154572,alt_text_key:"tutorial.rewards.inauguralPostcard.name",official_assets:{asset_key:assetKeys.postcards.inauguralFront,asset_type:"postcardArtwork"},packaged_path:"/assets/tutorial/postcards/inaugural-front.webp" }]);
    expect(resolveOfficialAssetPath(manifest,assetKeys.postcards.inauguralFront)).toContain("inaugural-front.webp");
  });

  it("parses each decorative Ninho hub artwork by its official key", () => {
    const artwork = [
      [assetKeys.nest.profileNook, "/assets/nest/profile-nook.webp", 51464],
      [assetKeys.nest.mascotRoost, "/assets/nest/mascot-roost.webp", 57304],
      [assetKeys.nest.mailbox, "/assets/nest/mailbox.webp", 45744],
    ] as const;
    const manifest = parseOfficialAssetManifest(artwork.map(([key, packaged_path, byte_size]) => ({
      ...row,
      packaged_path,
      width: 480,
      height: 640,
      byte_size,
      alt_text_key: null,
      is_decorative: true,
      official_assets: { asset_key: key, asset_type: "nestArtwork" },
    })));

    artwork.forEach(([key, path]) => {
      expect(resolveOfficialAssetPath(manifest, key)).toBe(path);
    });
  });

  it("resolves the official default profile silhouette", () => {
    const manifest = parseOfficialAssetManifest([{
      ...row,
      packaged_path: "/assets/profile/default-silhouette.webp",
      width: 256,
      height: 256,
      byte_size: 6546,
      alt_text_key: "nestHub.defaultAvatar",
      official_assets: { asset_key: assetKeys.profile.defaultSilhouette, asset_type: "nestArtwork" },
    }]);

    expect(resolveOfficialAssetPath(manifest, assetKeys.profile.defaultSilhouette))
      .toBe("/assets/profile/default-silhouette.webp");
  });

  it("resolves every published memorable-place sticker by its stable key", () => {
    const artwork = [
      [assetKeys.landmarks.christTheRedeemer, "/assets/landmarks/christ-the-redeemer.webp"],
      [assetKeys.landmarks.masp, "/assets/landmarks/masp.webp"],
      [assetKeys.landmarks.iguazuDevilsThroat, "/assets/landmarks/iguazu-devils-throat.webp"],
      [assetKeys.landmarks.machuPicchu, "/assets/landmarks/machu-picchu.webp"],
    ] as const;
    const manifest = parseOfficialAssetManifest(artwork.map(([key, packaged_path]) => ({
      ...row,
      packaged_path,
      width: 256,
      height: 256,
      byte_size: 24000,
      alt_text_key: "landmarks.christTheRedeemer.alt",
      official_assets: { asset_key: key, asset_type: "landmarkArtwork" },
    })));

    artwork.forEach(([key, path]) => expect(resolveOfficialAssetPath(manifest, key)).toBe(path));
  });

  it("resolves every published city postcard in the reviewed capital batches", () => {
    const artwork = [
      [assetKeys.postcards.cities.saoPaulo, "/assets/postcards/cities/sao-paulo.webp"],
      [assetKeys.postcards.cities.rioDeJaneiro, "/assets/postcards/cities/rio-de-janeiro.webp"],
      [assetKeys.postcards.cities.beloHorizonte, "/assets/postcards/cities/belo-horizonte.webp"],
      [assetKeys.postcards.cities.salvador, "/assets/postcards/cities/salvador.webp"],
      [assetKeys.postcards.cities.fortaleza, "/assets/postcards/cities/fortaleza.webp"],
      [assetKeys.postcards.cities.manaus, "/assets/postcards/cities/manaus.webp"],
      [assetKeys.postcards.cities.brasilia, "/assets/postcards/cities/brasilia.webp"],
      [assetKeys.postcards.cities.curitiba, "/assets/postcards/cities/curitiba.webp"],
      [assetKeys.postcards.cities.recife, "/assets/postcards/cities/recife.webp"],
      [assetKeys.postcards.cities.goiania, "/assets/postcards/cities/goiania.webp"],
      [assetKeys.postcards.cities.belem, "/assets/postcards/cities/belem.webp"],
      [assetKeys.postcards.cities.portoAlegre, "/assets/postcards/cities/porto-alegre.webp"],
      [assetKeys.postcards.cities.maceio, "/assets/postcards/cities/maceio.webp"],
      [assetKeys.postcards.cities.saoLuis, "/assets/postcards/cities/sao-luis.webp"],
      [assetKeys.postcards.cities.campoGrande, "/assets/postcards/cities/campo-grande.webp"],
      [assetKeys.postcards.cities.natal, "/assets/postcards/cities/natal.webp"],
      [assetKeys.postcards.cities.teresina, "/assets/postcards/cities/teresina.webp"],
      [assetKeys.postcards.cities.joaoPessoa, "/assets/postcards/cities/joao-pessoa.webp"],
      [assetKeys.postcards.cities.aracaju, "/assets/postcards/cities/aracaju.webp"],
      [assetKeys.postcards.cities.cuiaba, "/assets/postcards/cities/cuiaba.webp"],
      [assetKeys.postcards.cities.portoVelho, "/assets/postcards/cities/porto-velho.webp"],
      [assetKeys.postcards.cities.macapa, "/assets/postcards/cities/macapa.webp"],
      [assetKeys.postcards.cities.florianopolis, "/assets/postcards/cities/florianopolis.webp"],
      [assetKeys.postcards.cities.boaVista, "/assets/postcards/cities/boa-vista.webp"],
      [assetKeys.postcards.cities.rioBranco, "/assets/postcards/cities/rio-branco.webp"],
      [assetKeys.postcards.cities.vitoria, "/assets/postcards/cities/vitoria.webp"],
      [assetKeys.postcards.cities.palmas, "/assets/postcards/cities/palmas.webp"],
    ] as const;
    const manifest = parseOfficialAssetManifest(artwork.map(([key, packaged_path]) => ({
      ...row,
      packaged_path,
      width: 1200,
      height: 800,
      byte_size: 180000,
      alt_text_key: "officialPostcards.cities.saoPaulo.alt",
      official_assets: { asset_key: key, asset_type: "postcardArtwork" },
    })));

    artwork.forEach(([key, path]) => expect(resolveOfficialAssetPath(manifest, key)).toBe(path));
  });

  it("resolves the three registered starter equipment icons", () => {
    const equipment = [
      [assetKeys.equipment.featherCharm, "/assets/equipment/icons/feather-charm.webp"],
      [assetKeys.equipment.smallSatchel, "/assets/equipment/icons/small-satchel.webp"],
      [assetKeys.equipment.travelCap, "/assets/equipment/icons/travel-cap.webp"],
    ] as const;
    const manifest = parseOfficialAssetManifest(equipment.map(([key, packaged_path]) => ({
      ...row,
      width: 192,
      height: 192,
      byte_size: 8192,
      alt_text_key: key === assetKeys.equipment.featherCharm
        ? "equipment.featherCharm.name"
        : key === assetKeys.equipment.smallSatchel
          ? "equipment.smallSatchel.name"
          : "equipment.travelCap.name",
      packaged_path,
      official_assets: { asset_key: key, asset_type: "equipmentIcon" },
    })));

    equipment.forEach(([key, path]) => {
      expect(resolveOfficialAssetPath(manifest, key)).toBe(path);
    });
  });

  it("keeps every starter equipment record connected to an official asset key", () => {
    const equipment = starterMascots.flatMap((mascot) => mascot.equipment);

    expect(equipment).toHaveLength(7);
    expect(equipment.every((item) => Boolean(item.iconAssetKey))).toBe(true);
  });
});
