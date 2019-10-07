
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
    /**
     * @param {object} tabHTML DOM HTML the tab clicked
     */
    handleClick(tabHTML) {
      if (this.tabUuid !== tabHTML.$attrs.tabuuid) {
        this.tabUuid = tabHTML.$attrs.tabuuid
        this.setCurrentTab()
      }
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
          action: this.$route.query.action,
          tabNumber: tabHTML.name
        }
      })
    }
  }
}
