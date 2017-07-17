export interface IVmrTimeBillResponse {
    /**
     * [0|28] => [成功|失败]
     */
    code: string;
    /**
     * [0|28] => [成功|失败]
     */
    message: string;
    data: {resultList: IVmrTimeBill[],totalSize: number}
}

export interface IVmrTimeBillRequest {
    /**
     * 开始页数
     */
    start: number;
    /**
     * 每页条数
     */
    size: number;
}

export interface IVmrTimeBill {
    /**
     * 明细ID
     */
    id: number;

    // chargingAccountId: number;
    /**
     * 1为会议；2为充值
     */
    scheduleName:string;//明细名称
    type: number;
    /**
     * 会议室号
     */
    // name: string;
    startTime:Date;//开始时间
    endTime:Date;//结束时间
    duration:number;//增加/减少时间
}