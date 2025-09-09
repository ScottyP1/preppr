import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FoodCard = ({ id, image, product, price_level, seller, tags }) => {
  const router = useRouter();
  const fallbackImage = "/default-food.jpg";

  const sellerId = seller?.id ?? seller?.user_id ?? seller?.user?.id;
  const sellerSlug = sellerId
    ? String(sellerId)
    : `${(seller?.first_name || "").trim()} ${(seller?.last_name || "").trim()}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

  return (
    <div className="w-full mx-auto max-w-lg">
      {/* Image wrapper with fixed height */}
      <div className="relative w-full h-64 border-gray-300 border-2 overflow-hidden rounded-t-xl">
        <Image
          src={image || "/default-food.png"}
          alt={product || "Food image"}
          fill
          className="object-cover"
        />
      </div>

      {/* Card body with locked height */}
      <div className="bg-gray-500 p-3 rounded-b-xl flex flex-col justify-between h-[200px]">
        <div>
          {/* Title + price */}
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold truncate">{product}</h1>
            <h2 className="text-green-300 font-bold ml-2">
              {"$".repeat(price_level)}
            </h2>
          </div>

          {/* Seller (clickable to public profile) */}
          <Link href={`/account/${sellerSlug}`} className="flex gap-3 items-center mt-2">
            <Image
              src={seller?.avatar || "/default-avatar.png"}
              width={36}
              height={36}
              alt="Cook avatar"
              className="rounded-full"
            />
            <h3 className="truncate">
              {seller?.first_name} {seller?.last_name}
            </h3>
          </Link>

          {/* Tags row (no wrapping) */}
          {tags?.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
              {tags.map((item) => (
                <Tag key={item.id} label={item.name} />
              ))}
            </div>
          )}
        </div>

        {/* Button pinned to bottom */}
        <button
          className="w-full py-2 bg-green-500 mt-3 rounded-xl font-semibold hover:bg-green-600 transition"
          onClick={() => router.push(`/market/${id}`)}
        >
          View
        </button>
      </div>
    </div>
  );
};

export default FoodCard;

const Tag = ({ label }) => (
  <div className="bg-green-500 rounded-lg px-2 py-1 whitespace-nowrap">
    <span className="text-xs text-white">{label}</span>
  </div>
);
