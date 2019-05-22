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
      value: this.metadata.ValueModel,
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
      if (this.metadata.isRange) {
        return 'daterange'
      }
      return 'date'
    },
    /**
     * Parse the date format to be compatible with element-ui
     */
    checkValueFormat() {
      // Date = 15
      this.format = this.metadata.VFormat.replace(/[Y]/gi, 'y').replace(/[m]/gi, 'M').replace(/[D]/gi, 'd')
    },
    handleChange() {
      this.$store.dispatch('notifyFieldChange', {
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        columnName: this.metadata.columnName,
        newValue: this.value
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
