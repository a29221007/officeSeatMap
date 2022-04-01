// 搜索座位的公共逻辑

/**
 * 参数一 $event ：点击或搜索选中的目标盒子
 * 参数二 ClentHeight：屏幕可视区的高度（应该是经过计算过后去除掉底栏部分的）
 * 参数三 seatItem：当前选中项的详细信息
*/
import store from '@/store'
import roll from './roll.js'
// 导入地图盒子元素做动画的方法
import Animate from './bottomBoxTranstion'

// 导入座位盒子元素做缩放动画的方法
import seatZoom from './seatAnimate'
function searchSeat($event, BottomBoxRef, seatItem){
    seatZoom($event)
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
    let valueY = MapContainerRef_y - (store.state.ClentHeight / 2)
    // 4、设置MapBoxRef盒子的位置
    Animate(MapBoxRef,{
        left:Math.ceil(MapBoxRef.offsetLeft - valueX),
        top:Math.ceil(MapBoxRef.offsetTop - valueY)
    })
    // 5、设置缩放的中心点，放大地图
    MapBoxRef.style.transformOrigin = `${$event.offsetLeft}px ${$event.offsetTop}px`
    MapBoxRef.style.transition = `transform 0.5s`
    setTimeout(() => {
        MapBoxRef.style.transform = `scale(4,4)`
    },30)
    // 6、调用子组件的方法，设置子组件的状态变量
    BottomBoxRef && BottomBoxRef.setSearchLegendContant('information')
    // 7、设置选中项的数据
    store.commit('setActiveInfo', seatItem)
    roll()
}

export default searchSeat