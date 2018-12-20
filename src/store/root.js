import http from 'http'
import { List, fromJS, Map } from 'immutable'
import moment from 'moment'
import { setSessionStorage, clearSessionStorage, getSessionStorage } from 'tools/storage'

const cacheCurrentUser = getSessionStorage('currentUser') || {}
const cacheSystemParams = getSessionStorage('systemParams') || {}
const cacheLedParams = getSessionStorage('ledParams') || {}

export const state = {
  /**
   * 示例
   * { auths, expiration, nickname, username, token }
   */
  currentUser: fromJS(cacheCurrentUser),

  // 选中的项目
  currentProject: '',

  // lower_led系统参数
  ledParams: fromJS(cacheLedParams),

  // 系统参数
  systemParams: fromJS(cacheSystemParams),

  // 使用教程
  tutorial: false
}

export const getters = {
  /**
   * 获取教程参数
   */
  tutorialParams: state => () => {
    return state.tutorial
  },
  /**
   * 当前智能功率的参数值
   */
 /* systemParam: state => () => {
    let lowerLed = Object.values(state.systemParams.toJS())
    lowerLed = lowerLed.filter(item => item.paramKey.indexOf('lower_led_param_permission') > -1)
    return lowerLed[0].paramValue
  },
  /!**
   * 获取天盈 零度充电参数值
   *!/
  tianyingMoteModel: state => () => {
    let tianying = Object.values(state.systemParams.toJS())
    tianying = tianying.filter(item => item.paramKey.indexOf('tianying_mote_model') > -1)
    return tianying[0].paramValue
  },*/
  /**
   * 当前项目id
   */
  currentProject: state => () => {
    return state.currentProject
  },

  /**
   * 当前用户是否还有效
   */
  isUserValid: state => () => {
    const expiration = state.currentUser.get('expiration', '')
    return moment(Date.now()).isBefore(expiration)
  },

  /**
   * 当前用户权限
   */
  userAuths: state => () => {
    return state.currentUser.get('auths', List()).toJS()
  },

  /**
   * 当前用户凭证
   */
  userToken: state => () => {
    return state.currentUser.get('token', '')
  },

  /**
   * 当前用户昵称
   */
  userNickname: state => () => {
    return state.currentUser.get('nickname', '')
  },

  /**
   * 当前用户是否为超级用户
   */
  superAdmin: state => () => {
    return state.currentUser.get('superAdmin', '')
  },

  /**
   * 当前用户的角色信息
   */
  roleName: state => () => {
    return state.currentUser.get('roleName', '')
  },

  /**
   * 当前用户的用户名
   */
  username: state => () => {
    return state.currentUser.get('username', '')
  },

  /**
   * 根据projectId计算对于这个项目的角色
   * @param {*String} projectId 项目id
   */
  isOwner: (state, getters) => projectId => {
    return getters.project(projectId).roleName === 'OWNER'
  },
  isManager: (state, getters) => projectId => {
    return getters.project(projectId).roleName === 'MANAGER'
  },
  isMember: (state, getters) => projectId => {
    return getters.project(projectId).roleName === 'MEMBER'
  },
  isGuest: (state, getters) => projectId => {
    return getters.project(projectId).roleName === 'GUEST'
  },
  /**
   * 根据角色名去判断权限
   * @param {*String} projectId 项目id
   */
  authOwner: (state, getters) => projectId => {
    return getters.isOwner(projectId)
  },
  authManager: (state, getters) => projectId => {
    return getters.isOwner(projectId) || getters.isManager(projectId)
  },
  authMember: (state, getters) => projectId => {
    return getters.isOwner(projectId) || getters.isManager(projectId) || getters.isMember(projectId)
  },
  /**
   * 判断是否有操作設備的權限
   * @param {*String} sysRole 系统角色
   */
  isOperatDevice: (state, getters) => (role, sysRole) => {
    let flag = false
    switch (sysRole) {
      case 'ROOT':
      case 'FAE':
      case 'SALE':
      case 'PARTNER':
      case 'OAM':
      case 'DEALER':
        flag = true
        return flag
      default :
        flag = false
        break
    }
    switch (role) {
      case 'OWNER':
      case 'MANAGER':
      case 'MEMBER':
        flag = true
        break
      default :
        flag = false
        break
    }
    return flag
  },
  /**
   * 判断是否有处理设备的权限
   * @param {*String} sysRole 系统角色
   */
  isOperatDeviceDispose: (state, getters) => (role, sysRole) => {
    let flag = false
    switch (role) {
      case 'OWNER':
      case 'MANAGER':
        flag = true
        break
      default :
        flag = false
        break
    }
    return flag
  },
  /**
   * 判断是否有设置智能功率的权限
   * @param {*String} sysRole 系统角色
   */
  isOperatDevicePower: (state, getters) => (role, sysRole) => {
    let flag = false
    switch (role) {
      case 'OWNER':
        flag = true
        break
      default :
        flag = false
        break
    }
    return flag
  },
  /**
   * 判断创建项目权限
   * @param {*String} sysRole 系统角色
   */
  isCreateProject: (state, getters) => (sysRole) => {
    switch (sysRole) {
      case 'SALE':
      case 'PARTNER':
      case 'CUSTOMER':
      case 'TESTER':
      case 'DEALER':
        return true
      default :
        return false
    }
  },
  /**
   * 判断修改项目信息权限
   * @param {*String} role 项目角色
   *
   */
  isModifyProjectInfor: (state, getters) => (role) => {
    switch (role) {
      case 'OWNER':
      case 'MANAGER':
        return true
      default :
        return false
    }
  },
  /**
   * 判断修改项目成员权限
   * @param {*String} role 项目角色
   * @param {*String} sysRole 系统角色
   *
   */
  isManagerProjectNumber: (state, getters) => (role, sysRole) => {
    let flag = false
    switch (sysRole) {
      case 'SALE':
      case 'DEALER':
        flag = true
        return flag
      default :
        flag = false
        break
    }
    switch (role) {
      case 'OWNER':
      case 'MANAGER':
        flag = true
        break
      default :
        flag = false
        break
    }
    return flag
  },
  /**
   * 判断是否是有权限管理项目设备（激活设备）
   * @param {*String} role 项目角色
   * @param {*String} sysRole 系统角色
   *
   */
  isManagerProjectDevice: (state, getters) => (role, sysRole) => {
    let flag = false
    switch (role) {
      case 'OWNER':
      case 'MANAGER':
        flag = true
        break
      default :
        flag = false
        break
    }
    return flag
  },
  /**
   * 判断是否是有权限管理项目设备（修改设备信息）
   * @param {*String} role 项目角色
   * @param {*String} sysRole 系统角色
   *
   */
  isModifyDeviceInfor: (state, getters) => (role, sysRole) => {
    let flag = false
    switch (sysRole) {
      // case 'FAE':
      // case 'SALE':
      // case 'PARTNER':
      // case 'OAM':
      //   flag = true
      //   return flag
      // default :
      //   flag = false
      //   break
    }
    switch (role) {
      case 'OWNER':
      case 'MANAGER':
        flag = true
        break
      default :
        flag = false
        break
    }
    return flag
  },
  /**
   * 判断是否是有权限停用项目设备
   * @param {*String} role 项目角色
   * @param {*String} sysRole 系统角色
   *
   */
  isDisableDevice: (state, getters) => (role, sysRole) => {
    let flag = false
    // case 'SALE':
    switch (sysRole) {
      case 'FAE':
      case 'PARTNER':
      case 'OAM':
        flag = true
        return flag
      default :
        flag = false
        break
    }
    switch (role) {
      case 'OWNER':
      case 'MANAGER':
        flag = true
        break
      default :
        flag = false
        break
    }
    return flag
  },
  /**
   * 判断删除项目设备权限
   * @param {*String} role 项目角色
   *
   */
  isDeleteProjectDevice: (state, getters) => (role) => {
    switch (role) {
      case 'OWNER':
        return true
      default :
        return false
    }
  },
  /**
   * 判断是否是有权限管理项目策略（创建和修改）
   * @param {*String} role 项目角色
   * @param {*String} sysRole 系统角色
   *
   */
  isCreateModifyStaategy: (state, getters) => (role, sysRole) => {
    let flag = false
    switch (sysRole) {
      case 'FAE':
      case 'SALE':
      case 'PARTNER':
      case 'OAM':
      case 'DEALER':
        flag = true
        return flag
      default :
        flag = false
        break
    }
    switch (role) {
      case 'OWNER':
      case 'MANAGER':
        flag = true
        break
      default :
        flag = false
        break
    }
    return flag
  },
  /**
   * 判断是否是有权限删除项目策略
   * @param {*String} role 项目角色
   * @param {*String} sysRole 系统角色
   *
   */
  isDeleteProjectStrategy: (state, getters) => (role, sysRole) => {
    let flag = false
    switch (sysRole) {
      case 'FAE':
      case 'SALE':
      case 'PARTNER':
      case 'OAM':
      case 'DEALER':
        flag = true
        return flag
      default :
        flag = false
        break
    }
    switch (role) {
      case 'OWNER':
      case 'MANAGER':
        flag = true
        break
      default :
        flag = false
        break
    }
    return flag
  },
  /**
   * 判断是否是有权限管理分组（创建、修改、删除）
   * @param {*String} role 项目角色
   * @param {*String} sysRole 系统角色
   *
   */
  isManagerProjectGroup: (state, getters) => (role, sysRole) => {
    let flag = false
    switch (sysRole) {
      case 'FAE':
      case 'SALE':
      case 'PARTNER':
      case 'OAM':
      case 'DEALER':
        flag = true
        return flag
      default :
        flag = false
        break
    }
    switch (role) {
      case 'OWNER':
      case 'MANAGER':
        flag = true
        break
      default :
        flag = false
        break
    }
    return flag
  },
  /**
   * 判断是否是有权限将设备移动分组
   * @param {*String} role 项目角色
   * @param {*String} sysRole 系统角色
   *
   */
  isMoveGroupDevice: (state, getters) => (role, sysRole) => {
    let flag = false
    switch (sysRole) {
      case 'FAE':
      case 'SALE':
      case 'PARTNER':
      case 'OAM':
      case 'DEALER':
        flag = true
        return flag
      default :
        flag = false
        break
    }
    switch (role) {
      case 'OWNER':
      case 'MANAGER':
        flag = true
        break
      default :
        flag = false
        break
    }
    return flag
  },
  /**
   * 判断是否是有权限对分组下发策略和对设备下发参数
   * @param {*String} role 项目角色
   * @param {*String} sysRole 系统角色
   *
   */
  isIssuedStrategyAndDeviceParams: (state, getters) => (role, sysRole) => {
    let flag = false
    switch (sysRole) {
      case 'FAE':
      case 'SALE':
      case 'PARTNER':
      case 'OAM':
      case 'DEALER':
        flag = true
        return flag
      default :
        flag = false
        break
    }
    switch (role) {
      case 'OWNER':
      case 'MANAGER':
        flag = true
        break
      default :
        flag = false
        break
    }
    return flag
  },
  /**
   * 判断是否是有权限管理告警信息（标记已读）
   * @param {*String} role 项目角色
   * @param {*String} sysRole 系统角色
   *
   */
  isManagerProjectWarn: (state, getters) => (role, sysRole) => {
    let flag = false
    switch (sysRole) {
      case 'FAE':
      case 'SALE':
      case 'PARTNER':
      case 'OAM':
      case 'DEALER':
        flag = true
        return flag
      default :
        flag = false
        break
    }
    switch (role) {
      case 'OWNER':
      case 'MANAGER':
        flag = true
        break
      default :
        flag = false
        break
    }
    return flag
  },
  /**
   * 根据功能名去判断权限
   * @param {*String} projectId 项目id
   * @param {*String} functionName 功能名称
   */
  isPermissByFunName: (state, getters) => (projectId, functionName) => {
    let role = ''
    if (projectId !== '') {
      role = getters.project(projectId).roleName
    }
    let sysRole = getters.roleName(state)
    switch (functionName) {
      case 'CREATE_PROJECT':
        return getters.isCreateProject(sysRole)
      case 'MODIFY_PROJECT_INFOR':
        return getters.isModifyProjectInfor(role)
      case 'MANAGER_PROJECT_NUMBER':
        return getters.isManagerProjectNumber(role, sysRole)
      case 'MANAGER_PROJECT_DEVICE':
        return getters.isManagerProjectDevice(role, sysRole)
      case 'MODIFY_DEVICE_INFOR':
        return getters.isModifyDeviceInfor(role, sysRole)
      case 'DISABLE_DEVICE':
        return getters.isDisableDevice(role, sysRole)
      case 'DELETE_PROJECT_DEVICE':
        return getters.isDeleteProjectDevice(role)
      case 'CREATE_MODIFY_STRATEGY':
        return getters.isCreateModifyStaategy(role, sysRole)
      case 'DELETE_STRATEGY':
        return getters.isDeleteProjectStrategy(role, sysRole)
      case 'MANAGER_PROJECT_GROUP':
        return getters.isManagerProjectGroup(role, sysRole)
      case 'MOVE_GROUP_DEVICE':
        return getters.isMoveGroupDevice(role, sysRole)
      case 'ISSUED_STRATEGY_AND_DEVICE_PARAMS':
        return getters.isIssuedStrategyAndDeviceParams(role, sysRole)
      case 'MANAGER_PROJECT_WARN':
        return getters.isManagerProjectWarn(role, sysRole)
      case 'OPERAT_DEVICE_STATUS':
        return getters.isOperatDevice(role, sysRole)
      case 'OPERAT_DEVICE_DISPOSE':
        return getters.isOperatDeviceDispose(role, sysRole)
      case 'OPERAT_DEVICE_POWER':
        return getters.isOperatDevicePower(role, sysRole)
      default :
        return false
    }
  }
}

export const actions = {
  /**
   * 设置选中项目
   * @param {*String} projectId 项目id
   */
  async setCurrentProject ({ commit }, { projectId } = {}) {
    commit('set_current_project', { projectId })
  },

  /**
   * 修改密码
   * @param {*String} options.oldPassword 旧密码
   * @param {*String} options.newPassword 新密码
   */
  async updatePassword ({ commit }, options) {
    try {
      await http.self.updatePassword(options)
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 修改当前用户信息
   * @param {*String} options.nickname 昵称
   */
  async updateSelfInfo ({ commit }, options) {
    try {
      await http.self.updateInfo(options)
      commit('update_user_current', options)
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 登录
   * @param {*String} options.username
   * @param {*String} options.password
   */
  async login ({ commit }, options) {
    try {
      const currentUser = await http.user.login(options)
      commit('set_user_current', currentUser)
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 退出登录
   */
  async logout ({ commit }) {
    try {
      commit('clear_data')
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 获取系统参数
   */
  async getLowerledParam ({ commit }) {
    try {
      const ledParams = await http.user.getLowerledParam()
      commit('set_lower_led_params', ledParams)
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 获取所有系统参数
   */
  async getSysParams ({ commit }) {
    try {
      const systemParams = await http.user.getSystemParams()
      commit('set_system_params', systemParams)
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 获取最新发布通知消息
   */
  async getNewestMessage ({ commit }) {
    try {
      return await http.user.getNewestRelease()
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 修改使用教程参数
   */
  setTutorialParams ({ commit }) {
    commit('set_tutorial_params')
  }
}

export const mutations = {
  set_user_current (state, currentUser) {
    state.currentUser = currentUser
    setSessionStorage('currentUser', currentUser)
  },
  clear_data (state) {
    state.currentUser = Map()
    clearSessionStorage()
  },
  set_current_project (state, { projectId }) {
    state.currentProject = projectId
  },
  update_user_current (state, { nickname } = {}) {
    state.currentUser = state.currentUser.set('nickname', nickname)
  },
  set_system_params (state, systemParams) {
    state.systemParams = systemParams
    setSessionStorage('systemParams', systemParams)
  },
  set_lower_led_params (state, ledParams) {
    state.ledParams = ledParams
    setSessionStorage('ledParams', ledParams)
  },
  set_tutorial_params (state) {
    state.tutorial = !state.tutorial
  }
}

