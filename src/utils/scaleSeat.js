// 执行座位放大的逻辑

/**
 * 将座位放大的逻辑提取出来，为了解决搜索的一个bug
 * 参数一：当前选中的座位 currentSeat
 * MapBoxRef：地图 mapBox DOM 元素
 * MapContainerRef：容器的 MapContainerRef DOM 元素
*/

function scaleSeatFn($event) {
    let MapBoxRef = document.querySelector('.map-box')
    let MapContainerRef = document.querySelector('.map-container')
    MapBoxRef.style.transition = 'all 1s'
    // 1、首先计算点击时鼠标距离MapContainerRef盒子的距离
    let MapContainerRef_x = $event.offsetLeft + MapBoxRef.offsetLeft
    let MapContainerRef_y = $event.offsetTop + MapBoxRef.offsetTop
    // 2、得到MapContainerRef盒子的宽、高 / 2 (得到一半的值)
    MapContainerRef.offsetWidth / 2
    MapContainerRef.offsetHeight / 2
    // 3、得到了视图应该移动的距离
    let valueX = MapContainerRef_x - (MapContainerRef.offsetWidth / 2)
    let valueY = MapContainerRef_y - (MapContainerRef.offsetHeight / 2)
    // 4、设置MapBoxRef盒子的位置
    MapBoxRef.style.left = (MapBoxRef.offsetLeft - valueX) + 'px'
    MapBoxRef.style.top = (MapBoxRef.offsetTop - valueY) + 'px'
    // 5、设置缩放的中心点，放大地图
    MapBoxRef.style.transformOrigin = `${$event.offsetLeft}px ${$event.offsetTop}px`
    MapBoxRef.style.transform = `scale(3)`
}

export default scaleSeatFn