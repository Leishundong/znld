import { normalize } from 'normalizr'
import { fromJS } from 'immutable'
import { formatStrategy, schemaDevice } from '../schemas'
import axios from 'axios'

/**
 * 获取分组的应用策略
 * @param {*String} groupId 分组id
 */
export const findStrategyInGroup = async (groupId) => {
  const { data } = await axios.get(`v2/solar-mote-strategys/strategy-group/${groupId}`)
  const strategy = formatStrategy(data)
  return fromJS({ [groupId]: strategy })
}

/**
 * 获取设备的应用策略
 * @param {*String} deviceId 设备id
 */
export const findStrategyInDevice = async (deviceId) => {
  const { data } = await axios.get(`v2/solar-mote-strategys/solar-mote/${deviceId}`)
  const strategy = formatStrategy(data)
  return fromJS({ [deviceId]: strategy })
}

/**
 * 对设备下发参数
 * @param {*String} options.id 设备id
 * @param {*Number} options.paramSettingMode 参数设置模式,1-默认；2-自定义（如果电池电压选其他此参数值则为2-自定义，否则为1-默认）
 * @param {*Number} options.batteryType 电池类型（1-磷酸铁锂；2-三元锂；3-铅酸；）
 * @param {*Number} options.batteryVoltage 电池电压（如电池类型选中磷酸铁锂有12V，24V，其他）
 * @param {*Number} options.batteryOverVoltage 电池超压电压（用于充电停止电压），单位：V
 * @param {*Number} options.batteryOverToBackVoltage 电池超压恢复电压，单位：V
 * @param {*Number} options.batteryLowVoltage 电池低压电压（用于停止亮灯电压），单位：V
 * @param {*Number} options.batteryLowToBackVoltage 电池低压恢复电压，单位：V
 * @param {*Number} options.ledRatedCurrent LED灯额定电流，单位：A
 * @param {*Number} options.dayThreshold 光控天亮阈值，单位：V
 * @param {*Number} options.nightThreshold 光控天黑阈值，单位：V
 */
export const updateConfig = async (options) => {
  const { data: { detail } } = await axios.post(`v2/device-downs/set-param/${options.id}`, options)
  const { entities } = normalize(detail, schemaDevice)
  return fromJS(entities)
}

/**
 * 对分组下发策略
 * @param {*String} groupId 分组id
 * @param {*String} strategyId 策略id
 */
export const updateGroupStrategy = async (groupId, strategyId) => {
  await axios.post(`v2/device-downs/set-strategy-to-group/${groupId}`, { strategyTemplateId: strategyId })
}

/**
 * 对设备下发策略
 * @param {*String} deviceId 设备id
 * @param {*String} strategyId 策略id
 */
export const updateDeviceStrategy = async (deviceId, strategyId) => {
  await axios.post(`v2/device-downs/set-strategy/${deviceId}`, { strategyTemplateId: strategyId })
}

/**
 * 设置分组
 * @param {*String} projectId 项目id
 * @param {*String} groupId 分组id
 * @param {*Array} deviceId 修改后分组内的设备id列表
 */
export const updateInGroup = async (projectId, groupId, deviceId) => {
  const { data } = await axios.post(`v2/device-downs/set-switch-time-strategy-group-pc/${groupId}?projectId=${projectId}`, { solarMoteIds: deviceId })
  return data
}

/**
 * 启用设备
 * @param {*String} projectId 项目id
 * @param {*Array} deviceId 设备id
 */
const enableDevice = async (projectId, deviceId) => {
  const res = await axios.put(`v2/solar-motes/enable?projectId=${projectId}`, { solarMoteIds: deviceId })
  return res
}

/**
 * 停用设备
 * @param {*String} projectId 项目id
 * @param {*Array} deviceId 设备id
 */
const disableDevice = async (projectId, deviceId) => {
  const res = await axios.put(`v2/solar-motes/disable?projectId=${projectId}`, { solarMoteIds: deviceId })
  return res
}

/**
 * 启用、停用设备（批量）
 * @param {*String} projectId 项目id
 * @param {*Array} deviceId 设备id
 * @param {*String} type 更新后的状态，可选值（enable, disable）
 */
const mapDeviceState = {
  enable: enableDevice,
  disable: disableDevice
}
export const updateDeviceState = async (projectId, deivceId, type) => {
  const handler = mapDeviceState[type]
  if (typeof handler !== 'function') {
    throw new Error('参数错误！type 可选值错误: [enable, disable]')
  }
  const { data: { detail } } = await handler(projectId, deivceId)
  return detail
}

/**
 * 删除设备（批量）
 * @param {*String} deviceId 设备id
 * @param {*String} password 密码
 */
export const destroyByIds = async (projectId, deviceId, password) => {
  await axios.post(`v2/solar-motes/unactivated-batch?projectId=${projectId}`, { solarMoteIds: deviceId, password: password })
}

/**
 * 更新设备状态，如电压电流值（批量）
 * @param {*String} projectId 项目id
 * @param {*String} deviceId 设备id
 */
export const updateStatus = async (projectId, deviceId) => {
  await axios.post(`v2/device-downs/get-status-batch?projectId=${projectId}`, { solarMoteIds: deviceId })
}

/**
 * 开、关、调光（批量）
 * @param {*String} projectId 项目id
 * @param {*Array} deviceId 设备id
 * @param {*String} type 操作类型，可选值：open, close, dimme
 * @param {Number} brightness 亮度 调光时，需要该参数
 */
const mapDimmeType = {
  open: 1,
  close: 2,
  dimme: 3
}
export const dimmeLevel = async (projectId, deviceId, type, brightness) => {
  const switchState = mapDimmeType[type]
  await axios.post(`v2/device-downs/switch-control-batch?projectId=${projectId}`, { switchState, brightness, solarMoteIds: deviceId })
}

/**
 * 对分组进行开关、调光
 * @param {*String} groupId 分组id
 * @param {*Number} switchState 状态 1-开、2-关、3-调光
 * @param {*Number} brightness 亮度 调光时，需要该参数
 */
export const dimmeInGroup = async (groupId, switchState, brightness) => {
  await axios.post(`v2/device-downs/switch-control-group/${groupId}`, { switchState, brightness })
}



// WEBPACK FOOTER //
// ./src/http/modules/command.js