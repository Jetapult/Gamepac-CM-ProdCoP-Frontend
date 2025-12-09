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

    // Create a temporary streaming assistant message
    const tempAssistantMessage = {
      id: "temp-assistant-" + Date.now(),
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      toolsUsed: [],
      metadata: {},
      isStreaming: true,
      streamingData: {
        thinking: "",
        response: "",
        tools: [],
        currentIteration: 0
      }
    };

    // Update UI immediately with user message and empty assistant message
    setCurrentConversation({
      ...currentConversation,
      messages: [...currentConversation.messages, tempUserMessage, tempAssistantMessage],
    });

    setLoading(true);

    try {
      let thinkingContent = "";
      let responseContent = "";
      let toolsUsed = [];
      let currentIteration = 0;

      await rlAgentAPI.sendMessageStream(
        currentConversation.id,
        messageText,
        {
          onIterationStart: (data) => {
            console.log('🔄 Iteration started:', data);
            currentIteration = data.iteration || (currentIteration + 1);

            // Update streaming data
            setCurrentConversation((prev) => ({
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === tempAssistantMessage.id
                  ? {
                      ...msg,
                      streamingData: {
                        ...msg.streamingData,
                        currentIteration
                      }
                    }
                  : msg
              ),
            }));
          },
          onThinkingToken: (token) => {
            console.log('🧠 Thinking token received:', token);
            thinkingContent += token;

            // Try to parse the JSON and extract just the reasoning
            let displayThinking = thinkingContent;
            try {
              // If it looks like complete JSON, parse it
              if (thinkingContent.trim().startsWith('{') && thinkingContent.trim().endsWith('}')) {
                const parsed = JSON.parse(thinkingContent);
                displayThinking = parsed.reasoning || thinkingContent;
              }
            } catch (e) {
              // If parsing fails, just show the raw content
              displayThinking = thinkingContent;
            }

            // Update display in real-time
            setCurrentConversation((prev) => ({
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === tempAssistantMessage.id
                  ? {
                      ...msg,
                      streamingData: {
                        ...msg.streamingData,
                        thinking: displayThinking,
                        rawThinking: thinkingContent
                      }
                    }
                  : msg
              ),
            }));
          },
          onThinkingComplete: () => {
            console.log('✅ Thinking complete');
          },
          onResponseToken: (token) => {
            console.log('📝 Response token received:', token);
            responseContent += token;

            // Update the streaming message with response content
            setCurrentConversation((prev) => ({
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === tempAssistantMessage.id
                  ? {
                      ...msg,
                      streamingData: {
                        ...msg.streamingData,
                        response: responseContent
                      }
                    }
                  : msg
              ),
            }));
          },
          onToolUse: (toolData) => {
            console.log('🔧 Tool used:', toolData);
            toolsUsed.push(toolData);

            // Update tools in streaming data
            setCurrentConversation((prev) => ({
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === tempAssistantMessage.id
                  ? {
                      ...msg,
                      streamingData: {
                        ...msg.streamingData,
                        tools: [...toolsUsed]
                      }
                    }
                  : msg
              ),
            }));
          },
          onToolResult: (toolData) => {
            console.log('🔧 Tool result received:', toolData);
          },
          onComplete: async (data) => {
            console.log('=== onComplete called ===');
            console.log('Response content accumulated:', responseContent);
            console.log('Trajectory data:', data.trajectory);

            // Extract all reasoning from thinking content
            let allReasoning = [];
            const thinkingLines = thinkingContent.split('}{');
            thinkingLines.forEach((line, idx) => {
              try {
                let jsonStr = line;
                if (idx > 0) jsonStr = '{' + jsonStr;
                if (idx < thinkingLines.length - 1) jsonStr = jsonStr + '}';

                const parsed = JSON.parse(jsonStr);
                if (parsed.reasoning) {
                  allReasoning.push(parsed.reasoning);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            });

            const displayThinking = allReasoning.length > 0
              ? allReasoning.join('\n\n---\n\n')
              : thinkingContent;

            // Mark the streaming message as complete
            setCurrentConversation((prev) => {
              const updatedMessages = prev.messages.map((msg) =>
                msg.id === tempAssistantMessage.id
                  ? {
                      ...msg,
                      isStreaming: false,
                      content: responseContent,
                      streamingData: undefined,
                      metadata: {
                        ...msg.metadata,
                        trajectory: data.trajectory,
                        thinking: displayThinking,
                        toolsUsed: toolsUsed
                      }
                    }
                  : msg
              );

              return {
                ...prev,
                messages: updatedMessages,
                updatedAt: new Date().toISOString()
              };
            });

            // Update conversation in the list
            setConversations((prevConvs) =>
              prevConvs.map((conv) =>
                conv.id === currentConversation.id
                  ? {
                      ...conv,
                      updatedAt: new Date().toISOString(),
                      lastMessage: responseContent.substring(0, 100)
                    }
                  : conv
              )
            );

            setLoading(false);
          },
          onError: (errorData) => {
            console.error("Streaming error:", errorData);

            // Extract error message from the error data
            const errorMessage = errorData?.error || errorData?.message ||
              "Failed to send message. The RL agent might be taking longer than expected. Please try again or check back later.";

            alert(errorMessage);

            // Remove the temp messages on error
            setCurrentConversation({
              ...currentConversation,
              messages: currentConversation.messages.filter(
                (msg) => msg.id !== tempUserMessage.id && msg.id !== tempAssistantMessage.id
              ),
            });
            setLoading(false);
          },
        }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      alert(
        "Failed to send message. The RL agent might be taking longer than expected. Please try again or check back later."
      );

      // Remove the temp messages on error
      setCurrentConversation({
        ...currentConversation,
        messages: currentConversation.messages.filter(
          (msg) => msg.id !== tempUserMessage.id
        ),
      });
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

      // Just use the conversation as-is from the backend
      // The content field already contains everything formatted correctly
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
                    {/* Show streaming content for assistant */}
                    {msg.role === "assistant" && msg.isStreaming && msg.streamingData && (
                      <>
                        {/* Show thinking if available */}
                        {msg.streamingData.thinking && (
                          <div className="thinking-section">
                            <div className="thinking-header">
                              <span className="thinking-icon">🧠</span>
                              <span className="thinking-label">Analyzing & Planning</span>
                            </div>
                            <div className="thinking-content">
                              <p className="thinking-text">{msg.streamingData.thinking}</p>
                            </div>
                          </div>
                        )}

                        {/* Show tools being used */}
                        {msg.streamingData.tools && msg.streamingData.tools.length > 0 && (
                          <div className="tools-section">
                            <div className="tools-header">
                              <span className="tools-icon">🔧</span>
                              <span className="tools-label">Tools Used</span>
                            </div>
                            <div className="tools-list">
                              {msg.streamingData.tools.map((tool, idx) => (
                                <div key={idx} className="tool-item">
                                  <div className="tool-name">{tool.tool_name || tool.name}</div>
                                  {tool.tool_args && (
                                    <div className="tool-args">
                                      {typeof tool.tool_args === 'string'
                                        ? tool.tool_args
                                        : JSON.stringify(tool.tool_args, null, 2)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Show response as it streams */}
                        {msg.streamingData.response && (
                          <div className="response-section">
                            <div className="response-header">
                              <span className="response-icon">✨</span>
                              <span className="response-label">Final Answer</span>
                            </div>
                            <div className="message-content">
                              <p className="response-text">{msg.streamingData.response}</p>
                            </div>
                          </div>
                        )}

                        {/* Show typing indicator if no content yet */}
                        {!msg.streamingData.thinking && !msg.streamingData.response && !msg.streamingData.tools?.length && (
                          <div className="loading-state">
                            <div className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                            <span className="loading-text">Processing your request...</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Show completed message content */}
                    {msg.role === "assistant" && !msg.isStreaming && (
                      <>
                        {/* Show thinking if available in metadata - SAME AS STREAMING */}
                        {msg.metadata?.thinking && (
                          <div className="thinking-section">
                            <div className="thinking-header">
                              <span className="thinking-icon">🧠</span>
                              <span className="thinking-label">Analyzing & Planning</span>
                            </div>
                            <div className="thinking-content">
                              {msg.metadata.thinking.split('\n\n---\n\n').map((reasoning, idx) => (
                                <div key={idx} className="reasoning-step">
                                  {idx > 0 && <div className="step-divider"></div>}
                                  <p className="thinking-text">{reasoning}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Show tools used if available - SAME AS STREAMING */}
                        {msg.metadata?.toolsUsed && msg.metadata.toolsUsed.length > 0 && (
                          <div className="tools-section">
                            <div className="tools-header">
                              <span className="tools-icon">🔧</span>
                              <span className="tools-label">Tools Used</span>
                            </div>
                            <div className="tools-list">
                              {msg.metadata.toolsUsed.map((tool, idx) => (
                                <div key={idx} className="tool-item">
                                  <div className="tool-name">{tool.tool_name || tool.name}</div>
                                  {tool.tool_args && (
                                    <div className="tool-args">
                                      {typeof tool.tool_args === 'string'
                                        ? tool.tool_args
                                        : JSON.stringify(tool.tool_args, null, 2)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Show final response - SAME AS STREAMING */}
                        {msg.content && (
                          <div className="response-section">
                            <div className="response-header">
                              <span className="response-icon">✨</span>
                              <span className="response-label">Final Answer</span>
                            </div>
                            <div className="message-content">
                              <p className="response-text">{msg.content}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Show user message content */}
                    {msg.role === "user" && (
                      <div className="message-content">
                        <pre>{msg.content}</pre>
                      </div>
                    )}

                    {/* Display Trajectory Analysis if available */}
                    {(() => {
                      // Get trajectory from either metadata.trajectory or metadata.complete.trajectory
                      const trajectory = msg.metadata?.trajectory || msg.metadata?.complete?.trajectory;

                      if (msg.role === "assistant" && !msg.isStreaming && trajectory) {
                        return (
                          <div className="trajectory-details-open">
                            <div className="trajectory-header">
                              🔍 Analysis & Research Steps
                            </div>
                            <div className="trajectory-content">
                              {/* Analysis Summary */}
                              {trajectory.final?.analysis && (
                                <div className="trajectory-section">
                                  <h4>📊 Analysis Summary</h4>
                                  <p>{trajectory.final.analysis.summary}</p>

                                  {/* Key Findings */}
                                  {trajectory.final.analysis.key_findings && (
                                    <div className="key-findings">
                                      <h5>Key Findings:</h5>
                                      {trajectory.final.analysis.key_findings.map((finding, idx) => (
                                        <div key={idx} className="finding-item">
                                          <strong>Claim:</strong> {finding.claim}
                                          <br />
                                          <em>Evidence:</em> {finding.evidence}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Risk Flags */}
                                  {trajectory.final.analysis.risk_flags && trajectory.final.analysis.risk_flags.length > 0 && (
                                    <div className="risk-flags">
                                      <h5>⚠️ Risk Flags:</h5>
                                      <ul>
                                        {trajectory.final.analysis.risk_flags.map((flag, idx) => (
                                          <li key={idx}>{flag}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Research Steps */}
                              {trajectory.steps && (
                                <div className="trajectory-section">
                                  <h4>🔬 Research Steps ({trajectory.steps.length})</h4>
                                  {trajectory.steps.map((step, idx) => (
                                    <div key={idx} className="step-item">
                                      <div className="step-header">
                                        <span className="step-number">Step {step.iteration}</span>
                                        <span className="step-tool">{step.tool_name}</span>
                                      </div>
                                      {step.tool_args && (
                                        <div className="step-args">
                                          <strong>Query:</strong> {step.tool_args.query || JSON.stringify(step.tool_args)}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {msg.role === "assistant" && !msg.isStreaming && (
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
