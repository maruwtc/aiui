'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageList } from '@/components/chat/message-list';
import { ChatInput } from '@/components/chat/chat-input';
import { Message } from '@/components/chat/types';

export const ModernChatInterface = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! How can I help you today?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors duration-200">
            <MessageList
                messages={messages}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
            />
            <ChatInput
                messages={messages}
                setMessages={setMessages}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
            />
        </div>
    );
};