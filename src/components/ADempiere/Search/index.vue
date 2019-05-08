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
  name: 'Search',
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
      type: [Object, Array, String, Number],
      default: function() {
        return {}
      }
    }
  }
}
</script>
