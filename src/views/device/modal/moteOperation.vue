<template>
  <div>
    <template v-if="logListData.length !==0">
    <ul class="device-operation-list">
      <li v-for="(item, index) in logListData" :key="index" v-if="item.type!=='SET_UNACTIVATED'">
        <div>{{formatTimeDay(item.createTime)}}</div>
        <div>{{item.username}}于{{formatTimeHour(item.createTime)}}{{item.content}}</div>
      </li>
    </ul>
  </template>
  <template v-else>
    <i class="left-list-none"></i>
    <div class="left-list-none-text">暂无操作记录</div>
  </template>
  </div>
</template>
<script>
  import moment from 'moment'
  import { mapGetters } from 'vuex'

  export default {
    props: ['id'],
    computed: {
      ...mapGetters([
        'logList'
      ]),
      logListData () {
        return this.logList({deviceId: this.id})
      }
    },
    methods: {
      formatTimeDay (x) {
        return moment(x).format('YYYY年MM月DD日')
      },
      formatTimeHour (x) {
        return moment(x).format('HH:mm:ss')
      }
    }
  }
</script>
<style scoped>
  .device-operation-list{
    padding-left: 0;
    margin-top: 0;
    max-height: 400px;
    overflow-y: scroll;
    overflow-x: hidden;
  }
  .device-operation-list li{
    list-style-type: none;
    padding-left:15px;
    position: relative;
    overflow: hidden;
  }
  .device-operation-list li div{
    padding: 0 10px;
    float: left;
  }
  .device-operation-list li div+div{
    width: 250px;
  }
  .device-operation-list li div:last-child{
    border-left: 2px solid #409EFF;
    float: left;
  }
  .device-operation-list li::after{
    content: '';
    display: block;
    position: absolute;
    top: 6px;
    left: 133px;
    width: 10px;
    height: 10px;
    background: #fff;
    border: 2px solid #409EFF;
    border-radius: 50%;
  }
  .left-list-none {
    background: url(../../../assets/images/none_data_img.png) no-repeat center;
    background-size: 60%;
    display: block;
    margin: 0 auto;
    width: 185px;
    height: 121px;
  }
  .left-list-none-text {
    text-align: center
  }
  .left-list-none-text span{
    color: #409EFF;
    cursor: pointer;
    text-decoration: underline;
  }
</style>




// WEBPACK FOOTER //
// src/views/device/modal/moteOperation.vue