<template>
    <!-- 2、点击了搜索后，显示搜索框和搜索建议列表 -->
    <div class="search">
        <!-- 搜索框 -->
        <div class="search-input">
            <i v-on:click="handleClickBack" class="iconfont oamap-zuojiantou"></i>
            <input ref="inputRef" class="ipt" v-model="inputValue" type="text" placeholder=" 搜索" v-on:input="handleInputSearch">
            <i v-if="inputValue" v-on:click="handleClickClear" class="iconfont oamap-qingchu"></i>
        </div>
        <!-- 搜索结果展示 -->
        <div class="querySearch" ref="querySearchRef" v-on:touchmove="querySearchMove">
            <template v-if="is_none_sugges">
                <div class="querySearch-item" v-for="item in querySearchList" :key="item.id" v-on:click="handleClickQuerySearchItem(item)">
                    <div class="autoCompleteTemplate" v-if="item.type === '0' || item.type === '0-1' || item.type === '0-2'">
                        <!-- 第一行左边显示姓名，右边显示座位号 -->
                        <div class="oneLine">
                            <span><span class="title">座位人员名称：</span><span class="content">{{item.name || '暂无数据'}}</span></span>
                            <span><span class="title">座位号：</span><span class="content">{{item.seat_id}}</span></span>
                        </div>
                        <!-- 第二行显示该座位所在部门 -->
                        <div class="twoLine"><span class="title">部门：</span><span class="content">{{item.depart || '暂无数据'}}</span></div>
                    </div>
                    <div class="autoCompleteTemplate" v-if="item.diff === 1 || item.diff === 2">
                        <!-- 第一行左边显示姓名，右边显示座位号 -->
                        <div class="oneLine">
                            <span><span class="title">区域名称：</span><span class="content">{{item.name + (item.subtitle ? item.subtitle.replace("︵","（").replace('︶','）').replace(/\s/g,"") : '') || '暂无数据'}}</span></span>
                        </div>
                        <!-- 第二行显示该座位所在部门 -->
                        <div class="twoLine">
                            <span><span class="title">区域编号：</span><span class="content">{{item.code}}</span></span>
                        </div>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="is_none_sugges">暂无匹配项</div>
            </template>
        </div>
    </div>
</template>

<script>
import { reactive, toRefs, nextTick, inject, ref, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { Dialog } from 'vant'
import { beginToast, endToast } from '@/views-rem/hook/toast.js'
// 座位设置高亮的公共方法
import searchSeat from '@/views-rem/hook/searchSeat.js'
// 区域设置高亮的公共方法
import searchArea from '@/views-rem/hook/searchArea.js'
export default {
    name:'BottomBoxSearch',
    emits:['setSearchLegendContant'],
    props:{
        AllArea:{
            type:Array,
            required:true
        }
    },
    setup(prop,{ emit }) {
        const store = useStore()
        // 搜索框的数据和逻辑
        let searchInput = reactive({
            // 搜索框的输入绑定值
            inputValue: '', // 默认为空
            // 搜索事件的防抖变量
            searchTimer: null,
            // 是否有匹配项
            is_none_sugges: true, // 默认是true，有匹配项
            // 输入框的input事件，触发的函数
            handleInputSearch(){
                if(searchInput.inputValue){
                    beginToast('loading','搜索中',0,'.querySearch')
                }
                searchInput.is_none_sugges = true
                clearTimeout(searchInput.searchTimer)
                searchInput.searchTimer = setTimeout(() => {
                    if(!searchInput.inputValue){
                        endToast()
                        return querySearch.querySearchList = []
                    }
                    let searchArray = store.getters.AllSeatList
                    // 写搜索的逻辑
                    const results = searchArray.filter(item => {
                        return (item.name && item.name.toString().replace(/\s/g,"").toUpperCase().includes(searchInput.inputValue.toUpperCase())) || (item.seat_id && item.seat_id.includes(searchInput.inputValue.toUpperCase())) || (item.code && item.code.toUpperCase().includes(searchInput.inputValue.toUpperCase())) || (item.subtitle && item.subtitle.replace(/\s/g,"").toUpperCase().includes(searchInput.inputValue.toUpperCase()))
                    })
                    // 去除多个重复的项
                    // 保存关于座位的(这里面的值都是唯一的)
                    let array_seat = []
                    // 保存关于区域的(这里面的值可能是有重复的)
                    let array_area = []
                    results.forEach(item => {
                        if(item.type === '0' || item.type === '0-1' || item.type === '0-2'){
                            array_seat.push(item)
                        }else{
                            array_area.push(item)
                        }
                    })
                    let obj = {}
                    array_area.forEach(item => {
                        if(!obj[item.code]) obj[item.code] = []
                        obj[item.code].push(item)
                    })
                    for(let key in obj){
                        array_seat.push(obj[key][0])
                    }
                    if(array_seat.length !== 0){
                        querySearch.querySearchList = array_seat
                    }else{
                        searchInput.is_none_sugges = false
                        querySearch.querySearchList = []
                    }
                    endToast()
                },300)
            },
            // 点击输入框的返回箭头
            handleClickBack(){
                // 点击向右的返回箭头，向父组件发布事件，修改 SearchLegendContant 的值为 'init'
                emit('setSearchLegendContant','init')
            },
            // 点击输入框的清除按钮
            handleClickClear(){
                searchInput.inputValue = ''
                querySearch.querySearchList = []
                searchInput.is_none_sugges = true
            }
        })
        let inputRef = ref(null)
        // 搜索建议列表的数据与逻辑
        let querySearch = reactive({
            // 搜索建议列表的数组集合
            querySearchList:[], // 默认是空数组
            // 点击搜索建议中的某一项，触发的函数
            handleClickQuerySearchItem(item) {
                if(!searchInput.is_none_sugges) return
                // 如果是触发某一项搜索，首先要把当前的图例复原，全部的dom渲染出来
                store.commit('setCurrentLegend','')
                // 要使用 nextTick 函数获取更新后的dom元素
                nextTick(() => {
                    // 判断搜索的类型，是座位还是区域
                    if(item.type === '0' || item.type === '0-1' || item.type === '0-2'){
                        // 如果搜索的是座位
                        const { qr_code, name, seat_id } = item
                        console.log(item)
                        // 选中某一项，首先判断该员工的座位，是否在当前楼层
                        if(item.floor == store.getters.floor){
                            // 向父组件发布事件，修改 SearchLegendContant 的值为 'information'
                            emit('setSearchLegendContant','information')
                            store.commit('setActiveInfo',item)
                            upDataCurrentSeat_id(seat_id)
                            searchSeat(seat_id)
                            if(item.type === '0'){
                                // 设置分享的链接参数为点击座位的qr_code
                                store.commit('setShare',qr_code)
                                // 搜索座位时，就判断当前用户是否有权限查看被点击员工的固资信息
                                store.dispatch('getPersontFixedAssetsList',{ b_usercode:item.id, v_usercode:store.state.UserInfo.usercode })
                            }
                        }else{
                            // 如果不相同，则提示用户是否需要自动跳转到对应楼层（或地区）
                            Dialog.confirm({
                                title: '提示',
                                message:`查找的员工座位不在当前区域,是否要自动跳转到对应区域（${item.floor}楼）`,
                            }).then(() => {
                                // 用户如果确认跳转
                                // 判断将要切换的楼层
                                let pushFloor = null
                                if(item.floor == 3 && item.office == '1'){
                                    pushFloor = 'three'
                                }else if(item.floor == 4 && item.office == '1'){
                                    pushFloor = 'four'
                                }else if(item.floor == 7 && item.office == '2'){
                                    pushFloor = 'shenzhen'
                                }
                                store.commit('setCurrentFloor',pushFloor)
                                // 向父组件发布事件，修改 SearchLegendContant 的值为 'information'
                                emit('setSearchLegendContant','information')
                                store.commit('setActiveInfo',item)
                                if(item.type === '0'){
                                    // 设置分享的链接参数为点击座位的qr_code
                                    store.commit('setShare',qr_code)
                                    // 搜索座位时，就判断当前用户是否有权限查看被点击员工的固资信息
                                    store.dispatch('getPersontFixedAssetsList',{ b_usercode:item.id, v_usercode:store.state.UserInfo.usercode })
                                }
                                nextTick(() => {
                                    upDataCurrentSeat_id(seat_id)
                                    searchSeat(seat_id)
                                    beginToast('success','切换成功',2000)
                                })
                            }).catch(() => {
                                // 用户如果取消跳转
                                beginToast('fail',`您可以手动切换到${item.floor}楼后再查找`,2000)
                            })
                        }
                    }else{
                        // 如果是区域
                        if(item.floor == store.getters.floor){
                            if(item.type === 1){
                                // 设置分享的链接参数为点击座位的qr_code
                                store.commit('setShare',item.qr_code)
                                getMeetingRoomData(item)
                            }else{
                                store.commit('setActiveInfo',item)
                                // 如果搜索的区域在当前楼层将其高亮
                                searchArea(item.code,upDataCurrentAreaCode)
                                // 向父组件发布事件，修改 SearchLegendContant 的值为 'information'
                                emit('setSearchLegendContant','information')
                            }
                        }else{
                            // 如果不相同，则提示用户是否需要自动跳转到对应楼层（或地区）
                            Dialog.confirm({
                                title: '提示',
                                message:`查找的区域信息不在当前区域,是否要自动跳转到对应区域（${item.floor}楼）`,
                            }).then(() => {
                                // 用户如果确认跳转
                                // 判断将要切换的楼层
                                let pushFloor = null
                                if(item.floor == 3 && item.office == '1'){
                                    pushFloor = 'three'
                                }else if(item.floor == 4 && item.office == '1'){
                                    pushFloor = 'four'
                                }else if(item.floor == 7 && item.office == '2'){
                                    pushFloor = 'shenzhen'
                                }
                                store.commit('setCurrentFloor',pushFloor)
                                nextTick(() => {
                                    beginToast('success','切换成功',2000)
                                    if(item.type === 1){
                                        // 设置分享的链接参数为点击座位的qr_code
                                        store.commit('setShare',item.qr_code)
                                        getMeetingRoomData(item)
                                    }else{
                                        store.commit('setActiveInfo',item)
                                        searchArea(item.code,upDataCurrentAreaCode)
                                        // 向父组件发布事件，修改 SearchLegendContant 的值为 'information'
                                        emit('setSearchLegendContant','information')
                                    }
                                })
                            }).catch(() => {
                                // 用户如果取消跳转
                                beginToast('fail',`您可以手动切换到${item.floor}楼后再查找`,2000)
                            })
                        }
                    }
                })
            },
            // 给搜索建议列表绑定一个 touchmove 事件，并阻止冒泡行为
            querySearchMove(e){
                if(!searchInput.inputValue || !searchInput.is_none_sugges) return
                e.stopPropagation()
                inputRef.value.blur()
            }
        })
        // 接受祖先组件传递来的设置选中区域编号的函数
        let upDataCurrentAreaCode = inject('upCurrentAreaCode')
        // 接受祖先组件传递来的设置选中座位id的函数
        let upDataCurrentSeat_id = inject('upCurrentSeat_id')
        // 接受祖先组件传递过来的获取会议室相关数据的函数
        let getMeetingRoomData = inject('getMeetingRoomData')
        // 卸载阶段
        onBeforeUnmount(() => {
            clearTimeout(searchInput.searchTimer)
            beginToast('loading','',1,'body')
        })
        return {
            ...toRefs(searchInput),
            ...toRefs(querySearch),
            inputRef,
            searchArea
        }
    }
}
</script>

<style lang="less" scoped>
.search{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .search-input{
        width: 100%;
        height: .8602rem;
        background-color: #262729;
        border-radius: 7px;
        display: flex;
        align-items: center;
        .oamap-zuojiantou,.oamap-qingchu{
            color: #f8f9fa;
            font-size: .4301rem;
            margin: 0 .3226rem 0 .3226rem;
        }
        input{
            width: 100%;
            height: .4301rem;
            background-color: unset;
            border: none;
            caret-color: skyblue;
            color: #f8f9fb;
            &::-webkit-input-placeholder{
                color: #b1b2b4;
            }
        }
    }
    .search-floor-switch{
        color: #fff;
        display: flex;
        height: .7312rem;
        align-items: center;
        margin: .1075rem 0;
        font-size: .4516rem;
        justify-content: space-around;
        div.active{
            color: tomato;
        }
    }
    .querySearch{
        width: 100%;
        flex: 1;
        overflow: auto;
        .querySearch-item{
            padding: .2151rem;
            & ~ .querySearch-item {
                border-top: 1px solid #30322f;
            }
            .autoCompleteTemplate{
                // 第一行
                .oneLine{
                    display: flex;
                    justify-content: space-between;
                    color: #f4f4f4;
                }
                // 第二行
                .twoLine{
                    color: #a0a0a0;
                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space:nowrap;
                }
                .title{
                    font-size:.3763rem;
                }
                .content{
                    font-size: .3226rem;
                }
            }
        }
        .is_none_sugges{
            font-size: .3763rem;
            color: #e8e8e8;
            text-align: center;
            margin-top: .2151rem;
        }
    }
}
</style>