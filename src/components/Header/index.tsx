import { IoIosNotificationsOutline, IoMdMore } from "react-icons/io";

const index = () => {
  return (
    <div className="bg-red-300 w-full px-6 h-18 flex justify-end">
      <div className="flex items-center gap-4">
        <IoIosNotificationsOutline size={24} />
        <div className="bg-green-400 min-w-10 h-10 rounded-full"></div>
        <IoMdMore size={24} />
      </div>
    </div>
  );
};

export default index;
