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
    stream: true;
    context?: number[];
}

const VERCEL_TIMEOUT = 10000; // 10 seconds timeout for Vercel
const CHUNK_TIMEOUT = 1000; // 1 second timeout between chunks

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
            timeout: VERCEL_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const stream = new TransformStream();
        const writer = stream.writable.getWriter();
        let buffer = '';
        let lastChunkTime = Date.now();
        let isClosed = false;

        // Set up a keepalive interval
        const keepaliveInterval = setInterval(async () => {
            if (!isClosed && Date.now() - lastChunkTime > CHUNK_TIMEOUT) {
                try {
                    // Send a keepalive message
                    await writer.write(new TextEncoder().encode('\n'));
                    lastChunkTime = Date.now();
                } catch (error) {
                    console.warn('Error sending keepalive:', error);
                }
            }
        }, CHUNK_TIMEOUT);

        // Set up a timeout to close the connection if no data is received
        const timeoutId = setTimeout(async () => {
            if (!isClosed) {
                console.warn('Request timeout reached');
                try {
                    await writer.write(new TextEncoder().encode(
                        JSON.stringify({
                            error: true,
                            message: 'Request timeout reached'
                        }) + '\n'
                    ));
                    clearInterval(keepaliveInterval);
                    await writer.close();
                    isClosed = true;
                } catch (error) {
                    console.error('Error closing writer on timeout:', error);
                }
            }
        }, VERCEL_TIMEOUT);

        response.data.on('data', async (chunk: Buffer) => {
            try {
                lastChunkTime = Date.now();
                buffer += chunk.toString();

                while (true) {
                    const newlineIndex = buffer.indexOf('\n');
                    if (newlineIndex === -1) break;

                    const line = buffer.slice(0, newlineIndex);
                    buffer = buffer.slice(newlineIndex + 1);

                    if (!line.trim()) continue;

                    try {
                        // Validate JSON before writing
                        JSON.parse(line);
                        await writer.write(new TextEncoder().encode(line + '\n'));
                    } catch {
                        if (buffer) {
                            buffer = line + '\n' + buffer;
                        }
                    }
                }
            } catch (error) {
                console.error('Error processing chunk:', error);
            }
        });

        response.data.on('error', async () => {
            if (!isClosed) {
                console.error('Stream error occurred');
                try {
                    await writer.write(new TextEncoder().encode(
                        JSON.stringify({
                            error: true,
                            message: 'Stream error occurred'
                        }) + '\n'
                    ));
                } finally {
                    clearTimeout(timeoutId);
                    clearInterval(keepaliveInterval);
                    await writer.close();
                    isClosed = true;
                }
            }
        });

        response.data.on('end', async () => {
            if (!isClosed) {
                try {
                    if (buffer.trim()) {
                        try {
                            JSON.parse(buffer);
                            await writer.write(new TextEncoder().encode(buffer + '\n'));
                        } catch {
                            console.warn('Invalid JSON in final buffer:', buffer);
                        }
                    }
                } finally {
                    clearTimeout(timeoutId);
                    clearInterval(keepaliveInterval);
                    await writer.close();
                    isClosed = true;
                }
            }
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