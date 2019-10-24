
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
      currentTab: this.$route.query.tabNumber,
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
    setCurrentTab() {
      this.$store.dispatch('setCurrentTab', {
        parentUuid: this.windowUuid,
        containerUuid: this.tabUuid
      })
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
    }
  }
}
