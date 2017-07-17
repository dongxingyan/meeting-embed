
export interface IGetMeetingRoomResponse {
    /**
     * [0|28] => [成功|失败]
     */
    code: string;
    /**
     * [0|28] => [成功|失败]
     */
    msg: string;
    data: IMeetingRoom[];
}


export interface IMeetingRoom {
    /** 
     * 会议室名称
     */
    name: string;
    /** 
     * 主持人密码
     */
    hostPassword: string;
    /** 
     * 参会者密码
     */
    guestPassword: string;
    /** 
     * 会议室号
     */
    meetingRoomNum: string;

    /**
     *  TODO:未知字段
     */
    id?: number;
    /**
     *  TODO:未知字段
     */
    status?: number;
    nickName?: string
    remainTime?: number;
    meetingRoomId?: number;
}