import axios from 'axios'
/**
 * 获取当前账号已创建的用户列表
 * @param {String} pageSize 每页条数
 * @param {Stirng} pageNo  当前页码
 */
export const getMyUserList = async (options) => {
  const { data: { recordCount, records } } = await axios.get(`v1/users/external?pageSize=${options.pageSize}&pageNo=${options.pageNo}`)
  return { recordCount, records }
}

/**
 * 新增外部用户
 * @param {String} username 登录名
 * @param {String} nickname 昵称
 * @param {String} password 密码
 * @param {String} roleName 角色名
 * @param {Stirng} systemId 子系统ID（只有销售创建才是必选
 */
export const addMyUser = async (options) => {
  const { data: { success } } = await axios.post('v1/users/external', options)
  return success
}

/**
 * 重置密码
 * @param {String} userId 用户ID
 */
export const resetMyUserPassword = async (userId) => {
  const { data: { success, detail } } = await axios.post(`v1/users/external/${userId}/password/reset`)
  return { success, detail }
}

/**
 * 锁定用户
 * @param {String} userId 用户ID
 */
export const lockMyUser = async (userId) => {
  const { data: { success } } = await axios.post(`v1/users/external/${userId}/lock`)
  return success
}

/**
 * 解锁用户
 * @param {String} userId 用户ID
 */
export const unlockMyUser = async (userId) => {
  const { data: { success } } = await axios.post(`v1/users/external/${userId}/unlock`)
  return success
}

/**
 * 获取子系统信息
 */
export const getSystemId = async (userId) => {
  const { data } = await axios.get(`v1/sub-systems`)
  return data
}



// WEBPACK FOOTER //
// ./src/http/modules/userManage.js