<template>
  <el-switch
    v-model="value"
    :inactive-text="$t('components.switchInactiveText')"
    :active-text="$t('components.switchActiveText')"
    true-value="true"
    false-value="false"
    :disabled="isDisabled"
    @change="handleChange"
  />
</template>

<script>
import { fieldIsDisplayed } from '@/utils/ADempiere'
import { FIELD_READ_ONLY_FORM } from '@/components/ADempiere/Field/references'
import { fieldMixin } from '@/components/ADempiere/Field/FieldMixin'

export default {
  name: 'FieldYesNo',
  mixins: [fieldMixin],
  data() {
    return {
      value: Boolean(this.metadata.value),
      valuesReadOnly: [
        {
          columnName: 'IsActive',
          isReadOnlyValue: false
        }
      ]
    }
  },
  watch: {
    valueModel(value) {
      this.value = Boolean(value)
    },
    'metadata.value'(value) {
      this.value = Boolean(value)
    },
    value(value, oldValue) {
      if (typeof value !== 'boolean') {
        this.value = Boolean(value)
      }
      this.handleChange('NotSend')
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
      } else if (this.metadata.isAvancedQuery && this.value !== 'NotSend') {
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
          newValue: this.value,
          isDontSendToEdit: Boolean(value === 'NotSend')
        })
        this.isReadOnlyForm(this.value)
      }
    },
    isReadOnlyForm(value) {
      var fieldReadOnlyForm = FIELD_READ_ONLY_FORM.find(item => item.columnName === this.metadata.columnName)
      // columnName: IsActive, Processed, Processing
      if (fieldReadOnlyForm && fieldIsDisplayed(this.metadata)) {
        this.$store.dispatch('changeFieldAttributesBoolean', {
          containerUuid: this.metadata.containerUuid,
          fieldsIncludes: [],
          attribute: 'isReadOnlyFromForm',
          valueAttribute: Boolean(fieldReadOnlyForm.valueIsReadOnlyForm !== value),
          fieldsExcludes: !fieldReadOnlyForm.isChangedAllForm ? [this.metadata.columnName] : [],
          currenValue: value
        })
      }
    }
  }
}
</script>
