import { createStore } from 'vuex'
// 导入本地存储的函数
import { setItem, getItem } from '@/utils/storage.js'
// 导入获取座位信息的接口
import { getSeatList } from '@/api/getSeatList'
// 导入消息提示框组件
import { errorMessage } from '@/utils/message.js'
export default createStore({
    state: {
        // 当前选中的楼层（或地区）
        currentFloor:getItem('currentFloor'),
        // 3层的座位信息
        seatListOfthree:getItem('seatListOfthree'),
        // 4层的座位信息
        seatListOfFour:getItem('seatListOfFour')
    },
    mutations: {
        // 设置当前选中的楼层（或地区）
        setCurrentFloor(state,data) {
            state.currentFloor = data
            setItem('currentFloor',state.currentFloor)
        },
        // 设置3层的座位信息
        setSeatListOfthree(state,data) {
            state.seatListOfthree = data
            setItem('seatListOfthree',state.seatListOfthree)
        },
        // 设置4层的座位信息
        setSeatListOfFour(state,data) {
            state.seatListOfFour = data
            setItem('seatListOfFour',state.seatListOfFour)
        }
    },
    actions: {
        // 获取3层的座位信息
        async getSeatListOfthree(context) {
            try{
                const {data} = await getSeatList(3)
                context.commit('setSeatListOfthree',data)
            }catch(error){
                errorMessage(error)
            }
        },
        // 获取4层的座位信息
        async getSeatListOfFour(context) {
            try{
                const {data} = await getSeatList(4)
                context.commit('setSeatListOfFour',data)
            }catch(error){
                errorMessage(error)
            }
        }
    },
    modules: {},
    getters: {
        // 全部的人员信息
        AllSeatList(state){
            return state.seatListOfFour.concat(state.seatListOfthree)
        },
        // 根据currentFloor得到当前的楼层（或地区）的数值
        floor(state) {
            return state.currentFloor === 'three' ? 3 : 4
        }
    }
})
