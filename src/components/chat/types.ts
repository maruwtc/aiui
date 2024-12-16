export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
    evalDuration?: number; // in nanoseconds
}

export interface MessageBubbleProps {
    message: Message;
    isLast: boolean;
}

export interface StreamResponse {
    model: string;
    created_at: string;
    message: {
        role: string;
        content: string;
    };
    done: boolean;
    done_reason?: string;
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
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