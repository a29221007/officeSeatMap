// 搜索座位的公共逻辑

/**
 * 参数一 $event ：点击或搜索选中的目标盒子
 * 参数二 ClentHeight：屏幕可视区的高度（应该是经过计算过后去除掉底栏部分的）
 * 参数三 BottomBoxRef：将 BottomBoxRef 这个 ref 对象传递过来
 * 参数四 seatItem：当前选中项的详细信息
 * 参数五 
*/
import store from '@/store'
import { nextTick } from 'vue'
function searchSeat($event, ClentHeight, BottomBoxRef, seatItem, clearTimer, obj, timer123, ){
    // 获取地图以及地图容器的DOM元素
    let MapBoxRef = document.querySelector('.map-box')
    let BodyContainerRef = document.querySelector('.body-container')
    // 1、首先计算出触摸时当前盒子距离 BodyContainerRef 盒子的距离
    let MapContainerRef_x = $event.offsetLeft + MapBoxRef.offsetLeft
    let MapContainerRef_y = $event.offsetTop + MapBoxRef.offsetTop
    // 2、得到MapContainerRef盒子的宽、高 / 2 (得到一半的值)
    BodyContainerRef.offsetWidth / 2
    BodyContainerRef.offsetHeight / 2
    // 3、得到了视图应该移动的距离
    let valueX = MapContainerRef_x - (BodyContainerRef.offsetWidth / 2)
    let valueY = MapContainerRef_y - (ClentHeight / 2)
    // 4、设置MapBoxRef盒子的位置
    MapBoxRef.style.left = (MapBoxRef.offsetLeft - valueX) + 'px'
    MapBoxRef.style.top = (MapBoxRef.offsetTop - valueY) + 'px'
    // 5、设置缩放的中心点，放大地图
    MapBoxRef.style.transformOrigin = `${$event.offsetLeft}px ${$event.offsetTop}px`
    setTimeout(() => {
        MapBoxRef.style.transition = `all 0.5s`
        MapBoxRef.style.transform = `scale(4,4)`
    },30)
    // // 6、调用子组件的方法，设置子组件的状态变量
    // BottomBoxRef.setSearchLegendContant('information')
    // // 7、设置选中项的数据
    // store.commit('setActiveInfo',seatItem)
    // // 8、修改之前的bug，（之前在 bottomBox-Information 信息展示组件中的 onMounted 钩子中，判断数据是否超过父盒子，如果超过，则做往复动画），现在将逻辑放到点击事件中，修复一些bug
    // nextTick(() => {
    //     // 关于元素滚动的逻辑
    //     clearTimer()
    //     obj = []
    //     timer123 = null
    //     let content = document.querySelectorAll('.scroll')
    //     content.forEach((item) => {
    //         // 当前节点的宽度
    //         let currentNodeWidth = item.offsetWidth
    //         // 当前节点父元素的宽度
    //         let curentParentNdoeWidth = item.parentNode.offsetWidth
    //         // 子元素和父元素的差值
    //         let value = curentParentNdoeWidth - currentNodeWidth
    //         if(value < 0){
    //             timer123 = setTimeout(() => {
    //                 clearInterval(item.timer)
    //                 let target = Math.floor(value)
    //                 let leader = 0
    //                 item.timer = setInterval(() => {
    //                     let step = 1
    //                     if(Math.abs(leader - target) >= Math.abs(step)){
    //                         step = leader > target ? -step : step
    //                         leader = leader + step
    //                         item.style.left = leader + 'px'
    //                     }else{
    //                         item.style.left = target + 'px'
    //                         target = leader === 0 ? value : 0
    //                     }
    //                 },200)
    //                 obj.push(item)
    //             },1000)
    //         }else{
    //             item.style.left = 0
    //         }
    //     })
    //     el = null
    //     // 元素做展开、收回
    //     el = document.querySelector('.over')
    //     if(!el) return
    //     if(el.scrollWidth > el.offsetWidth){
    //         // 如果内容的宽度比盒子的宽度大，则向最后添加一个展开按钮
    //         let span = document.createElement('span')
    //         span.innerHTML = '展开'
    //         span.style.float = 'right'
    //         span.style.marginTop = '2px'
    //         span.style.backgroundColor = '#f8f9fa'
    //         span.style.color = '#1b1b1d'
    //         span.style.borderRadius = '2px'
    //         span.style.padding = '0.0538rem'
    //         el.appendChild(span)
    //         span.addEventListener('click',show)
    //     }else{
    //         el.style.overflow = 'hidden'
    //     }
    // })
}

export default searchSeat