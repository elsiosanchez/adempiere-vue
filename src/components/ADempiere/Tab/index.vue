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
        :disabled="Boolean(key > 0 && isCreateNew)"
        :style="isShowedDetail ? {height: '100%', overflow: 'hidden'} : { height: '75vh', overflow: 'auto'}"
      >
        <panel-fields
          :parent-uuid="windowUuid"
          :container-uuid="item.uuid"
          :metadata="item"
          :group="item.tabGroup"
          :panel-type="panelType"
          :is-re-search="Boolean(key == 0 || (key > 0 && firstTableName != item.tableName))"
        />
      </el-tab-pane>
    </template>
  </el-tabs>
</template>

<script>
import { tabMixin } from '@/components/ADempiere/Tab/tabMixin'
import PanelFields from '@/components/ADempiere/Panel'

export default {
  name: 'TabParent',
  components: {
    PanelFields
  },
  mixins: [tabMixin],
  computed: {
    // if tabs children is showed or closed
    isShowedDetail() {
      return this.$store.getters.getWindow(this.windowUuid).isShowedDetail
    }
  },
  watch: {
    // TODO: Remove watchers of action, and pased as props from window
    '$route.query.action'(actionValue) {
      if (actionValue === 'create-new') {
        this.currentTab = '0'
      }
    },
    currentTab(tabNumber) {
      this.$router.push({
        name: this.$route.name,
        query: {
          action: this.$route.query.action,
          tabNumber: tabNumber
        }
      })
    }
  }
}
</script>
