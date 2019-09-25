
export const fieldMixin = {
  props: {
    metadata: {
      type: Object,
      required: true
    },
    // value received from data result
    valueModel: {
      type: [String, Number, Boolean, Date, Array],
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
      const field = this.$store.getters.getFieldFromColumnName(this.metadata.containerUuid, this.metadata.columnName)
      if (field) {
        return field.value
      }
      return undefined
    },
    isDisabled() {
      return Boolean(this.metadata.readonly || this.metadata.disabled)
    }
  },
  methods: {
    handleChange(value, valueTo = undefined, label = undefined) {
      if (this.metadata.inTable) {
        this.$store.dispatch('notifyCellTableChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          newValue: value,
          keyColumn: this.metadata.keyColumn,
          tableIndex: this.metadata.tableIndex,
          rowKey: this.metadata.rowKey,
          panelType: this.metadata.panelType
        })
      } else {
        this.$store.dispatch('notifyFieldChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          panelType: this.metadata.panelType,
          columnName: this.metadata.columnName,
          newValue: value,
          valueTo: valueTo,
          displayColumn: label,
          isDontSendToEdit: Boolean(value === 'NotSend') || this.metadata.isAvancedQuery,
          isAvancedQuery: this.metadata.isAvancedQuery
        })
      }
    }
  }
}

export const fieldMixin2 = {

}
