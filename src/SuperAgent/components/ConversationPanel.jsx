import React from "react";
import Message from "./messages/Message";
import ChatInput from "./ChatInput";

const ConversationPanel = () => {
  // Sample messages - replace with actual data from props/state
  const messages = [
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
      },
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </div>

      {/* Input Area */}
      <ChatInput />
    </div>
  );
};

export default ConversationPanel;
