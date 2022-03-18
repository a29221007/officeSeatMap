<template>
    <!-- 3、点击了搜索结果的某一项后，显示对应区域或座位的详细信息 -->
    <div class="Seat-Area-Information">
        <!-- 头部区域 -->
        <div class="header">
            <div class='title'>
                已选工位
            </div>
            <div class="buttons">
                <div v-on:click="handleClickEdit"><i class="iconfont oamap-xiugai"></i> 编辑</div>
            </div>
        </div>
        <!-- 内容区域 -->
        <div class="content">
            <component :is="compontentType"></component>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

import Area from './compontent/area'
import EmptySeats from './compontent/Empty-seats'
import Personnel from './compontent/personnel'
import TakeUp from './compontent/Take-up'
export default {
    name:'BottomBoxInformation',
    components:{
        Area, EmptySeats, Personnel, TakeUp
    },
    setup() {
        const store = useStore()
        // 选中项的信息
        const activeInfo = computed(() => {
            return store.state.activeInfo
        })
        // 点击编辑按钮触发的事件
        function handleClickEdit() {

        }
        // 切换组件变量
        let compontentType = computed(() => {
            return 'Area'
        })
        return {
            activeInfo,
            handleClickEdit,
            compontentType
        }
    }
}
</script>

<style lang="less" scoped>
.Seat-Area-Information{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    color: #f8f9fa;
    .header{
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom:1px solid #30322f;
        .title{
            font-size: .4301rem;
        }
        .buttons{
            div{
                display: flex;
                align-items: center;
            }
        }
    }
    .content{
        flex: 3;
        .line{
            padding: .1075rem 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
    }

}
</style>