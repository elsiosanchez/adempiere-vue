<template>
  <el-tabs v-model="currentTab" type="border-card" @tab-click="handleClick">
    <template v-for="(item, key) in tabsList">
      <el-tab-pane
        :key="key"
        :label="item.name"
        :windowuuid="windowUuid"
        :tabuuid="item.uuid"
        :position-tab="key"
        :name="String(key)"
        :lazy="true"
        :disabled="isCreateNew"
      >
        <el-col :span="24">
          <data-table
            :parent-uuid="windowUuid"
            :container-uuid="item.uuid"
            :panel-type="panelType"
          />
        </el-col>
      </el-tab-pane>
    </template>
  </el-tabs>
</template>

<script>
import { tabMixin } from '@/components/ADempiere/Tab/tabMixin'
import DataTable from '@/components/ADempiere/DataTable'

export default {
  name: 'TabChildren',
  components: {
    DataTable
  },
  mixins: [tabMixin],
  props: {
    firstTab: {
      type: String,
      default: undefined
    }
  },
  computed: {
    getterIsLoadRecordParent() {
      return this.$store.getters.getTabIsLoadRecord(this.windowUuid, this.firstTab)
    }
  },
  watch: {
    getterIsLoadRecordParent(value) {
      if (value) {
        if (this.getterDataRecords.length <= 0) {
          this.getData()
        }
      }
    }
  }
}
</script>

<style>
  .el-tabs__content {
    overflow: hidden;
    position: relative;
    padding-top: 0px !important;
    padding-right: 15px !important;
    padding-bottom: 0px !important;
    padding-left: 15px !important;
  }
</style>
