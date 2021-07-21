<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com www.erpya.com
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
  <el-container class="panel_main">
    <el-header>
      <title-and-help
        :name="workflowFileName"
        :help="$route.meta.description"
      />
    </el-header>
    <el-main>
      <workflow
        v-if="!isEmptyValue(node)"
        :node-transition-list="listWorkflowTransition"
        :node-list="node"
        :current-node="currentNode"
        :workflow-logs="listProcessWorkflow"
      />
    </el-main>
  </el-container>
</template>

<script>
// When supporting the workflow, smart browser and reports,
// the ContextMenu and sticky must be placed in the layout
// import ContextMenu from '@/components/ADempiere/ContextMenu'
// import MainPanel from '@/components/ADempiere/Panel'
import TitleAndHelp from '@/components/ADempiere/TitleAndHelp'
// import Epale from './epale'
import Workflow from '@/components/ADempiere/Workflow'

export default {
  name: 'Workflow',
  components: {
  //   MainPanel,
  //   ContextMenu,
    Workflow,
    // Epale,
    TitleAndHelp
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      size: {
        width: '20px',
        height: '2px'
      },
      workflowMetadata: {},
      node: [],
      currentWorkflow: {},
      listProcessWorkflow: [],
      listWorkflowTransition: [],
      isLoadedMetadata: false,
      panelType: 'workflow'
    }
  },
  computed: {
    workflowUuid() {
      return this.$route.meta.uuid
    },
    workflowFileName() {
      return this.workflowMetadata.fileName || this.$route.meta.title
    },
    getWorkflow() {
      return this.$store.getters.getWorkflowUuid(this.workflowUuid)
    },
    nodoWorkflow() {
      return this.workflowMetadata.node.map(node => {
        return {
          id: node.id,
          label: node.name
        }
      })
    }
  },
  created() {
    this.workflow()
  },
  methods: {
    workflow() {
      const workflow = this.getWorkflow
      console.log({ workflow })
      if (workflow) {
        this.workflowMetadata = workflow
        this.isLoadedMetadata = true
      } else {
        this.$store.dispatch('getPanelAndFields', {
          containerUuid: this.workflowUuid,
          panelType: this.panelType,
          routeToDelete: this.$route
        }).then(workflowResponse => {
          console.log({ workflowResponse })
          this.workflowMetadata = workflowResponse
          this.listWorkflow(this.workflowMetadata)
        }).finally(() => {
          this.isLoadedMetadata = true
        })
      }
    },
    listWorkflow(activity) {
      // Highlight Current Node
      this.currentWorkflow = activity
      this.listProcessWorkflow = !this.isEmptyValue(this.currentWorkflow.workflow_process) ? this.currentWorkflow.workflow_process.workflow_events.reverse() : []
      this.transitions = []
      if (!this.isEmptyValue(activity.node.uuid)) {
        this.currentNode = [{
          classname: 'delete',
          id: activity.node.uuid
        }]
      }
      const nodes = activity.workflow.workflow_nodes.filter(node => !this.isEmptyValue(node.uuid))
      this.listNodeTransitions(nodes)
      if (!this.isEmptyValue(nodes)) {
        this.node = nodes.map((workflow, key) => {
          return {
            ...workflow,
            transitions: workflow.transitions,
            id: workflow.uuid,
            key,
            label: workflow.name
          }
        })
      } else {
        this.node = []
      }
    },
    listNodeTransitions(nodes) {
      nodes.forEach(element => {
        const uuid = element.uuid
        const id = element.value
        if (!this.isEmptyValue(element.transitions)) {
          element.transitions.forEach((nextNode, key) => {
            if (!this.isEmptyValue(nextNode.node_next_uuid)) {
              if (this.isEmptyValue(nextNode.description)) {
                this.transitions.push({
                  id: id + key,
                  target: uuid,
                  source: nextNode.node_next_uuid
                })
              } else {
                this.transitions.push({
                  id: id + key,
                  label: nextNode.description,
                  target: uuid,
                  source: nextNode.node_next_uuid
                })
              }
            }
          })
        }
      })
      const blon = nodes.map(item => {
        return {
          uuid: item.uuid
        }
      })
      this.listWorkflowTransition = this.transitions.filter(data => {
        const verificar = blon.find(mode => mode.uuid === data.source)
        if (!this.isEmptyValue(verificar)) {
          return data
        }
      })
    },
    onStateClick(id) {
      console.log(id)
    },
    onLabelClicked(id) {
      const node = this.nodoWorkflow.find(node => node.id === id)
      if (node) {
        this.$router.push({
          name: node.url
        }, () => {})
      }
    },
    sizeChanged(size) {
      this.size = {
        width: `${size.width}px`,
        height: `${size.height}px`
      }
    }
  }
}
</script>
<style scoped>
  .panel_main {
    height: 100%;
    width: 100%;
  }
</style>
<style lang='scss'>
@import '~vue-workflow-chart/dist/vue-workflow-chart.css';

.vue-workflow-chart-state-delete {
  color: white;
  background: red;
}

.vue-workflow-chart-transition-arrow-delete {
  fill: red;
}

.vue-workflow-chart-transition-path-delete {
  stroke: red;
}
</style>
