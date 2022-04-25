import request from "../utils/request"

// 根据条形码code获取固定资产绑定的信息 
export const getAssetInfoByQR = ({asset_code, v_usercode}) => {
    return request('get/barcode/info','get',{asset_code,v_usercode})
}