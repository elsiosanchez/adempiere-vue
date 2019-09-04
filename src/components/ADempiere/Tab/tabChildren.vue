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
      >
        <el-col :span="24">
          <div class="paneltab">
            <data-table
              :parent-uuid="windowUuid"
              :container-uuid="item.uuid"
              :panel-type="panelType"
            />
          </div>
        </el-col>
      </el-tab-pane>
    </template>
  </el-tabs>
</template>

<script>
import DataTable from '@/components/ADempiere/DataTable'

export default {
  name: 'Tab',
  components: {
    DataTable
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
      tableName: [],
      isLoading: false,
      currentTab: this.$route.params.tabNumber,
      uuidRecord: this.$route.params.uuidRecord,
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
      this.getData()
      // this.setPemantLink(tabHTML)
    },
    /**
     * TODO: Verify use
     */
    setPemantLink(tabHTML) {
      this.$route.params.tabNumber = tabHTML.name
      this.currentTab = this.$route.params.tabNumber
      this.$router.push({
        name: this.$route.name,
        query: {
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
