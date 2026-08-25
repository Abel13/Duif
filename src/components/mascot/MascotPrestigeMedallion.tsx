import type { OfficialAssetKey } from "../../game";
import { AssetImage } from "../ui";
import styles from "./MascotPrestigeMedallion.module.css";

type Props={alt:string;borderAssetKey?:OfficialAssetKey;className?:string;portraitAssetKey?:OfficialAssetKey;size?:"small"|"medium"|"large"};
export function MascotPrestigeMedallion({alt,borderAssetKey,className="",portraitAssetKey,size="medium"}:Props){
 if(!borderAssetKey)return <AssetImage alt={alt} assetKey={portraitAssetKey} className={className}><span aria-hidden="true"/></AssetImage>;
 return <span aria-label={alt} className={`${styles.medallion} ${styles[size]} ${className}`} role="img"><AssetImage alt="" assetKey={portraitAssetKey} className={styles.portrait}><span aria-hidden="true"/></AssetImage><AssetImage alt="" assetKey={borderAssetKey} className={styles.border}><span aria-hidden="true"/></AssetImage></span>;
}
