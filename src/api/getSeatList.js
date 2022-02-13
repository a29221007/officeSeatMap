import request from "../utils/request"

// 1、获取三楼人员的信息
export const getSeatList = (params) => {
    return request('seatlist','get',{"floor":params})
}