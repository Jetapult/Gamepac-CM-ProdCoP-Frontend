import React, { useState, useRef, useEffect } from "react";
import Message from "./messages/Message";
import ChatInput from "./ChatInput";
import thinkingSphere from "../../assets/thinking_sphere.gif";

const ConversationPanel = ({ onTaskUpdate, onThinkingChange }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "user",
      type: "attachment",
      data: {
        name: "Mobile Review Spreadsheet...",
        type: "Spreadsheet",
        size: "9.16 Mb",
      },
    },
    {
      id: 2,
      sender: "user",
      type: "text",
      data: {
        content: "Generate a professional sentiment analysis report",
      },
    },
    {
      id: 3,
      sender: "llm",
      type: "text",
      data: {
        content:
          "Understood, I will analyze the sentiment data in the provided CSV file and create a summary of the major sentiment analysis of different games.",
        agentName: "GamePac",
      },
    },
    {
      id: 4,
      sender: "llm",
      type: "task",
      data: {
        title: "Load and explore the sentiment data",
        description:
          "I understand the task is to analyze sentiment data from the CSV file. Next, I will load and explore the dataset to identify patterns and issues across different games.",
        actions: [
          {
            id: 1,
            type: "reading",
            text: "Reading file",
            detail: "Mobile Review Spreadsheet.csv",
            status: "completed",
          },
          {
            id: 2,
            type: "executing",
            text: "Executing command",
            detail: "pip3 install pandas",
            status: "completed",
          },
          {
            id: 3,
            type: "creating",
            text: "Creating file",
            detail: "sentiment_analysis_detailed.py",
            status: "completed",
          },
          {
            id: 4,
            type: "reading",
            text: "Reading file",
            detail: "Mobile Review Spreadsheet.csv",
            status: "completed",
          },
          {
            id: 5,
            type: "reading",
            text: "Reading file",
            detail: "Mobile Review Spreadsheet.csv",
            status: "in-progress",
          },
        ],
        relatedActions: ["balancing problems", "technical bugs"],
      },
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const messagesEndRef = useRef(null);

  // Task simulation
  const tasks = [
    "Investigate Game Preferences and Genres",
    "Analyze Social and Community Aspects",
    "Synthesize findings and create comprehensive report",
    "Deliver the research summary to the user",
    "Finalizing document structure",
  ];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Timer for task progress
  useEffect(() => {
    let timer;
    if (isThinking && currentTask) {
      timer = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1;
          // Notify parent of time update
          if (onTaskUpdate) {
            onTaskUpdate(currentTask, currentTaskIndex, newTime, tasks);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isThinking, currentTask, currentTaskIndex, onTaskUpdate]);

  const simulateAIResponse = async (userMessage) => {
    setIsThinking(true);
    if (onThinkingChange) onThinkingChange(true);
    setElapsedTime(0);

    // Wait 2 seconds before starting tasks (simulating LLM response time)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Execute tasks one by one
    for (let i = 0; i < tasks.length; i++) {
      setCurrentTask(tasks[i]);
      setCurrentTaskIndex(i + 1);
      setElapsedTime(0);

      // Notify parent component with all tasks
      if (onTaskUpdate) {
        onTaskUpdate(tasks[i], i + 1, 0, tasks);
      }

      // Wait 5 seconds per task
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    // Clear task state
    setCurrentTask(null);
    setCurrentTaskIndex(0);
    setElapsedTime(0);
    setIsThinking(false);
    if (onThinkingChange) onThinkingChange(false);

    // Notify parent that tasks are complete
    if (onTaskUpdate) {
      onTaskUpdate(null, 0, 0, []);
    }

    // Add AI response
    const aiResponse = {
      id: Date.now(),
      sender: "llm",
      type: "text",
      data: {
        content: `I understand you want me to: "${userMessage}". I've completed the analysis and here are the findings.`,
        agentName: "GamePac",
        relatedActions: ["balancing problems", "technical bugs"],
      },
    };

    setMessages((prev) => [...prev, aiResponse]);
  };

  const handleSendMessage = (content) => {
    if (!content.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "user",
      type: "text",
      data: {
        content: content.trim(),
      },
    };

    setMessages([...messages, newMessage]);

    // Trigger AI response simulation
    simulateAIResponse(content.trim());
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {messages.map((message, index) => {
          // Find the last user message index
          const lastUserMessageIndex = messages
            .map((m, i) => (m.sender === "user" ? i : -1))
            .filter((i) => i !== -1)
            .pop();
          // Find the last LLM message index
          const lastLLMMessageIndex = messages
            .map((m, i) => (m.sender === "llm" ? i : -1))
            .filter((i) => i !== -1)
            .pop();

          const isLatestUserMessage =
            message.sender === "user" && index === lastUserMessageIndex;
          // Don't mark as latest LLM if thinking (so related actions hide)
          const isLatestLLMMessage =
            !isThinking &&
            message.sender === "llm" &&
            index === lastLLMMessageIndex;

          return (
            <Message
              key={message.id}
              message={message}
              isLatest={isLatestUserMessage || isLatestLLMMessage}
              onSendMessage={handleSendMessage}
            />
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-[9px]">
            <div className="w-4 h-4 shrink-0">
              <img
                src={thinkingSphere}
                alt="Thinking"
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="text-base text-black"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              Gamepac is thinking...
            </span>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 pb-4">
        <ChatInput onSendMessage={handleSendMessage} isThinking={isThinking} />
      </div>
    </div>
  );
};

export default ConversationPanel;
