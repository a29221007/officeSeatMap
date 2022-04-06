import request from "../utils/request"

// 根据工号获取个人固资信息
export const getFixedAssets = (params) => {
    return request('getFixedassets/info','get',{"usercode":params})
}