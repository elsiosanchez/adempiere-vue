<template>
  <el-date-picker
    v-model="value"
    :format="format"
    value-format="timestamp"
    :type="typePicker()"
    placeholder="Pick a day"
    range-separator="To"
    start-placeholder="Start date"
    end-placeholder="End date"
    unlink-panels
    @change="handleChange"
  />
</template>

<script>
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
      format: undefined
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
  mounted() {
    this.$store.dispatch('setContext', {
      parentUuid: this.metadata.parentUuid,
      containerUuid: this.metadata.containerUuid,
      columnName: this.metadata.columnName,
      value: this.value
    })
  },
  methods: {
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
    },
    /**
     * Parse the date format to be compatible with element-ui
     */
    checkValueFormat() {
      // Date = 15
      var format = this.metadata.VFormat.replace(/[Y]/gi, 'y').replace(/[m]/gi, 'M').replace(/[D]/gi, 'd')
      if (format === '') {
        format = 'yyyy/MM/dd'
      }
      this.format = format
    },
    convertTimestamp() {
      this.value = (new Date(this.metadata.value)).getTime()
    },
    handleChange(value) {
      var valueFirst = new Date(value)
      var valueTo
      if (this.metadata.isRange || value.isArray) {
        valueFirst = new Date(value[0])
        valueTo = new Date(value[1])
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
