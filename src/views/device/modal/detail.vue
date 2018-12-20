<template>
  <!-- 弹出层 -->
  <div>
    <div class="detail-wrap">
      <!-- 外层组件 -->
      <div class="device-modal-detail">
        <div class="title">
          基本信息
        </div>
        <ul class="summary">
          <li style="width:100%;">设备名称：<span>{{deviceDetailData.name}}</span></li>
          <li style="width:100%;">设备状态：<span>{{deviceDetailData.isOnline?'在线':'离线'}}/{{deviceDetailData.isOpen?'ON':'OFF'}}/{{deviceDetailData.brightness?deviceDetailData.brightness:0}}%</span></li>
        </ul>
      </div>
      <div class="device-modal-detail">
        <div class="title">
          设备当前状态
          <span @click="showModal('moteStatus')" class="animated swing">更多></span>
        </div>
        <ul class="summary">
          <li>LED电压：<span>{{deviceDetailData.ledVolt}}V</span></li>
          <li>LED电流：<span>{{deviceDetailData.ledCurr}}A</span></li>
          <li>电池电压：<span>{{deviceDetailData.batteryVolt}}V</span></li>
          <li>电池电流：<span>{{deviceDetailData.batteryCurr}}A</span></li>
          <li>太阳能板电压：<span>{{deviceDetailData.solarVoltage}}V</span></li>
          <li>太阳能板电流：<span>{{deviceDetailData.solarCurrent}}A</span></li>
        </ul>
      </div>
      <div class="device-modal-detail">
        <div class="title">
          设备参数
          <span @click="showModal('moteInfo')"  class="animated swing">更多></span>
        </div>
        <ul class="summary">
          <li style="width:100%;">LED额定电流：<span>{{deviceDetailData.ledRatedCurrent}}A</span></li>
          <li style="width:100%;">
            电池类型：
            <span v-if="deviceDetailData.batteryType===1">磷酸铁锂/{{deviceDetailData.batteryVoltage}}V</span>
            <span v-if="deviceDetailData.batteryType===2">三元锂/{{deviceDetailData.batteryVoltage}}V</span>
            <span v-if="deviceDetailData.batteryType===3">铅酸/{{deviceDetailData.batteryVoltage}}V</span>
          </li>
        </ul>
      </div>
      <div class="device-modal-detail">
        <div class="title">
          查看更多
        </div>
        <div class="device-modal-list" style="padding-bottom:15px;">
          <el-button size="small" @click="showModal('moteStrategy')" class="animated swing">当前策略</el-button>
          <el-button size="small" @click="showModal('moteMonitor')" class="animated swing">数据统计</el-button>
          <el-button size="small" @click="showModal('moteOperation')" class="animated swing">操作记录</el-button>
          <!-- <el-button size="small" @click="showModal('moteWarn')" class="animated swing">告警数据</el-button> -->
        </div>
      </div>
      <div v-if="isPermiss('OPERAT_DEVICE_STATUS')" class="device-modal-detail">
        <div class="title">
          快捷操作
        </div>
        <div class="device-modal-list">
          <el-popover
            ref="adjustLamp"
            placement="top-start"
            width="300"
            trigger="click">
            <el-slider
              v-model="brightness"
              :show-input-controls="false"
              input-size="mini"
              show-input>
            </el-slider>
            <el-button size="mini" type="primary" @click="adjustLight">确 定</el-button>
          </el-popover>
          <el-button size="small" class="animated swing" @click="updateStatus" :loading="operationBtn.updateLoading" :disabled="forbid">更新</el-button>
          <el-button size="small" class="animated swing" @click="changeDeviceOn" :loading="operationBtn.openLoading" :disabled="forbid">开灯</el-button>
          <el-button size="small" class="animated swing" @click="changeDeviceOff" :loading="operationBtn.closeLoading" :disabled="forbid">关灯</el-button>
          <el-button v-popover:adjustLamp size="small" class="animated swing" :loading="operationBtn.adjustLoading" :disabled="forbid">调光</el-button>
        </div>
      </div>
      <!-- 内层组件 -->
      <el-dialog
        width="500px"
        :title="modalTitle"
        :visible.sync="innerVisible"
        append-to-body>
        <component :id="deviceId" :is="modalName"></component>
      </el-dialog>
    </div>
  </div>
</template>
<script>
  import { mapGetters, mapActions } from 'vuex'
  import moteInfo from './moteInfo'
  import moteStatus from './moteStatus'
  import moteStrategy from './moteStrategy'
  import moteWarn from './moteWarn'
  import moteOperation from './moteOperation'
  import moteMonitor from './moteMonitor'
  import moment from 'moment'

  export default {
    data () {
      return {
        innerVisible: false,
        // modal组件
        modalName: 'moteStatus',
        // 弹出层
        modalTitle: '设备当前状态',
        operationBtn: {
          updateLoading: false,
          openLoading: false,
          closeLoading: false,
          adjustLoading: false
        },
        forbid: false,
        brightness: 0
      }
    },
    components: {
      moteInfo,
      moteStrategy,
      moteStatus,
      moteWarn,
      moteOperation,
      moteMonitor
    },
    props: {
      deviceId: {
        type: String,
        default: '0'
      },
      preUpdateTime: {
        type: Number
      }
    },
    computed: {
      ...mapGetters([
        'projectList',
        'groupList',
        'deviceList',
        'device',
        'strategyInDevice',
        'logList',
        'isPermissByFunName'
      ]),
      projectId () {
        return this.$route.params.projectId || sessionStorage.getItem('projectId')
      },
      deviceDetailData () {
        return this.device(this.deviceId)
      }
    },
    methods: {
      ...mapActions([
        'updateDeviceStatusBySingle',
        'updateDeviceLevelBySingle'
      ]),
      // 依据功能名称判断是否有权限
      isPermiss (funName) {
        return this.isPermissByFunName(this.projectId, funName)
      },
      // 更新设备
      async updateStatus () {
        try {
          this.operationBtn.updateLoading = true
          this.forbid = true
          await this.updateDeviceStatusBySingle({projectId: this.projectId, deviceId: [this.deviceId]})
          if (this.preUpdateTime === this.deviceDetailData.updateTime) {
            this.$confirm(`更新失败，设备的上次更新时间为<br/> <label style="color: #409EFF">${moment(this.preUpdateTime).format('YYYY-MM-DD, HH:mm:ss')}</label>`, '重新更新？', {
              dangerouslyUseHTMLString: true,
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.updateStatus(this.deviceId)
            }).catch(() => {
              this.$message({
                type: 'info',
                message: '重新更新已取消！'
              })
            })
          } else {
            this.$message({
              type: 'success',
              message: '指令发送成功!'
            })
          }
        } finally {
          this.operationBtn.updateLoading = false
          this.forbid = false
        }
      },
      // 开灯
      changeDeviceOn (deviceId) {
        let self = this
        this.$confirm('此操作将发送开灯指令, 是否继续?', '开灯', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            this.operationBtn.openLoading = true
            this.forbid = true
            await this.updateDeviceLevelBySingle({projectId: this.projectId, deviceId: [this.deviceId], type: 'open'})
            self.$message({
              type: 'success',
              message: '指令发送成功!'
            })
          } finally {
            this.operationBtn.openLoading = false
            this.forbid = false
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消指令发送!'
          })
        })
      },
      // 关灯
      changeDeviceOff (deviceId) {
        let self = this
        this.$confirm('此操作将发送关灯指令, 是否继续?', '关灯', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            this.operationBtn.closeLoading = true
            this.forbid = true
            await this.updateDeviceLevelBySingle({projectId: this.projectId, deviceId: [this.deviceId], type: 'close'})
            self.$message({
              type: 'success',
              message: '指令发送成功!'
            })
          } finally {
            this.operationBtn.closeLoading = false
            this.forbid = false
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消指令发送!'
          })
        })
      },
      // 单灯调光按钮
      async adjustLight () {
        try {
          this.operationBtn.adjustLoading = true
          this.forbid = true
          await this.updateDeviceLevelBySingle({projectId: this.projectId, deviceId: [this.deviceId], type: 'dimme', brightness: this.brightness})
          this.$message({
            type: 'success',
            message: '指令发送成功!'
          })
        } finally {
          this.operationBtn.adjustLoading = false
          this.forbid = false
        }
      },
      // 显示modal
      showModal (name) {
        this.modalName = name
        switch (name) {
          case 'moteStatus':
            this.modalTitle = '设备当前状态'
            break
          case 'moteInfo':
            this.modalTitle = '设备参数信息'
            break
          case 'moteStrategy':
            this.modalTitle = '当前策略'
            break
          case 'moteWarn':
            this.modalTitle = '告警信息'
            break
          case 'moteOperation':
            this.modalTitle = '操作记录'
            break
          case 'moteMonitor':
            this.modalTitle = '数据统计'
            break
        }
        this.innerVisible = true
      }
    }
  }
</script>

<style scoped lang='less'>
  /* 设备弹出详情 */
  .device-modal-list {
    overflow: hidden;
    padding-top: 15px;
  }
  .device-modal-item {
    float: left;
    width: 22%;
    height: 50px;
    line-height: 50px;
    text-align: center;
    border: 1px solid #ddd;
    margin: 0 15px 15px  0;
    &:hover {
      color: #409EFF;
      border-color: #409EFF;
    }
  }
  .device-modal-detail {
    border-top: 1px solid #ddd;
    padding-top: 15px;
    &:first-child {
      margin-top: -34px;
      border-top: none;
    }
    .title {
      font-size: 16px;
      border-left: 2px solid #ff9500;
      padding-left: 10px;
      line-height: 16px;
      height: 16px;
      span {
        float: right;
        color: #999;
        font-size: 12px;
        cursor: pointer;
        &:hover {
          color: #409EFF;
        }
      }
    }
    .summary {
      padding-left: 15px;
      overflow: hidden;
      font-size: 14px;
      li {
        float: left;
        list-style: none;
        margin-right: 20px;
        width: 150px;
        color: #999;
      }
      span {
        color: #666;
      }
    }
  }
</style>
