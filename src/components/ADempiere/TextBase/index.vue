<template>
  <el-input
    v-model="value"
    :pattern="pattern"
    :minlength="metadata.MinLength"
    :maxlength="metadata.MaxLength"
    :type="typeInput"
    :placeholder="placeholder"
    @blur="validateInput"
    @change="handleChange"
  />
</template>

<script>
export default {
  name: 'TextBase',
  props: {
    metadata: {
      type: Object,
      required: true
    },
    loadRecord: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      default: undefined
    },
    typeInput: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: 'Please input'
    },
    validateInput: {
      type: Function,
      default: () => undefined
    },
    valueModel: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      value: this.metadata.defaultValue,
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
