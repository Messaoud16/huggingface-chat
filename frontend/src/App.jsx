import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaPaperPlane, FaSearch, FaTrash } from "react-icons/fa";

// Custom hooks
import { useChatSessions } from "./hooks/useChatSessions";
import { useTextarea } from "./hooks/useTextarea";

// API
import { sendMessageToBot } from "./api/chatApi";

// Components
import { DeleteModal } from "./components/DeleteModal";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { MessageBubble } from "./components/MessageBubble";

// Utils
import { CONSTANTS } from "./utils/constants";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const chatEndRef = useRef(null);

  // Custom hooks
  const {
    chatSessions,
    activeSession,
    createNewChatSession,
    updateChatSession,
    loadChatSession,
    deleteChatSession,
    clearAllChats
  } = useChatSessions();

  const { handleTextareaChange, resetTextareaHeight } = useTextarea();

  // Load messages when active session changes
  useEffect(() => {
    if (activeSession) {
      const session = chatSessions.find(s => s.id === activeSession);
      if (session) {
        setMessages(session.messages);
      }
    } else {
      setMessages([]);
    }
  }, [activeSession, chatSessions]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input,
      timestamp: dayjs().format("HH:mm"),
      id: Date.now()
    };

    // Collect context messages in chronological order
    const contextMessages = messages.map(m => m.text);

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    resetTextareaHeight();
    setLoading(true);

    try {
      const res = await sendMessageToBot(input, contextMessages);

      const botMessage = {
        sender: "bot",
        text: res.response,
        timestamp: dayjs(res.timestamp).format("HH:mm"),
        id: Date.now() + 1
      };

      setMessages(prev => [...prev, botMessage]);

      // Update chat session with new messages
      if (activeSession) {
        const currentMessages = messages;
        updateChatSession([...currentMessages, userMessage, botMessage]);
      } else {
        createNewChatSession([userMessage, botMessage]);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = {
        sender: "bot",
        text: "Oops! Something went wrong. Please try again.",
        timestamp: dayjs().format("HH:mm"),
        id: Date.now() + 1
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, activeSession, updateChatSession, createNewChatSession, resetTextareaHeight]);

  const startNewChat = () => {
    // Check if current session is empty
    const isCurrentSessionEmpty = currentSession && currentSession.messages.length === 0;

    // If current session is empty, just clear the input and don't create a new session
    if (isCurrentSessionEmpty) {
      setInput("");
      resetTextareaHeight();
      return;
    }

    // Otherwise, create a new session
    setMessages([]);
    setInput("");
    resetTextareaHeight();
    createNewChatSession([]);
  };

  const handleLoadChatSession = (sessionId) => {
    const sessionMessages = loadChatSession(sessionId);
    setMessages(sessionMessages);
  };

  const handleDeleteChatSession = (sessionId, e) => {
    e.stopPropagation();
    setDeleteAction('single');
    setDeleteTarget(sessionId);
    setShowDeleteModal(true);
  };

  const handleClearAllChats = () => {
    setDeleteAction('all');
    setDeleteTarget(null);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteAction === 'single') {
      deleteChatSession(deleteTarget);
      if (activeSession === deleteTarget) {
        setMessages([]);
      }
    } else if (deleteAction === 'all') {
      clearAllChats();
      setMessages([]);
    }
    setShowDeleteModal(false);
    setDeleteAction(null);
    setDeleteTarget(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteAction(null);
    setDeleteTarget(null);
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      sendMessage();
    }
  }, [loading, sendMessage]);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
    handleTextareaChange(e);
  }, [handleTextareaChange]);

  const currentSession = chatSessions.find(s => s.id === activeSession);

  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.messages.some(m => m.text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-gray-50 flex h-screen">
      {/* Sidebar for chat history */}
      <div className={`${showChatHistory ? "w-64" : "w-0"} bg-white overflow-hidden transition-all duration-300 border-r border-gray-200`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
            <button
              onClick={handleClearAllChats}
              disabled={chatSessions.length === 0}
              className={`p-1.5 rounded-md transition-colors ${
                chatSessions.length === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:text-red-500"
              }`}
              title={chatSessions.length === 0 ? "No chats to clear" : "Clear all chats"}
            >
              <FaTrash size={14} />
            </button>
          </div>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-2.5 text-gray-500" size={14} />
          </div>

          <div className="space-y-2 max-h-[calc(100vh-180px)] overflow-y-auto">
            {filteredSessions.map(session => (
              <div
                key={session.id}
                onClick={() => handleLoadChatSession(session.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${activeSession === session.id
                  ? "bg-blue-100"
                  : "hover:bg-gray-100"}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-medium text-gray-800 truncate">
                    {session.title}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteChatSession(session.id, e)}
                    className="text-gray-400 hover:text-red-500 ml-2"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
                <p className="text-xs text-gray-700 mt-1 truncate">
                  {session.messages.length > 0
                    ? session.messages[session.messages.length - 1].text.substring(0, 40) + "..."
                    : "Empty chat"}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {dayjs(session.updatedAt).format("MMM D, HH:mm")}
                </p>
              </div>
            ))}

            {chatSessions.length === 0 && (
              <div className="text-center py-8 text-gray-600">
                <p>No chat history yet</p>
                <p className="text-sm mt-2">Start a conversation to see it here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowChatHistory(!showChatHistory)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="font-bold text-xl text-gray-800">AI Assistant</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={startNewChat}
              disabled={currentSession && currentSession.messages.length === 0}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                currentSession && currentSession.messages.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
              title={currentSession && currentSession.messages.length === 0 ? "Current chat is already empty" : "Start a new chat"}
            >
              New Chat
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="bg-blue-100 p-5 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-lg font-medium">Start a conversation with AI Assistant</p>
              <p className="text-sm mt-1">Type a message below to get started</p>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {loading && <LoadingIndicator />}
          <div ref={chatEndRef}></div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none px-2 py-1"
              style={{ minHeight: CONSTANTS.MIN_TEXTAREA_HEIGHT + 'px', maxHeight: CONSTANTS.MAX_TEXTAREA_HEIGHT + 'px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className={`p-2 rounded-full transition-all duration-200 ml-2 ${!input.trim() || loading
                ? "text-gray-400"
                : "text-white bg-blue-600 hover:bg-blue-700"}`}
            >
              <FaPaperPlane size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        showDeleteModal={showDeleteModal}
        deleteAction={deleteAction}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

export default App;
