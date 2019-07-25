<template>
  <el-select
    v-model="selectedFields"
    :filterable="!isMobile"
    :placeholder="$t('components.filterableItems')"
    multiple
    collapse-tags
    value-key="key"
    style="float: right;"
    @change="addField"
  >
    <el-option
      v-for="(item, key) in getFieldListOptional.fieldListOptional"
      :key="key"
      :label="item.name"
      :value="item.columnName"
    />
  </el-select>
</template>

<script>
export default {
  name: 'FilterFields',
  props: {
    containerUuid: {
      type: String,
      required: true
    },
    panelType: {
      type: String,
      default: 'window'
    },
    groupField: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      selectedFields: [] // fields optional showed
    }
  },
  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    getterFieldsListFromPanel() {
      return this.$store.getters.getFieldsListFromPanel(this.containerUuid)
    },
    getFieldListOptional() {
      return this.$store.getters.getFieldsListNotMandatory(this.containerUuid, this.panelType, this.groupField)
    }
  },
  updated() {
    this.selectedFields = this.getFieldListOptional.fieldListSelected
  },
  methods: {
    /**
     * @param {array} selectedValues
     */
    addField(selectedValues) {
      this.$store.dispatch('changeFieldShowedFromUser', {
        containerUuid: this.containerUuid,
        fieldsUser: selectedValues,
        show: true
      })
    }
  }
}
</script>
