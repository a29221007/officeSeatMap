// 关于跳转企业微信个人聊天窗口的接口

import request from "../utils/request"

// 1、获取launch_code
export const getLaunchCode = (params) => {
    return request('get/launchCode', 'post',params)
}