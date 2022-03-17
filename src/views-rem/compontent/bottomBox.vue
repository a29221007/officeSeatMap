<template>
    <!-- 上面滑动区域 -->
    <div ref="SearchLegendRef" class="search-legend">
        <!-- 1、页面加载，显示搜索框和图例 -->
        <!-- <div class="init" v-if="SearchLegendContant === 'init'">
            搜索框
            <div class="search-box" v-on:click="handleClickSearchBox"><i class="iconfont oamap-sousuo"></i><span>查找座位、人员、区域信息</span></div>
            图例
            <div ref="legendRef" class="legend">
                <div class="legend-item" :class="{'legendItemActive':item.type === $store.state.currentLegend}" v-for="item in legendList" :key="item.id" v-on:click="handleClickLegend(item.type)">
                    <div class="legend-image">
                        <img :src="item.url">
                    </div>
                    <span>{{item.name}}</span>
                </div>
            </div>
        </div> -->
        <!-- 2、点击了搜索后，显示搜索框和搜索建议列表 -->
        <!-- <div class="search" v-if="SearchLegendContant === 'search'">
            <div class="search-input">
                <i v-on:click="handleClickBack" class="iconfont oamap-zuojiantou"></i>
                <input ref="inputRef" v-model="inputValue" type="text" placeholder=" 搜索" v-on:input="handleInputSearch">
                <i v-if="inputValue" v-on:click="handleClickClear" class="iconfont oamap-qingchu"></i>
            </div>
            <div class="querySearch" ref="querySearchRef" v-on:touchmove="querySearchMove">
                <template v-if="is_none_sugges">
                    <div class="querySearch-item" v-for="item in querySearchList" :key="item.id" v-on:click="handleClickQuerySearchItem(item)">
                        <div class="autoCompleteTemplate" v-if="item.type === '0' || item.type === '0-1' || item.type === '0-2'">
                            第一行左边显示姓名，右边显示座位号
                            <div class="oneLine">
                                <span><span class="title">座位人员名称：</span><span class="content">{{item.name || '暂无数据'}}</span></span>
                                <span><span class="title">座位号：</span><span class="content">{{item.seat_id}}</span></span>
                            </div>
                            第二行显示该座位所在部门
                            <div class="twoLine"><span class="title">部门：</span><span class="content">{{item.depart || '暂无数据'}}</span></div>
                        </div>
                        <div class="autoCompleteTemplate" v-if="item.type === 1 || item.type === 2 || item.type === 3">
                            第一行左边显示姓名，右边显示座位号
                            <div class="oneLine">
                                <span><span class="title">区域名称：</span><span class="content">{{item.name + item.subtitle.replace("︵","（").replace('︶','）').replace(/\s/g,"") || '暂无数据'}}</span></span>
                            </div>
                            第二行显示该座位所在部门
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
        </div> -->
        <!-- 3、点击了搜索结果的某一项后，显示对应区域或座位的详细信息 -->
        <!-- <div class="Seat-Area-Information" v-if="SearchLegendContant === 'information'">
            区域或座位的详细信息
        </div> -->
    </div>
    <!-- 下面切换楼层区域 -->
    <div ref="FloorSwitchRef" class="floor-switch" v-if="SearchLegendContant === 'init'">
        <div :class="{'active':item.lable === $store.state.currentFloor}" v-for="item in AllArea" :key='item.id' v-on:click="handleClickFloor(item.lable)">{{item.name}}</div>
    </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { Dialog, Toast } from 'vant'
// 导入子组件
import Init from './bottomBox-init'
import Search from './bottomBox-search'
import Information from './bottomBox-Information'
// 导入
export default {
    name:'bottomBox',
    emits:['setCurrentAreaCode'],
    setup(prop,{emit}) {
        // 创建 store 实例
        const store = useStore()

        // 楼层或地区的数据
        const AllArea = [
            {id:0,name:'3楼',lable:'three'},
            {id:1,name:'4楼',lable:'four'}
        ]
        // 触摸切换楼层（或地区）触发的函数
        function handleClickFloor(floor) {
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

        // ----------------------
        
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
        // 最大的 top 值 （也是最低端的）
        let SearchLegendMaxTop = 0
        // 在 mounted 中给 SearchLegendRef 注册手势事件
        onMounted(() => {
            // 1、注册 touchstart 事件
            SearchLegendRef.value.addEventListener('touchstart', SearchLegendTouchstartFn)
            // 2、注册 touchmove 事件
            SearchLegendRef.value.addEventListener('touchmove', SearchLegendTouchmoveFn)
            // 3、注册 touchend 事件
            SearchLegendRef.value.addEventListener('touchend', SearchLegendTouchendFn)

            // ---- 变量的计算
            // 计算 top 值,并将盒子的高度取消，设置为top值
            SearchLegendTop = SearchLegendRef.value.offsetTop
            SearchLegendRef.value.style.height = 'unset'
            SearchLegendRef.value.style.top = SearchLegendTop + 'px'

            // 计算最大的top值
            // 计算初始 SearchLegendRef 盒子的bottom值
            SearchLegendBottom = clientHeight - SearchLegendRef.value.offsetTop - SearchLegendRef.value.offsetHeight
            // 计算重叠部分
            let repeatHeight = FloorSwitchRef.value.offsetHeight - SearchLegendBottom
            // 计算最大的top值
            SearchLegendMaxTop = SearchLegendTop + (SearchLegendRef.value.offsetHeight - repeatHeight - legendRef.value.offsetTop)

            // 计算最小的top值
            SearchLegendMinTop = clientHeight * 0.05
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
            SearchLegendRef.value.style.transition = `none`
            if(e.changedTouches.length === 1){
                // 滑动的变量
                const value = e.changedTouches[0].pageY - touchstartPageY
                // 判断滑动的方向
                if(value >= 0 && c){
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
                    // 向下滑动
                    handleClickBack()
                }else{
                    // 向上滑动
                    SearchLegendRef.value.style.top = SearchLegendMinTop + 'px'
                }
            }
        }

        // 控制 SearchLegend 盒子中内容的切换（初始内容（init）/搜索页面（search）/区域座位信息详情页（seat_or_area））
        let SearchLegendContant = ref('init')
        const inputRef = ref(null)
        // 点击搜索的盒子的处理函数
        function handleClickSearchBox() {
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
                if(!inputValue.value){
                    return querySearchList.value = []
                }
                // 写搜索的逻辑
                const results = store.getters.AllSeatList.filter(item => {
                    return (item.name && item.name.replace(/\s/g,"").toUpperCase().includes(inputValue.value.toUpperCase())) || (item.seat_id && item.seat_id.includes(inputValue.value.toUpperCase())) || (item.code && item.code.toUpperCase().includes(inputValue.value.toUpperCase())) || (item.subtitle && item.subtitle.replace(/\s/g,"").toUpperCase().includes(inputValue.value.toUpperCase()))
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
        // 点击清除按钮
        function handleClickClear() {
            inputValue.value = ''
            querySearchList.value = []
            is_none_sugges.value = true
        }
        // 点击返回按钮
        function handleClickBack() {
            // 向下滑动
            SearchLegendContant.value = 'init'
            SearchLegendRef.value.style.top = SearchLegendTop + 'px'
            SearchLegendRef.value.style.bottom = SearchLegendBottom + 'px'
            is_none_sugges.value = true
            inputValue.value = ''
            querySearchList.value = []
        }
        // 绑定 touchmove 事件,将事件冒泡阻止掉，防止下滑时，触发返回事件
        function querySearchMove(e){
            if(!inputValue.value || !is_none_sugges.value) return
            e.stopPropagation()
        }
        // 点击搜索建议列表的某一项
        function handleClickQuerySearchItem(item){
            if(!is_none_sugges.value) return
            // 判断搜索的类型，是座位还是区域
            if(item.type === '0' || item.type === '0-1' || item.type === '0-2'){
                // 如果搜索的是座位，则执行下面的逻辑
                const { depart, name, seat_id } = item
                // 选中某一项，首先判断该员工的座位，是否在当前楼层
                if(item.floor == store.getters.floor){
                    // 将控制变量 SearchLegendContant 设置为 information
                    SearchLegendContant.value = 'information'
                    // 将 SearchLegendRef 盒子的bottom值设置为0，置底
                    let el = document.getElementById(seat_id)
                    el.click()
                    SearchLegendRef.value.style.bottom = 0
                    SearchLegendRef.value.style.top = SearchLegendTop + 'px'
                }else{
                    // 如果不相同，则提示用户是否需要自动跳转到对应楼层（或地区）
                    Dialog.confirm({
                        title: '提示',
                        message:`查找的员工座位不在当前区域,是否要自动跳转到对应区域（${item.floor}楼）`,
                    }).then(() => {
                        // 用户如果确认跳转
                        let pushFloor = store.getters.floor === 3 ? 'four' : 'three'
                        handleClickFloor(pushFloor)
                        nextTick(() => {
                            // 将控制变量 SearchLegendContant 设置为 information
                            SearchLegendContant.value = 'information'
                            // 将 SearchLegendRef 盒子的bottom值设置为0，置底
                            let el = document.getElementById(seat_id)
                            el.click()
                            SearchLegendRef.value.style.bottom = 0
                            SearchLegendRef.value.style.top = SearchLegendTop + 'px'
                            Toast.success('切换成功')
                        })
                    }).catch(() => {
                        // 用户如果取消跳转
                        Toast.fail(`您可以手动切换到${item.floor}楼后再查找`)
                    })
                }
                inputValue.value = name
            }else{
                // 如果是区域，执行先的逻辑
                if(item.floor == store.getters.floor){
                    // 将控制变量 SearchLegendContant 设置为 information
                    SearchLegendContant.value = 'information'
                    // 如果搜索的区域在当前楼层
                    // 1、获取区域 code 对应的元素DOM，将其高亮
                    searchArea(item.code)
                }else{
                    // 如果不相同，则提示用户是否需要自动跳转到对应楼层（或地区）
                    Dialog.confirm({
                        title: '提示',
                        message:`查找的区域信息不在当前区域,是否要自动跳转到对应区域（${item.floor}楼）`,
                    }).then(() => {
                        // 用户如果确认跳转
                        let pushFloor = store.getters.floor === 3 ? 'four' : 'three'
                        handleClickFloor(pushFloor)
                        nextTick(() => {
                            searchArea(item.code)
                            Toast.success('切换成功')
                        })
                    }).catch(() => {
                        // 用户如果取消跳转
                        Toast.fail(`您可以手动切换到${item.floor}楼后再查找`)
                    })
                }
                inputValue.value = item.name + item.subtitle.replace("︵","（").replace('︶','）').replace(/\s/g,"")
            }
        }
        // 区域搜索公共的方法
        function searchArea(code){
            // 0、搜索区域时，将座位的提示框关闭

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
            let scaleX = ((mapBox.offsetWidth) / currentAreaWidth > 3 ? 3 : (mapBox.offsetWidth * store.state.scale[0]) / currentAreaWidth) - 0.1
            let scaleY = ((mapBox.offsetHeight) / currentAreaHeight > 3 ? 3 : (mapBox.offsetHeight * store.state.scale[1]) / currentAreaHeight) - 0.1
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
            let valueY = mapContainer_Y - (MapContainerBox.offsetHeight / 2)
            // 12、设置MapBoxRef盒子的位置
            mapBox.style.left = (mapBox.offsetLeft - valueX) + 'px'
            mapBox.style.top = (mapBox.offsetTop - valueY) + 'px'
            // 13、设置缩放的中心点，放大地图
            mapBox.style.transformOrigin = `${minLeft + (currentAreaWidth / 2)}px ${minTop + (currentAreaHeight / 2)}px`
            mapBox.style.transform = `scale(${scaleX},${scaleY})`
            
            
            // 11、向父组件发布事件，设置盒子的高亮状态
            emit('setCurrentAreaCode',{
                code,
                scaleX,
                scaleY
            })
        }
        return {
            AllArea,
            handleClickFloor,
            legendList,
            handleClickLegend,
            SearchLegendRef,
            FloorSwitchRef,
            legendRef,
            SearchLegendContant,
            inputValue,
            inputRef,
            handleInputSearch,
            querySearchList,
            is_none_sugges,
            handleClickClear,
            handleClickBack,
            querySearchMove,
            handleClickQuerySearchItem,
            handleClickSearchBox
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
    // 1、页面初始化时的样式
    .init{
        width: 100%;
        height: 100%;
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
    // 2、搜索框以及搜索建议列表的样式
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
    // 3、座位或区域的详细信息盒子样式
    .Seat-Area-Information{
        width: 100%;
        height: 100%;
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