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
      v-for="(item, key) in getterFieldListOptional"
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
    groupField: {
      type: String,
      default: ''
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
    getterFieldListOptional() {
      return this.$store.getters.getFieldsListNotMandatory(this.containerUuid).filter(fieldItem => {
        return fieldItem.groupAssigned === this.groupField
      })
    },
    getFieldSelected() {
      return this.getterFieldListOptional
        .filter(fieldItem => {
          return fieldItem.isShowedFromUser
        })
        .map(itemField => itemField.columnName)
    }
  },
  created() {
    this.selectedFields = this.getFieldSelected
  },
  // updated() {
  //   setTimeout(() => {
  //     //your code to be executed after 1 second
  //     this.selectedFields = this.getFieldSelected
  //   }, 2000);
  // },
  methods: {
    /**
     * @param {array} selectedValues
     */
    addField(selectedValues) {
      this.$store.dispatch('changeFieldShowedFromUser', {
        containerUuid: this.containerUuid,
        fieldsUser: selectedValues,
        show: true,
        groupField: this.groupField
      })
    }
  }
}
</script>
<style>
  .el-tag--small {
    height: 24px;
    padding: 0 8px;
    line-height: 22px;
    max-width: 65%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .el-select .el-tag__close.el-icon-close {
    background-color: #C0C4CC;
    right: 0px;
    top: 0;
    color: #FFFFFF;
  }
</style>
