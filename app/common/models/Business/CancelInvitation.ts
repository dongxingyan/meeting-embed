
export interface ICancelInvitationResponse {
    /**
     * [0|28|999] => [成功|失败|服务器内部错误]
     */
    code: string;
    /**
     * [0|28|999] => [成功|失败|服务器内部错误]
     */
    msg: string;
}

export interface ICancelInvitationRequest {
    /**
     * 邀请ID
     */
    invitationId: string;
}
