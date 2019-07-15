<template>
  <div :class="isMobileClassmenu() + ' container-context-menu'">
    <el-menu :default-active="activeMenu" :router="false" class="context-menu" mode="horizontal" menu-trigger="hover" unique-opened>
      <el-submenu v-if="device==='mobile'" class="menu-item sub-menu-mobile" index="1">
        <template slot="title">
          <i class="el-icon-more" />
        </template>
        <el-submenu :disabled="relations === undefined || relations.length < 1" class="menu-item" :index="indexMenu() + '1'">
          <template slot="title">
            {{ $t('components.contextMenuRelations') }}
          </template>
          <el-scrollbar wrap-class="scroll">
            <item v-for="(relation, index) in relations" :key="index" :item="relation" />
          </el-scrollbar>
        </el-submenu>
        <el-submenu :disabled="actions === undefined && actions.length > 0" class="menu-item" index="2">
          <template slot="title">
            {{ $t('components.contextMenuActions') }}
          </template>
          <template v-for="(action, index) in actions">
            <el-submenu v-if="action.childs" :key="index" :index="action.name" :disabled="action.disabled">
              <template slot="title">
                {{ action.name }}
              </template>
              <el-menu-item v-for="(child, key) in action.childs" :key="key" :index="child.uuid" @click="runAction(child)">
                {{ child.name }}
              </el-menu-item>
            </el-submenu>
            <el-menu-item v-else :key="index" :index="action.name" :disabled="action.disabled" @click="runAction(action)">
              {{ action.name }}
            </el-menu-item>
          </template>
          <el-menu-item v-show="isReport" index="4">
            <a :href="downloads" :download="file">
              {{ $t('components.contextMenuDownload') }}
            </a>
          </el-menu-item>
        </el-submenu>
        <el-menu-item :index="indexMenu() + '3'">
          {{ $t('components.contextMenuReferences') }}
        </el-menu-item>
      </el-submenu>
      <template v-else class="container-submenu">
        <el-submenu :disabled="relations == undefined && relations.length < 1" class="menu-item" index="1">
          <template slot="title">
            {{ $t('components.contextMenuRelations') }}
          </template>
          <el-scrollbar wrap-class="scroll">
            <item v-for="(relation, index) in relations" :key="index" :item="relation" />
          </el-scrollbar>
        </el-submenu>
        <el-submenu :disabled="actions == undefined && actions.length < 1" class="menu-item" index="2" @click.native="runAction(actions[0])">
          <template slot="title">
            {{ $t('components.contextMenuActions') }}
          </template>
          <template v-for="(action, index) in actions">
            <el-submenu v-if="action.childs" :key="index" :index="action.name" :disabled="action.disabled">
              <template slot="title">
                {{ action.name }}
              </template>
              <el-menu-item v-for="(child, key) in action.childs" :key="key" :index="child.uuid" @click="runAction(child)">
                {{ child.name }}
              </el-menu-item>
            </el-submenu>
            <el-menu-item v-else :key="index" :index="action.name" :disabled="action.disabled" @click="runAction(action)">
              {{ action.name }}
            </el-menu-item>
          </template>
          <el-menu-item v-show="isReport" index="4">
            <a :href="downloads" :download="file">
              {{ $t('components.contextMenuDownload') }}
            </a>
          </el-menu-item>
        </el-submenu>
        <el-menu-item class="menu-item" index="3" @click="showModal('search', undefined)">
          {{ $t('components.contextMenuReferences') }}
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script>
import ResizeMixin from '@/layout/mixin/ResizeHandler'
import Item from './items'
import { isEmptyValue } from '@/utils/ADempiere/valueUtil.js'
import { showNotification } from '@/utils/ADempiere/notification.js'

export default {
  name: 'ContextMenu',
  components: {
    Item
  },
  mixins: [ResizeMixin],
  props: {
    menuParentUuid: {
      type: String,
      default: undefined
    },
    // uuid of the component where it is called
    containerUuid: {
      type: String,
      required: true
    },
    parentPanel: {
      type: String,
      default: undefined
    },
    isReport: {
      type: Boolean,
      default: false
    },
    lastParameter: {
      type: String,
      default: undefined
    },
    reportFormat: {
      type: String,
      default: undefined
    },
    modalMetadata: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      actions: [],
      references: [],
      file: this.$store.getters.getProcessResult.download,
      downloads: this.$store.getters.getProcessResult.url,
      metadataMenu: {}
    }
  },
  computed: {
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    },
    relations() {
      if (typeof this.$route.params.menuParentUuid !== 'undefined') {
        return this.$store.getters.getRelations(this.$route.params.menuParentUuid)
      }
      return this.$store.getters.getRelations(this.menuParentUuid)
    },
    getterContextMenu() {
      return this.$store.getters.getContextMenu(this.containerUuid)
    }
  },
  created() {
    this.generateContextMenu(this.containerUuid)
  },
  methods: {
    isEmptyValue,
    showNotification,
    classContextMenu() {
      if (this.$store.state.app.device === 'mobile') {
        return 'el-menu-item'
      } else if (this.$store.state.app.sidebar.opened) {
        return 'container-submenu'
      }
      return 'menu-table'
    },
    generateContextMenu(containerUuid) {
      this.metadataMenu = this.getterContextMenu
      this.actions = this.metadataMenu.actions

      if (typeof this.actions !== 'undefined') {
        this.actions.forEach((item) => {
          item['disabled'] = false
        })
        if (this.$route.name !== 'Report Viewer') {
          var index = this.actions.findIndex(item => item.action === 'changeParameters')
          if (index !== -1) {
            this.actions[index].disabled = true
          }
        }
        if (this.$route.meta.type === 'report') {
          index = this.actions.findIndex(item => item.action === 'startProcess')
          if (index !== -1) {
            this.actions[index].reportExportType = 'html'
            this.actions[index].disabled = true
          }
        }
        if (this.$route.meta.type === 'process') {
          index = this.actions.findIndex(item => item.type === 'summary')
          if (index !== -1) {
            this.actions[index].disabled = true
          }
        }
      }
    },
    isMobileClassmenu() {
      const cssClass = 'container-submenu'
      if (this.device === 'mobile') {
        return cssClass + '-mobile'
      }
      return cssClass
    },
    indexMenu(index = '') {
      if (this.device === 'mobile') {
        return index + '1-'
      }
      return index
    },
    showModal(type, action) {
      if (type === 'process') {
        var processData = this.$store.getters.getProcess(action.uuid)
        if (typeof processData === 'undefined') {
          this.$store.dispatch('getProcessFromServer', action.uuid)
            .then(response => {
              this.$store.dispatch('setShowDialog', { type: type, action: response })
            }).catch(err => {
              console.warn('ContextMenu: Dictionary Process (State) - Error ' + err.code + ': ' + err.message)
            })
        } else {
          this.$store.dispatch('setShowDialog', { type: type, action: processData })
        }
      } else {
        this.$store.dispatch('setShowDialog', { type: type, action: this.modalMetadata })
      }
    },
    runAction(action) {
      if (action.type === 'action') {
        var finalParameters = this.$store.getters.getParamsProcessToServer(this.$route.meta.uuid)
        if ((finalParameters.fieldsMandatory.length > 0 &&
          finalParameters.params.length >= finalParameters.fieldsMandatory.length) ||
          finalParameters.fieldsMandatory.length === 0) {
          var containerParams = this.$route.meta.uuid
          if (typeof this.lastParameter !== 'undefined') {
            containerParams = this.lastParameter
          }
          this.$store.dispatch(action.action, {
            action: action,
            containerUuid: containerParams, // EVALUATE IF IS action.uuid
            parentUuid: this.containerUuid,
            parentPanel: this.parentPanel,
            processName: action.processName,
            reportFormat: this.reportFormat
          })
          if (action.isReport) {
            this.$store.subscribeAction({
              after: (action, state) => {
                if (action.type === 'finishProcess') {
                  if (!action.payload.isError) {
                    var parentMenu = this.menuParentUuid
                    if (typeof this.$route.params !== 'undefined') {
                      if (typeof this.$route.params.menuParentUuid !== 'undefined') {
                        parentMenu = this.$route.params.menuParentUuid
                      }
                    }
                    if (!action.payload.isReport) {
                      this.$store.dispatch('tagsView/delView', this.$route)
                        .then(({ visitedViews }) => {
                          this.$router.push('/dashboard')
                        })
                    } else {
                      this.$router.push({
                        name: 'Report Viewer',
                        params: {
                          menuParentUuid: parentMenu,
                          processUuid: action.payload.processUuid,
                          instanceUuid: action.payload.instanceUuid,
                          fileName: action.payload.output.fileName
                        }
                      })
                      this.$store.dispatch('tagsView/delView', this.$route)
                    }
                  }
                }
              }
            })
          }
          if (this.report === true) {
            return true
          }
          return false
        } else {
          var emptyField = finalParameters.fieldsMandatory.find(filed => {
            if (this.isEmptyValue(filed.value)) {
              return true
            }
          })
          this.showNotification({
            type: 'warning',
            title: this.$t('notifications.emptyValues'),
            name: '<b>' + emptyField.name + '.</b> ',
            message: this.$t('notifications.fieldMandatory')
          })
        }
      } else if (action.type === 'process') {
        this.showModal(action.type, action)
      }
    }
  }
}
</script>

<style scoped>
  .container-context-menu {
    z-index: 1;
  }

  .container-submenu-mobile {
    position: absolute;
    height: 40px !important;
    width: 40px !important;
    right: 0px;
    top: 0;
  }

  .container-submenu {
    position: absolute;
    height: 40px !important;
    right: 10px;
    top: 0;
  }

  ul.context-menu > .menu-item {
    height: 40px !important;
    line-height: 40px !important;
    padding: 0 10px;
  }

  .context-menu > .menu-item > .el-submenu__title {
    height: 40px !important;
    padding: 0;
    max-height: 40px;
    line-height: 40px;
  }

  .sub-menu-mobile {
    max-height: 40px !important;
    line-height: 40px !important;
  }

  .sub-menu-mobile > .el-submenu__title {
    height: 40px !important;
    padding: 0;
    cursor: help;
    max-height: 40px !important;
    line-height: 40px !important;
  }

  .el-menu--horizontal .el-submenu > .el-menu--horizontal {
    left: initial !important;
    right: 150px;
  }

  .el-menu--popup-bottom-start {
    min-width: 150px !important;
  }

  .el-menu--popup-right-start{
    min-width: 150px !important;
  }

  .el-menu--popup-right-start > .menu-item {
    min-width: 150px;
  }

  .scroll {
    max-height: 400px;
  }

  .el-icon-more {
    transform: rotate(90deg);
  }
  .context-menu {
    max-height: 40px;
  }
</style>

<style>
  .context-menu > .menu-item > .el-submenu__title {
    padding: 0;
    height: 40px !important;
    max-height: 40px;
    line-height: 40px;
  }
</style>
