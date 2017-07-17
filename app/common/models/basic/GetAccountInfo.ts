
export interface IGetAccountInfoResponse {
    /**
     * [0|28] => [成功|失败]
     */
    code: string;
    /**
     * [0|28] => [成功|失败]
     */
    msg: string;
    data: IAccountInfo
}

export interface IAccountInfo {
    /**
     * 昵称
     */
    nickname: string;
    /**
     * 剩余时间(秒)
     */
    remainTime: number;

    id:number,
    organId:number,
    openId:string,
    status:number
}