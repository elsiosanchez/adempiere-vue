<template>
  <el-upload
    v-model="value"
    :limit="metadata.Limit"
    :on-remove="handleRemove"
    :on-success="handleSuccess"
    :on-error="handleError"
    class="image-uploader"
    action="https://jsonplaceholder.typicode.com/posts/"
    :disabled="isDisabled"
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
import { fieldMixin } from '@/components/ADempiere/Field/FieldMixin'

export default {
  name: 'FieldBinary',
  mixins: [fieldMixin],
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
