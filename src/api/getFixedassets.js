import request from "../utils/request"

// 根据工号获取个人固资信息
export const getFixedassets = ({b_usercode, v_usercode}) => {
    return request('get/pc/getFixedassets/info','get',{b_usercode,v_usercode})
}
