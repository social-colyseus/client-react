import {UserModel} from '../user/user.model';
import {FriendModel} from '../friend/friend.model';
import {InvitationModel} from '../invitation/invitation.model';
import {ChatRoomModel} from '../chat-room/chat-room.model';

export type OnMessageMe = {
    user: UserModel;
}
export type OnListFriends = {
    friends: FriendModel[];
}
export type OnOnlineFriends = {
    friends: FriendModel[];
}
export type OnListFriendshipRequests = {
    userNames: string[];
}
export type OnFriendOnline = {
    userName: string;
}
export type OnFriendOffline = {
    userName: string;
}
export type OnInvitationSent = never;

export type OnListInvitations = {
    invitations: InvitationModel[];
}

export type OnInvitationAccepted = {
    room_id: string;
}

export type OnChatRoom = ChatRoomModel;

export type OnListChatRooms = {
    rooms: ChatRoomModel[];
}
