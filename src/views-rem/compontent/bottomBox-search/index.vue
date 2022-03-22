<template>
    <!-- 2、点击了搜索后，显示搜索框和搜索建议列表 -->
    <div class="search">
        <div class="search-input">
            <i v-on:click="handleClickBack" class="iconfont oamap-zuojiantou"></i>
            <input ref="inputRef" v-model="inputValue" type="text" autofocus placeholder=" 搜索" v-on:input="handleInputSearch">
            <i v-if="inputValue" v-on:click="handleClickClear" class="iconfont oamap-qingchu"></i>
        </div>
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
                    <div class="autoCompleteTemplate" v-if="item.type === 1 || item.type === 2 || item.type === 3">
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
import { reactive, toRefs, nextTick, inject, ref, onBeforeUnmount} from 'vue'
import { useStore } from 'vuex'
import { Dialog, Toast } from 'vant'
// 导入事件中心
import emitter from '@/views/eventbus.js'
export default {
    name:'BottomBoxSearch',
    emits:['setSearchLegendContant'],
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
                searchInput.is_none_sugges = true
                clearTimeout(searchInput.searchTimer)
                searchInput.searchTimer = setTimeout(() => {
                    if(!searchInput.inputValue){
                        return querySearch.querySearchList = []
                    }
                    // 写搜索的逻辑
                    const results = store.getters.AllSeatList.filter(item => {
                        return (item.name && item.name.replace(/\s/g,"").toUpperCase().includes(searchInput.inputValue.toUpperCase())) || (item.seat_id && item.seat_id.includes(searchInput.inputValue.toUpperCase())) || (item.code && item.code.toUpperCase().includes(searchInput.inputValue.toUpperCase())) || (item.subtitle && item.subtitle.replace(/\s/g,"").toUpperCase().includes(searchInput.inputValue.toUpperCase()))
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
                    if(results.length !== 0){
                        querySearch.querySearchList = array_seat
                    }else{
                        searchInput.is_none_sugges = false
                    }
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
                // 判断搜索的类型，是座位还是区域
                if(item.type === '0' || item.type === '0-1' || item.type === '0-2'){
                    // 如果搜索的是座位
                    const { depart, name, seat_id } = item
                    // 选中某一项，首先判断该员工的座位，是否在当前楼层
                    if(item.floor == store.getters.floor){
                        // 向父组件发布事件，修改 SearchLegendContant 的值为 'information'
                        emit('setSearchLegendContant','information')
                        // 将 SearchLegendRef 盒子的bottom值设置为0，置底
                        let el = document.getElementById(seat_id)
                        el.click()
                        store.commit('setActiveInfo',item)
                    }else{
                        // 如果不相同，则提示用户是否需要自动跳转到对应楼层（或地区）
                        Dialog.confirm({
                            title: '提示',
                            message:`查找的员工座位不在当前区域,是否要自动跳转到对应区域（${item.floor}楼）`,
                        }).then(() => {
                            // 用户如果确认跳转
                            store.commit('setCurrentFloor',store.getters.floor === 3 ? 'four' : 'three')
                            // 向父组件发布事件，修改 SearchLegendContant 的值为 'information'
                            emit('setSearchLegendContant','information')
                            nextTick(() => {
                                // 将 SearchLegendRef 盒子的bottom值设置为0，置底
                                let el = document.getElementById(seat_id)
                                el.click()
                                store.commit('setActiveInfo',item)
                                Toast.success('切换成功')
                            })
                        }).catch(() => {
                            // 用户如果取消跳转
                            Toast.fail(`您可以手动切换到${item.floor}楼后再查找`)
                        })
                    }
                }else{
                    // 如果是区域
                    if(item.floor == store.getters.floor){
                        // 向父组件发布事件，修改 SearchLegendContant 的值为 'information'
                        emit('setSearchLegendContant','information')
                        // 如果搜索的区域在当前楼层将其高亮
                        searchArea(item.code)
                        store.commit('setActiveInfo',item)
                    }else{
                        // 如果不相同，则提示用户是否需要自动跳转到对应楼层（或地区）
                        Dialog.confirm({
                            title: '提示',
                            message:`查找的区域信息不在当前区域,是否要自动跳转到对应区域（${item.floor}楼）`,
                        }).then(() => {
                            // 用户如果确认跳转
                            store.commit('setCurrentFloor',store.getters.floor === 3 ? 'four' : 'three')
                            // 向父组件发布事件，修改 SearchLegendContant 的值为 'information'
                            emit('setSearchLegendContant','information')
                            nextTick(() => {
                                searchArea(item.code)
                                Toast.success('切换成功')
                                store.commit('setActiveInfo',item)
                            })
                        }).catch(() => {
                            // 用户如果取消跳转
                            Toast.fail(`您可以手动切换到${item.floor}楼后再查找`)
                        })
                    }
                }
            },
            // 给搜索建议列表绑定一个 touchmove 事件，并阻止冒泡行为
            querySearchMove(e){
                if(!searchInput.inputValue || !searchInput.is_none_sugges) return
                e.stopPropagation()
                inputRef.value.blur()
            }
        })
        let upDataCurrentAreaCode = inject('upCurrentAreaCode')
        let MapContainerBoxOffsetHeight = inject('MapContainerBoxHeight')
        // 区域搜索公共的方法
        function searchArea(code){
            // 1、获取code的所有区域
            let elList = [...document.querySelectorAll(`.${code}`)]
            // 2、找出同一个code区域的所有宽、高、以及位置信息
            let code_Array = elList.reduce((result,item) => {
                return result.concat({
                    left:item.offsetLeft,
                    top:item.offsetTop,
                    width:item.offsetWidth,
                    height:item.offsetHeight
                })
            },[])
            // 3、确定code编码区域的整体大小以及整体区域的位置
            // 获取code_Array中最大left、最小left、最大top、最小top的值，以及最大left项的width、最大top的height
            let maxLeft = 0 // 最大left
            let minLeft = 0 // 最小left
            let maxTop = 0 // 最大top
            let minTop = 0 // 最小top
            code_Array.forEach((item,index) => {
                const {left, top} = item
                if(index === 0){
                    maxLeft = left
                    minLeft = left
                    maxTop = top
                    minTop = top
                }else{
                    if(left > maxLeft) maxLeft = left
                    if(left < minLeft) minLeft = left
                    if(top > maxTop) maxTop = top
                    if(top < minTop) minTop = top
                }    
            })
            let maxLeftWidth = code_Array.find(item => item.left === maxLeft).width // 最大left项的width
            let maxLeftHeight = code_Array.find(item => item.top === maxTop).height // 最大top的height

            /**
             * 4、计算
             * 整体区域大小的宽度 = 大left - 小left + 大left的width
             * 整体区域大小的高度 = 大top - 小top + 大top的height
             * 整体区域的位置 top = 小top
             * 整体区域的位置 left = 小left
             * 整体区域的缩放比例
             * mapBox的宽度 / 整体区域的宽度 （值不能大于3）
             * mapBox的高度 / 整体区域的高度 （值不能大于3）
            */
            let currentAreaWidth = maxLeft - minLeft + maxLeftWidth // 整体区域大小的宽度
            let currentAreaHeight = maxTop - minTop + maxLeftHeight // 整体区域大小的高度
            // 5、获取mapBox元素
            let mapBox = document.querySelector('.map-box')
            // 6、设置过度属性，以及过渡时间
            mapBox.style.transition = 'all 1s'
            // 7、计算缩放比例
            let scaleX = ((mapBox.offsetWidth * store.state.scale[0]) / currentAreaWidth > 3 ? 3 : (mapBox.offsetWidth * store.state.scale[0]) / currentAreaWidth) - 0.1
            let scaleY = ((mapBox.offsetHeight * store.state.scale[1]) / currentAreaHeight > 3 ? 3 : (mapBox.offsetHeight * store.state.scale[1]) / currentAreaHeight) - 0.1
            // 7.1、判断两个缩放比例差值绝对值是否大于1
            if(Math.abs(scaleX - scaleY) > 1){
                // 如果大于1，则将将两个缩放的比例取最小的那一个
                const minScale = scaleX > scaleY ? scaleY : scaleX
                scaleX = minScale
                scaleY = minScale
            }
            // 8、计算被搜索的区域在map-container中的距离
            let mapContainer_X = minLeft + (currentAreaWidth / 2) + mapBox.offsetLeft
            let mapContainer_Y = minTop + (currentAreaHeight / 2) + mapBox.offsetTop
            // 9、得到MapContainerRef盒子的宽、高 / 2 (得到一半的值)
            let MapContainerBox = document.querySelector('.body-container')
            MapContainerBox.offsetWidth / 2
            MapContainerBox.offsetHeight / 2
            // 10、得到了视图应该移动的距离
            let valueX = mapContainer_X - (MapContainerBox.offsetWidth / 2)
            let valueY = mapContainer_Y - (MapContainerBoxOffsetHeight.value / 2)
            // 11、调用 inject 传递过来的函数，设置盒子的高亮状态
            upDataCurrentAreaCode({
                code,
                scaleX,
                scaleY
            })
            // 12、设置MapBoxRef盒子的位置
            mapBox.style.left = (mapBox.offsetLeft - valueX) + 'px'
            mapBox.style.top = (mapBox.offsetTop - valueY) + 'px'
            // 13、设置缩放的中心点，放大地图
            mapBox.style.transformOrigin = `${minLeft + (currentAreaWidth / 2)}px ${minTop + (currentAreaHeight / 2)}px`
            mapBox.style.transform = `scale(${scaleX},${scaleY})`

            nextTick(() => {
                // 关于元素滚动的逻辑
                clearTimer()
                obj = []
                timer123 = null
                let content = document.querySelectorAll('.scroll')
                content.forEach((item) => {
                    // 当前节点的宽度
                    let currentNodeWidth = item.offsetWidth
                    // 当前节点父元素的宽度
                    let curentParentNdoeWidth = item.parentNode.offsetWidth
                    // 子元素和父元素的差值
                    let value = curentParentNdoeWidth - currentNodeWidth
                    if(value < 0){
                        timer123 = setTimeout(() => {
                            clearInterval(item.timer)
                            let target = Math.floor(value)
                            let leader = 0
                            item.timer = setInterval(() => {
                                console.log(123)
                                let step = 1
                                if(Math.abs(leader - target) >= Math.abs(step)){
                                    step = leader > target ? -step : step
                                    leader = leader + step
                                    item.style.left = leader + 'px'
                                }else{
                                    item.style.left = target + 'px'
                                    target = leader === 0 ? value : 0
                                }
                            },200)
                            obj.push(item)
                        },1000)
                    }else{
                        item.style.left = 0
                    }
                })
            })
        }
        // 储存做动画元素，将来要清除元素上的定时器
        let obj = []
        // 这个是延时器的id
        let timer123 = null
        emitter.on('clearAreaTimer',() => {
            clearTimer()
        })
        // 定义一个清除定时器的函数，并通过 provide 传递给子组件，将来信息展示组件的销毁阶段要清除定时器，防止内存泄漏
        function clearTimer(){
            obj.forEach(item => {
                clearInterval(item.timer)
            })
            clearTimeout(timer123)
        }
        // 卸载阶段
        onBeforeUnmount(() => {
            clearTimeout(searchInput.searchTimer)
        })
        return {
            ...toRefs(searchInput),
            ...toRefs(querySearch),
            inputRef
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
        margin-bottom: .2688rem;
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