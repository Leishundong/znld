// import axios from 'axios'
import { normalize } from 'normalizr'
import { fromJS } from 'immutable'
import { schemaStrategy } from '../schemas'
import axios from 'axios'

/**
 * 新增策略
 * @param {*String} options.projectId 所属项目id
 * @param {*String} options.name 策略名称
 * @param {*Array} options.strategyTimes 时间段
 *   @param {*String} options.strategyTimes.time 时间
 *   @param {*Number} options.strategyTimes.brightness 亮度
 * @param {*String} options.offtime 关灯时间
 * @param {*Boolean} options.lightControl 开启光控
 * @param {*Boolean} options.lowerLedControl 开启智能功率
 * @param {*Boolean} options.trafficControl 开启人流控
 * @param {*String} options.remark 备注
 */
export const create = async (options) => {
  const { data: { detail } } = await axios.post(`v2/strategy-templates?projectId=${options.projectId}`, options)
  const { entities } = normalize(detail, schemaStrategy)
  return fromJS(entities)
}

/**
 * 删除策略
 * @param {*String} strategyId 策略id
 */
export const destroyById = async (strategyId) => {
  await axios.delete(`v2/strategy-templates/${strategyId}`)
}

/**
 * 修改策略
 * @param {*String} options.id 策略id
 * @param {*String} options.name 策略名称
 * @param {*Array} options.strategyTimes 时间段
 *   @param {*String} options.strategyTimes.time 时间
 *   @param {*Number} options.strategyTimes.brightness 亮度
 * @param {*String} options.offtime 关灯时间
 * @param {*Boolean} options.lightControl 开启光控
 * @param {*Boolean} options.lowerLedControl 开启智能功率
 * @param {*String} options.remark 备注
 */
export const updateById = async (options) => {
  const { data: { detail } } = await axios.put(`v2/strategy-templates/${options.id}`, options)
  const { entities } = normalize(detail, schemaStrategy)
  return fromJS(entities)
}

/**
 * 获取策略列表
 * @param {Object} options.projectId
 */
export const findAll = async (options) => {
  const { projectId } = options
  const { data } = await axios.get(`v2/strategy-templates?projectId=${projectId}`)
  const { entities } = normalize(data, [ schemaStrategy ])
  return fromJS(entities)
}

/**
 * 获取单个策略
 * @param {*String} strategyId 策略id
 */
export const findById = async (strategyId) => {
  const { data } = await axios.get(`v2/strategy-templates/${strategyId}`)
  const { entities } = normalize(data, schemaStrategy)
  return fromJS(entities)
}



// WEBPACK FOOTER //
// ./src/http/modules/strategy.js