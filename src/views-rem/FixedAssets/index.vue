<template>
    <div class="FixedAssets">
        <!-- 顶部search和个人信息 -->
        <div class="search-and-personal_information">
            <!-- 搜索框 -->
            <div class="FixedAssetsListSearch">
                <van-icon name="arrow-left" size=".4301rem" color="#000" v-on:click="$router.back()" />
                <van-search left-icon='search' v-model="searchValue" placeholder="固资编号或名称" autocomplete='off' clear-trigger='always' @search="onSearch" v-on:clear="handleClickClearInput" />
            </div>
            <!-- 个人信息展示 -->
            <div class="personInfo">
                <!-- 第一行 -->
                <div>{{$store.state.PersontFixedAssetsList.UserName}}</div>
                <!-- 第二大行 -->
                <div>
                    <!-- 第二行 -->
                    <div>
                        <div class="title">部门</div>
                        <div class="content">{{$store.state.PersontFixedAssetsList.DeptName}}</div>
                    </div>
                    <!-- 第三行 -->
                    <div>
                        <div>
                            <div class="title">工位</div>
                            <div class="content">{{$store.state.PersontFixedAssetsList.seat_id}}</div>
                        </div>
                        <div>
                            <div class="title">工号</div>
                            <div class="content">{{$store.state.PersontFixedAssetsList.UserCode}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 中部展示个人固资信息 -->
        <div class="_FixedAssets">
            <!-- 列表头部 -->
            <div class="FixedAssetsListHeader">
                <div>固定资产编号</div>
                <div>固定资产名称</div>
            </div>
            <!-- 列表主体 -->
            <van-list :class="{'FixedAssetsListContent':true,'active':$store.state.is_show_public_contact_person}" v-model:loading="loading" :finished="finished" :finished-text="finishedText" @load="onLoad">
                <template v-if="$store.state.PersontFixedAssetsList.FixedChildList.length !== 0">
                    <div class="list-content">
                        <div class="list-item" v-for="item in list" :key="item.id">
                            <div>{{item.FixedCode}}</div>
                            <div>{{item.FixedName}}</div>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class="list-item center">该员工无固资信息</div>
                </template>
            </van-list>
        </div>
        <!-- 底部公共联系人信息 -->
        <div class="public_contact" v-if="$store.state.is_show_public_contact_person">
            <div class="title">公共支持联系人</div>
            <div class="person">
                <!-- 第一行 -->
                <div>
                    <!-- 左 -->
                    <div>
                        <div class="title">行政</div>
                        <div class="content">蔡芬 高雅楠</div>
                    </div>
                    <!-- 右 -->
                    <div>
                        <div class="title">培训</div>
                        <div class="content">员工服务-培训服务号</div>
                    </div>
                </div>
                <!-- 第二行 -->
                <div>
                    <!-- 左 -->
                    <div>
                        <div class="title">财务</div>
                        <div class="content">孟林 倪苹 </div>
                    </div>
                    <!-- 右 -->
                    <div>
                        <div class="title">员工信息</div>
                        <div class="content">崔明岳 王锐</div>
                    </div>
                </div>
                <!-- 第三行 -->
                <div>
                    <!-- 左 -->
                    <div>
                        <div class="title">考勤休假</div>
                        <div class="content">陈丽琴</div>
                    </div>
                    <!-- 右 -->
                    <div>
                        <div class="title">公共设施维修</div>
                        <div class="content">王立军 王玉田</div>
                    </div>
                </div>
                <!-- 第四行 -->
                <div>
                    <!-- 左 -->
                    <div>
                        <div class="title">薪酬工资</div>
                        <div class="content">李柏金</div>
                    </div>
                    <!-- 右 -->
                    <div>
                        <div class="title">社保公积金</div>
                        <div class="content">闫冬雪 中智onsite</div>
                    </div>
                </div>
                <!-- 第五行 -->
                <div>
                    <div class="title">IT</div>
                    <div class="content">员工服务-IT服务号(北京)</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, onBeforeUnmount } from 'vue'
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
        // 当组件销毁时，隐藏公共联系人
        onBeforeUnmount(() => {
            store.commit('setIs_show_public_contact_person',false)
        })
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
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .search-and-personal_information{
        width: 100%;
        height: 3.7903rem;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        .FixedAssetsListSearch{
            width: 100%;
            height: 1.6022rem;
            display: flex;
            align-items: center;
            padding: 0 .5323rem 0 .4301rem;
            .van-icon{
                margin-right: .3226rem;
            }
            .van-search{
                flex: 1;
                height: 1.0108rem;
                background-color: #EAEBED;
                border-radius: .2151rem;
                padding-left: 0;
                /deep/.van-search__content{
                    background-color: unset;
                    padding-left:0;
                    .van-field__left-icon{
                        margin:0 .2043rem;
                        color: #8C8686;
                    }
                }
            }
        }
        .personInfo{
            flex: 1;
            padding: 0 .5323rem;
            display: flex;
            flex-direction: column;
            &>div{
                &:nth-child(1){
                    color: #403636;
                    font-weight: 500;
                    font-size: .428rem;
                    line-height: .6935rem;
                    height: .6935rem;
                }
                &:nth-child(2){
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    &>div{
                        &:nth-child(1){
                            display: flex;
                            color: #8C8686;
                            font-weight: 400;
                            font-size: .3737rem;
                            line-height: .586rem;
                            height: .586rem;
                            .title{
                                white-space: nowrap;
                            }
                            .content{
                                overflow: hidden;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                            }
                        }
                        &:nth-child(2){
                            display: flex;
                            color: #8C8686;
                            font-weight: 400;
                            font-size: .3737rem;
                            line-height: .586rem;
                            height: .586rem;
                            justify-content: space-between;
                            &>div{
                                display: flex;
                            }
                        }
                    }
                }
            }
            .title{
                margin-right: .3763rem;
            }
        }
    }
    ._FixedAssets{
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        width: 100%;
        background-color: #F1F1F1;
        padding: .2147rem .3226rem .2147rem;
        .FixedAssetsListHeader{
            width: 100%;
            height: 1.0538rem;
            line-height: 1.0538rem;
            display: flex;
            align-items: center;
            background-color: #fff;
            color: #B5B5B5;
            font-size: .3752rem;
            opacity: 0.9;
            border-top-left-radius: .2688rem;
            border-top-right-radius: .2688rem;
            padding:0 .4269rem;
            border-bottom: 1px solid transparent;
            border-image: linear-gradient(to bottom,transparent 50%, #E6E6E6 50%) 0 0 100%/1px 0;
            &>div{
                &:first-child{
                    flex: 1;
                }
                &:last-child{
                    flex: 1.245;
                }
            }
        }
        .FixedAssetsListContent{
            flex: 1;
            overflow: auto;
            .list-content{
                width: 100%;
                background-color: #fff;
                padding:0 .4269rem;
                border-bottom-left-radius: .2688rem;
                border-bottom-right-radius: .2688rem;
            }
            .list-item{
                width: 100%;
                height: 1.1882rem;
                display: flex;
                align-items: center;
                color: #403636;
                font-size: .3737rem;
                border-top: 1px solid #E6E6E6;
                &>div{
                    &:first-child{
                        flex: 1;
                    }
                    &:last-child{
                        flex: 1.245;
                    }
                }
                &:first-child{
                    border-top: none;
                }
                &.center{
                    text-align: center;
                    background-color: #fff;
                    border-bottom-left-radius: .2688rem;
                    border-bottom-right-radius: .2688rem;
                    justify-content: center;
                }
            }
            &.active{
                padding-bottom: 4.4624rem;
            }
        }
    }
    .public_contact{
        position: absolute;
        bottom: 0;
        background-color: #fff;
        width: 100%;
        height: 4.4624rem;
        padding: 0 .6129rem 0 .5323rem;
        border-top: 1px solid #CCCCCC;
        display: flex;
        flex-direction: column;
        &>.title{
            color: #403636;
            font-size: .3742rem;
            font-weight: 500;
            height: .5355rem;
            line-height: .5355rem;
            margin: .3065rem 0 .2151rem 0;
        }
        .person{
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            font-size: .3226rem;
            &>div{
                height: .5355rem;
                line-height: .5355rem;
                // 前四项的样式
                &:nth-child(-n +4){
                    display: flex;
                    align-items: center;
                    &>div{
                        display: flex;
                        &:first-child{
                            .title{
                                width: 1.2806rem;
                                margin-right: .1871rem;
                                white-space: nowrap;
                            }
                            .content{
                                width: 2.0247rem;
                                margin-right: .2151rem;
                                white-space: nowrap;
                            }
                        }
                        &:last-child{
                            .title{
                                width: 1.914rem;
                                white-space: nowrap;
                                margin-right: .1871rem;
                            }
                            .content{
                                white-space: nowrap;
                            }
                        }
                    }
                }
                // 最后一项
                &:last-child{
                    display: flex;
                    align-items: center;
                    .title{
                        width: 1.2806rem;
                        margin-right: .1871rem;
                        white-space: nowrap;
                    }
                }
                // 设置他们公共的字体颜色
                .title{
                    color: #403636;
                }
                .content{
                    color: #8C8686;
                }
            }
        }
    }
}
</style>