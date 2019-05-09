<template>
  <div>
    <div v-if="loading">
      <el-row :gutter="20">
        <router-view />
        <tab
          :window-uuid="windowUuid"
          :tabs-list="windowMetadata.tabsListParent"
          :parent-tabs="true"
          :is-edit="isEdit"
        />
        <sticky class="sticky-submenu">
          <submenu />
        </sticky>
        <modal
          :visible="visibleDialog"
          :metadata="processMetadata"
          :parent-uuid="windowUuid"
          @closeDialog="visibleDialog=false"
        />
        <el-row v-if="typeof windowMetadata.tabsListChildren != 'undefined' && windowMetadata.tabsListChildren.length > 0" :gutter="12">
          <el-col :span="6">
            <div class="container">
              <div v-if="this.$store.state.app.device!=='mobile'" class="show">
                <el-button
                  v-if="!showPanel"
                  :circle="true"
                  class="el-icon-arrow-up button1"
                  @click="showPanel = !showPanel"
                />
              </div>
              <div v-else>
                <el-button
                  v-if="!showPanel"
                  :circle="true"
                  class="el-icon-arrow-up button1"
                  @click="showPanel = !showPanel"
                />
              </div>
            </div>
            <div>
              <el-collapse-transition class="paneltab">
                <div v-show="showPanel">
                  <div v-if="this.$store.state.app.sidebar.opened">
                    <div class="container2">
                      <div class="show2">
                        <el-button
                          v-if="show3"
                          :circle="true"
                          class="el-icon-arrow-down button2"
                          @click="showPanel = !showPanel"
                        />
                      </div>
                      <el-tabs type="border-card" class="transi-box">
                        <template v-for="(item, key) in windowMetadata.tabsListChildren">
                          <el-tab-pane
                            :key="key"
                            :label="item.name"
                            :lazy="true"
                            class="el-tabs__nav-scroll"
                          >
                            <data-table
                              :parent-uuid="windowMetadata.uuid"
                              :container-uuid="item.uuid"
                              :metadata="item"
                              :position-tab="key"
                              :table-name="item.tableName"
                              :group="item.tabGroup"
                              :parent="true"
                              :searchable="false"
                            />
                          </el-tab-pane>
                        </template>
                      </el-tabs>
                    </div>
                  </div>
                  <div v-else-if="!this.$store.state.app.sidebar.opened">
                    <div class="container2">
                      <div v-if="this.$store.state.app.device!=='mobile'" class="show2">
                        <el-button
                          v-if="show3"
                          :circle="true"
                          class="el-icon-arrow-down button2"
                          @click="showPanel = !showPanel"
                        />
                      </div>
                      <div v-else>
                        <el-button
                          v-if="show3"
                          :circle="true"
                          class="el-icon-arrow-down button2"
                          @click="showPanel = !showPanel"
                        />
                      </div>
                      <el-tabs type="border-card" class="transi-box2">
                        <template v-for="(item, key) in windowMetadata.tabsListChildren">
                          <el-tab-pane
                            :key="key"
                            :label="item.name"
                            :lazy="true"
                            class="el-tabs__nav-scroll"
                          >
                            <data-table
                              :parent-uuid="windowMetadata.uuid"
                              :container-uuid="item.uuid"
                              :metadata="item"
                              :position-tab="key"
                              :table-name="item.tableName"
                              :group="item.tabGroup"
                              :parent="false"
                              :searchable="false"
                            />
                          </el-tab-pane>
                        </template>
                      </el-tabs>
                    </div>
                  </div>
                </div>
              </el-collapse-transition>
            </div>
          </el-col>
        </el-row>
      </el-row>
    </div>
    <div v-else style="padding: 20px 100px">
      <h3>
        Loading Window...
      </h3>
    </div>
  </div>
</template>

<script>
import Tab from '@/components/ADempiere/Tab'
import DataTable from '@/components/ADempiere/DataTable'
// When supporting the processes, smart browser and reports,
// the submenu and sticky must be placed in the layout
import Submenu from '@/components/ADempiere/ContextMenu'
import Sticky from '@/components/Sticky'
import Modal from '@/components/ADempiere/Dialog'

export default {
  name: 'Window',
  components: {
    Tab,
    Submenu,
    DataTable,
    Sticky,
    Modal
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      windowMetadata: {},
      windowUuid: this.$route.meta.uuid,
      loading: false,
      showPanel: true,
      uuidRecord: this.$route.params.uuidRecord,
      show3: true,
      visibleDialog: this.$store.state.processControl.visibleDialog,
      processMetadata: {},
      isMobile: true
    }
  },
  computed: {
    /**
     * DETERMINATE USED
     */
    getTabList() {
      return this.$store.getters.getTabsList(this.windowUuid)
    }
  },
  beforeCreate() {
    if (this.$store.state.app.device === 'mobile') {
      this.isMobile = !this.isMobile
    }
    this.$store.subscribe(mutation => {
      if (mutation.type === 'setShowDialog') {
        if (typeof mutation.payload !== 'undefined') {
          this.visibleDialog = true
          this.processMetadata = mutation.payload
        }
      }
    })
  },
  beforeMount() {
    this.getWindow(this.windowUuid)
  },
  methods: {
    getWindow(uuid = null) {
      if (!uuid) {
        uuid = this.windowUuid
      }
      var window = this.$store.getters.getWindow(uuid)
      if (typeof window === 'undefined') {
        this.$store.dispatch('getWindowFromServer', uuid)
          .then(response => {
            this.windowMetadata = response
            this.loading = true
          })
          .catch(err => {
            this.loading = true
            console.warn('Dictionary Window - Error ' + err.code + ': ' + err.message)
          })
      } else {
        this.loading = true
        this.windowMetadata = window
      }
    },
    openDialog(process) {
      this.$store.subscribe(mutation => {
        if (mutation.type === 'setShowDialog') {
          this.visibleDialog = mutation.payload
          this.processMetadata = process
        }
      })
    }
  }
}
</script>

<style scoped >
  .paneltab {
    border: 1px solid blue;
  }

  .container {
    bottom: 0;
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
    transition: all 0.5s ease-in;
    display: flex;
  }

  .buttonp {
    visibility: hidden;
    transition: all .5s ease-in;
  }

  .container2 {
    bottom: 0;
    height: 135px;
    width: 100%;
    position: fixed;
    position: fixed;
    display: flex;
    color: #424242;
  }

  .container2:hover .show2 {
    visibility: visible;
  }

  .container2:hover .buttonp2 {
    visibility: visible;
  }
  .container2:hover .transi-box2 {
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
  .avatar {
    width: 54px;
    height: 28px;
}
.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 134px;
    height: 5px;
    line-height: 57px;
}

  .buttonp2 {
    visibility: visible;
    transition: all .5s ease-in;
  }

  .button1 {
   width: 40px;
   bottom: 0;
   right: 50%;
   position: fixed;
   background: #ffffff;
   color: #606266;
   -webkit-appearance: none;
   text-align: center;
   outline: 0;
   font-size: 14px;
 }
  .button2 {
    width: 37px;
    bottom: 39%;
    z-index: 2;
    right: 50%;
    position: fixed;
    background: #ffffff;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    outline: 0;
    font-size: 14px;
  }

  .transi-box {
    bottom: 0;
    width: calc(100% - 170px);
    position: fixed;
    border-radius: 4px;
    background-color: #FFF;
    text-align: center;
    color: #FFF;
    box-sizing: border-box;
    height: 39%;
  }

  .transi-box2 {
    margin-bottom: 0px;
    width: calc(100% + 10px);
    position: fixed;
    bottom: 0;
    border-radius: 4px;
    background-color: #FFF;
    text-align: center;
    color: #FFF;
    height: 39%;

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

  .sticky-submenu {
    position: absolute !important;
    right: 10px;
    top: 0;
  }
</style>
