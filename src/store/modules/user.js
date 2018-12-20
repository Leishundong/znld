/**
 * 用户字段
 * @param {String} id 用户id
 * @param {String} username 用户名
 * @param {String} roleName 角色（拥有者--OWNER，协作管理员--MANAGER，一般成员--MEMBER，只读成员--GUEST）
 * @param {String} project 项目id
 */
import http from 'http'
import { Map, fromJS } from 'immutable'
import { getSessionStorage, setSessionStorage } from 'tools/storage'

const cacheUserList = getSessionStorage('user_list') || {}

const state = {
  /**
   * 项目内的参与用户列表
   * 示例
   * {
   *   id: {},
   *   id: {}
   * }
   */
  userList: fromJS(cacheUserList)
}

const getters = {
  /**
   * 用户列表
   * @param {*String} options.projectId 项目id
   * @param {String} options.nickname 用户昵称
   */
  userList: state => ({ projectId, nickname } = {}) => {
    let users = Object.values(state.userList.toJS())

    users = users.filter(item => item.project === projectId)
    if (nickname) {
      users = users.filter(user => user.nickname.indexOf(nickname) > -1)
    }
    return users
  },

  /**
   * 单个用户
   * @param {*String} id 用户id
   */
  user: (state, getters) => id => {
    return state.userList.get(id, Map()).toJS()
  }
}

const actions = {
  /**
   * 邀请用户加入自己的项目
   * @param {*String} options.projectId 所属项目id
   * @param {*String} options.username 用户名称
   * @param {*String} options.roleName 角色
   */
  async createUser ({ commit, state }, options) {
    try {
      const entities = await http.user.create(options)
      commit('create_user', entities.get('users', Map()))
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 将用户移除出自己的项目
   * @param {*String} options.projectId 项目id
   * @param {*String} options.id 用户id
   */
  async destroyUser ({ commit }, { projectId, id } = {}) {
    try {
      await http.user.destroyById(projectId, id)
      commit('destroy_user', id)
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 修改用户（修改成员角色）
   * @param {*String} options.projectId 项目id
   * @param {*String} options.id 用户id
   * @param {*String} options.roleName 角色名
   */
  async updateUser ({ commit }, options) {
    try {
      await http.user.updateById(options)
      commit('update_user', options)
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 获取项目内用户列表
   * @param {*String} options.projectId 项目id
   */
  async getUserList ({ commit }, options) {
    try {
      const entities = await http.user.findAll(options)
      commit('set_user_list', entities.get('users', Map()))
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 关联信息
   */
  async setUserRelation ({ commit, dispatch }) {
  }
}

const mutations = {
  create_user (state, newUser) {
    state.userList = state.userList.merge(newUser)
    setSessionStorage('user_list', state.userList)
  },
  destroy_user (state, id) {
    state.userList = state.userList.delete(id)
    setSessionStorage('user_list', state.userList)
  },
  update_user (state, { id, roleName }) {
    state.userList = state.userList.update(id, val => val.set('roleName', roleName))
    setSessionStorage('user_list', state.userList)
  },
  set_user_list (state, users) {
    state.userList = users
    setSessionStorage('user_list', state.userList)
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
// ./src/store/modules/user.js