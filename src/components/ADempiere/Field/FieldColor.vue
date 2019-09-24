<template>
  <el-color-picker
    v-model="value"
    :show-alpha="showAlphaColor"
    :disabled="isDisabled"
    @change="handleChange"
  />
</template>

<script>
import { fieldMixin } from '@/components/ADempiere/Field/FieldMixin'

export default {
  name: 'FieldColor',
  mixins: [fieldMixin],
  data() {
    return {
      showAlphaColor: true
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
  }
}
</script>
