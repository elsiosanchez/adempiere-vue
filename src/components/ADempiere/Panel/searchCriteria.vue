<template>
  <div>
    <el-button v-show="!openContainer" icon="el-icon-search" type="text" class="open" @click="handleChange()"> {{ $t('views.searchCriteria') }} </el-button>
    <el-button v-show="openContainer" icon="el-icon-close" type="text" class="close" @click="handleChange()" />
    <div>
      <el-collapse-transition>
        <div v-show="openContainer">
          <div class="transition-box">
            <slot />
          </div>
        </div>
      </el-collapse-transition>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PanelDetail',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    panelType: {
      type: String,
      default: 'window'
    },
    containerUuid: {
      type: String,
      default: undefined
    },
    isShowedCriteria: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      openContainer: this.isShowedCriteria
    }
  },
  methods: {
    classContainer() {
      if (this.$store.state.app.device === 'mobile') {
        return 'container-panel-mobile'
      } else if (this.$store.state.app.sidebar.opened) {
        return 'container-panel-open'
      }
      return 'container-panel'
    },
    handleChange() {
      this.openContainer = !this.openContainer
      this.$store.dispatch('changeShowedDetail', {
        panelType: this.panelType,
        containerUuid: this.containerUuid,
        isShowedCriteria: this.openContainer
      })
    }
  }
}
</script>

<style scoped>
  .containert {
    padding-left: 20px;
    padding-right: 20px;
    width: 100%;
  }
  .title{
    color: #000000;
    text-size-adjust: 20px;
    font-size: 100%;
    font-weight: 605!important;
    position: relative;
    left: 40%;
  }
  .close{
    color: #000000;
    text-size-adjust: 20px;
    font-size: 100%;
    font-weight: 605!important;
    position: relative;
    left: 96%;
  }
  .open{
    color: #000000;
    text-size-adjust: 20px;
    font-size: 100%;
    font-weight: 605!important;
  }
</style>
