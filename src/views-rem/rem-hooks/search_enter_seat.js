/**
 * 移动端的复用逻辑
 * 点击了搜索建议列表中的座位项时的复用逻辑
 * 参数一：底部DOM元素实例
 * 参数二：选中的座位id号
 * 参数三：SearchLegend 盒子最后的top值
*/

function searchEnterSeat(element, seat_id, SearchLegendTop){
    // 将 SearchLegendRef 盒子的bottom值设置为0，置底
    element.style.bottom = 0
    element.style.top = 'unset'
    element.style.height = 0
    element.style.padding = 0
    let el = document.getElementById(seat_id)
    el.click()
    setTimeout(() => {
        // 给 SearchLegendRef 盒子添加过渡效果
        // 将 SearchLegendRef 盒子的高度设置为最大值
        element.style.height = 'unset'
        element.style.top = SearchLegendTop + 'px'
        element.style.padding = .3226 + 'rem'
    },1000)
}

export default searchEnterSeat