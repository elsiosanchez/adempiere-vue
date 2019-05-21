<template>
  <el-date-picker
    v-model="value"
    :metadata="metadata"
    :value-format="metadata.VFormat"
    :min="metadata.valueMin"
    :picker-options="pickerOptions1"
    :range="metadata.Range"
    type="datetimerange"
    placeholder="Select date and time"
    @change="handleChange"
  />
</template>

<script>
export default {
  name: 'DateTime',
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
      value: this.metadata.ValueModel,
      pickerOptions1: {
        disabledDate(range) {
          return range.getTime() < Date.now()
        }
      }
      // range: this.metadata.ValueMin + '=' + this.metadata.ValueMax
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
