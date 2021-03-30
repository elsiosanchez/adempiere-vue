<template>
  <div v-if="!isListRecord" class="container-submenu-mobile container-context-menu">
    <!-- actions or process on container -->
    <el-dropdown size="mini" split-button @command="clickRunAction">
      {{ defaultActionName }}
      <el-dropdown-menu slot="dropdown">
        <el-scrollbar wrap-class="scroll" style="max-height: 250px;max-width: 200px;">
          <el-dropdown-item
            v-for="(action, index) in actions"
            :key="index"
            :command="action"
            :divided="true"
          >
            <span style="display: inline-flex;margin-top: 2%;margin-bottom: 2%;">
              <i :class="iconAction(action)" />
              <b :style="styleLabelAction(action.type === 'dataAction')">
                {{ action.name }}
              </b>
            </span>

          </el-dropdown-item>
        </el-scrollbar>
      </el-dropdown-menu>
    </el-dropdown>
    <!-- menu relations -->
    <el-dropdown size="mini" @command="clickRelation">
      <el-button size="mini">
        {{ $t('components.contextMenuRelations') }} <i class="el-icon-arrow-down el-icon--right" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-scrollbar wrap-class="scroll" style="max-height: 200px;max-width: 220px;">
          <el-dropdown-item
            v-for="(relation, index) in relationsList"
            :key="index"
            :command="relation"
            :divided="true"
          >
            <div class="contents">
              <div style="margin-right: 5%;margin-top: 10%;">
                <svg-icon :icon-class="relation.meta.icon" />
              </div>
              <div>
                <span class="contents">
                  <b class="label">
                    {{ relation.meta.title }}
                  </b>
                </span>
                <p
                  class="description"
                >
                  {{ relation.meta.description }}
                </p>
              </div>
            </div>
          </el-dropdown-item>
        </el-scrollbar>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dropdown size="mini" @command="clickReferences">
      <el-button size="mini" :disabled="!(isReferecesContent && isLoadedReferences)">
        {{ $t('components.contextMenuReferences') }} <i class="el-icon-arrow-down el-icon--right" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-scrollbar wrap-class="scroll" style="max-height: 200px;max-width: 220px;">
          <el-dropdown-item
            v-for="(reference, index) in references.referencesList"
            :key="index"
            :command="reference"
            :divided="true"
          >
            <div class="contents">
              <div>
                <span class="contents">
                  <b class="label">
                    {{ reference.displayName }}
                  </b>
                </span>
                <p
                  class="description"
                >
                  {{ reference.whereClause }}
                </p>
              </div>
            </div>
          </el-dropdown-item>
        </el-scrollbar>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import contextMixin from './contextMenuMixin.js'

export default {
  name: 'ContextMenuMobile',
  mixins: [
    contextMixin
  ],
  data() {
    return {
      openedsMenu: [
        'actions'
      ]
    }
  },
  computed: {
    isPanelTypeMobile() {
      if (['process', 'report'].includes(this.$route.meta.type)) {
        return true
      }
      return false
    },
    isUndoAction() {
      if (this.isWindow) {
        if (!this.isWithRecord) {
          return true
        }
      }
      return false
    },
    typeOfAction() {
      if (this.isUndoAction) {
        return 'warning'
      }
      return 'default'
    },
    isPlain() {
      if (this.isUndoAction) {
        return true
      }
      return false
    },
    defaultActionToRun() {
      if (this.isUndoAction) {
        return this.actions[2]
      }
      return this.actions[0]
    },
    defaultActionName() {
      if (this.isWindow) {
        if (this.isWithRecord) {
          return this.$t('window.newRecord')
        }
        return this.$t('data.undo')
      }
      return this.$t('components.RunProcess')
    },
    iconDefault() {
      if (this.isPanelTypeMobile) {
        return 'component'
      }
      return 'skill'
    }
  },
  methods: {
    clickRelation(item) {
      this.$router.push({
        name: item.name,
        query: {
          tabParent: 0
        }
      }, () => {})
    },
    clickRunAction(action) {
      this.runAction(action)
    },
    clickReferences(reference) {
      this.openReference(reference)
    },
    iconAction(action) {
      let icon
      if (action.type === 'dataAction') {
        switch (action.action) {
          case 'setDefaultValues':
            icon = 'el-icon-news'
            break
          case 'deleteEntity':
            icon = 'el-icon-delete'
            break
          case 'undoModifyData':
            icon = 'el-icon-refresh-left'
            break
          case 'lockRecord':
            icon = 'el-icon-lock'
            break
          case 'unlockRecord':
            icon = 'el-icon-unlock'
            break
          case 'recordAccess':
            icon = 'el-icon-c-scale-to-original'
            break
        }
      } else if (action.type === 'process') {
        icon = 'el-icon-setting'
      }
      return icon
    },
    styleLabelAction(value) {
      if (value) {
        return 'font-size: 14px;margin-top: 0% !important;margin-left: 0px;margin-bottom: 10%;display: contents;'
      } else {
        return 'font-size: 14px;margin-top: 1.5% !important;margin-left: 2%;margin-bottom: 5%;display: contents;'
      }
    }
  }
}
</script>

<style scoped>
  .el-dropdown .el-button-group {
    display: flex;
  }
  .el-dropdown-menu--mini .el-dropdown-menu__item {
    line-height: 14px;
    padding: 0px 15px;
    font-size: 10px;
  }
  .el-dropdown-menu__item--divided {
    position: relative;
    /* margin-top: 6px; */
    border-top: 1px solid #e6ebf5;
  }
  .svg-icon {
    width: 1em;
    height: 2em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
  .label {
    font-size: 14px;
    margin-top: 0% !important;
    margin-left: 0px;
    text-align: initial;
  }
  .description {
    margin: 0px;
    font-size: 12px;
    text-align: initial;
  }
  .contents {
    display: inline-flex;
  }
</style>
