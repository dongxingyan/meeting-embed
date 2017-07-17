
export interface IConfirmOrderResponse {
    /**
     * [0|28] => [成功|失败]
     */
    code: string;
    /**
     * [0|28] => [成功|失败]
     */
    msg: string;
    data: IConfirmOrderMessage
}

export interface IConfirmOrderMessage {
    /**
     * 会议室号
     */
    meetingRoomNum: string
    /**
     * 赠送时长
     */
    remainTime: string
}