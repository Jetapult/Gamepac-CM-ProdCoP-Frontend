import { useState, useRef, useEffect } from "react"
import {
  MessageCircle,
  Send,
  Minimize2,
  Bot,
  User,
  Gamepad2,
  Code,
  Palette,
  Settings,
  HelpCircle,
  CheckCircle,
  XCircle,
  MessageSquareMore,
  MessageSquareText,
} from "lucide-react"

export function Chatbot() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your GameDev Assistant. How can I help you with your mobile game development today?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const messagesEndRef = useRef(null)

  const quickActions = [
    {
      id: "code-help",
      label: "Code Help",
      icon: <Code className="w-4 h-4" />,
      description: "Get coding assistance and debugging help",
    },
    {
      id: "design-tips",
      label: "Design Tips",
      icon: <Palette className="w-4 h-4" />,
      description: "UI/UX design guidance for mobile games",
    },
    {
      id: "game-mechanics",
      label: "Game Mechanics",
      icon: <Gamepad2 className="w-4 h-4" />,
      description: "Advice on game mechanics and features",
    },
    {
      id: "optimization",
      label: "Optimization",
      icon: <Settings className="w-4 h-4" />,
      description: "Performance optimization tips",
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (content, type) => {
    const newMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const simulateAssistantResponse = (userMessage) => {
    setIsTyping(true)

    setTimeout(() => {
      let response = ""

      if (userMessage.toLowerCase().includes("code") || userMessage.toLowerCase().includes("bug")) {
        response =
          "I can help you with coding issues! What specific problem are you facing? Is it related to Unity, Unreal Engine, or native mobile development?"
      } else if (userMessage.toLowerCase().includes("design") || userMessage.toLowerCase().includes("ui")) {
        response =
          "Great question about design! For mobile games, consider touch-friendly interfaces, clear visual hierarchy, and responsive layouts. What type of game are you designing?"
      } else if (userMessage.toLowerCase().includes("performance") || userMessage.toLowerCase().includes("optimize")) {
        response =
          "Performance optimization is crucial for mobile games. Key areas to focus on: texture compression, efficient rendering, memory management, and battery usage. Would you like specific tips for any of these?"
      } else if (userMessage.toLowerCase().includes("monetization") || userMessage.toLowerCase().includes("ads")) {
        response =
          "For monetization, consider: in-app purchases, rewarded video ads, banner ads, and subscription models. The key is balancing revenue with user experience. What monetization strategy interests you?"
      } else {
        response =
          "That's an interesting question! I'm here to help with all aspects of mobile game development. Could you provide more details about what you're working on?"
      }

      setIsTyping(false)
      addMessage(response, "assistant")
    }, 1500)
  }

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      addMessage(inputValue, "user")
      simulateAssistantResponse(inputValue)
      setInputValue("")
    }
  }

  const handleQuickAction = (action) => {
    addMessage(`I need help with: ${action.label}`, "user")

    setTimeout(() => {
      let response = ""
      switch (action.id) {
        case "code-help":
          response =
            "I'm ready to help with your coding challenges! Please share your code snippet or describe the issue you're facing. I can assist with Unity C#, Java/Kotlin for Android, Swift/Objective-C for iOS, and cross-platform frameworks."
          break
        case "design-tips":
          response =
            "Here are some key mobile game design principles:\n\n• Keep UI elements large enough for touch interaction (44px minimum)\n• Use consistent visual language and color schemes\n• Implement intuitive gesture controls\n• Design for different screen sizes and orientations\n\nWhat specific design challenge are you working on?"
          break
        case "game-mechanics":
          response =
            "Let's discuss game mechanics! Popular mobile game mechanics include:\n\n• Progressive difficulty curves\n• Achievement and reward systems\n• Social features and leaderboards\n• Daily challenges and events\n• Gacha/collection mechanics\n\nWhat type of game are you developing?"
          break
        case "optimization":
          response =
            "Mobile optimization is essential! Here are key areas to focus on:\n\n• Reduce draw calls and optimize rendering\n• Compress textures and audio files\n• Implement object pooling\n• Optimize battery usage\n• Test on various devices\n\nWhich aspect would you like to dive deeper into?"
          break
      }
      setIsTyping(false)
      addMessage(response, "assistant")
    }, 1000)

    setIsTyping(true)
  }

  const showConfirmation = (message, onConfirm) => {
    setConfirmation({
      id: Date.now().toString(),
      message,
      onConfirm: () => {
        onConfirm()
        setConfirmation(null)
      },
      onCancel: () => setConfirmation(null),
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-green-400 to-lime-400 hover:from-green-500 hover:to-lime-500 shadow-lg flex items-center justify-center text-white transition-all duration-200"
        >
          <MessageSquareText className="w-6 h-6" />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
        <div className="bg-white/95 backdrop-blur-sm border border-green-200 shadow-2xl rounded-lg">
          {/* Header */}
          <div className="p-4 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-lime-400 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">GameDev Assistant</h3>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsExpanded(false)} 
                className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "assistant" && (
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-lime-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-green-400 to-lime-400 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.type === "user" ? "text-green-100" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {message.type === "user" && (
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3 h-3 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-lime-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t bg-gray-50/50">
            <p className="text-xs text-gray-600 mb-2">Quick Actions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center justify-start gap-2 h-auto p-2 text-xs border border-gray-200 rounded-md hover:bg-gray-50 transition-colors bg-white"
                  title={action.description}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about game development..."
                className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="px-3 py-2 bg-gradient-to-r from-green-400 to-lime-400 hover:from-green-500 hover:to-lime-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-all duration-200 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Example actions */}
            <div className="mt-2 flex gap-2">
              <button
                onClick={() =>
                  showConfirmation("Do you want to clear the chat history?", () =>
                    setMessages([
                      {
                        id: "1",
                        type: "assistant",
                        content: "Chat cleared! How can I help you with your mobile game development?",
                        timestamp: new Date(),
                      },
                    ]),
                  )
                }
                className="text-xs h-6 px-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                Clear Chat
              </button>
              <button
                onClick={() =>
                  showConfirmation("Would you like to see advanced development resources?", () =>
                    addMessage(
                      "Here are some advanced resources:\n\n• Unity Mobile Optimization Guide\n• Mobile Game Analytics Setup\n• Cross-platform Development Best Practices\n• App Store Optimization Tips",
                      "assistant",
                    ),
                  )
                }
                className="text-xs h-6 px-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                Resources
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-lg">
            {/* Dialog Header */}
            <div className="p-4 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-green-600" />
                Confirmation
              </h3>
            </div>
            
            {/* Dialog Content */}
            <div className="p-4">
              <p className="text-gray-700 mb-4">{confirmation.message}</p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={confirmation.onCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors bg-transparent"
                >
                  <XCircle className="w-4 h-4" />
                  No
                </button>
                <button
                  onClick={confirmation.onConfirm}
                  className="bg-gradient-to-r from-green-400 to-lime-400 hover:from-green-500 hover:to-lime-500 flex items-center gap-2 px-4 py-2 text-white rounded-md transition-all duration-200"
                >
                  <CheckCircle className="w-4 h-4" />
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
