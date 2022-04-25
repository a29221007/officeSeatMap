// 关于企业微信相关的接口

import request from "../utils/request"

// 1、跳转企业微信个人聊天窗口，获取launch_code 的 api
export const getLaunchCode = (params) => {
    return request('get/launchCode', 'post',params)
}

// 2、获取微信的 config 配置参数 - 企业
export const getQrConfig = (url) => {
    return request(`getQrConfig?url=${url}`, 'post')
}

// 3、获取微信的 agentConfig 配置参数 - 应用的
export const getAgentConfig = (url) => {
    return request(`get/app/config?url=${url}`, 'post')
}