// 关于企业微信相关的接口

import request from "../utils/request"

// 1、跳转企业微信个人聊天窗口，获取launch_code 的 api
export const getLaunchCode = (params) => {
    return request('get/launchCode', 'post',params)
}

// 2、获取配置微信 jdk 时，用到的配置项
export const getQrConfig = (url) => {
    return request(`getQrConfig?url=${url}`, 'post')
}