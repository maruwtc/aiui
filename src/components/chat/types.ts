export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export interface MessageBubbleProps {
    message: Message;
    isLast: boolean;
}

export interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
    messagesEndRef: React.MutableRefObject<HTMLDivElement | null>;  // Updated type
}

export interface ChatInputProps {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}