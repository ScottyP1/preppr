export const Button = ({ className, children, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className} px-4 py-2 bg-[#82FF82] hover:bg-[#76E7A4] text-black`}
    >
      {children}
    </button>
  );
};

export default Button;
