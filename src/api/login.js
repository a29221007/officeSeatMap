
import request from "../utils/request"

// 登录的第一步
export const login = () => {
    return request('get/wework/code','get')
}

// 登录的第二步(从企业微信登录)
export const getUserInfo = (params) => {
    return request('get/wework/userinfo','get',params)
}

// 登录的第二步(从 OA 登录)
export const getUserInfoFromOA = (params) => {
    return request('get/oa/userinfo','post',params)
}