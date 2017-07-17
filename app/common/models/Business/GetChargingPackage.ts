
export interface IGetChargingPackageResponse {
    /**
     * [0|28] => [成功|失败]
     */
    code: string;
    /**
     * [0|28] => [成功|失败]
     */
    msg: string;
    data: IChargingPackage[]
}

export interface IGetChargingPackageRequest {
    /**
     * 第三方用户ID
     */
    openId: string;
}

export interface IChargingPackage {

    /**
     * 价格
     */
    id:number;
    price: number;
    /**
     * 时长
     */
    duration: number;
    //失效天数
    validPeriod:number;
}