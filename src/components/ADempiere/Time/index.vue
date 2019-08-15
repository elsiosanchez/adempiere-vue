<template>
  <el-time-picker
    v-model="value"
    :picker-options="{
      minTime: minValue,
      maxTime: maxValue
    }"
    :is-range="isPickerRange"
    range-separator="-"
    :placeholder="$t('components.timePlaceholder')"
    class="time-base"
    :readonly="metadata.readonly"
    :disabled="metadata.disabled"
    @change="handleChange"
  />
</template>

<script>
import { isEmptyValue } from '@/utils/ADempiere'

export default {
  name: 'TimeBase',
  props: {
    metadata: {
      type: Object,
      required: true
    },
    // value received from data result
    valueModel: {
      type: [String, Number],
      default: undefined
    }
  },
  data() {
    return {
      value: this.metadata.value
    }
  },
  computed: {
    getterValue() {
      var field = this.$store.getters.getFieldFromColumnName(this.metadata.containerUuid, this.metadata.columnName)
      if (field) {
        return field.value
      }
      return undefined
    },
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
      if (typeof value === 'number') {
        value = new Date(value)
      }
      this.value = value
    }
  },
  beforeMount() {
    // enable to dataTable records
    if (this.metadata.inTable && this.valueModel !== undefined) {
      this.value = this.valueModel
    }
  },
  methods: {
    isEmptyValue,
    handleChange(value) {
      if (typeof value !== 'object') {
        value = new Date(value)
      }

      if (this.metadata.inTable) {
        this.$store.dispatch('notifyCellTableChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          newValue: this.value,
          keyColumn: this.metadata.keyColumn,
          tableIndex: this.metadata.tableIndex,
          rowKey: this.metadata.rowKey,
          panelType: this.metadata.panelType
        })
      } else {
        this.$store.dispatch('notifyFieldChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          newValue: this.value
        })
      }
    }
  }
}
</script>

<style scoped>
  .time-base {
    width: 100% !important;
  }
</style>
