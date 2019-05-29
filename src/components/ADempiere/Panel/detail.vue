<template>
  <el-row v-if="showDetail" :gutter="12" class="root-container">
    <div class="container">
      <el-col :span="6">
        <div class="hidden-container">
          <div :class="isMobie()">
            <el-button
              v-if="!showPanel"
              :circle="true"
              class="el-icon-arrow-up button-top btn-base"
              @click="handleChange()"
            />
          </div>
        </div>
        <el-collapse-transition class="paneltab">
          <div v-show="showPanel">
            <div v-if="this.$store.state.app.sidebar.opened">
              <div class="container-table">
                <div class="show-container">
                  <el-button
                    v-if="showPanel"
                    :circle="true"
                    class="el-icon-arrow-down button-bottom btn-base"
                    @click="handleChange()"
                  />
                </div>
                <slot />
              </div>
            </div>
          </div>
        </el-collapse-transition>
      </el-col>
    </div>
  </el-row>
</template>

<script>
export default {
  name: 'PanelDetail',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    showDetail: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showPanel: true
    }
  },
  methods: {
    isMobie() {
      if (this.$store.state.app.device !== 'mobile') {
        return 'show-button'
      }
    },
    handleChange() {
      this.showPanel = !this.showPanel
    }
  }
}
</script>

<style scoped >
  /*
  .root-container {
    border-top: 2px solid #606266;
    height: 50%;
    margin: 5px;
  }
  */
  .hidden-container {
    bottom: 0;
    z-index: 0;
    position: fixed;
    width: 100%;
    color: #424242;
    margin-left: 10px;
    border-top: 10px solid #606266;
  }

  .container {
    bottom: 0;
    z-index: 0;
    position: fixed;
    width: 100%;
    display: flex;
    color: #424242;
    margin-left: 10px;
    border-top: 10px solid #606266;
  }

  .container:hover .show-button {
    visibility: visible;
    height: 50%;
  }

  .container:hover button {
    visibility: visible;
  }

  .show-button {
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

  .container-table {
    bottom: 0;
    height: 50%;
    width: 100%;
    position: fixed;
    position: fixed;
    display: flex;
    color: #424242;
    background-color: #fff;
  }

  .container-table:hover .show-container {
    visibility: visible;
  }

  .container-table:hover .buttonp2 {
    visibility: visible;
  }
  .container-table:hover .transi-box-menu-menu-hiden {
    visibility: visible;
  }

  .show-container {
    visibility: hidden;
    position: absolute;
    bottom: 0;
    color: #FFF;
    width: 100%;
    height: 0px;
    transition: all 0.5s ease-in;
    display: flex;
  }

  .buttonp2 {
    visibility: visible;
    transition: all .5s ease-in;
  }
  .btn-base {
    width: 40px;
    right: 50%;
    position: fixed;
    background: #ffffff;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    outline: 0;
    font-size: 14px;
  }
  .btn-base :hover {
    box-shadow: 5px #5a5a5a;
  }
  .button-top {
    bottom: 0;
  }
  .button-bottom {
    bottom: 50%;
    z-index: 2;
  }

  .transi-box-menu {
    bottom: 0;
    width: calc(100% - 170px);
    position: fixed;
    border-radius: 4px;
    background-color: #FFF;
    text-align: center;
    color: #FFF;
    box-sizing: border-box;
    height: 50%;
  }

  .transi-box-menu-menu-hiden {
    margin-bottom: 0px;
    width: calc(100% + 10px);
    position: fixed;
    bottom: 0;
    border-radius: 4px;
    background-color: #FFF;
    text-align: center;
    color: #FFF;
    height: 50%;
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
</style>
