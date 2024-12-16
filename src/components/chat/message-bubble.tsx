'use client';

import React, { useState } from 'react';
import { Bot, User, Check, Copy, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MessageBubbleProps } from './types';

const formatEvalDuration = (ns: number): string => {
    const ms = ns / 1_000_000; // Convert nanoseconds to milliseconds
    if (ms < 1000) {
        return `${ms.toFixed(1)}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
};

const formatTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    }).format(date);
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast }) => {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopy = async (code: string) => {
        try {
            // Try using the clipboard API
            if (window?.navigator?.clipboard) {
                await window.navigator.clipboard.writeText(code);
            } else {
                // Fallback method using a temporary textarea
                const textarea = document.createElement('textarea');
                textarea.value = code;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            // Show copied state
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <div className={`flex gap-2 items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                    <div className="w-8 h-8 mt-1 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                    </div>
                )}
                <div
                    className={`group relative max-w-[80%] px-4 py-2 rounded-md ${message.role === 'user'
                        ? 'bg-blue-900 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
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

                            // Code blocks and inline code
                            code: ({ inline, className, children }) => {
                                const match = /language-(\w+)/.exec(className || '');
                                const language = match ? match[1] : '';
                                const codeString = String(children).replace(/\n$/, '');

                                if (inline) {
                                    return (
                                        <code className={`px-1 py-0.5 rounded font-mono text-sm ${message.role === 'user'
                                            ? 'bg-blue-400 text-white'
                                            : 'bg-gray-200 dark:bg-zinc-900 text-gray-800 dark:text-gray-200'
                                            }`}>
                                            {children}
                                        </code>
                                    );
                                }

                                return (
                                    <div className="relative group/code">
                                        {/* Header - visible on hover */}
                                        <div className={`absolute top-0 left-0 right-0 h-8 flex justify-between items-center px-3 rounded-t-lg
                                        ${message.role === 'user'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 dark:bg-zinc-800'
                                            }`}>
                                            {/* Language label */}
                                            <div className="text-xs font-mono">
                                                {language || 'plain text'}
                                            </div>
                                            {/* Copy button */}
                                            <button
                                                className={`text-xs font-mono flex items-center gap-1 px-2 py-1 rounded
                                                ${message.role === 'user'
                                                        ? 'hover:bg-blue-600'
                                                        : 'hover:bg-gray-300 dark:hover:bg-zinc-700'
                                                    }`}
                                                onClick={() => handleCopy(codeString)}
                                            >
                                                {copiedCode === codeString ? (
                                                    <>
                                                        <Check className="w-3 h-3" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3 h-3" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <SyntaxHighlighter
                                            language={language || 'text'}
                                            style={tomorrow}
                                            customStyle={{
                                                margin: 0,
                                                padding: '1rem',
                                                paddingTop: '2.5rem', // Space for the hover header
                                                background: message.role === 'user'
                                                    ? 'rgba(59, 130, 246, 0.1)'
                                                    : 'rgb(24, 24, 27)',
                                                borderRadius: '0.375rem',
                                            }}
                                        >
                                            {codeString}
                                        </SyntaxHighlighter>
                                    </div>
                                );
                            },
                            pre: ({ children }) => (
                                <pre className="text-xs">
                                    {children}
                                </pre>
                            ),

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

            {/* Timestamp and Response Time */}
            <div className={`flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ${message.role === 'user' ? 'justify-end mr-10' : 'justify-start ml-10'
                }`}>
                {message.timestamp && (
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(message.timestamp)}
                    </span>
                )}
                {message.role === 'assistant' && message.evalDuration && (
                    <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            Generated in {formatEvalDuration(message.evalDuration)}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};