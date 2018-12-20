// import axios from 'axios'
import { normalize } from 'normalizr'
import { fromJS } from 'immutable'
import { schemaDevice, schemaDeviceSimple } from '../schemas'
import axios from 'axios'

/**
 * 新增设备
 * @param {*String} options.projectId 所属项目id
 * @param {*String} options.name 设备名称
 * @param {*String} options.snHexadecimal 十六进制的sn号
 * @param {*String} options.pnHexadecimal 十六进制的pn号
 * @param {*Number} options.lng 经度
 * @param {*Number} options.lat 纬度
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
export const create = async (options) => {
  const { data: { detail } } = await axios.post(`v2/solar-motes/activated?projectId=${options.projectId}`, options)
  const { entities } = normalize(detail, schemaDevice)
  return fromJS(entities)
}

/**
 * 删除设备
 * @param {*String} deviceId 设备id
 */
export const destroyById = async (deviceId) => {
  await axios.delete(`v2/solar-motes/set-unactivated/${deviceId}`)
}

/**
 * 修改设备
 * @param {*String} options.id 设备id
 * @param {*String} options.name 设备名称
 * @param {*Number} options.lng 经度
 * @param {*Number} options.lat 纬度
 */
export const updateById = async (options) => {
  const { data: { detail } } = await axios.put(`v2/solar-motes/${options.id}`, options)
  const { entities } = normalize(detail, schemaDevice)
  return fromJS(entities)
}

/**
 * 获取设备列表，跨项目的，个人所有项目所有设备，简要信息
 * @param {String} projectId 项目id
 */
export const findAll = async (projectId) => {
  let path = 'v2/solar-motes/brief'
  if (projectId) {
    path += `/${projectId}`
  }
  const { data } = await axios.get(path)
  const { entities } = normalize(data, [ schemaDeviceSimple ])
  return fromJS(entities)
}

/**
 * 获取设备列表
 * @param {*String} options.projectId 项目id
 */
export const find = async (options) => {
  const { projectId } = options
  const { data } = await axios.get(`v2/solar-motes`, {
    params: {
      projectId
    }
  })
  const { entities } = normalize(data, [ schemaDevice ])
  return fromJS(entities)
}

/**
 * 查询设备列表分页
 * @param {*String} options.projectId 项目id
 * @param {*String} options.pageNo 当前页
 * @param {*String} options.pageSize 每页条数
 * @param {String} options.isDisabled 是否过滤停用设备 true, false
 * @param {String} options.name 设备名称
 * @param {String} options.statusType 按状态查询的条件
 * @param {String} options.gruopId 分组id
 */
export const findByPagi = async (options) => {
  const { projectId, pageNo, pageSize, isDisabled, name, statusType, groupId } = options
  const { data } = await axios.get(`v2/solar-motes/pagi`, {
    params: {
      projectId,
      pageNo,
      pageSize,
      isDisabled,
      name,
      statusType,
      groupId
    }
  })
  return data
}

/**
 * 获取分组内的设备id列表
 * @param {*String} options.projectId 项目id
 * @param {*String} options.groupId 分组id
 */
export const findIdsInGroup = async (options) => {
  const { data } = await axios.get(`v2/solar-mote-groups/${options.groupId}/mote-ids`)
  return fromJS(data.map(item => item.toString()))
}

/**
 * 获取设备信息和状态
 * @param {*String} deviceId 设备id
 */
export const findById = async (deviceId) => {
  const { data } = await axios.get(`v2/solar-motes/get-info-and-status/${deviceId}`)
  const { entities } = normalize(data, schemaDevice)
  return fromJS(entities)
}

/**
 * 获取项目告警设备
 * @param {*String} options.projectId 项目id
 */
export const findDevicesInAlerts = async (options) => {
  const { projectId, statusType, isDisabled } = options
  const { data } = await axios.get(`v2/solar-motes`, {
    params: {
      projectId,
      statusType,
      isDisabled
    }
  })
  return data
}

/**
 * 获取设备告警信息
 * @param {*String} deviceId 设备id
 * @param {*Number} options.pageNo 当前页
 * @param {*Number} options.pageSize 每页条数
 * @param {String} options.isRead 搜索的告警状态是否是已读（1 查询已读;0 查询未读;null 查询全部）
 */
export const findAlertsById = async (options) => {
  const { deviceId, pageNo, pageSize, isRead } = options
  const { data } = await axios.get(`v2/solar-motes/list-mote-alert/${deviceId}`, {
    params: {
      isRead,
      pageNo,
      pageSize
    }
  })
  return data
}

/**
 * 处理设备
 * @param {*String} deviceId 设备id
 */
export const disposeById = async (deviceId) => {
  const { data } = await axios.put(`v2/solar-motes/processed/${deviceId}`)
  return data
}

/**
 * 获取产品参数列表
 */
export const findParams = async () => {
  const { data } = await axios.get(`v2/product-params`)
  return data
}



// WEBPACK FOOTER //
// ./src/http/modules/device.js