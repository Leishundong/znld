<template>
  <div class="device-info-modal">
    <dl>
      <dt>基本信息</dt>
      <dd>
        <span>设备名称:</span>
        <span>{{deviceDetail.name}}</span>
      </dd>
      <dd>
        <span>SN号:</span>
        <span>{{deviceDetail.snHex}}</span>
      </dd>
      <dd>
        <span>PN号:</span>
        <span>{{deviceDetail.pnHex}}</span>
      </dd>
      <dd>
        <span>分组:</span>
        <span>{{deviceDetail.groupName}}</span>
      </dd>
      <dd>
        <span>参数下发时间:</span>
        <span v-if="deviceDetail.paramSendAt !==0">{{formatTime(deviceDetail.paramSendAt)}}</span>
        <span v-else>暂无</span>
      </dd>
    </dl>
    <dl>
      <dt>参数信息</dt>
      <dd>
        <span>LED额定电流:</span>
        <span>{{deviceDetail.ledRatedCurrent}}A</span>
      </dd>
      <dd>
        <span>电池类型:</span>
        <span v-if="deviceDetail.batteryType===1">磷酸铁锂</span>
        <span v-if="deviceDetail.batteryType===2">三元锂</span>
        <span v-if="deviceDetail.batteryType===3">铅酸</span>
      </dd>
      <dd>
        <span>电池容量:</span>
        <span>{{deviceDetail.batteryCapacity}}AH</span>
      </dd>
      <dd>
        <span>电池额定电压:</span>
        <span>{{deviceDetail.batteryVoltage}}V</span>
      </dd>
      <dd>
        <span>电池超压电压:</span>
        <span>{{deviceDetail.batteryOverVoltage}}V</span>
      </dd>
      <dd>
        <span>电池超压恢复电压:</span>
        <span>{{deviceDetail.batteryOverToBackVoltage}}V</span>
      </dd>
      <dd>
        <span>电池低压电压:</span>
        <span>{{deviceDetail.batteryLowVoltage}}V</span>
      </dd>
      <dd>
        <span>电池低压恢复电压:</span>
        <span>{{deviceDetail.batteryLowToBackVoltage}}V</span>
      </dd>
      <dd>
        <span>光控天亮阈值:</span>
        <span>{{deviceDetail.dayThreshold}}V</span>
      </dd>
      <dd>
        <span>光控天黑阈值:</span>
        <span>{{deviceDetail.nightThreshold}}V</span>
      </dd>
    </dl>
  </div>
</template>
<script>
// 设备信息
import { mapGetters } from 'vuex'
import moment from 'moment'
export default {
  props: ['id'],
  computed: {
    ...mapGetters([
      'device'
    ]),
    deviceDetail () {
      return this.device(this.id)
    }
  },
  methods: {
    formatTime (x) {
      return moment(x).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  created () {
  }
}
</script>
<style>
  .device-info-modal {
    margin-top: -20px;
    border: 1px solid #ddd;
  }
  .device-info-modal dl {
    margin: 0;
    line-height: 28px;
  }
  .device-info-modal dt {
    text-align: center;
    border-bottom: 1px solid #ddd;
  }
  .device-info-modal dd {
    margin-left: 0;
    border-bottom: 1px solid #ddd;
  }
  .device-info-modal dd span:first-child {
    color: #999;
    border-right: 1px solid #ddd;
    display: inline-block;
    width: 140px;
    padding-right: 10px;
    text-align: right;
  }
  .device-info-modal dd span + span {
    padding-left: 10px;
  }
</style>




// WEBPACK FOOTER //
// src/views/device/modal/moteInfo.vue