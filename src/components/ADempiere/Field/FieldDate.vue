<template>
  <el-date-picker
    :ref="metadata.columnName"
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
    :picker-options="typePicker === 'daterange' ? pickerOptionsDateRange : pickerOptionsDate"
    @change="preHandleChange"
  />
</template>

<script>
import { clientDateTime } from '@/utils/ADempiere'
import { fieldMixin } from '@/components/ADempiere/Field/FieldMixin'

export default {
  name: 'FieldDate',
  mixins: [fieldMixin],
  data() {
    return {
      // value: this.metadata.isRange && !this.metadata.inTable ? [this.metadata.value, this.metadata.valueTo] : this.metadata.value,
      value: this.metadata.value,
      pickerOptionsDate: {
        shortcuts: [{
          text: this.$t('components.date.Today'),
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: this.$t('components.date.Yesterday'),
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: this.$t('components.date.Week'),
          onClick(picker) {
            const date = new Date()
            var monthEndDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
            picker.$emit('pick', monthEndDay)
          }
        }]
      },
      pickerOptionsDateRange: {
        shortcuts: [{
          text: this.$t('components.date.Yesterday'),
          onClick(picker) {
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', [start, start])
          }
        }, {
          text: this.$t('components.date.Week'),
          onClick(picker) {
            var start_date, end_date, date, currenDate, first, last
            start_date = new Date()
            start_date.setHours(0, 0, 0, 0)
            end_date = new Date()
            date = null
            currenDate = date ? new Date(date) : new Date()
            first = currenDate.getDate() - currenDate.getDay('monday')
            last = first - 7
            start_date.setDate(last)
            end_date.setDate(first - 1)
            picker.$emit('pick', [start_date, end_date])
          }
        }, {
          text: this.$t('components.date.LastMonth'),
          onClick(picker) {
            var date = new Date()
            var monthEndDay = new Date(date.getFullYear(), date.getMonth(), 0)
            var monthStartDay = new Date(date.getFullYear(), date.getMonth() - 1, 1)
            picker.$emit('pick', [monthStartDay, monthEndDay])
          }
        }, {
          text: this.$t('components.date.CurrentMonth'),
          onClick(picker) {
            var date = new Date()
            var monthEndDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
            var monthStartDay = new Date(date.getFullYear(), date.getMonth(), 1)
            picker.$emit('pick', [monthStartDay, monthEndDay])
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
  watch: {
  //   valueModel(value) {
  //     if (typeof value === 'number') {
  //       value = new Date(value)
  //     }
  //     this.value = value
  //   },
    'metadata.value'(value) {
      if (typeof value === 'number') {
        value = new Date(value)
      }
      if (value === null) {
        value = undefined
      }

      this.value = value
      if (this.metadata.isRange) {
        var valueTo = this.metadata.valueTo
        if (typeof valueTo === 'number') {
          valueTo = new Date(valueTo)
        }
        if (valueTo === null) {
          valueTo = undefined
        }
        this.value = [this.value, valueTo]
      }
    }
  },
  created() {
    this.checkValueFormat()
    // set value to, when field is type range
    if (this.metadata.isRange && !this.metadata.inTable) {
      this.value = [this.metadata.value, this.metadata.valueTo]
    }
  },
  beforeMount() {
    // enable to dataTable records
    if (this.metadata.inTable && this.valueModel) {
      this.value = this.valueModel
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
    // validate values before send values to store or server
    preHandleChange(value) {
      var valueFirst, valueTo
      valueFirst = value

      if ((this.metadata.isRange && !this.metadata.inTable) && Array.isArray(value)) {
        valueFirst = value[0]
        valueTo = value[1]
      }
      if (valueFirst === null) {
        valueFirst = undefined
        valueTo = undefined
      }
      if (typeof valueFirst !== 'object' && valueFirst !== undefined) {
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
