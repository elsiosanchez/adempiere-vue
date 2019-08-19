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
        style="height: 80vh;overflow: auto;"
        :disabled="Boolean(key > 0 && uuidRecord === 'create-new')"
      >
        <panel
          :parent-uuid="windowUuid"
          :container-uuid="item.uuid"
          :metadata="item"
          :table-name="item.tableName"
          :group="item.tabGroup"
          :panel-type="panelType"
        />
      </el-tab-pane>
    </template>
  </el-tabs>
</template>

<script>
import Panel from '@/components/ADempiere/Panel'

export default {
  name: 'TabParent',
  components: {
    Panel
  },
  props: {
    windowUuid: {
      type: String,
      default: ''
    },
    tabsList: {
      type: [Array, Object],
      default: () => []
    }
  },
  data() {
    return {
      isLoading: false,
      currentTab: this.$route.params.tabNumber,
      uuidRecord: this.$route.params.action,
      tabUuid: '',
      panelType: 'window'
    }
  },
  created() {
    this.tabUuid = this.tabsList[0].uuid
    this.getData()
  },
  methods: {
    setCurrentTab() {
      this.$store.dispatch('setCurrentTab', {
        parentUuid: this.windowUuid,
        containerUuid: this.tabUuid
      })
    },
    /**
     * @param {object} tabHTML DOM HTML the tab clicked
     */
    handleClick(tabHTML) {
      if (this.tabUuid !== tabHTML.$attrs.tabuuid) {
        this.tabUuid = tabHTML.$attrs.tabuuid
        this.setCurrentTab()
      }
      // this.setPemantLink(tabHTML)
      this.getData()
    },
    /**
     * TODO: Verify use
     */
    setPemantLink(tabHTML) {
      this.$route.params.tabNumber = tabHTML.name
      this.currentTab = this.$route.params.tabNumber
      /* this.$router.replace({
        params: { tabNumber: tabHTML.name }
      })*/
      this.$router.push({
        name: this.$route.name,
        params: {
          tabNumber: tabHTML.name
        }
      })
    },
    getData() {
      this.$store.dispatch('getDataListTab', {
        parentUuid: this.windowUuid,
        containerUuid: this.tabUuid
      })
        .catch(error => {
          console.warn(error)
        })
    }
  }
}
</script>
<style scoped>
.el-tabs__content {
    height: 80vh;
    overflow: auto;
    position: relative;
    padding-top: 0px !important;
    padding-right: 15px !important;
    padding-bottom: 0px !important;
    padding-left: 15px !important;
  }
</style>
