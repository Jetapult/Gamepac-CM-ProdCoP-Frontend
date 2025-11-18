import { Chat } from './components/Chat';
import { ChatInput } from './components/ChatInput';
import { ChatPicker } from './components/ChatPicker';
import { ChatSettings } from './components/ChatSettings';
import { NavBar } from './components/NavBar';
import { Preview } from './components/Preview';
import { toMessageImage } from '@/lib/messages';
import modelsList from '@/lib/models.json';
import templates from '@/lib/templates';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { placeholderChatAPI, placeholderSandboxAPI } from '@/lib/api-placeholder';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function FragmentsPage() {
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';
  const initialTemplate = searchParams.get('template') || 'auto';

  const [chatInput, setChatInput] = useLocalStorage('chat', '');
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  const [languageModel, setLanguageModel] = useLocalStorage('languageModel', {
    model: 'claude-3-5-sonnet-latest',
  });

  const [result, setResult] = useState();
  const [messages, setMessages] = useState([]);
  const [fragment, setFragment] = useState();
  const [currentTab, setCurrentTab] = useState('code');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [error, setError] = useState();

  const filteredModels = modelsList.models;

  const currentModel = filteredModels.find((model) => model.id === languageModel.model);
  const currentTemplate =
    selectedTemplate === 'auto'
      ? templates
      : { [selectedTemplate]: templates[selectedTemplate] };
  const lastMessage = messages[messages.length - 1];

  // Auto-submit if there's an initial prompt from landing page
  useEffect(() => {
    if (
      initialPrompt &&
      !hasAutoSubmitted &&
      messages.length === 0 &&
      !isLoading
    ) {
      console.log('Auto-submitting prompt:', initialPrompt);
      setHasAutoSubmitted(true);
      handleInitialSubmit();
    }
  }, [initialPrompt, hasAutoSubmitted, messages.length, isLoading]);

  async function handleInitialSubmit() {
    const content = [{ type: 'text', text: initialPrompt }];

    const updatedMessages = addMessage({
      role: 'user',
      content,
    });

    await submitToAPI(updatedMessages);

    setChatInput('');
    setCurrentTab('code');
  }

  async function submitToAPI(messagesToSubmit) {
    setIsLoading(true);
    setError(undefined);
    setErrorMessage('');
    setIsRateLimited(false);

    try {
      // Placeholder API call for chat
      const fragmentResult = await placeholderChatAPI({
        messages: messagesToSubmit,
        template: currentTemplate,
        model: currentModel,
        config: languageModel,
      });

      setFragment(fragmentResult);
      const content = [
        { type: 'text', text: fragmentResult.commentary || '' },
        { type: 'code', text: fragmentResult.code || '' },
      ];

      if (!lastMessage || lastMessage.role !== 'assistant') {
        addMessage({
          role: 'assistant',
          content,
          object: fragmentResult,
        });
      }

      if (lastMessage && lastMessage.role === 'assistant') {
        updateMessage({
          content,
          object: fragmentResult,
        });
      }

      // Placeholder API call for sandbox
      setIsPreviewLoading(true);
      const sandboxResult = await placeholderSandboxAPI({
        fragment: fragmentResult,
      });

      setResult(sandboxResult);
      setCurrentPreview({ fragment: fragmentResult, result: sandboxResult });
      updateMessage({ result: sandboxResult });
      setCurrentTab('fragment');
      setIsPreviewLoading(false);
    } catch (err) {
      console.error('Error submitting request:', err);
      if (err.message.includes('limit')) {
        setIsRateLimited(true);
      }
      setErrorMessage(err.message);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }

  function updateMessage(message, index) {
    setMessages((previousMessages) => {
      const updatedMessages = [...previousMessages];
      updatedMessages[index ?? previousMessages.length - 1] = {
        ...previousMessages[index ?? previousMessages.length - 1],
        ...message,
      };
      return updatedMessages;
    });
  }

  async function handleSubmitAuth(e) {
    e.preventDefault();

    if (isLoading) {
      stop();
      return;
    }

    const content = [{ type: 'text', text: chatInput }];
    const images = await toMessageImage(files);

    if (images.length > 0) {
      images.forEach((image) => {
        content.push({ type: 'image', image });
      });
    }

    const updatedMessages = addMessage({
      role: 'user',
      content,
    });

    await submitToAPI(updatedMessages);

    setChatInput('');
    setFiles([]);
    setCurrentTab('code');
  }

  function retry() {
    submitToAPI(messages);
  }

  function stop() {
    setIsLoading(false);
  }

  function addMessage(message) {
    setMessages((previousMessages) => [...previousMessages, message]);
    return [...messages, message];
  }

  function handleSaveInputChange(e) {
    setChatInput(e.target.value);
  }

  function handleFileChange(change) {
    setFiles(change);
  }

  function handleLanguageModelChange(e) {
    setLanguageModel({ ...languageModel, ...e });
  }

  function handleSocialClick(target) {
    if (target === 'github') {
      window.open('https://github.com/your-org/gamepac-super-agent', '_blank');
    } else if (target === 'x') {
      window.open('https://x.com/your-org', '_blank');
    } else if (target === 'discord') {
      window.open('https://discord.gg/your-server', '_blank');
    }
  }

  function handleClearChat() {
    stop();
    setChatInput('');
    setFiles([]);
    setMessages([]);
    setFragment(undefined);
    setResult(undefined);
    setCurrentTab('code');
    setIsPreviewLoading(false);
  }

  function setCurrentPreview(preview) {
    setFragment(preview.fragment);
    setResult(preview.result);
  }

  function handleUndo() {
    setMessages((previousMessages) => [...previousMessages.slice(0, -2)]);
    setCurrentPreview({ fragment: undefined, result: undefined });
  }

  return (
    <main className="flex min-h-screen max-h-screen">
      <div className="grid w-full md:grid-cols-[35%_65%]">
        <div className="flex flex-col w-full max-h-full px-4 overflow-auto">
          <NavBar
            onSocialClick={handleSocialClick}
            onClear={handleClearChat}
            canClear={messages.length > 0}
            canUndo={messages.length > 1 && !isLoading}
            onUndo={handleUndo}
          />
          <Chat
            messages={messages}
            isLoading={isLoading}
            setCurrentPreview={setCurrentPreview}
          />
          <ChatInput
            retry={retry}
            isErrored={error !== undefined}
            errorMessage={errorMessage}
            isLoading={isLoading}
            isRateLimited={isRateLimited}
            stop={stop}
            input={chatInput}
            handleInputChange={handleSaveInputChange}
            handleSubmit={handleSubmitAuth}
            isMultiModal={currentModel?.multiModal || false}
            files={files}
            handleFileChange={handleFileChange}
          >
            <ChatPicker
              templates={templates}
              selectedTemplate={selectedTemplate}
              onSelectedTemplateChange={setSelectedTemplate}
              models={filteredModels}
              languageModel={languageModel}
              onLanguageModelChange={handleLanguageModelChange}
            />
            <ChatSettings
              languageModel={languageModel}
              onLanguageModelChange={handleLanguageModelChange}
              apiKeyConfigurable={true}
              baseURLConfigurable={true}
            />
          </ChatInput>
        </div>
        <Preview
          selectedTab={currentTab}
          onSelectedTabChange={setCurrentTab}
          isChatLoading={isLoading}
          isPreviewLoading={isPreviewLoading}
          fragment={fragment}
          result={result}
          onClose={() => setFragment(undefined)}
        />
      </div>
    </main>
  );
}
