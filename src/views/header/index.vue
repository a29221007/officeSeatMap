<template>
    <!-- 头部区域包括顶部的搜索栏以及图例区域 -->
    <div class="header-container">
        <!-- 搜索栏 -->
        <div class="search">
            <div class="floor-switch">
                <span :class="{'active':item.lable === $store.state.currentFloor}" v-for="item in AllArea" :key="item.id" v-on:click="handleClickFloor(item.lable)">{{item.name}}<i v-if="item.id !== AllArea.length - 1"> | </i></span>
            </div>
            <el-autocomplete v-model="searchState" value-key='name' :trigger-on-focus="false" :fetch-suggestions="querySearch" class="inline-input" clearable placeholder="请输入员工姓名或座位号" @select="handleSelect" v-on:keyup.enter="handleEnter" v-on:clear="handleClearInput" />
        </div>
        <!-- 图例 -->
        <div class="legend">
            <div class="legend-item" v-for="item in legendList" :key="item.id">
                <img :src="item.url"><span>{{item.name}}</span>
            </div>
        </div>
    </div>
</template>

<script>
import {ref,reactive,toRefs} from 'vue'
import {useStore} from 'vuex'
export default {
    name:'layout',
    setup(){
        const store = useStore()
        // 切换地图区域的数据（目前只有北京地区的3楼4楼，以后说不定还有其他地区）
        const AllArea = [
            {id:0,name:'3楼',lable:'three'},
            {id:1,name:'4楼',lable:'four'}
        ]
        // 切换楼层（或地区）的处理函数
        function handleClickFloor(floor){
            store.commit('setCurrentFloor',floor)
        }
        // 定义模糊搜索框的相关数据与方法
        const searchData = reactive({
            // 模糊搜索的关键字
            searchState:'',
            // 是否有匹配项
            is_none:true, // 默认是有匹配项
            results:[],
            // 搜索建议
            querySearch(queryString, callback) {
                searchData.is_none = true
                searchData.results = store.getters.AllSeatList.filter(item => {
                    return (item.name && item.name.includes(queryString.toLowerCase())) || (item.seat_id && item.seat_id.includes(queryString.toLowerCase()))
                })
                if(searchData.results.length !== 0){
                    callback(searchData.results)
                }else{
                    callback([{name:'无匹配项'}])
                    searchData.is_none = false
                }
                // 下一步优化搜索建议下拉框的内容布局展示
            },
            // 点击回车键触发
            handleEnter() {
                // 按下回车键查看是否搜索建议
                if(searchData.is_none){
                    // 如果有搜索的结果,则将第一位拿出来传给handleSelect函数
                    searchData.handleSelect(searchData.results[0])
                }
            },
            // 点击搜索建议下拉框某一项的处理程序
            handleSelect(item) {
                if(!searchData.is_none) return searchData.searchState = ''
                // 选中某一项，首先判断该员工的座位，是否在当前楼层
                console.log(item)
                if(item.floor == store.getters.floor){
                    // 如果相同
                    // 1、获取座位id号对应的元素DOM
                    let el = document.getElementById(item.seat_id)
                    el.click()
                }else{
                    // 如果不相同，则提示用户是否需要自动跳转到对应楼层（或地区）
                    
                }
            },
            // 点击搜索框中清除图标的处理程序
            handleClearInput() {
                // 点击清除按钮以后,input框需要重新获取一下焦点，要不然，搜索建议框就不显示了，这个可能是组件的一个bug吧
                let input = document.querySelector('.inline-input .el-input__inner')
                input.blur()
                input.focus()
            }
        })
        // 定义图例的数据和方法
        const legendData = reactive({
            legendList:[
                {id:0,name:'员工',lable:'employees',type:'0',url:'/legend-image/image0.png'},
                {id:1,name:'空闲',lable:'free',type:'0-1',url:'/legend-image/image1.png'},
                {id:2,name:'占用',lable:'occupation',type:'0-2',url:'/legend-image/image2.png'},
                {id:3,name:'维修',lable:'maintenance',type:'0-3',url:'/legend-image/image3.png'},
                {id:4,name:'休闲区',lable:'Recreational-area',type:'0-4',url:'/legend-image/image4.png'},
            ]
        })
        return {
            AllArea,
            ...toRefs(searchData),
            ...toRefs(legendData),
            handleClickFloor
        }
    }
}
</script>

<style lang="less" scoped>
.header-container{
    width: 1200px;
    height: 120px;
    margin: 0 auto;
    .search{
        width: 100%;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px;
        .floor-switch{
            span{
                cursor: pointer;
                &.active{
                    color: chocolate;
                    i{
                        color: #000;
                    }
                }
            }
        }
    }
    .legend{
        width: 100%;
        height: 70px;
        background-color: #f3f4f6;
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .legend-item{
            display: flex;
            align-items: center;
            img{
                height: 32px;
            }
        }
    }
}
</style>