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
        <panel
          :parent-uuid="windowUuid"
          :container-uuid="item.uuid"
          :metadata="item"
          :table-name="item.tableName"
          :group="item.tabGroup"
          :is-edit="isEdit"
          :panel-type="panelType"
        />
      </el-tab-pane>
    </template>
  </el-tabs>
</template>

<script>
import Panel from '@/components/ADempiere/Panel'

export default {
  name: 'Tab',
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
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tableName: [],
      loading: false,
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
  },
  methods: {
    reloadContextMenu() {
      this.$store.dispatch('reloadContextMenu', {
        containerUuid: this.tabUuid
      })
    },
    /**
     * @param {object} tabHTML DOM HTML the tab clicked
     */
    handleClick(tabHTML) {
      if (this.tabUuid !== tabHTML.$attrs.tabuuid) {
        this.tabUuid = tabHTML.$attrs.tabuuid
        this.reloadContextMenu()
      }
      // this.setPemantLink(tabHTML)
    },
    setPemantLink(tabHTML) {
      this.$route.params.tabNumber = tabHTML.name
      this.currentTab = this.$route.params.tabNumber
      /* this.$router.replace({
        params: { tabNumber: tabHTML.name }
      })*/
      this.$router.push({ name: this.$route.name, params: { tabNumber: tabHTML.name }})
    }
  }
}
</script>

<style scoped >
  .paneltab {
    border: 1px solid blue;
  }

  .container {
    top: 590px;
    z-index: 0;
    position: fixed;
    width: 100%;
    height: 10%;
    display: flex;
    color: #424242;
  }

  .container:hover .show {
    visibility: visible;
    height: 80px;
  }

  .container:hover button {
    visibility: visible;
  }

  .show {
    visibility: hidden;
    position: absolute;
    bottom: 0;
    color: #FFF;
    width: 100%;
    height: 0px;
    transition: all 0.5s ease-in;
    display: flex;
  }

  .buttonp {
    visibility: hidden;
    transition: all .5s ease-in;
  }

  .container2 {
    bottom: 0;
    height: 200px;
    width: 87%;
    position: fixed;
    height: 200px;
    z-index: 5;
    position: fixed;
    display: flex;
    left: 13%;
    color: #424242;
  }

  .container2:hover .show2 {
    visibility: visible;
    height: 80px;
  }

  .container2:hover .buttonp2 {
    visibility: visible;
  }

  .show2 {
    visibility: hidden;
    position: absolute;
    bottom: 0;
    color: #FFF;
    width: 100%;
    height: 0px;
    transition: all 0.5s ease-in;
    display: flex;
  }

  .buttonp2 {
    visibility: hidden;
    transition: all .5s ease-in;
  }

  .button1 {
    width: 40px;
    top: 590px;
    right: 600px;
    position: fixed;
    background: #ffffff;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    outline: 0;
    font-size: 14px;
  }

  .button2 {
    width: 40px;
    top: 395px;
    z-index: 2;
    right: 600px;
    position: fixed;
    background: #ffffff;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    outline: 0;
    font-size: 14px;
  }

  .transi-box {
    margin-bottom: 0px;
    bottom: 0;
    width: 87%;
    position: fixed;
    height: 200px;
    border-radius: 4px;
    background-color: #fFF;
    text-align: center;
    color: #fff;
    box-sizing: border-box;
    margin-right: 2px;
  }

  .transi-box2 {
    margin-bottom: 0px;
    width: 97%;
    position: fixed;
    bottom: 0;
    height: 200px;
    border-radius: 4px;
    background-color: #fFF;
    text-align: center;
    color: #fff;
    box-sizing: border-box;
    margin-right: 2px;
  }

  .el-row {
    margin-bottom: 20px;
  }

  .el-col {
    border-radius: 4px;
    left: 150px;
  }
</style>
