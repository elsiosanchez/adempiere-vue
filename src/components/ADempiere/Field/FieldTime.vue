<template>
  <el-time-picker
    :ref="metadata.columnName"
    v-model="value"
    :picker-options="{
      minTime: minValue,
      maxTime: maxValue
    }"
    :is-range="isPickerRange"
    range-separator="-"
    :placeholder="$t('components.timePlaceholder')"
    class="time-base"
    :readonly="Boolean(metadata.readonly)"
    :disabled="isDisabled"
    @change="preHandleChange"
  />
</template>

<script>
import { fieldMixin } from '@/components/ADempiere/Field/FieldMixin'

export default {
  name: 'FieldTime',
  mixins: [fieldMixin],
  computed: {
    isPickerRange() {
      if (this.metadata.isRange && !this.metadata.inTable) {
        return true
      }
      return false
    },
    maxValue() {
      if (!this.isEmptyValue(this.metadata.valueMax)) {
        return Number(this.metadata.valueMax)
      }
      return Infinity
    },
    minValue() {
      if (!this.isEmptyValue(this.metadata.valueMin)) {
        return Number(this.metadata.valueMin)
      }
      return -Infinity
    }
  },
  watch: {
    valueModel(value) {
      if (this.metadata.inTable) {
        if (typeof value === 'number') {
          value = new Date(value)
        }
        this.value = value
      }
    },
    'metadata.value'(value) {
      if (!this.metadata.inTable) {
        if (typeof value === 'number') {
          value = new Date(value)
        }
        this.value = value
      }
    }
  },
  beforeMount() {
    // enable to dataTable records
    if (this.metadata.inTable && this.valueModel !== undefined) {
      this.value = this.valueModel
    }
  },
  methods: {
    // validate values before send values to store or server
    preHandleChange(value) {
      if (typeof value !== 'object') {
        value = new Date(value)
      }

      this.handleChange(value)
    }
  }
}
</script>

<style scoped>
  .time-base {
    width: 100% !important;
  }
</style>
