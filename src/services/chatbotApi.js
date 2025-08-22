import api from '../api';

class ChatbotApiService {
  constructor() {
    this.baseUrl = '/v1/ai-chat';
  }

  // Health check
  async healthCheck() {
    try {
      const response = await api.get(`${this.baseUrl}/health`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Conversation Management
  async createConversation(title = 'New Conversation') {
    try {
      const response = await api.post(`${this.baseUrl}/conversations`, { title });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getConversations(page = 1, limit = 10) {
    try {
      const response = await api.get(`${this.baseUrl}/conversations?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getConversation(conversationId) {
    try {
      const response = await api.get(`${this.baseUrl}/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteConversation(conversationId) {
    try {
      const response = await api.delete(`${this.baseUrl}/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Message Management
  async sendMessage(conversationId, content, file = null, aiTool) {
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('ai_tool', aiTool);
      
      if (file) {
        formData.append('file', file);
      }

      const response = await api.post(
        `${this.baseUrl}/conversations/${conversationId}/messages`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMessages(conversationId, page = 1, limit = 50) {
    try {
      const response = await api.get(
        `${this.baseUrl}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // File Management
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`${this.baseUrl}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAttachment(attachmentId) {
    try {
      const response = await api.get(`${this.baseUrl}/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async downloadAttachment(attachmentId) {
    try {
      const response = await api.get(`${this.baseUrl}/attachments/${attachmentId}/download`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1,
      };
    }
  }

  // Utility methods
  isValidFileType(file) {
    const validTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      // Documents
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      // Videos
      'video/mp4', 'video/webm', 'video/ogg'
    ];
    return validTypes.includes(file.type);
  }

  isValidFileSize(file, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  validateFile(file) {
    if (!this.isValidFileType(file)) {
      throw new Error('Invalid file type. Please upload a supported file format.');
    }
    if (!this.isValidFileSize(file)) {
      throw new Error('File size exceeds 10MB limit.');
    }
    return true;
  }
}

export default new ChatbotApiService(); 