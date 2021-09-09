import React, {useCallback, useEffect, useState} from 'react';
import {useSocialColyseus} from '../index';
import * as Colyseus from 'colyseus.js';
import {ChatRoomView} from './components/chat-room-view';

const App = () => {
    const [loginUserName, setLoginUserName] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [registerUserName, setRegisterUserName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');

    const [addFriendInput, setAddFriendInput] = useState('');

    const [privateRoom, setPrivateRoom] = useState<Colyseus.Room | null>(null);

    const {
        isInitialized,
        isLoggedIn,
        login,
        register,
        join,
        friends,
        addFriend,
        friendshipRequests,
        approveFriendship,
        rejectFriendship,
        removeFriend,
        createChat,
        invitations,
        inviteFriend,
        rejectInvitation,
        acceptInvitation,
        authToken,
        client,
        chatRooms,
    } = useSocialColyseus({
        storedUser: JSON.parse(localStorage.getItem('@user') ?? 'null'),
        storedAuthToken: JSON.parse(localStorage.getItem('@token') ?? '""'),
        host: 'localhost',
        port: 5567,
        secure: false,
        callbacks: {
            onLoginSucceed: response => {
                localStorage.setItem('@token', JSON.stringify(response.token));
                localStorage.setItem('@user', JSON.stringify(response.user));
            },
            onInvitationAcceptedSucceed: room => {
                setPrivateRoom(room);
            },
        },
    });

    const createPrivateRoom = useCallback(() => {
        if (!privateRoom) {
            client.joinOrCreate('privateRoom', {token: authToken}).then(room => {
                setPrivateRoom(room);
            });
        }
    }, [client, privateRoom, authToken]);

    useEffect(() => {
        if (isLoggedIn === true) {
            join();
        }
    }, [isLoggedIn]);

    const handleLoginSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        login({userName: loginUserName, password: loginPassword});
    }, [login, loginUserName, loginPassword]);

    const handleRegisterSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        register({userName: registerUserName, password: registerPassword, email: registerEmail});
    }, [register, registerUserName, registerPassword, registerEmail]);

    const handleAddFriendSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        addFriend(addFriendInput);
        setAddFriendInput('');
    }, [addFriend, addFriendInput]);

    return (
        <div className="container pt-4">
            {isInitialized && !isLoggedIn && (
                <div className="row mx-0">
                    <div className="col-6">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title">Login</div>
                            </div>
                            <div className="card-body">
                                <form onSubmit={e => handleLoginSubmit(e)}>
                                    <div className="form-group row mx-0">
                                        <label htmlFor="loginUserName" className="col-md-4 col-12">UserName</label>
                                        <input type="text" className="form-control col-md-8 col-12" id="loginUserName"
                                               onChange={e => setLoginUserName(e.target.value)}/>
                                    </div>
                                    <div className="form-group row mx-0">
                                        <label htmlFor="loginPassword" className="col-md-4 col-12">Password</label>
                                        <input type="password" className="form-control col-md-8 col-12"
                                               id="loginPassword" onChange={e => setLoginPassword(e.target.value)}/>
                                    </div>
                                    <div className="form-group row mx-0">
                                        <div className="col-12 px-0 pt-4">
                                            <button type="submit" className="btn btn-success">
                                                Login
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title">Register</div>
                            </div>
                            <div className="card-body">
                                <form onSubmit={e => handleRegisterSubmit(e)}>
                                    <div className="form-group row mx-0">
                                        <label htmlFor="registerUserName" className="col-md-4 col-12">UserName</label>
                                        <input type="text" className="form-control col-md-8 col-12"
                                               id="registerUserName"
                                               onChange={e => setRegisterUserName(e.target.value)}/>
                                    </div>
                                    <div className="form-group row mx-0">
                                        <label htmlFor="registerEmail" className="col-md-4 col-12">E-Mail</label>
                                        <input type="email" className="form-control col-md-8 col-12" id="registerEmail"
                                               onChange={e => setRegisterEmail(e.target.value)}/>
                                    </div>
                                    <div className="form-group row mx-0">
                                        <label htmlFor="registerPassword" className="col-md-4 col-12">Password</label>
                                        <input type="password" className="form-control col-md-8 col-12"
                                               id="registerPassword"
                                               onChange={e => setRegisterPassword(e.target.value)}/>
                                    </div>
                                    <div className="form-group row mx-0">
                                        <div className="col-12 px-0 pt-4">
                                            <button type="submit" className="btn btn-success">
                                                Register
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isInitialized && isLoggedIn && (
                <>
                    <div className="row mx-0 mb-4">
                        <div className="col-6">
                            <div className="card">
                                <div className="card-header">
                                    <div
                                        className="card-title">Private: {privateRoom ? privateRoom.id : 'Create Room'}</div>
                                </div>
                                {!privateRoom && (
                                    <div className="card-footer">
                                        <button className="btn btn-success" type="button"
                                                onClick={() => createPrivateRoom()}>
                                            Create
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {privateRoom && (
                            <div className="col-6">
                                <div className="card">
                                    <div className="card-header">
                                        <div className="card-title">Invite Friends</div>
                                    </div>
                                    <div className="card-body">
                                        {friends.filter(friend => friend.isOnline).map(friend => (
                                            <div className="row mx-0" key={'invite_online_friend_' + friend._id}>
                                                <div className="col">
                                                    {friend.userName}
                                                </div>
                                                <div className="col d-flex flex-col justify-content-end">
                                                    <div className="btn-group">
                                                        <button type="button" className="btn btn-success"
                                                                onClick={() => inviteFriend(friend.userName, privateRoom.id)}>
                                                            Invite
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {!privateRoom && (
                            <div className="col-6">
                                <div className="card">
                                    <div className="card-header">
                                        <div className="card-title">Invitations</div>
                                    </div>
                                    <div className="card-body">
                                        {invitations.map(invitation => (
                                            <div className="row mx-0" key={'invitation' + invitation._id}>
                                                <div className="col">
                                                    {invitation.inviterUserName}
                                                </div>
                                                <div className="col d-flex flex-col justify-content-end">
                                                    <div className="btn-group">
                                                        <button type="button" className="btn btn-success"
                                                                onClick={() => acceptInvitation(invitation._id)}>
                                                            Accept
                                                        </button>
                                                        <button type="button" className="btn btn-danger"
                                                                onClick={() => rejectInvitation(invitation._id)}>
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="row mx-0">
                        <div className="col-6">
                            <div className="card">
                                <div className="card-header">
                                    <div className="card-title">Online Friends</div>
                                </div>
                                {friends.filter(friend => friend.isOnline).length > 0 && (
                                    <div className="card-body">
                                        {friends.filter(friend => friend.isOnline).map(friend => (
                                            <div className="row mx-0" key={'online_friend_' + friend._id}>
                                                <div className="col">
                                                    {friend.userName}
                                                </div>
                                                <div className="col d-flex flex-col justify-content-end">
                                                    <div className="btn-group">
                                                        <button type="button" className="btn btn-primary"
                                                                onClick={() => createChat(friend.userName)}>
                                                            Chat
                                                        </button>
                                                        <button type="button" className="btn btn-danger"
                                                                onClick={() => removeFriend(friend.userName)}>
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="card-header border-top">
                                    <div className="card-title">Offline Friends</div>
                                </div>
                                {friends.filter(friend => !friend.isOnline).length > 0 && (
                                    <div className="card-body">
                                        {friends.filter(friend => !friend.isOnline).map(friend => (
                                            <div className="row mx-0" key={'offline_friend_' + friend._id}>
                                                <div className="col">
                                                    {friend.userName}
                                                </div>
                                                <div className="col d-flex flex-col justify-content-end">
                                                    <div className="btn-group">
                                                        <button type="button" className="btn btn-danger"
                                                                onClick={() => removeFriend(friend.userName)}>
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="card-footer">
                                    <form onSubmit={e => handleAddFriendSubmit(e)}>
                                        <div className="input-group">
                                            <div className="input-group-prepend input-group-text">Add Friend</div>
                                            <input type="text" className="form-control form-control-sm"
                                                   placeholder="Friend Name" value={addFriendInput}
                                                   onChange={e => setAddFriendInput(e.target.value)}/>
                                            <button type="submit" className="btn btn-success input-group-append">
                                                Add
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    {friendshipRequests.length > 0 && (
                        <div className="row mx-0 mt-4">
                            <div className="col-6">
                                <div className="card">
                                    <div className="card-header">
                                        <div className="card-title">Friendship Requests</div>
                                    </div>
                                    <div className="card-body">
                                        {friendshipRequests.map(friend => (
                                            <div className="row mx-0" key={'friend_' + friend}>
                                                <div className="col">
                                                    {friend}
                                                </div>
                                                <div className="col d-flex flex-col justify-content-end">
                                                    <div className="btn-group">
                                                        <button type="button" className="btn btn-success"
                                                                onClick={() => approveFriendship(friend)}>
                                                            Approve
                                                        </button>
                                                        <button type="button" className="btn btn-danger"
                                                                onClick={() => rejectFriendship(friend)}>
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="card-footer">
                                        <form onSubmit={e => handleAddFriendSubmit(e)}>
                                            <div className="input-group">
                                                <div className="input-group-prepend input-group-text">Add Friend</div>
                                                <input type="text" className="form-control form-control-sm"
                                                       placeholder="Friend Name"/>
                                                <button type="button" className="btn btn-success input-group-append">
                                                    Add
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {authToken && chatRooms.map(room => (
                        <div className="row mx-0 mt-4" key={'chat_room' + room.roomId}>
                            <div className="col-12">
                                <ChatRoomView room={room} client={client} token={authToken}/>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

export default App;
