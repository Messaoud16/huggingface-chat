import { BotAvatar } from "./Avatars";

export const LoadingIndicator = () => (
  <div className="flex justify-start">
    <div className="flex max-w-xs lg:max-w-md xl:max-w-lg">
      <div className="mx-2 self-end mb-1">
        <BotAvatar />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-white border border-gray-100 shadow-sm">
        <div className="flex space-x-1.5">
          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  </div>
);
