<template>
  <div :class="isMobileClassmenu() + ' container-context-menu'">
    <el-button v-show="device==='mobile' && isReport " icon="el-icon-view" class="Run-Report" circle @click.native="runAction(actions[0])" />
    <el-menu :default-active="activeMenu" :router="false" class="el-menu-demo" mode="horizontal" menu-trigger="hover" unique-opened>
      <el-submenu v-show="device==='mobile' && isReport" class="icon-menu" index="1">
        <template slot="title">
          <el-button v-show="device==='mobile' && isReport " icon="el-icon-document" class="List-Report" circle />
        </template>
        <template v-for="(action) in actions">
          <el-menu-item v-for="(child, key) in action.childs" :key="key" :index="child.uuid" @click="runAction(child)">
            {{ child.name }}
          </el-menu-item>
        </template>
      </el-submenu>
    </el-menu>
    <el-menu :default-active="activeMenu" :router="false" class="el-menu-demo" mode="horizontal" menu-trigger="hover" unique-opened>
      <el-submenu v-if="device==='mobile'" class="el-menu-item" index="1">
        <template slot="title">
          <i class="el-icon-more" />
        </template>
        <el-submenu v-if="relations !== undefined && relations.length > 0" class="el-menu-item" :index="indexMenu() + '1'">
          <template slot="title">
            {{ $t('components.contextMenuRelations') }}
          </template>
          <el-scrollbar wrap-class="scroll">
            <item v-for="(relation, index) in relations" :key="index" :item="relation" />
          </el-scrollbar>
        </el-submenu>
        <el-menu-item v-else disabled :index="indexMenu() + '1'">
          {{ $t('components.contextMenuRelations') }}
        </el-menu-item>
        <el-submenu class="el-menu-item" :index="indexMenu() + '2'">
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
        <el-submenu v-if="relations !== undefined && relations.length > 0" class="el-menu-item" index="1">
          <template slot="title">
            {{ $t('components.contextMenuRelations') }}
          </template>
          <el-scrollbar wrap-class="scroll">
            <item v-for="(relation, index) in relations" :key="index" :item="relation" />
          </el-scrollbar>
        </el-submenu>
        <el-menu-item v-else disabled index="1">
          {{ $t('components.contextMenuRelations') }}
        </el-menu-item>
        <el-submenu v-if="actions !== undefined && actions.length > 0" class="el-menu-item" index="2" @click.native="runAction(actions[0])">
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
        <el-menu-item v-else disabled index="2">
          {{ $t('components.contextMenuActions') }}
        </el-menu-item>
        <el-menu-item index="3" @click="showModal('window', undefined)">
          {{ $t('components.contextMenuReferences') }}
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script>
import ResizeMixin from '@/layout/mixin/ResizeHandler'
import Item from './items'
import { isEmptyValue, showNotification } from '@/utils/ADempiere'

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
    parentUuid: {
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
      metadataMenu: {},
      uuidRecord: this.$route.params.action
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
      if (this.$route.params.menuParentUuid !== undefined) {
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
    generateContextMenu(containerUuid) {
      this.metadataMenu = this.getterContextMenu
      this.actions = this.metadataMenu.actions

      if (this.actions && this.actions.length > 0) {
        this.actions.forEach(itemAction => {
          // if no exists set prop with value
          itemAction.disabled = false
          if (this.$route.name !== 'Report Viewer' && itemAction.action === 'changeParameters') {
            itemAction.disabled = true
          }
          if (this.$route.meta.type === 'report' && itemAction.action === 'startProcess') {
            itemAction.reportExportType = 'html'
            itemAction.disabled = true
          }
          if (this.$route.meta.type === 'process' && itemAction.type === 'summary') {
            itemAction.disabled = true
          }

          if (itemAction.type === 'dataAction') {
            if (this.$route.params.action === 'create-new' && (itemAction.action === 'deleteEntity' || itemAction.action === 'resetPanelToNew')) {
              itemAction.disabled = true
            }
          }
        })
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
        if (processData === undefined) {
          this.$store.dispatch('getProcessFromServer', action.uuid)
            .then(response => {
              this.$store.dispatch('setShowDialog', { type: type, action: response })
            }).catch(error => {
              console.warn('ContextMenu: Dictionary Process (State) - Error ' + error.code + ': ' + error.message)
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
        var isReadyForSubmit = this.$store.getters.isReadyForSubmit(this.$route.meta.uuid)
        if (isReadyForSubmit) {
          var containerParams = this.$route.meta.uuid
          if (this.lastParameter !== undefined) {
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
                    if (this.$route.params !== undefined) {
                      if (this.$route.params.menuParentUuid !== undefined) {
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
                          processId: action.payload.processId,
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
          var emptyField = this.$store.getters.getEmptyMandatory(this.$route.meta.uuid)
          this.showNotification({
            type: 'warning',
            title: this.$t('notifications.emptyValues'),
            name: '<b>' + emptyField.name + '.</b> ',
            message: this.$t('notifications.fieldMandatory')
          })
        }
      } else if (action.type === 'process') {
        this.showModal(action.type, action)
      } else if (action.type === 'dataAction') {
        if (action.action === 'resetPanelToNew') {
          this.$router.push({
            name: this.$route.name,
            params: { action: 'create-new' }
          })
        }
        this.$store.dispatch(action.action, {
          containerUuid: this.containerUuid,
          parentUuid: this.parentUuid
        })
      }
    }
  }
}
</script>

<style>
  .Run-Report {
    position: absolute;
    right: 102%;
    border: 0;
  }
  .icon-menu {
    position: absolute;
    right: 140%;
    margin-top: -38%;
  }
  .List-Report {
    border: 0;
    background: transparent;
  }
  .container-context-menu {
    z-index: 1;
  }

  .container-submenu-mobile {
    position: absolute;
    height: 39px !important;
    width: 39px !important;
    right: 10px;
    top: 0;
  }

  .container-submenu {
    position: absolute;
    height: 39px !important;
    right: 0;
    top: -1px;
  }

  ul.el-menu-demo > .el-menu-item {
    height: 39px !important;
    line-height: 39px !important;
    padding: 0 10px;
  }

  .el-menu-demo > .el-menu-item > .el-submenu__title {
    line-height: 39px;
    height: 39px !important;
    padding: 0;
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

  .el-menu--popup-right-start > .el-menu-item {
    min-width: 150px;
  }

  .scroll {
    max-height: 400px;
  }

  .el-icon-more {
    transform: rotate(90deg);
  }
</style>
