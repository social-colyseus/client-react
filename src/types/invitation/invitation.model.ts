export type InvitationModel = {
    _id: string;
    inviterId: string;
    invitedId: string;
    expiresAt: Date;
    roomId?: string;
    inviterUserName: string;
    invitedUserName: string;
};
