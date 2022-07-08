<template>
    <component :is="is_PC"></component>
</template>

<script>
import { provide, ref } from 'vue'
// 导入PC端布局组件PCLayOut
import PCLayOut from '../views/layout'
// 导入移动端的布局组件MLayout
import MLayOut from '../views-rem'
// 导入获取浏览器可视区的宽高
import getClient from '../utils/getClient.js'
import { useStore } from 'vuex'
export default {
    name:'App',
    components:{
        PCLayOut,
        MLayOut
    },
    setup() {
        // 在App组件中初始化store中的状态
        const store = useStore()
        store.dispatch('getSeatListOfthree').then(() => {
            return store.dispatch('getSeatListOfFour')
        }).then(() => {
            return store.dispatch('getAreaListOfThree')
        }).then(() => {
            return store.dispatch('getAreaListOfFour')
        }).then(() => {
            // 3楼片区
            let partList = []
            // 3楼部门区域
            let departmentList = []
            // 对片区的数据结构改造
            store.state.areaListOfThree.filter(item => item.diff === 2).forEach(item => {
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
            store.state.areaListOfThree.filter(item => item.diff === 1 && item.type === 2).forEach(item => {
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
                    if(!flag1_X && !flag1_Y){
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
                        }else{
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
                        }
                    }
                })
            })
            console.log(newArray)
        })
        store.dispatch('getSeatListOfShenZhen')
        store.dispatch('getAreaListOfShenZhen')
        // 获取当前浏览器可视区的大小
        const obj = getClient()
        // 依赖注入
        provide('clent',obj)
        // 判断是pc端还是移动端的变量
        const is_PC = ref('MLayOut')
        let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
        if(flag){
            is_PC.value = 'MLayOut'
        }else{
            is_PC.value = 'PCLayOut'
        }
        
        return {
            is_PC
        }
    }
}
</script>
