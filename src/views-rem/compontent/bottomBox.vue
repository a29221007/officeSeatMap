<template>
    <!-- 上面滑动区域 -->
    <div ref="SearchLegendRef" class="search-legend">
        <div class="arrow arrow-left"></div>
        <div class="arrow arrow-right"></div>
        <!-- 里面切换子组件 -->
        <component ref="componentRef" v-on:setSearchLegendContant="setSearchLegendContant" :is="SearchLegendContant"></component>
    </div>
    <!-- 下面切换楼层区域 -->
    <div ref="FloorSwitchRef" class="floor-switch" v-show="SearchLegendContant === 'init'">
        <div :class="{'active':item.lable === $store.state.currentFloor}" v-for="item in AllArea" :key='item.id' v-on:click="handleClickFloor(item.lable)">{{item.name}}</div>
    </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
// 导入子组件
import Init from './bottomBox-init'
import Search from './bottomBox-search'
import Information from './bottomBox-Information'
import initMap from '../hook/InitMap'
// 导入
export default {
    name:'bottomBox',
    components:{
        Init, Search, Information
    },
    emits:['switchFloor'],
    setup(prop,{ emit }) {
        // 创建 store 实例
        const store = useStore()

        // 楼层或地区的数据
        const AllArea = [
            {id:0,name:'3楼',lable:'three'},
            {id:1,name:'4楼',lable:'four'}
        ]
        // 触摸切换楼层（或地区）触发的函数
        function handleClickFloor(floor) {
            if(floor === store.state.currentFloor) return
            // 设置当前选中的楼层（或地区）
            store.commit('setCurrentFloor',floor)
            // 切换楼层（或地区）时，向父组件发布一个事件
            emit('switchFloor')
            initMap()
        }

        // 获取 SearchLegendRef、FloorSwitchRef 两个盒子的DOM对象
        const SearchLegendRef = ref(null)
        const FloorSwitchRef = ref(null)
        
        // 判断滑动的方向
        let flag = ''
        // 记录触摸 SearchLegendRef 盒子的初始坐标 Y
        let touchstartPageY = 0
        // 记录 SearchLegendRef 盒子初始的top值(页面加载时的 top 值)
        let SearchLegendTop = 0
        // 记录初始 SearchLegendRef 盒子的bottom值
        let SearchLegendBottom = 0
        // 记录触摸时 SearchLegendRef 盒子的实时 Top 值
        let SearchLegendNowTop = 0
        // 记录当前屏幕的高度
        let clientHeight = document.documentElement.clientHeight
        // 最小的 top 值 （也是最顶端的）
        let SearchLegendMinTop = 0
        // 最大的 top 值 （也是最底端的）
        let SearchLegendMaxTop = 0

        // 记录初始化时 FloorSwitchRef 距离顶部的距离
        let FloorSwitchTop = 0
        // 在 mounted 中给 SearchLegendRef 注册手势事件
        onMounted(() => {
            // 1、注册 touchstart 事件
            SearchLegendRef.value.addEventListener('touchstart', SearchLegendTouchstartFn)
            // 2、注册 touchmove 事件
            SearchLegendRef.value.addEventListener('touchmove', SearchLegendTouchmoveFn)
            // 3、注册 touchend 事件
            SearchLegendRef.value.addEventListener('touchend', SearchLegendTouchendFn)

            // ---- 变量的计算
            // 1、计算初始 top 值,并将 SearchLegendRef 盒子的高度取消，设置为top值
            SearchLegendTop = SearchLegendRef.value.offsetTop
            SearchLegendRef.value.style.height = 'unset'
            SearchLegendRef.value.style.top = SearchLegendTop + 'px'

            // 2、计算最大的top值
            // 2.1、计算初始 SearchLegendRef 盒子的bottom值
            SearchLegendBottom = clientHeight - SearchLegendRef.value.offsetTop - SearchLegendRef.value.offsetHeight
            // 2.2、计算重叠部分
            let repeatHeight = FloorSwitchRef.value.offsetHeight - SearchLegendBottom
            // 2.3、计算最大的top值
            const legendRef = document.querySelector('.legend')
            SearchLegendMaxTop = SearchLegendTop + (SearchLegendRef.value.offsetHeight - repeatHeight - legendRef.offsetTop)

            // 3、计算最小的top值
            SearchLegendMinTop = clientHeight * 0.05

            store.commit('setClentHeight',SearchLegendTop)

            // 设置切换楼层（或者地区）盒子的样式 -----------------------
            // 获取 FloorSwitchRef 这个盒子距离顶部的距离
            FloorSwitchTop = FloorSwitchRef.value.offsetTop
            FloorSwitchRef.value.style.height = 'unset'
            FloorSwitchRef.value.style.top = FloorSwitchTop + 'px'
        })
        // SearchLegend 盒子 touchstart 事件的处理函数
        function SearchLegendTouchstartFn(e) {
            // 首先判断作用在当前元素上的手指列表长度
            if(e.changedTouches.length === 1){
                // 触摸时，将方向的变量重置为 '' 空
                flag = ''
                // 如果作用在当前事件的手指列表长度为1,记录初始坐标
                touchstartPageY = e.changedTouches[0].pageY
                // 记录触摸式的当前的 top 值
                SearchLegendNowTop = SearchLegendRef.value.offsetTop
            }
        }
        // 实现一个互锁
        let b = true // 管上
        let c = true // 管下
        // SearchLegend 盒子 touchmove 事件的处理函数
        function SearchLegendTouchmoveFn(e) {
            // 阻止浏览器的默认行为，为了解决苹果浏览器的页面可以整体滚动的bug
            e.preventDefault()
            SearchLegendRef.value.style.transition = `none`
            if(e.changedTouches.length === 1){
                // 滑动的变量
                const value = e.changedTouches[0].pageY - touchstartPageY
                // 判断滑动的方向
                if(value > 0 && c){
                    flag = 'down'
                    b = true
                    // 如果大于0，则说明是向下滑
                    // 向下滑动时，如果 SearchLegend 盒子的 top 值比最大的还大，则停止
                    if(SearchLegendRef.value.offsetTop >= SearchLegendMaxTop) {
                        SearchLegendRef.value.style.top = SearchLegendMaxTop + 'px'
                        return c = false
                    }
                    SearchLegendRef.value.style.top = SearchLegendRef.value.offsetTop + value + 'px'
                }else if(value < 0 && b){
                    flag = 'up'
                    c = true
                    // 小于0，则说明是向上滑动
                    // 向上滑动时，如果 SearchLegend 盒子的 top 值比最小的还小，则停止
                    if(SearchLegendRef.value.offsetTop < SearchLegendMinTop) {
                        SearchLegendRef.value.style.top = SearchLegendMinTop + 'px'
                        return b = false
                    }
                    SearchLegendRef.value.style.top = SearchLegendRef.value.offsetTop + value + 'px'
                }
                touchstartPageY = e.changedTouches[0].pageY
            }
        }

        // SearchLegend 盒子 touchend 事件的处理函数
        function SearchLegendTouchendFn() {
            // 给 SearchLegendRef 盒子添加过渡效果
            SearchLegendRef.value.style.transition = `all 0.5s`
            // // 判断是否超过临界值，如果超过了，则就return，并等于临界值
            // if(SearchLegendRef.value.offsetTop >= SearchLegendMaxTop) return SearchLegendRef.value.style.top = SearchLegendMaxTop + 'px'
            // if(SearchLegendRef.value.offsetTop <= SearchLegendMinTop) return SearchLegendRef.value.style.top = SearchLegendMinTop + 'px'
            // 触摸结束时的盒子高度（目的是将判断语句中抽离出来，简化if判断语句的条件）
            let top = SearchLegendRef.value.offsetTop
            if(SearchLegendContant.value === 'init') {
                // 判断是否超过临界值，如果超过了，则就return，并等于临界值
                if(SearchLegendRef.value.offsetTop >= SearchLegendMaxTop) return SearchLegendRef.value.style.top = SearchLegendMaxTop + 'px'
                if(SearchLegendRef.value.offsetTop <= SearchLegendMinTop) return SearchLegendRef.value.style.top = SearchLegendMinTop + 'px'
                if(flag === 'up'){
                    // 执行向上的逻辑
                    if(top < SearchLegendTop + SearchLegendTop * 0.1 && top > SearchLegendTop * 0.85){
                        return SearchLegendRef.value.style.top = SearchLegendTop + 'px'
                    }else if(top <= SearchLegendTop * 0.85){
                        return SearchLegendRef.value.style.top = SearchLegendMinTop + 'px'
                    }
                    SearchLegendRef.value.style.top = SearchLegendNowTop + 'px'
                }else{
                    // 执行向下的逻辑
                    if(top >= (SearchLegendMinTop + SearchLegendMinTop * 0.3)){
                        return SearchLegendRef.value.style.top = SearchLegendTop + 'px'
                    }else if(top >= SearchLegendTop + SearchLegendTop * 0.15){
                        return SearchLegendRef.value.style.top = SearchLegendMinTop + 'px'
                    }
                    SearchLegendRef.value.style.top = SearchLegendNowTop + 'px'
                }
            }else if(SearchLegendContant.value === 'search'){
                // 判断是否超过临界值，如果超过了，则就return，并等于临界值
                if(SearchLegendRef.value.offsetTop >= SearchLegendMaxTop) return SearchLegendRef.value.style.top = SearchLegendMaxTop + 'px'
                if(SearchLegendRef.value.offsetTop <= SearchLegendMinTop) return SearchLegendRef.value.style.top = SearchLegendMinTop + 'px'
                if(flag === 'down'){
                    // 向下滑动
                    SearchLegendContant.value = 'init'
                }else if(flag === 'up'){
                    // 向上滑动
                    SearchLegendRef.value.style.top = SearchLegendMinTop + 'px'
                }
            }else if(SearchLegendContant.value === 'information'){
                if(flag === 'down'){
                    // 向下滑动
                    SearchLegendContant.value = 'init'
                }else if(flag === 'up'){
                    // 向上滑动
                    SearchLegendContant.value = 'search'
                }
                b = true
                c = true

                // 如果不处于详情页了，那么将当前的高亮状态取消掉（正好发布这个事件，父组件监听这个事件的处理程序，就是充值座位高亮或区域高亮的）
                emit('switchFloor')
            }
        }

        // 控制 SearchLegend 盒子中组件的切换（初始内容（init）/搜索页面（search）/区域座位信息详情页（Information））的变量
        let SearchLegendContant = ref('init')
        // 设置 SearchLegendContant 变量的函数
        function setSearchLegendContant(value) {
            // 接受子组件的传值
            SearchLegendContant.value = value
        }
        // 输入框获得焦点时的一个延时器id
        let inputTimer = null
        // 监听 SearchLegendContant 值得变化
        watch(SearchLegendContant,(newValue) => {
            if(newValue === 'init'){
                SearchLegendRef.value.style.height = 'unset'
                SearchLegendRef.value.style.top = SearchLegendTop + 'px'
                SearchLegendRef.value.style.bottom = SearchLegendBottom + 'px'
            }else if(newValue === 'search'){
                // 将 SearchLegendRef 盒子的bottom值设置为0，置底
                SearchLegendRef.value.style.bottom = 0
                // 将 SearchLegendRef 盒子的高度设置为最大值
                SearchLegendRef.value.style.top = SearchLegendMinTop + 'px'
                // 将输入框的获得焦点行为放到一个延时器中，这样安卓机和苹果机就都可以兼容了，主要是兼容苹果浏览器
                inputTimer = setTimeout(() => {
                    let search = document.querySelector('.ipt')
                    search && search.focus()
                },300)
            }else if(newValue === 'information'){
                SearchLegendRef.value.style.bottom = 0
                SearchLegendRef.value.style.top = SearchLegendTop + 'px'
            }
        })

        // 卸载阶段，将事件接触
        onBeforeUnmount(() => {
            // 1、移除 touchstart 事件
            SearchLegendRef.value.removeEventListener('touchstart', SearchLegendTouchstartFn)
            // 2、移除 touchmove 事件
            SearchLegendRef.value.removeEventListener('touchmove', SearchLegendTouchmoveFn)
            // 3、移除 touchend 事件
            SearchLegendRef.value.removeEventListener('touchend', SearchLegendTouchendFn)
            // 4、清除输入框的延时器id
            clearTimeout(inputTimer)
        })
        const componentRef = ref(null)
        return {
            AllArea,
            handleClickFloor,
            SearchLegendRef,
            FloorSwitchRef,
            SearchLegendContant,
            setSearchLegendContant,
            componentRef
        }
    }
}
</script>

<style lang="less" scoped>
.search-legend,.floor-switch{
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    width: 10rem;
    background-color: #1b1b1d;
}
.search-legend{
    bottom: 1.2581rem;
    height: 2.7957rem;
    border-radius: 10px 10px 0 0;
    padding: .3226rem;
    .arrow{
        position: absolute;
        top: .1rem;
        left: 50%;
        width: .625rem;
        height: .075rem;
        background-color: #fff;
        overflow: hidden;
    }
    .arrow-left{
        transform: translateX(-99%);
        border-radius: .125rem 0 0 .125rem;
    }
    .arrow-right{
        transform: translateX(-1%);
        border-radius: 0 .125rem .125rem 0;
    }
}
.floor-switch{
    bottom: 0;
    height: 1.2903rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    div{
        flex: 1;
        text-align: center;
        color: #999999;
        font-size: .3871rem;
        line-height: 1.5;
        position: relative;
        &::after{
            content: '';
            display: inline-block;
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: .3871rem;
            height: 1px;
            background-color: #fdfdfd;
        }
        &.active{
            color: #5b83f4;
            &::after{
                background-color: #5b83f4;
            }
        }
    }
}
</style>