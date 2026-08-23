import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PostalEnvelope, PostalPostcard, PostalPostmark, PostalStickerSheet, type PostalFinishing } from "./PostalCorrespondence";

const basePostmark: NonNullable<PostalFinishing["postmark"]> = { city:"Londrina", country:"Brasil", date:"2026-08-23", model:"classic", color:"brown" };

describe("canonical postal correspondence",()=>{
  it.each(["classic","route","wing"] as const)("renders the complete %s postmark from one component",(model)=>{
    const markup=renderToStaticMarkup(<PostalPostmark postmark={{...basePostmark,model}}/>);
    expect(markup).toContain(`data-model="${model}"`);
    expect(markup).toContain("LONDRINA");
    expect(markup).toContain("BRASIL");
  });

  it("uses the same canonical surface for every density and correspondence type",()=>{
    const finishing={postmark:basePostmark};
    const markup=renderToStaticMarkup(<><PostalEnvelope density="compact" finishing={finishing}/><PostalPostcard density="reader" finishing={finishing} flipLabel="Virar" frontAlt="Cartão" interactive={false}/><PostalStickerSheet density="preview" finishing={finishing} stickers={[]}/></>);
    expect(markup.match(/data-model="classic"/g)).toHaveLength(3);
  });

  it.each(["brown","blue","red","green","gold","plum","charcoal","teal"] as const)("applies the %s ink through the canonical postmark",(color)=>{
    expect(renderToStaticMarkup(<PostalPostmark postmark={{...basePostmark,color}}/>)).toContain("--postmark-color:");
  });
});
