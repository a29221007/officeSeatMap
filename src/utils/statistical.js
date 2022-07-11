/**
 * 统计片区、部门、座位的占用情况
 * 参数一：areaList，区域数据（里面包括片区和部门区域）
 * 参数二：seatList，座位数据
 * 参数三：floor, 楼层
*/

function statistical(areaList, seatList, floor){
    // 片区数据
    let partList = []
    // 部门区域
    let departmentList = []
    // 对片区的数据结构改造
    areaList.filter(item => item.diff === 2).forEach(item => {
        if(Object.prototype.toString.call(item.coordinate) === '[object Array]'){
            const {code,diff,floor,location,name,office,total} = item
            item.coordinate.forEach(item2 => {
                partList.push({
                    code,diff,floor,location,name,office,total,coordinate:item2
                })
            })
        }else if(Object.prototype.toString.call(item.coordinate) === '[object Object]'){
            partList.push(item)
        }
    })
    // 对部门的数据结构改造
    areaList.filter(item => item.diff === 1 && item.type === 2).forEach(item => {
        if(Object.prototype.toString.call(item.coordinate) === '[object Array]'){
            const {code,diff,floor,location,name,office} = item
            item.coordinate.forEach(item2 => {
                departmentList.push({
                    code,diff,floor,location,name,office,coordinate:item2
                })
            })
        }else if(Object.prototype.toString.call(item.coordinate) === '[object Object]'){
            departmentList.push(item)
        }
    })
    // 每一个片区包含的部门，以及盖部门在片区内的有效面积
    let newArray = []
    // 外层循环片
    partList.forEach(part_item => {
        // 内层循环部门
        departmentList.forEach(depart_item => {
            // 判断当前的片和当前的部门关系
            // 1、4个X坐标,前两个是片区的横坐标，后两个是部门的横坐标
            const X1 = part_item.coordinate.left
            const X2 = part_item.coordinate.left + part_item.coordinate.width
            const X3 = depart_item.coordinate.left
            const X4 = depart_item.coordinate.left + depart_item.coordinate.width
            const MAX_X = Math.max(X1,X2,X3,X4)
            const MIN_X = Math.min(X1,X2,X3,X4)
            // 2、4个Y坐标，前两个是片区得纵坐标，后两个是部门得纵坐标
            const Y1 = part_item.coordinate.top
            const Y2 = part_item.coordinate.top + part_item.coordinate.height
            const Y3 = depart_item.coordinate.top
            const Y4 = depart_item.coordinate.top + depart_item.coordinate.height
            const MAX_Y = Math.max(Y1,Y2,Y3,Y4)
            const MIN_Y = Math.min(Y1,Y2,Y3,Y4)
            // 第一大种情况、两个区域距离大于等于0，这种情况不统计
            const flag1_X = (MAX_X - MIN_X) >= (part_item.coordinate.width + depart_item.coordinate.width)
            const flag1_Y = (MAX_Y - MIN_Y) >= (part_item.coordinate.height + depart_item.coordinate.height)
            if(flag1_X && flag1_Y){ return }
            // 第二大种情况，两个区域没有得边没有重合得部分，只能在某一角
                // 判断规则，4个横坐标最大值和最小值的差，比两个宽度之和小，比宽度大的一边大
                // 4个纵坐标也是一样的
            const flag2_X = (Math.max(part_item.coordinate.width, depart_item.coordinate.width) < (MAX_X - MIN_X)) && ((MAX_X - MIN_X) < (part_item.coordinate.width + depart_item.coordinate.width))
            const flag2_Y = (Math.max(part_item.coordinate.height, depart_item.coordinate.height) < (MAX_Y - MIN_Y)) && ((MAX_Y - MIN_Y) < (part_item.coordinate.height + depart_item.coordinate.height))
            const flag3_X = (Math.abs(X3 - X1) + Math.abs(X2 - X4) + Math.min(part_item.coordinate.width, depart_item.coordinate.width)) === Math.max(part_item.coordinate.width, depart_item.coordinate.width)
            const flag3_Y = (Math.abs(Y3 - Y1) + Math.abs(Y2 - Y4) + Math.min(part_item.coordinate.height, depart_item.coordinate.height)) === Math.max(part_item.coordinate.height, depart_item.coordinate.height)
            if(flag2_X && flag2_Y){
                // 在第二大种情况下，又要分别判断片区和部门的位置关系
                if((X3 > X1) && (Y3 < Y1)){
                    // 2.1情况，部门在片区的右上角
                    newArray.push({
                        part_code:part_item.code,
                        part_name:part_item.name,
                        depart_code:depart_item.code,
                        coordinate:{top:Y1,left:X3,width:X2 - X3,height:Y4 - Y1}
                    })
                }else if((X3 > X1) && (Y3 > Y1)){
                    // 2.2情况,部门在片区的右下角
                    newArray.push({
                        part_code:part_item.code,
                        part_name:part_item.name,
                        depart_code:depart_item.code,
                        coordinate:{top:Y3,left:X3,width:X2 - X3,height:Y2 - Y3}
                    })
                }else if((X1 > X3) && (Y1 > Y3)){
                    // 2.3情况，部门在片区的左上角
                    newArray.push({
                        part_code:part_item.code,
                        part_name:part_item.name,
                        depart_code:depart_item.code,
                        coordinate:{top:Y1,left:X1,width:X4 - X1,height:Y4 - Y1}
                    })
                }else if((X1 > X3) && (Y1 < Y3)){
                    // 2.4情况，部门在片区的左下角
                    newArray.push({
                        part_code:part_item.code,
                        part_name:part_item.name,
                        depart_code:depart_item.code,
                        coordinate:{top:Y3,left:X1,width:X4 - X1,height:Y2 - Y3}
                    })
                }
                return
            }
            // 下面要比较片区和部门的宽高大小
            // 第三大种情况，片区的宽高都大于等于部门的宽高
            if((part_item.coordinate.width >= depart_item.coordinate.width) && (part_item.coordinate.height >= depart_item.coordinate.height)){
                // 这种情况下继续判断片区和部门的位置关系
                if(flag3_Y && flag2_X){
                    // 部门y周方向处于片区内部，X轴是相交
                    // 继续判断部门在片区的左边还是右边
                    if(X3 > X1){
                        // 3.1部门在片区的右边
                        newArray.push({
                            part_code:part_item.code,
                            part_name:part_item.name,
                            depart_code:depart_item.code,
                            coordinate:{top:Y3,left:X3,width:X2 - X3,height:depart_item.coordinate.height}
                        })
                    }else if(X1 > X3){
                        // 3.2部门在片区的左边
                        newArray.push({
                            part_code:part_item.code,
                            part_name:part_item.name,
                            depart_code:depart_item.code,
                            coordinate:{top:Y3,left:X1,width:X4 - X1,height:depart_item.coordinate.height}
                        })
                    }
                }else if(flag3_X && flag2_Y){
                    // 这种情况X轴重合，y轴相交
                    // 继续判断部门在片区的上边还是下边
                    if(Y1 > Y3){
                        // 3.3部门在片区的上边
                        newArray.push({
                            part_code:part_item.code,
                            part_name:part_item.name,
                            depart_code:depart_item.code,
                            coordinate:{top:Y1,left:X3,width:depart_item.coordinate.width,height:Y4 - Y1}
                        })
                    }else if(Y1 < Y3){
                        // 3.4部门在片区的下边
                        newArray.push({
                            part_code:part_item.code,
                            part_name:part_item.name,
                            depart_code:depart_item.code,
                            coordinate:{top:Y3,left:X3,width:depart_item.coordinate.width,height:Y2 - Y3}
                        })
                    }
                }else if(flag3_X && flag3_Y){
                    // 3.5这种情况部门完全在片区，有效范围就是部门区域大小
                    newArray.push({
                        part_code:part_item.code,
                        part_name:part_item.name,
                        depart_code:depart_item.code,
                        coordinate:{top:Y3,left:X3,width:depart_item.coordinate.width,height:depart_item.coordinate.height}
                    })
                }
            }else if((part_item.coordinate.width >= depart_item.coordinate.width) && (part_item.coordinate.height < depart_item.coordinate.height)){
                // 第四大种情况片区的宽大于等于部门的宽，片区的高小于部门的高
                // 这种情况下继续判断片区和部门的位置关系
                if(flag3_Y && flag2_X){
                    // 部门y周方向处于片区内部，X轴是相交
                    // 继续判断部门在片区的左边还是右边
                    if(X3 > X1){
                        // 4.1部门在片区的右边
                        newArray.push({
                            part_code:part_item.code,
                            part_name:part_item.name,
                            depart_code:depart_item.code,
                            coordinate:{top:Y1,left:X3,width:X2 - X3,height:part_item.coordinate.height}
                        })
                    }else if(X1 > X3){
                        // 4.2部门在片区的左边
                        newArray.push({
                            part_code:part_item.code,
                            part_name:part_item.name,
                            depart_code:depart_item.code,
                            coordinate:{top:Y1,left:X1,width:X4 - X1,height:part_item.coordinate.height}
                        })
                    }
                }else if(flag3_X && flag2_Y){
                    // 这种情况X轴重合，y轴相交
                    // 继续判断部门在片区的上边还是下边
                    if(Y1 > Y3){
                        // 4.3部门在片区的上边
                        newArray.push({
                            part_code:part_item.code,
                            part_name:part_item.name,
                            depart_code:depart_item.code,
                            coordinate:{top:Y1,left:X3,width:depart_item.coordinate.width,height:Y4 - Y1}
                        })
                    }else if(Y1 < Y3){
                        // 4.4部门在片区的下边
                        newArray.push({
                            part_code:part_item.code,
                            part_name:part_item.name,
                            depart_code:depart_item.code,
                            coordinate:{top:Y3,left:X3,width:depart_item.coordinate.width,height:Y2 - Y3}
                        })
                    }
                }else if(flag3_X && flag3_Y){
                    // 4.5这种情况部门完全在片区，有效范围就是部门区域大小
                    newArray.push({
                        part_code:part_item.code,
                        part_name:part_item.name,
                        depart_code:depart_item.code,
                        coordinate:{top:Y1,left:X3,width:depart_item.coordinate.width,height:part_item.coordinate.height}
                    })
                }
            }else if((part_item.coordinate.width < depart_item.coordinate.width) && (part_item.coordinate.height >= depart_item.coordinate.height)){
                // 第五大种情况片区的宽小于部门的宽，片区的高大于等于部门的高
                // 这种情况下继续判断片区和部门的位置关系
                if(flag3_Y && flag2_X){
                    // 部门y周方向处于片区内部，X轴是相交
                    // 继续判断部门在片区的左边还是右边
                    if(X3 > X1){
                        // 4.1部门在片区的右边
                        newArray.push({
                            part_code:part_item.code,
                            part_name:part_item.name,
                            depart_code:depart_item.code,
                            coordinate:{top:Y3,left:X3,width:X2 - X3,height:depart_item.coordinate.height}
                        })
                    }else if(X1 > X3){
                        // 4.2部门在片区的左边
                        newArray.push({
                            part_code:part_item.code,
                            part_name:part_item.name,
                            depart_code:depart_item.code,
                            coordinate:{top:Y3,left:X1,width:X4 - X1,height:depart_item.coordinate.height}
                        })
                    }
                }else if(flag3_X && flag2_Y){
                    // 这种情况X轴重合，y轴相交
                    // 继续判断部门在片区的上边还是下边
                    if(Y1 > Y3){
                        // 4.3部门在片区的上边
                        newArray.push({
                            part_code:part_item.code,
                            part_name:part_item.name,
                            depart_code:depart_item.code,
                            coordinate:{top:Y1,left:X1,width:part_item.coordinate.width,height:Y4 - Y1}
                        })
                    }else if(Y1 < Y3){
                        // 4.4部门在片区的下边
                        newArray.push({
                            part_code:part_item.code,
                            part_name:part_item.name,
                            depart_code:depart_item.code,
                            coordinate:{top:Y3,left:X1,width:part_item.coordinate.width,height:Y2 - Y3}
                        })
                    }
                }else if(flag3_X && flag3_Y){
                    // 4.5这种情况部门完全在片区，有效范围就是部门区域大小
                    newArray.push({
                        part_code:part_item.code,
                        part_name:part_item.name,
                        depart_code:depart_item.code,
                        coordinate:{top:Y3,left:X1,width:part_item.coordinate.width,height:depart_item.coordinate.height}
                    })
                }
            }else if((part_item.coordinate.width < depart_item.coordinate.width) && (part_item.coordinate.height < depart_item.coordinate.height)){
                // 第六大种情况片区的宽小于部门的宽，片区的高也小于部门的高
                // 这种情况下继续判断片区和部门的位置关系
                if(flag3_Y && flag2_X){
                    // 部门y轴方向处于片区内部，X轴是相交
                    // 继续判断部门在片区的左边还是右边
                    if(X3 > X1){
                        // 6.1部门在片区的右边
                        newArray.push({
                            part_code:part_item.code,
                            part_name:part_item.name,
                            depart_code:depart_item.code,
                            coordinate:{top:Y1,left:X3,width:X2 - X3,height:part_item.coordinate.height}
                        })
                    }else if(X1 > X3){
                        // 4.2部门在片区的左边
                        newArray.push({
                            part_code:part_item.code,
                            part_name:part_item.name,
                            depart_code:depart_item.code,
                            coordinate:{top:Y1,left:X1,width:X4 - X1,height:part_item.coordinate.height}
                        })
                    }
                }else if(flag3_X && flag2_Y){
                    // 这种情况X轴重合，y轴相交
                    // 继续判断部门在片区的上边还是下边
                    if(Y1 > Y3){
                        // 4.3部门在片区的上边
                        newArray.push({
                            part_code:part_item.code,
                            part_name:part_item.name,
                            depart_code:depart_item.code,
                            coordinate:{top:Y1,left:X1,width:part_item.coordinate.width,height:Y4 - Y1}
                        })
                    }else if(Y1 < Y3){
                        // 4.4部门在片区的下边
                        newArray.push({
                            part_code:part_item.code,
                            part_name:part_item.name,
                            depart_code:depart_item.code,
                            coordinate:{top:Y3,left:X1,width:part_item.coordinate.width,height:Y2 - Y3}
                        })
                    }
                }else if(flag3_X && flag3_Y){
                    // 4.5这种情况部门完全在片区，有效范围就是部门区域大小
                    newArray.push({
                        part_code:part_item.code,
                        part_name:part_item.name,
                        depart_code:depart_item.code,
                        coordinate:{top:Y1,left:X1,width:part_item.coordinate.width,height:part_item.coordinate.height}
                    })
                }
            }
        })
    })
    // 继续循环 newArray 数组
    newArray.forEach(partAndDepartItem => {
        const array = []
        seatList.forEach(seatItem => {
            // 计算当前部门在片区内的有效范围，拆成了一小块一小块
            // 有效范围的X起点
            let partAndDepart_min_X = partAndDepartItem.coordinate.left
            // 有效范围的X终点
            let partAndDepart_max_X = partAndDepartItem.coordinate.left + partAndDepartItem.coordinate.width
            // 有效范围的Y起点
            let partAndDepart_min_Y = partAndDepartItem.coordinate.top
            // 有效范围的Y终点
            let partAndDepart_max_Y = partAndDepartItem.coordinate.top + partAndDepartItem.coordinate.height

            // 计算当前座位的起点
            // 座位的x
            let seat_x = null
            // 座位的y
            let seat_y = null
            // 分情况判断地区楼层
            if(floor === 3 || floor === 4){
                // X起点换算
                partAndDepart_min_X = partAndDepart_min_X / 1777 * 930
                // X终点换算
                partAndDepart_max_X = partAndDepart_max_X / 1777 * 930
                // Y起点换算
                partAndDepart_min_Y = partAndDepart_min_Y / 1612 * 843
                // Y终点换算
                partAndDepart_max_Y = partAndDepart_max_Y / 1612 * 843

                // 座位X坐标换算
                seat_x = seatItem.gCol * 9.6 + 35
                // 座位Y坐标换算
                seat_y = seatItem.gRow * 9.64 + 23
            }else if(floor === 7){
                seat_x = seatItem.gRow
                seat_y = seatItem.gCol
            }
            // 判断条件：判断座位的起点在有效范围区间内
            const flag_x = (seat_x >= partAndDepart_min_X) && (seat_x < partAndDepart_max_X)
            const flag_y = (seat_y >= partAndDepart_min_Y) && (seat_y < partAndDepart_max_Y)
            if(flag_x && flag_y){
                array.push(seatItem)
            }
        })
        partAndDepartItem.includeSeat = array
    })
    // 
    console.log(newArray)
}

export default statistical