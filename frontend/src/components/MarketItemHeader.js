import Image from "next/image";

const MarketItemHeader = ({ stall, cardHeight = 360 }) => (
  <div className="flex flex-col gap-4 md:flex-row">
    {/* product image */}
    <div
      className="relative w-full overflow-hidden rounded-xl md:w-1/2 md:h-[360px]"
      style={{ aspectRatio: "4 / 3" }} // ensures height on mobile
    >
      {stall?.image ? (
        <Image
          src={stall.image}
          alt={stall.product || "Item image"}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
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
      {/* Seller */}
      <div className="flex items-start gap-3">
        {stall?.seller?.avatar && (
          <Image
            src={stall.seller.avatar}
            width={44}
            height={44}
            alt="Cook avatar"
            className="rounded-full"
          />
        )}
        <div className="font-medium">
          {stall?.seller?.first_name} {stall?.seller?.last_name}
        </div>
      </div>

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

export default MarketItemHeader;
