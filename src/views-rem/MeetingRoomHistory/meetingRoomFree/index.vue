<template>
    <div class="free">
        <div>Free</div>
        <span>当前会议室无人预定</span>
    </div>
</template>

<script>
export default {
    name:'meetingRoomFree',
}
</script>

<style lang="less" scoped>
.free{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f2f2f2;
    div{
        width: 50%;
        height: 30%;
        border-radius: 50%;
        background-color: #fae7e7;
        color: #ff7fd8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: .7527rem;
        margin-bottom: 10px;
    }
}
</style>