import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  HelpCircle,
  CheckCircle,
  XCircle,
  X,
  Paperclip,
  Download,
  MessageCircle,
  Plus,
  Trash2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import QuickActions from "./QuickActions";
import { useSelector } from "react-redux";
import chatbotApi from "../../services/chatbotApi";
import { useLocation } from "react-router-dom";

const EnhancedAIMessage = ({ message }) => {
  const [showOriginalSummary, setShowOriginalSummary] = useState(false);

  const thoughts = message.thoughts;
  const actions = message.actions;
  const observations = message.observations;

  const extractDetailedResponse = (observationsData) => {
    if (!observationsData) return null;

    let textToSearch = "";
    if (typeof observationsData === "string") {
      textToSearch = observationsData;
    } else if (typeof observationsData === "object") {
      textToSearch = JSON.stringify(observationsData);
    } else {
      return null;
    }

    const responsePatterns = [
      /Tool.*?Query:.*?\n={10,}\s*\nResponse:\s*([\s\S]*?)(?=Citations?:\s*[-=]+|$)/i,
      /Response:\s*={10,}\s*([\s\S]*?)(?=Citations?:\s*[-=]+|$)/i,
      /Response:\s*([\s\S]*?)(?=Citations?:\s*[-=]+|$)/i,
      /Query:.*?\n={10,}\s*\n([\s\S]*?)(?=Citations?:\s*[-=]+|$)/i,
      /Tool.*?Response:\s*([\s\S]*?)(?=Citations?:\s*[-=]+|$)/i,
      /Tool sonar_search.*?Response:\s*([\s\S]*?)(?=Citations?:\s*[-=]+|Continue processing|$)/i,
      /we found:.*?Response:\s*([\s\S]*?)(?=Citations?:\s*[-=]+|$)/i,
    ];

    for (const pattern of responsePatterns) {
      const match = textToSearch.match(pattern);
      if (match && match[1]) {
        let detailedResponse = match[1].trim();

        detailedResponse = detailedResponse.replace(/^={10,}$/gm, "");
        detailedResponse = detailedResponse.replace(/^-{10,}$/gm, "");
        detailedResponse = detailedResponse.trim();

        if (detailedResponse.length > 100) {
          return detailedResponse;
        }
      }
    }

    return null;
  };

  const detailedResponse = extractDetailedResponse(message.observations);

  const displayContent = detailedResponse || message.content;

  const extractCitations = (observationsData) => {
    if (!observationsData) return [];

    let textToSearch = "";
    if (typeof observationsData === "string") {
      textToSearch = observationsData;
    } else if (typeof observationsData === "object") {
      textToSearch = JSON.stringify(observationsData);
    } else {
      return [];
    }

    const citations = [];
    const seenNumbers = new Set();

    const pattern1 = /\[(\d+)\]\s*(https?:\/\/[^\s\n\]]+)/g;
    let match;
    while ((match = pattern1.exec(textToSearch)) !== null) {
      const number = match[1];
      if (!seenNumbers.has(number)) {
        citations.push({
          number: number,
          url: match[2].trim(),
        });
        seenNumbers.add(number);
      }
    }

    const pattern2 = /\[(\d+)\]:\s*(https?:\/\/[^\s\n]+)/g;
    while ((match = pattern2.exec(textToSearch)) !== null) {
      const number = match[1];
      if (!seenNumbers.has(number)) {
        citations.push({
          number: number,
          url: match[2].trim(),
        });
        seenNumbers.add(number);
      }
    }

    const citationSections = [
      /Citations?:\s*[-=]+\s*((?:\[\d+\][^\n]*https?:\/\/[^\s\n]+[^\n]*\n?)+)/gi,
      /Sources?:\s*[-=]+\s*((?:\[\d+\][^\n]*https?:\/\/[^\s\n]+[^\n]*\n?)+)/gi,
      /References?:\s*[-=]+\s*((?:\[\d+\][^\n]*https?:\/\/[^\s\n]+[^\n]*\n?)+)/gi,
    ];

    citationSections.forEach((regex) => {
      const sectionMatch = regex.exec(textToSearch);
      if (sectionMatch) {
        const urlRegex = /\[(\d+)\][^\n]*?(https?:\/\/[^\s\n]+)/g;
        let urlMatch;
        while ((urlMatch = urlRegex.exec(sectionMatch[1])) !== null) {
          const number = urlMatch[1];
          if (!seenNumbers.has(number)) {
            citations.push({
              number: number,
              url: urlMatch[2].trim(),
            });
            seenNumbers.add(number);
          }
        }
      }
    });

    const pattern4 = /(\d+)\.\s*(https?:\/\/[^\s\n]+)/g;
    while ((match = pattern4.exec(textToSearch)) !== null) {
      const number = match[1];
      if (!seenNumbers.has(number)) {
        citations.push({
          number: number,
          url: match[2].trim(),
        });
        seenNumbers.add(number);
      }
    }

    const pattern5 = /\[(\d+)\]:\s*(https?:\/\/[^\s\n]+)/g;
    while ((match = pattern5.exec(textToSearch)) !== null) {
      const number = match[1];
      if (!seenNumbers.has(number)) {
        citations.push({
          number: number,
          url: match[2].trim(),
        });
        seenNumbers.add(number);
      }
    }

    const pattern6 = /\((\d+)\)\s*(https?:\/\/[^\s\n]+)/g;
    while ((match = pattern6.exec(textToSearch)) !== null) {
      const number = match[1];
      if (!seenNumbers.has(number)) {
        citations.push({
          number: number,
          url: match[2].trim(),
        });
        seenNumbers.add(number);
      }
    }

    const pattern7 = /(https?:\/\/[^\s\n]+)\s*\[(\d+)\]/g;
    while ((match = pattern7.exec(textToSearch)) !== null) {
      const number = match[2];
      if (!seenNumbers.has(number)) {
        citations.push({
          number: number,
          url: match[1].trim(),
        });
        seenNumbers.add(number);
      }
    }

    return citations.sort((a, b) => parseInt(a.number) - parseInt(b.number));
  };

  const citations = extractCitations(message.observations);

  const fallbackCitations =
    citations.length === 0 ? extractCitations(displayContent) : [];
  const finalCitations = citations.length > 0 ? citations : fallbackCitations;

  const EnhancedCitationLink = ({ citation, citationNumber }) => {
    const [cardPosition, setCardPosition] = useState("center");
    const citationRef = useRef(null);

    const handleCitationClick = (url) => {
      window.open(url, "_blank", "noopener,noreferrer");
    };

    const updateCardPosition = () => {
      if (citationRef.current) {
        const citationRect = citationRef.current.getBoundingClientRect();

        const chatbotContainer =
          citationRef.current.closest(".w-96") ||
          citationRef.current.closest('[class*="w-96"]');

        if (chatbotContainer) {
          const containerRect = chatbotContainer.getBoundingClientRect();
          const cardWidth = 192; // w-48 card width
          const buffer = 16; // 1rem buffer

          // Calculate position relative to chatbot container
          const citationCenterX = citationRect.left + citationRect.width / 2;
          const containerLeft = containerRect.left;
          const containerRight = containerRect.right;
          const containerWidth = containerRect.width;

          // Check if centering the card would cause overflow
          const cardLeftIfCentered = citationCenterX - cardWidth / 2;
          const cardRightIfCentered = citationCenterX + cardWidth / 2;

          // If card would overflow right edge, align to right
          if (cardRightIfCentered > containerRight - buffer) {
            setCardPosition("left"); // right-0 positioning
          }
          // If card would overflow left edge, align to left
          else if (cardLeftIfCentered < containerLeft + buffer) {
            setCardPosition("right"); // left-0 positioning
          }
          // Otherwise center
          else {
            setCardPosition("center");
          }
        } else {
          const windowWidth = window.innerWidth;
          const citationLeft = citationRect.left;
          const citationRight = citationRect.right;

          if (citationRight > windowWidth - 100) {
            setCardPosition("left");
          } else if (citationLeft < 100) {
            setCardPosition("right");
          } else {
            setCardPosition("center");
          }
        }
      }
    };

    const handleMouseEnter = () => {
      updateCardPosition();
    };

    if (!citation || !citation.url) {
      return (
        <span className="inline-flex items-center justify-center min-w-5 h-5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full border border-gray-200">
          {citationNumber}
        </span>
      );
    }

    const getDomainName = (url) => {
      try {
        const domain = new URL(url).hostname;
        return domain.replace(/^www\./, "");
      } catch {
        return url
          .replace(/^https?:\/\//, "")
          .split("/")[0]
          .replace(/^www\./, "");
      }
    };

    const getPositionClasses = () => {
      switch (cardPosition) {
        case "left":
          return {
            card: "absolute bottom-full right-0 mb-2 w-48",
            arrow: "absolute top-full right-3",
          };
        case "right":
          return {
            card: "absolute bottom-full left-0 mb-2 w-48",
            arrow: "absolute top-full left-3",
          };
        default:
          return {
            card: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48",
            arrow: "absolute top-full left-1/2 transform -translate-x-1/2",
          };
      }
    };

    const positionClasses = getPositionClasses();

    return (
      <span className="relative inline-block group" ref={citationRef}>
        <button
          onClick={() => handleCitationClick(citation.url)}
          onMouseEnter={handleMouseEnter}
          className="inline-flex items-center ml-1 justify-center min-w-5 h-5 text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:scale-110 cursor-pointer"
          title="Click to open"
        >
          {citationNumber}
        </button>

        <div
          className={`${positionClasses.card} bg-white border border-gray-200 rounded-lg shadow-lg p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto`}
          style={{ zIndex: 9999 }}
        >
          <div className="text-xs text-gray-700 mb-1.5 font-medium bg-gray-50 px-1.5 py-0.5 rounded text-center">
            {getDomainName(citation.url)}
          </div>
          <div className="text-xs text-gray-600 break-all leading-3 max-h-12 overflow-y-auto bg-gray-50 p-1.5 rounded border">
            {citation.url}
          </div>

          <div
            className={`${positionClasses.arrow} w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white`}
          ></div>
          <div
            className={`${positionClasses.arrow} -mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-200`}
          ></div>
        </div>
      </span>
    );
  };

  const formatQuickSummaryText = (text) => {
    if (!text) return text;

    // Simple regex to find **text** and replace with <strong>
    const parts = text.split(/(\*\*[^*]+\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-semibold text-gray-900">
            {boldText}
          </strong>
        );
      }
      return part;
    });
  };

  const formatContentWithCitations = (content) => {
    if (!content || finalCitations.length === 0) {
      return formatTextWithBold(content);
    }

    const citationPattern = /\[(\d+)\]/g;
    const parts = content.split(citationPattern);
    const result = [];

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        if (parts[i]) {
          result.push(formatBoldInLine(parts[i]));
        }
      } else {
        const citationNum = parts[i];
        const citation = finalCitations.find((c) => c.number === citationNum);
        result.push(
          <EnhancedCitationLink
            key={`citation-${i}-${citationNum}`}
            citation={citation}
            citationNumber={citationNum}
          />
        );
      }
    }
    return result.length > 1 ? result : formatTextWithBold(content);
  };

  const formatTextWithBold = (text) => {
    if (!text || typeof text !== "string") return text;

    const lines = text.split("\n");
    const formattedLines = [];

    lines.forEach((line, lineIndex) => {
      if (!line.trim()) {
        formattedLines.push(<br key={`br-${lineIndex}`} />);
        return;
      }

      if (line.match(/^\s*[-*•]\s+/)) {
        const bulletContent = line.replace(/^\s*[-*•]\s+/, "");
        formattedLines.push(
          <div
            key={`bullet-${lineIndex}`}
            className="flex items-start gap-2 my-1"
          >
            <span className="text-blue-600 font-bold mt-0.5 text-xs">•</span>
            <span>{formatBoldInLine(bulletContent)}</span>
          </div>
        );
        return;
      }

      const formattedLine = formatBoldInLine(line);
      formattedLines.push(
        <div key={`line-${lineIndex}`} className="mb-1">
          {formattedLine}
        </div>
      );
    });

    return formattedLines.length > 0 ? formattedLines : text;
  };

  const formatBoldInLine = (text) => {
    if (!text) return text;

    const parts = text.split(/(\*\*.*?\*\*)/g);
    const result = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        result.push(
          <strong key={`bold-${i}`} className="font-semibold text-gray-900">
            {boldText}
          </strong>
        );
      } else if (part) {
        result.push(part);
      }
    }

    return result.length > 1 ? result : text;
  };

  const hasEnhancedData =
    thoughts || actions || observations || message.tool_used;

  return (
    <div className="space-y-3">
      {detailedResponse && message.content && (
        <div className="border border-gray-100 rounded-md">
          <button
            onClick={() => setShowOriginalSummary(!showOriginalSummary)}
            className="w-full flex items-center justify-between p-2 text-xs text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-3 h-3 text-blue-500" />
              <span>Quick Summary</span>
            </div>
            {showOriginalSummary ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
          {showOriginalSummary && (
            <div className="p-3 bg-blue-50 border-t border-gray-100 text-sm text-gray-700 leading-relaxed">
              <div style={{ whiteSpace: "pre-line" }}>
                {formatQuickSummaryText(message.content)}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="whitespace-pre-wrap leading-relaxed">
        {formatContentWithCitations(displayContent)}
      </div>

      {finalCitations.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <div className="text-xs text-gray-600 mb-2 font-semibold flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Sources ({finalCitations.length}):
          </div>
          <div className="space-y-2">
            {finalCitations.map((citation, index) => (
              <div
                key={`source-${citation.number}`}
                className="flex items-start gap-2 text-xs"
              >
                <span className="text-gray-500 font-mono min-w-6 flex-shrink-0">
                  [{citation.number}]
                </span>
                <button
                  onClick={() => window.open(citation.url, "_blank")}
                  className="text-blue-600 hover:text-blue-800 hover:underline flex-1 text-left break-all leading-4 transition-colors"
                  title="Click to open link"
                >
                  {citation.url}
                </button>
                <button
                  onClick={() => window.open(citation.url, "_blank")}
                  className="p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3 h-3 text-blue-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export function Chatbot({ setShowChatbotDropdown, userData, studios }) {
  const ContextStudioData = useSelector(
    (state) => state.admin.ContextStudioData
  );

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentConversation, setCurrentConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showConversations, setShowConversations] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeChatbot();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedFile && selectedFile.type.startsWith("image/")) {
        const previewUrl = getFilePreview(selectedFile);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      }
    };
  }, [selectedFile]);

  const initializeChatbot = async () => {
    try {
      setIsLoading(true);
      await chatbotApi.healthCheck();
      await loadConversations();
    } catch (error) {
      setError("Failed to initialize chatbot. Please try again.");
      console.error("Chatbot initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await chatbotApi.getConversations(1, 20);
      setConversations(response.data || []);
      if (response.data?.length > 0) {
        await loadConversation(response.data[0]);
      }
      if (response.data?.length === 0) {
        await createNewConversation();
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const loadConversation = async (conversation) => {
    try {
      setIsLoading(true);
      setCurrentConversation(conversation);

      const messagesResponse = await chatbotApi.getMessages(conversation.id);

      const transformedMessages =
        messagesResponse.data?.map((msg) => ({
          id: msg.id.toString(),
          type: msg.message_type === "ai_response" ? "assistant" : "user",
          content: msg.content,
          timestamp: new Date(msg.created_at),
          attachments: msg.attachments || [],
          ...(msg.message_type === "ai_response" && {
            thoughts: msg.thoughts,
            actions: msg.actions,
            observations: msg.observations,
            tool_used: msg.tool_used,
            query: msg.query,
            response_message: msg.response_message,
          }),
        })) || [];

      if (transformedMessages.length === 0) {
        transformedMessages.unshift({
          id: "welcome",
          type: "assistant",
          content:
            "Hello! I'm your GameDev Assistant. How can I help you with your mobile game development today?",
          timestamp: new Date(),
        });
      }

      setMessages(transformedMessages);
    } catch (error) {
      setError("Failed to load conversation. Please try again.");
      console.error("Error loading conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async (title = "New Conversation") => {
    try {
      setIsCreatingConversation(true);
      const response = await chatbotApi.createConversation(title);
      const newConversation = response.data;

      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      setMessages([
        {
          id: "welcome",
          type: "assistant",
          content:
            "Hello! I'm your GameDev Assistant. How can I help you with your mobile game development today?",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setError("Failed to create new conversation.");
      console.error("Error creating conversation:", error);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await chatbotApi.deleteConversation(conversationId);
      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );

      if (currentConversation?.id === conversationId) {
        const remainingConversations = conversations.filter(
          (conv) => conv.id !== conversationId
        );
        if (remainingConversations.length > 0) {
          await loadConversation(remainingConversations[0]);
        } else {
          await createNewConversation();
        }
      }
    } catch (error) {
      setError("Failed to delete conversation.");
      console.error("Error deleting conversation:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedFile) return;
    if (!currentConversation) {
      setError("No active conversation. Please create a new conversation.");
      return;
    }

    try {
      setIsTyping(true);
      setError(null);

      if (selectedFile) {
        chatbotApi.validateFile(selectedFile);
      }

      // Store values before clearing UI to ensure API call has access to them
      // while immediately improving UX by clearing the attachment preview
      const messageContent = inputValue || `[File: ${selectedFile?.name}]`;
      const fileToSend = selectedFile;

      const userMessage = {
        id: Date.now().toString(),
        type: "user",
        content: messageContent,
        timestamp: new Date(),
        attachments: selectedFile ? [{ original_name: selectedFile.name }] : [],
      };
      setMessages((prev) => [...prev, userMessage]);

      // Clear input immediately after creating user message for better UX
      setInputValue("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      const aiTool = location.pathname.includes("/ua-intelligence/analyse")
        ? "creative-analysis"
        : location.pathname.includes("/ua-intelligence/brief-generator")
        ? "brief-generator"
        : location.pathname.includes("/ua-intelligence")
        ? "smart-feed"
        : location.pathname.includes("/smart-feedback")
        ? "commpac"
        : location.pathname.includes("/templates")
        ? "commpac-reply-templates"
        : location.pathname.includes("/review-insights")
        ? "commpac-review-insights"
        : location.pathname.includes("/weekly-report")
        ? "commpac-weekly-report"
        : location.pathname.includes("/organic-ua/competitor-analysis")
        ? "commpac-competitor-analysis"
        : location.pathname.includes("/aso-texts")
        ? "asopac-metadata"
        : location.pathname.includes("/ad-copies")
        ? "asopac-adcopies"
        : location.pathname.includes("/aso-assistant/competitor-analysis")
        ? "asopac-competitor-analysis"
        : (location.pathname.includes("/app-icon") || location.pathname.includes("/aso-assistant"))
        ? "asopac-app-icon"
        : location.pathname.split("/")[location.pathname.split("/").length - 1];


      const response = await chatbotApi.sendMessage(
        currentConversation.id,
        messageContent,
        fileToSend,
        aiTool
      );

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
        };
        setMessages((prev) => [...prev, aiMessage]);
      }

    } catch (error) {
      setError(error.message || "Failed to send message. Please try again.");
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        chatbotApi.validateFile(file);
        setSelectedFile(file);
        setError(null);
      } catch (error) {
        setError(error.message);
        event.target.value = "";
      }
    }
  };

  const removeSelectedFile = () => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const previewUrl = getFilePreview(selectedFile);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    }

    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFilePreview = (file) => {
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith("image/")) return "🖼️";
    if (file.type === "application/pdf") return "📄";
    if (file.type.includes("document") || file.type.includes("word"))
      return "📝";
    if (file.type === "text/plain") return "📄";
    if (file.type.startsWith("video/")) return "🎥";
    return "📁";
  };

  const downloadAttachment = async (attachment) => {
    try {
      const response = await chatbotApi.downloadAttachment(attachment.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", attachment.original_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError("Failed to download file.");
      console.error("Error downloading attachment:", error);
    }
  };

  const showConfirmation = (message, onConfirm) => {
    setConfirmation({
      id: Date.now().toString(),
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmation(null);
      },
      onCancel: () => setConfirmation(null),
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <div className="fixed bottom-0 right-0 z-50 w-96 max-w-[calc(100vw-2rem)]">
        <div className="bg-white/95 backdrop-blur-sm border border-green-200 shadow-2xl rounded-s-lg h-[calc(100vh-56px)] relative">
          <div className="p-4 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-lime-400 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    GameDev Assistant
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isLoading
                      ? "Loading..."
                      : currentConversation
                      ? "Online"
                      : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConversations(!showConversations)}
                  className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors"
                  title="Conversations"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => createNewConversation()}
                  disabled={isCreatingConversation}
                  className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50"
                  title="New Conversation"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowChatbotDropdown(false)}
                  className="h-8 w-8 p-0 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {showConversations && (
            <div className="absolute top-[65px] left-0 right-0 bg-white border-b border-gray-200 max-h-48 overflow-y-auto z-20">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex items-center justify-between ${
                    currentConversation?.id === conv.id ? "bg-green-50" : ""
                  }`}
                  onClick={() => {
                    loadConversation(conv);
                    setShowConversations(false);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conv.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showConfirmation(
                        `Delete conversation "${conv.title}"?`,
                        () => deleteConversation(conv.id)
                      );
                    }}
                    className="p-1 hover:bg-red-100 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="absolute top-[65px] left-0 right-0 z-10">
            <QuickActions ContextStudioData={ContextStudioData} />
          </div>

          {error && (
            <div className="absolute top-[165px] left-4 right-4 bg-red-50 border border-red-200 rounded-md p-3 z-10">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto p-1 hover:bg-red-100 rounded-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <div
            className={`pt-[100px] pb-[120px] h-[calc(100vh-194px)] overflow-y-auto p-4 space-y-3 ${
              error ? "pt-[200px]" : ""
            }`}
          >
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-lime-400 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Loading conversation...
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
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
                    {message.type === "assistant" ? (
                      <EnhancedAIMessage message={message} />
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap">{message.content}</p>

                        {/* Attachments */}
                        {message.attachments?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 rounded-md bg-white/20"
                              >
                                <Paperclip className="w-3 h-3" />
                                <span className="text-xs truncate flex-1">
                                  {attachment.original_name}
                                </span>
                                {/* {attachment.id && (
                                  <button
                                    onClick={() =>
                                      downloadAttachment(attachment)
                                    }
                                    className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                                  >
                                    <Download className="w-3 h-3" />
                                  </button>
                                )} */}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    <p
                      className={`text-xs mt-1 ${
                        message.type === "user"
                          ? "text-green-100"
                          : "text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.type === "user" && (
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-3 h-3 text-gray-600" />
                    </div>
                  )}
                </div>
              ))
            )}

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

          <div className="p-4 border-t relative">
            {selectedFile && (
              <div className="absolute bottom-full left-4 right-4 mb-2 z-20 transform transition-all duration-200 ease-out opacity-100">
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center gap-3">
                  {getFilePreview(selectedFile) ? (
                    <div className="relative group">
                      <img
                        src={getFilePreview(selectedFile)}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-md border border-gray-200 transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute -top-1 -right-1">
                        <button
                          onClick={removeSelectedFile}
                          className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group">
                      <div className="w-12 h-12 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-lg transition-transform duration-200 group-hover:scale-105">
                        {getFileIcon(selectedFile)}
                      </div>
                      <div className="absolute -top-1 -right-1">
                        <button
                          onClick={removeSelectedFile}
                          className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                      {selectedFile.type.split("/")[0]}
                    </p>
                  </div>

                  <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Ready
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,video/*"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`px-1 py-2 rounded-md transition-colors flex items-center justify-center ${
                  selectedFile
                    ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  selectedFile
                    ? "Add a message with your file..."
                    : "Ask about game development..."
                }
                disabled={isTyping || !currentConversation}
                className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={
                  (!inputValue.trim() && !selectedFile) ||
                  isTyping ||
                  !currentConversation
                }
                className="px-3 py-2 bg-gradient-to-r from-green-400 to-lime-400 hover:from-green-500 hover:to-lime-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-all duration-200 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-lg">
            <div className="p-4 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-green-600" />
                Confirmation
              </h3>
            </div>

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
  );
}
