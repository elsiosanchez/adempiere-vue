<template>
  <div>
    <el-date-picker
      v-model="value"
      :format="formatView"
      :value-format="formatSend"
      :type="typePicker"
      range-separator="To"
      :placeholder="metadata.help"
      :start-placeholder="$t('components.dateStartPlaceholder')"
      :end-placeholder="$t('components.dateEndPlaceholder')"
      unlink-panels
      class="date-base"
      :readonly="metadata.readonly"
      :disabled="metadata.readonly || metadata.disabled"
      @change="handleChange"
    />
  </div>
</template>

<script>
import { clientDateTime } from '@/utils/ADempiere/valueUtil.js'

export default {
  name: 'Date',
  props: {
    metadata: {
      type: Object,
      required: true
    },
    valueModel: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      value: this.metadata.parsedDefaultValue + this.metadata.parsedDefaultValueTo,
      formatView: undefined,
      formatSend: undefined
    }
  },
  computed: {
    typePicker() {
      var range = ''
      var time = ''
      if (this.metadata.isRange && !this.metadata.inTable) {
        range = 'DateTimeRangePicker'
      }
      if (String(this.metadata.displayType) === String(16)) {
        time = 'time'
      }
      return 'date' + range + time
    }
  },
  created() {
    this.checkValueFormat()
  },
  beforeMount() {
    // enable to dataTable records
    if (typeof this.valueModel !== 'undefined' && this.value !== null) {
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
      this.formatSend = format
        .replace(/[h]/gi, 'H')
        .replace(/[aA]/gi, '')
    },
    convertTimestamp(value) {
      return (new Date(value)).getTime()
    },
    handleChange(value) {
      var valueFirst, valueTo

      valueFirst = value
      if ((this.metadata.isRange && !this.metadata.inTable) && Array.isArray(value)) {
        valueFirst = value[0]
        valueTo = value[1]
      }
      // if ()
      if (this.metadata.inTable) {
        this.$store.dispatch('notifyCellTableChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          newValue: this.value,
          keyColumn: this.metadata.keyColumn,
          tableIndex: this.metadata.tableIndex,
          rowKey: this.metadata.rowKey
        })
      } else {
        this.$store.dispatch('notifyFieldChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          newValue: valueFirst,
          valueTo: valueTo
        })
      }
    }
  }
}
</script>

<style scoped>
  .date-base {
    width: 100% !important;
  }
</style>
