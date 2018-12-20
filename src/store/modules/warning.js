/**
 * 告警字段
 * @param {String} id 主键
 * @param {String} deviceId 告警设备id
 * @param {String} deviceName 告警设备名称
 * @param {Number} type 告警类型（1-太阳能板故障;2-LED空载;3-LED过流;4-温度过高/过低;5-电池低压;6-灭灯）
 * @param {Number} level 告警等级（1-error）
 * @param {Number} state 处理状态（1-未处理；2-处理中；3-已处理; 4-无需处理; 5-已读）
 * @param {String} text 告警内容
 * @param {timestamp} updateTime 更新时间
 * @param {String} project 所属项目id
 */
import http from 'http'
import { Map, fromJS } from 'immutable'
import moment from 'moment'
import { getSessionStorage, setSessionStorage } from 'tools/storage'

const cacheWarningList = getSessionStorage('warning_list') || {}

const state = {
  /**
   * 示例
   * {
   *   id: { id, text },
   *   id: { id, text }
   * }
   */
  warningList: fromJS(cacheWarningList)
}

const getters = {
  /**
   * 告警列表
   * @param {*String} options.projectId 项目id
   * @param {String} options.text 告警内容，模糊查询
   * @param {timestamp} options.start 起始时间
   * @param {timestamp} options.end 结束时间
   * @param {Array} options.ids 告警id数组
   * @param {Array|String} options.deviceId 告警设备id
   * @param {String} options.deviceName 告警设备名称
   * @param {String} options.stateNumber 状态
   */
  warningList: state => ({ projectId, ids, text, start, end, deviceId, deviceName, stateNumber } = {}) => {
    let warnings = Object.values(state.warningList.toJS())

    warnings = warnings.filter(item => item.project === projectId)
    if (ids && ids.length) {
      warnings = warnings.filter(item => ids.indexOf(item.id) > -1)
    }
    if (text) {
      warnings = warnings.filter(item => item.text.indexOf(text) > -1)
    }
    if (start) {
      warnings = warnings.filter(item => moment(item.updateTime).isAfter(start))
    }
    if (end) {
      warnings = warnings.filter(item => moment(item.updateTime).isBefore(end))
    }
    if (deviceId && deviceId.length) {
      if (typeof deviceId === 'string') {
        deviceId = deviceId.split(' ')
      }
      warnings = warnings.filter(item => deviceId.indexOf(item.deviceId) > -1)
    }
    if (deviceName) {
      warnings = warnings.filter(item => item.deviceName.indexOf(deviceName) > -1)
    }
    if (typeof stateNumber === 'number') {
      warnings = warnings.filter(item => item.state === stateNumber)
    }
    const res = warnings.sort((prev, next) => next.updateTime - prev.updateTime)
    return res
  },

  /**
   * 单个告警
   * @param {*String} id 告警id
   */
  warning: (state, getters) => id => {
    return state.warningList.get(id, Map()).toJS()
  }
}

const actions = {
  /**
   * 新增告警
   * @param {*String} options.projectId 项目id
   * @param {*Number} options.alertType 告警类型
   * @param {*Number} options.alertLevel 告警等级
   * @param {*String} options.alertText 告警内容
   */
  async createWarning ({ commit, state }, options) {
    try {
      const entities = await http.warning.create(options)
      commit('create_warning', entities.get('warnings', Map()))
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 删除告警
   * @param {*String} data.id 告警id
   */
  async destroyWarning ({ commit }, { id }) {
    try {
      await http.warning.destroyById(id)
      commit('destroy_warning', id)
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 修改告警（标记已读）（批量）
   * @param {*String} options.projectId 项目id
   * @param {*Array} options.ids 告警id
   *
   * @return {Array} 修改失败的告警id列表，示例 ['1', '2']
   */
  async updateWarning ({ commit }, options) {
    try {
      const { successIds, failIds } = await http.warning.updateById(options)
      const idsSuccess = successIds.map(item => item.toString())
      const idsFail = failIds.map(item => item.toString())
      commit('update_warning_read', { ids: idsSuccess, newState: 'read' })
      return idsFail
    } catch (err) {
      throw new Error(err)
    }
  },

  /**
   * 获取告警列表
   * @param {*String} options.projectId 项目id
   */
  async getWarningList ({ commit }, options) {
    try {
      const entities = await http.warning.findAll(options)
      commit('set_warning_list', entities.get('warnings', Map()))
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 获取告警列表 分页
   * @param {*String} options.projectId 项目id
   * @param {*String} options.pageNo 当前页
   * @param {*String} options.pageSize 每页条数
   * @param {name} options.name 设备名称
   * @param {alertStatus} options.alertStatus 告警状态；1-未处理���5-已读
   * @param {beginDate} options.beginDate 起始时间
   * @param {endDate} options.endDate 结束时间
   */
  async getWarningByGagi ({ commit }, options) {
    try {
      let warnings = await http.warning.findByGagi(options)
      return warnings
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 获取单个告警
   * @param {*String} data.id 告警id
   */
  async getWarning ({ commit }, { id }) {
    try {
      const entities = await http.warning.findById(id)
      commit('update_warning', entities.get('warnings', Map()))
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 关联信息
   */
  async setWarningRelation ({ commit, dispatch }) {
  }
}

const mutations = {
  create_warning (state, newWarning) {
    state.warningList = state.warningList.merge(newWarning)
    setSessionStorage('warning_list', state.warningList)
  },
  destroy_warning (state, id) {
    state.warningList = state.warningList.delete(id)
    setSessionStorage('warning_list', state.warningList)
  },
  update_warning (state, newWarning) {
    state.warningList = state.warningList.merge(newWarning)
    setSessionStorage('warning_list', state.warningList)
  },
  update_warning_read (state, { ids, newState }) {
    newState = newState === 'read' ? 5 : 1
    state.warningList = state.warningList.withMutations(map => {
      ids.forEach(item => {
        map.update(item, val => val.set('state', newState))
      })
    })
  },
  set_warning_list (state, warnings) {
    state.warningList = warnings
    setSessionStorage('warning_list', state.warningList)
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
// ./src/store/modules/warning.js