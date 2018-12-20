<template>
  <div class="device-map-wrap">
    <div class="device-map-left" id="deviceLeftBar">
      <div class="device-group-select">
        <label>当前分组：</label>
        <el-select v-model="groupId" placeholder="请选择" @change="selectGroup">
          <el-option
            key="0"
            label="全部"
            :value="''"
          ></el-option>
          <el-option
            v-for="item in groupList({projectId: projectId})"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div class="device-search-text">
        <el-input v-model="searchText" placeholder="关键字搜索" @change="searchTextFun" clearable></el-input>
      </div>
      <!-- 设备列表 -->
      <div class="device-list-wrap">
        <template v-if="deviceListData.length !==0">
          <div v-for="(item, index) in deviceListData" :lightNum="item.isOpen.length" @click="toggleDeviceId(item.id,item.lng,item.lat)" :key="index"
            class="device-list-item"
            :class="{ active: isActiveObj[item.id] }">
            <template v-if="item.isWarning">
              <i class="warn-lamp-ico"></i>
            </template>
            <template v-else-if="item.isOnline">
              <template v-if="item.isOpen">
                <i class="open-lamp-ico"></i>
              </template>
              <template v-else>
                <i class="close-lamp-ico"></i>
              </template>
            </template>
            <template v-else>
              <i class="offline-lamp-ico"></i>
            </template>
            {{item.name}}
          </div>
        </template>
        <template v-else>
          <i class="left-list-none"></i>
          <div class="left-list-none-text">暂无设备，<span @click="gotoAddDevice">前往添加</span></div>
        </template>
      </div>
      <!-- 分页 -->
      <el-pagination
        style="padding: 0"
        small
        layout="prev, pager, next"
        @current-change="handleCurrentChange"
        :page-size="pageSize"
        :total="deviceNum">
      </el-pagination>
      <!-- 监控图表 -->
      <div class="monitor-chart-wrap">
        <div class="monitor-device-total">当前接入运行路灯数量：{{deviceTotal}}盏</div>
        <ul class="monitor-chart-content">
          <li @click="showModalList('offline')">
            <el-tooltip class="item" effect="light" content="点击查看离线设备列表" placement="bottom">
              <div class="monitor-chart" id="online">
              </div>
            </el-tooltip>
            <div>
              <span>{{online}}</span>
              <span>在线</span>
            </div>
          </li>
          <li @click="showModalList('off')">
            <el-tooltip class="item" effect="light" content="点击查看灭灯设备列表" placement="bottom">
              <div class="monitor-chart" id="light"></div>
            </el-tooltip>
            <div>
              <span>{{light}}</span>
              <span>亮灯</span>
            </div>
          </li>
          <!-- <li>
            <div class="monitor-chart" id="error"></div>
            <div>
              <span>{{error}}</span>
              <span>异常</span>
            </div>
          </li> -->
        </ul>
      </div>
    </div>
    <div class="device-map-right">
      <div class="map-container" id="mapContainer">
        <!-- 详细信息 -->
        <div v-if="deviceTotal !== 0" class="map-detail-info">
          <!-- 二维码 -->
          <vue-qr :text="qrCode" :size="150" height="80" width="80" style="float: right;"></vue-qr>
          <ul>
            <li>
              <span>名称：</span>
              <span>{{deviceDetailData.name}}</span>
            </li>
            <li>
              <span>SN号：</span>
              <span>{{deviceDetailData.snHex}}</span>
            </li>
            <li>
              <span>信号强度：</span>
              <span v-if="deviceDetailData.signalIntensity === -1"><i class="signal-ico--1"></i></span>
              <span v-if="deviceDetailData.signalIntensity === 0"><i class="signal-ico-0"></i></span>
              <span v-if="deviceDetailData.signalIntensity === 1"><i class="signal-ico-1"></i></span>
              <span v-if="deviceDetailData.signalIntensity === 2"><i class="signal-ico-2"></i></span>
              <span v-if="deviceDetailData.signalIntensity === 3"><i class="signal-ico-3"></i></span>
              <span v-if="deviceDetailData.signalIntensity === 4"><i class="signal-ico-4"></i></span>
              <span v-if="deviceDetailData.signalIntensity === 5"><i class="signal-ico-5"></i></span>
            </li>
            <li>
              <span>电池状态：</span>
              <span><i :class="`electricity-ico-${cellIcon(deviceDetailData.chargeState, deviceDetailData.cellLevel)}`"></i></span>
            </li>
            <li>
              <span>开关状态：</span>
              <span>{{(deviceDetailData.isOpen && deviceDetailData.brightness !== 0)?'ON':'OFF'}}</span>
            </li>
            <li>
              <span>亮度：</span>
              <span>{{deviceDetailData.brightness}}%</span>
            </li>
            <li>
              <span>太阳能板电压：</span>
              <span>{{deviceDetailData.solarVoltage}}V</span>
            </li>
            <li>
              <span>太阳能板电流：</span>
              <span>{{deviceDetailData.solarCurrent}}A</span>
            </li>
            <li>
              <span>LED电压：</span>
              <span>{{deviceDetailData.ledVolt}}V</span>
            </li>
            <li>
              <span>LED电流：</span>
              <span>{{deviceDetailData.ledCurr}}A</span>
            </li>
            <li>
              <span>蓄电池电压：</span>
              <span>{{deviceDetailData.batteryVolt}}V</span>
            </li>
            <li>
              <span>蓄电池电流：</span>
              <span>{{deviceDetailData.batteryCurr}}A</span>
            </li>
            <li>
              <span>更新时间：</span>
              <span>{{deviceDetailData.updateTime | customTime}}</span>
            </li>
            <li>
              <span>更新状态：</span>
              <i style="color:#409EFF;font-size:22px;" :class="[!isUpdateLoad?'el-icon-circle-check':'el-icon-loading']"></i>
            </li>
            <li v-if="isPermiss('OPERAT_DEVICE_STATUS')">
              <el-button type="primary" size="mini" @click="updateStatus(deviceDetailData.id)">更新</el-button>
              <el-button type="primary" size="mini" @click="operationLamp('1')">开灯</el-button>
              <el-button type="primary" size="mini" @click="operationLamp('2')">关灯</el-button>
              <el-button type="primary" size="mini" @click="operationLamp('3')">调光</el-button>
              <!-- <el-dropdown
                size="mini"
                split-button
                type="primary"
                disabled
                @click="updateStatus(deviceDetailData.id)"
                @command="operationLamp">
                更新
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="1">开灯</el-dropdown-item>
                  <el-dropdown-item command="2">关灯</el-dropdown-item>
                  <el-dropdown-item command="3">调光</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown> -->
            </li>
          </ul>
        </div>
        <div class="toggle-device-list">
          <el-button v-if="isPermiss('MODIFY_DEVICE_INFOR') && deviceListData.length !== 0" icon="el-icon-location" @click="changePosition" type="primary">{{changeText}}</el-button>
          <el-button @click="goToList" type="primary">切换到列表模式</el-button>
        </div>
        <el-amap vid="amapInner"
          :zoom="zoom"
          :plugin="plugin"
          :center="center">
          <el-amap-marker
            v-for="(marker, index) in markers"
            :key="index"
            :animation="marker.animation"
            :position="marker.position"
            :template="marker.template"
            :title="marker.title"
            :offset="marker.offset"
            :draggable="draggable"
            :events="marker.events">
          </el-amap-marker>
        </el-amap>
        <!-- 图示 -->
        <div class="map-ico-explain">
          <div class="title">图示</div>
          <ul>
            <li>
              <i class="open-lamp-ico"></i> 亮灯设备
            </li>
            <li>
              <i class="close-lamp-ico"></i> 关灯设备
            </li>
            <li>
              <i class="offline-lamp-ico"></i> 离线设备
            </li>
            <li>
              <i class="warn-lamp-ico"></i> 告警设备
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!-- 设备列表过滤弹窗 -->
    <el-dialog :title="filterListTitle" :visible.sync="dialogTableVisible">
      <filterList @closeFilterModal="closeFilterModal" :deviceListType="deviceListType"></filterList>
    </el-dialog>
    <!-- 弹出层 -->
    <el-dialog title="设备详情" :visible.sync="outerVisible">
      <!-- 外层组件 -->
      <div class="device-modal-detail">
        <div class="title">
          设备状态
          <span @click="showModal('moteStatus')">更多></span>
        </div>
        <ul class="summary">
          <li>LED电压：<span>{{deviceDetailData.ledVolt}}</span></li>
          <li>LED电流：<span>{{deviceDetailData.ledCurr}}</span></li>
          <li>太阳能电压：<span>{{deviceDetailData.solarVoltage}}</span></li>
          <li>太阳能电流：<span>{{deviceDetailData.solarCurrent}}</span></li>
          <li>电池电压：<span>{{deviceDetailData.batteryVolt}}</span></li>
          <li>电池电流：<span>{{deviceDetailData.batteryCurr}}</span></li>
        </ul>
      </div>
      <div class="device-modal-detail">
        <div class="title">
          设备参数
          <span @click="showModal('moteInfo')">更多></span>
        </div>
        <ul class="summary">
          <li>LED额定电压：<span>{{deviceDetailData.ledVolt}}</span></li>
          <li>
            电池类型：
            <span v-if="deviceDetailData.batteryType===1">磷酸铁锂</span>
            <span v-if="deviceDetailData.batteryType===2">三元锂</span>
            <span v-if="deviceDetailData.batteryType===3">铅酸</span>
          </li>
        </ul>
      </div>
      <div class="device-modal-detail">
        <div class="title">
          更多信息
        </div>
        <div class="device-modal-list">
          <div @click="showModal('moteStrategy')" class="device-modal-item">当前策略</div>
          <div @click="showModal('moteMonitor')" class="device-modal-item">数据统计</div>
          <div @click="showModal('moteOperation')" class="device-modal-item">操作记录</div>
          <div @click="showModal('moteWarn')" class="device-modal-item">告警数据</div>
        </div>
      </div>
      <el-dialog
        width="500px"
        :title="modalTitle"
        :visible.sync="innerVisible"
        append-to-body>
        <!-- 内层组件 -->
        <component :id="deviceId" :is="modalName"></component>
      </el-dialog>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateStatus(deviceId)">更新</el-button>
        <el-button @click="changeDeviceOn(deviceId)">打开</el-button>
        <el-button @click="changeDeviceOff(deviceId)">关闭</el-button>
        <el-button @click="adjustLightBtn">调光</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="调光"
      :visible.sync="dialogBrightness"
      width="30%">
      <div class="block">
        <el-slider
          v-model="brightness"
          show-input>
        </el-slider>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogBrightness = false">取 消</el-button>
        <el-button type="primary" @click="adjustLight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import moteStatus from './modal/moteStatus'
  import moteInfo from './modal/moteInfo'
  import moteStrategy from './modal/moteStrategy'
  import moteWarn from './modal/moteWarn'
  import moteOperation from './modal/moteOperation'
  import moteMonitor from './modal/moteMonitor'
  import filterList from './deviceTable/filterList'
  import VueQr from 'vue-qr'

  import moment from 'moment'
  import { monitorChart } from '../../utils/monitorChart'
  import { getCurrentTime } from '../../utils/time'
  import { Loading } from 'element-ui'
  import { mapGetters, mapActions } from 'vuex'
  export default {
    components: {
      filterList,
      moteStatus,
      moteInfo,
      moteStrategy,
      moteWarn,
      moteOperation,
      moteMonitor,
      VueQr
    },
    data () {
      return {
        // 地图
        zoom: 15,
        center: [0, 0],
        // 亮度
        brightness: 0,
        // 选中的设备ID
        deviceId: '',
        // 亮度弹出层
        dialogBrightness: false,
        // 设备弹出基本数据
        deviceDetailData: {},
        // modal组件
        modalName: 'moteStatus',
        // 弹出层
        modalTitle: '设备当前状态',
        outerVisible: false,
        innerVisible: false,
        // 过滤列表
        dialogTableVisible: false,
        deviceListType: '',
        filterListTitle: '',
        // 列表选中
        classActive: 0,
        isActiveObj: {},
        otherIsActiveObj: {},
        // 分页
        currentPage: 1,
        pageSize: 10,
        // 筛选
        groupId: '',
        searchText: '',
        // 设备更新提示
        isUpdateLoad: false,
        // 亮度数
        linghtNum: 0,
        draggable: false,
        changeText: '更改坐标',
        plugin: [{
          // pName为必填字段
          pName: 'MapType',
          defaultType: 0
        }]
      }
    },
    computed: {
      ...mapGetters([
        'deviceList',
        'groupList',
        'statisticCount',
        'device',
        'strategyInDevice',
        'logList',
        'isPermissByFunName'
      ]),
      // 项目ID
      projectId () {
        return this.$route.params.projectId || sessionStorage.getItem('projectId')
      },
      deviceNum () {
        return this.deviceList({projectId: this.projectId, isDisable: false, groupId: this.groupId, name: this.searchText}).length
      },
      deviceTotal () {
        return this.deviceList({projectId: this.projectId, isDisable: false}).length
      },
      // 设备分页列表
      deviceListData () {
        let start = (this.currentPage - 1) * this.pageSize
        let end = start + this.pageSize
        let deviceListDataSrc = this.deviceList({projectId: this.projectId, groupId: this.groupId, name: this.searchText, isDisable: false})
        return deviceListDataSrc.slice(start, end)
      },
      // 统计数据
      all () {
        return this.statisticCount({projectId: this.projectId}).all
      },
      online () {
        return this.statisticCount({projectId: this.projectId}).online
      },
      light () {
        // return this.statisticCount({projectId: this.projectId}).light
        return this.linghtNum
      },
      markers () {
        let self = this
        let markers = []
        let className = ''
        let num = 0
        const isActiveObj = Object.assign({}, this.isActiveObj)
        this.deviceList({projectId: this.projectId, isDisable: false}).forEach(function (item, index) {
          if (item.isWarning) {
            className = 'warn-lamp-ico'
          } else if (item.isOnline) {
            if (item.isOpen) {
              className = 'open-lamp-ico'
              num++
            } else {
              className = 'close-lamp-ico'
            }
          } else {
            className = 'offline-lamp-ico'
          }
          markers.push({
            position: [item.lng, item.lat],
            template: `<i class="${className}"></i>`,
            animation: isActiveObj[item.id] ? 'AMAP_ANIMATION_BOUNCE' : 'AMAP_ANIMATION_NONE',
            title: item.name,
            offset: [-16, -16], // 相对于基点的偏移位置
            events: {
              click () {
                // 地图点击
                self.toggleDeviceId(item.id, item.lng, item.lat)
              },
              dragend (e) {
                self.updateDeviceInfo(item.id, item.name, e.lnglat.lng, e.lnglat.lat)
              }
            }
          })
        })
        this.linghtNum = num
        return markers
      },
      onlinePercentage () {
        let all = Number(this.statisticCount({projectId: this.projectId}).all) || 1
        let online = Number(this.statisticCount({projectId: this.projectId}).online)
        return Math.floor((online / all) * 100)
      },
      lightePercentage () {
        let all = Number(this.statisticCount({projectId: this.projectId}).all) || 1
        // let light = Number(this.statisticCount({projectId: this.projectId}).light)

        return Math.floor((this.linghtNum / all) * 100)
      },
      onlineData () {
        let all = Number(this.statisticCount({projectId: this.projectId}).all) || 1
        let online = Number(this.statisticCount({projectId: this.projectId}).online)
        return [
          { item: '离线', count: all - online },
          { item: '在线', count: online }
        ]
      },
      lightData () {
        let all = Number(this.statisticCount({projectId: this.projectId}).all) || 1
        let light = this.light
        return [
          { item: '灭灯', count: all - light },
          { item: '亮灯', count: light }
        ]
      },
      qrCode () {
        return (this.deviceDetailData.snHex + ',' + this.deviceDetailData.pnHex)
      }
    },
    watch: {
      projectId () {
        this.draggable = false
        try {
          let list = this.deviceList({projectId: this.projectId, groupId: this.groupId, name: this.searchText, isDisable: false})
          if (list.length !== 0) {
            this.deviceDetailData = this.device(list[0].id)
          }
          // 初始化数据
          this.groupId = ''
          this.searchText = ''
          this.classActive = 0
          this.currentPage = 1
          this.initBaseArg()
          this.totalMonitor()
        } finally {
        }
      }
    },
    methods: {
      ...mapActions([
        // 弹出层
        'getStrategyInDevice',
        'getWarningList',
        'getDeviceList',
        'getLogList',
        'getStatisticStatus',
        'getDevice',
        // 指令-更新设备状态
        'updateDeviceStatus',
        // 指令-开、关、调光
        'updateDeviceLevel',
        'getProject',
        'updateDevice'
      ]),
      // 依据功能名称判断是否有权限
      isPermiss (funName) {
        return this.isPermissByFunName(this.projectId, funName)
      },
      // 前往添加设备界面
      gotoAddDevice () {
        this.$router.push({name: 'project'})
      },
      // 设备过滤模态框
      showModalList (type) {
        if (type === 'offline') this.filterListTitle = '离线设备列表'
        if (type === 'off') this.filterListTitle = '灭灯设备列表'
        this.deviceListType = type
        this.dialogTableVisible = true
      },
      // 设备中心选择设备
      toggleDeviceId (id, lng, lat) {
        this.center = [lng, lat]
        this.deviceId = id
        this.zoom = 15
        this.isActiveObj = {}
        this.isActiveObj[id] = true
        this.deviceDetailData = this.device(id)
      },
      // 根据分组筛选设备列表
      selectGroup () {
        this.searchText = ''
      },
      // 关键字收搜
      searchTextFun () {
        this.groupId = ''
      },
      goToList () {
        this.$router.push({ name: 'deviceList' })
      },
      // 当前分页
      handleCurrentChange (val) {
        this.classActive = 0
        this.currentPage = val
      },
      formatTime (x) {
        return moment(x).format('YYYY-MM-DD HH:mm:ss')
      },
      deviceDetailInfo (id) {
        this.getStatisticStatus({deviceId: id, date: getCurrentTime()})
        // this.getDevice({deviceId: id})
        // this.getLogList({deviceId: id, currentPage: 1})
        // this.getStrategyInDevice({deviceId: id})
        // this.getWarningList({projectId: this.projectId, deviceId: id})
      },
      // 操作路灯
      operationLamp (command) {
        switch (command) {
          // 开灯
          case '1':
            this.changeDeviceOn(this.deviceDetailData.id)
            break
          // 关灯
          case '2':
            this.changeDeviceOff(this.deviceDetailData.id)
            break
          // 调光
          case '3':
            this.adjustLightBtn()
            break
        }
      },
      // 更新设备
      updateStatus (deviceId) {
        this.updateStatusFun(deviceId)
      },
      async updateStatusFun (deviceId) {
        try {
          this.isUpdateLoad = true
          if (arguments.length === 0) {
            await this.updateDeviceStatus({projectId: this.projectId, deviceId: this.deviceListSelected})
          } else {
            await this.updateDeviceStatus({projectId: this.projectId, deviceId: [deviceId]})
          }
          this.isUpdateLoad = false
          this.deviceDetailData = this.device(deviceId)
          this.totalMonitor()
          this.$message({
            type: 'success',
            message: '指令发送成功!'
          })
        } catch (e) {
          this.isUpdateLoad = false
        }
      },
      // 单灯开
      changeDeviceOn (deviceId) {
        this.$confirm('此操作将发送开灯指令, 是否继续?', '开灯', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.changeDeviceOnFun(deviceId)
          this.outerVisible = false
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消指令发送!'
          })
        })
      },
      async changeDeviceOnFun (deviceId) {
        try {
          this.isUpdateLoad = true
          if (arguments.length === 0) {
            await this.updateDeviceLevel({projectId: this.projectId, deviceId: this.deviceListSelected, type: 'open'})
          } else {
            await this.updateDeviceLevel({projectId: this.projectId, deviceId: [deviceId], type: 'open'})
          }
          this.isUpdateLoad = false
          this.deviceDetailData = this.device(deviceId)
          this.totalMonitor()
          this.$message({
            type: 'success',
            message: '指令发送成功!'
          })
        } catch (e) {
          this.isUpdateLoad = false
        }
      },
      // 关灯
      changeDeviceOff (deviceId) {
        this.$confirm('此操作将发送关灯指令, 是否继续?', '关灯', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.changeDeviceOffFun(deviceId)
          this.outerVisible = false
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消指令发送!'
          })
        })
      },
      // 关灯请求
      async changeDeviceOffFun (deviceId) {
        try {
          this.isUpdateLoad = true
          if (arguments.length === 0) {
            await this.updateDeviceLevel({projectId: this.projectId, deviceId: this.deviceListSelected, type: 'close'})
          } else {
            await this.updateDeviceLevel({projectId: this.projectId, deviceId: [deviceId], type: 'close'})
          }
          this.isUpdateLoad = false
          this.deviceDetailData = this.device(deviceId)
          this.totalMonitor()
          this.$message({
            type: 'success',
            message: '指令发送成功!'
          })
        } catch (e) {
          this.isUpdateLoad = false
        }
      },
      // 单灯调光按钮
      adjustLightBtn () {
        this.dialogBrightness = true
      },
      async adjustLight () {
        try {
          this.isUpdateLoad = true
          await this.updateDeviceLevel({projectId: this.projectId, deviceId: [this.deviceId], type: 'dimme', brightness: this.brightness})
          this.isUpdateLoad = false
          this.deviceDetailData = this.device(this.deviceId)
          this.totalMonitor()
          this.$message({
            type: 'success',
            message: '指令发送成功!'
          })
        } catch (e) {
          this.isUpdateLoad = false
        }
        this.outerVisible = false
        this.dialogBrightness = false
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
      },
      totalMonitor () {
        // 饼图
        try {
          document.getElementById('online').innerHTML = ''
          document.getElementById('light').innerHTML = ''
          monitorChart(this.onlineData, 'online', this.onlinePercentage)
          monitorChart(this.lightData, 'light', this.lightePercentage)
        } finally {}
      },
      closeFilterModal () {
        this.dialogTableVisible = false
      },
      initBaseArg () {
        if (this.deviceListData.length === 0) {
          this.deviceId = ''
        } else {
          let firstDevice = this.deviceListData[0]
          this.deviceId = firstDevice.id
          this.center = [firstDevice.lng, firstDevice.lat]
          this.isActiveObj = {}
          this.isActiveObj[firstDevice.id] = true
        }
      },
      // 计算电池图标
      cellIcon (chargeState, cellLevel) {
        let state = ''
        if (chargeState === 1 || chargeState === 5) {
          state = 1
        } else if (chargeState === 2) {
          state = 2
        } else {
          state = 0
        }
        return `${state}-${cellLevel}`
      },
      // 改变状态
      changePosition () {
        this.draggable = !this.draggable
        this.changeText = this.draggable ? '取消' : '更改坐标'
        if (this.draggable) {
          this.$notify({
            type: 'success',
            title: '成功',
            message: '拖动地图中的设备进行位置更改！'
          })
        }
      },
      // 二次确认
      async updateDeviceInfo (id, name, lng, lat) {
        let message = `此操作将更改设备 <label style="color:red;">${name}</label> 的位置, 是否继续?`
        this.$confirm(message, '提示', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.updateDeviceLocation(id, name, lng, lat)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      // 更新项目位置信息
      async updateDeviceLocation (id, name, lng, lat) {
        let loadingInstance = Loading.service({ background: 'rgba(0, 0, 0, 0.0)', fullscreen: true })
        try {
          await this.updateDevice({ id, name, lng, lat })
          this.$notify({
            type: 'success',
            title: '成功',
            message: '保存成功！'
          })
        } catch (e) {
        } finally {
          loadingInstance.close()
        }
      }
    },
    mounted () {
      this.totalMonitor()
      this.initBaseArg()
      // 重新调取项目接口
      this.$nextTick(function () {
        this.getProject({projectId: this.projectId})
      })
    },
    activated () {
      this.totalMonitor()
    },
    created () {
      let list = this.deviceList({projectId: this.projectId, groupId: this.groupId, name: this.searchText, isDisable: false})
      if (list.length !== 0) {
        this.deviceDetailData = this.device(list[0].id)
      }
    }
  }
</script>
<style lang='less'>
/* 暂不加scoped，因为地图图标会没掉*/
.device-map-wrap {
  overflow: hidden;
}
/* 左侧区域 */
.device-map-left {
  border: 1px solid #ddd;
  border-top: 0;
  float: left;
  width: 262px;
  height: 786px;
  position: relative;
}
.device-group-select {
  padding: 10px 20px;
  label {
    font-size: 16px;
    line-height: 40px;
  }
}
.device-search-text {
  padding: 0 20px;
}
.device-list-wrap {
  /* overflow-y: scroll;
  overflow-x: hidden; */
  padding: 10px 20px;
  height: 320px;
  .active {
    color: #409EFF;
  }
}
.device-list-item {
  cursor: pointer;
  color: #666;
  font-size: 16px;
  line-height: 30px;
  height: 30px;
  /* padding-left: 30px; */
  width: 220px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* background: url(../../assets/images/device_ico.png) no-repeat 0 center; background-size: 20px; */
  i {
    float: left;
    margin-right: 6px;
    margin-top: 6px;
  }
}
/* 右侧内容区 */
.device-map-right {
  padding-left: 262px;
}
.map-container {
  margin-left: 15px;
  margin-top: 15px;
  border: 1px solid #ddd;
  height: 770px;
  position: relative;
  /* 设备详情 */
  .map-detail-info {
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    padding: 1px;
    background: rgba(255, 255, 255, .9);
    ul {
      padding:0 20px;
    }
    li {
      list-style: none;
      line-height: 24px;
      color: #999;
    }
  }
}
/* 图示 */
.map-container .map-ico-explain {
  padding: 10px 15px 5px;
  background: #fff;
  position: absolute;
  bottom: 60px;
  right: 50px;
  width: 110px;
  color: #999;
  ul {
    padding: 0;
    li {
      list-style-type: none;
      line-height: 18px;
      height: 18px;
      margin-bottom: 10px;
    }
    i {
      margin-right: 6px;
      float: left;
    }
  }
  .title {
    border-left: 2px solid rgb(235, 169, 83);
    padding-left: 10px;
    height: 18px;
    line-height: 18px;
  }
}
.toggle-device-list {
  position: absolute;
  top: 30px;
  right: 80px;
  z-index: 99;
}
/* 左侧监控图表 */
.monitor-chart-wrap {
  position: absolute;
  left: 0;
  bottom: 0;
  .monitor-chart {
    position: relative;
  }
  .monitor-chart:after {
    content: '';
    width: 120px;
    height: 120px;
    position: absolute;
    top: 0;
    left: 0;
  }
}
.monitor-device-total {
  line-height: 32px;
  padding-left: 20px;
  width: 260px;
  background: rgb(64, 162, 243);
  color: #fff;
}
.monitor-chart-content {
  background: #fff;
  margin: 5px 0;
  padding-left: 0;
  overflow: hidden;
  li {
    text-align: center;
    list-style: none;
    float: left;
    width: 120px;
    height: 150px;
    cursor: pointer;
    span {
      display: block;
    }
  }
}
/* 基础图标配置 */
.baseConfig {
  width: 18px;
  height: 18px;
  display: inline-block;
}//先清除开始
/* 地图图标 */
.open-lamp-ico {
  .baseConfig;
 /* background: url(../../assets/images/icon_entity_on.png);*/
}
.close-lamp-ico {
  .baseConfig;
 /* background: url(../../assets/images/icon_entity_off.png);*/
}
.warn-lamp-ico {
  .baseConfig;
 /* background: url(../../assets/images/icon_entity_error.png);*/
}
.offline-lamp-ico {
  .baseConfig;
 /* background: url(../../assets/images/icon_entity_offline.png);*/
}
/* 基础图标样式 */
.baseIcon {
  background-size: 19px 14px;
  display: inline-block;
  width: 19px;
  height: 14px;
}
/*设备详情信号强度*/
.signal-ico--1 {
  /*background: url(../../assets/images/signal_ico_-1.png);*/
  .baseIcon;
}
.signal-ico-0 {
  /*background: url(../../assets/images/signal_ico_0.png);*/
  .baseIcon;
}
.signal-ico-1 {
  /*background: url(../../assets/images/signal_ico_1.png);*/
  .baseIcon;
}
.signal-ico-2 {
 /* background: url(../../assets/images/signal_ico_2.png);*/
  .baseIcon;
}
.signal-ico-3 {
 /* background: url(../../assets/images/signal_ico_3.png);*/
  .baseIcon;
}
.signal-ico-4 {
  /*background: url(../../assets/images/signal_ico_4.png);*/
  .baseIcon;
}
.signal-ico-5 {
 /* background: url(../../assets/images/signal_ico_5.png);*/
  .baseIcon;
}
//结束
/* 设备弹出详情 */
/* .device-modal-list{
  overflow: hidden;
  padding-top: 15px;
}
.device-modal-item {
  cursor: pointer;
  float: left;
  width: 22%;
  height: 50px;
  line-height: 50px;
  text-align: center;
  border: 1px solid #ddd;
  margin: 0 15px 15px  0;
}
.device-modal-item:hover {
  color: #409EFF;
  border-color: #409EFF;

}
.device-modal-detail .title{
  font-size: 16px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 15px;
}
.device-modal-detail .title span{
  float: right;
  font-size: 12px;
  cursor: pointer;
}
.device-modal-detail .title span:hover{
  color: #409EFF;
}
.device-modal-detail .summary{
  overflow: hidden;
  font-size: 14px;
}
.device-modal-detail .summary li{
  float: left;
  margin-right: 20px;
  width: 180px;
} */
/* 左侧列表无数据 */
.left-list-none {
  background: url(../../assets/images/none_data_img.png) no-repeat center;
  background-size: 60%;
  display: block;
  margin: 30px auto 0;
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
/* 电池状态图标 */
.cellIconBase {
  display: inline-block;
  width: 30px;
  height: 16px;
  background-repeat: no-repeat;
}
//开始
.electricity-ico-0-0 {
  /*background: url(../../assets/images/electricity/electricity-0-0.png);*/
  .cellIconBase;
}
.electricity-ico-0-1 {
  /*background: url(../../assets/images/electricity/electricity-0-1.png);*/
  .cellIconBase;
}
.electricity-ico-0-2 {
  /*background: url(../../assets/images/electricity/electricity-0-2.png);*/
  .cellIconBase;
}
.electricity-ico-0-3 {
 /* background: url(../../assets/images/electricity/electricity-0-3.png);*/
  .cellIconBase;
}
.electricity-ico-0-4 {
  /*background: url(../../assets/images/electricity/electricity-0-4.png);*/
  .cellIconBase;
}
.electricity-ico-1-0 {
  /*background: url(../../assets/images/electricity/electricity-1-0.png);*/
  .cellIconBase;
}
.electricity-ico-1-1 {
 /* background: url(../../assets/images/electricity/electricity-1-1.png);*/
  .cellIconBase;
}
.electricity-ico-1-2 {
  /*background: url(../../assets/images/electricity/electricity-1-2.png);*/
  .cellIconBase;
}
.electricity-ico-1-3 {
 /* background: url(../../assets/images/electricity/electricity-1-3.png);*/
  .cellIconBase;
}
.electricity-ico-1-4 {
 /* background: url(../../assets/images/electricity/electricity-1-4.png);*/
  .cellIconBase;
}
.electricity-ico-2-0 {
 /* background: url(../../assets/images/electricity/electricity-2-0.png);*/
  .cellIconBase;
}
.electricity-ico-2-1 {
 /* background: url(../../assets/images/electricity/electricity-2-1.png);*/
  .cellIconBase;
}
.electricity-ico-2-2 {
  /*background: url(../../assets/images/electricity/electricity-2-2.png);*/
  .cellIconBase;
}
.electricity-ico-2-3 {
 /* background: url(../../assets/images/electricity/electricity-2-3.png);*/
  .cellIconBase;
}
.electricity-ico-2-4 {
  /*background: url(../../assets/images/electricity/electricity-2-4.png);*/
  .cellIconBase;
}
.electricity-ico-0-0 {
  /*background: url(../../assets/images/electricity/electricity-0-0.png);*/
  .cellIconBase;
}
</style>




// WEBPACK FOOTER //
// src/views/device/map.vue
