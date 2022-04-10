<template>
    <div class="container">
        <template v-if="$store.state.activeInfo.setting">
            <!-- 第一行 -->
            <div class="line">
                <div class="title">会议设备：</div>
                <div class="content"><span class="scroll">{{$store.state.activeInfo.setting}}</span></div>
            </div>
            <!-- 第二行 -->
            <div class="line">
                <div class="title">当前预定：</div>
                <div class="content"><span class="scroll">{{is_curentMeeting_active ? $store.state.activeInfo.current.USERNAME : '无'}}</span></div>
            </div>
            <!-- 第三行 -->
            <div class="line" v-if="is_curentMeeting_active">
                <div class="title">预定时间：</div>
                <div class="content"><span class="scroll">{{$store.state.activeInfo.current.Date + ' ' + $store.state.activeInfo.current.STARTTIME + '-' + $store.state.activeInfo.current.ENDTIME}}</span></div>
            </div>
            <!-- 第四行 -->
            <div class="line">
                <div class="title">预约记录：</div>
                <div class="content"><span class="button" v-on:click="handleClickPushMeetingRoom">查看</span></div>
            </div>
        </template>
        <template v-else>
            <div class="questError" v-on:click="getMeetingRoomData($store.state.activeInfo.code,$store.state.activeInfo.name)">查询失败-点击重试</div>
        </template>
    </div>
</template>

<script>
import { computed, inject } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
export default {
    name:'MeetingRoom',
    setup(){
        const store = useStore()
        const router = useRouter()
        // 判断会议室是否有当前预定信息
        const is_curentMeeting_active = computed(() => {
            if(typeof store.state.activeInfo.current === 'string' && store.state.activeInfo.current === ''){
                // 如果 current 值类型为字符串并且值为空
                return false
            }else if(Object.prototype.toString.call(store.state.activeInfo.current) === '[object Object]'){
                // 如果为对象，则继续判断是否为空数组
                if(Object.getOwnPropertyNames(store.state.activeInfo.current).length === 0){
                    // 如果长度为0，则当前没有人预定会议室
                    return false
                }else{
                    return true
                }
            }else if(Object.prototype.toString.call(store.state.activeInfo.current) === '[object Array]'){
                // 如果为数组，则判断是否为空数组
                if(store.state.activeInfo.current.length === 0){
                    // 如果长度为0，则当前没有人预定会议室
                    return false
                }else{
                    return true
                }
            }else{
                return true
            }
        })
        
        // 点击查看，会议室预约预定记录
        function handleClickPushMeetingRoom(){
            router.push('/meetingRoomHistory')
        }
        // 接受祖先组件传递过来的获取会议室相关数据的函数
        let getMeetingRoomData = inject('getMeetingRoomData')
        return {
            is_curentMeeting_active,
            handleClickPushMeetingRoom,
            getMeetingRoomData
        }
    }
}
</script>

<style lang="less" scoped>
.container{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .line{
        display: flex;
        padding: .0538rem 0;
        white-space:nowrap;
        overflow: hidden;
        display: flex;
        align-items: baseline;
        .title{
            flex: 1;
            font-size: .3763rem;
            color: #f8f9fa;
            text-align: end;
        }
        .content{
            flex: 4.5;
            overflow: hidden;
            span{
                position: relative;
            }
        }
        // 查看按钮
        .button{
            color: #0493d3;
        }
    }
    // 查询失败
    .questError{
        text-align: center;
    }
}
</style>