<template>
  <el-card style="margin-top:20px;"
           v-intro="'列表模式！<br/> 可看到当前设备信息！'"
           v-intro-position="'bottom'"
           v-intro-step="1"
           v-intro-autostart="tutorialFlag">
    <div class="device-table-wrap">
      <div class="device-list-operation">
        <div class="device-list-select animated swing"
             v-intro="'设备列表！<br/> 可通过分组/设备名称快速查询设备！'"
             v-intro-position="'top'"
             v-intro-step="2">
          <label>所在分组：</label>
          <el-select v-model="groupId" placeholder="请选择" @change="hanleSelectChange">
            <el-option
              key="0"
              label="全部"
              :value="''">
            </el-option>
            <el-option
              key="1"
              label="未分组"
              :value="0">
            </el-option>
            <el-option
              v-for="item in groupList({projectId: projectId})"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
          <el-input style="width:240px;" placeholder="关键字搜索" v-model="searchText" @change="keyChange" clearable></el-input>
        </div>
        <div class="deivce-list-btn"
             v-intro="'选择设备，对设备操作！'"
             v-intro-position="'bottom'"
             v-intro-step="3">
          <!-- 系统参数为true 并且是拥有者才有权限设置智能功率 -->
          <el-button v-if="isPermiss('OPERAT_DEVICE_POWER') && systemParam() === 'true'" type="success" :disabled="isListClick" @click="powerVisible=true"
                     class="animated swing"
                     v-intro="'特定系统下的项目拥有者有权限开启智能功率！'"
                     v-intro-position="'bottom'"
                     v-intro-step="7">智能功率
          </el-button>
          <!-- 天盈  零度充电读取与设置 -->
          <!-- <el-button v-if="tianyingMoteModel() === 'true'" type="success" class="animated swing" :disabled="isListClick" @click="zeroVisible=true">零度充电</el-button> -->
          <el-button v-if="isPermiss('OPERAT_DEVICE_STATUS')" @click="updateStatus()" type="success" class="animated swing" :disabled="isListClick">更新</el-button>
          <el-button v-if="isPermiss('OPERAT_DEVICE_STATUS')" @click="changeDeviceOn()" type="success" class="animated swing" :disabled="isListClick">开灯</el-button>
          <el-button v-if="isPermiss('OPERAT_DEVICE_STATUS')" @click="changeDeviceOff()" type="success" class="animated swing" :disabled="isListClick">关灯</el-button>
          <el-button v-if="isPermiss('OPERAT_DEVICE_STATUS')" @click="adjustLightBtn" type="success" class="animated swing" :disabled="isListClick">调光</el-button>
          <el-button type="primary" @click="goToMap"
                     class="animated swing"
                     v-intro="'回到地图模式！'"
                     v-intro-position="'bottom'"
                     v-intro-step="4">切换地图模式
          </el-button>
        </div>
      </div>
      <div v-if="tableData.length==0" style="text-align: center;">
        <i class="left-list-none"></i>
        <div class="left-list-none-text">暂无设备，<span @click="gotoAddDevice">前往添加</span></div>
      </div>
      <!-- 设备列表 -->
      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%"
        empty-text="暂无设备"
        @selection-change="handleSelectionChange"
        v-if="tableData.length!==0">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          label="命令"
          width="100">
          <template slot-scope="scope">
            <i style="color:#409EFF;font-size:22px;" :class="[updateIcon[scope.row.id]?'el-icon-circle-check':'el-icon-loading']"></i>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="名称"
          sortable
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="snHexadecimal"
          label="sn号">
        </el-table-column>
        <el-table-column
          prop="isOnline"
          label="是否在线"
          width="100">
          <!--<template slot-scope="scope">
            <span v-if="scope.row.signalIntensity === -1"><i class=""></i></span>
            <span v-if="scope.row.signalIntensity === 0"><i class="signal-ico-0"></i></span>
            <span v-if="scope.row.signalIntensity === 1"><i class="signal-ico-1"></i></span>
            <span v-if="scope.row.signalIntensity === 2"><i class="signal-ico-2"></i></span>
            <span v-if="scope.row.signalIntensity === 3"><i class="signal-ico-3"></i></span>
            <span v-if="scope.row.signalIntensity === 4"><i class="signal-ico-4"></i></span>
            <span v-if="scope.row.signalIntensity === 5"><i class="signal-ico-5"></i></span>
          </template>-->
          <template slot-scope="scope">
            <span v-if="scope.row.signalIntensity === -1">-1</span>
            <span v-if="scope.row.signalIntensity === 0">0</span>
            <span v-if="scope.row.signalIntensity === 1">1</span>
            <span v-if="scope.row.signalIntensity === 2">2</span>
            <span v-if="scope.row.signalIntensity === 3">3</span>
            <span v-if="scope.row.signalIntensity === 4">4</span>
            <span v-if="scope.row.signalIntensity === 5">5</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="ledInfo"
          label="LED电压/电流/功率">
        </el-table-column>
        <el-table-column
          prop="solarInfo"
          label="太阳能板电压/电流/功率">
        </el-table-column>
        <el-table-column
          prop="batteryInfo"
          label="电池电压/电流/功率">
        </el-table-column>
        <el-table-column
          width="160"
          prop="updateTime"
          label="最后更新时间">
          <template slot-scope="scope">{{ (scope.row.updatedAt || scope.row.createdAt) | time }}</template>
        </el-table-column>
        <el-table-column
          prop="brightness"
          label="亮度"
          width="100">
        </el-table-column>
        <!-- <el-table-column
          prop="switchingPowerSupplyVoltage"
          label="市电互补电压">
          <template slot-scope="scope">{{ scope.row.switchingPowerSupplyVoltage }}V</template>
        </el-table-column>
        <el-table-column
          prop="trafficWorkMode"
          label="人流感应"
          width="100">
          <template slot-scope="scope">{{ scope.row.trafficWorkMode | traffic }}</template>
        </el-table-column> -->
        <el-table-column
          label="电池状态"
          width="100">
          <template slot-scope="scope">
            <span><i :class="`electricity-ico-${scope.row.cellIcon}`"></i></span>
          </template>
        </el-table-column>
        <!-- <el-table-column
          v-if="tianyingMoteModel() === 'true'"
          label="零度充电"
          width="120">
          <template slot-scope="scope">{{ scope.row.zeroChargeType | zeroCharge }}</template>
        </el-table-column> -->
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-button
              @click="deviceDetail(scope.row.id, scope.row.updatedAt)"
              type="text"
              size="small"
              v-intro="'查看详情！'"
              v-intro-position="'top'"
              v-intro-step="6">
              详情
            </el-button>
            <el-button
              v-if="isPermiss('OPERAT_DEVICE_STATUS')"
              @click="updateStatus(scope.row.id, scope.row.updatedAt)"
              type="text"
              size="small"
              v-intro="'更新单个设备！'"
              v-intro-position="'top'"
              v-intro-step="5">
              更新
            </el-button>
            <!-- 判断是否有权限、是否是人流控设备、状态 -->
            <el-button
              v-if="isPermiss('OPERAT_DEVICE_STATUS') && scope.row.gatewayExtendOption.humanInfrared === 1 && scope.row.trafficWorkMode === 0"
              @click="setTraffic(scope.row.id, 1)"
              type="text"
              size="small">
              开启人流控
            </el-button>
            <el-button
              v-if="isPermiss('OPERAT_DEVICE_STATUS') && scope.row.gatewayExtendOption.humanInfrared === 1 && scope.row.trafficWorkMode === 1"
              @click="setTraffic(scope.row.id, 0)"
              type="text"
              size="small">
              关闭人流控
            </el-button>
            <el-button
              v-if="isPermiss('OPERAT_DEVICE_STATUS') && scope.row.gatewayExtendOption.electricityComplementary === 1"
              @click="setPowerSupplyVoltage(scope.row.id, scope.row.switchingPowerSupplyVoltage)"
              type="text"
              size="small">
              切换电源电压
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="block">
        <el-pagination
          v-if="tableData.length!==0"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100, 200]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
      <!-- 详情弹出层 -->
      <el-dialog title="设备详情" width="410px" :visible.sync="outerVisible">
        <device-detail :deviceId="deviceId" :preUpdateTime="preUpdateTime"></device-detail>
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

      <!-- 智能功率 -->
      <el-dialog title="智能功率设置" width="30%" :visible.sync="powerVisible">
        <el-form :model="formData" ref="formData" label-width="100px">
          <el-form-item label="电池类型" prop="batteryType" >
            <el-select v-model="formData.batteryType"
                       @change="changeBatteryType"
                       placeholder="请选择">
              <el-option
                v-for="item in batteryTypes"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            v-for="(item, index) in voltageParams[ind].params"
            :key="index"
            :label="(index+1) + ' 电压(V):'">
            <el-input v-model.number="item.voltagePoint" placeholder="电压" :disabled="true" style="width: 100px;"></el-input> ~
            亮度(%)：<el-input v-model.number="item.level" placeholder="亮度" type="number" max="100" min="0" style="width: 80px;" @keyup.enter.native="handleSubmit"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="powerVisible = false">取 消</el-button>
            <el-button type="primary" @click="handleSubmit">确 定</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

      <!-- 零度充电 -->
      <el-dialog title="零度充电方式" width="30%" :visible.sync="zeroVisible">
        <el-form :model="zeroFormData" ref="zeroFormData" label-width="100px">
          <el-form-item label="充电方式" prop="chargeType" >
            <el-select v-model="zeroFormData.zeroChargeType"
                       placeholder="请选择">
              <el-option
                v-for="item in chargeTypes"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="zeroVisible = false">取 消</el-button>
            <el-button type="primary" @click="zeroSubmit">确 定</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

      <!-- 切换电源电压值修改 -->
      <el-dialog
        title="设置电源电压"
        :visible.sync="dialogPowerVoltage"
        width="30%">
        <div class="block">
          <el-input style="width:240px;" placeholder="输入电压值" v-model="powerVol"></el-input> V
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogPowerVoltage = false">取 消</el-button>
          <el-button type="primary" @click="submitPowerVoltage">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </el-card>

</template>

<script>
  import deviceDetail from './modal/detail'

  import moment from 'moment'
  import { mapGetters, mapActions } from 'vuex'
  import { getCurrentTime, getSunRiseTimeAndSunDownTime } from '../../utils/time'
  // import { getCurrentTime, getSunRiseTimeAndSunDownTime, getTimeFramePre, getTimeFrameNext } from '../../utils/time'
  import { StrToFixed } from '../../utils/string'
  import { Loading } from 'element-ui'

  // 电池零度充电方式；0-正常充电；1-不充电；2-慢充电
  const mapCharge = {
    0: '正常充电',
    1: '不充电',
    2: '慢充电'
  }
  // 人流感应开关 0-关闭；1-开启
  const mapTraffic = {
    0: '关闭',
    1: '开启'
  }
  export default {
    data () {
      return {
        // 亮度
        brightness: 0,
        // 选中的设备ID
        deviceId: '',
        // 选中的设备ID列表
        deviceListSelected: [],
        isListClick: true,
        dialogBrightness: false,
        // 设备弹出基本数据
        deviceDetailData: {},
        outerVisible: false,
        // 分页
        currentPage: 1,
        pageSize: 10,
        // 列表筛选及搜索
        groupId: '',
        searchText: '',
        // 更新图标数组
        updateIcon: {},
        tableData: [],
        total: 0,
        powerVisible: false,
        formData: {
          batteryType: 1
        },
        // 电���类型
        batteryTypes: [
          {
            id: 1,
            name: '磷酸铁锂'
          },
          {
            id: 2,
            name: '三元锂'
          },
          {
            id: 3,
            name: '铅酸'
          }
        ],
        // 可选择的电池电压亮度
        voltageParams: [
          {
            params: [
              {
                voltagePoint: '11.5/23.0',
                level: 100
              }, {
                voltagePoint: '11.3/22.6',
                level: 50
              }, {
                voltagePoint: '11.1/22.2',
                level: 30
              }, {
                voltagePoint: '10.9/21.8',
                level: 20
              }, {
                voltagePoint: '10.7/21.4',
                level: 10
              }, {
                voltagePoint: '10.5/21.0',
                level: 5
              }
            ]
          }, {
            params: [
              {
                voltagePoint: '13.0/26.0',
                level: 100
              }, {
                voltagePoint: '12.8/25.6',
                level: 50
              }, {
                voltagePoint: '12.6/25.2',
                level: 40
              }, {
                voltagePoint: '12.4/24.8',
                level: 30
              }, {
                voltagePoint: '12.2/24.4',
                level: 20
              }, {
                voltagePoint: '12.0/24.0',
                level: 5
              }
            ]
          }
        ],
        // 智能功率参数区间
        voltagePointIntervals: [
          {
            params: [
              {
                voltagePoint: 11500,
                level: 100
              }, {
                voltagePoint: 11300,
                level: 50
              }, {
                voltagePoint: 11100,
                level: 30
              }, {
                voltagePoint: 10900,
                level: 20
              }, {
                voltagePoint: 10700,
                level: 10
              }, {
                voltagePoint: 10500,
                level: 5
              }
            ]
          }, {
            params: [
              {
                voltagePoint: 13000,
                level: 100
              }, {
                voltagePoint: 12800,
                level: 50
              }, {
                voltagePoint: 12600,
                level: 40
              }, {
                voltagePoint: 12400,
                level: 30
              }, {
                voltagePoint: 12200,
                level: 20
              }, {
                voltagePoint: 12000,
                level: 5
              }
            ]
          }
        ],
        ind: 0,
        // 日落
        sunset: '',
        longitude: '',
        latitude: '',
        time1: '',
        preUpdateTime: '',
        zeroVisible: false,
        zeroFormData: {
          zeroChargeType: 0
        },
        // 电池类型
        chargeTypes: [
          {
            id: 0,
            name: '正常充电'
          },
          {
            id: 1,
            name: '不充电'
          },
          {
            id: 2,
            name: '慢充电'
          }
        ],
        powerVol: '',
        dialogPowerVoltage: false
      }
    },
    components: {
      deviceDetail
    },
    computed: {
      ...mapGetters([
        'projectList',
        'groupList',
        'deviceList',
        'device',
        'strategyInDevice',
        'logList',
        'isPermissByFunName',
        'systemParam',
        'tutorialParams',
        'tianyingMoteModel'
      ]),
      // 项目ID
      projectId () {
        return this.$route.params.projectId || sessionStorage.getItem('projectId')
      },
      tutorialFlag () {
        return this.tutorialParams()
      },
      deviceNum () {
        return this.deviceList({projectId: this.projectId, isDisable: false, groupId: this.groupId, name: this.searchText}).length
      }
      // 设备分页列表
      // deviceListData () {
      //   let start = (this.currentPage - 1) * this.pageSize
      //   let end = start + this.pageSize
      //   let deviceListDataSrc = this.deviceList({projectId: this.projectId, groupId: this.groupId, name: this.searchText, isDisable: false})
      //   deviceListDataSrc.forEach(item => {
      //     item.solarInfo = `${StrToFixed(item.solarVoltage)}V / ${StrToFixed(item.solarCurrent)}A / ${StrToFixed(item.solarVoltage * item.solarCurrent)}W`
      //     item.batteryInfo = `${StrToFixed(item.batteryVolt)}V / ${StrToFixed(item.batteryCurr)}A / ${StrToFixed(item.batteryVolt * item.batteryCurr)}W`
      //     item.ledInfo = `${StrToFixed(item.ledVolt)}V / ${StrToFixed(item.ledCurr)}A / ${StrToFixed(item.ledVolt * item.ledCurr)}W`
      //   })
      //   // 列表命令图标
      //   let updateIcon = {}
      //   deviceListDataSrc.slice(start, end).forEach((item) => {
      //     updateIcon[item.id] = true
      //   })
      //   this.updateIcon = Object.assign({}, updateIcon)
      //   return deviceListDataSrc.slice(start, end)
      // }
    },
    watch: {
      projectId () {
        // 初始化数据
        this.groupId = ''
        this.searchText = ''
        this.currentPage = 1
        this.getDevicing()
        this.getTimeFrame()
      },
      $route () {
        if (this.$route.path.indexOf('list') !== -1) {
        }
      },
      // 检测教程开关指令
      tutorialFlag () {
        if (this.tutorialParams()) this.$intro().start()
      }
    },
    methods: {
      ...mapActions([
        'createDevice',
        'destroyDevice',
        'updateDevice',
        'setDeviceRelation',
        'getDevice',
        'getProjectList',
        // 弹出层
        'getStrategyInDevice',
        'getWarningList',
        'getDeviceList',
        'getLogList',
        'clearLogList',
        'getStatisticStatus',
        // 指令-更新设备状态
        'updateDeviceStatus',
        'updateDeviceStatusBySingle',
        // 指令-开、关、调光
        'updateDeviceLevel',
        'updateDeviceLevelBySingle',
        'getProject',
        'getDeviceListByPagi',
        'updatePowerParams',
        'setZeroChargeType',
        'updateTrafficParam',
        'updatePowerSupplyVol'
      ]),
      // 依据功能名称判断是否有权限
      isPermiss (funName) {
        return this.isPermissByFunName(this.projectId, funName)
      },
      async deviceDetail (id, updatedAt) {
        await this.clearLogList()
        this.deviceId = id.toString()
        this.preUpdateTime = updatedAt
        await this.getStatisticStatus({deviceId: this.deviceId, date: getCurrentTime()})
        await this.getDevice({deviceId: this.deviceId})
        this.deviceDetailData = this.device(this.deviceId)
        this.outerVisible = true
        await this.getLogList({deviceId: this.deviceId, currentPage: 1})
        await this.getStrategyInDevice({deviceId: this.deviceId})
        // await this.getWarningList({projectId: this.projectId, deviceId: this.deviceId})
      },
      // 更新设备
      updateStatus (deviceId) {
        // const update = this.tableData.filter(item => {
        //   return deviceId === item.id
        // })
        this.updateStatusFun(deviceId)
      },
      async updateStatusFun (deviceId) {
        try {
          if (!deviceId) {
            this.deviceListSelected.forEach((item) => {
              this.updateIcon[item] = false
            })
            await this.updateDeviceStatus({projectId: this.projectId, deviceId: this.deviceListSelected})
            this.getDevicing()
          } else {
            this.updateIcon[deviceId] = false
            await this.updateDeviceStatusBySingle({projectId: this.projectId, deviceId: [deviceId]})
            this.getDevicing()
          }
          for (let item in Object.keys(this.updateIcon)) {
            this.updateIcon[item] = undefined
          }
          // const update2 = this.tableData.filter(item => {
          //   return deviceId === item.id
          // })
          this.$message({
            type: 'success',
            message: '指令发送成功!'
          })
          // if (this.preUpdateTime === update2[0].updatedAt) {
          //   this.$confirm(`更新失败，设备的上次更新时间为<br/> <label style="color: #409EFF">${moment(this.preUpdateTime).format('YYYY-MM-DD, HH:mm:ss')}</label>`, '重新更新？', {
          //     dangerouslyUseHTMLString: true,
          //     confirmButtonText: '确定',
          //     cancelButtonText: '取消',
          //     type: 'warning'
          //   }).then(() => {
          //     this.updateStatus(this.deviceId)
          //   }).catch(() => {
          //     this.$message({
          //       type: 'info',
          //       message: '重新更新已取消！'
          //     })
          //   })
          // } else {
          //   this.$message({
          //     type: 'success',
          //     message: '指令发送成功!'
          //   })
          // }
        } catch (e) {
        } finally {
          this.updateIcon[deviceId] = true
        }
      },
      // 开灯
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
          if (!deviceId) {
            this.deviceListSelected.forEach((item) => {
              this.updateIcon[item] = false
            })
            await this.updateDeviceLevel({projectId: this.projectId, deviceId: this.deviceListSelected, type: 'open'})
            this.getDevicing()
          } else {
            this.updateIcon[deviceId] = false
            await this.updateDeviceLevelBySingle({projectId: this.projectId, deviceId: [deviceId], type: 'open'})
          }
          for (let item in Object.keys(this.updateIcon)) {
            this.updateIcon[item] = undefined
          }
          this.$message({
            type: 'success',
            message: '指令发送成功!'
          })
        } catch (e) {
        } finally {
          this.updateIcon[deviceId] = true
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
          if (!deviceId) {
            this.deviceListSelected.forEach((item) => {
              this.updateIcon[item] = false
            })
            await this.updateDeviceLevel({projectId: this.projectId, deviceId: this.deviceListSelected, type: 'close'})
            this.getDevicing()
          } else {
            this.updateIcon[deviceId] = false
            await this.updateDeviceLevelBySingle({projectId: this.projectId, deviceId: [deviceId], type: 'close'})
          }
          for (let item in Object.keys(this.updateIcon)) {
            this.updateIcon[item] = undefined
          }
          this.$message({
            type: 'success',
            message: '指令发送成功!'
          })
        } catch (e) {
        } finally {
          this.updateIcon[deviceId] = true
        }
      },
      // 单灯调光按钮
      adjustLightBtn () {
        this.dialogBrightness = true
      },
      async adjustLight () {
        try {
          if (this.deviceListSelected.length === 0) {
            this.deviceListSelected.forEach((item) => {
              this.updateIcon[item] = false
            })
            await this.updateDeviceLevel({projectId: this.projectId, deviceId: [this.deviceId], type: 'dimme', brightness: this.brightness})
          } else {
            await this.updateDeviceLevel({projectId: this.projectId, deviceId: this.deviceListSelected, type: 'dimme', brightness: this.brightness})
          }
          for (let item in Object.keys(this.updateIcon)) {
            this.updateIcon[item] = undefined
          }
          this.$message({
            type: 'success',
            message: '指令发送成功!'
          })
          this.getDevicing()
        } catch (e) {
        }
        this.outerVisible = false
        this.dialogBrightness = false
      },

      goToMap () {
        this.$router.push({ name: 'deviceMap' })
      },
      // 根据分组筛选设备列表
      selectGroup () {
        this.searchText = ''
      },
      // 关键字收搜
      searchTextFun () {
        this.groupId = ''
      },
      // 当前分页
      handleCurrentChange (val) {
        this.currentPage = val
        this.getDevicing()
      },
      // 条数变更
      handleSizeChange (val) {
        this.pageSize = val
        this.getDevicing()
      },
      hanleSelectChange (val) {
        this.groupId = val
        this.currentPage = 1
        this.getDevicing()
      },
      // 关键字查询
      keyChange () {
        this.currentPage = 1
        this.getDevicing()
      },
      // 批量选择设备
      handleSelectionChange (val) {
        this.deviceListSelected = []
        if (val.length !== 0) {
          this.isListClick = false
          val.forEach((item) => {
            this.deviceListSelected.push(item.id)
          })
        } else {
          this.isListClick = true
        }
      },
      // 前往添加设备界面
      gotoAddDevice () {
        this.$router.push({name: 'project'})
      },
      async getDevicing () {
        let loadingInstance = Loading.service({
          background: 'rgba(0, 0, 0, 0.0)',
          fullscreen: true,
          text: '正在努力加载中...'
        })
        try {
          const { currentPage, pageSize, projectId, groupId } = this
          const data = await this.getDeviceListByPagi({ projectId, pageNo: currentPage, pageSize, groupId, name: this.searchText, isDisabled: true })
          this.tableData = data.records
          this.total = data.recordCount
          this.tableData.forEach(item => {
            item.solarInfo = `${StrToFixed(this.calcNum(item.solarVoltage))}V / ${StrToFixed(this.calcNum(item.solarCurrent))}A / ${StrToFixed((this.calcNum(item.solarVoltage)) * (this.calcNum(item.solarCurrent)))}W`
            item.batteryInfo = `${StrToFixed(this.calcNum(item.batteryVolt))}V / ${StrToFixed(0 - this.calcNum(item.batteryCurr))}A / ${StrToFixed(this.calcNum(item.batteryVolt) * (0 - this.calcNum(item.batteryCurr)))}W`
            item.ledInfo = `${StrToFixed(this.calcNum(item.ledVolt))}V / ${StrToFixed(this.calcNum(item.ledCurr))}A / ${StrToFixed(this.calcNum(item.ledVolt) * this.calcNum(item.ledCurr))}W`
            item.signalIntensity = this.calcSignalIntensity(item)
            item.cellIcon = this.calCellIcon(item)
            item.brightness = (item.online && item.switchState) ? item.brightness : 0
          })
          // 列表命令图标
          let updateIcon = {}
          this.tableData.forEach((item) => {
            updateIcon[item.id] = true
          })
          this.updateIcon = Object.assign({}, updateIcon)
          if (this.tableData.length > 0) {
            let firstDevice = this.tableData[0]
            // 计算日出日落
            this.latitude = firstDevice.lat
            this.longitude = firstDevice.lng
            let sunInfo = getSunRiseTimeAndSunDownTime(this.time1, this.longitude, this.latitude)
            this.sunset = sunInfo.sunDownTime
          }
        } finally {
          loadingInstance.close()
        }
      },
      // 取数据前两位
      calcNum (val) {
        return (val / 1000).toFixed(2) * 1
      },
      // 计算信号强度
      calcSignalIntensity (item) {
        const { online, signalIntensity } = item
        if (!online) return -1
        switch (signalIntensity) {
          case 1:
            return 5
          case 2:
            return 4
          case 3:
            return 3
          case 4:
            return 2
          case 5:
            return 1
          default:
            return 0
        }
      },
      // 计算电池图标
      calCellIcon (item) {
        const { chargeState, cellLevel } = item
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
      // 提交智能功率设置
      handleSubmit () {
        const voltage = this.voltageParams[this.ind].params
        for (var i = 0; i < voltage.length - 1; i++) {
          if (voltage[i + 1].level >= voltage[i].level) {
            this.$notify.error({
              dangerouslyUseHTMLString: true,
              type: 'warning',
              title: '提示',
              message: `第<label style="color:red;"> ${i + 2} </label>个亮度应小于第<label style="color:red;"> ${i + 1} </label>个`
            })
            return false
          }
        }
        this.setPowerParams()
      },
      // 改变电池，功率亮度默认值改变
      changeBatteryType (val) {
        this.ind = val === 1 ? 0 : 1
      },
      // 批量下发智能功率
      async setPowerParams () {
        let { projectId, deviceListSelected } = this
        let loadingInstance = Loading.service({
          background: 'rgba(0, 0, 0, 0.0)',
          fullscreen: true,
          text: '正在努力加载中...'
        })
        try {
          const resList = await this.updatePowerParams({ projectId, solarMoteIds: deviceListSelected, batteryType: this.formData.batteryType, voltagePointIntervals: this.voltagePointIntervals[this.ind].params })
          if (resList.failIds && resList.failIds.length) {
            const datas = this.tableData.filter(item => resList.failIds.indexOf(item.id) > -1)
            const names = datas.map(item => item.name).join(', ')
            this.$notify({
              type: 'warning',
              title: '警告',
              message: '操作失败的设备有：' + names
            })
          } else {
            this.$notify({
              type: 'success',
              title: '成功',
              message: '下发智能功率成功！'
            })
          }
        } catch (e) {
        } finally {
          this.powerVisible = false
          loadingInstance.close()
        }
      },
      // 判断是否在日落时���前后半小时内
      getTimeFrame () {
        // console.log(getTimeFramePre() < this.sunset < getTimeFrameNext())
      },
      // 改变零度充电方式
      changeChargeType (val) {
      },
      // 提交零度方式
      async zeroSubmit () {
        let { projectId, deviceListSelected } = this
        let loadingInstance = Loading.service({
          background: 'rgba(0, 0, 0, 0.0)',
          fullscreen: true,
          text: '正在努力加载中...'
        })
        try {
          const resList = await this.setZeroChargeType({ projectId, solarMoteIds: deviceListSelected, zeroChargeType: this.zeroFormData.zeroChargeType })
          if (resList.failIds && resList.failIds.length) {
            const datas = this.tableData.filter(item => resList.failIds.indexOf(item.id) > -1)
            const names = datas.map(item => item.name).join(', ')
            this.$notify({
              type: 'warning',
              title: '警告',
              message: '操作失败的设备有：' + names
            })
          } else {
            this.$notify({
              type: 'success',
              title: '成功',
              message: '设置零度充电方式成功'
            })
          }
        } catch (e) {
        } finally {
          this.zeroVisible = false
          this.getDevicing()
          loadingInstance.close()
        }
      },
      // 对设备下发人流量参数
      async setTraffic (id, traffic) {
        let deviceId = id
        let trafficControl = traffic
        let loadingInstance = Loading.service({
          background: 'rgba(0, 0, 0, 0.0)',
          fullscreen: true,
          text: '正在努力加载中...'
        })
        try {
          let data = await this.updateTrafficParam({deviceId, trafficControl})
          if (data.success) {
            this.$notify({
              type: 'success',
              title: '成功',
              message: '设置人流控参数成功'
            })
          } else {
            this.$notify.error({
              type: 'warning',
              title: '失败',
              message: data.message
            })
          }
        } catch (error) {
        } finally {
          this.getDevicing()
          loadingInstance.close()
        }
      },
      // 打开电压输入会话框
      setPowerSupplyVoltage (id, voltage) {
        this.deviceId = id.toString()
        this.powerVol = voltage
        this.dialogPowerVoltage = true
      },
      // 对设备下发切换电源电压
      async submitPowerVoltage () {
        if (this.powerVol > 15 || this.powerVol < 9) {
          this.$message.error({
            message: '电源电压值应在9~15区间!',
            type: 'warning'
          })
          this.powerVol = ''
          return
        }
        let switchingPowerSupplyVoltage = this.powerVol
        let deviceId = this.deviceId
        let loadingInstance = Loading.service({
          background: 'rgba(0, 0, 0, 0.0)',
          fullscreen: true,
          text: '正在努力加载中...'
        })
        try {
          let data = await this.updatePowerSupplyVol({deviceId, switchingPowerSupplyVoltage})
          if (data.success) {
            this.$notify({
              type: 'success',
              title: '成功',
              message: '设置电源电压值成功！'
            })
          } else {
            this.$notify.error({
              type: 'warning',
              title: '失败',
              message: data.message
            })
          }
        } catch (error) {
        } finally {
          this.dialogPowerVoltage = false
          this.getDevicing()
          loadingInstance.close()
        }
      }
    },
    async created () {
      this.time1 = getCurrentTime()
      this.getDevicing()
      this.getTimeFrame()
    },
    mounted () {
      // 重新调取项目接口
      this.getProject({projectId: this.projectId})
    },
    activated () {
      if (this.tutorialParams()) this.$intro().start()
    },
    deactivated () {
      this.$intro().exit()
    },
    filters: {
      time (val) {
        if (!val) return '---'
        return moment(val).format('YYYY-MM-DD HH:mm:ss')
      },
      zeroCharge (val) {
        return mapCharge[val] || '---'
      },
      traffic (val) {
        return mapTraffic[val]
      }
    }
  }
</script>

<style scoped lang="less">
  .device-list-operation {
    margin: 20px;
    height: 40px;
    .device-list-select {
      float: left;
    }
    .deivce-list-btn {
      float: right;
    }
  }
  .block {
    margin-top: 20px;
  }
  /*设备详情信号强度*/
  .base {
    background-size: 19px 14px;
    display: inline-block;
    width: 19px;
    height: 14px;
  }
 /* .signal-ico--1 {
    background: url(../../assets/images/signal_ico_-1.png);
    .base;
  }
  .signal-ico-0 {
    background: url(../../assets/images/signal_ico_0.png);
    .base;
  }
  .signal-ico-1 {
    background: url(../../assets/images/signal_ico_1.png);
    .base;
  }
  .signal-ico-2 {
    background: url(../../assets/images/signal_ico_2.png);
    .base;
  }
  .signal-ico-3 {
    background: url(../../assets/images/signal_ico_3.png);
    .base;
  }
  .signal-ico-4 {
    background: url(../../assets/images/signal_ico_4.png);
    .base;
  }
  .signal-ico-5 {
    background: url(../../assets/images/signal_ico_5.png);
    .base;
  }*/
  .cellIconBase {
    display: inline-block;
    width: 30px;
    height: 16px;
    background-repeat: no-repeat;
  }
  /*.electricity-ico-0-0 {
    background: url(../../assets/images/electricity/electricity-0-0.png);
    .cellIconBase;
  }
  .electricity-ico-0-1 {
    background: url(../../assets/images/electricity/electricity-0-1.png);
    .cellIconBase;
  }
  .electricity-ico-0-2 {
    background: url(../../assets/images/electricity/electricity-0-2.png);
    .cellIconBase;
  }
  .electricity-ico-0-3 {
    background: url(../../assets/images/electricity/electricity-0-3.png);
    .cellIconBase;
  }
  .electricity-ico-0-4 {
    background: url(../../assets/images/electricity/electricity-0-4.png);
    .cellIconBase;
  }
  .electricity-ico-1-0 {
    background: url(../../assets/images/electricity/electricity-1-0.png);
    .cellIconBase;
  }
  .electricity-ico-1-1 {
    background: url(../../assets/images/electricity/electricity-1-1.png);
    .cellIconBase;
  }
  .electricity-ico-1-2 {
    background: url(../../assets/images/electricity/electricity-1-2.png);
    .cellIconBase;
  }
  .electricity-ico-1-3 {
    background: url(../../assets/images/electricity/electricity-1-3.png);
    .cellIconBase;
  }
  .electricity-ico-1-4 {
    background: url(../../assets/images/electricity/electricity-1-4.png);
    .cellIconBase;
  }
  .electricity-ico-2-0 {
    background: url(../../assets/images/electricity/electricity-2-0.png);
    .cellIconBase;
  }
  .electricity-ico-2-1 {
    background: url(../../assets/images/electricity/electricity-2-1.png);
    .cellIconBase;
  }
  .electricity-ico-2-2 {
    background: url(../../assets/images/electricity/electricity-2-2.png);
    .cellIconBase;
  }
  .electricity-ico-2-3 {
    background: url(../../assets/images/electricity/electricity-2-3.png);
    .cellIconBase;
  }
  .electricity-ico-2-4 {
    background: url(../../assets/images/electricity/electricity-2-4.png);
    .cellIconBase;
  }
  .electricity-ico-0-0 {
    background: url(../../assets/images/electricity/electricity-0-0.png);
    .cellIconBase;
  }*/
  .left-list-none {
    background: url(../../assets/images/none_data_img.png) no-repeat center;
    background-size: 100%;
    display: block;
    margin: 30px auto 0;
    width: 185px;
    height: 121px;
  }
  .left-list-none-text {
    text-align: center
  }
  .left-list-none-text span {
    color: #409EFF;
    cursor: pointer;
    text-decoration: underline;
  }
</style>
