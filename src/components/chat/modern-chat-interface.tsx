'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageList } from '@/components/chat/message-list';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { Message } from '@/components/chat/types';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from "@/components/theme-switcher";

export const ModernChatInterface = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! How can I help you today?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string>('default');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const [chats] = useState([
        {
            id: 'default',
            title: 'New Conversation',
            lastMessage: 'Hello! How can I help you today?',
            timestamp: 'Just now'
        }
    ]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleNewChat = () => {
        setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?' }]);
        setCurrentChatId('new-' + Date.now());
        setIsSidebarOpen(false);
    };

    const handleSelectChat = (id: string) => {
        setCurrentChatId(id);
        setIsSidebarOpen(false);
    };

    return (
        <div className="flex h-full">
            <ChatSidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                onNewChat={handleNewChat}
                currentChatId={currentChatId}
                chats={chats}
                onSelectChat={handleSelectChat}
            />

            <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-900 transition-colors duration-200">
                {/* Header with mobile menu button */}
                <div className="sticky top-0 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-14 max-w-screen-2xl items-center">
                        <div className="mr-4 hidden md:flex">
                            <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                                Chat Assistant
                            </h1>
                        </div>
                        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                            <div className="w-full flex-1 md:w-auto md:flex-none">
                                <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent md:hidden">
                                    Chat Assistant
                                </h1>
                            </div>
                            <nav className="flex items-center">
                                <ThemeSwitcher />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </nav>
                        </div>
                    </div>
                </div>

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
        </div>
    );
};