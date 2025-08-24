export const CONSTANTS = {
  MAX_TITLE_LENGTH: 30,
  MAX_TEXTAREA_HEIGHT: 128,
  MIN_TEXTAREA_HEIGHT: 24,
  API_URL: process.env.REACT_APP_API_URL || "http://localhost:8000/chat",
  STORAGE_KEYS: {
    CHAT_SESSIONS: "chatSessions"
  }
};

export const generateChatTitle = (messages) => {
  if (messages.length === 0) return "New Chat";

  // Find the first user message
  const firstUserMessage = messages.find(msg => msg.sender === "user");
  if (!firstUserMessage) return "New Chat";

  const text = firstUserMessage.text.trim();

  // If it's a short message, use it directly
  if (text.length <= CONSTANTS.MAX_TITLE_LENGTH) {
    return text;
  }

  // For longer messages, take the first sentence or first 30 characters
  const firstSentence = text.split(/[.!?]/)[0];
  if (firstSentence.length <= CONSTANTS.MAX_TITLE_LENGTH) {
    return firstSentence;
  }

  // Fallback to first 30 characters
  return text.substring(0, CONSTANTS.MAX_TITLE_LENGTH) + "...";
};
