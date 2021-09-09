import * as Colyseus from 'colyseus.js';
import {useCallback, useEffect, useState} from 'react';
import {MessageModel} from '../types/chat-room/message.model';

interface ChatRoomOptions {
    roomId: string;
    token: string;
    client: Colyseus.Client;
}

const useChatRoom = (options: ChatRoomOptions) => {
    const {roomId, client, token} = options;
    const [room, setRoom] = useState<Colyseus.Room | null>(null);
    const [messages, setMessages] = useState<MessageModel[]>([]);

    useEffect(() => {
        client.joinById(roomId, {token}).then(room => setRoom(room));
    }, []);

    useEffect(() => {
        if (room) {
            room.onMessage('onChatMessage', payload => setMessages(prev => [...prev, payload]));
        }
    }, [room]);

    const sendMessage = useCallback((message: string) => {
        if (room) {
            room.send('sendMessage', {message});
        }
    }, [room]);

    return {
        messages,
        sendMessage,
    };
};

export default useChatRoom;
