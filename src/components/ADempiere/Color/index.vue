<template>
  <el-color-picker
    v-model="value"
    :show-alpha="showAlphaColor"
    :disabled="Boolean(metadata.readonly || metadata.disabled)"
    @change="handleChange"
  />
</template>

<script>
export default {
  name: 'ColorBase',
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
      value: this.metadata.value,
      showAlphaColor: true
    }
  },
  computed: {
    getterValue() {
      var field = this.$store.getters.getFieldFromColumnName(this.metadata.containerUuid, this.metadata.columnName)
      if (field) {
        return field.value
      }
      return undefined
    }
  },
  watch: {
    valueModel(value) {
      this.value = value
    },
    'metadata.value'(value) {
      this.value = value
    }
  },
  beforeMount() {
    // enable to dataTable records
    if (this.metadata.inTable && this.valueModel !== undefined) {
      this.value = String(this.valueModel)
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
