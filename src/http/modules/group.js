// import axios from 'axios'
import { normalize } from 'normalizr'
import { fromJS } from 'immutable'
import { schemaGroup } from '../schemas'
import axios from 'axios'

/**
 * 新增分组
 * @param {*String} options.projectId 所属项目id
 * @param {*String} options.name 分组名称
 * @param {String} options.remark 备注
 */
export const create = async (options) => {
  const { data: { detail } } = await axios.post(`v2/solar-mote-groups?projectId=${options.projectId}`, options)
  const { entities } = normalize(detail, schemaGroup)
  return fromJS(entities)
}

/**
 * 删除分组
 * @param {*String} groupId 分组id
 */
export const destroyById = async (groupId) => {
  await axios.delete(`v2/solar-mote-groups/${groupId}`)
}

/**
 * 修改分组
 * @param {*String} options.id 分组id
 * @param {String} options.name 分组名称
 * @param {String} options.remark 备注
 */
export const updateById = async (options) => {
  const { data: { detail } } = await axios.put(`v2/solar-mote-groups/${options.id}`, options)
  const { entities } = normalize(detail, schemaGroup)
  return fromJS(entities)
}

/**
 * 获取分组列表
 * @param {*String} options.projectId
 */
export const findAll = async (options) => {
  const { projectId } = options
  const { data } = await axios.get(`v2/solar-mote-groups`, {
    params: {
      projectId
    }
  })
  const { entities } = normalize(data, [ schemaGroup ])
  return fromJS(entities)
}

/**
 * 获取单个分组
 * @param {*String} groupId 分组id
 */
export const findById = async (groupId) => {
  const { data } = await axios.get(`v2/solar-mote-groups/${groupId}`)
  const { entities } = normalize(data, schemaGroup)
  return fromJS(entities)
}
/**
 * 获取分组的应用策略信息
 * @param {*String} groupId 分组id
 */
export const getGroupStrategy = async (options) => {
  const { data } = await axios.get(`v2/solar-mote-strategys/strategy-group/${options.groupId}`)
  return data
}



// WEBPACK FOOTER //
// ./src/http/modules/group.js