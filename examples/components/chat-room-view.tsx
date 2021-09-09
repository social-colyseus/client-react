import React, {useCallback, useState} from 'react';
import * as Colyseus from 'colyseus.js';
import {ChatRoomModel} from '../../src/types/chat-room/chat-room.model';
import useChatRoom from '../../src/hooks/chat-room.hook';

interface Props {
    room: ChatRoomModel;
    client: Colyseus.Client,
    token: string;
}

export const ChatRoomView = (props: Props) => {
    const {room: chatRoom, client, token} = props;
    const [message, setMessage] = useState('');
    const {sendMessage, messages} = useChatRoom({roomId: chatRoom.roomId, client, token});

    const onMessageSend = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(message);
        setMessage('');
    }, [sendMessage, message]);

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">Chat: {chatRoom.participants.join(', ')}</div>
            </div>
            <div className="card-body" style={{height: '300px', overflowY: 'scroll'}}>
                {messages.map((message, index) => (
                    <div className="row mx-0 mb-2" key={'chat_room_' + chatRoom.roomId + '_message' + index}>
                        <div className="col-12">
                            <span style={{fontWeight: 900}}>{message.sender}: </span>
                            <span>{message.message}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="card-footer">
                <form onSubmit={e => onMessageSend(e)}>
                    <div className="input-group">
                        <div className="input-group-addon input-group-text input-group-prepend">
                            Message
                        </div>
                        <input type="text" className="form-control form-control-sm"
                               onChange={e => setMessage(e.target.value)} value={message}/>
                        <button type="submit" className="btn btn-success input-group-append">
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
