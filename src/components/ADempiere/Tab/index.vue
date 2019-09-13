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
        style="height: 80vh; overflow: auto;"
        :disabled="Boolean(key > 0 && isCreateNew)"
      >
        <panel
          :parent-uuid="windowUuid"
          :container-uuid="item.uuid"
          :metadata="item"
          :group="item.tabGroup"
          :panel-type="panelType"
          :window-type="windowType"
          :is-re-search="Boolean(key == 0 || (key > 0 && firstTableName != item.tableName))"
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
    },
    windowType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isLoading: false,
      currentTab: this.$route.query.tabNumber,
      tabUuid: '',
      panelType: 'window',
      firstTableName: this.tabsList[0].tableName
    }
  },
  computed: {
    isCreateNew() {
      return Boolean(this.$route.query.action === 'create-new')
    }
  },
  watch: {
    currentTab(tabNumber) {
      this.$router.push({
        name: this.$route.name,
        query: {
          action: this.$route.query.action,
          tabNumber: tabNumber
        }
      })
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
      this.currentTab = tabHTML.name
      this.getData()
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
