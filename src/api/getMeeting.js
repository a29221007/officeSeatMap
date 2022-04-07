import request from "../utils/request"

// 根据区域编码code获取会议室预定的历史记录
export const getMeeting = (params) => {
    return request('get/meeting/info','get',{"code":params})
}