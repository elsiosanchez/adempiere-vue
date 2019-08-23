<template>
  <el-switch
    v-model="value"
    :inactive-text="$t('components.switchInactiveText')"
    :active-text="$t('components.switchActiveText')"
    true-value="true"
    false-value="false"
    :disabled="metadata.readonly || metadata.disabled"
    @change="handleChange"
  />
</template>

<script>
export default {
  name: 'YesNo',
  props: {
    metadata: {
      type: Object,
      required: true
    },
    // value received from data result
    valueModel: {
      type: [String, Boolean],
      default: undefined
    }
  },
  data() {
    return {
      value: Boolean(this.metadata.value)
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
      this.value = Boolean(value)
    },
    '$route.query.action'(actionValue) {
      if (actionValue === 'create-new') {
        this.value = this.metadata.defaultValue
      }
    }
  },
  mounted() {
    this.handleChange('NotSend') // activate logics
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
      } else {
        this.$store.dispatch('notifyFieldChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          newValue: this.value,
          isDontSendToEdit: Boolean(value === 'NotSend')
        })
      }
    }
  }
}
</script>
