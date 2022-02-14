<template>
    <el-drawer custom-class='drawer' modal-class='drawer-mask' v-model="$store.state.is_show_Drawer" :with-header="false" direction='ltr' :modal='false' size='15%'>
        <div>
            <span>姓名：</span><span>{{$store.state.currentSeatInfo && $store.state.currentSeatInfo.name}}</span>
        </div>
        <div>
            <span>座位号：</span><span>{{$store.state.currentSeatInfo && $store.state.currentSeatInfo.seat_id}}</span>
        </div>
        <div>
            <span>部门：</span><span>{{$store.state.currentSeatInfo && $store.state.currentSeatInfo.depart}}</span>
        </div>
    </el-drawer>
</template>

<script>
export default {
    name:'Drawer',
    setup() {
        return {

        }
    }
}
</script>

<style lang="less" scoped>

</style>