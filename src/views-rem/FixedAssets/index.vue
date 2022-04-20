<template>
    <div class="FixedAssets">
        <!-- 顶部搜索栏 -->
        <form action="/" class="FixedAssetsListSearch">
            <van-icon name="arrow-left" size=".4301rem" color="#000" v-on:click="$router.back()" />
            <van-search left-icon='' v-model="searchValue" placeholder="固资编号或名称" autocomplete='off' clear-trigger='always' @search="onSearch" v-on:clear="handleClickClearInput" />
        </form>
        <!-- 员工个人信息 -->
        <div class="personInfo">
            <!-- 第一行 -->
            <div>
                <!-- 左 -->
                <div>{{$store.state.PersontFixedAssetsList.UserName}}</div>
                <!-- 右 -->
                <div>
                    <div class="title">工号：</div>
                    <div class="content">{{$store.state.PersontFixedAssetsList.UserCode}}</div>
                </div>
            </div>
            <!-- 第二行 -->
            <div>
                <!-- 上 -->
                <div>
                    <div class="title">工位号：</div>
                    <div class="content">{{$store.state.PersontFixedAssetsList.seat_id}}</div>
                </div>
                <!-- 下 -->
                <div>
                    <div class="title">部门：</div>
                    <div class="content">{{$store.state.PersontFixedAssetsList.DeptName}}</div>
                </div>
            </div>
        </div>
        <!-- 固资列表 -->
        <van-list class="FixedAssetsList" v-model:loading="loading" :finished="finished" :finished-text="finishedText" @load="onLoad">
            <template v-if="list.length !== 0">
                <div class="list-item" v-for="item in list" :key="item.id">
                    <!-- 第一行 -->
                    <div>
                        <div class="title">固定资产编号：</div>
                        <div class="content">{{item.FixedCode}}</div>
                    </div>
                    <!-- 第二行 -->
                    <div>
                        <div class="title">固定资产名称：</div>
                        <div class="content">{{item.FixedName}}</div>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="list-item center">该员工无固资信息</div>
            </template>
        </van-list>
    </div>
</template>

<script>
import { ref, reactive, toRefs } from 'vue'
import { useStore } from 'vuex'
export default {
    name:'FixedAssets',
    setup() {
        const store = useStore()
        const searchValue = ref('')
        // 点击搜索触发的函数
        function onSearch(){
            let message = ''
            pagination.currentPage = 1
            PersontFixedAssetsData.finished = false
            PersontFixedAssetsData.loading = true
            PersontFixedAssetsData.list = []
            // 判断输入框的值是否为空
            if(searchValue.value){
                // 如果不为空
                totalList = store.state.PersontFixedAssetsList.FixedChildList.filter(item => {
                    return (item.FixedCode && (item.FixedCode + '').includes(searchValue.value)) || (item.FixedName && (item.FixedName + '').toUpperCase().includes(searchValue.value.toUpperCase()))
                })
                if(totalList.length === 0){
                    message = '无匹配项'
                }
            }else {
                // 如果为空
                totalList = store.state.PersontFixedAssetsList.FixedChildList
            }
            PersontFixedAssetsData.onLoad(message)
        }
        // 点击输入框的搜索按钮
        function handleClickClearInput(){
            pagination.currentPage = 1
            PersontFixedAssetsData.finished = false
            PersontFixedAssetsData.loading = true
            PersontFixedAssetsData.list = []
            totalList = store.state.PersontFixedAssetsList.FixedChildList
            PersontFixedAssetsData.onLoad()
        }
        let totalList = store.state.PersontFixedAssetsList.FixedChildList
        // 预定预约列表的相关数据
        let PersontFixedAssetsData = reactive({
            // 控制上滑加载的变量
            loading: false,
            // 控制列表加载完毕的变量
            finished: false,
            // 触发上滑加载的函数
            onLoad(message){
                message = message || '没有更多了'
                PersontFixedAssetsData.finishedText = message
                setTimeout(() => {
                    let array = []
                    array = totalList.slice((pagination.currentPage-1)*pagination.pageSize,pagination.currentPage*pagination.pageSize)
                    PersontFixedAssetsData.list.push(...array)
                    PersontFixedAssetsData.loading = false

                    if (array.length < 20) {
                        PersontFixedAssetsData.finished = true
                    }
                    pagination.currentPage += 1
                }, 1000)
            },
            // 列表数据
            list:[],
            // 提示语句
            finishedText:'没有更多了'
        })
        let pagination = {
            currentPage:1,
            pageSize:20
        }
        return {
            searchValue,
            onSearch,
            handleClickClearInput,
            ...toRefs(PersontFixedAssetsData)
        }
    }
}
</script>

<style lang="less" scoped>
.FixedAssets{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .FixedAssetsListSearch{
        display: flex;
        align-items: center;
        background-color: #fff;
        .van-icon{
            padding: .2151rem;
        }
        .van-search{
            padding: 5px 6px;
            /deep/.van-search__content{
                background-color: #fff;
                padding-left:0;
            }
        }
    }
    .personInfo{
        width: 100%;
        height: 2.1505rem;
        background-color: #f2f2f2;
        display: flex;
        flex-direction: column;
        padding: 0 10px;
        &>div{
            &:first-child{
                flex: 1.3;
                display: flex;
                align-items: center;
                justify-content: space-between;
                &>div{
                    &:first-child{
                        font-size: .4086rem;
                        font-weight: 700;
                    }
                    &:last-child{
                        display: flex;
                        align-items: baseline;
                    }
                }
            }
            &:last-child{ 
                flex: 2;
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                &>div{
                    display: flex;
                    width: 100%;
                    align-items: baseline;
                    .title{
                        flex: 1;
                        text-align: end;
                    }
                    .content{
                        flex: 5.6;
                    }
                }
            }
        }
        .title{
            font-size: .3548rem;
        }
    }
    .FixedAssetsList{
        flex: 1;
        width: 100%;
        overflow: auto;
        padding: 0 10px;
        .list-item{
            width: 100%;
            height: 1.6129rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            &>div{
                display: flex;
                align-items: baseline;
                margin-top: 5px;
            }
            &:nth-child(n + 2){
                border-top: 1px solid #ccc;
            }
            &.center{
                text-align: center;
            }
        }
    }
}
</style>