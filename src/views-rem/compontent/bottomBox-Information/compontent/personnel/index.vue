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
            <div class="content"><span class="button" v-on:click="handleCheckFixedAssetsList($store.state.activeInfo.id)">查看</span></div>
        </div>
    </div>
</template>

<script>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
// 导入获取个人固资的api
import { getFixedAssets } from '@/api/getFixedassets.js'
import { beginToast } from '@/views-rem/hook/toast.js'
export default {
    name:'personnel',
    setup(){
        const store = useStore()
        const router = useRouter()
        // 点击查看按钮，获取当前员工的固资信息、并跳转到固资信息页面
        async function handleCheckFixedAssetsList(code){
            const res = await getFixedAssets(code)
            if(res.code !== 0) return beginToast('fail', res.message, 2000)
            // 添加一个工位号信息
            res.data.seat_id = store.state.activeInfo.seat_id
            store.commit('setPersontFixedAssetsList',res.data)
            // 跳转到固资信息页面
            router.push('/fixedAssets')
        }
        return {
            handleCheckFixedAssetsList
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