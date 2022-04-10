<template>
    <div class="meetingRoomHistoryContainer">
        <!-- 上面是搜索框 -->
        <form action="/" class="meetingRoomHistorySearch">
            <van-search v-model="searchValue" placeholder="会议主题、预定人" @search="onSearch" v-on:clear="handleClickClearInput" />
        </form>
        <!-- 下面是预约预定列表 -->
        <van-pull-refresh class="meetingRoomHistoryList" success-text="刷新成功" v-model="refreshing" @refresh="onRefresh">
            <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                <div class="list-item" v-for="item in list" :key="item">
                    {{item.USERNAME}}
                </div>
            </van-list>
        </van-pull-refresh>
    </div>
</template>

<script>
import { reactive, ref, toRefs } from 'vue'
import { useStore } from 'vuex'
export default {
    name:'MeetingRoomHistory',
    setup() {
        const store = useStore()
        // 搜索框输入的值
        let searchValue = ref('')
        // 在移动端点击键盘上的搜索按钮触发的函数
        function onSearch(){

        }
        // 点击输入框清除按钮触发的函数
        function handleClickClearInput(){

        }
        // 预定预约列表的相关数据
        let meetingRoomHistoryListData = reactive({
            // 控制下拉刷新的变量
            refreshing:false,
            // 下拉刷新触发的事件
            onRefresh(){
                setTimeout(() => {
                    meetingRoomHistoryListData.finished = false
                    meetingRoomHistoryListData.loading = true
                    meetingRoomHistoryListData.onLoad()
                })
            },
            // 控制上滑加载的变量
            loading: false,
            // 控制列表加载完毕的变量
            finished: false,
            // 触发上滑加载的函数
            onLoad(){
                setTimeout(() => {
                    if (meetingRoomHistoryListData.refreshing) {
                        meetingRoomHistoryListData.list = []
                        meetingRoomHistoryListData.refreshing = false
                        pagination.currentPage = 1
                    }
                    let array = []
                    array = store.state.activeInfo.HistoryList.slice((pagination.currentPage-1)*pagination.pageSize,pagination.currentPage*pagination.pageSize)
                    meetingRoomHistoryListData.list.push(...array)
                    meetingRoomHistoryListData.loading = false

                    if (array.length === 0) {
                        meetingRoomHistoryListData.finished = true
                    }
                    pagination.currentPage += 1
                }, 1000)
            },
            // 列表数据
            list:[]
        })
        let pagination = {
            currentPage:1,
            pageSize:3
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
    }
}
</style>