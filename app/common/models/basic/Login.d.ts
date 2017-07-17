
export interface ILoginResponse {
    /**
     * [0|28|999] => [成功|失败|服务器内部错误]
     */
    code: string;
    /**
     * [0|28|999] => [成功|失败|服务器内部错误]
     */
    msg: string;
    data: ILoginMessage
}

export interface ILoginRequest {
    /**
     * 第三方用户ID
     */
    openId: string
    /**
     * 渠道名称
     */
    channel: string
}

export interface ILoginMessage {
    /**
     * 是否开通会议室（0.否 1.是）
     */
    status: number;
}