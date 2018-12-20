import axios from 'axios'

/**
 * 修改密码
 * @param {*String} options.oldPassword 旧密码
 * @param {*String} options.newPassword 新密码
 */
export const updatePassword = async (options) => {
  console.info(options)
  await axios.post(`v1/me/password`, options)
}

/**
 * 修改信息
 * @param {*String} options.nickname 昵称
 */
export const updateInfo = async (options) => {
  await axios.put(`v1/me`, options)
}



// WEBPACK FOOTER //
// ./src/http/modules/self.js