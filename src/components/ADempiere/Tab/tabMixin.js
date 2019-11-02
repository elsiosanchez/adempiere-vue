import { parseContext } from '@/utils/ADempiere'

export const tabMixin = {
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
      currentTab: this.$route.query.tabParent,
      tabUuid: '',
      panelType: 'window',
      firstTableName: this.tabsList[0].tableName
    }
  },
  computed: {
    isCreateNew() {
      return Boolean(this.$route.query.action === 'create-new')
    },
    getterDataRecords() {
      return this.$store.getters.getDataRecordsList(this.tabUuid)
    }
  },
  created() {
    this.tabUuid = this.tabsList[0].uuid
  },
  methods: {
    parseContext,
    setCurrentTab() {
      this.$store.dispatch('setCurrentTab', {
        parentUuid: this.windowUuid,
        containerUuid: this.tabUuid
      })
      this.$route.meta.tabUuid = this.tabUuid
    },
    setCurrentTabChild() {
      if (this.$route.query.tabChild === undefined && this.firstIndex) {
        this.currentTabChild = this.firstIndex
      }
    },
    /**
     * @param {object} tabHTML DOM HTML the tab clicked
     */
    handleClick(tabHTML) {
      if (this.tabUuid !== tabHTML.$attrs.tabuuid) {
        this.tabUuid = tabHTML.$attrs.tabuuid
        this.setCurrentTab()
      }
    },
    getData() {
      this.$store.dispatch('getDataListTab', {
        parentUuid: this.windowUuid,
        containerUuid: this.tabUuid
      })
    },
    handleBeforeLeave(activeName) {
      var metadataTab = this.tabsList.find(tab => tab.index === parseInt(activeName))
      if (!this.isEmptyValue(metadataTab.whereClause) && metadataTab.whereClause.includes('@')) {
        metadataTab.whereClause = parseContext({
          parentUuid: metadataTab.parentUuid,
          containerUuid: metadataTab.uuid,
          value: metadataTab.whereClause
        }, true)
      }
    }
  }
}
