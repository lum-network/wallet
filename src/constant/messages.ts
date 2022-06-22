export enum MessageTypes {
    IBC_TIMEOUT = '/ibc.core.channel.v1.MsgTimeout',
    IBC_ACKNOWLEDGEMENT = '/ibc.core.channel.v1.MsgAcknowledgement',
    IBC_UPDATE_CLIENT = '/ibc.core.client.v1.MsgUpdateClient',
    IBC_TRANSFER = '/ibc.applications.transfer.v1.MsgTransfer',
    IBC_RECV_PACKET = '/ibc.core.channel.v1.MsgRecvPacket',
    EXEC = '/cosmos.authz.v1beta1.MsgExec',
    GRANT = '/cosmos.authz.v1beta1.MsgGrant',
}
