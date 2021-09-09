import {UserModel} from './user/user.model';
import {LoginResponse} from './auth/login.model';
import {
    OnChatRoom,
    OnFriendOffline,
    OnFriendOnline, OnInvitationSent, OnListChatRooms,
    OnListFriends,
    OnListFriendshipRequests, OnListInvitations,
    OnMessageMe,
    OnOnlineFriends,
} from './events/social.room.events';
import Colyseus from 'colyseus.js';

export type SocialColyseusCallbacks = {
    onTokenFail?: () => void;
    onLoginSucceed?: (response: LoginResponse) => void;
    onLoginFail?: () => void;
    onRegisterSucceed?: () => void;
    onRegisterFail?: () => void;

    onMessageMe?: (payload: OnMessageMe) => void;
    onListFriends?: (payload: OnListFriends) => void;
    onOnlineFriends?: (payload: OnOnlineFriends) => void;
    onListFriendshipRequests?: (payload: OnListFriendshipRequests) => void;
    onFriendOnline?: (payload: OnFriendOnline) => void;
    onFriendOffline?: (payload: OnFriendOffline) => void;
    onInvitationSent?: (payload: OnInvitationSent) => void;
    onListInvitations?: (payload: OnListInvitations) => void;
    onInvitationAcceptedSucceed?: (payload: Colyseus.Room) => void;
    onInvitationAcceptedFail?: (payload: any) => void;
    onChatRoom?: (payload: OnChatRoom) => void;
    onListChatRooms?: (payload: OnListChatRooms) => void;
    onSocialRoomSuccess?: () => void;
    onSocialRoomFail?: (payload: any) => void;
};

export type SocialColyseusOptions = {
    host: string;
    port: number;
    secure: boolean;
    storedAuthToken?: string;
    storedUser?: UserModel;
    callbacks?: SocialColyseusCallbacks;
}
