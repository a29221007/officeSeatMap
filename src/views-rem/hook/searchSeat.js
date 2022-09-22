// 搜索座位的公共逻辑

/**
 * 参数一 seat_id ：选中座位的id
*/
import store from '@/store'
import roll from './roll.js'
// 导入地图盒子元素做动画的方法
import Animate from './bottomBoxTranstion'

// 导入座位盒子元素做缩放动画的方法
import seatZoom from './seatAnimate'
function searchSeat(seat_id){
    let $event = document.getElementById(seat_id)
    seatZoom($event && $event.lastElementChild)
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
        MapBoxRef.style.transform = `scale(2,2)`
    },30)
    roll()
}

export default searchSeat