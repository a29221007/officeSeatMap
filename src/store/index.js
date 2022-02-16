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
        seatListOfFour:getItem('seatListOfFour'),
        // 当前选中的图例(此项不做本地缓存)
        currentLegend:'', // 默认是空字符串
        // 当前的地图的初始缩放系数
        scale:getItem('scale') || [1,1] // 默认是1
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
        },
        // 设置currentLegend图例
        setCurrentLegend(state,data) {
            // 判断currentLegend的值与传递过来的data是否相同，相同的话，就是取消，不相同就是设置
            state.currentLegend = state.currentLegend === data ? '' : data
        },
        // 设置低于初始化缩放系数
        setScale(state,data) {
            state.scale = data
            setItem('scale',state.scale)
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
        },
        // 点击图里筛选后的座位信息
        FilterSeatListByLegend(state) {
            // 1、判断当前的楼层，选择出要做筛选的数组
            const currentFloorSeatList = state.currentFloor === 'three' ? state.seatListOfthree : state.seatListOfFour
            // 2、判断当前是否有选中的图例
            if(state.currentLegend){
                // 3、如果有选中的图例
                return currentFloorSeatList.filter((item) => {
                    return item.type === state.currentLegend
                })
            }else{
                // 4、没有选中的图例，直接返回currentFloorSeatList
                return currentFloorSeatList
            }
        }
    }
})
