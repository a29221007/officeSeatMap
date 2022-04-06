// PC端搜索区域的方法

import store from '@/store'

// 参数 code 为当前区域的编码
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
    let MapContainerBox = document.querySelector('.map-container')
    MapContainerBox.offsetWidth / 2
    MapContainerBox.offsetHeight / 2
    // 10、得到了视图应该移动的距离
    let valueX = mapContainer_X - (MapContainerBox.offsetWidth / 2)
    let valueY = mapContainer_Y - (MapContainerBox.offsetHeight / 2)
    // // 11、向兄弟组件发布事件，设置盒子的高亮状态
    // emitter.emit('activeArea',{
    //     code,
    //     scaleX,
    //     scaleY
    // })
    // 12、设置MapBoxRef盒子的位置
    mapBox.style.left = (mapBox.offsetLeft - valueX) + 'px'
    mapBox.style.top = (mapBox.offsetTop - valueY) + 'px'
    // 13、设置缩放的中心点，放大地图
    mapBox.style.transformOrigin = `${minLeft + (currentAreaWidth / 2)}px ${minTop + (currentAreaHeight / 2)}px`
    mapBox.style.transform = `scale(${scaleX},${scaleY})`
    return {
        code,
        scaleX,
        scaleY
    }
}

export default searchArea