<template>
    <!-- 搜索和图例区域 -->
    <div ref="SearchLegendRef" class="search-legend">
        <!-- 搜索框 -->
        <div ref="searchRef" class="search"><i class="iconfont oamap-sousuo"></i><span>查找座位、人员、区域信息</span></div>
        <!-- 图例 -->
        <div ref="legendRef" class="legend">
            <div class="legend-item" :class="{'legendItemActive':item.type === $store.state.currentLegend}" v-for="item in legendList" :key="item.id" v-on:click="handleClickLegend(item.type)">
                <div class="legend-image">
                    <img :src="item.url">
                </div>
                <span>{{item.name}}</span>
            </div>
        </div>
    </div>
    <!-- 切换楼层 -->
    <div ref="FloorSwitchRef" class="floor-switch">
        <div :class="{'active':item.lable === $store.state.currentFloor}" v-for="item in AllArea" :key='item.id' v-on:touchstart="handleTouchFloor(item.lable)">{{item.name}}</div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
export default {
    name:'search',
    setup() {
        // 创建 store 实例
        const store = useStore()
        // 楼层或地区的数据
        const AllArea = [
            {id:0,name:'3楼',lable:'three'},
            {id:1,name:'4楼',lable:'four'}
        ]
        // 触摸切换楼层（或地区）触发的函数
        function handleTouchFloor(floor) {
            // 设置当前选中的楼层（或地区）
            store.commit('setCurrentFloor',floor)
        }

        // 图例数据
        const legendList = [
            {id:0,name:'员工',lable:'employees',type:'0',url:'/legend-image/image0.png'},
            {id:1,name:'空闲',lable:'free',type:'0-1',url:'/legend-image/image1.png'},
            {id:2,name:'占用',lable:'occupation',type:'0-2',url:'/legend-image/image2.png'},
            {id:3,name:'会议室',lable:'meeting-room',type:1,url:'/legend-image/icon_meeting.png'},
        ]
        // 点击某一个图例触发的函数
        function handleClickLegend(type) {
            store.commit('setCurrentLegend',type)
        }
        // 获取 SearchLegendRef、FloorSwitchRef、searchRef、legendRef 四个盒子的DOM对象
        const SearchLegendRef = ref(null)
        const FloorSwitchRef = ref(null)
        const searchRef = ref(null)
        const legendRef = ref(null)
        // 在 mounted 中给 SearchLegendRef 注册手势事件
        onMounted(() => {
           // 1、注册 touchstart 事件
           SearchLegendRef.value.addEventListener('touchstart', SearchLegendTouchstartFn)
           // 2、注册 touchmove 事件
           SearchLegendRef.value.addEventListener('touchmove', SearchLegendTouchmoveFn)
           // 3、注册 touchend 事件
           SearchLegendRef.value.addEventListener('touchend', SearchLegendTouchendFn)
        })
        // 记录触摸开始时间、结束时间
        let touchstartTime = 0
        let touchendTime = 0
        // 记录触摸的初次坐标 Y
        let touchstartPageY = 0
        // 记录当前屏幕的高度
        let clientHeight = document.body.clientHeight

        // SearchLegendRef 盒子的 bottom 值
        let SearchLegendBottom = 0
        // SearchLegendRef 盒子高度的最大值
        let SearchLegendMaxHeight = 0
        // SearchLegendRef 盒子高度的最小值
        let SearchLegendMinHeight = 0
        // SearchLegend 盒子 touchstart 事件的处理函数
        function SearchLegendTouchstartFn(e) {
            // 首先判断作用在当前元素上的手指列表长度
            if(e.changedTouches.length === 1){
                // 如果作用在当前事件的手指列表长度为1,记录初始坐标
                touchstartPageY = e.changedTouches[0].pageY
                // 计算 SearchLegendRef 盒子的 bottom 值
                SearchLegendBottom = clientHeight - SearchLegendRef.value.offsetHeight - SearchLegendRef.value.offsetTop
                // 计算 SearchLegendRef 盒子高度的最大值
                SearchLegendMaxHeight = Math.ceil(clientHeight * 0.9) - SearchLegendBottom
                // 计算 SearchLegendRef 盒子高度的最小值
                SearchLegendMinHeight = FloorSwitchRef.value.offsetHeight - SearchLegendBottom + legendRef.value.offsetTop
            }
        }
        // SearchLegend 盒子 touchmove 事件的处理函数
        function SearchLegendTouchmoveFn(e) {
            if(e.changedTouches.length === 1){
                // 滑动的变量
                const value = e.changedTouches[0].pageY - touchstartPageY
                // 判断滑动的方向
                if(value >= 0){
                    // 如果大于0，则说明是向下滑
                    // 向下滑动时，如果 SearchLegend 盒子的高度小于最小值，则停止
                    if(SearchLegendRef.value.offsetHeight <= SearchLegendMinHeight) return SearchLegendRef.value.style.height = SearchLegendMinHeight + 'px'
                    
                }else{
                    // 小于0，则说明是向上滑动
                    // 向上滑动时，如果 SearchLegend 盒子的高度大于了最大值，则停止
                    if(SearchLegendRef.value.offsetHeight >= SearchLegendMaxHeight) return SearchLegendRef.value.style.height = SearchLegendMaxHeight + 'px'
                }
                SearchLegendRef.value.style.height = SearchLegendRef.value.offsetHeight - value + 'px'
                touchstartPageY = e.changedTouches[0].pageY
            }
        }
        // SearchLegend 盒子 touchend 事件的处理函数
        function SearchLegendTouchendFn() {
        }
        return {
            AllArea,
            handleTouchFloor,
            legendList,
            handleClickLegend,
            SearchLegendRef,
            FloorSwitchRef,
            legendRef,
            searchRef,

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
    padding: .3226rem .3226rem 0 .3226rem;
    .search{
        width: 100%;
        height: .8602rem;
        background-color: #262729;
        border-radius: 7px;
        display: flex;
        align-items: center;
        margin-bottom: .2688rem;
        .oamap-sousuo{
            color: #f8f9fa;
            font-size: .4301rem;
            margin: 0 .3226rem 0 .3226rem;
        }
        span{
            color: #b1b2b4;
            font-size: .4301rem;
        }
    }
    .legend{
        display: flex;
        justify-content: space-between;
        .legend-item{
            width: 25%;
            height: 1.0753rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            .legend-image{
                width: .4301rem;
                height: .4301rem;
                border-radius: 50%;
                img{
                    width: 100%;
                }
            }
            span{
                color: #fff;
                font-size: .2151rem;
            }
            &.legendItemActive{
                transform: scale(1.4);
            }
        }
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