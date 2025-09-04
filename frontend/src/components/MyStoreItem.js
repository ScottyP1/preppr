// components/MyStoreItem.js
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const MyStoreItem = ({ item, onDelete }) => {
  const router = useRouter();
  const { id, image, product, seller } = item;

  return (
    <div
      onClick={() => router.push(`/market/${id}`)}
      className="flex items-center justify-between bg-gray-100 border border-gray-200 rounded-xl p-3 hover:shadow-md cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
          {image ? (
            // Next/Image with fill requires parent to be relative (we provided)
            <Image src={image} alt={product} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
              No Image
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="font-medium text-md text-gray-500 truncate">{product}</h3>
          <p className="text-xs text-gray-600 truncate">
            {seller?.first_name} {seller?.last_name}
          </p>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete && onDelete();
        }}
        className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm"
      >
        Delete
      </button>
    </div>
  );
};

export default MyStoreItem;
