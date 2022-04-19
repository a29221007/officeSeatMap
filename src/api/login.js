
import request from "../utils/request"

// 登录的第一步
export const login = () => {
    return request('get/wework/code','get')
}

// 登录的第二步
export const getUserInfo = (code) => {
    return request('get/wework/userinfo','get',{code})
}