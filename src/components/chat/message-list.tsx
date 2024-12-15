'use client';

import React from 'react';
import { MessageBubble } from './message-bubble';
import { Bot } from 'lucide-react';
import { MessageListProps } from './types';

export const MessageList: React.FC<MessageListProps> = ({
    messages,
    isLoading,
    messagesEndRef
}) => {
    return (
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
                                <div className="w-2 h-2 bg-blue-900 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-blue-900 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-blue-900 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};