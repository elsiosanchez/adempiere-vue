<template>
  <div>
    {{ typePicker }}
    <el-date-picker
      v-if="typePicker === 'daterange'"
      v-model="value"
      :format="formatView"
      :value-format="formatSend"
      :type="typePicker"
      range-separator="-"
      :placeholder="metadata.help"
      :start-placeholder="$t('components.dateStartPlaceholder')"
      :end-placeholder="$t('components.dateEndPlaceholder')"
      unlink-panels
      class="date-base"
      :readonly="Boolean(metadata.readonly)"
      :disabled="isDisabled"
      :picker-options="pickerOptions"
      @change="preHandleChange"
    />
    <el-date-picker
      v-else
      v-model="value"
      :format="formatView"
      :value-format="formatSend"
      :type="typePicker"
      range-separator="-"
      :placeholder="metadata.help"
      :start-placeholder="$t('components.dateStartPlaceholder')"
      :end-placeholder="$t('components.dateEndPlaceholder')"
      unlink-panels
      class="date-base"
      :readonly="Boolean(metadata.readonly)"
      :disabled="isDisabled"
      @change="preHandleChange"
    />
  </div>
</template>

<script>
import { clientDateTime } from '@/utils/ADempiere'
import { fieldMixin } from '@/components/ADempiere/Field/FieldMixin'

export default {
  name: 'FieldDate',
  mixins: [fieldMixin],
  data() {
    return {
      pickerOptions: {
        shortcuts: [{
          text: 'Last week',
          onClick(picker) {
            const end = ''
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      formatView: undefined,
      formatSend: undefined
    }
  },
  computed: {
    typePicker() {
      var range = ''
      var time = ''
      if (String(this.metadata.displayType) === String(16)) {
        time = 'time'
      }
      if (this.metadata.isRange && !this.metadata.inTable) {
        range = 'range'
      }
      return 'date' + time + range
    }
  },
  // watch: {
  //   valueModel(value) {
  //     if (typeof value === 'number') {
  //       value = new Date(value)
  //     }
  //     this.value = value
  //   },
  //   'metadata.value'(value) {
  //     if (typeof value === 'number') {
  //       value = new Date(value)
  //     }
  //     this.value = value
  //   }
  // },
  created() {
    this.checkValueFormat()
    if (this.metadata.isRange) {
      this.value = [this.metadata.value, this.metadata.valueTo]
    }
  },
  beforeMount() {
    // enable to dataTable records
    if (this.metadata.inTable && this.valueModel !== undefined && this.value !== null) {
      this.value = this.value
    }
  },
  methods: {
    clientDateTime,
    /**
     * Parse the date format to be compatible with element-ui
     */
    checkValueFormat() {
      // Date = 15
      var format = this.metadata.VFormat
        .replace(/[Y]/gi, 'y')
        .replace(/[m]/gi, 'M')
        .replace(/[D]/gi, 'd')

      if (format === '') {
        format = 'yyyy-MM-dd'
      }
      if (this.typePicker.replace('range', '') === 'datetime') {
        format = format + ' hh:mm:ss A'
      }
      this.formatView = format
      // this.formatSend = format
      //   .replace(/[h]/gi, 'H')
      //   .replace(/[aA]/gi, '')
    },
    convertDateToTimestamp(value) {
      return (new Date(value)).getTime()
    },
    convertTimestampToString(value) {
      const newValue = Number(value)
      if (isNaN(newValue)) {
        return newValue
      }
      return value
    },
    // validate values before send values to store or server
    preHandleChange(value) {
      var valueFirst, valueTo
      valueFirst = value

      if ((this.metadata.isRange && !this.metadata.inTable) && Array.isArray(value)) {
        valueFirst = value[0]
        valueTo = value[1]
      }
      if (valueFirst === undefined) {
        valueFirst = null
        valueTo = null
      }
      if (typeof valueFirst !== 'object') {
        valueFirst = new Date(valueFirst)
        valueTo = new Date(valueTo)
      }
      this.handleChange(valueFirst, valueTo)
    }
  }
}
</script>

<style scoped>
  .date-base {
    width: 100% !important;
  }
</style>
