import { BotAvatar, UserAvatar } from "./Avatars";

export const MessageBubble = ({ message }) => (
  <div
    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} transition-all duration-300`}
  >
    <div className={`flex max-w-xs lg:max-w-md xl:max-w-lg ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
      <div className="mx-2 self-end mb-1">
        {message.sender === "user" ? <UserAvatar /> : <BotAvatar />}
      </div>
      <div className={`px-4 py-3 rounded-2xl shadow-sm
        ${message.sender === "user"
          ? "bg-blue-600 text-white rounded-br-none"
          : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"}`}>
        <div className="whitespace-pre-wrap">{message.text}</div>
      </div>
    </div>
  </div>
);
