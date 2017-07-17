
export interface IUseScheduleResponse {
    /**
     * [0|28] => [成功|失败]
     */
    code: string;
    /**
     * [0|28] => [成功|失败]
     */
    msg: string;
    data: IUseSchedule
}

export interface IUseScheduleRequest {
    /**
     * 明细ID
     */
    id: string;
}

export interface IUseSchedule {
    /**
     * 会议主题
     */
    theme: string;
    meetingRoomNum:string;//会议室号

    startTime:Date;
    endTime:Date;
    /**
     * 会议时长
     */
    predictTime: string;
    /**
     * 参会人数
     */
    participantsAmount: string;
    /**
     * 会议总耗时
     */
    duration: number;
    participantsList: IParticipantInfo[]
}

export interface IParticipantInfo {
    /**
     * 用户昵称
     */
    nickName: string;
    /**
     * 角色
     */
    role: string;
    /**
     * 时长
     */
    duration: number;
}