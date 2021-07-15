<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Elsio Sanchez esanchez@erpya.com www.erpya.com
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https:www.gnu.org/licenses/>.
-->
<template>
  <el-container style="height: 100% !important;">
    <el-header class="header">
      <el-tabs type="border-card">
        <el-tab-pane :label="$t('form.activity.title')">
          <el-table
            ref="WFActivity"
            v-loading="isEmptyValue(activityList)"
            :data="activityList"
            highlight-current-row
            style="width: 100%"
            border
            @current-change="handleCurrentChange"
          >
            <el-table-column
              v-for="(valueOrder) in orderLineDefinition"
              :key="valueOrder.columnName"
              :column-key="valueOrder.columnName"
              :label="valueOrder.name"
              :align="valueOrder.isNumeric ? 'right' : 'left'"
              :prop="valueOrder.columnName"
            />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-header>
    <el-main class="main">
      <transition name="el-zoom-in-center">
        <el-card v-show="show" :style="{position: 'absolute', zIndex: '5', left: leftContextualMenu + 'px', top: topContextualMenu + 'px'}" class="box-card">
          <div slot="header" class="clearfix">
            <span>
              <b> {{ infoNode.name }} </b>
            </span>
            <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-close" @click="show = !show" />
          </div>
          <div class="text item" style="padding: 20px">
            <b> {{ $t('table.ProcessActivity.Description') }}: </b> {{ infoNode.description }}
          </div>
        </el-card>
      </transition>
      <workflow-chart
        v-if="!isEmptyValue(node)"
        :transitions="nodeTransitions"
        :states="node"
        :state-semantics="stateSemantics"
        @state-click="onLabelClicked(node, $event)"
      />
    </el-main>
    <el-footer :class="styleFooter">
      <el-card shadow="hover" class="search">
        <el-form v-if="!isEmptyValue(fieldsList)" :disabled="isEmptyValue(currentActivity)" label-position="top" class="from-main">
          <el-form-item>
            <el-row>
              <el-col v-for="(field, index) in fieldsList" :key="index" :span="6">
                <field
                  :key="field.columnName"
                  :metadata-field="field"
                  :v-model="field.value"
                />
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
        <el-button type="primary" icon="el-icon-check" style="float: right;" :disabled="isEmptyValue(currentActivity)" @click="action" />
      </el-card>
    </el-footer>
  </el-container>
</template>

<script>
import formMixin from '@/components/ADempiere/Form/formMixin.js'
import fieldsList from './fieldsList.js'
import WorkflowChart from 'vue-workflow-chart'

export default {
  name: 'WFActivity',
  components: {
    WorkflowChart
  },
  mixins: [
    formMixin
  ],
  props: {
    metadata: {
      type: Object,
      default: () => {
        return {
          uuid: 'WF-Activity',
          containerUuid: 'WF-Activity',
          fieldsList
        }
      }
    }
  },
  data() {
    return {
      fieldsList,
      nodeTransitions: [],
      node: [],
      topContextualMenu: 0,
      leftContextualMenu: 0,
      infoNode: {},
      show: false,
      orderLineDefinition: [
        {
          columnName: 'priority',
          name: this.$t('form.activity.table.priority'),
          isNumeric: true
        },
        {
          columnName: 'node.name',
          name: this.$t('form.activity.table.node'),
          isNumeric: false
        },
        {
          columnName: 'Summary',
          name: this.$t('table.ProcessActivity.Summary'),
          isNumeric: false
        }
      ]
    }
  },
  computed: {
    styleFooter() {
      const showTitle = this.$store.getters.getIsShowTitleForm
      if (showTitle) {
        return 'show-title-footer'
      }
      return 'footer'
    },
    // Highlight Current Node
    stateSemantics() {
      if (this.isEmptyValue(this.activityList)) {
        return {}
      }
      return [{
        classname: 'delete',
        id: this.activityList.node.uuid
      }]
    },
    activityList() {
      const list = this.$store.getters.getActivity
      if (!this.isEmptyValue(list)) {
        return list.filter(activity => !this.isEmptyValue(activity.uuid))
      }
      return []
    },
    currentActivity() {
      return this.$store.getters.getCurrentActivity
    }
  },
  mounted() {
    this.$store.dispatch('serverListActivity')
    if (!this.isEmptyValue(this.currentActivity)) {
      this.setCurrent()
    }
  },
  methods: {
    setCurrent() {
      const activity = this.activityList.find(activity => activity.node === this.currentActivity.node)
      this.$refs.WFActivity.setCurrentRow(activity)
    },
    handleCurrentChange(activity) {
      this.listWorkflow(activity)
      this.$store.dispatch('selectedActivity', activity)
    },
    onLabelClicked(type, id) {
      this.infoNode = type.find(node => node.id === id)
      const menuMinWidth = 105
      const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
      const offsetWidth = this.$el.offsetWidth // container width
      const maxLeft = offsetWidth - menuMinWidth // left boundary
      const left = event.clientX - offsetLeft + 15 // 15: margin right

      this.leftContextualMenu = left
      if (left > maxLeft) {
        this.leftContextualMenu = maxLeft
      }

      const offsetTop = this.$el.getBoundingClientRect().top
      let top = event.clientY - offsetTop
      if (this.panelType === 'browser' && this.panelMetadata.isShowedCriteria) {
        top = event.clientY - 200
      }
      this.topContextualMenu = top
      this.show = true
    },
    listWorkflow(activity) {
      if (activity.workflow.workflow_nodes.length > 2) {
        const listNodes = activity.workflow.workflow_nodes.filter(node => !this.isEmptyValue(node.uuid))
        this.node = listNodes.map((workflow, key) => {
          return {
            ...workflow,
            id: workflow.uuid,
            key,
            label: workflow.name
          }
        })
        this.nodeTransitions = this.node.map((node, index) => {
          return {
            id: index,
            target: node.transitions[node.transitions.length].node_next_uuid,
            source: node.uuid
          }
        })
      } else {
        this.node = []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
 .from-main {
    padding-right: 1% !important;
    padding-bottom: 0px !important;
    padding-top: 0px !important;
    padding-left: 1% !important;
  }
  .card-form {
    height: 100% !important;
    overflow: auto;
  }
  .header {
    padding-bottom: 0px;
    padding-top: 1.5%;
    box-sizing: border-box;
    flex-shrink: 0;
    height: 20% !important;
    padding-left: 1%;
    padding-right: 1%;
  }
  .from-footer {
    height: 5% !important;
    box-sizing: border-box;
    flex-shrink: 0;
  }
  .footer {
    padding-top: 0px;
    height: 10% !important;
    padding-bottom: 0px;
  }
  .main {
    padding-bottom: 0px;
    padding-top: 0px;
  }
  .search {
    height: 100%;
  }
  .show-title-footer {
    padding-top: 0px;
    height: 8% !important;
    padding-bottom: 0px;
  }
</style>
<style scoped>
.vue-workflow-chart-state {
    background-color: #fff;
    padding: 20px;
    border-radius: 3px;
    color: #11353d;
    font-size: 15px;
    font-family: Open Sans;
    /* font-weight: 600; */
    margin-right: 20px;
    margin-bottom: 20px;
    max-width: 15%;
    text-align: center;
    -webkit-box-shadow: 0 2px 4px 0 rgb(0 0 0 / 20%);
    box-shadow: 0 2px 4px 0 rgb(0 0 0 / 20%);
}
  .panel_main {
    height: 100%;
    width: 100%;
  }
</style>
<style lang='scss'>
@import '~vue-workflow-chart/dist/vue-workflow-chart.css';
.vue-workflow-chart-state-delete {
  color: white;
  background: #AED5FE;
}
.vue-workflow-chart-transition-arrow-delete {
  fill: #AED5FE;
}
.vue-workflow-chart-transition-path-delete {
  stroke: #AED5FE;
}
</style>
