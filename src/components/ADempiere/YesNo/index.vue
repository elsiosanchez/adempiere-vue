<template>
  <el-switch
    v-model="value"
    inactive-text="Not"
    active-text="Yes"
    true-value="true"
    false-value="false"
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
    loadRecord: {
      type: Boolean,
      default: false
    },
    valueModel: {
      type: [String, Boolean],
      default: false
    }
  },
  data() {
    return {
      value: Boolean(this.metadata.defaultValue),
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
    this.$store.dispatch('setContext', {
      parentUuid: this.metadata.parentUuid,
      containerUuid: this.metadata.containerUuid,
      columnName: this.metadata.columnName,
      value: this.value
    })
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
