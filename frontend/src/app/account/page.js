export default function Account() {
  return (
    <div className="mx-12 mt-6">
      <div className="flex items-top gap-4 bg-gray-300 p-4 rounded-xl">
        <div className="bg-black h-32 w-32 rounded-xl" />
        <div className="">
          <span className="text-black">
            lorem ipsomlorem ipsomlorem ipsomlorem ipsomlorem ipsomlorem
            ipsomlorem ipsomlorem ipsomlorem ipsomlorem ipsomlorem ipsomlorem
            ipsomlorem ipsomlorem ipsomlorem ipsomlorem ipsom
          </span>
        </div>
      </div>

      {/* List out all links(Tabs) will dyanimcally adjust borders for selected tab so blends into tab */}
      <div className="grid grid-cols-4 mt-6 gap-4">
        <div className="bg-gray-500 p-4 rounded-xl text-center">
          <h2>My Store</h2>
        </div>
        <div className="bg-gray-500 p-4 rounded-xl text-center">
          <h2>Orders</h2>
        </div>
        <div className="bg-gray-500 p-4 rounded-xl text-center">
          <h2>Reviews</h2>
        </div>
        <div className="bg-gray-500 p-4 rounded-xl text-center">
          <h2>My Store</h2>
        </div>
      </div>
      <div className="bg-gray-500 w-full h-64 mt-2" />
    </div>
  );
}
