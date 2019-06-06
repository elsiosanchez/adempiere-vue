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
      value: this.metadata.value,
      isReadOnly: false,
      patternFileName: '[A-Za-zñÑ0-9-_]{1,}',
      patternFilePath: '[A-Za-zñÑ0-9-_/.]{1,}'
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
    },
    validateUrl(e) {
      // Entry pattern, in this case only accepts numbers and letters
      var _Pattern = /^(http[s]?:\/\/(www\.)?|ftp:\/\/(www\.)?|www\.){1}([0-9A-Za-z-\.@:%_\+~#=]+)+((\.[a-zA-Z]{1,5})+)(\/(.)*)?(\?(.)*)?/g
      var rex = RegExp(_Pattern)
      var value = e.target.value
      if (rex.test(value) && value.trim() !== '') {
        console.log('url good format')
      } else if (value.trim() === '') {
        console.log('url empty')
      } else {
        // e.target.focus()
        console.log('url wrong')
      }
    }
  }
}
</script>
