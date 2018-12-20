<template>
  <div class="device-map-wrap">
    <div class="device-map-left">
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
          <div v-for="(item, index) in deviceListData"
            @click="toggleDeviceId(item,index)"
            :key="index" class="device-list-item"
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
      <div class="map-container">
        <div class="monitor-wrap">
          <div class="monitor-toggle-btn">
            <a @click="showItem1" :class="{active: item1}">统计数据da</a>
            <a @click="showItem2" :class="{active: item2}">历史数据统计?</a>
          </div>
          <div class="monitor-toggle-content">
            <div class="monitor-toggle-item" :class="{ active: item1}">
              <!-- 时间选择器 -->
              <div class="block">
                <span class="demonstration">选择时间：</span>
                <el-date-picker
                  @change="restartMonitorSingle"
                  v-model="time1"
                  value-format="yyyy-MM-dd"
                  :clearable="false"
                  :editable="false"
                  :picker-options="pickerOptions"
                  type="date"
                  placeholder="选择日期">
                </el-date-picker>
              </div>
              <div class="subTitle" v-if="sunup !== ''">日出: {{sunup}} 日落: {{sunset}}</div>
              <!-- 图表外层 -->
              <ul class="chart-wrap">
                <li class="chart-content">
                  <div class="title">太阳能板</div>
                  <div v-loading="loading" class="monitor-bg" id="c1"></div>
                </li>
                <li class="chart-content">
                  <div class="title">LED灯</div>
                  <div v-loading="loading" class="monitor-bg" id="c2"></div>
                </li>
                <li class="chart-content">
                  <div class="title">蓄电池</div>
                  <div v-loading="loading" class="monitor-bg" id="c3"></div>
                </li>
                <!-- 设备当前状态 -->
                <li class="chart-content">
                  <div class="title">设备当前状态</div>
                  <div class="current-status-wrap">
                    <!-- 设备当前状态item -->
                    <div class="current-status-item">
                      <div class="sub-title">太阳能板</div>
                      <div v-loading="loading" class="current-monitor" id="solarMonitor"></div>
                      <div class="current-power-text">
                        <span>功率</span>
                        <span>{{StrToFixeds(deviceDetailData.solarVoltage * deviceDetailData.solarCurrent)}}W</span>
                      </div>
                      <div class="current-text">
                        <span>电压：</span>
                        <span>{{StrToFixeds(deviceDetailData.solarVoltage)}}V</span>
                      </div>
                      <div class="current-text">
                        <span>电流：</span>
                        <span>{{StrToFixeds(deviceDetailData.solarCurrent)}}A</span>
                      </div>
                    </div>
                    <!-- 设备当前状态item -->
                    <div class="current-status-item">
                      <div class="sub-title">LED灯</div>
                      <div v-loading="loading" class="current-monitor" id="LEDMonitor"></div>
                      <div class="current-power-text">
                        <span>功率</span>
                        <span>{{StrToFixeds(deviceDetailData.ledVolt * deviceDetailData.ledCurr)}}W</span>
                      </div>
                      <div class="current-text">
                        <span>电压：</span>
                        <span>{{StrToFixeds(deviceDetailData.ledVolt)}}V</span>
                      </div>
                      <div class="current-text">
                        <span>电流：</span>
                        <span>{{StrToFixeds(deviceDetailData.ledCurr)}}A</span>
                      </div>
                    </div>
                    <!-- 设备当前状态item -->
                    <div class="current-status-item">
                      <div class="sub-title">蓄电池</div>
                      <div v-loading="loading" class="current-monitor" id="batteryMonitor"></div>
                      <div class="current-power-text">
                        <span>功率</span>
                        <span>{{StrToFixeds(deviceDetailData.batteryVolt * deviceDetailData.batteryCurr)}}W</span>
                      </div>
                      <div class="current-text">
                        <span>电压：</span>
                        <span>{{StrToFixeds(deviceDetailData.batteryVolt)}}V</span>
                      </div>
                      <div class="current-text">
                        <span>电流：</span>
                        <span>{{StrToFixeds(deviceDetailData.batteryCurr)}}A</span>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div class="monitor-toggle-item" :class="{active: item2}">
              <!-- 时间选择器 -->
              <div class="block">
                <span>选择日期：</span>
                <el-date-picker
                  @change="restartMonitorHistory"
                  v-model="startTime"
                  align="right"
                  type="date"
                  placeholder="起始日期"
                  value-format="yyyy-MM-dd"
                  :clearable="false"
                  :editable="false"
                  :picker-options="pickerOptions">
                </el-date-picker>
                 &nbsp;至&nbsp;
                <el-date-picker
                  @change="restartMonitorHistory"
                  v-model="endTime"
                  align="right"
                  type="date"
                  placeholder="结束日期"
                  value-format="yyyy-MM-dd"
                  :clearable="false"
                  :editable="false"
                  :picker-options="pickerOptions">
                </el-date-picker>
              </div>
              <!-- 图表外层 -->
              <ul class="chart-wrap">
                <li class="chart-content">
                  <div class="title">历史发电与充电量</div>
                  <div v-loading="loading" class="monitor-bg" id="c4"></div>
                </li>
                <li class="chart-wrap">
                  <div class="title">历史亮灯时长</div>
                  <div v-loading="loading" class="monitor-bg" id="c5"></div>
                </li>
              </ul>
              <!-- 按月统计 -->
              <!-- <div>
                <span>按月统计：</span>
                <el-date-picker
                  @change="restartMonitorMonth"
                  v-model="monthTime"
                  align="right"
                  type="month"
                  placeholder="起始日期"
                  :clearable="false"
                  :editable="false">
                </el-date-picker>
              </div>
              <ul class="chart-wrap">
                <li class="chart-content">
                  <div class="title">按月统计天气情况</div>
                  <div v-loading="loading" class="monitor-bg" id="c6"></div>
                </li>
              </ul> -->
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 设备列表过滤弹窗 -->
    <el-dialog :title="filterListTitle" :visible.sync="dialogTableVisible">
      <filterList v-on:closeFilterModal="closeFilterModal" :deviceListType="deviceListType"></filterList>
    </el-dialog>
  </div>
</template>

<script>
  import { monitorChart, monitorChart1, monitorChart2, instrumentMonitor } from '../../utils/monitorChart'
  import { getCurrentTime, getPreWeekTime, getSunRiseTimeAndSunDownTime, getYesterdayTime } from '../../utils/time'
  import { StrToFixed } from '../../utils/string'
  import { mapGetters, mapActions } from 'vuex'
  import filterList from '../device/deviceTable/filterList'
  import weatherAreaCode from '../../utils/weather_area_station_simple'

  export default {
    components: {
      filterList
    },
    data () {
      return {
        loading: false,
        // 过滤列表
        dialogTableVisible: false,
        deviceListType: '',
        filterListTitle: '',
        // 选中样式
        classActive: 0,
        isActiveObj: {},
        // 设备ID
        deviceId: '',
        // 面板切换
        item1: true,
        item2: false,
        // 时间选择器
        startTime: '',
        endTime: '',
        monthTime: '',
        time1: '',
        pickerOptions: {
          disabledDate (time) {
            return time.getTime() > Date.now()
          },
          shortcuts: [{
            text: '今天',
            onClick (picker) {
              picker.$emit('pick', new Date())
            }
          }, {
            text: '昨天',
            onClick (picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', date)
            }
          }, {
            text: '一周前',
            onClick (picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', date)
            }
          }]
        },
        // 分页
        currentPage: 1,
        pageSize: 10,
        // 筛选
        groupId: '',
        longitude: '',
        latitude: '',
        searchText: '',
        // 日出
        sunup: '',
        // 日落
        sunset: '',
        monthWeather: {},
        adCode: '',
        weatherCode: ''
      }
    },
    computed: {
      ...mapGetters([
        'device',
        'deviceList',
        'groupList',
        'statisticCount',
        'statisticStatus',
        'statisticCharge',
        'statisticLighting',
        'project'
      ]),
      // 设备详情
      deviceDetailData () {
        return this.device(this.deviceId)
      },
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
        return this.statisticCount({projectId: this.projectId}).light
      },
      onlinePercentage () {
        let all = Number(this.statisticCount({projectId: this.projectId}).all) || 1
        let online = Number(this.statisticCount({projectId: this.projectId}).online)
        return Math.floor((online / all) * 100)
      },
      lightePercentage () {
        let all = Number(this.statisticCount({projectId: this.projectId}).all) || 1
        let light = Number(this.statisticCount({projectId: this.projectId}).light)
        return Math.floor((light / all) * 100)
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
        let light = Number(this.statisticCount({projectId: this.projectId}).light)
        return [
          { item: '灭灯', count: all - light },
          { item: '亮灯', count: light }
        ]
      }
    },
    watch: {
      projectId () {
        // 初始化数据
        this.groupId = ''
        this.searchText = ''
        this.classActive = 0
        this.currentPage = 1
        this.time1 = getCurrentTime()
        this.initBaseArg()
        // this.totalMonitor()
        this.getAdCode()
        this.startTime = getPreWeekTime()
        this.endTime = getCurrentTime()
        if (this.deviceId !== '') {
          this.renderMonitorSingle(this.deviceId, this.time1)
          this.renderMonitorHistory(this.deviceId, this.startTime, this.endTime)
          this.renderMonitorWeather(this.deviceId, this.monthTime)
        }
      },
      $route () {
        if (this.$route.path.indexOf('monitor') !== -1) {
          this.searchText = this.$route.query.searchText || ''
          if (!this.$route.query.deviceId || !this.deviceListData) {
            this.deviceId = ''
          } else {
            this.deviceId = this.$route.query.deviceId || this.deviceListData[0].id
          }
          this.initBaseArg()
          this.totalMonitor()
          if (this.deviceId !== '') {
            this.renderMonitorSingle(this.deviceId, this.time1)
            this.renderMonitorHistory(this.deviceId, this.startTime, this.endTime)
          } else {
            this.sunup = ''
          }
        }
      }
    },
    methods: {
      ...mapActions([
        'getDeviceList',
        'getStatisticStatus',
        'getStatisticCharge',
        'getStatisticLighting'
      ]),
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
      // 根据分组筛选设备列表
      selectGroup () {
        this.searchText = ''
      },
      // 关键字搜索
      searchTextFun () {
        this.groupId = ''
      },
      // 当前分页
      handleCurrentChange (val) {
        // this.classActive = 0
        this.currentPage = val
        // this.deviceId = this.deviceListData[0].id
        // this.renderMonitorSingle(this.deviceId, this.time1)
        // this.renderMonitorHistory(this.deviceId, this.startTime, this.endTime)
      },
      showItem1 () {
        this.item1 = true
        this.item2 = false
      },
      showItem2 () {
        this.item1 = false
        this.item2 = true
        this.getAdCode()
      },
      handleClick (tab, event) {
        // console.log(tab, event)
      },
      // 选择设备
      toggleDeviceId (item, index) {
        this.deviceId = item.id
        this.isActiveObj = {}
        this.isActiveObj[item.id] = true
        this.latitude = item.lat
        this.longitude = item.lng
        this.renderMonitorSingle(this.deviceId, this.time1)
        this.renderMonitorHistory(this.deviceId, this.startTime, this.endTime)
        this.renderMonitorWeather(this.deviceId, this.monthTime)
      },
      // 重新渲染统计数据
      restartMonitorSingle () {
        this.renderMonitorSingle(this.deviceId, this.time1)
      },
      restartMonitorHistory () {
        this.renderMonitorHistory(this.deviceId, this.startTime, this.endTime)
      },
      restartMonitorMonth () {
        this.renderMonitorWeather(this.deviceId, this.monthTime)
      },
      totalMonitor () {
        // 饼图
        document.getElementById('online').innerHTML = ''
        document.getElementById('light').innerHTML = ''
        monitorChart(this.onlineData, 'online', this.onlinePercentage)
        monitorChart(this.lightData, 'light', this.lightePercentage)
      },
      async renderMonitorSingle (deviceId, date) {
        let sunInfo = getSunRiseTimeAndSunDownTime(date, this.longitude, this.latitude)
        this.sunup = sunInfo.sunRiseTime
        this.sunset = sunInfo.sunDownTime
        if (this.deviceId === '') this.sunup = ''
        this.loading = true
        try {
          await this.getStatisticStatus({deviceId: deviceId, date: date})
          let currentData = this.statisticStatus({deviceId: deviceId, date: date})
          document.getElementById('c1').innerHTML = ''
          document.getElementById('c2').innerHTML = ''
          document.getElementById('c3').innerHTML = ''
          document.getElementById('solarMonitor').innerHTML = ''
          document.getElementById('LEDMonitor').innerHTML = ''
          document.getElementById('batteryMonitor').innerHTML = ''
          if (currentData.length !== 0) {
            // 数据统计-太阳能板
            let solarData = []
            currentData.forEach((item) => {
              solarData.push({time: item.time, 电压: item.solarVoltage, 电流: item.solarCurrent, 功率: item.solarPower})
            })
            // 数据统计-LED
            let LEDData = []
            currentData.forEach((item) => {
              LEDData.push({time: item.time, 电压: item.ledVoltage, 电流: item.ledCurrent, 功率: item.ledPower, 亮度: item.brightness})
            })
            // 数据统计-蓄电池
            let batteryData = []
            currentData.forEach((item) => {
              // 剩余电量因为不准确，暂时去掉
              // batteryData.push({time: item.time, 电压: item.batteryVolt, 电流: item.batteryCurr, 功率: item.batteryPower, 充电量: item.cellCharge, 放电量: item.cellDischarge, 剩余电量: item.cellResidue, 环境温度: item.temperatures, 信号值: item.signalValue})
              batteryData.push({time: item.time, 电压: item.batteryVolt, 电流: item.batteryCurr, 功率: item.batteryPower, 充电量: item.cellCharge, 放电量: item.cellDischarge, 环境温度: item.temperatures, 信号值: item.signalValue})
            })
            monitorChart1('c1', solarData, [ '电压', '电流', '功率' ])
            monitorChart1('c2', LEDData, [ '电压', '电流', '功率', '亮度' ])
            // 剩余电量因为不准确，暂时去掉
            // monitorChart1('c3', batteryData, ['电压', '电流', '功率', '充电量', '放电量', '剩余电量', '环境温度', '信号值'])
            monitorChart1('c3', batteryData, ['电压', '电流', '功率', '充电量', '放电量', '环境温度', '信号值'])
            instrumentMonitor('solarMonitor', Math.abs(Math.ceil(this.deviceDetailData.solarVoltage * this.deviceDetailData.solarCurrent)))
            instrumentMonitor('LEDMonitor', Math.abs(Math.ceil(this.deviceDetailData.ledVolt * this.deviceDetailData.ledCurr)))
            instrumentMonitor('batteryMonitor', Math.abs(Math.ceil(this.deviceDetailData.batteryVolt * this.deviceDetailData.batteryCurr)))
            this.loading = false
          }
        } catch (e) {
        } finally {
          this.loading = false
        }
      },
      async renderMonitorHistory (deviceId, start, end) {
        // 历史统计数据
        // 历史发电与充电量
        this.loading = true
        try {
          document.getElementById('c4').innerHTML = ''
          document.getElementById('c5').innerHTML = ''
          // document.getElementById('c6').innerHTML = ''
          await this.getStatisticLighting({deviceId: deviceId, start: start, end: end})
          await this.getStatisticCharge({deviceId: deviceId, start: start, end: end})
          let histroyCurrent = this.statisticCharge({deviceId: deviceId, start: start, end: end})
          let histroyLighting = this.statisticLighting({deviceId: deviceId, start: start, end: end})
          if (histroyCurrent.length !== 0) {
            monitorChart2('c4', histroyCurrent, ['cellCharge', 'cellDisCharge'])
          }
          if (histroyLighting.length !== 0) {
            monitorChart2('c5', histroyLighting, ['lightTime'])
          }
          // if (histroyCurrent.length !== 0) {
          //   monitorChart2('c6', histroyCurrent, ['cellCharge', 'cellDisCharge'])
          // }
        } catch (e) {
        } finally {
          this.loading = false
        }
      },
      // 获取月份天气情况方法
      async renderMonitorWeather (deviceId, monthTime) {
        this.loading = true
        try {
          document.getElementById('c6').innerHTML = ''
          // if (histroyCurrent.length !== 0) {
          //   monitorChart2('c6', histroyCurrent, ['cellCharge', 'cellDisCharge'])
          // }
        } catch (e) {
        } finally {
          this.loading = false
        }
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
          // 计算日出日落
          this.latitude = firstDevice.lat
          this.longitude = firstDevice.lng
          let sunInfo = getSunRiseTimeAndSunDownTime(this.time1, this.longitude, this.latitude)
          this.sunup = sunInfo.sunRiseTime
          this.sunset = sunInfo.sunDownTime
          this.isActiveObj = {}
          this.isActiveObj[firstDevice.id] = true
        }
      },
      StrToFixeds (str) {
        return StrToFixed(str)
      },
      // 获取省市区编码
      getAdCode () {
        let location = this.project(this.projectId).location
        let adInfo = {}
        if (location !== undefined && location.includes('{')) { // 判断是否符合规则
          adInfo = JSON.parse(location)
          this.adCode = adInfo.adcode
          let codeItem = weatherAreaCode.filter(item => {
            return item.adcode === this.adCode
          })
          this.weatherCode = codeItem.length > 0 ? codeItem[0].csid : ''
        }
      }
    },
    mounted () {
      this.totalMonitor()
      this.initBaseArg()
      this.renderMonitorSingle(this.deviceId, this.time1)
      this.renderMonitorHistory(this.deviceId, this.startTime, this.endTime)
      this.renderMonitorWeather(this.deviceId, this.monthTime)
      this.getAdCode()
    },
    // activated () {
      //   this.totalMonitor()
    //   // 放到路由监听去，因为本页面也会触发
    //   this.searchText = this.$route.query.searchText || ''
    //   this.deviceId = this.$route.query.deviceId || this.deviceListData[0].id
    //   this.renderMonitorSingle(this.deviceId, this.time1)
    //   this.renderMonitorHistory(this.deviceId, this.startTime, this.endTime)
    // },
    created () {
      this.time1 = getCurrentTime()
      this.startTime = getPreWeekTime()
      this.endTime = getCurrentTime()
      this.monthTime = getYesterdayTime()
    }
  }
</script>
<style scoped lang='less'>
/* 设备当前状态 BEGIN*/
.current-status-wrap {
  /* overflow: hidden; */
  text-align: center;
  .current-status-item {
    float: left;
    height: 300px;
    width: 33.3%;
  }
  //star
  .current-monitor {
    height: 120px;
   /* background: url(../../assets/images/g2_data_none.png) no-repeat center;*/
    background-size: 30%;
    overflow: hidden;
    position: relative;
    z-index: -1;
  }
  //e
  .current-power-text {
    margin-top: -15px;
    margin-bottom: 20px;
    span {
      display: block;
      text-align: center;
    }
  }
}
/* 设备当前状态 END */

.device-map-wrap {
  overflow: hidden;
}
/* 左侧区域 */
.device-map-left {
  border: 1px solid #ddd;
  border-top: 0;
  float: left;
  width: 262px;
  position: relative;
  height: 800px;
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
  padding: 10px;
  margin-left: 15px;
  margin-top: 15px;
  border: 1px solid #ddd;
  height: 786px;
  position: relative;
}
.monitor-toggle-content {
  position: relative;
  width: 100%;
  .monitor-toggle-item {
    background: #fff;
    z-index: -1;
  }
  .active {
    z-index: 1;
  }
}
.monitor-toggle-item {
  position: absolute;
  width: 100%;
  height: 700px;
}
.monitor-toggle-btn {
  line-height: 40px;
  width: 100%;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
  a {
    cursor: pointer;
    display: inline-block;
    padding: 0 20px 5px;
    color: #666;
  }
  a.active {
    color: #409EFF;
  }
}

/* 图标基本样式 */
.base {
  width: 18px;
  height: 18px;
  display: inline-block;
}
/* 地图图标 */
//ss
.open-lamp-ico {
  /*background: url(../../assets/images/icon_entity_on.png);*/
  .base;
}
.close-lamp-ico {
  /*background: url(../../assets/images/icon_entity_off.png);*/
  .base;
}
.warn-lamp-ico {
  /*background: url(../../assets/images/icon_entity_error.png);*/
  .base;
}
.offline-lamp-ico {
  /*background: url(../../assets/images/icon_entity_offline.png);*/
  .base;
}
//e
/* 左侧监控图表 */
.monitor-chart-wrap {
  position: absolute;
  left: 0;
  bottom: 0;
  .monitor-chart {
    position: relative;
    &:after {
      content: '';
      width: 120px;
      height: 120px;
      position: absolute;
      top: 0;
      left: 0;
    }
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
/* 监控中心图表 */
.chart-wrap {
  padding-left: 0;
  overflow: hidden;
  .chart-content {
    list-style: none;
    float: left;
    width: 50%;
    margin-bottom: 5px;
  }
  li .title {
    text-align: center;
    font-size: 18px;
    padding-bottom: 10px;
  }
  .subTitle {
    margin-top: -18px;
    text-align: center;
    font-size: 14px;
    float: left;
    margin-left: 30px;
  }
}
//s
.monitor-bg {
  width: 100%;
  height: 270px;
  /*background: url(../../assets/images/g2_data_none.png) no-repeat center;*/
  background-size: 150px;
}
.subTitle {
  font-size: 16px;
  margin-top: 10px;
  color: #1890ff;
}
/* 左侧列表无数据 */
.left-list-none {
  /*background: url(../../assets/images/none_data_img.png) no-repeat center;*/
  background-size: 60%;
  display: block;
  margin: 30px auto 0;
  width: 185px;
  height: 121px;
  &-text {
    text-align: center;
    span {
      color: #409EFF;
      cursor: pointer;
      text-decoration: underline;
    }
  }
  //e
}
</style>




// WEBPACK FOOTER //
// src/views/monitor/monitor.vue
