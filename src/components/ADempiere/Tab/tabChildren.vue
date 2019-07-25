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
    },
    isEdit: {
      type: Boolean,
      default: false
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
    if (this.tabsList.length >= 0) {
      this.tabUuid = this.tabsList[0].uuid
    }
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
    }
  }
}
</script>
