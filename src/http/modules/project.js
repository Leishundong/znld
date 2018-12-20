// import axios from 'axios'
import { normalize } from 'normalizr'
import { fromJS } from 'immutable'
import { schemaProject } from '../schemas'
import axios from 'axios'

/**
 * 新增项目
 * @param {*String} options.name 项目名称
 * @param {String} options.location 位置
 * @param {String} options.remark 备注
 * @param {String} options.adCode 备注
 */
export const create = async (options) => {
  const { data: { detail } } = await axios.post(`v2/projects`, options)
  const { entities } = normalize(detail, schemaProject)
  return fromJS(entities)
}

/**
 * 删除项目
 * @param {*String} projectId
 */
export const destroyById = async (projectId) => {
  await axios.delete(`v2/projects/${projectId}`)
}

/**
 * 修改项目
 * @param {*String} options.id 项目id
 * @param {*String} options.name 项目名称
 * @param {String} options.location 位置
 * @param {String} options.remark 备注
 * @param {String} options.adcode 省市区编码
 */
export const updateById = async (options) => {
  const { data: { detail } } = await axios.put(`v2/projects/${options.id}`, options)
  const { entities } = normalize(detail, schemaProject)
  return fromJS(entities)
}

/**
 * 获取项目列表
 * @param {String} options.queryParam 模糊查询参数
 * @param {*Number} options.pageNo 当前页
 * @param {*Number} options.pageSize 每页条数
 */
export const findAll = async (options) => {
  const { data: { records } } = await axios.get(`v2/projects/list-mine-pagi?pageNo=${options.pageNo}&pageSize=${options.pageSize}&queryParam=${options.queryParam}`)
  const { entities } = normalize(records, [ schemaProject ])
  return fromJS(entities)
}

/**
 * 获取单个项目
 */
export const findById = async (projectId) => {
  const { data } = await axios.get(`v2/projects/${projectId}`)
  const { entities } = normalize(data, schemaProject)
  return fromJS(entities)
}

/**
 * 设置项目关注或者标签
 * @param {*String} projectId
 * @param {String} tag
 * @param {String} follow 是否关注；1-关注；0-不关注
 */
export const updateTagOrFollow = async (projectId, tag, follow) => {
  const data = await axios.post(`v2/projects/set-tag-or-follow/${projectId}`, { tag, follow })
  return data
}

/**
 * 新建老化测试
 * @param {*String} options.projectId 项目id
 * @param {*String} options.taskName 任务名
 * @param {*String} options.beginTime 开始时间（时间戳）
 * @param {*Number} options.frequency 轮询频率（分钟）
 * @param {*Number} options.duration 持续时间（小时）
 * @param {*String} options.email 邮箱
 */
export const createAgingTest = async (options) => {
  const data = await axios.post(`v1/tasks/project/aging-test`, options)
  return data
}

/**
 * 获取任务列表
 * @param {*String} options.taskType 任务类型: 2-老化测试
 */
export const findTasks = async () => {
  const { data } = await axios.get(`v1/tasks/list-task?taskType=2`)
  return data
}

/**
 * 终止列表
 * @param {*String} options.id 任务id
 */
export const shutDownTask = async (id) => {
  const { data } = await axios.put(`v1/tasks/shut-down/${id}`)
  return data
}



// WEBPACK FOOTER //
// ./src/http/modules/project.js