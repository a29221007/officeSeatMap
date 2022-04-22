<template>
    <el-dialog custom-class='meetingRoom_dialog' v-model="meetingRoom_dialog" :title="MeetingRoomName + ' - 会议室预定预约记录' " :close-on-click-modal='false' draggable width="55%" top='8vh' v-on:closed='handleClosedDialog'>
        <div class="inputBox">
            <el-input v-model="searchValue" placeholder="会议主题、预订人" clearable :prefix-icon="Search" v-on:change="handleClickSearch" v-on:clear='handleClickSearch' />
            <button v-on:click="handleClickSearch">查 询</button>
        </div>
        <el-table :data="MeetingRoomHistoryList_pagination" border>
            <el-table-column prop="Title" align='center' label="会议主题" />
            <el-table-column label="会议时间" align='center'>
                <template #default="scope">
                    <div class="Date">
                        <div>{{scope.row.MDate}}</div>
                        <div>{{scope.row.STARTTIME}}-{{scope.row.ENDTIME}}</div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="USERNAME" align='center' label="预定人" />
            <el-table-column prop="DeptName" align='center' label="部门" />
        </el-table>
        <template #footer>
            <el-pagination v-model:currentPage="currentPage" v-model:page-size="pageSize" :page-sizes="[20,40,60]" :small="true" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </template>
    </el-dialog>
</template>

<script>
import { computed, reactive, ref, toRefs } from 'vue'
import { Search } from '@element-plus/icons-vue'
export default {
    name:'MeetingRoom',
    props:{
        MeetingRoomName:{
            type:String,
            required:true
        },
        MeetingRoomHistoryList:{
            type:Array,
            required:true
        }
    },
    setup(prop) {
        const meetingRoom_dialog = ref(false)
        // 修改 meetingRoom_dialog 的值
        function setMeetingRoom_dialog(value){
            meetingRoom_dialog.value = value
        }
        // 分页器管理 FixedAssetsList 数据
        let MeetingRoomHistoryList_pagination = computed(() => {
            let array = []
            if(searchInput.value === ''){
                array = prop.MeetingRoomHistoryList
            }else{
                array = prop.MeetingRoomHistoryList.filter(item => {
                    return (item.USERNAME && (item.USERNAME + '').toUpperCase().includes(searchInput.value.toUpperCase())) || (item.Title && (item.Title + '').toUpperCase().includes(searchInput.value.toUpperCase()))
                })
            }
            return array.slice((pagination.currentPage-1)*pagination.pageSize,pagination.currentPage*pagination.pageSize)
        })
        // 分页器组件数据
        const pagination = reactive({
            // 当前的页数
            currentPage:1,
            // 一页显示多少条
            pageSize:20,
            // 当前表格的总数
            total:computed(() => {
                return prop.MeetingRoomHistoryList.length
            }),
            // pageSize 发生变化触发的函数
            handleSizeChange(value){
                pagination.pageSize = value
            },
            // currentPage 发生变化触发的函数
            handleCurrentChange(value){
                pagination.currentPage = value
            }
        })
        // 搜索框的值
        let searchValue = ref('')
        // 用来对搜索结果处理
        let searchInput = ref('')
        // 查询
        function handleClickSearch(){
            searchInput.value = searchValue.value
        }
        // 关闭弹框后触发的函数
        function handleClosedDialog(){
            searchInput.value = ''
            searchValue.value = ''
        }
        return {
            meetingRoom_dialog,
            setMeetingRoom_dialog,
            ...toRefs(pagination),
            MeetingRoomHistoryList_pagination,
            Search,
            searchValue,
            handleClickSearch,
            handleClosedDialog
        }
    }
}
</script>

<style lang="less" scoped>

</style>