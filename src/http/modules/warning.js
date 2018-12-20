// import axios from 'axios'
import { normalize } from 'normalizr'
import { fromJS } from 'immutable'
import { schemaWarning } from '../schemas'
import axios from 'axios'

/**
 * 新增告警
 */
export const create = async (options) => {
  console.log('未实现')
  return fromJS({})
}

/**
 * 删除告警
 */
export const destroyById = async (id) => {
  console.log('未实现')
}

/**
 * 修改告警（标记已读）（批量）
 * @param {*String} options.projectId 项目id
 * @param {*Array} options.ids 告警id
 * @return {empty}
 */
export const updateById = async (options) => {
  const { data: { detail } } = await axios.put(`v2/solar-alerts/read?projectId=${options.projectId}`, { alertIds: options.ids })
  return detail
}

/**
 * 获取告警列表
 * @param {Object} options.projectId
 */
export const findAll = async (options) => {
  const { data } = await axios.get(`v2/solar-alerts?projectId=${options.projectId}`)
  const { entities } = normalize(data, [ schemaWarning ])
  return fromJS(entities)
}

/**
 * 获取告警列表分页
 * @param {*String} options.projectId 项目id
 * @param {*String} options.pageNo 当前页
 * @param {*String} options.pageSize 每页条数
 * @param {name} options.name 设备名称
 * @param {alertStatus} options.alertStatus 告警状态；1-未处理；5-已读
 * @param {beginDate} options.beginDate 起始时间
 * @param {endDate} options.endDate 结束时间
 */
export const findByGagi = async (options) => {
  const { projectId, pageNo, pageSize, name, alertStatus, beginDate, endDate } = options
  const { data } = await axios.get(`v2/solar-alerts/pagi`, {
    params: {
      projectId,
      pageNo,
      pageSize,
      name,
      alertStatus,
      beginDate,
      endDate
    }
  })
  // const { entities } = normalize(records, [ schemaWarning ])
  // return fromJS(entities)
  return data
}

/**
 * 获取单个告警
 */
export const findById = async (id) => {
  console.log('未实现')
  return fromJS({})
}



// WEBPACK FOOTER //
// ./src/http/modules/warning.js