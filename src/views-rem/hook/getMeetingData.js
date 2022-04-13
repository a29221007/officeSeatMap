// /**
//  * 获取会议室信息以及预定记录的公共方法
//  * 参数为：会议室的基本信息集合（防止不是会议室的会议室）
// */

// // 导入 store 
// import store from '@/store'
// // 导入获取会议室相关数据的接口
// import { getMeeting } from '@/api/getMeeting.js'
// function getMeetingData(item){
//     const { code, name } = item
//     getMeeting(code).then(res => {
//         if(res.code !== 0){
//             // 在 code 不等于 0 的情况下，继续判断当前区域是否为会议室，如果不为会议室也会发生报错
//             if(res.code === 2013){
//                 // code 为2013时，则当前选中的会议室（区域）不是会议室，只是当时路数据库时，写成了会议室，要单独处理一下
//                 item.type = 3
//                 store.commit('setActiveInfo',item)
//             }else{
//                 beginToast('fail', res.message, 2000)
//                 // 设置会议室的相关信息
//                 store.commit('setActiveInfo',{
//                     type: 1,
//                     code,
//                     name,
//                 })
//             }
//             searchArea(code,seatData.setCurrentAreaCode)
//             BottomBoxRef.value.setSearchLegendContant('information')
//             if(!scaling) MapBoxTapFn()
//             return
//         }
//         res.data.code = code
//         res.data.type = 1
//         res.data.HistoryList = sortMeetingList(res.data.HistoryList)
//         // 设置会议室的相关信息
//         store.commit('setActiveInfo',res.data)
//         searchArea(code,seatData.setCurrentAreaCode)
//         // 将底部操作盒子设置为 'information' 状态
//         BottomBoxRef.value.setSearchLegendContant('information')
//     }).catch( error => {
//         store.commit('setActiveInfo',{
//             type: 1,
//             code,
//             name
//         })
//         BottomBoxRef.value.setSearchLegendContant('information')
//         if(!scaling) MapBoxTapFn()
//         beginToast('fail', '查询失败', 2000)
//     })
// }

// export default getMeetingData