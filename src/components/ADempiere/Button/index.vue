<template>
  <el-input
    :type="typeInput"
  />
</template>

<script>
export default {
  name: 'ButtonBase',
  props: {
    typeInput: {
      type: String,
      default: 'hidden'
    }
  },
  data() {
    return {
      value: ''
    }
  }
}
</script>
