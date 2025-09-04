import Image from "next/image";
import { useRouter } from "next/navigation";

const FoodCard = ({ id, image, product, price_level, seller, tags }) => {
  const router = useRouter();

  return (
    <div className="w-full mx-auto">
      <Image
        src={image}
        height={200}
        width={400}
        className="rounded-t-xl w-full object-cover"
        alt="Image of food"
      />
      <div className="bg-gray-500 p-2 rounded-b-xl">
        <div className="flex justify-between">
          <h1 className="text-lg ml-2">{product}</h1>
          <h2>{"$".repeat(price_level)}</h2>
        </div>
        <div className="flex gap-4 items-center mt-2">
          <Image
            src={seller?.avatar}
            width={40}
            height={40}
            alt="cooks avatar"
          />
          <h3>
            {seller?.first_name} {seller?.last_name}
          </h3>
        </div>
        <div className="grid grid-cols-5 gap-4 mt-2">
          {tags &&
            tags.map((item) => {
              return <Tag label="Protein" />;
            })}
        </div>
        <button
          className="w-full p-2 bg-green-500 mt-4 rounded-xl"
          onClick={() => router.push(`/market/${id}`)}
        >
          View
        </button>
      </div>
    </div>
  );
};

export default FoodCard;

const Tag = ({ label }) => {
  return (
    <div className="bg-green-500 rounded-lg px-2">
      <span className="text-xs">{label}</span>
    </div>
  );
};
