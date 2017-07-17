
export interface IInvitationRecordResponse {
    /**
     * [0|28|999] => [成功|失败|服务器内部错误]
     */
    code: string;
    /**
     * [0|28|999] => [成功|失败|服务器内部错误]
     */
    msg: string;
    data:{
        totalSize:number,
        resultList: IInvitationRecordMessage[]
    };
}


export interface IInvitationRecordRequest {
    /**
     * 开始页号（从1开始）
     */
    start: number;
    /**
     * 每页条数
     */
    size: number;
}

export interface IInvitationRecordMessage {
    /**
     * 邀请ID
     */
    invitationId: string;
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
}