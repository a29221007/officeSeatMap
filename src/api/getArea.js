// http://172.16.200.152:8091/api/region?floor=3

import request from "../utils/request"

// 1、获取 三楼 / 四楼 区域信息
export const getAreaList = (params) => {
    return request('region','get',{"floor":params})
}