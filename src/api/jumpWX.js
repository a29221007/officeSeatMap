// 关于跳转企业微信个人聊天窗口的接口

import request from "../utils/request"
import { requestWX } from '../utils/request'

// 1、获取企业微信应用的AccessToken凭证
export const getAccessToken = () => {
    return request('get/certificate','get')
}

// 2、获取launch_code
export const getLaunchCode = (ACCESS_TOKEN,params) => {
    return requestWX('api/cgi-bin/get_launch_code?access_token=' + ACCESS_TOKEN, 'post',params)
}