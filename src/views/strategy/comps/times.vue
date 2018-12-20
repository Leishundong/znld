<template>
  <el-row :gutter="15">
    <el-form-item
      v-for="(period, index) in value"
      :key="index"
      :label="'阶段 ' + digitalToCN[index]"
      required>
      <el-col :span="6">
        <el-form-item :prop="'strategyTimes.' + index + '.startTime'" :rules="timeRule">
          <el-time-picker
            v-model="period.startTime"
            value-format="HH:mm"
            :picker-options="{ format:'HH:mm' }"
            placeholder="任意时间点"
            :clearable="false"
            :disabled="!isEdit"
            style="display: block;width: initial;">
          </el-time-picker>
        </el-form-item>
      </el-col>

      <el-col :span="6">
        <el-form-item :prop="'strategyTimes.' + index + '.brightness'" :rules="brightnessRule">
          <el-input v-model="period.brightness" placeholder="亮度" :disabled="!isEdit"></el-input>
        </el-form-item>
      </el-col>

      <el-col :span="6">
        <!-- 不是最后一个时间段，不需要填，值为后一个时间段的起始时间 -->
        <el-form-item v-if="index !== value.length - 1">
          <el-time-picker
            v-model="value[index + 1].startTime"
            :value="value[index + 1].startTime"
            value-format="HH:mm"
            :picker-options="{ format:'HH:mm' }"
            :editable="false"
            :clearable="false"
            placeholder="任意时间点"
            :disabled="!isEdit"
            style="display: block;width: initial;">
          </el-time-picker>
        </el-form-item>
        <!-- 最后一个时间段，必填，作为提交时的 endtime -->
        <el-form-item :prop="'strategyTimes.' + index + '.endTime'" :rules="timeRule" v-else>
          <el-time-picker
            v-model="period.endTime"
            value-format="HH:mm"
            :picker-options="{ format:'HH:mm' }"
            :clearable="false"
            placeholder="任意时间点"
            :disabled="!isEdit"
            style="display: block;width: initial;">
          </el-time-picker>
        </el-form-item>
      </el-col>

      <el-col :span="2">
        <el-button @click.prevent="removeDomain(index)" v-if="index > 0" :disabled="!isEdit"> 删除 </el-button>
      </el-col>
    </el-form-item>
  </el-row>
</template>

<script>
  // 自定义检验输入值是否为数字
  const checkNumber = (rule, value, callback) => {
    const num = Number(value)
    const MIN = 0
    const MAX = 100
    if (isNaN(num)) {
      return callback(new Error('请输入数字值'))
    }
    if (num < MIN || num > MAX) {
      return callback(new Error('亮度范围 0 ~ 100'))
    }
    return callback()
  }

  export default {
    props: {
      value: {
        type: Array,
        required: true
      },
      isEdit: {
        type: Boolean
      }
    },

    data () {
      return {
        digitalToCN: {
          '0': '一',
          '1': '二',
          '2': '三',
          '3': '四',
          '4': '五',
          '5': '六'
        },
        timeRule: {
          required: true, message: '时间点不能为空'
        },
        brightnessRule: [
          { required: true, message: '亮度不能为空' },
          { validator: checkNumber }
        ]
      }
    },
    methods: {
      removeDomain (index) {
        if (index > 0) {
          this.$emit('remove', index)
        }
      }
      // handleStartChange (el, index) {
      //   const input = el.$data.userInput
      //   if (input) {
      //     const userInput = input
      //     const value = this.value.concat()
      //     value[index].startTime = userInput
      //     this.$emit('input', value)
      //     el.$data.userInput = null
      //   }
      // }
    }
  }
</script>



// WEBPACK FOOTER //
// src/views/strategy/comps/times.vue