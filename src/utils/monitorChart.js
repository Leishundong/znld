import G2 from '@antv/g2'
import { DataView, DataSet } from '@antv/data-set'

// 监控部分的环形图表
/**
 *@param {Array} data 装载的数据 { item: '离线'， count: 10}
 *@param {String} container 图表容器的ID
*/
export function monitorChart (data, container, percentage) {
  let dv = new DataView()
  dv.source(data).transform({
    type: 'percent',
    field: 'count',
    dimension: 'item',
    as: 'percent'
  })
  const chart = new G2.Chart({
    container: container,
    forceFit: true,
    width: 100,
    height: 100,
    padding: [0, 0, 0, 0]
  })
  chart.source(dv)
  chart.coord('theta', {
    radius: 0.75,
    innerRadius: 0.6
  })
  chart.tooltip({
    showTitle: false
  })
  // 辅助文本
  chart.guide().html({
    position: [ '50%', '50%' ],
    html: `<div style="color:#8c8c8c;font-size: 14px;text-align: center;width: 10em;">${percentage}%</div>`,
    alignX: 'middle',
    alignY: 'middle'
  })
  chart.intervalStack()
    .position('percent')
    .color('item')
  chart.legend(false)
  chart.tooltip(false)
  chart.render()
}

// 数据统计图表
/**
 *@param {Array} data 装载的数据 { item: '离线'， count: 10}
 *@param {String} container 图表容器的ID
*/
export function monitorChart1 (container, useData, usefields) {
  const data = useData
  const fields = usefields
  const ds = new DataSet()
  const dv = ds.createView().source(data)
  dv.transform({
    type: 'fold',
    fields: fields, // 展开字段集
    key: 'city', // key字段
    value: 'number' // value字段
  })
  const chart = new G2.Chart({
    container: container,
    forceFit: true,
    background: {
      fill: '#fff'
    },
    height: 270
  })
  chart.legend('电池充电量', false)
  chart.source(dv, {
    time: {
      tickCount: 12
    }
  })
  chart.tooltip({
    crosshairs: {
      type: 'line'
    }
  })
  chart.axis('number', {
    label: {
      formatter: val => {
        return val
      }
    }
  })
  chart.axis('time', {
    label: {
      formatter: val => {
        return String(val).substring(0, 5)
      }
    }
  })
  chart.line().position('time*number').color('city').tooltip('city*number', (name, value) => {
    let newValue = `${Number(value).toFixed(2)}`
    switch (name) {
      case '电压':
        newValue = `${newValue} V`
        break
      case '电流':
        newValue = `${newValue} A`
        break
      case '功率':
        newValue = `${newValue} W`
        break
      case '亮度':
        newValue = `${newValue} %`
        break
      case '充电量':
        newValue = `${newValue} WH`
        break
      case '放电量':
        newValue = `${newValue} WH`
        break
      case '剩余电量':
        newValue = `${newValue} WH`
        break
      case '环境温度':
        newValue = `${newValue} ℃`
        break
      case '信号值':
        newValue = `${newValue}`
        break
    }
    return {
      name: name,
      value: newValue
    }
  })
  chart.legend('环境温度', {
    position: 'right'
  })
  chart.render()
}

// 历史数据统计图表
/**
 *@param {Array} data 装载的数据 { item: '离线'， count: 10}
 *@param {String} container 图表容器的ID
*/
export function monitorChart2 (container, dataSrc, fields) {
  // const data = [
  //   { name: '电流', 'Jan.': 18.9, 'Feb.': 28.8, 'Mar.': 39.3, 'Apr.': 81.4, 'May': 47, 'Jun.': 20.3, 'Jul.': 24, 'Aug.': 35.6 },
  //   { name: 'Berlin', 'Jan.': 12.4, 'Feb.': 23.2, 'Mar.': 34.5, 'Apr.': 99.7, 'May': 52.6, 'Jun.': 35.5, 'Jul.': 37.4, 'Aug.': 42.4 }
  // ]
  let formatText = {}
  const data = dataSrc
  const ds = new DataSet()
  const dv = ds.createView().source(data)
  dv.transform({
    type: 'fold',
    fields: fields, // 展开字段集
    key: 'key', // key字段
    value: 'number' // value字段
  })
  const chart = new G2.Chart({
    container: container,
    forceFit: true,
    background: {
      fill: '#fff'
    },
    height: 270
  })
  if (fields.length === 2) {
    formatText = {
      formatter (val) {
        const map = {
          cellCharge: '充电量',
          cellDisCharge: '放电量'
        }
        return map[val] || null
      }
    }
  } else {
    formatText = {
      formatter (val) {
        const map = {
          lightTime: '亮灯时长'
        }
        return map[val] || null
      }
    }
  }
  chart.scale({
    date: {
      type: 'cat',
      tickCount: 7
    },
    value: {
      type: 'cat',
      tickCount: 10
    },
    number: {
      min: 0
    },
    key: formatText
  })
  chart.source(dv, {
  })
  chart.axis('number', {
    label: {
      formatter: val => {
        return val
      }
    }
  })
  chart.interval().position('date*number').color('key').tooltip('key*number', (name, value) => {
    let newName = name
    let newValue = `${Number(value).toFixed(2)}`
    switch (name) {
      case 'cellCharge':
        newName = `充电量`
        newValue = `${newValue} HW`
        break
      case 'cellDisCharge':
        newName = `放电量`
        newValue = `${newValue} HW`
        break
      case 'lightTime':
        newName = `亮灯时长`
        newValue = `${newValue} 小时`
    }
    return {
      name: newName,
      value: newValue
    }
  }).adjust([{
    type: 'dodge',
    marginRatio: 1 / 32
  }])
  chart.render()
}
// 仪表盘
export function instrumentMonitor (container, monitorData) {
  const Shape = G2.Shape
  // 自定义Shape 部分
  Shape.registerShape('point', 'pointer', {
    drawShape (cfg, group) {
      let point = cfg.points[0] // 获取第一个标记点
      point = this.parsePoint(point)
      const center = this.parsePoint({ // 获取极坐标系下画布中心点
        x: 0,
        y: 0
      })
      // 绘制指针
      group.addShape('line', {
        attrs: {
          x1: center.x,
          y1: center.y,
          x2: point.x,
          y2: point.y,
          stroke: cfg.color,
          lineWidth: 1,
          lineCap: 'round'
        }
      })
      return group.addShape('circle', {
        attrs: {
          x: center.x,
          y: center.y,
          r: 3,
          stroke: cfg.color,
          lineWidth: 1,
          fill: '#fff'
        }
      })
    }
  })

  const data = [
    { value: monitorData }
  ]
  const chart = new G2.Chart({
    container: container,
    forceFit: false,
    height: 120,
    width: 132,
    background: {
      fill: '#fff'
    },
    padding: [ 0, 0, 0, 0 ]
  })
  chart.source(data)

  chart.coord('polar', {
    startAngle: -9 / 8 * Math.PI,
    endAngle: 1 / 8 * Math.PI,
    radius: 0.75
  })
  chart.scale('value', {
    min: 0,
    max: 120,
    tickInterval: 60,
    nice: false
  })

  chart.axis('1', false)
  chart.axis('value', {
    zIndex: 2,
    line: null,
    label: {
      offset: -16,
      textStyle: {
        fontSize: 16,
        textAlign: 'center',
        textBaseline: 'middle'
      }
    },
    subTickCount: 10,
    subTickLine: {
      length: -8,
      stroke: '#fff',
      strokeOpacity: 1
    },
    tickLine: {
      length: -17,
      stroke: '#fff',
      strokeOpacity: 1
    },
    grid: null
  })
  chart.legend(false)
  chart.point({
    generatePoints: true
  }).position('value*1')
    .shape('pointer')
    .color('#1890FF')
    .active(false)

  // 绘制仪表盘背景
  chart.guide().arc({
    zIndex: 0,
    top: false,
    start: [ 0, 0.945 ],
    end: [ 120, 0.945 ],
    style: { // 底灰色
      stroke: '#CBCBCB',
      lineWidth: 18
    }
  })
  // 绘制指标
  chart.guide().arc({
    zIndex: 1,
    start: [ 0, 0.945 ],
    end: [ data[0].value, 0.945 ],
    style: {
      stroke: '#2fc25b',
      lineWidth: 18
    }
  })
  // 绘制指标数字
  // chart.guide().html({
  //   position: [ '50%', '95%' ],
  //   html: '<div style="width: 160px;text-align: center;">' + '<p style="font-size: 14px; color: #545454;margin: 0;">功率</p>' + '<p style="font-size: 14px;color: #545454;margin: 0;">' + data[0].value + 'W</p>' + '</div>'
  // })
  chart.render()
}



// WEBPACK FOOTER //
// ./src/utils/monitorChart.js