'use client';

import React, { useState } from 'react';
import { Plus, MessageSquare, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ChatSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    onNewChat: () => void;
    currentChatId?: string;
    chats: Array<{
        id: string;
        title: string;
        lastMessage: string;
        timestamp: string;
    }>;
    onSelectChat: (id: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    isOpen,
    onToggle,
    onNewChat,
    currentChatId,
    chats,
    onSelectChat,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 md:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed md:relative top-0 left-0 h-full
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isExpanded ? 'w-72' : 'w-16'}
        bg-gray-50 dark:bg-zinc-900 border-r border-gray-200 dark:border-gray-700
        transition-all duration-200 ease-in-out
        flex flex-col z-50
      `}>
                {/* Header */}
                <div className={`p-2 h-14 border-b border-gray-200 dark:border-gray-700 ${isExpanded ? '' : 'flex justify-center'}`}>
                    {isExpanded ? (
                        <Button
                            variant="ghost"
                            className="w-full flex items-center justify-center gap-2 hover:bg-transparent"
                            onClick={onNewChat}
                        >
                            <Plus className="w-4 h-4" />
                            New Chat
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onNewChat}
                            className="w-8 h-8"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {chats.map((chat) => (
                        <button
                            key={chat.id}
                            onClick={() => onSelectChat(chat.id)}
                            className={`
                w-full px-4 py-3 text-left transition-colors
                hover:bg-gray-100 dark:hover:bg-gray-700
                ${currentChatId === chat.id ? 'bg-gray-100 dark:bg-gray-700' : ''}
                border-b border-gray-200 dark:border-gray-700
                ${isExpanded ? '' : 'flex justify-center px-2'}
              `}
                        >
                            {isExpanded ? (
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="w-4 h-4 text-gray-500" />
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="text-sm font-medium truncate">
                                            {chat.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {chat.lastMessage}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {chat.timestamp}
                                    </span>
                                </div>
                            ) : (
                                <MessageSquare className="w-4 h-4 text-gray-500" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Desktop Expand/Collapse Button */}
                <div className="hidden md:block border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full h-10 rounded-none"
                    >
                        {isExpanded ? (
                            <PanelLeftClose className="w-4 h-4" />
                        ) : (
                            <PanelLeft className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>
        </>
    );
};