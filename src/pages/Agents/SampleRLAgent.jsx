import React, { useState, useRef, useEffect, useCallback } from "react";
import { rlAgentAPI } from "../../services/rlAgent.service";
import "./SampleRLAgent.css";

const SampleRLAgent = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("");
  const [showNameModal, setShowNameModal] = useState(true);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change within the same conversation
  useEffect(() => {
    if (
      currentConversation?.messages &&
      currentConversation.messages.length > 0
    ) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [currentConversation?.messages]);

  // Reset scroll to top when switching conversations
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
      setTimeout(() => {
        scrollToBottom();
      }, 150);
    }
  }, [currentConversation?.id]);

  const loadConversations = useCallback(async (name) => {
    try {
      const result = await rlAgentAPI.listConversations(name);
      setConversations(result.conversations);

      if (result.conversations && result.conversations.length > 0) {
        // Check if the currently selected conversation exists in the list
        const hasSelectedConversation = result.conversations.some(
          (conv) => conv.id === selectedConversationId
        );

        // If no conversation is selected or the selected one doesn't exist, select the first one
        if (!selectedConversationId || !hasSelectedConversation) {
          const firstConversation = result.conversations[0];
          setSelectedConversationId(firstConversation.id);
          setCurrentConversation(firstConversation);
        }
      } else {
        setCurrentConversation(null);
        setSelectedConversationId(null);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    const storedUserName = localStorage.getItem("sampleRLAgentUserName");
    if (storedUserName) {
      setUserName(storedUserName);
      setShowNameModal(false);
      loadConversations(storedUserName);
    }
  }, [loadConversations]);

  const handleSetUserName = () => {
    if (userName.trim()) {
      localStorage.setItem("sampleRLAgentUserName", userName.trim());
      setShowNameModal(false);
      loadConversations(userName.trim());
    }
  };

  const handleNewConversation = async (initialMessage = "") => {
    if (!userName.trim()) {
      setShowNameModal(true);
      return;
    }

    // Ensure initialMessage is a string (not an event object)
    const messageText = typeof initialMessage === 'string' ? initialMessage.trim() : '';

    // Create a temporary conversation to show the chat interface immediately
    if (messageText) {
      const tempConversation = {
        id: "temp-" + Date.now(),
        userName: userName,
        messages: [
          {
            id: "temp-msg-" + Date.now(),
            role: "user",
            content: messageText,
            timestamp: new Date().toISOString(),
            toolsUsed: [],
            metadata: {},
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
      };
      setCurrentConversation(tempConversation);
      setLoading(true);
    } else {
      setLoading(true);
    }

    try {
      const conversation = await rlAgentAPI.createConversation(
        userName,
        messageText || undefined
      );
      setCurrentConversation(conversation);
      setSelectedConversationId(conversation.id);
      setConversations([conversation, ...conversations]);
      setMessage("");
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to create conversation. Please try again.");
      // Reset on error if we showed a temp conversation
      if (messageText) {
        setCurrentConversation(null);
        setSelectedConversationId(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentConversation || !message.trim() || loading) return;

    const messageText = message.trim();
    setMessage("");

    // Create a temporary user message to show immediately
    const tempUserMessage = {
      id: "temp-user-" + Date.now(),
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
      toolsUsed: [],
      metadata: {},
    };

    // Update UI immediately with user message
    setCurrentConversation({
      ...currentConversation,
      messages: [...currentConversation.messages, tempUserMessage],
    });

    setLoading(true);

    try {
      const result = await rlAgentAPI.sendMessage(
        currentConversation.id,
        messageText
      );

      // Replace temp message with real messages from API
      const messagesWithoutTemp = currentConversation.messages.filter(
        (msg) => msg.id !== tempUserMessage.id
      );
      setCurrentConversation({
        ...currentConversation,
        messages: [
          ...messagesWithoutTemp,
          result.userMessage,
          result.assistantMessage,
        ],
      });

      // Update conversation in the list
      const updatedConversations = conversations.map((conv) =>
        conv.id === currentConversation.id
          ? {
              ...conv,
              messages: [
                ...conv.messages,
                result.userMessage,
                result.assistantMessage,
              ],
              updatedAt: new Date().toISOString(),
            }
          : conv
      );
      setConversations(updatedConversations);
    } catch (error) {
      console.error("Error sending message:", error);
      alert(
        "Failed to send message. The RL agent might be taking longer than expected. Please try again or check back later."
      );

      // Remove the temp message on error
      setCurrentConversation({
        ...currentConversation,
        messages: currentConversation.messages.filter(
          (msg) => msg.id !== tempUserMessage.id
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (messageId, rating) => {
    if (!currentConversation) return;

    try {
      await rlAgentAPI.provideFeedback(
        currentConversation.id,
        messageId,
        rating
      );

      // Update the message with feedback in current conversation
      const updatedMessages = currentConversation.messages.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            feedback: {
              rating: rating,
              comment: null,
              timestamp: new Date().toISOString(),
            },
          };
        }
        return msg;
      });

      setCurrentConversation({
        ...currentConversation,
        messages: updatedMessages,
      });

      // Update in conversations list as well
      const updatedConversations = conversations.map((conv) => {
        if (conv.id === currentConversation.id) {
          return {
            ...conv,
            messages: updatedMessages,
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
    } catch (error) {
      console.error("Error providing feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    }
  };

  const selectConversation = async (conversation) => {
    const conversationId = conversation?.id;
    if (!conversationId) return;

    setSelectedConversationId(conversationId);

    try {
      // Fetch fresh conversation data to ensure we have all messages
      const freshConversation = await rlAgentAPI.getConversation(
        conversationId
      );
      setCurrentConversation(freshConversation);
      setSelectedConversationId(freshConversation.id);
    } catch (error) {
      console.error("Error loading conversation:", error);
      setCurrentConversation(conversation);
      setSelectedConversationId(conversationId);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderMessageContent = (content) => {
    // Simple markdown rendering for bold text
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="sample-rl-agent">
      {/* User Name Modal */}
      {showNameModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Welcome to RL Agent Chat</h2>
            <p>Please enter your name to continue</p>
            <input
              type="text"
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetUserName()}
              autoFocus
            />
            <button onClick={handleSetUserName} disabled={!userName.trim()}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={handleNewConversation}>
            + New Chat
          </button>
          <button
            className="toggle-sidebar-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        <div className="conversations-list">
          {conversations.map((conv) => {
            const isActive = selectedConversationId === conv.id;
            return (
              <div
                key={conv.id}
                className={`conversation-item ${isActive ? "active" : ""}`}
                data-conversation-id={conv.id}
                data-is-active={isActive}
                onClick={() => selectConversation(conv)}
              >
                <div className="conversation-preview">
                  <div className="conversation-title">
                    {conv.messages[0]?.content.substring(0, 50) ||
                      "New conversation"}
                    {conv.messages[0]?.content.length > 50 && "..."}
                  </div>
                  <div className="conversation-time">
                    {formatTimestamp(conv.updatedAt)}
                  </div>
                </div>
              </div>
            );
          })}
          {conversations.length === 0 && (
            <div className="no-conversations">
              <p>No conversations yet</p>
              <p>Start a new chat to begin</p>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span>{userName}</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {!currentConversation ? (
          <div className="empty-state">
            <h1>RL Agent Chat</h1>
            <p>Test your Reinforcement Learning Agent</p>
            <div className="example-prompts">
              <h3>Try asking about:</h3>
              <div className="prompt-cards">
                <div
                  className="prompt-card"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNewConversation(
                      "What are the latest trends in mobile gaming?"
                    );
                  }}
                >
                  Latest trends in mobile gaming
                </div>
                <div
                  className="prompt-card"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNewConversation(
                      "Analyze competitor strategies for puzzle games"
                    );
                  }}
                >
                  Competitor analysis for puzzle games
                </div>
                <div
                  className="prompt-card"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNewConversation(
                      "What are best practices for game monetization?"
                    );
                  }}
                >
                  Game monetization best practices
                </div>
                <div
                  className="prompt-card"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNewConversation("Research AR gaming opportunities");
                  }}
                >
                  AR gaming opportunities
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="messages-container" ref={messagesContainerRef}>
              {currentConversation?.messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === "user"
                      ? userName.charAt(0).toUpperCase()
                      : "AI"}
                  </div>
                  <div className="message-content-wrapper">
                    <div className="message-content">
                      {(typeof msg?.content === "string" ? msg.content : "")
                        .split("\n")
                        .map((line, i) => (
                          <div key={i}>{renderMessageContent(line)}</div>
                        ))}
                    </div>
                    {msg.role === "assistant" && (
                      <div className="message-actions" data-message-id={msg.id}>
                        <div className="feedback-buttons">
                          <button
                            className={`feedback-btn positive ${
                              msg.feedback?.rating === "positive"
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => handleFeedback(msg.id, "positive")}
                            title={
                              msg.feedback?.rating === "positive"
                                ? "You rated this helpful"
                                : "Good response"
                            }
                          >
                            👍
                          </button>
                          <button
                            className={`feedback-btn negative ${
                              msg.feedback?.rating === "negative"
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => handleFeedback(msg.id, "negative")}
                            title={
                              msg.feedback?.rating === "negative"
                                ? "You rated this not helpful"
                                : "Bad response"
                            }
                          >
                            👎
                          </button>
                        </div>
                        <span className="message-time">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message assistant">
                  <div className="message-avatar">AI</div>
                  <div className="message-content-wrapper">
                    <div className="loading-message-container">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <div className="">
                        Analyzing your query...
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}

        <div className="input-area">
          <div className="input-container">
            <textarea
              placeholder="Send a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={loading}
              rows={1}
              style={{
                minHeight: "50px",
                maxHeight: "200px",
                resize: "none",
                overflowY:
                  message.split("\n").length > 3 ? "auto" : "hidden",
              }}
            />
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!message.trim() || loading}
            >
              {loading ? "⏳" : "➤"}
            </button>
          </div>
          <div className="input-hint">
            Press Enter to send, Shift + Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleRLAgent;
