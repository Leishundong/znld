/**
 * 策略字段
 * @param {String} id 主键
 * @param {String} project 所属项目id
 * @param {String} name 策略名称
 * @param {Array} periods 时间段
 *   @param {String} periods.time 时间
 *   @param {Number} periods.brightness 亮度
 * @param {String} offtime 关灯时间
 * @param {Boolean} isLowerLedControl 开启智能功率
 * @param {Boolean} isLightControl 开启光控
 * @param {Boolean} isTrafficControl 开启人流控
 * @param {String} remark 备注
 * @param {Number} weatherDays 天气控天数
 * @param {Number} weatherFactor 天气控因数
 * @param {timestamp} createTime 创建时间
 * @param {timestamp} updateTime 更新时间
 * @param {timestamp} backTime 返回时间
 */
import http from 'http'
import { Map, fromJS } from 'immutable'
import { getSessionStorage, setSessionStorage } from 'tools/storage'

const cacheStrategyList = getSessionStorage('strategy_list') || {}

const state = {
  /**
   * 示例
   * {
   *   id: { id, name },
   *   id: { id, name }
   * }
   */
  strategyList: fromJS(cacheStrategyList)
}

const getters = {
  /**
   * 策略列表
   * @param {String} name 策略名称，模糊查询
   */
  strategyList: state => ({ projectId, name } = {}) => {
    let strategies = Object.values(state.strategyList.toJS())

    strategies = strategies.filter(item => item.project === projectId)
    if (name) {
      strategies = strategies.filter(item => item.name.indexOf(name) > -1)
    }
    return strategies
  },

  /**
   * 单个策略
   * @param {*String} id 策略id
   */
  strategy: (state, getters) => id => {
    return state.strategyList.get(id, Map()).toJS()
  }
}

const actions = {
  /**
   * 新增策略
   * @param {*String} options.projectId 所属项目id
   * @param {*String} options.name 策略名称
   * @param {*Array} options.strategyTimes 时间段
   *   @param {*String} options.strategyTimes.time 时间
   *   @param {*Number} options.strategyTimes.brightness 亮度
   * @param {*String} options.offtime 关灯时间
   * @param {*Boolean} options.lightControl 开启光控
   * @param {*Boolean} options.trafficControl 开启人流控
   * @param {*Boolean} options.lowerLedControl 开启智能功率
   * @param {*String} options.remark 备注
   */
  async createStrategy ({ commit, state }, options) {
    try {
      const entities = await http.strategy.create(options)
      commit('create_strategy', entities.get('strategies', Map()))
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 删除策略
   * @param {*String} options.strategyId 策略id
   */
  async destroyStrategy ({ commit }, { strategyId }) {
    try {
      await http.strategy.destroyById(strategyId)
      commit('destroy_strategy', strategyId)
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 修改策略
   * @param {*String} options.id 策略id
   * @param {*String} options.name 策略名称
   * @param {*Array} options.strategyTimes 时间段
   *   @param {*String} options.strategyTimes.time 时间
   *   @param {*Number} options.strategyTimes.brightness 亮度
   * @param {*String} options.offtime 关灯时间
   * @param {*Boolean} options.lightControl 开启光控
   * @param {*Boolean} options.lowerLedControl 开启智能功率
   * @param {*String} options.remark 备注
   */
  async updateStrategy ({ commit }, options) {
    try {
      const entities = await http.strategy.updateById(options)
      commit('update_strategy', entities.get('strategies', Map()))
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 获取策略列表
   * @param {*String} options.projectId 项目id
   */
  async getStrategyList ({ commit }, options) {
    try {
      const entities = await http.strategy.findAll(options)
      commit('set_strategy_list', entities.get('strategies', Map()))
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 获取单个策略
   * @param {*String} strategyId 策略id
   */
  async getStrategy ({ commit }, { strategyId } = {}) {
    try {
      const entities = await http.strategy.findById(strategyId)
      commit('update_strategy', entities.get('strategies', Map()))
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 关联信息
   */
  async setStrategyRelation ({ commit, dispatch }) {
  }
}

const mutations = {
  create_strategy (state, newStrategy) {
    state.strategyList = state.strategyList.merge(newStrategy)
    setSessionStorage('strategy_list', state.strategyList)
  },
  destroy_strategy (state, id) {
    state.strategyList = state.strategyList.delete(id)
    setSessionStorage('strategy_list', state.strategyList)
  },
  update_strategy (state, newStrategy) {
    state.strategyList = state.strategyList.merge(newStrategy)
    setSessionStorage('strategy_list', state.strategyList)
  },
  set_strategy_list (state, strategies) {
    state.strategyList = strategies
    setSessionStorage('strategy_list', state.strategyList)
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
// ./src/store/modules/strategy.js