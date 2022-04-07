<template>
    <el-dialog v-model="meetingRoom_dialog" :title="meetingRoom_dialog_title" :close-on-click-modal='false' draggable width="30%">
        <span>会议室预定记录</span>
        <template #footer>
            分页器
        </template>
    </el-dialog>
</template>

<script>
import { computed, ref } from 'vue'
export default {
    name:'MeetingRoom',
    setup() {
        const meetingRoom_dialog = ref(false)
        const meetingRoom_dialog_title = computed(() => {
            return 'XXX会议室预定记录'
        })
        return {
            meetingRoom_dialog,
            meetingRoom_dialog_title
        }
    }
}
</script>

<style lang="less" scoped>

</style>