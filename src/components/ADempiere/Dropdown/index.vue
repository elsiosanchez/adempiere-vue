<template>
  <el-col :span="24">
    <el-collapse accordion>
      <el-collapse-item :title="title" name="1" class="collapse-item">
        <template v-for="(item, index) in items">
          <div v-if="!item.hidden" :key="index" class="card-panel" @click="redirect(item)">
            <div class="card-panel-icon-wrapper icon-message">
              <svg-icon :icon-class="item.meta.icon" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">
                {{ item.meta.title }}
              </div>
            </div>
          </div>
        </template>
      </el-collapse-item>
    </el-collapse>
  </el-col>
</template>

<script>
export default {
  name: 'Dropdown',
  props: {
    items: {
      type: Array,
      default: function() {
        return []
      }
    },
    title: {
      type: String,
      default: 'vue'
    }
  },
  data() {
    return {
      isActive: false
    }
  },
  methods: {
    redirect(item) {
      this.$router.push({ name: item.name })
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
.card-panel {
    height: 50px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
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
      margin: 0 0 0 14px;
      padding: 10px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }
    .card-panel-icon {
      float: left;
      font-size: 30px;
    }
    .card-panel-description {
      float: left;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;
      .card-panel-text {
        line-height: 5px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
        margin-bottom: 12px;
      }
    }
  }
</style>
