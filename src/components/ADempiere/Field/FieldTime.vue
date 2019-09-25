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
    :readonly="Boolean(metadata.readonly)"
    :disabled="isDisabled"
    @change="handleChange"
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
      if (typeof value === 'number') {
        value = new Date(value)
      }
      this.value = value
    },
    'metadata.value'(value) {
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
      } else if (this.metadata.isAvancedQuery) {
        this.$store.dispatch('notifyFieldChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          newValue: this.value,
          isDontSendToEdit: true,
          panelType: this.metadata.panelType,
          isAvancedQuery: this.metadata.isAvancedQuery
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
