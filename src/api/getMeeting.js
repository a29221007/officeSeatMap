import request from "../utils/request"
import store from '@/store'
// 根据区域编码code获取会议室预定的历史记录
export const getMeeting = (params) => {
    return request('get/meeting/info','get',{"code":params,'userCode':store.state.UserInfo.usercode})
}