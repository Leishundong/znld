import axios from 'axios'
import jwtDecode from 'jwt-decode'
import { normalize } from 'normalizr'
import { fromJS } from 'immutable'
import { schemaUser } from '../schemas'

/**
 * 邀请用户加入自己的项目
 * @param {*String} options.projectId 所属项目id
 * @param {*String} options.username 用户名称
 * @param {*String} options.roleName 角色
 */
export const create = async (options) => {
  const { data: { detail } } = await axios.post(`v2/projects/join-me?projectId=${options.projectId}`, options)
  const { entities } = normalize(detail, schemaUser)
  return fromJS(entities)
}

/**
 * 将用户移除出自己的项目
 * @param {*String} projectId 项目id
 * @param {*String} id 用户id
 */
export const destroyById = async (projectId, id) => {
  await axios.delete(`v2/projects/leave-me/${id}?projectId=${projectId}`)
}

/**
 * 修改用户（修改成员角色）
 * @param {*String} options.projectId 项目id
 * @param {*String} options.id 用户id
 * @param {*String} options.roleName 角色名
 */
export const updateById = async (options) => {
  await axios.put(`v2/projects/member-role?projectId=${options.projectId}`, options)
}

/**
 * 获取用户列表
 * @param {Object} options.projectId
 */
export const findAll = async (options) => {
  const { data } = await axios.get(`v2/projects/list-user-in-project/${options.projectId}`)
  const { entities } = normalize(data, [ schemaUser ])
  return fromJS(entities)
}

/**
 * 登录
 * @param {*String} options.username
 * @param {*String} options.password
 */
export const login = async (options) => {
  const { data: { detail, message, user: { superAdmin, roleName, passwordUpdatedAt } } } = await axios.post('v1/auth/login', options)
  if (message) {
    throw new Error(message)
  }
  const { authorities, exp, nickname, sub } = jwtDecode(detail)
  // 用于判断是否有修改过密码
  sessionStorage.setItem('passwordUpdatedAt', passwordUpdatedAt)
  return fromJS({
    auths: authorities,
    expiration: exp * 1000,
    nickname,
    username: sub,
    token: detail,
    superAdmin,
    roleName,
    passwordUpdatedAt
  })
}



// WEBPACK FOOTER //
// ./src/http/modules/user.js
