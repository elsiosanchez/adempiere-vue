<template>
  <el-input-number
    v-model="value"
    type="number"
    :pattern="pattern"
    :min="minValue"
    :max="maxValue"
    :placeholder="metadata.help"
    :disabled="Boolean(metadata.readonly || metadata.disabled)"
    controls-position="right"
    :class="'display-type-' + cssClass"
    @blur="validateInput"
    @change="handleChange"
  />
</template>

<script>
export default {
  name: 'NumberBase',
  props: {
    metadata: {
      type: Object,
      required: true
    },
    validateInput: {
      type: Function,
      default: () => undefined
    },
    // value received from data result
    valueModel: {
      type: [Number, String],
      default: undefined
    }
  },
  data() {
    return {
      value: this.metadata.value,
      pattern: undefined,
      showControls: true
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
    },
    cssClass() {
      return this.metadata.referenceType.split(/(?=[A-Z])/).join('-').toLowerCase()
    }
  },
  watch: {
    valueModel(value) {
      this.value = Number(value)
    },
    'metadata.value'(value) {
      this.value = Number(value)
    }
  },
  beforeMount() {
    // enable to dataTable records
    if (this.metadata.inTable && this.valueModel !== undefined) {
      this.value = Number(this.valueModel)
    }
  },
  methods: {
    handleChange() {
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

<style lang="scss">
  /* if is controls width 100% in container */
  .el-input-number, .el-input {
    width: 100% !important; /* ADempiere Custom */
  }

  /** Amount reference **/
  .display-type-amount {
    text-align: right !important;
    input, .el-input__inner {
      text-align: right !important;
    }
  }
  /* ADempiere Custom */
  .el-input-number.is-controls-right .el-input__inner {
    padding-left: 15px;
    padding-right: 50px;
    text-align: -webkit-right;
  }
</style>
