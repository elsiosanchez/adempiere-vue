<template>
  <div :class="isMobileClassmenu + ' container-context-menu'">
    <right-menu v-if="isMobile">
      <el-menu :default-active="activeMenu" :router="false" class="el-menu-demo" mode="vertical" menu-trigger="hover" unique-opened style="width: 258px; float: right;">
        <el-submenu index="1">
          <template slot="title">
            <svg-icon icon-class="tree-table" /> {{ $t('components.contextMenuRelations') }}
          </template>
          <el-menu-item-group>
            <el-scrollbar wrap-class="scroll">
              <item v-for="(relation, index) in relations" :key="index" :item="relation" />
            </el-scrollbar>
          </el-menu-item-group>
        </el-submenu>
        <el-submenu index="2">
          <template slot="title">
            <svg-icon icon-class="link" />{{ $t('components.contextMenuActions') }}
          </template>
          <el-menu-item-group>
            <el-scrollbar wrap-class="scroll">
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
            </el-scrollbar>
          </el-menu-item-group>
        </el-submenu>
        <el-menu-item index="3" disabled>
          <i class="el-icon-document" />{{ $t('components.contextMenuReferences') }}
        </el-menu-item>
      </el-menu>
    </right-menu>
    <el-menu :default-active="activeMenu" :router="false" class="el-menu-demo" mode="horizontal" menu-trigger="hover" unique-opened>
      <template v-if="isMobile" class="container-submenu" />
      <template v-else>
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
        <el-menu-item index="3" :disabled="!(isReferecesContent && references.length > 0)">
          {{ $t('components.contextMenuReferences') }}
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script>
import ResizeMixin from '@/layout/mixin/ResizeHandler'
import Item from './items'
import RightMenu from '@/components/RightPanel/menu'
import { isEmptyValue, showNotification } from '@/utils/ADempiere'

export default {
  name: 'ContextMenu',
  components: {
    Item,
    RightMenu
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
    panelType: {
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
    },
    // used only window
    isInsertRecord: {
      type: Boolean,
      default: undefined
    }
  },
  data() {
    return {
      actions: [],
      references: [],
      file: this.$store.getters.getProcessResult.download,
      downloads: this.$store.getters.getProcessResult.url,
      metadataMenu: {},
      recordUuid: this.$route.query.action
    }
  },
  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    isMobileClassmenu() {
      const cssClass = 'container-submenu'
      if (this.isMobile) {
        return cssClass + '-mobile'
      }
      return cssClass
    },
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
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.isMobile
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
    },
    isReferecesContent() {
      if (this.panelType === 'window' && !isEmptyValue(this.recordUuid) && this.recordUuid !== 'create-new') {
        return true
      }
      return false
    },
    getterReferences() {
      if (this.isReferecesContent) {
        return this.$store.getters.getReferencesList(this.parentUuid, this.recordUuid)
      }
      return []
    }
  },
  watch: {
    '$route.query.action'(actionValue) {
      this.recordUuid = actionValue
      // only requires updating the context menu if it is Window
      if (this.panelType === 'window') {
        this.generateContextMenu()
        this.getReferences()
      }
    },
    isInsertRecord(newValue, oldValue) {
      if (this.panelType === 'window' && newValue !== oldValue) {
        this.generateContextMenu()
      }
    }
  },
  created() {
    this.generateContextMenu()
  },
  mounted() {
    this.getReferences()
  },
  methods: {
    isEmptyValue,
    showNotification,
    getReferences() {
      if (this.isReferecesContent) {
        var references = this.getterReferences
        if (references && references.length > 0) {
          this.references = references
        } else {
          this.$store.dispatch('getReferencesListFromServer', {
            parentUuid: this.parentUuid,
            containerUuid: this.containerUuid,
            recordUuid: this.recordUuid
          })
            .then(response => {
              this.references = response
            })
            .catch(error => {
              console.warn('References Load Error ' + error.code + ': ' + error.message)
            })
        }
      } else {
        this.references = []
      }
    },
    generateContextMenu() {
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
          }
          if (this.$route.meta.type === 'process' && itemAction.type === 'summary') {
            itemAction.disabled = true
          }

          if (this.$route.meta.type === 'window') {
            if (this.recordUuid === 'create-new') {
              itemAction.disabled = true
            } else {
              if (this.isInsertRecord) {
                itemAction.disabled = false
              } else {
                itemAction.disabled = true
              }
            }
          }
        })
      }
    },
    showModal(action) {
      // TODO: Refactor and remove redundant dispatchs
      if (action.type === 'process') {
        var processData = this.$store.getters.getProcess(action.uuid)
        if (processData === undefined) {
          this.$store.dispatch('getProcessFromServer', action.uuid)
            .then(response => {
              this.$store.dispatch('setShowDialog', {
                type: action.type,
                action: response
              })
            }).catch(error => {
              console.warn('ContextMenu: Dictionary Process (State) - Error ' + error.code + ': ' + error.message)
            })
        } else {
          this.$store.dispatch('setShowDialog', { type: action.type, action: processData })
        }
      } else {
        this.$store.dispatch('setShowDialog', { type: action.type, action: this.modalMetadata })
      }
    },
    runAction(action) {
      if (action.type === 'action') {
        // run process or report
        const fieldNotReady = this.$store.getters.isNotReadyForSubmit(this.$route.meta.uuid)
        if (!fieldNotReady) {
          var containerParams = this.$route.meta.uuid
          if (this.lastParameter !== undefined) {
            containerParams = this.lastParameter
          }

          var parentMenu = this.menuParentUuid
          if (this.$route.params) {
            if (this.$route.params.menuParentUuid) {
              parentMenu = this.$route.params.menuParentUuid
            }
          }
          this.$store.dispatch(action.action, {
            action: action,
            parentUuid: this.containerUuid,
            containerUuid: containerParams, // EVALUATE IF IS action.uuid
            panelType: this.panelType, // determinate if get table name and record id (window) or selection (browser)
            reportFormat: this.reportFormat,
            menuParentUuid: parentMenu // to load relations in context menu (report view)
          })
            .catch(error => {
              console.warn(error)
            })
        } else {
          this.showNotification({
            type: 'warning',
            title: this.$t('notifications.emptyValues'),
            name: '<b>' + fieldNotReady.name + '.</b> ',
            message: this.$t('notifications.fieldMandatory')
          })
        }
      } else if (action.type === 'process') {
        // run process associate with view (window or browser)
        this.showModal(action)
      } else if (action.type === 'dataAction') {
        this.$store.dispatch(action.action, {
          containerUuid: this.containerUuid,
          parentUuid: this.parentUuid
        })
      }
    }
  }
}
</script>

<style scoped>
  .el-submenu .el-menu-item {
    height: 50px;
    line-height: 50px;
    padding-left: 27px !important;
    padding: 0 45px;
    min-width: 200px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
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
    right: 0;
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
