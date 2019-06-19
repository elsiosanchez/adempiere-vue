<template>
  <el-input
    v-model="value"
    :type="typeInput"
    @change="handleChange"
  />
</template>

<script>
export default {
  name: 'Button',
  props: {
    metadata: {
      type: Object,
      required: true
    },
    loadRecord: {
      type: Boolean,
      default: false
    },
    typeInput: {
      type: String,
      default: 'hidden'
    },
    valueModel: {
      type: [String, Number, Boolean],
      default: undefined
    }
  },
  data() {
    return {
      value: '',
      isReadOnly: false
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
