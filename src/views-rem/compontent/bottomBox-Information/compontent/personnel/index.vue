<template>
    <div class="container">
        <!-- 第一行 -->
        <div class="line">
            <div class="title">工位号：</div>
            <div class="content"><span class="scroll">{{$store.state.activeInfo.seat_id}}</span></div>
        </div>
        <!-- 第二行 -->
        <div class="line">
            <div class="title">部门：</div>
            <div class="content"><span class="scroll">{{$store.state.activeInfo.depart}}</span></div>
        </div>
        <!-- 第三行 -->
        <div class="line">
            <div class="title">个人固定资产信息：</div>
            <!-- <div class="content"><span class="button" v-on:click="handleCheckFixedAssetsList($store.state.activeInfo.id)">查看</span></div> -->
            <div class="content"><span class="button" v-on:click="$store.dispatch('getPersontFixedAssetsList',$store.state.activeInfo.id)">查看</span></div>
        </div>
    </div>
</template>

<script>
export default {
    name:'personnel',
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
            flex: 2;
            font-size: .3763rem;
            color: #f8f9fa;
            text-align: end;
        }
        .content{
            flex: 3.5;
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
}
</style>