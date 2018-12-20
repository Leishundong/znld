import { schema } from 'normalizr'
import moment from 'moment'

function calcSignalIntensity (val) {
  const { online, signalIntensity } = val
  if (!online) return -1
  switch (signalIntensity) {
    case 1:
      return 5
    case 2:
      return 4
    case 3:
      return 3
    case 4:
      return 2
    case 5:
      return 1
    default:
      return 0
  }
}

// 项目
export const schemaProject = new schema.Entity(
  'projects',
  {},
  {
    idAttribute (val) {
      return val.id.toString()
    },

    processStrategy (val, parent, key) {
      return {
        id: val.id.toString(),
        name: val.name,
        location: val.location,
        remark: val.remark,
        roleName: val.roleName,
        updateTime: val.createdAt || val.updatedAt,
        createdBy: val.createdBy,
        follow: val.follow,
        tag: val.tag,
        adCode: val.adCode,
        ownerName: val.ownerName
      }
    }
  }
)

// 策略
export const formatStrategy = (val) => {
  if (!val || !val.id) return {}
  const res = {
    id: val.id.toString(),
    name: val.name,
    periods: val.strategyTimes,
    offtime: val.offtime,
    weatherDays: val.weatherDays,
    weatherFactor: val.weatherFactor,
    isLowerLedControl: val.lowerLedControl,
    isLightControl: val.lightControl,
    isTrafficControl: val.trafficControl,
    remark: val.remark,
    project: val.projectId ? val.projectId.toString() : '',
    createTime: val.createdAt,
    updateTime: val.updatedAt,
    backTime: Date.now(),
    strategyTimes: val.strategyTimes,
    strategySendAt: val.strategySendAt
  }
  return res
}

export const schemaStrategy = new schema.Entity(
  'strategies',
  {},
  {
    idAttribute (val) {
      return val.id.toString()
    },

    processStrategy (val, parent, key) {
      const res = formatStrategy(val)
      return res
    }
  }
)

// 分组
export const schemaGroup = new schema.Entity(
  'groups',
  {
    project: schemaProject
  },
  {
    idAttribute (val) {
      return val.id.toString()
    },

    processStrategy (val, parent, key) {
      const res = {
        id: val.id.toString(),
        name: val.name,
        remark: val.remark,
        createTime: val.createdAt
      }
      if (val.project) {
        res.project = val.project
      } else {
        res.project = val.projectId.toString()
      }
      return res
    }
  }
)

// 用户
export const schemaUser = new schema.Entity(
  'users',
  {},
  {
    idAttribute (val) {
      return val.id.toString()
    },

    processStrategy (val, parent, key) {
      const res = {
        id: val.id.toString(),
        username: val.username,
        roleName: val.roleName,
        project: val.domainId.toString()
      }
      return res
    }
  }
)

// 配置
export const formatConfig = (data) => {
  const res = {
    project: data.projectId.toString(),
    brightness: data.projectDefaultBrightness
  }
  return res
}

export const schemaConfig = new schema.Entity(
  'configs',
  {},
  {
    idAttribute (val) {
      return val.projectId.toString()
    },

    processStrategy (val, parent, key) {
      const res = formatConfig(val)
      return res
    }
  }
)

// 告警
export const schemaWarning = new schema.Entity(
  'warnings',
  {},
  {
    idAttribute (val) {
      return val.id.toString()
    },

    processStrategy (val, parent, key) {
      const res = {
        id: val.id.toString(),
        deviceId: val.targetId.toString(),
        deviceName: val.moteName,
        project: val.projectId.toString(),
        type: val.alertType,
        level: val.alertLevel,
        state: val.alertStatus,
        text: val.dataStr,
        updateTime: val.updatedAt || val.createdAt
      }
      return res
    }
  }
)

// 设备
export const schemaDevice = new schema.Entity(
  'devices',
  {
    project: schemaProject,
    strategy: schemaStrategy
  },
  {
    idAttribute (val) {
      return val.id.toString()
    },
    processStrategy (val, parent, key) {
      const res = {
        id: val.id.toString(),
        name: val.name,
        lng: val.lng,
        lat: val.lat,
        snHex: val.sn.toString(16),
        pnHex: val.pn.toString(16),
        isGateway: val.asGateway,
        isOnline: Boolean(val.online),
        isOpen: Boolean(val.switchState),
        isWarning: Boolean(val.alertState),
        isDisable: Boolean(val.disabled),
        paramSettingMode: val.paramSettingMode,
        ledRatedCurrent: val.ledRatedCurrent,
        batteryType: val.batteryType,
        batteryVoltage: val.batteryVoltage,
        batteryOverVoltage: val.batteryOverVoltage,
        batteryOverToBackVoltage: val.batteryOverToBackVoltage,
        batteryLowVoltage: val.batteryLowVoltage,
        batteryLowToBackVoltage: val.batteryLowToBackVoltage,
        dayThreshold: val.dayThreshold,
        nightThreshold: val.nightThreshold,
        updateTime: val.updatedAt || val.createdAt,
        signalIntensity: calcSignalIntensity(val),
        brightness: (val.online && val.switchState) ? val.brightness : 0,
        isSettedStrategy: val.strategySettingState,
        isSettedParam: val.paramSettingState,
        solarVoltage: (val.solarVoltage / 1000).toFixed(2) * 1,
        solarCurrent: (val.solarCurrent / 1000).toFixed(2) * 1,
        batteryVolt: (val.batteryVolt / 1000).toFixed(2) * 1,
        batteryCurr: 0 - (val.batteryCurr / 1000).toFixed(2),
        ledVolt: (val.ledVolt / 1000).toFixed(2) * 1,
        ledCurr: (val.ledCurr / 1000).toFixed(2) * 1,
        cellCharge: (val.cellCharge * 1).toFixed(2) * 1,
        cellDischarge: (val.cellDischarge * 1).toFixed(2) * 1,
        cellResidue: (val.cellResidue * 1).toFixed(2) * 1,
        temperatures: val.temperatures * 1,
        batteryCapacity: val.batteryCapacity,
        switchMode: val.switchMode,
        groupName: val.groupName,
        paramSendAt: val.paramSendAt,
        cellLevel: val.cellLevel,
        chargeState: val.chargeState
      }
      // 关联项目
      if (val.project) {
        res.project = val.project
      } else {
        res.project = val.projectId.toString()
      }
      // 关联分组
      if (val.group) {
        res.group = val.group
      } else {
        res.group = val.groupId.toString()
      }
      return res
    }
  }
)

// 设备概要
export const schemaDeviceSimple = new schema.Entity(
  'devices_simple',
  {},
  {
    idAttribute (val) {
      return val.id.toString()
    },
    processStrategy (val, parent, key) {
      const res = {
        id: val.id.toString(),
        project: val.projectId.toString(),
        name: val.name,
        lng: val.lng,
        lat: val.lat,
        projectName: val.projectName
      }
      return res
    }
  }
)

// 单灯单日统计数据
export const schemaStatisticStatus = new schema.Entity(
  'statistic_status',
  {},
  {
    idAttribute (val) {
      return moment(val.createdAt).format('HH:mm:ss')
    },

    processStrategy (val, parent, key) {
      // time
      const time = moment(val.createdAt).format('HH:mm:ss')
      // solar
      const solarVoltage = val.solarVoltage / 1000
      const solarCurrent = val.solarCurrent / 1000
      const solarPower = solarVoltage * solarCurrent
      // battery
      const batteryVolt = val.batteryVolt / 1000
      const batteryCurr = 0 - val.batteryCurr / 1000
      const batteryPower = batteryVolt * batteryCurr
      // led
      const ledVoltage = val.ledVolt / 1000
      const ledCurrent = val.ledCurr / 1000
      const ledPower = ledVoltage * ledCurrent
      const brightness = (val.online && val.switchState) ? val.brightness : 0
      // energy
      const cellCharge = val.cellCharge
      const cellDischarge = val.cellDischarge
      const cellResidue = val.cellResidue
      // 其他
      const temperatures = val.temperatures
      const signalValue = val.signalValue

      const res = {
        time,
        solarVoltage,
        solarCurrent,
        solarPower,
        batteryVolt,
        batteryCurr,
        batteryPower,
        ledVoltage,
        ledCurrent,
        ledPower,
        brightness,
        cellCharge,
        cellDischarge,
        cellResidue,
        temperatures,
        signalValue
      }
      return res
    }
  }
)

// 统计充电量和放电量
export const schemaStatisticCharge = new schema.Entity(
  'statistic_charge',
  {},
  {
    idAttribute (val) {
      return val.date
    },

    processStrategy (val, parent, key) {
      const res = {
        date: val.date,
        cellCharge: val.cellCharge || null,
        cellDisCharge: val.cellDisCharge || null
      }
      return res
    }
  }
)

// 统计亮灯时长
export const schemaStatisticLighting = new schema.Entity(
  'statistic_lighting',
  {},
  {
    idAttribute (val) {
      return val.date
    },

    processStrategy (val, parent, key) {
      const res = {
        date: val.date,
        lightTime: val.lightTime ? Number(val.lightTime.toFixed(2)) : null
      }
      return res
    }
  }
)

// 操作日志
export const schemaLog = new schema.Entity(
  'logs',
  {},
  {
    idAttribute (val) {
      return val.id.toString()
    },

    processStrategy (val, parent, key) {
      const res = {
        id: val.id.toString(),
        type: val.opType,
        content: val.content,
        username: val.username,
        createTime: val.createdAt
      }
      return res
    }
  }
)



// WEBPACK FOOTER //
// ./src/http/schemas.js