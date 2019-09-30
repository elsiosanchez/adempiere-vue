<template>
  <el-input
    v-model="value"
    type="hidden"
    @change="preHandleChange"
  />
</template>

<script>
import { fieldMixin } from '@/components/ADempiere/Field/FieldMixin'

export default {
  name: 'FieldButton',
  mixins: [fieldMixin],
  watch: {
    valueModel(value) {
      this.value = String(value)
    },
    'metadata.value'(value) {
      this.value = String(value)
    }
  },
  beforeMount() {
    // enable to dataTable records
    if (this.metadata.inTable && this.valueModel !== undefined) {
      this.value = String(this.valueModel)
    } else if (typeof this.valueModel === 'boolean') {
      this.value = String(this.valueModel)
    }
  },
  methods: {
    // validate values before send values to store or server
    preHandleChange(value) {
      this.handleChange(value)
    }
  }
}
</script>
