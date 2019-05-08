<template>
  <text-base
    :metadata="metadata"
    :load-record="loadRecord"
    :value-model="valueModel"
    :pattern="pattern"
    placeholder="Please input your file path or name"
  />
</template>

<script>
export default {
  name: 'FilePathOrName',
  props: {
    metadata: {
      type: Object,
      required: true
    },
    loadRecord: {
      type: Boolean,
      default: false
    },
    valueModel: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      typeInput: undefined,
      pattern: undefined
    }
  }
}
</script>
