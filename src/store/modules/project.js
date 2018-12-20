/**
 * 项目字段
 * @param {String} id 主键
 * @param {String} name 项目名称
 * @param {String} location 位置
 * @param {String} remark 备注
 * @param {String} roleName 角色（拥有者--OWNER，协作管理员--MANAGER，一般成员--MEMBER，只读成员--GUEST）
 * @param {timestamp} updateTime 创建时间
 */
import http from 'http'
import { Map, fromJS } from 'immutable'
import { setSessionStorage, getSessionStorage } from 'tools/storage'

const cacheProjectList = getSessionStorage('project_list') || {}

const state = {
  /**
   * 示例
   * {
   *   id: { id, name },
   *   id: { id, name }
   * }
   */
  projectList: fromJS(cacheProjectList)
}

const getters = {
  /**
   * 项目列表
   */
  projectList: state => ({ name } = {}) => {
    let projects = Object.values(state.projectList.toJS())

    if (name) {
      projects = projects.filter(item => item.name.indexOf(name) > -1)
    }
    // projects = projects.sort((prev, next) => next.updateTime - prev.updateTime)
    projects = projects.sort((prev, next) => (next.follow - prev.follow || next.updateTime - prev.updateTime))
    return projects
  },

  /**
   * 单个项目
   * @param {*String} id 项目id
   */
  project: state => id => {
    return state.projectList.get(id, Map()).toJS()
  }
}

const actions = {
  /**
   * 新增项目
   * @param {*String} options.name 项目名称
   * @param {String} options.location 项目位置
   * @param {String} options.remark 备注
   * @param {String} options.adCode 地址码
   */
  async createProject ({ commit }, options) {
    try {
      const entities = await http.project.create(options)
      commit('create_project', entities.get('projects', Map()))
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 删除项目
   * @param {*String} options.projectId 项目id
   */
  async destroyProject ({ commit }, { projectId } = {}) {
    try {
      await http.project.destroyById(projectId)
      commit('destroy_project', projectId)
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 修改项目
   * @param {*String} options.id 项目id
   * @param {*String} options.name 项目名称
   * @param {String} options.location 位置
   * @param {String} options.remark 备注
   * @param {String} options.adcode 省市区编码
   */
  async updateProject ({ commit }, options) {
    try {
      const entities = await http.project.updateById(options)
      commit('update_project', entities.get('projects', Map()))
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 获取项目列表
   * @param {String} options.queryParam 模糊查询参数
   * @param {*Number} options.pageNo 当前页
   * @param {*Number} options.pageSize 每页条数
   */
  async getProjectList ({ commit }, options) {
    try {
      const entities = await http.project.findAll(options)
      commit('set_project_list', entities.get('projects', Map()))
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 获取单个项目
   * @param {*String} options.projectId 项目id
   */
  async getProject ({ commit }, { projectId } = {}) {
    try {
      const entities = await http.project.findById(projectId)
      commit('update_project', entities.get('projects', Map()))
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 设置项目关注或者标签
   * @param {*String} projectId 项目id
   * @param {String} tag 标签（“,”隔开）
   * @param {String} follow 是否关注；1-关注；0-不关注
   */
  async updateTagOrFollow ({ commit, dispatch }, { projectId, tag, follow }) {
    try {
      await http.project.updateTagOrFollow(projectId, tag, follow)
      await dispatch('getProject', { projectId })
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  },

  /**
   * 新建老化测试
   * @param {*String} options.projectId 项目id
   * @param {*String} options.taskName 任务名
   * @param {*String} options.beginTime 开始时间（时间戳）
   * @param {*Number} options.frequency 轮询频率（分钟）
   * @param {*Number} options.duration 持续时间（小时）
   * @param {*String} options.email 邮箱
   */
  async createAgingTest ({ commit, dispatch }, options) {
    try {
      const entities = await http.project.createAgingTest(options)
      return entities
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 获取任务列表
   */
  async getTasks ({ commit }) {
    try {
      return await http.project.findTasks()
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 终止任务 id
   */
  async destroyTask ({ commit, dispatch }, { id } = {}) {
    try {
      const entities = await http.project.shutDownTask(id)
      return entities
    } catch (e) {
      throw new Error(e)
    }
  },

  /**
   * 关联信息
   */
  async setProjectRelation ({ commit, dispatch }) {
  }
}

const mutations = {
  create_project (state, newProject) {
    state.projectList = state.projectList.merge(newProject)
    setSessionStorage('project_list', state.projectList)
  },
  destroy_project (state, id) {
    state.projectList = state.projectList.delete(id)
    setSessionStorage('project_list', state.projectList)
  },
  update_project (state, newProject) {
    state.projectList = state.projectList.mergeDeep(newProject)
    setSessionStorage('project_list', state.projectList)
  },
  set_project_list (state, projects) {
    state.projectList = projects
    setSessionStorage('project_list', state.projectList)
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
// ./src/store/modules/project.js