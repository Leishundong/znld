/**
 * 分组字段
 * @param {String} id 主键
 * @param {String} name 分组名称
 * @param {String} remark 备注
 * @param {timestamp} createTime 创建时间
 * @param {String} project 所属项目id
 */
import http from 'http'
import { Map, fromJS } from 'immutable'
import { getSessionStorage, setSessionStorage } from 'tools/storage'

const cacheGroupList = getSessionStorage('group_list') || {}

const state = {
  /**
   * 示例
   * {
   *   id: {},
   *   id: {}
   * }
   */
  groupList: fromJS(cacheGroupList)
}

const getters = {
  /**
   * 分组列表
   * @param {String} options.name 分组名，模糊查询
   */
  groupList: state => ({ projectId, name } = {}) => {
    let groups = Object.values(state.groupList.toJS())

    groups = groups.filter(item => item.project === projectId)
    if (name) {
      groups = groups.filter(item => item.name.indexOf(name) > -1)
    }
    return groups
  },

  /**
   * 单个分组
   * @param {*String} id 分组id
   */
  group: (state, getters) => id => {
    return state.groupList.get(id, Map()).toJS()
  }
}

const actions = {
  /**
   * 新增分组
   * @param {*String} options.projectId 项目id
   * @param {*String} options.name 分组名称
   * @param {String} options.remark 备注
   */
  async createGroup ({ commit, state }, options) {
    try {
      const entities = await http.group.create(options)
      commit('create_group', entities.get('groups', Map()))
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 删除分组
   * @param {*String} options.groupId 分组id
   */
  async destroyGroup ({ commit }, { groupId }) {
    try {
      await http.group.destroyById(groupId)
      commit('destroy_group', groupId)
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 修改分组
   * @param {*String} options.id 分组id
   * @param {*String} options.name 分组名称
   * @param {String} options.remark 备注
   */
  async updateGroup ({ commit }, options) {
    try {
      const entities = await http.group.updateById(options)
      commit('update_group', entities.get('groups', Map()))
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 获取分组列表
   * @param {*String} options.projectId 项目id
   */
  async getGroupList ({ commit }, options) {
    try {
      const entities = await http.group.findAll(options)
      commit('set_group_list', entities.get('groups', Map()))
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 获取单个分组
   * @param {*String} options.groupId 分组id
   */
  async getGroup ({ commit }, { groupId }) {
    try {
      const entities = await http.group.findById(groupId)
      commit('update_group', entities.get('groups', Map()))
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 关联信息
   */
  async setGroupRelation ({ commit, dispatch }) {
  }
}

const mutations = {
  create_group (state, newGroup) {
    state.groupList = state.groupList.merge(newGroup)
    setSessionStorage('group_list', state.groupList)
  },
  destroy_group (state, id) {
    state.groupList = state.groupList.delete(id)
    setSessionStorage('group_list', state.groupList)
  },
  update_group (state, newGroup) {
    state.groupList = state.groupList.merge(newGroup)
    setSessionStorage('group_list', state.groupList)
  },
  set_group_list (state, groups) {
    state.groupList = groups
    setSessionStorage('group_list', state.groupList)
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
// ./src/store/modules/group.js