
export const fieldMixin = {
  props: {
    metadata: {
      type: Object,
      required: true
    },
    // value received from data result
    valueModel: {
      type: [String, Number, Boolean, Date, Array],
      default: null
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
    activeFocus() {
      if (this.metadata.isUpdateable) {
        this.$refs[this.metadata.columnName].focus()
      }
    },
    handleChange(value, valueTo = undefined, label = undefined) {
      const sendParameters = {
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        field: this.metadata,
        panelType: this.metadata.panelType,
        columnName: this.metadata.columnName,
        newValue: value === 'NotSend' ? this.value : value,
        valueTo: valueTo,
        isAdvancedQuery: this.metadata.isAdvancedQuery,
        isSendToServer: !(value === 'NotSend' || this.metadata.isAdvancedQuery)
      }

      if (this.metadata.inTable) {
        this.$store.dispatch('notifyCellTableChange', {
          ...sendParameters,
          keyColumn: this.metadata.keyColumn,
          tableIndex: this.metadata.tableIndex,
          rowKey: this.metadata.rowKey
        })
      } else {
        this.$store.dispatch('notifyFieldChange', {
          ...sendParameters,
          displayColumn: label,
          isChangedOldValue: this.metadata.componentPath === 'FieldYesNo' && Boolean(value === 'NotSend')
        })
      }
    }
  }
}

export const fieldMixin2 = {

}
