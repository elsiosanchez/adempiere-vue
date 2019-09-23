<template>
  <el-upload
    v-model="value"
    :limit="metadata.Limit"
    :on-remove="handleRemove"
    :on-success="handleSuccess"
    :on-error="handleError"
    class="image-uploader"
    action="https://jsonplaceholder.typicode.com/posts/"
    :disabled="Boolean(metadata.readonly || metadata.disabled)"
    @change="handleChange"
  >
    <el-button size="small" type="primary">
      {{ $t('components.binaryButton') }}
    </el-button>
    <div slot="tip" class="el-upload__tip">
      {{ $t('components.binaryTip') }}
    </div>
  </el-upload>
</template>

<script>
export default {
  name: 'Binary',
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
    },
    handleRemove(file) {
      this.$message.success(`The previously uploaded file has been deleted.`)
    },
    handleError(file) {
      this.$message.error(`The file does not meet the specifications.`)
    },
    handleSuccess(file) {
      this.$message.success(`The file has been successfully loaded.`)
    }
  }
}
</script>
