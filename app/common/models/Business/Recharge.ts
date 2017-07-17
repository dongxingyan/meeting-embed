
export interface IRechargeResponse {
    /**
     * [0|28] => [成功|失败]
     */
    code: string;
    /**
     * [0|28] => [成功|失败]
     */
    msg: string;
    data: IRechargeMessage
}


export interface IRechargeRequest {
    /**
     * 明细ID
     */
    id: string;
}


export interface IRechargeMessage {
    /**
     * 会议室号
     */
    meetingRoomNum: string;
    /**
     * 充值时长
     */
    time: string;
    /**
     * 支付金额
     */
    money: string;
    /**
     * 订单时间
     */
    orderTime: string;
    //失效时间
    expirationTime:string;

    "id" : number,
    "orderNum" : string,
    "accountId" : number,
    "duration" : number,
    "status" : number,
    "createTime" : string
}