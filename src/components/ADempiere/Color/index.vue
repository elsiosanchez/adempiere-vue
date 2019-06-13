<template>
  <el-color-picker
    v-model="value"
    :value="metadata.DefaultValue"
    :show-alpha="ShowAlphaColor"
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
      value: this.metadata.value,
      ShowAlphaColor: true
    }
  },
  watch: {
    valueModel: function() {
      this.value = this.valueModel
    }
  },
  beforeMount() {
    if (this.valueModel !== '') {
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
