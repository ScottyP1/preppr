import FoodCard from "@/components/FoodCard";

const MealGrid = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
      {data.map((item) => (
        <FoodCard {...item} key={item.id} />
      ))}
    </div>
  );
};

export default MealGrid;
