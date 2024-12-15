'use client';

import React from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageBubbleProps } from './types';

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast }) => (
    <div className={`flex gap-2 items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        {message.role === 'assistant' && (
            <div className="w-8 h-8 mt-1 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            </div>
        )}
        <div
            className={`group relative max-w-[80%] px-4 py-2 rounded-2xl ${message.role === 'user'
                ? 'bg-blue-900 text-white'
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
            <div className="w-8 h-8 mt-1 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </div>
        )}
    </div>
);