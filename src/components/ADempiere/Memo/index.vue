<template>
  <text-base
    :metadata="metadata"
    :load-record="loadRecord"
    :value-model="valueModel"
    :type-input="typeInput"
  />
</template>

<script>
import TextBase from '@/components/ADempiere/TextBase'

export default {
  name: 'Memo',
  components: {
    TextBase
  },
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
      typeInput: 'textarea'
    }
  }
}
</script>
