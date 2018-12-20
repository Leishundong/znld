/**
 * 操作日志字段
 * @param {String} id 主键
 * @param {String} username 操作人
 * @param {String} type 操作类型（ACTIVATED-激活；SET_PARAM-设置参数；SET_UNACTIVATED-反激活；SET_STRATEGY_TO_MOTE-设置策略；SWITCH_CONTROL-开关灯；SET_STRATEGY_GROUP-设置分组）
 * @param {String} content 操作具体内容
 * @param {timestamp} createTime 创建时间
 */
import http from 'http'
import { Map, fromJS } from 'immutable'
import { getSessionStorage, setSessionStorage } from 'tools/storage'

const cacheLogList = getSessionStorage('log_list') || {}

const state = {
  /**
   * 示例
   * {
   *   id: { id, name },
   *   id: { id, name }
   * }
   */
  logList: fromJS(cacheLogList)
}

const getters = {
  /**
   * 日志列表
   * @param {*String} options.deviceId 设备id
   */
  logList: state => ({ deviceId } = {}) => {
    const logs = Object.values(state.logList.get(deviceId, Map()).toJS())
    const res = logs.sort((prev, next) => next.createTime - prev.createTime)
    return res
  }
}

const actions = {
  /**
   * 获取操作日志列表
   * @param {*String} options.deviceId 设备id
   * @param {*Number} options.currentPage 页码
   * @param {String} options.date 日期
   */
  async getLogList ({ commit }, options) {
    try {
      const entities = await http.log.find(options)
      commit('update_log_list', { deviceId: options.deviceId, logs: entities.get('logs', Map()) })
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 清空操作日志
   */
  async clearLogList ({ commit }) {
    try {
      commit('clear_log_list')
    } catch (e) {
      throw new Error(e)
    }
  }
}

const mutations = {
  update_log_list (state, { deviceId, logs }) {
    state.logList = state.logList.mergeIn([deviceId], logs)
    setSessionStorage('log_list', state.logList)
  },
  clear_log_list (state) {
    state.logList = Map()
    setSessionStorage('log_list', state.logList)
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
// ./src/store/modules/log.js