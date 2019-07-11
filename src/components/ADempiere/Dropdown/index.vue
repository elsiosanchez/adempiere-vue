<template>
  <el-col v-if="items.children" :span="24">
    <el-collapse v-model="activeNames">
      <el-collapse-item :title="title" name="1" class="collapse-item">
        <el-row justify="space-around" class="panel-group">
          <template v-for="(item, index) in items.children">
            <el-col :key="index" :span="8" class="card-panel-col">
              <div :key="index" class="card-panel" @click="redirect(item)">
                <div class="card-panel-icon-wrapper icon-message">
                  <svg-icon :icon-class="item.meta.icon" class-name="card-panel-icon" />
                </div>
                <div class="card-panel-description">
                  <div class="card-panel-text">
                    {{ item.meta.title }}
                  </div>
                </div>
              </div>
            </el-col>
          </template>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </el-col>
  <el-col v-else :span="8" class="panel-group card-panel-col">
    <div class="card-panel" @click="redirect(items)">
      <div class="card-panel-icon-wrapper icon-message">
        <svg-icon :icon-class="items.meta.icon" class-name="card-panel-icon" />
      </div>
      <div class="card-panel-description">
        <div class="card-panel-text">
          {{ items.meta.title }}
        </div>
      </div>
    </div>
  </el-col>
</template>

<script>
export default {
  name: 'Dropdown',
  props: {
    items: {
      type: Object,
      default: function() {
        return {}
      }
    },
    title: {
      type: String,
      default: 'vue'
    }
  },
  data() {
    return {
      activeNames: ['1'],
      isActive: false
    }
  },
  methods: {
    redirect(item) {
      this.$router.push({ name: item.name, params: { childs: item.children }})
    }
  }
}
</script>

<style lang="scss">
.el-collapse-item__header {
  height: 60px;
  font-weight: bold;
  font-size: 16px;
  text-align: center;
}
.panel-group {
  margin-top: 18px;
  .card-panel-col{
    margin-bottom: 32px;
  }
  .card-panel {
    width: 98%;
    height: 80px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 10px rgba(0, 0, 0, .09);
    border-color: rgba(0, 0, 0, .05);
    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }
      .icon-people {
         background: #40c9c6;
      }
      .icon-message {
        background: #36a3f7;
      }
      .icon-money {
        background: #f4516c;
      }
      .icon-shopping {
        background: #34bfa3
      }
    }
    .icon-people {
      color: #40c9c6;
    }
    .icon-message {
      color: #36a3f7;
    }
    .icon-money {
      color: #f4516c;
    }
    .icon-shopping {
      color: #34bfa3
    }
    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 7px;
      padding: 6px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }
    .card-panel-icon {
      float: left;
      font-size: 25px;
    }
    .card-panel-description {
      float: left;
      font-weight: bold;
      margin: 26px 0 0 0px;
      /* margin-left: 0px; */
      .card-panel-text {
        vertical-align: middle;
        line-height: 13px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 13px;
        margin-bottom: 12px;
      }
    }
  }
}
</style>
