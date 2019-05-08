<template>
  <select-base
    :metadata="metadata"
    :load-record="loadRecord"
    :value-model="valueModel"
  />
</template>

<script>
import SelectBase from '@/components/ADempiere/SelectBase'

export default {
  name: 'Assignment',
  components: {
    SelectBase
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
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      loading: false,
      options: [],
      list: []
    }
  }
}
</script>
