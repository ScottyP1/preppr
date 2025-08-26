export const Button = ({ className, children }) => {
  return (
    <button className={`${className} p-4 bg-[#82FF82] text-black rounded-full`}>
      {children}
    </button>
  );
};

export default Button;
