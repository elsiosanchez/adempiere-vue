<template>
  <div class="wrapper">
    <el-form
      ref="dynamicValidateForm"
      :label-position="labelPosition"
      label-width="120px"
    >
      <div class="cards-not-group">
        <div class="card">
          <el-card
            header="Custom Filter"
            shadow="hover"
          >
            <el-form-item>
              <el-select
                v-model="addField"
                :filterable="true"
                placeholder="Filtrable Items"
                multiple
                value-key="key"
              >
                <el-option
                  v-for="(item, key) in fieldList"
                  :key="key"
                  :label="item.name"
                  :value="item.columnName"
                />
              </el-select>
            </el-form-item>

            <template v-if="addField.length > 0">
              <template v-for="(item, index) in filterRows">
                <field
                  :key="index"
                  :container-uuid="containerUuid"
                  :metadata-field="item"
                  :span="6"
                />
              </template>
            </template>
          </el-card>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import Field from '@/components/ADempiere/Field'

export default {
  name: 'PanelDynamic',
  components: {
    Field
  },
  props: {
    containerUuid: {
      type: String,
      required: true
    },
    metadata: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      labelPosition: 'top',
      fieldList: [],
      addField: []
    }
  },
  computed: {
    filterRows() {
      var addingFields = this.fieldList.filter((item) => {
        if (this.addField.indexOf(item.columnName) !== -1) {
          return true
        }
      })
      return addingFields
    }
  },
  mounted() {
    this.generatePanel()
  },
  methods: {
    generatePanel() {
      this.fieldList = this.metadata.fieldList.filter((item) => {
        if (item.isQueryCriteria && !item.isMandatory) {
          return true
        }
      })
    }
  }
}
</script>

<style scoped>
  .box {
    width: 400px;
  }

  .top {
    text-align: center;
  }

  .bottom {
    clear: both;
    text-align: center;
  }

  .left {
    float: left;
    width: 110px;
  }

  .right {
    float: right;
    width: 110px;
  }

  .item {
    margin: 4px;
  }

  .left .el-tooltip__popper,
  .right .el-tooltip__popper {
    padding: 8px 10px;
  }

  .el-button {
    width: 110px;
  }
</style>
<style>
  .cards {
    column-count: 2;  /*numbers of columns */
    column-gap: 1em;
    margin-top: 10px;
  }

  .cards-not-group {
    column-count: 1; /* numbers of columns */
    column-gap: 1em;
    margin-top: 10px;
  }

  .card {
    padding: 10px;
    margin: 0 0 1em;
    width: 100%;
    cursor: pointer;
    transition: all 100ms ease-in-out;
    display: inline-block;
    perspective: 1000;
    backface-visibility: hidden;
  }
</style>
