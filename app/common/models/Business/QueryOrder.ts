
export interface IQueryOrderResponse {
    /**
     * [0|28] => [成功|失败]
     */
    code: string;
    /**
     * [0|28] => [成功|失败]
     */
    msg: string;
    data: IQueryOrderMessage
}
export interface IQueryOrderRequest {
    /**
     * 订单号
     */
    orderNum: string;
}

export interface IQueryOrderMessage {
    /**
     * 剩余时长
     */
    remainTime: number
}