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

        response.data.on('data', async (chunk: Buffer) => {
            const lines = chunk.toString().split('\n').filter(line => line.trim());
            for (const line of lines) {
                try {
                    if (line) {
                        await writer.write(new TextEncoder().encode(line + '\n'));
                    }
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error('Error processing line:', errorMessage);
                }
            }
        });

        response.data.on('end', async () => {
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
        // Type guard to handle AxiosError specifically
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
                    details: axiosError.message
                },
                { status: axiosError.response?.status || 500 }
            );
        }

        // Handle non-Axios errors
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