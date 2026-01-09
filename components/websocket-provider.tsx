'use client';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { useAuth } from '@/hooks/useAuth';
import { BASE_URL } from '@/common/Constant/COMMON_API';

interface WebSocketContextType {
    client: Client | null;
    isConnected: boolean;
    subscribe: (destination: string, callback: (message: IMessage) => void) => StompSubscription | undefined;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [client, setClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        const token = user?.token;
        if (!user || !token) {
            if (client) {
                client.deactivate();
                setClient(null);
                setIsConnected(false);
            }
            return;
        }

        const stompClient = new Client({ 
            webSocketFactory: () => new SockJS(`${BASE_URL.replace('/api/v1', '')}/ws`),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            onConnect: () => {
                console.log('Connected to WebSocket');
                setIsConnected(true);
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
                setIsConnected(false);
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        stompClient.activate();
        setClient(stompClient);

        return () => {
            stompClient.deactivate();
        };
    }, [user]);

    const subscribe = (destination: string, callback: (message: IMessage) => void) => {
        if (client && isConnected) {
             // Avoid duplicate subscriptions if possible, or handle cleanup
             const sub = client.subscribe(destination, callback);
             return sub;
        }
    };

    return (
        <WebSocketContext.Provider value={{ client, isConnected, subscribe }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
