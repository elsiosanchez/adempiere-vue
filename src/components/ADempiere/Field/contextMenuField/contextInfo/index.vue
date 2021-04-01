<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>
        {{ $t('field.field') }}
        <b> {{ fieldAttributes.name }} </b>
      </span>
    </div>
    <el-form ref="form" label-position="top" label-width="120px" @submit.native.prevent="notSubmitForm">
      <el-form-item :label="$t('field.container.description')">
        {{ fieldAttributes.description }}
      </el-form-item>
      <el-form-item :label="$t('field.container.help')">
        {{ fieldAttributes.help }}
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>

export default {
  name: 'FieldContextInfo',
  props: {
    fieldAttributes: {
      type: Object,
      required: true
    },
    fieldValue: {
      type: [Number, String, Boolean, Array, Object, Date],
      default: undefined
    }
  },
  data() {
    return {
      value: this.fieldValue
    }
  },
  watch: {
    fieldValue(value) {
      this.value = value
    }
  },
  methods: {
    notSubmitForm(event) {
      event.preventDefault()
      return false
    }
  }
}
</script>
