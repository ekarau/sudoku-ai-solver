import React, { createContext, useContext } from 'react';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) =>
{
    const { user } = useAuth();
    const onlineUsers = useOnlineStatus(user);

    return (
        <WebSocketContext.Provider value={onlineUsers}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () =>
{
    return useContext(WebSocketContext);
};