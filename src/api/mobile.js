// 移动端接口

import request from "../utils/request"

// 1、扫码登录后，向后端发送code字段
export const sendCode = (params) => {
    return request('getWeworkMap/privs','get',{"code":params})
}