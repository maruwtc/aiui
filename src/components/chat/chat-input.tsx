'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Send, ArrowUp } from 'lucide-react';
import config from "@/config";
import { ChatInputProps } from './types';

export const ChatInput: React.FC<ChatInputProps> = ({
    messages,
    setMessages,
    isLoading,
    setIsLoading
}) => {
    const [inputMessage, setInputMessage] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    return (
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
                            placeholder="Type your message..."
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
    );
};