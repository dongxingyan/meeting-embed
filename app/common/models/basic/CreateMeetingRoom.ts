
export interface ICreateMeetingRoomResponse {
    /**
     * [0|28] => [成功|失败]
     */
    code: string;
    /**
     * [0|28] => [成功|失败]
     */
    message: string;
    data: ICreateMeetingRoomMessage
}

export interface ICreateMeetingRoomRequest {
    /**
     * 第三方用户ID
     */
    openId: string;
}

export interface ICreateMeetingRoomMessage {
    /**
     * 会议室号
     */
    meetingRoomNum: string
    /**
     * 赠送时长(秒)
     */
    remainTime: number
}