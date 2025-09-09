import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const MarketItemHeader = ({ stall, cardHeight = 360 }) => {
  const [imgError, setImgError] = useState(false);
  // Normalize media URL for product image. If backend returns a relative
  // "/media/..." path, prefix the API origin so it loads correctly.
  const apiOrigin = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const normalize = (u) => {
    if (!u || typeof u !== "string") return "";
    if (u.startsWith("http")) return u;
    return `${apiOrigin}${u.startsWith("/") ? "" : "/"}${u}`;
  };

  // Build candidate image URLs: main `image`, then primary from `images`, then first image.
  const candidates = useMemo(() => {
    const list = [];
    if (stall?.image) list.push(stall.image);
    const primary = (stall?.images || []).find((im) => im?.is_primary && im?.image);
    if (primary?.image) list.push(primary.image);
    const first = (stall?.images || []).find((im) => im?.image);
    if (first?.image) list.push(first.image);
    return Array.from(new Set(list)).map(normalize);
  }, [stall]);

  const [srcIndex, setSrcIndex] = useState(0);
  const currentSrc = candidates[srcIndex] || "";
  const showImg = currentSrc && !imgError;

  useEffect(() => {
    setSrcIndex(0);
    setImgError(false);
  }, [candidates.join("|")]);

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {/* product image */}
      <div
        className="relative w-full overflow-hidden rounded-xl md:w-1/2 md:h-[360px]"
        style={{ aspectRatio: "4 / 3" }}
      >
        {showImg ? (
          <Image
            src={currentSrc}
            alt={stall?.product || "Item image"}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            onError={() => {
              if (srcIndex < candidates.length - 1) {
                setSrcIndex((i) => i + 1);
              } else {
                setImgError(true);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-black/30" />
        )}
      </div>

    {/* right card */}
    <div
      className="grid w-full rounded-xl bg-gray-300/80 p-3 md:w-1/2 md:p-4 grid-rows-[auto,1fr,auto]"
      style={{ height: cardHeight }}
    >
      {/* Seller (clickable) */}
      {(() => {
        const s = stall?.seller || {};
        const sellerId = s?.id ?? s?.user_id ?? s?.user?.id;
        const sellerSlug = sellerId
          ? String(sellerId)
          : `${(s?.first_name || "").trim()} ${(s?.last_name || "").trim()}`
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, "");
        return (
          <Link href={`/account/${sellerSlug}`} className="flex items-start gap-3">
            {s?.avatar && (
              <Image
                src={s.avatar}
                width={44}
                height={44}
                alt="Cook avatar"
                className="rounded-full"
              />
            )}
            <div className="font-medium">
              {s?.first_name} {s?.last_name}
            </div>
          </Link>
        );
      })()}

      {/* description */}
      <div className="mt-3 overflow-y-auto pr-1">
        <p className="text-sm leading-6 md:text-base">
          {stall?.description || "No description provided."}
        </p>
      </div>

      {/* Product name */}
      <div className="mt-3 border-t border-black/10 pt-2 text-sm font-semibold md:text-base">
        {stall?.product || "Product name"}
      </div>
    </div>
  </div>
  );
};

export default MarketItemHeader;
