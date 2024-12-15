'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowUp } from 'lucide-react';
import config from "@/config";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
}

const ModernChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! How can I help you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [inputMessage]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = { role: 'user' as const, content: inputMessage.trim() };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch(config.api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      if (!response.ok) throw new Error('API request failed');
      if (!response.body) throw new Error('Response body is null');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              assistantMessage += data.message.content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantMessage;
                return newMessages;
              });
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast }) => (
    <div className={`flex gap-2 items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.role === 'assistant' && (
        <div className="w-8 h-8 mt-1 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-blue-600 dark:text-blue-300" />
        </div>
      )}
      <div
        className={`group relative max-w-[80%] px-4 py-2 rounded-2xl ${message.role === 'user'
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
          } ${isLast ? 'animate-slideIn' : ''}`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className={`markdown ${message.role === 'user' ? 'text-white' : ''}`}
          components={{
            // Text formatting
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            del: ({ children }) => <del className="line-through">{children}</del>,
            hr: () => <hr className="my-4 border-t border-gray-300 dark:border-gray-600" />,

            // Headings
            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>,
            h4: ({ children }) => <h4 className="text-base font-bold mb-2 mt-3">{children}</h4>,
            h5: ({ children }) => <h5 className="text-sm font-bold mb-1 mt-2">{children}</h5>,
            h6: ({ children }) => <h6 className="text-xs font-bold mb-1 mt-2">{children}</h6>,

            // Lists
            ul: ({ children }) => <ul className="list-disc pl-6 mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-6 mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,

            // Code
            code: ({ inline, children }) => {
              if (inline) {
                return (
                  <code className={`px-1 py-0.5 rounded font-mono text-sm ${message.role === 'user'
                    ? 'bg-blue-400 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                    {children}
                  </code>
                );
              }
              return (
                <code className="block w-full font-mono text-sm">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className={`p-3 rounded-lg mb-2 overflow-x-auto ${message.role === 'user'
                ? 'bg-blue-400'
                : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                {children}
              </pre>
            ),


            // Tables
            table: ({ children }) => (
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className={`${message.role === 'user'
                ? 'bg-blue-400/30'
                : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {children}
              </tr>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                {children}
              </td>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2 text-left font-semibold border-r border-gray-300 dark:border-gray-600 last:border-r-0">
                {children}
              </th>
            ),

            // Other elements
            blockquote: ({ children }) => (
              <blockquote className={`border-l-4 pl-4 my-2 ${message.role === 'user'
                ? 'border-blue-400 bg-blue-400/20'
                : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800/50'
                }`}>
                {children}
              </blockquote>
            ),
            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline ${message.role === 'user'
                  ? 'text-white hover:text-blue-100'
                  : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
                  }`}
              >
                {children}
              </a>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl p-4 space-y-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
              isLast={index === messages.length - 1}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-bl-none">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Container */}
      <div className="flex-none border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="p-4 flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={isMobile ? "Type your message..." : "Type your message..."}
                className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-600 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                         placeholder-gray-400 dark:placeholder-gray-500
                         resize-none min-h-[44px] max-h-[200px]
                         font-geist-sans pr-12"
                rows={1}
              />
              {isMobile && inputMessage.trim() && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 bottom-2 p-2 rounded-full bg-blue-500 text-white 
                           hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           transition-colors duration-200"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
            </div>
            {!isMobile && (
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 h-[44px]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         transition-colors duration-200
                         dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModernChatInterface;