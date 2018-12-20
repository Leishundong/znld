import axios from 'axios'
import { fromJS } from 'immutable'
import { formatConfig } from '../schemas'

/**
 * 修改配置
 * @param {*String} options.projectId 项目id
 * @param {Number} options.projectDefaultBrightness 默认亮度
 */
export const updateById = async (options) => {
  const { data: { detail } } = await axios.put(`v2/projects/project-params/${options.projectId}`, options)
  const configs = formatConfig(detail)
  return fromJS(configs)
}

/**
 * 获取配置列表
 * @param {*String} projectId 项目id
 */
export const findAll = async (projectId) => {
  const { data } = await axios.get(`v2/projects/project-params/${projectId}`)
  const configs = formatConfig(data)
  return fromJS(configs)
}



// WEBPACK FOOTER //
// ./src/http/modules/config.js