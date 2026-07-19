import { useEffect, useState, type ImgHTMLAttributes, type ReactNode } from "react";

import type { OfficialAssetKey } from "../../game";
import { useOfficialAssets } from "../../integrations/supabase/OfficialAssetProvider";
import styles from "./AssetImage.module.css";

export type AssetImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "children" | "src"> & {
  assetKey?: OfficialAssetKey;
  children: ReactNode;
};

export function AssetImage({
  alt,
  assetKey,
  children,
  className,
  loading = "lazy",
  ...imageProps
}: AssetImageProps) {
  const { resolve } = useOfficialAssets();
  const src = resolve(assetKey);
  const [didFail, setDidFail] = useState(false);
  const shouldRenderImage = Boolean(src) && !didFail;
  const classNames = [styles.frame, className].filter(Boolean).join(" ");

  useEffect(() => {
    setDidFail(false);
  }, [assetKey, src]);

  return (
    <div className={classNames} data-has-image={shouldRenderImage || undefined}>
      {shouldRenderImage ? (
        <img
          alt={alt}
          className={styles.image}
          loading={loading}
          onError={() => setDidFail(true)}
          src={src}
          {...imageProps}
        />
      ) : (
        children
      )}
    </div>
  );
}
