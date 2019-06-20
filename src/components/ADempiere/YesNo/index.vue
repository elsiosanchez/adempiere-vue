<template>
  <el-switch
    v-model="value"
    inactive-text="Not"
    active-text="Yes"
    true-value="true"
    false-value="false"
    :name="metadata.columnName"
    @change="handleChange"
  />
</template>

<script>
export default {
  name: 'YesNo',
  props: {
    metadata: {
      type: Object,
      required: true
    },
    valueModel: {
      type: [String, Boolean],
      default: undefined
    }
  },
  data() {
    return {
      value: Boolean(this.metadata.value),
      isReadOnly: false,
      isMadatory: false
    }
  },
  watch: {
    valueModel: function() {
      this.value = this.valueModel
    }
  },
  mounted() {
    this.handleChange() // activate logics
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
