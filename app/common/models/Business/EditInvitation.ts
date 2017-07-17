
export interface IEditInvitationResponse {
    /**
     * [0|28|999] => [成功|失败|服务器内部错]
     */
    code: string;
    /**
     * [0|28|999] => [成功|失败|服务器内部错]
     */
    msg: string;
}

export interface IEditInvitationRequest {
    /**
     * 会议主题
     */
    theme: string;
    /**
     * 开始时间
     */
    startTime: string;
    /**
     * 结束时间
     */
    endTime: string;
}