<template>
  <div>
    <div class="components-container">
      <split-pane split="vertical" :min-percent="20" :default-percent="30" @resize="resize">
        <template slot="paneL">
          <div class="left">
            <el-button type="text" @click="mostrar()">mostrar window</el-button>
            <el-table :data="tableData">
              <el-table-column
                prop="date"
                label="Date"
                width="140"
              />
              <el-table-column
                prop="name"
                label="Name"
                width="120"
              />
              <el-table-column
                prop="address"
                label="Address"
              />
            </el-table>
          </div>
        </template>
        <template slot="paneR">
          <div v-show="table" class="pane" :style="{ width: '100%', maxWidth: '100%' }">
            <el-tabs v-model="currentTab" type="border-card" @tab-click="handleClick">
              <el-button type="text" @click="mostrar()">ocultar window</el-button>
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
                  <div class="pestaña">
                    <panel
                      :parent-uuid="windowUuid"
                      :container-uuid="item.uuid"
                      :metadata="item"
                      :table-name="item.tableName"
                      :group="item.tabGroup"
                      :is-edit="true"
                      :panel-type="panelType"
                    />
                  </div>
                </el-tab-pane>
              </template>
            </el-tabs>
          </div>
        </template>
      </split-pane>
    </div>
  </div>
</template>

<script>
import Panel from '@/components/ADempiere/Panel'
import splitPane from 'vue-splitpane'

export default {
  name: 'TabParent',
  components: {
    Panel,
    splitPane
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
    const item = {
      date: '2016-05-02',
      name: 'Tom',
      address: 'No. 189, Grove St, Los Angeles'
    }
    return {
      isLoading: false,
      currentTab: this.$route.params.tabNumber,
      uuidRecord: this.$route.params.uuidRecord,
      tabUuid: '',
      table: false,
      panelType: 'window',
      tableData: Array(20).fill(item)
    }
  },
  computed: {
    getisSingleRow() {
      return this.$store.getters.getPanel(this.containerUuid)
    },
    getterPanel() {
      return this.$store.getters.getPanel(this.containerUuid)
    }
  },
  created() {
    if (this.tabsList.length >= 0) {
      this.tabUuid = this.tabsList[0].uuid
    }
    console.log(this.$store.getters.getPanel(this.containerUuid))
  },
  methods: {
    setCurrentTab() {
      this.$store.dispatch('setCurrentTab', {
        parentUuid: this.windowUuid,
        containerUuid: this.tabUuid
      })
    },
    resize() {
      console.log('resize')
    },
    mostrar() {
      this.table = !this.table
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
    }
  }
}
</script>
<style>
  .el-container {
    margin-bottom: 40px;
    margin-top: 20px;
    height: auto;
  }
  .left {
    height: 400px;
  }
  .pestaña {
    overflow: auto;
    position: relative;
    padding-bottom: 20px;
    height: -webkit-fill-available;
  }
  .el-aside {
    width: 50% !important;
    background: #fff;
    padding: 0px;
    padding-left: 10px;
    margin-bottom: 0px;
  }
  .el-main {
    display: block;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    margin-right: 11px;
    -ms-flex-preferred-size: auto;
    /* flex-basis: auto; */
    overflow: auto;
    /* -webkit-box-sizing: border-box; */
    /* box-sizing: border-box; */
    /* padding: 20px; */
  }
  .components-container {
    position: relative;
    height: 100vh;
    margin-top: 30px;
    margin-right: 10px;
    margin-bottom: 30px;
    margin-left: 10px;
  }

  .left-container {
    background-color: #F38181;
    height: 100%;
  }

  .right-container {
    background-color: #FCE38A;
    height: 200px;
  }

  .top-container {
    background-color: #FCE38A;
    width: 100%;
    height: 100%;
  }

  .bottom-container {
    width: 100%;
    background-color: #95E1D3;
    height: 100%;
  }
</style>
<style>
.vertical-panes {
  width: 100%;
  height: 400px;
  border: 1px solid #ccc;
}
.vertical-panes > .pane {
  text-align: left;
  padding: 15px;
  overflow: hidden;
  background: #eee;
}
.vertical-panes > .pane ~ .pane {
  border-left: 1px solid #ccc;
}
</style>
