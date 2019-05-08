<template>
  <text-base
    :metadata="metadata"
    :load-record="loadRecord"
    :value-model="value"
    :type-input="typeInput"
    :placeholder="'http://www.example.com'"
    :pattern="pattern"
    @blur="validateInput"
  />
</template>

<script>
import TextBase from '@/components/ADempiere/TextBase'

export default {
  name: 'Url',
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
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // typeInput: 'url'
      typeInput: undefined,
      pattern: undefined
    }
  },
  methods: {
    validateInput(e) {
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
