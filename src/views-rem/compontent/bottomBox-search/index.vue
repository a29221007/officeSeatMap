<template>
    <!-- 2、点击了搜索后，显示搜索框和搜索建议列表 -->
    <div class="search">
        <div class="search-input">
            <i v-on:click="handleClickBack" class="iconfont oamap-zuojiantou"></i>
            <input ref="inputRef" v-model="inputValue" type="text" placeholder=" 搜索" v-on:input="handleInputSearch">
            <i v-if="inputValue" v-on:click="handleClickClear" class="iconfont oamap-qingchu"></i>
        </div>
        <div class="querySearch" ref="querySearchRef" v-on:touchmove="querySearchMove">
            <template v-if="is_none_sugges">
                <div class="querySearch-item" v-for="item in querySearchList" :key="item.id" v-on:click="handleClickQuerySearchItem(item)">
                    <div class="autoCompleteTemplate" v-if="item.type === '0' || item.type === '0-1' || item.type === '0-2'">
                        <!-- 第一行左边显示姓名，右边显示座位号 -->
                        <div class="oneLine">
                            <span><span class="title">座位人员名称：</span><span class="content">{{item.name || '暂无数据'}}</span></span>
                            <span><span class="title">座位号：</span><span class="content">{{item.seat_id}}</span></span>
                        </div>
                        <!-- 第二行显示该座位所在部门 -->
                        <div class="twoLine"><span class="title">部门：</span><span class="content">{{item.depart || '暂无数据'}}</span></div>
                    </div>
                    <div class="autoCompleteTemplate" v-if="item.type === 1 || item.type === 2 || item.type === 3">
                        <!-- 第一行左边显示姓名，右边显示座位号 -->
                        <div class="oneLine">
                            <span><span class="title">区域名称：</span><span class="content">{{item.name + item.subtitle.replace("︵","（").replace('︶','）').replace(/\s/g,"") || '暂无数据'}}</span></span>
                        </div>
                        <!-- 第二行显示该座位所在部门 -->
                        <div class="twoLine">
                            <span><span class="title">区域编号：</span><span class="content">{{item.code}}</span></span>
                        </div>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="is_none_sugges">暂无匹配项</div>
            </template>
        </div>
    </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
export default {
    name:'BottomBoxSearch',
    setup() {
        // 搜索框的数据和逻辑
        let searchInput = reactive({
            // 搜索框的输入绑定值
            inputValue:'', // 默认为空
            // 输入框的input事件，触发的函数
            handleInputSearch(){

            },
            // 点击输入框的返回箭头
            handleClickBack(){

            },
            // 点击输入框的清除按钮
            handleClickClear(){

            }
        })


        // 搜索建议列表的数据与逻辑
        let querySearch = reactive({
            // 搜索建议列表的数组集合
            querySearchList:[], // 默认是空数组
            // 点击搜索建议中的某一项，触发的函数
            handleClickQuerySearchItem() {

            },
            // 给搜索建议列表绑定一个 touchmove 事件，并阻止冒泡行为
            querySearchMove(){
                
            }
        })
        return {
            ...toRefs(searchInput),
            ...toRefs(querySearch),
        }
    }
}
</script>

<style lang="less" scoped>
.search{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .search-input{
        width: 100%;
        height: .8602rem;
        background-color: #262729;
        border-radius: 7px;
        display: flex;
        align-items: center;
        margin-bottom: .2688rem;
        .oamap-zuojiantou,.oamap-qingchu{
            color: #f8f9fa;
            font-size: .4301rem;
            margin: 0 .3226rem 0 .3226rem;
        }
        input{
            width: 100%;
            height: .4301rem;
            background-color: unset;
            border: none;
            caret-color: skyblue;
            color: #f8f9fb;
            &::-webkit-input-placeholder{
                color: #b1b2b4;
            }
        }
    }
    .querySearch{
        width: 100%;
        flex: 1;
        overflow: auto;
        .querySearch-item{
            padding: .2151rem;
            & ~ .querySearch-item {
                border-top: 1px solid #30322f;
            }
            .autoCompleteTemplate{
                // 第一行
                .oneLine{
                    display: flex;
                    justify-content: space-between;
                    color: #f4f4f4;
                }
                // 第二行
                .twoLine{
                    color: #a0a0a0;
                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space:nowrap;
                }
                .title{
                    font-size:.3763rem;
                }
                .content{
                    font-size: .3226rem;
                }
            }
        }
        .is_none_sugges{
            font-size: .3763rem;
            color: #e8e8e8;
            text-align: center;
            margin-top: .2151rem;
        }
    }
}
</style>