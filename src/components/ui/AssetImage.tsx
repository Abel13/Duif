import { useEffect, useState, type ImgHTMLAttributes, type ReactNode } from "react";

import { hasAssetPath } from "../../game";
import styles from "./AssetImage.module.css";

export type AssetImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "children" | "src"> & {
  src?: string;
  children: ReactNode;
};

export function AssetImage({
  alt,
  children,
  className,
  loading = "lazy",
  src,
  ...imageProps
}: AssetImageProps) {
  const [didFail, setDidFail] = useState(false);
  const shouldRenderImage = hasAssetPath(src) && !didFail;
  const classNames = [styles.frame, className].filter(Boolean).join(" ");

  useEffect(() => {
    setDidFail(false);
  }, [src]);

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
