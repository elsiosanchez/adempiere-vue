<template>
  <el-date-picker
    v-model="value"
    :format="formatView"
    :value-format="formatSend"
    :type="typePicker"
    :placeholder="metadata.help"
    range-separator="-"
    :start-placeholder="$t('components.dateStartPlaceholder')"
    :end-placeholder="$t('components.dateStartPlaceholder')"
    unlink-panels
    @change="handleChange"
  />
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
    loadRecord: {
      type: Boolean,
      default: false
    },
    valueModel: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      value: this.metadata.value,
      formatView: undefined,
      formatSend: undefined
    }
  },
  computed: {
    typePicker() {
      var time = ''
      var range = ''
      if (this.metadata.displayType === 16) {
        time = 'time'
      }
      if (this.metadata.isRange) {
        range = 'range'
      }
      return 'date' + time + range
    }
  },
  watch: {
    valueModel: function() {
      this.value = this.valueModel
    }
  },
  created() {
    this.checkValueFormat()
  },
  beforeMount() {
    if (this.valueModel !== '') {
      this.value = this.valueModel
    }
  },
  mounted() {
    this.$store.dispatch('setContext', {
      parentUuid: this.metadata.parentUuid,
      containerUuid: this.metadata.containerUuid,
      columnName: this.metadata.columnName,
      value: this.value
    })
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
      var typeFormat = ''
      if (this.typePicker.replace('range', '') === 'date') {
        typeFormat = 'd'
      }

      var valueFirst = clientDateTime(value, typeFormat)
      var valueTo

      if (this.metadata.isRange || value.isArray) {
        valueFirst = clientDateTime(value[0], typeFormat)
        valueTo = clientDateTime(value[1], typeFormat)
      }

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
</script>

<style scoped>
  .el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 100% !important;
  }
</style>
