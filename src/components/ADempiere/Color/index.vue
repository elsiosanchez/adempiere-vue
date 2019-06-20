<template>
  <el-color-picker
    v-model="value"
    :value="value"
    :show-alpha="showAlphaColor"
    @change="handleChange"
  />
</template>

<script>
export default {
  name: 'Color',
  props: {
    metadata: {
      type: Object,
      required: true
    },
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
  watch: {
    valueModel() {
      this.value = this.valueModel
    }
  },
  beforeMount() {
    // enable to dataTable records
    if (typeof this.valueModel !== 'undefined') {
      this.value = this.valueModel
    }
  },
  methods: {
    handleChange() {
      this.$store.dispatch('notifyFieldChange', {
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        columnName: this.metadata.columnName,
        newValue: this.value
      })
    }
  }
}
</script>
