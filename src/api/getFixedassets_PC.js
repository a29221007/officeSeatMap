import request from "../utils/request"

// 根据工号获取个人固资信息
// export const getFixedAssets_PC = ({b_usercode,v_usercode}) => {
//     return request('get/pc/getFixedassets/info','get',{b_usercode,v_usercode})
// }

export const getFixedAssets_PC = ({b_usercode, code}) => {
    return request('get/mt/getFixedassets/info','get',{b_usercode,code})
}