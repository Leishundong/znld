/**
 * 按日统计字段
 * @param {String} id 主键
 * @param {String} time 时间，示例：01:40
 * @param {Number} solarVoltage 太阳能板电压 V
 * @param {Number} solarCurrent 太阳能板电流 A
 * @param {Number} solarPower 太阳能板功率
 * @param {Number} batteryVolt 蓄电池电压 V
 * @param {Number} batteryCurr 蓄电池电流 A
 * @param {Number} batteryPower 蓄电池功率
 * @param {Number} ledVoltage LED电压 V
 * @param {Number} ledCurrent LED电流 A
 * @param {Number} ledPower LED功率
 * @param {Number} cellCharge 电池充电量 WH
 * @param {Number} cellDischarge 电池放电量 WH
 * @param {Number} cellResidue 电池剩余电量 WH
 * @param {Number} brightness 亮度
 * @param {Number} temperatures 环境温度 ℃
 * @param {Number} signalValue 信号值
 *
 * 统计充电量、放电量
 * @param {String} date 日期
 * @param {String} cellCharge 充电量 WH
 * @param {String} cellDisCharge 放电量 WH
 *
 * 统计亮灯时长
 * @param {String} date 日期
 * @param {String} lightTime 时长 h
 *
 * 项目概览信息
 * @param {Number} all 总数
 * @param {Number} light 亮灯数
 * @param {Number} online 在线数
 * @param {Number} error 异常数
 */
import http from 'http'
import { Map, fromJS } from 'immutable'
import { getSessionStorage, setSessionStorage } from 'tools/storage'

const cacheStatus = getSessionStorage('status') || {}
const cacheCharge = getSessionStorage('charge') || {}
const cacheCount = getSessionStorage('count') || {}
const cacheLighting = getSessionStorage('lighting') || {}

const state = {
  /**
   * 单日所有状态统计数据
   * {
   *   id: {
   *     date: { time: {}, time: {} }
   *     date: { time: {}, time: {} }
   *   },
   *   id: {
   *     date: { time: {}, time: {} }
   *     date: { time: {}, time: {} }
   *   },
   * }
   */
  status: fromJS(cacheStatus),

  /**
   * 充放电数据统计
   * {
   *   id: {
   *     date: {}
   *     date: {}
   *   },
   *   id: {
   *     date: {}
   *     date: {}
   *   },
   * }
   */
  charge: fromJS(cacheCharge),

  /**
   * 亮灯时长数据统计
   * {
   *   id: {
   *     date: {}
   *     date: {}
   *   },
   *   id: {
   *     date: {}
   *     date: {}
   *   },
   * }
   */
  lighting: fromJS(cacheLighting),

  /**
   * 项目概览信息统计
   * {
   *   id: {},
   *   id: {}
   * }
   */
  count: fromJS(cacheCount)
}

const getters = {
  /**
   * 单日统计数据
   * @param {*String} deviceId 设备id
   * @param {*date} 日期，示例：2018-01-24
   */
  statisticStatus: state => ({ deviceId, date }) => {
    const statistic = state.status.getIn([deviceId, date], Map()).toJS()
    const result = Object.values(statistic).sort((prev, next) => {
      const prevTime = prev.time
      const nextTime = next.time
      if (prevTime < nextTime) return -1
      if (prevTime > nextTime) return 1
      return 0
    })
    const prev = result.filter(item => item.time >= '07:00')
    const next = result.filter(item => item.time < '07:00')
    return prev.concat(next)
  },

  /**
   * 充放电数据统计
   * @param {*String} deviceId 设备id
   * @param {*start} 日期，示例：2018-01-24
   * @param {*end} 日期，示例：2018-01-24
   */
  statisticCharge: state => ({ deviceId, start, end }) => {
    const statistic = state.charge.get(deviceId, Map()).filter((value, key) => key >= start && key <= end).toJS()
    const result = Object.values(statistic).sort((prev, next) => {
      const prevDate = prev.date
      const nextDate = next.date
      if (prevDate < nextDate) return -1
      if (prevDate > nextDate) return 1
      return 0
    })
    return result
  },

  /**
   * 亮灯时长数据统计
   * @param {*String} deviceId 设备id
   * @param {*start} 日期，示例：2018-01-24
   * @param {*end} 日期，示例：2018-01-24
   */
  statisticLighting: state => ({ deviceId, start, end }) => {
    const statistic = state.lighting.get(deviceId, Map()).filter((value, key) => key >= start && key <= end).toJS()
    const result = Object.values(statistic).sort((prev, next) => {
      const prevDate = prev.date
      const nextDate = next.date
      if (prevDate < nextDate) return -1
      if (prevDate > nextDate) return 1
      return 0
    })
    return result
  },

  /**
   * 获取���目概览信息
   * @param {*String} projectId 项目id
   */
  statisticCount: state => ({ projectId }) => {
    const statistic = state.count.get(projectId, Map()).toJS()
    return statistic
  }
}

const actions = {
  /**
   * 获取设备单日统计
   * @param {*String} deviceId 设备id
   * @param {*String} date 日期，示例：2018-01-24
   */
  async getStatisticStatus ({ commit }, { deviceId, date }) {
    try {
      const entities = await http.statistic.findStatus(deviceId, date)
      commit('set_statistic_status', { deviceId, date, statistic: entities.get('statistic_status', Map()) })
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 统计充放电量
   * @param {*String} deviceId 设备id
   * @param {*String} start 起始日期，示例 2018-01-25
   * @param {*String} end 结束日期，示例 2018-01-26
   */
  async getStatisticCharge ({ commit }, { deviceId, start, end }) {
    try {
      const entities = await http.statistic.findCharge(deviceId, start, end)
      commit('set_statistic_charge', { deviceId, statistic: entities.get('statistic_charge', Map()) })
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 统计亮灯时间
   * @param {*String} deviceId 设备id
   * @param {*String} start 起始日期，示例 2018-01-25
   * @param {*String} end 结束日期，示例 2018-01-26
   */
  async getStatisticLighting ({ commit }, { deviceId, start, end }) {
    try {
      const entities = await http.statistic.findLighting(deviceId, start, end)
      commit('set_statistic_lighting', { deviceId, statistic: entities.get('statistic_lighting', Map()) })
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 获取项目概览信息
   * @param {*String} projectId 项目id
   */
  async getStatisticCount ({ commit }, { projectId }) {
    try {
      const count = await http.statistic.findCount(projectId)
      commit('set_statistic_count', count)
    } catch (e) {
      throw new Error(e)
    }
  }
}

const mutations = {
  set_statistic_status (state, { deviceId, date, statistic }) {
    state.status = state.status.updateIn([deviceId, date], Map(), val => val.merge(statistic))
    setSessionStorage('status', state.status)
  },
  set_statistic_charge (state, { deviceId, statistic }) {
    state.charge = state.charge.update(deviceId, Map(), val => val.merge(statistic))
    setSessionStorage('charge', state.charge)
  },
  set_statistic_lighting (state, { deviceId, statistic }) {
    state.lighting = state.lighting.update(deviceId, Map(), val => val.merge(statistic))
    setSessionStorage('lighting', state.lighting)
  },
  set_statistic_count (state, count) {
    state.count = state.count.merge(count)
    setSessionStorage('count', state.count)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}



// WEBPACK FOOTER //
// ./src/store/modules/statistic.js