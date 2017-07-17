
export interface IGenerateOrderResponse {
    /**
     * [0|28] => [成功|失败]
     */
    code: string;
    /**
     * [0|28] => [成功|失败]
     */
    msg: string;
    data: IGenerateOrderMessage
}


export interface IGenerateOrderRequest {
    /**
     * 金额
     */
    // money: number;
    /**
     * 时长
     */
    // duration: number;
    packageId:number
}

export interface IGenerateOrderMessage {
    /**
     * 订单号
     */
    orderNum: string;
    
    notifyUrl:string;
}