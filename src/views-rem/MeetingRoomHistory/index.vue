<template>
    <div class="meetingRoomHistoryContainer">
        <!-- 上面是搜索框 -->
        <form action="/" class="meetingRoomHistorySearch">
            <van-search v-model="searchValue" placeholder="会议主题、预定人" @search="onSearch" v-on:clear="handleClickClearInput" />
        </form>
        <!-- 下面是预约预定列表 -->
        <van-list class="meetingRoomHistoryList" v-model:loading="loading" :finished="finished" :finished-text="finishedText" @load="onLoad()">
            <div class="list-item" v-for="item in list" :key="item.id">
                <!-- 上面的日期 -->
                <div class="date" v-if="!item.is_hidden">
                    <!-- 左边是 月-日 -->
                    <div>{{item.month_day}}</div>
                    <!-- 右边是 年 -->
                    <div>{{item.year}}</div>
                </div>
                <!-- 下面的内容 -->
                <div class="content-container">
                    <!-- 标题 -->
                    <div class="meetingTitle" :class="{'borderTop':item.is_hidden}">{{item.Title}}</div>
                    <!-- 内容区域 -->
                    <div class="meetingContent" >
                        <!-- 第一行 -->
                        <div class="oneLine">
                            <!-- 第一列 -->
                            <div class="cell">
                                <div class="title">发起人：</div>
                                <div class="content">{{item.USERNAME}}</div>
                            </div>
                            <!-- 第二列 -->
                            <div class="cell">
                                <div class="title">会议时间：</div>
                                <div class="content">{{item.STARTTIME + '-' + item.ENDTIME}}</div>
                            </div>
                        </div>
                        <!-- 第二行 -->
                        <div class="twoLine">
                            <div class="title">部门：</div>
                            <div class="content">{{item.DeptName}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </van-list>
    </div>
</template>

<script>
import { reactive, ref, toRefs } from 'vue'
import { useStore } from 'vuex'
// 导入对会议室排序的公共方法
import sortMeetingList from '@/views-rem/hook/sortArray.js'
export default {
    name:'MeetingRoomHistory',
    setup() {
        const store = useStore()
        // 搜索框输入的值
        let searchValue = ref('')
        // 在移动端点击键盘上的搜索按钮触发的函数
        function onSearch(){
            let message = ''
            pagination.currentPage = 1
            meetingRoomHistoryListData.finished = false
            meetingRoomHistoryListData.loading = true
            meetingRoomHistoryListData.list = []
            // 判断输入框的值是否为空
            if(searchValue.value){
                // 如果不为空
                totalList = sortMeetingList(store.state.activeInfo.HistoryList.filter(item => {
                    return (item.USERNAME && item.USERNAME.toUpperCase().includes(searchValue.value.toUpperCase())) || (item.Title && item.Title.toUpperCase().includes(searchValue.value.toUpperCase()))
                }))
                if(totalList.length === 0){
                    message = '无匹配项'
                }
            }else {
                // 如果为空
                totalList = store.state.activeInfo.HistoryList
            }
            meetingRoomHistoryListData.onLoad(message)
        }
        // 点击输入框清除按钮触发的函数
        function handleClickClearInput(){
            pagination.currentPage = 1
            meetingRoomHistoryListData.finished = false
            meetingRoomHistoryListData.loading = true
            meetingRoomHistoryListData.list = []
            totalList = store.state.activeInfo.HistoryList
            meetingRoomHistoryListData.onLoad()
        }
        let totalList = store.state.activeInfo.HistoryList
        // 预定预约列表的相关数据
        let meetingRoomHistoryListData = reactive({
            // 控制上滑加载的变量
            loading: false,
            // 控制列表加载完毕的变量
            finished: false,
            // 触发上滑加载的函数
            onLoad(message){
                message = message || '没有更多了'
                meetingRoomHistoryListData.finishedText = message
                setTimeout(() => {
                    let array = []
                    array = totalList.slice((pagination.currentPage-1)*pagination.pageSize,pagination.currentPage*pagination.pageSize)
                    meetingRoomHistoryListData.list.push(...array)
                    meetingRoomHistoryListData.loading = false

                    if (array.length === 0) {
                        meetingRoomHistoryListData.finished = true
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
            ...toRefs(meetingRoomHistoryListData),
        }
    }
}
</script>

<style lang="less" scoped>
.meetingRoomHistoryContainer{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f2f2f2;
    .meetingRoomHistorySearch{
        .van-search{
            padding: 5px 6px;
            /deep/.van-search__content{
                background-color: #fff;
            }
        }
    }
    .meetingRoomHistoryList{
        flex: 1;
        width: 100%;
        overflow: auto;
        .list-item{
            // 时间日期
            .date{
                width: 100%;
                height: .7527rem;
                font-size: .4301rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 .3226rem;
            }
            .content-container{
                padding: 0 .3226rem;
                background-color: #fff;
                color: #404040;
                .meetingTitle{
                    font-size: .3763rem;
                    font-weight: 700;
                    padding:.0538rem 0 .1613rem 0;
                }
                .meetingContent{
                    .oneLine{
                        display: flex;
                        .cell{
                            width: 50%;
                            display: flex;
                            align-items: center;
                            line-height: .7527rem;
                            &:first-child{
                                .title{
                                    flex: 1.53;
                                }
                                .content{
                                    flex: 4;
                                    white-space: nowrap;
                                    overflow: auto;
                                }
                            }
                        }
                    }
                    .twoLine{
                        display: flex;
                        line-height: .7527rem;
                        .title{
                            flex: 1;
                        }
                        .content{
                            flex: 8;
                            white-space: nowrap;
                            overflow: auto;
                        }
                    }
                }
            }
        }
        .borderTop{
            border-top: 2px solid #f2f2f2;
        }
    }
}
</style>