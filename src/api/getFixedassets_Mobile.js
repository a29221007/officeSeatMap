import request from "../utils/request"

// 根据工号获取个人固资信息
export const getFixedassets_Mobile = ({b_usercode, code}) => {
    return request('get/mt/getFixedassets/info','get',{b_usercode,code})
}
