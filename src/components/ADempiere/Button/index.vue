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
      type: [String, Number, Boolean, Array],
      default: ''
    }
  },
  data() {
    return {
      value: '',
      isReadOnly: false
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
