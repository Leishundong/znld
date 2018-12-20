/**
 * 配置字段
 * @param {String} project 项目id
 * @param {Number} brightness 默认亮度
 */
import http from 'http'
import { fromJS } from 'immutable'
import { getSessionStorage, setSessionStorage } from 'tools/storage'

const cacheConfigList = getSessionStorage('config_list') || {}

const state = {
  /**
   * 示例
   * {
   *   brightness: ''
   * }
   */
  configList: fromJS(cacheConfigList)
}

const getters = {
  /**
   * 配置列表
   * @param {*String} projectId 项目id
   * @return {Array} 所有的配置，示例 [{ label: 'brightness', value: '', project: '' }]
   */
  configList: state => ({ projectId } = {}) => {
    const configs = state.configList.toJS()
    const res = []
    for (let key in configs) {
      if (key === 'project') continue
      res.push({ label: key, value: configs[key], project: configs.project })
    }
    const filters = res.filter(item => item.project === projectId)
    return filters
  },

  /**
   * 单个配置
   * @param {*String} label 配置名称
   */
  config: state => label => {
    const value = state.configList.get(label, '')
    return { label, value }
  }
}

const actions = {
  /**
   * 修改配置
   * @param {*String} options.projectId 项目id
   * @param {Number} options.projectDefaultBrightness 默认亮度
   */
  async updateConfig ({ commit }, options) {
    try {
      const configs = await http.config.updateById(options)
      commit('set_config_list', configs)
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 获取配置列表
   * @param {*String} options.projectId 配置id
   */
  async getConfigList ({ commit }, options) {
    try {
      const configs = await http.config.findAll(options.projectId)
      commit('set_config_list', configs)
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 关联信息
   */
  async setConfigRelation ({ commit, dispatch }) {
  }
}

const mutations = {
  create_config (state, newConfig) {
    state.configList = state.configList.merge(newConfig)
    setSessionStorage('config_list', state.configList)
  },
  destroy_config (state, id) {
    state.configList = state.configList.delete(id)
    setSessionStorage('config_list', state.configList)
  },
  update_config (state, newConfig) {
    state.configList = state.configList.merge(newConfig)
    setSessionStorage('config_list', state.configList)
  },
  set_config_list (state, configs) {
    state.configList = configs
    setSessionStorage('config_list', state.configList)
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
// ./src/store/modules/config.js