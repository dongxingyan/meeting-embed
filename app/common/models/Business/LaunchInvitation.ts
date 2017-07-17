/**
 * 发起邀请
 */
export interface ILaunchInvitationResponse {
    /**
     * [0|28|999] => [成功|失败|服务器内部错误]
     */
    code: string;
    /**
     * [0|28|999] => [成功|失败|服务器内部错误]
     */
    msg: string;
    data: ILaunchInvitationMessage
}

/**
 * 发起邀请
 */
export interface ILaunchInvitationRequest {
    /**
     * 文档未指定
     */
    id?: number,
    /**
     * 文档未指定
     */
    meetingRoomId?: 0,
    /**
     * 文档未指定
     */
    status?: 0,
    /**
     * 会议主题（选填）
     */
    theme?: string;
    /**
     * 开始时间
     */
    startTime: string;
    /**
     * 结束时间
     */
    endTime: string;
}

/**
 * 发起邀请
 */
export interface ILaunchInvitationMessage {
    /**
     * 邀请消息1
     */
    message1: string;
    /**
     * 邀请消息2
     */
    message2: string;
    /**
     * 邀请编号
     */
    invitationId:string;
}