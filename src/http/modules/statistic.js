import { normalize } from 'normalizr'
import { fromJS } from 'immutable'
import { schemaStatisticStatus, schemaStatisticCharge, schemaStatisticLighting } from '../schemas'
import axios from 'axios'

/**
 * 获取某日的单灯统计数据
 * @param {*String} deviceId 设备id
 * @param {*String} date 日期，示例 2018-01-25
 */
export const findStatus = async (deviceId, date) => {
  const { data } = await axios.get(`v2/solar-mote-status-hiss/get-list/${deviceId}`, {
    params: {
      date
    }
  })
  const { entities } = normalize(data, [ schemaStatisticStatus ])
  return fromJS(entities)
}

/**
 * 统计充放电量
 * @param {*String} deviceId 设备id
 * @param {*String} beginDate 起始日期，示例 2018-01-25
 * @param {*String} endDate 结束日期，示例 2018-01-26
 */
export const findCharge = async (deviceId, beginDate, endDate) => {
  const { data } = await axios.get(`v2/solar-mote-status-hiss/get-charge/${deviceId}`, {
    params: {
      beginDate,
      endDate
    }
  })
  const { entities } = normalize(data, [ schemaStatisticCharge ])
  return fromJS(entities)
}

/**
 * 统计亮灯时间
 * @param {*String} deviceId 设备id
 * @param {*String} beginDate 起始日期，示例 2018-01-25
 * @param {*String} endDate 结束日期，示例 2018-01-26
 */
export const findLighting = async (deviceId, beginDate, endDate) => {
  const { data } = await axios.get(`v2/solar-mote-status-hiss/get-light-time/${deviceId}`, {
    params: {
      beginDate,
      endDate
    }
  })
  const { entities } = normalize(data, [ schemaStatisticLighting ])
  return fromJS(entities)
}

/**
 * 获取项目概览信息
 * @param {*String} projectId 项目id
 */
export const findCount = async (projectId) => {
  const { data: { allCount, lightCount, onlineCount, errorCount } } = await axios.get(`v2/project-overviews/${projectId}`)
  return fromJS({
    [projectId]: {
      all: allCount,
      light: lightCount,
      online: onlineCount,
      error: errorCount
    }
  })
}



// WEBPACK FOOTER //
// ./src/http/modules/statistic.js