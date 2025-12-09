import api from '../api';

const API_PREFIX = '/v1/rl-agent';

export const rlAgentAPI = {
  /**
   * Create a new conversation with an optional initial message
   * @param {string} userName - The user's name
   * @param {string} [initialMessage] - Optional initial message to start the conversation
   * @returns {Promise<Object>} The created conversation
   */
  createConversation: async (userName, initialMessage) => {
    try {
      const response = await api.post(`${API_PREFIX}/conversations`, {
        userName,
        ...(initialMessage && { initialMessage }),
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  /**
   * List conversations for a user with optional pagination
   * @param {string} [userName] - Filter by user name (case-insensitive)
   * @param {number} [limit=20] - Number of conversations to return
   * @param {number} [offset=0] - Number of conversations to skip
   * @returns {Promise<Object>} List of conversations with pagination info
   */
  listConversations: async (userName, limit = 20, offset = 0) => {
    try {
      const params = new URLSearchParams();
      if (userName) params.append('userName', userName);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await api.get(`${API_PREFIX}/conversations?${params}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to list conversations');
      }
    } catch (error) {
      console.error('Error listing conversations:', error);
      throw error;
    }
  },

  /**
   * Get a specific conversation by ID
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<Object>} The conversation data
   */
  getConversation: async (conversationId) => {
    try {
      const response = await api.get(`${API_PREFIX}/conversations/${conversationId}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get conversation');
      }
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  },

  /**
   * Send a message in an existing conversation
   * @param {string} conversationId - The conversation ID
   * @param {string} message - The message to send
   * @returns {Promise<Object>} Object containing userMessage and assistantMessage
   */
  sendMessage: async (conversationId, message) => {
    try {
      const response = await api.post(
        `${API_PREFIX}/conversations/${conversationId}/messages`,
        { message }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Provide feedback for a specific message
   * @param {string} conversationId - The conversation ID
   * @param {string} messageId - The message ID
   * @param {'positive'|'negative'} [rating] - The rating (optional)
   * @param {string} [comment] - The feedback comment (optional)
   * @returns {Promise<Object>} The feedback data
   */
  provideFeedback: async (conversationId, messageId, rating, comment) => {
    try {
      const response = await api.post(
        `${API_PREFIX}/conversations/${conversationId}/messages/${messageId}/feedback`,
        {
          ...(rating && { rating }),
          ...(comment && { comment }),
        }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to provide feedback');
      }
    } catch (error) {
      console.error('Error providing feedback:', error);
      throw error;
    }
  },

  /**
   * Get all feedback for a conversation
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<Array>} Array of feedback objects
   */
  getConversationFeedback: async (conversationId) => {
    try {
      const response = await api.get(`${API_PREFIX}/conversations/${conversationId}/feedback`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get feedback');
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
      throw error;
    }
  },

  /**
   * Delete a conversation and all associated messages and feedback
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<Object>} Success response
   */
  deleteConversation: async (conversationId) => {
    try {
      const response = await api.delete(`${API_PREFIX}/conversations/${conversationId}`);

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  /**
   * Send a message with streaming response
   * @param {string} conversationId - The conversation ID
   * @param {string} message - The message to send
   * @param {Object} callbacks - Callback functions for streaming events
   * @param {Function} callbacks.onThinkingToken - Called for each thinking token
   * @param {Function} callbacks.onResponseToken - Called for each response token
   * @param {Function} callbacks.onToolUse - Called when a tool is used
   * @param {Function} callbacks.onIterationStart - Called when a new iteration starts
   * @param {Function} callbacks.onThinkingComplete - Called when thinking completes
   * @param {Function} callbacks.onToolResult - Called when tool execution completes
   * @param {Function} callbacks.onComplete - Called when streaming completes
   * @param {Function} callbacks.onError - Called when an error occurs
   */
  sendMessageStream: async (conversationId, message, callbacks = {}) => {
    try {
      const response = await api.post(
        `${API_PREFIX}/conversations/${conversationId}/messages/stream`,
        { message },
        {
          responseType: 'stream',
          adapter: 'fetch'
        }
      );

      // For browser environment with fetch adapter, axios returns a Response object
      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const event = JSON.parse(line);

              switch (event.type) {
                case 'iteration_start':
                  callbacks.onIterationStart?.(event.data);
                  break;
                case 'thinking_token':
                  callbacks.onThinkingToken?.(event.data.content);
                  break;
                case 'thinking_complete':
                  callbacks.onThinkingComplete?.(event.data);
                  break;
                case 'response_token':
                  callbacks.onResponseToken?.(event.data.content);
                  break;
                case 'synthesis_token':
                  // Synthesis tokens are the actual response content
                  callbacks.onResponseToken?.(event.data.content);
                  break;
                case 'tool_use':
                case 'tool_call':
                  callbacks.onToolUse?.(event.data);
                  break;
                case 'tool_result':
                  callbacks.onToolResult?.(event.data);
                  break;
                case 'complete':
                  callbacks.onComplete?.(event.data);
                  break;
                case 'error':
                  callbacks.onError?.(event.data);
                  break;
                default:
                  // Log unknown events for debugging
                  if (!['start', 'thinking_start', 'synthesis_start', 'jira_start'].includes(event.type)) {
                    console.log('Unknown event type:', event.type, event.data);
                  }
              }
            } catch (parseError) {
              console.error('Error parsing stream event:', parseError, 'Line:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in streaming message:', error);
      callbacks.onError?.(error);
      throw error;
    }
  },
};
