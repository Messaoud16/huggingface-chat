import { useEffect, useRef, useState } from "react";
import { CONSTANTS, generateChatTitle } from "../utils/constants";

export const useChatSessions = () => {
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const hasLoaded = useRef(false);

  // Load initial data from localStorage
  useEffect(() => {
    if (hasLoaded.current) return;

    const storedSessions = JSON.parse(localStorage.getItem(CONSTANTS.STORAGE_KEYS.CHAT_SESSIONS)) || [];

    if (storedSessions.length > 0) {
      setChatSessions(storedSessions);
      const firstSession = storedSessions[0];
      setActiveSession(firstSession.id);
    } else {
      setChatSessions([]);
    }

    hasLoaded.current = true;
  }, []);

  // Save chat sessions to localStorage whenever they change
  useEffect(() => {
    if (!hasLoaded.current) return;
    localStorage.setItem(CONSTANTS.STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(chatSessions));
  }, [chatSessions]);

  const createNewChatSession = (initialMessages = []) => {
    const newSession = {
      id: Date.now(),
      title: generateChatTitle(initialMessages),
      messages: initialMessages,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setChatSessions(prev => [newSession, ...prev]);
    setActiveSession(newSession.id);
    return newSession.id;
  };

  const updateChatSession = (newMessages) => {
    setChatSessions(prev =>
      prev.map(session =>
        session.id === activeSession
          ? {
              ...session,
              title: generateChatTitle(newMessages),
              messages: newMessages,
              updatedAt: new Date()
            }
          : session
      )
    );
  };

  const loadChatSession = (sessionId) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSession(sessionId);
      return session.messages;
    }
    return [];
  };

  const deleteChatSession = (sessionId) => {
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    if (activeSession === sessionId) {
      setActiveSession(null);
    }
  };

  const clearAllChats = () => {
    setChatSessions([]);
    setActiveSession(null);
  };



  return {
    chatSessions,
    activeSession,
    setActiveSession,
    createNewChatSession,
    updateChatSession,
    loadChatSession,
    deleteChatSession,
    clearAllChats
  };
};
