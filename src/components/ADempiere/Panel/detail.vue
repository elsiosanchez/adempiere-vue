<template>
  <div>
    <el-row :gutter="20">
      <el-row v-if="true" :gutter="12">
        <el-col :span="6">
          <div class="container">
            <div v-if="this.$store.state.app.device!=='mobile'" class="show">
              <el-button
                v-if="!showPanel"
                :circle="true"
                class="el-icon-arrow-up button1"
                @click="showPanel = !showPanel"
              />
            </div>
            <div v-else>
              <el-button
                v-if="!showPanel"
                :circle="true"
                class="el-icon-arrow-up button1"
                @click="showPanel = !showPanel"
              />
            </div>
          </div>
          <div>
            <el-collapse-transition class="paneltab">
              <div v-show="showPanel">
                <div v-if="this.$store.state.app.sidebar.opened">
                  <div class="container2">
                    <div class="show2">
                      <el-button
                        v-if="show3"
                        :circle="true"
                        class="el-icon-arrow-down button2"
                        @click="showPanel = !showPanel"
                      />
                    </div>
                    <slot />
                  </div>
                </div>
              </div>
            </el-collapse-transition>
          </div>
        </el-col>
      </el-row>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'PanelDetail',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showPanel: true,
      show3: true
    }
  }
}
</script>

<style scoped >
  .paneltab {
    border: 1px solid blue;
  }

  .container {
    bottom: 0;
    z-index: 0;
    position: fixed;
    width: 100%;
    height: 10%;
    display: flex;
    color: #424242;
  }

  .container:hover .show {
    visibility: visible;
    height: 80px;
  }

  .container:hover button {
    visibility: visible;
  }

  .show {
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

  .container2 {
    bottom: 0;
    height: 135px;
    width: 100%;
    position: fixed;
    position: fixed;
    display: flex;
    color: #424242;
    background-color: #fff;
  }

  .container2:hover .show2 {
    visibility: visible;
  }

  .container2:hover .buttonp2 {
    visibility: visible;
  }
  .container2:hover .transi-box2 {
    visibility: visible;
  }

  .show2 {
    visibility: hidden;
    position: absolute;
    bottom: 0;
    color: #FFF;
    width: 100%;
    height: 0px;
    transition: all 0.5s ease-in;
    display: flex;
  }
  .avatar {
    width: 54px;
    height: 28px;
}
.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 134px;
    height: 5px;
    line-height: 57px;
}

  .buttonp2 {
    visibility: visible;
    transition: all .5s ease-in;
  }

  .button1 {
   width: 40px;
   bottom: 0;
   right: 50%;
   position: fixed;
   background: #ffffff;
   color: #606266;
   -webkit-appearance: none;
   text-align: center;
   outline: 0;
   font-size: 14px;
 }
  .button2 {
    width: 37px;
    bottom: 39%;
    z-index: 2;
    right: 50%;
    position: fixed;
    background: #ffffff;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    outline: 0;
    font-size: 14px;
  }

  .transi-box {
    bottom: 0;
    width: calc(100% - 170px);
    position: fixed;
    border-radius: 4px;
    background-color: #FFF;
    text-align: center;
    color: #FFF;
    box-sizing: border-box;
    height: 11%;
  }

  .transi-box2 {
    margin-bottom: 0px;
    width: calc(100% + 10px);
    position: fixed;
    bottom: 0;
    border-radius: 4px;
    background-color: #FFF;
    text-align: center;
    color: #FFF;
    height: 39%;

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

  .sticky-submenu {
    position: absolute !important;
    right: 10px;
    top: 0;
  }
</style>
