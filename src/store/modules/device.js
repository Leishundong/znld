/**
 * 设备字段
 * @param {String} id 主键
 * @param {timestamp} updateTime 更新时间
 * 基本信息
 * @param {String} name 设备名称
 * @param {Number} lng 经度
 * @param {Number} lat 纬度
 * @param {String} snHex 16进制sn号
 * @param {String} pnHex 16进制pn号
 * @param {Boolean} isGateway 是否作为网关使用
 * 关联信息
 * @param {String} project 所属项目id
 * @param {String} group 所属分组id，一定存在，未分组为 0
 * @param {String} groupName 分组名，一定存在，未分组为 '无分组'
 * 参数
 * @param {Number} paramSettingMode 参数设置模式（1--默认；2--自定义）
 * @param {Number} ledRatedCurrent LED灯额定电流
 * @param {Number} batteryType 电池类型（1--磷酸铁锂；2--三元锂；3--铅酸；）
 * @param {Number} batteryVoltage 电池额定电压
 * @param {Number} batteryOverVoltage 电池超压电压
 * @param {Number} batteryOverToBackVoltage 电池超压恢复电压
 * @param {Number} batteryLowVoltage 电池低压电压
 * @param {Number} batteryLowToBackVoltage 电池低压恢复电压
 * @param {Number} dayThreshold 光控天亮阈值
 * @param {Number} nightThreshold 光控天黑阈值
 * @param {Number} batteryCapacity 电池容量
 * 状态
 * @param {Boolean} isOnline 是否在线
 * @param {Boolean} isOpen 是否打开
 * @param {Boolean} isWarning 是否告警
 * @param {Boolean} isDisable 是否停用
 * @param {Boolean} isSettedParam 参数下发状态
 * @param {Boolean} isSettedStrategy 策略下发状态
 * @param {Number} signalIntensity 信号强度（-1--离线；0--无；1--最弱；2--弱；3--一般；4--较强；5--强）
 * @param {Number} brightness 亮度
 * @param {Number} solarVoltage 太阳能板电压
 * @param {Number} solarCurrent 太阳能板电流
 * @param {Number} batteryVolt 蓄电池电压
 * @param {Number} batteryCurr 蓄电池电流
 * @param {Number} ledVolt LED电压
 * @param {Number} ledCurr LED电流
 * @param {Number} cellCharge 电池当前充电量
 * @param {Number} cellDischarge 电池当前放电量
 * @param {Number} cellResidue 电池剩余容量
 * @param {Number} cellLevel 电池电量
 * @param {Number} chargeState 充电状态；1-快充；2-慢充；5-快充
 * @param {Number} temperatures 环境温度
 * @param {Number} switchMode 开关模式(1-遥控；2-时控；3-光控； 4-指令； 6-自身控制)
 */
import http from 'http'
import { List, Map, fromJS } from 'immutable'
import { getSessionStorage, setSessionStorage } from 'tools/storage'

const cacheDeviceAll = getSessionStorage('device_all') || {}
const cacheDeviceList = getSessionStorage('device_list') || {}
const cacheDeviceIdsInGroup = getSessionStorage('device_ids_in_group') || {}

const state = {
  /**
   * 示例
   * {
   *   id: {},
   *   id: {}
   * }
   */
  all: fromJS(cacheDeviceAll),
  deviceList: fromJS(cacheDeviceList),
  /**
   * 示例
   * {
   *   groupId: [],
   *   groupId: []
   * }
   * (弃用)
   */
  deviceIdsInGroup: fromJS(cacheDeviceIdsInGroup)
}

const getters = {
  /**
   * 所有设备列表，跨项目的，个人所有项目所有设备，简要信息
   * @param {String} projectId 项目id
   */
  deviceAll: state => ({ projectId } = {}) => {
    let devices = Object.values(state.all.toJS())

    if (projectId) {
      devices = devices.filter(item => item.project === projectId)
    }
    return devices
  },

  /**
   * 某个项目内的设备列表
   * @param {*String} options.projectId 项目id
   * @param {Array} options.ids 设备id
   * @param {String} options.name 设备名称，模糊查询
   * @param {String} options.groupId 所属分组id
   * @param {Boolean} options.isOnline 是否在线
   * @param {Boolean} options.isOpen 是否打开
   * @param {Boolean} options.isWarning 是否告警
   * @param {Boolean} options.isDisable 是否停用
   */
  deviceList: state => ({ ids, projectId, name, groupId, isOnline, isOpen, isWarning, isDisable } = {}) => {
    let devices = Object.values(state.deviceList.toJS())

    devices = devices.filter(item => item.project === projectId)
    if (ids && ids.length) {
      devices = devices.filter(item => ids.indexOf(item.id) > -1)
    }
    if (name) {
      devices = devices.filter(item => item.name.indexOf(name) > -1)
    }
    if (groupId) {
      devices = devices.filter(item => item.group === groupId)
    }
    if (typeof isOnline === 'boolean') {
      devices = devices.filter(item => item.isOnline === isOnline)
    }
    if (typeof isOpen === 'boolean') {
      devices = devices.filter(item => item.isOpen === isOpen)
    }
    if (typeof isWarning === 'boolean') {
      devices = devices.filter(item => item.isWarning === isWarning)
    }
    if (typeof isDisable === 'boolean') {
      devices = devices.filter(item => item.isDisable === isDisable)
    }
    devices = devices.sort((prev, next) => prev.name < next.name ? -1 : 1)
    return devices
  },

  /**
   * 分组内的设备列表 (弃用)
   * @param {*String} options.projectId 项目id
   * @param {*String} options.groupId
   */
  deviceListInGroup: (state, getters) => ({ projectId, groupId } = {}) => {
    const deviceIds = state.deviceIdsInGroup.get(groupId, List()).toJS()
    return getters.deviceList({ ids: deviceIds, projectId })
  },
  /**
   * 单个设备
   * @param {*String} id 设备id
   */
  device: (state, getters) => id => {
    return state.deviceList.get(id, Map()).toJS()
  }
}

const actions = {
  /**
   * 新增设备
   * @param {*String} options.projectId 所属项目id
   * @param {*String} options.name 设备名称
   * @param {*String} options.snHexadecimal 十六进制的sn号
   * @param {*String} options.pnHexadecimal 十六进制的pn号
   * @param {*Number} options.lng 经度
   * @param {*Number} options.lat 纬度
   * @param {*Number} options.paramSettingMode 参数设置模式,1-默认；2-自定义（如果电池电压选其他此参数值则为2-自定义，否则为1-默认）
   * @param {*Number} options.batteryType 电池类型（1-磷酸铁锂；2-三元锂；3-铅酸；）
   * @param {*Number} options.batteryVoltage 电池电压（如电池类型选中磷酸铁锂有12V，24V，其他）
   * @param {*Number} options.batteryOverVoltage 电池超压电压（用于充电停止电压），单位：V
   * @param {*Number} options.batteryOverToBackVoltage 电池超压恢复电压，单位：V
   * @param {*Number} options.batteryLowVoltage 电池低压电压（用于停止亮灯电压），单位：V
   * @param {*Number} options.batteryLowToBackVoltage 电池低压恢复电压，单位：V
   * @param {*Number} options.ledRatedCurrent LED灯额定电流，单位：A
   * @param {*Number} options.dayThreshold 光控天亮阈值，单位：V
   * @param {*Number} options.nightThreshold 光控天黑阈值，单位：V
   */
  async createDevice ({ commit, state }, options) {
    try {
      const entities = await http.device.create(options)
      commit('create_device', entities.get('devices', Map()))
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 删除设备
   * @param {*String} options.deviceId 设备id
   */
  async destroyDevice ({ commit }, { deviceId } = {}) {
    try {
      await http.device.destroyById(deviceId)
      commit('destroy_device', deviceId)
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 修改设备
   * @param {*String} options.id 设备id
   * @param {*String} options.name 设备名称
   * @param {*Number} options.lng 经度
   * @param {*Number} options.lat 纬度
   */
  async updateDevice ({ commit }, options) {
    try {
      const entities = await http.device.updateById(options)
      commit('update_device', entities.get('devices', Map()))
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 获取设备列表，跨项目的，个人所有项目所有设备，简要信息
   * @param {String} projectId 项目id
   */
  async getDeviceAll ({ commit }, { projectId } = {}) {
    try {
      const entities = await http.device.findAll(projectId)
      commit('set_device_all', entities.get('devices_simple', Map()))
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 获取设备列表
   * @param {String} options.projectId 项目id
   */
  async getDeviceList ({ commit }, { projectId } = {}) {
    try {
      const entities = await http.device.find({ projectId })
      commit('set_device_list', entities.get('devices', Map()))
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 获取设备列表 分页
   * @param {*String} options.projectId 项目id
   * @param {*String} options.pageNo 当前页
   * @param {*String} options.pageSize 每页条数
   * @param {*String} options.name 设备名称
   * @param {String} options.isDisabled 是否过滤停用设备 true, false
   * @param {String} options.statusType 按状态查询的条件
   * @param {String} options.gruopId 分组id
   */
  async getDeviceListByPagi ({ commit }, options) {
    try {
      return await http.device.findByPagi(options)
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 获取分组内的设备id列表
   * @param {*String} options.projectId 项目id
   * @param {*String} options.groupId 分组id
   */
  async getDeviceIdsInGroup ({ commit }, options) {
    try {
      const ids = await http.device.findIdsInGroup(options)
      commit('set_device_ids_in_group', { groupId: options.groupId, ids })
    } catch (e) {
      throw new Error(e)
    }
  },
  /**
   * 更新移动后分组中的设备id数组
   * @param {*String} options.projectId 项目id
   * @param {*String} options.newId 移动后的分组id
   * @param {*String} options.newGroupName 移动后的分组名
   * @param {*Array} options.ids 移动的设备ID数组
   */
  async updataMoveDevice ({commit}, options) {
    commit('move_device_ids_in_group', options)
  },
  /**
   * 获取单个设备
   * @param {*String} options.deviceId 设备id
   */
  async getDevice ({ commit }, { deviceId } = {}) {
    try {
      const entities = await http.device.findById(deviceId)
      commit('update_device', entities.get('devices', Map()))
      commit('update_strategy', entities.get('strategies', Map()))
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 获取项目告警设备
   * @param {*String} options.projectId 项目id
   * @param {String} options.statusType 状态
   * @param {Boolean} options 是否过滤停用设备
   */
  async getDeviceByAlerts ({commit}, options) {
    const data = await http.device.findDevicesInAlerts(options)
    return data
  },

  /**
   * 获取设备告警信息
   * @param {*String} deviceId 设备id
   * @param {*String} options.pageNo 当前页
   * @param {*String} options.pageSize 每页条数
   * @param {String} options.isRead 搜索的告警状态是否是已读（1 查询已读;0 查询未读;null 查询全部）
   */
  async getAlertsInfoById ({commit}, options) {
    const data = await http.device.findAlertsById(options)
    return data
  },

   /**
   * 处理设备
   * @param {*String} deviceId 设备id
   */
  async disposeDevice ({ commit, dispatch }, deviceId) {
    const data = await http.device.disposeById(deviceId)
    return data
  },

  /**
   * 关联信息
   */
  async setDeviceRelation ({ commit, dispatch }) {
  },

  /**
   * 获取产品参数列表
   */
  async getParams ({ commit }) {
    try {
      const entities = await http.device.findParams()
      commit('set_device_params', entities)
    } catch (e) {
      throw new Error(e)
    }
  }

}

const mutations = {
  create_device (state, newDevice) {
    state.deviceList = state.deviceList.merge(newDevice)
    setSessionStorage('device_list', state.deviceList)
  },
  destroy_device (state, id) {
    state.deviceList = state.deviceList.delete(id)
    setSessionStorage('device_list', state.deviceList)
  },
  update_device (state, newDevice) {
    state.deviceList = state.deviceList.merge(newDevice)
    setSessionStorage('device_list', state.deviceList)
  },
  set_device_list (state, devices) {
    state.deviceList = devices
    setSessionStorage('device_list', state.deviceList)
  },
  set_device_ids_in_group (state, { groupId, ids }) {
    state.deviceIdsInGroup = state.deviceIdsInGroup.set(groupId, ids)
    setSessionStorage('device_ids_in_group', state.deviceIdsInGroup)
  },
  move_device_ids_in_group (state, { newId, newGroupName, ids }) {
    state.deviceList = state.deviceList.withMutations(map => {
      ids.forEach(item => {
        map.update(item, val => val.set('group', newId).set('groupName', newGroupName))
      })
    })
    setSessionStorage('device_list', state.deviceList)
  },
  set_device_all (state, all) {
    state.all = state.all.merge(all)
    setSessionStorage('device_all', state.all)
  },
  // 启用、停用设备后本地修改状态
  update_device_state (state, { deviceId, newState }) {
    newState = newState === 'disable'
    state.deviceList = state.deviceList.withMutations(map => {
      deviceId.forEach(item => {
        map.update(item, val => val.set('isDisable', newState))
      })
    })
    setSessionStorage('device_list', state.deviceList)
  },
  set_device_params (state, productParams) {
    state.productParams = productParams
    setSessionStorage('device_params', state.productParams)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}

/**
 * 备注：文件中所有的 entities 为格式化后返回的对象
 */



// WEBPACK FOOTER //
// ./src/store/modules/device.js