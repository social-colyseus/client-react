import {useCallback, useEffect, useMemo, useState} from 'react';
import * as Colyseus from 'colyseus.js';
import {SocialColyseusOptions} from '../types/options';
import {LoginModel} from '../types/auth/login.model';
import {RegisterModel} from '../types/auth/register.model';
import {
    OnChatRoom,
    OnFriendOffline,
    OnFriendOnline, OnInvitationAccepted, OnInvitationSent, OnListChatRooms,
    OnListFriends,
    OnListFriendshipRequests, OnListInvitations,
    OnMessageMe,
    OnOnlineFriends,
} from '../types/events/social.room.events';
import {FriendModel} from '../types/friend/friend.model';
import {InvitationModel} from '../types/invitation/invitation.model';
import {ChatRoomModel} from '../types/chat-room/chat-room.model';

const useSocialColyseus = (options: SocialColyseusOptions) => {
    const wsEndpoint = useMemo(() => `${options.secure ? 'wss' : 'ws'}://${options.host}:${options.port}`, [options.secure, options.host, options.port]);
    const httpEndpoint = useMemo(() => `${options.secure ? 'https' : 'http'}://${options.host}:${options.port}`, [options.secure, options.host, options.port]);
    const [authToken, setAuthToken] = useState(options.storedAuthToken ?? null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [user, setUser] = useState(options.storedUser ?? null);
    const [socialRoom, setSocialRoom] = useState<Colyseus.Room | null>(null);
    const [friends, setFriends] = useState<FriendModel[]>([]);
    const [friendshipRequests, setFriendshipRequests] = useState<string[]>([]);
    const [invitations, setInvitations] = useState<InvitationModel[]>([]);
    const [chatRooms, setChatRooms] = useState<ChatRoomModel[]>([]);

    const client = useMemo(() => {
        return new Colyseus.Client(wsEndpoint);
    }, [wsEndpoint]);

    const onMessageMe = (payload: OnMessageMe) => {
        setUser(payload.user);
        if (options.callbacks?.onMessageMe) {
            options.callbacks.onMessageMe(payload);
        }
    };
    const onListFriends = useCallback((payload: OnListFriends) => {
        setFriends(payload.friends.map(friend => ({...friend, isOnline: false})));
        if (socialRoom) {
            socialRoom.send('listOnlineFriends');
        }
        if (options.callbacks?.onListFriends) {
            options.callbacks.onListFriends(payload);
        }
    }, [socialRoom, options.callbacks?.onListFriends]);

    const onOnlineFriends = (payload: OnOnlineFriends) => {
        const onlineFriendsIdList = payload.friends.map(friend => friend._id);
        setFriends(prev => {
            return prev.map(friend => {
                if (onlineFriendsIdList.includes(friend._id)) {
                    return {...friend, isOnline: true};
                }
                return friend;
            });
        });
        if (options.callbacks?.onOnlineFriends) {
            options.callbacks.onOnlineFriends(payload);
        }
    };

    const onListFriendshipRequests = (payload: OnListFriendshipRequests) => {
        setFriendshipRequests(payload.userNames);
        if (options.callbacks?.onListFriendshipRequests) {
            options.callbacks.onListFriendshipRequests(payload);
        }
    };

    const onFriendOnline = (payload: OnFriendOnline) => {
        setFriends(prev => {
            return prev.map(friend => {
                if (friend.userName === payload.userName) {
                    return {...friend, isOnline: true};
                }
                return friend;
            });
        });
        if (options.callbacks?.onFriendOnline) {
            options.callbacks.onFriendOnline(payload);
        }
    };

    const onFriendOffline = (payload: OnFriendOffline) => {
        setFriends(prev => {
            return prev.map(friend => {
                if (friend.userName === payload.userName) {
                    return {...friend, isOnline: false};
                }

                return friend;
            });
        });
        if (options.callbacks?.onFriendOffline) {
            options.callbacks.onFriendOffline(payload);
        }
    };

    const onInvitationSent = (payload: OnInvitationSent) => {
        if (options.callbacks?.onInvitationSent) {
            options.callbacks.onInvitationSent(payload);
        }
    };

    const onListInvitations = (payload: OnListInvitations) => {
        setInvitations(payload.invitations);
        if (options.callbacks?.onListInvitations) {
            options.callbacks.onListInvitations(payload);
        }
    };
    const onInvitationAccepted = useCallback((payload: OnInvitationAccepted) => {
        client.joinById(payload.room_id, {token: authToken}).then(room => {
            if (options.callbacks?.onInvitationAcceptedSucceed) {
                options.callbacks.onInvitationAcceptedSucceed(room);
            }
        }).catch(err => {
            if (options.callbacks?.onInvitationAcceptedFail) {
                options.callbacks.onInvitationAcceptedFail(err);
            }
        });
    }, [client, authToken, options.callbacks?.onInvitationAcceptedSucceed, options.callbacks?.onInvitationAcceptedFail]);

    const onChatRoom = (payload: OnChatRoom) => {
        setChatRooms(prev => [...prev, payload]);
        if (options.callbacks?.onChatRoom) {
            options.callbacks.onChatRoom(payload);
        }
    };

    const onListChatRooms = (payload: OnListChatRooms) => {
        setChatRooms(payload.rooms);
        if (options.callbacks?.onListChatRooms) {
            options.callbacks.onListChatRooms(payload);
        }
    };

    const join = useCallback(() => {
        client.join('social', {token: authToken}).then(room => {
            setSocialRoom(room);
            if (options.callbacks?.onSocialRoomSuccess) {
                options.callbacks.onSocialRoomSuccess();
            }
        }).catch(err => {
            if (options.callbacks?.onSocialRoomFail) {
                options.callbacks.onSocialRoomFail(err);
            }
        });
    }, [authToken, client]);

    useEffect(() => {
        if (authToken && authToken.length > 0) {
            fetch(`${httpEndpoint}/user/me`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            }).then(() => {
                setIsLoggedIn(true);
            }).catch(() => {
                setIsLoggedIn(false);
                setAuthToken(null);
                setUser(null);
                if (options.callbacks?.onTokenFail) {
                    options.callbacks.onTokenFail();
                }
            }).finally(() => setIsInitialized(true));
        } else {
            setIsInitialized(true);
        }
    }, [authToken, httpEndpoint, options.callbacks?.onTokenFail]);

    const login = useCallback((model: LoginModel) => {
        const {userName, password} = model;
        fetch(`${httpEndpoint}/auth/login`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({userName, password}),
        }).then(res => res.json()).then(res => {
            const session = res.data;
            if (options.callbacks?.onLoginSucceed) {
                options.callbacks.onLoginSucceed(session);
            }
            setUser(session.user);
            setAuthToken(session.token);
            setIsLoggedIn(true);
        }).catch(() => {
            if (options.callbacks?.onLoginFail) {
                options.callbacks.onLoginFail();
            }
        });
    }, [httpEndpoint, options.callbacks?.onLoginSucceed, options.callbacks?.onLoginFail]);

    const register = useCallback((model: RegisterModel) => {
        const {userName, email, password} = model;
        fetch(`${httpEndpoint}/auth/register`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({userName, email, password}),
        }).then(() => {
            if (options.callbacks?.onRegisterSucceed) {
                options.callbacks.onRegisterSucceed();
            }
        }).catch(() => {
            if (options.callbacks?.onRegisterFail) {
                options.callbacks.onRegisterFail();
            }
        });
    }, [httpEndpoint, options.callbacks?.onRegisterSucceed, options.callbacks?.onRegisterFail]);

    useEffect(() => {
        if (socialRoom) {
            socialRoom.onMessage('me', onMessageMe);
            socialRoom.onMessage('onListFriends', onListFriends);
            socialRoom.onMessage('onOnlineFriends', onOnlineFriends);
            socialRoom.onMessage('onListFriendshipRequests', onListFriendshipRequests);
            socialRoom.onMessage('onFriendOnline', onFriendOnline);
            socialRoom.onMessage('onFriendOffline', onFriendOffline);
            socialRoom.onMessage('onInvitationSent', onInvitationSent);
            socialRoom.onMessage('onListInvitations', onListInvitations);
            socialRoom.onMessage('onInvitationAccepted', onInvitationAccepted);
            socialRoom.onMessage('onChatRoom', onChatRoom);
            socialRoom.onMessage('onListChatRooms', onListChatRooms);
        }
    }, [socialRoom]);

    const addFriend = useCallback((userName: string) => {
        socialRoom?.send('addFriend', {userName});
    }, [socialRoom]);

    const removeFriend = useCallback((userName: string) => {
        socialRoom?.send('removeFriend', {userName});
    }, [socialRoom]);

    const approveFriendship = useCallback((userName: string) => {
        socialRoom?.send('approveFriendship', {userName});
    }, [socialRoom]);

    const rejectFriendship = useCallback((userName: string) => {
        socialRoom?.send('rejectFriendship', {userName});
    }, [socialRoom]);

    const createChat = useCallback((friend: string) => {
        socialRoom?.send('createChatRoom', {target: friend});
    }, [socialRoom]);

    const inviteFriend = useCallback((userName: string, room_id: string) => {
        socialRoom?.send('inviteFriendToRoom', {userName, room_id});
    }, [socialRoom]);

    const acceptInvitation = useCallback((invitation_id: string) => {
        socialRoom?.send('acceptInvitation', {invitation_id});
    }, [socialRoom]);

    const rejectInvitation = useCallback((invitation_id: string) => {
        socialRoom?.send('rejectInvitation', {invitation_id});
    }, [socialRoom]);

    return {
        client,
        socialRoom,
        login,
        register,
        join,

        isInitialized,
        isLoggedIn,
        user,
        authToken,

        friends,
        friendshipRequests,
        invitations,
        chatRooms,

        addFriend,
        removeFriend,
        approveFriendship,
        rejectFriendship,

        inviteFriend,
        acceptInvitation,
        rejectInvitation,

        createChat,
    };
};

export default useSocialColyseus;
