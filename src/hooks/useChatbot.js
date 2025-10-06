import { useState, useCallback } from 'react'
import chatbotApi from '../services/chatbotApi'

export const useChatbot = () => {
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback((error, defaultMessage = 'An error occurred') => {
    const errorMessage = error?.message || defaultMessage
    setError(errorMessage)
    console.error('Chatbot error:', error)
  }, [])

  const loadConversations = useCallback(async (page = 1, limit = 20) => {
    try {
      setIsLoading(true)
      const response = await chatbotApi.getConversations(page, limit)
      setConversations(response.data || [])
      return response.data || []
    } catch (error) {
      handleError(error, 'Failed to load conversations')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  const loadConversation = useCallback(async (conversation) => {
    if (!conversation) return

    try {
      setIsLoading(true)
      setCurrentConversation(conversation)
      
      const messagesResponse = await chatbotApi.getMessages(conversation.id)
      
      const transformedMessages = messagesResponse.data?.map(msg => ({
        id: msg.id.toString(),
        type: msg.message_type === 'ai_response' ? 'assistant' : 'user',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        attachments: msg.attachments || []
      })) || []

      // Add welcome message if no messages exist
      if (transformedMessages.length === 0) {
        transformedMessages.unshift({
          id: "welcome",
          type: "assistant",
          content: "Hello! I'm your GameDev Assistant. How can I help you with your mobile game development today?",
          timestamp: new Date(),
        })
      }
      
      setMessages(transformedMessages)
      return transformedMessages
    } catch (error) {
      handleError(error, 'Failed to load conversation')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  const createConversation = useCallback(async (title = 'New Conversation') => {
    try {
      setIsLoading(true)
      const response = await chatbotApi.createConversation(title)
      const newConversation = response.data
      
      setConversations(prev => [newConversation, ...prev])
      return newConversation
    } catch (error) {
      handleError(error, 'Failed to create conversation')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  const deleteConversation = useCallback(async (conversationId) => {
    try {
      await chatbotApi.deleteConversation(conversationId)
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      
      // If deleted conversation was current, clear current conversation
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null)
        setMessages([])
      }
      
      return true
    } catch (error) {
      handleError(error, 'Failed to delete conversation')
      return false
    }
  }, [currentConversation, handleError])

  const sendMessage = useCallback(async (content, file = null, conversationId = null, aiTool) => {
    if (!content?.trim() && !file) return null
    
    const targetConversationId = conversationId || currentConversation?.id
    if (!targetConversationId) {
      setError('No active conversation')
      return null
    }

    try {
      setError(null)
      
      // Validate file if present
      if (file) {
        chatbotApi.validateFile(file)
      }

      // Add user message to UI immediately
      const userMessage = {
        id: Date.now().toString(),
        type: "user",
        content: content || `[File: ${file?.name}]`,
        timestamp: new Date(),
        attachments: file ? [{ original_name: file.name }] : []
      }
      setMessages(prev => [...prev, userMessage])

      // Send message to API
      const response = await chatbotApi.sendMessage(targetConversationId, content, file, aiTool)

      // Add AI response to UI
      if (response.data?.aiResponse) {
        const aiMessage = {
          id: response.data.aiResponse.id.toString(),
          type: "assistant",
          content: response.data.aiResponse.content,
          timestamp: new Date(response.data.aiResponse.created_at),
          thoughts: response.data.aiResponse.thoughts,
          actions: response.data.aiResponse.actions,
          observations: response.data.aiResponse.observations,
          tool_used: response.data.aiResponse.tool_used,
          query: response.data.aiResponse.query,
          response_message: response.data.aiResponse.response_message,
        }
        setMessages(prev => [...prev, aiMessage])
        return aiMessage
      }

      return null
    } catch (error) {
      handleError(error, 'Failed to send message')
      return null
    }
  }, [currentConversation, handleError])

  const uploadFile = useCallback(async (file) => {
    try {
      chatbotApi.validateFile(file)
      const response = await chatbotApi.uploadFile(file)
      return response.data
    } catch (error) {
      handleError(error, 'Failed to upload file')
      return null
    }
  }, [handleError])

  const downloadAttachment = useCallback(async (attachment) => {
    try {
      const response = await chatbotApi.downloadAttachment(attachment.id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', attachment.original_name)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      return true
    } catch (error) {
      handleError(error, 'Failed to download file')
      return false
    }
  }, [handleError])

  const initializeChatbot = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Check API health
      await chatbotApi.healthCheck()
      
      // Load existing conversations
      const loadedConversations = await loadConversations()
      
      // Load the first conversation if available
      if (loadedConversations.length > 0) {
        await loadConversation(loadedConversations[0])
      }
      
      return true
    } catch (error) {
      handleError(error, 'Failed to initialize chatbot')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [loadConversations, loadConversation, handleError])

  return {
    // State
    conversations,
    currentConversation,
    messages,
    isLoading,
    error,

    // Actions
    clearError,
    loadConversations,
    loadConversation,
    createConversation,
    deleteConversation,
    sendMessage,
    uploadFile,
    downloadAttachment,
    initializeChatbot,

    // Setters (for direct state manipulation if needed)
    setConversations,
    setCurrentConversation,
    setMessages,
  }
} 