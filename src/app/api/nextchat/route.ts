import axios, { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import config from '@/config';

interface RequestBody {
    messages: Array<{
        role: string;
        content: string;
    }>;
}

interface OllamaRequestBody {
    model: string;
    messages: RequestBody['messages'];
    stream: boolean;
}

export async function POST(req: Request) {
    try {
        const body = await req.json() as RequestBody;
        console.log('Attempting to connect to:', config.ollama_server_url);

        const requestBody: OllamaRequestBody = {
            model: 'llama3.2',
            messages: body.messages,
            stream: true
        };

        const response = await axios.post(config.ollama_server_url, requestBody, {
            responseType: 'stream',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const stream = new TransformStream();
        const writer = stream.writable.getWriter();
        let buffer = '';

        response.data.on('data', async (chunk: Buffer) => {
            // Add the new chunk to our buffer
            buffer += chunk.toString();

            // Process complete JSON objects from the buffer
            while (true) {
                const newlineIndex = buffer.indexOf('\n');
                if (newlineIndex === -1) break;  // No complete line found

                const line = buffer.slice(0, newlineIndex);
                buffer = buffer.slice(newlineIndex + 1);

                if (!line.trim()) continue;  // Skip empty lines

                try {
                    // Validate JSON before writing
                    JSON.parse(line);  // This will throw if invalid
                    await writer.write(new TextEncoder().encode(line + '\n'));
                } catch {
                    console.warn('Invalid JSON chunk received:', line);
                    // If this is part of a larger JSON object, accumulate it
                    if (buffer) {
                        buffer = line + '\n' + buffer;
                    }
                }
            }
        });

        response.data.on('error', async () => {
            console.error('Stream error occurred');
            try {
                // Send an error message that the client can handle
                const errorMessage = JSON.stringify({
                    error: true,
                    message: 'Stream error occurred'
                });
                await writer.write(new TextEncoder().encode(errorMessage + '\n'));
            } finally {
                await writer.close();
            }
        });

        response.data.on('end', async () => {
            // Process any remaining buffer content
            if (buffer.trim()) {
                try {
                    JSON.parse(buffer);  // Validate remaining JSON
                    await writer.write(new TextEncoder().encode(buffer + '\n'));
                } catch {
                    console.warn('Invalid JSON in final buffer:', buffer);
                }
            }
            await writer.close();
        });

        return new NextResponse(stream.readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error('Detailed API error:', {
                message: axiosError.message,
                code: axiosError.code,
                response: axiosError.response?.data,
                config: axiosError.config
            });

            return NextResponse.json(
                {
                    error: 'API Request Failed',
                    details: axiosError.message,
                    status: axiosError.response?.status || 500
                },
                { status: axiosError.response?.status || 500 }
            );
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Non-Axios error:', errorMessage);

        return NextResponse.json(
            {
                error: 'Internal Server Error',
                details: errorMessage
            },
            { status: 500 }
        );
    }
}