/**
 * 获取事件发生时鼠标在盒子内的坐标（x，y）
 * 参数e为，传递过来的事件对象
 * DOM1和DOM2为,盒子的DOM对象
*/

function getMouseX_Y(e,DOM1,DOM2){
    let obj = {x:0,y:0}
    // 1、鼠标到浏览器可视区的距离
    let pageX = e.pageX
    let pageY = e.pageY
    // 2、MapBoxRef的offsetLeft和Top的距离和MapContainerRef的offsetLeft和Top距离
    let MapBoxOffsetLeft = DOM1.offsetLeft
    let MapBoxOffsetTop = DOM1.offsetTop
    let MapContainerOffsetLeft = DOM2.offsetLeft
    let MapContainerOffsetTop = DOM2.offsetTop
    // 3、计算出鼠标在盒子距离
    obj.x = pageX - MapBoxOffsetLeft - MapContainerOffsetLeft
    obj.y = pageY - MapBoxOffsetTop - MapContainerOffsetTop
    return obj
}

export default getMouseX_Y