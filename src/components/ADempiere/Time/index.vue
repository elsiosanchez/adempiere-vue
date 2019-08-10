<template>
  <el-time-picker
    v-model="value"
    :value-format="metadata.VFormat"
    :picker-options="{
      selectableRange: metadata.Range,
      minTime: metadata.valueMin,
      maxTime: metadata.valueMax
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
export default {
  name: 'TimeBase',
  props: {
    metadata: {
      type: Object,
      required: true
    },
    // value received from data result
    valueModel: {
      type: String,
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
    }
  },
  watch: {
    valueModel(value) {
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
    handleChange(value) {
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
          newValue: this.value
        })
      }
    }
  }
}
</script>

<style>
  .tiem-base {
    width: 100% !important;
  }
</style>
