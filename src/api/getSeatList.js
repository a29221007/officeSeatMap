import request from "../utils/request"

// 1、获取 三楼/四楼/深圳 人员的信息以及座位信息
export const getSeatList = (params,office) => {
    return request('seatlist','get',{floor:params,location:office})
}