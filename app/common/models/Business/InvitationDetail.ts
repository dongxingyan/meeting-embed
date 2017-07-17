
export interface IInvitationDetailResponse {
    /**
     * [0|28] => [成功|失败]
     */
    code: string;
    /**
     * [0|28] => [成功|失败]
     */
    msg: string;
    data: IInvitationDetailMessage
}

export interface IInvitationDetailRequest {
    /**
     * 邀请ID
     */
    invitationId: string;
}

export interface IInvitationDetailMessage {
    /**
     * 会议室号
     */
    meetingRoomNum: string;
    /**
     *  入会密码
     */
    guestPassword: string;
    /**
     * 会议主题
     */
    theme: string;
    /**
     * 开始时间
     */
    startTime: Date;
    /**
     * 结束时间
     */
    endTime: Date;
    /**
     * 邀请状态（0.无效邀请 1.有效邀请 2.非邀请会议）
     */
    status: number;
    invitedList:{dxtNum,nickname,avatar}[];
}