<template>
    <!-- 搜索和图例区域 -->
    <div ref="SearchLegendRef" class="search-legend">
        <template v-if="SearchLegendContant === 'init'">
            <!-- 搜索框 -->
            <div ref="searchBoxRef" class="search-box"><i class="iconfont oamap-sousuo"></i><span>查找座位、人员、区域信息</span></div>
            <!-- 图例 -->
            <div ref="legendRef" class="legend">
                <div class="legend-item" :class="{'legendItemActive':item.type === $store.state.currentLegend}" v-for="item in legendList" :key="item.id" v-on:click="handleClickLegend(item.type)">
                    <div class="legend-image">
                        <img :src="item.url">
                    </div>
                    <span>{{item.name}}</span>
                </div>
            </div>
        </template>
        <template v-if="SearchLegendContant === 'search'">
            <div class="search-input">
                <i class="iconfont oamap-sousuo"></i>
                <input ref="inputRef" v-model="inputValue" type="search" placeholder=" 搜索" v-on:input="handleInputSearch">
            </div>
            <div class="querySearch">
                <template v-if="is_none_sugges">
                    <div class="querySearch-item" v-for="item in querySearchList" :key="item.id">
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
                                <span><span class="title">区域名称：</span><span class="content">{{item.name + item.subtitle.replace("︵","（").replace('︶','）').replace(/\s/g,"") || '暂无数据'}}</span></span>
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
        </template>
    </div>
    <!-- 切换楼层 -->
    <div ref="FloorSwitchRef" class="floor-switch" v-if="SearchLegendContant === 'init'">
        <div :class="{'active':item.lable === $store.state.currentFloor}" v-for="item in AllArea" :key='item.id' v-on:touchstart="handleTouchFloor(item.lable)">{{item.name}}</div>
    </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import AlloyFinger from 'alloyfinger'
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

        // 获取 SearchLegendRef、FloorSwitchRef、searchBoxRef、legendRef 四个盒子的DOM对象
        const SearchLegendRef = ref(null)
        const FloorSwitchRef = ref(null)
        const legendRef = ref(null)
        const searchBoxRef = ref(null)

        // // 记录触摸 SearchLegendRef 盒子的初始坐标 Y
        // let touchstartPageY = 0
        // // 记录触摸时 SearchLegendRef 盒子的初始高度 (正常高度)
        // // let SearchLegendHeight = 0
        // // 记录 SearchLegendRef 盒子初始的top值(页面加载时的 top 值)
        // let SearchLegendTop = 0
        // // 记录触摸时 SearchLegendRef 盒子的实时 Top 值
        // let SearchLegendNowTop = 0
        // // 记录当前屏幕的高度
        // // let clientHeight = document.documentElement.clientHeight
        // // SearchLegendRef 盒子的 bottom 值
        // let SearchLegendBottom = 0
        // // SearchLegendRef 盒子高度的最大值
        // let SearchLegendMaxHeight = 0
        // // SearchLegendRef 盒子高度的最小值
        // let SearchLegendMinHeight = 0
        // 判断滑动的方向
        let flag = ''

        // ----------------------
        // 记录触摸 SearchLegendRef 盒子的初始坐标 Y
        let touchstartPageY = 0
        // 记录 SearchLegendRef 盒子初始的top值(页面加载时的 top 值)
        let SearchLegendTop = 0
        // 记录触摸时 SearchLegendRef 盒子的实时 Top 值
        let SearchLegendNowTop = 0
        // 记录当前屏幕的高度
        let clientHeight = document.documentElement.clientHeight
        // 最小的 top 值 （也是最顶端的）
        let SearchLegendMinTop = 0
        // 最大的 top 值 （也是最低端的）
        let SearchLegendMaxTop = 0
        let searchBox = null
        // 在 mounted 中给 SearchLegendRef 注册手势事件
        onMounted(() => {
            // 1、注册 touchstart 事件
            SearchLegendRef.value.addEventListener('touchstart', SearchLegendTouchstartFn)
            // 2、注册 touchmove 事件
            SearchLegendRef.value.addEventListener('touchmove', SearchLegendTouchmoveFn)
            // 3、注册 touchend 事件
            SearchLegendRef.value.addEventListener('touchend', SearchLegendTouchendFn)

            // ---- 变量的计算
            // // 计算 SearchLegendRef 盒子的 bottom 值
            // SearchLegendBottom = clientHeight - SearchLegendRef.value.offsetHeight - SearchLegendRef.value.offsetTop
            // // 计算 SearchLegendRef 盒子高度的最大值
            // SearchLegendMaxHeight = Math.ceil(clientHeight * 0.9) - SearchLegendBottom
            // // 计算 SearchLegendRef 盒子高度的最小值
            // SearchLegendMinHeight = FloorSwitchRef.value.offsetHeight - SearchLegendBottom + legendRef.value.offsetTop
            // // 计算 SearchLegendRef 盒子高度的正常值
            // SearchLegendHeight = SearchLegendRef.value.offsetHeight
            // 计算 top 值,并将盒子的高度取消，设置为top值
            SearchLegendTop = SearchLegendRef.value.offsetTop
            SearchLegendRef.value.style.height = 'unset'
            SearchLegendRef.value.style.top = SearchLegendTop + 'px'
            // 计算最小的top值
            SearchLegendMinTop = clientHeight * 0.9
            // 计算最大的top值
            SearchLegendMaxTop = SearchLegendTop + legendRef.value.offsetHeight
            // 计算最小的top值
            SearchLegendMinTop = clientHeight * 0.15
            searchBox = new AlloyFinger(searchBoxRef.value,{})
            searchBox.on('tap',handleTapSearchBox)
        })
        // SearchLegend 盒子 touchstart 事件的处理函数
        function SearchLegendTouchstartFn(e) {
            // 首先判断作用在当前元素上的手指列表长度
            if(e.changedTouches.length === 1){
                // 如果作用在当前事件的手指列表长度为1,记录初始坐标
                touchstartPageY = e.changedTouches[0].pageY
                // SearchLegendNowHeight = SearchLegendRef.value.offsetHeight
                SearchLegendNowTop = SearchLegendRef.value.offsetTop
            }
        }
        // SearchLegend 盒子 touchmove 事件的处理函数
        function SearchLegendTouchmoveFn(e) {
            SearchLegendRef.value.style.transition = `none`
            if(e.changedTouches.length === 1){
                // 滑动的变量
                const value = e.changedTouches[0].pageY - touchstartPageY
                // 判断滑动的方向
                if(value >= 0){
                    flag = 'down'
                    // 如果大于0，则说明是向下滑
                    // 向下滑动时，如果 SearchLegend 盒子的 top 值比最大的还大，则停止
                    if(SearchLegendRef.value.offsetTop >= SearchLegendMaxTop) return
                }else{
                    flag = 'up'
                    // 小于0，则说明是向上滑动
                    // 向上滑动时，如果 SearchLegend 盒子的 top 值比最小的还小，则停止
                    if(SearchLegendRef.value.offsetTop <= SearchLegendMinTop) return
                }
                SearchLegendRef.value.style.top = SearchLegendRef.value.offsetTop + value + 'px'
                touchstartPageY = e.changedTouches[0].pageY
            }
        }
        // SearchLegend 盒子 touchend 事件的处理函数
        function SearchLegendTouchendFn() {
            // 给 SearchLegendRef 盒子添加过渡效果
            SearchLegendRef.value.style.transition = `all 0.5s`
            // 判断是否超过临界值，如果超过了，则就return，并等于临界值
            if(SearchLegendRef.value.offsetTop >= SearchLegendMaxTop) return SearchLegendRef.value.style.top = SearchLegendMaxTop + 'px'
            if(SearchLegendRef.value.offsetTop <= SearchLegendMinTop) return SearchLegendRef.value.style.top = SearchLegendMinTop + 'px'
            // 触摸结束时的盒子高度（目的是将判断语句中抽离出来，简化if判断语句的条件）
            let top = SearchLegendRef.value.offsetTop
            if(SearchLegendContant.value === 'init') {
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
                if(flag === 'down'){
                    SearchLegendContant.value = 'init'
                    SearchLegendRef.value.style.top = SearchLegendTop + 'px'
                    nextTick(() => {
                        searchBox = new AlloyFinger(searchBoxRef.value,{})
                        searchBox.on('tap',handleTapSearchBox)
                    })
                }
            }
        }

        // 控制 SearchLegend 盒子中内容的切换（初始内容（init）/搜索页面（search）/区域座位信息详情页（seat_or_area））
        let SearchLegendContant = ref('init')
        const inputRef = ref(null)
        // 点击搜索的盒子的处理函数
        function handleTapSearchBox() {
            console.log(123)
            // 将 SearchLegendRef 盒子的bottom值设置为0，置底
            SearchLegendRef.value.style.bottom = 0
            // 给 SearchLegendRef 盒子添加过渡效果
            SearchLegendRef.value.style.transition = `all 0.5s`
            // 将 SearchLegendRef 盒子的高度设置为最大值
            SearchLegendRef.value.style.top = SearchLegendMinTop + 'px'
            // 将控制变量 SearchLegendContant 设置为 search
            SearchLegendContant.value = 'search'
            // 让输入框自动获得焦点
            nextTick(() => {
                inputRef.value.focus()
            })
        }
        // 输入框的值
        let inputValue = ref('')
        // 搜索事件的防抖变量
        let searchTimer = null
        // 搜索建议列表
        let querySearchList = ref([])
        // 是否有匹配项
        let is_none_sugges = ref(true) // 默认是有匹配项
        // 搜索的逻辑
        function handleInputSearch() {
            is_none_sugges.value = true
            clearTimeout(searchTimer)
            searchTimer = setTimeout(() => {
                // 写搜索的逻辑
                const results = store.getters.AllSeatList.filter(item => {
                    return (item.name && item.name.replace(/\s/g,"").toUpperCase().includes(queryString.toUpperCase())) || (item.seat_id && item.seat_id.includes(queryString.toUpperCase())) || (item.code && item.code.toUpperCase().includes(queryString.toUpperCase())) || (item.subtitle && item.subtitle.replace(/\s/g,"").toUpperCase().includes(queryString.toUpperCase()))
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
                    querySearchList.value = array_seat
                }else{
                    is_none_sugges.value = false
                }
            },300)
        }
        return {
            AllArea,
            handleTouchFloor,
            legendList,
            handleClickLegend,
            SearchLegendRef,
            FloorSwitchRef,
            legendRef,
            searchBoxRef,
            SearchLegendContant,
            inputValue,
            inputRef,
            handleInputSearch,
            querySearchList
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
    .search-input{
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
        input{
            width: 100%;
            height: .4301rem;
            background-color: unset;
            border: none;
            caret-color: skyblue;
            &::-webkit-input-placeholder{
                color: #b1b2b4;
            }
        }
    }
    .search-box{
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