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
        :style="isShowedDetail ? { height: '100%', overflow: 'hidden' } : { height: '75vh', overflow: 'auto' }"
      >
        <main-panel
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
import MainPanel from '@/components/ADempiere/Panel'

export default {
  name: 'TabParent',
  components: {
    MainPanel
  },
  mixins: [tabMixin],
  computed: {
    // if tabs children is showed or closed
    isShowedDetail() {
      return this.$store.getters.getWindow(this.windowUuid).isShowedDetail
    }/* ,
    getterIsLoadField() {
      return this.$store.getters.getTabIsLoadField(this.windowUuid, this.tabUuid)
    } */
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
    }/* ,
    getterIsLoadField(value) {
      if (value) {
        if (this.$route.query.action && this.$route.query.action !== 'create-new') {
          this.$store.dispatch('addCustomWhereClauseFromRoute', {
            actionValue: this.$route.query.action,
            tabUuid: this.tabUuid,
            windowUuid: this.windowUuid
          })
          this.getData()
        } else {
          this.getData()
        }
      }
    } */
  }
}
</script>
