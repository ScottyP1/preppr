import Image from "next/image";

const FoodCard = ({ id, image, title, price, preppr, tags }) => {
  return (
    <div>
      <Image src={image} height={200} width={400} className="rounded-t-xl" />
      <div className="bg-gray-500 p-2 rounded-b-xl">
        <div className="flex justify-between">
          <h1>{title}</h1>
          <h2>${price}</h2>
        </div>
        <div className="flex gap-4 items-center mt-2">
          <div className="bg-black h-12 w-12 rounded-xl" />
          <h3>Cooks name</h3>
        </div>
        <div className="grid grid-cols-5 gap-4 mt-2">
          <Tag label="Protein" />
          <Tag label="Protein" />
          <Tag label="Protein" />
          <Tag label="Protein" />
          <Tag label="Protein" />
        </div>
        <button className="w-full p-2 bg-green-500 mt-4 rounded-xl">
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
      <span className="text-sm text-center">{label}</span>
    </div>
  );
};
