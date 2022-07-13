import request from "../utils/request"
import md5 from "blueimp-md5"

// 根据工号获取个人固资信息
export const getFixedassets = ({b_usercode, v_usercode}) => {
    const time = Date.now()
    return request('get/pc/getFixedassets/info','get',{b_usercode,v_usercode,time,token:md5(md5(v_usercode + b_usercode + time + 'bc2#6Kst7j3r2R14b='))})
}
