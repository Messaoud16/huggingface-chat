import { FaRobot, FaUser } from "react-icons/fa";

export const UserAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
    <FaUser className="text-white text-sm" />
  </div>
);

export const BotAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
    <FaRobot className="text-white text-sm" />
  </div>
);
