// 设置座位的transform

function setTransform(element,scaleNum){
    let styleString = ``
    // 判断是否为前台
    if(element.parentNode.id === '3A-Q-099' || element.parentNode.id === '4A-Q-099'){
        return `scale(${scaleNum}) rotateZ(45deg)`
    }else if(element.parentNode.id === '3A-Q-098'){
        return `scale(${scaleNum}) rotateZ(90deg)`
    }
    // 拿到座位的类名，判断朝向 three-new-seat-west 西 three-new-seat-east 东 three-new-seat-south 南 three-new-seat-north 北
    switch(element.parentNode.className.slice(element.parentNode.className.lastIndexOf('-') + 1)){
        case 'west':
            styleString = `translateY(-50%) scale(${scaleNum}) rotateZ(0deg)`
        break
        case 'east':
            styleString = `translateY(-50%) scale(${scaleNum}) rotateZ(180deg)`
        break
        case 'south':
            styleString = `translateX(-50%) scale(${scaleNum}) rotateZ(270deg)`
        break
        case 'north':
            styleString = `translateX(-50%) scale(${scaleNum}) rotateZ(90deg)`
        break
    }
    return styleString
}
export default setTransform