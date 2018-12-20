import http from 'http'
import { Map } from 'immutable'

const state = {
  /**
   * 分组应用的策略
   * {
   *   groupId: {strategy},
   *   groupId: {strategy}
   * }
   */
  strategyInGroup: Map(),

  /**
   * 设备应用策略
   * {
   *   deviceId: {strategy},
   *   deviceId: {strategy}
   * }
   */
  strategyInDevice: Map()
}

const getters = {
  /**
   * 分组应用的策略，具体字段查看 strategy 模块
   * @param {*String} groupId 分组id
   */
  strategyInGroup: state => ({ groupId } = {}) => {
    return state.strategyInGroup.get(groupId, Map()).toJS()
  },

  /**
   * 设备应用策略，具体字段查看 strategy 模块
   * @param {*String} deviceId 设备id
   */
  strategyInDevice: state => ({ deviceId } = {}) => {
    return state.strategyInDevice.get(deviceId, Map()).toJS()
  }
}

const actions = {
  /**
   * 获取分组的应用策略
   * @param {*String} groupId 分组id
   */
  async getStrategyInGroup ({ commit }, { groupId } = {}) {
    try {
      const entities = await http.command.findStrategyInGroup(groupId)
      commit('set_strategy_in_group', entities)
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 获取设备的应用策略
   * @param {*String} deviceId 设备id
   */
  async getStrategyInDevice ({ commit }, { deviceId } = {}) {
    try {
      const entities = await http.command.findStrategyInDevice(deviceId)
      commit('set_strategy_in_device', entities)
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 下发参数
   * @param {*String} options.id 设备id
   * @param {*Number} options.paramSettingMode 参数设置模式,1-默认；2-自定义（如果电池电压选其他此参数值则为2-自定义，否则为1-默认）
   * @param {*Number} options.batteryType 电池类型（1-磷酸铁锂；2-三元锂；3-铅酸；）
   * @param {*Number} options.batteryVoltage 电池电压（如电池���型选中磷酸铁锂有12V，24V，其他）
   * @param {*Number} options.batteryOverVoltage 电池超压电压（用于充电停止电压），单位：V
   * @param {*Number} options.batteryOverToBackVoltage 电池超压恢复电压，单位：V
   * @param {*Number} options.batteryLowVoltage 电池低压电压（用于停止亮灯电压），单位：V
   * @param {*Number} options.batteryLowToBackVoltage 电池低压恢复电压，单位：V
   * @param {*Number} options.ledRatedCurrent LED灯额定电流，单位：A
   * @param {*Number} options.dayThreshold 光控天亮阈值，单位：V
   * @param {*Number} options.nightThreshold 光控天黑阈值，单位：V
   */
  async updateDeviceConfig ({ commit }, options) {
    try {
      const entities = await http.command.updateConfig(options)
      commit('update_device', entities.get('devices', Map()))
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 对分组下发策略
   * @param {*String} groupId 分组id
   * @param {*String} strategyId 策略id
   */
  async updateGroupStrategy ({ commit }, { groupId, strategyId }) {
    try {
      await http.command.updateGroupStrategy(groupId, strategyId)
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 对设备下发策略
   * @param {*String} deviceId 设备id
   * @param {*String} strategyId 策略id
   */
  async updateDeviceStrategy ({ commit }, { deviceId, strategyId }) {
    try {
      await http.command.updateDeviceStrategy(deviceId, strategyId)
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 设置分组
   * @param {*String} options.projectId 项目id
   * @param {*String} options.groupId 分组id
   * @param {*Array} options.deviceId 修改后分组内的设备id列表
   */
  async updateDeviceInGroup ({ commit }, { projectId, groupId, deviceId } = {}) {
    try {
      let data = await http.command.updateInGroup(projectId, groupId, deviceId)
      return data
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 启用、停用设备（批量）
   * @param {*String} options.projectId 项目id
   * @param {*Array} options.deviceId 设备id
   * @param {*String} options.type 更新后的状态，可选值（enable, disable）
   *
   * @return {Array} 修改失败的设备id列表，示例 ['1', '2']
   */
  async updateDeviceState ({ commit }, { projectId, deviceId, type } = {}) {
    try {
      const { successIds, failIds } = await http.command.updateDeviceState(projectId, deviceId, type)
      const idsSuccess = successIds.map(item => item.toString())
      const idsFail = failIds.map(item => item.toString())
      commit('update_device_state', { deviceId: idsSuccess, newState: type })
      return idsFail
    } catch (err) {
      throw new Error(err)
    }
  },

  /**
   * 启用、停用设备（批量）
   * @param {*String} options.projectId 项目id
   * @param {*Array} options.deviceId 设备id
   * @param {*String} options.password
   */
  async destroyDeviceByBatch ({ commit, dispatch }, { projectId, deviceId, password } = {}) {
    try {
      await http.command.destroyByIds(projectId, deviceId, password)
      await dispatch('getDeviceList', { projectId })
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 更新设备状态
   * @param {*String} projectId 项目id
   * @param {*Array} deviceId 设备id
   */
  async updateDeviceStatus ({ commit, dispatch }, { projectId, deviceId }) {
    try {
      await http.command.updateStatus(projectId, deviceId)
      await new Promise(resolve => setTimeout(() => resolve(), 5000))
      await dispatch('getDeviceList', { projectId })
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 开、关、调光（批量）
   * @param {*String} projectId 项目id
   * @param {*Array} deviceId 设备id
   * @param {*String} type 操作类型，可选值：open, close, dimme
   * @param {Number} brightness 亮度 调光时，需要该参数
   */
  async updateDeviceLevel ({ commit, dispatch }, { projectId, deviceId, type, brightness }) {
    try {
      await http.command.dimmeLevel(projectId, deviceId, type, brightness)
      await new Promise(resolve => setTimeout(() => resolve(), 5000))
      await dispatch('getDeviceList', { projectId })
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 对分组进行开关、调光
   * @param {*String} groupId 分组id
   * @param {*Number} switchState 状态 1-开、2-关、3-调光
   * @param {*Number} brightness 亮度 调光时，需要该参数
   */
  async updateDimmeInGroup ({ commit }, { groupId, switchState, brightness }) {
    try {
      await http.command.dimmeInGroup(groupId, switchState, brightness)
      await new Promise(resolve => setTimeout(() => resolve(), 3000))
    } catch (e) {
      throw new Error(e)
    }
  }
}

const mutations = {
  set_strategy_in_group (state, strategy) {
    state.strategyInGroup = state.strategyInGroup.merge(strategy)
  },
  set_strategy_in_device (state, strategy) {
    state.strategyInDevice = state.strategyInDevice.merge(strategy)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}



// WEBPACK FOOTER //
// ./src/store/modules/command.js