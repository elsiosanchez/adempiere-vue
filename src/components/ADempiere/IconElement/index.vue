<template>
  <div :class="{'show-input-seacrh':isShowElement}" class="search-detail">
    <i
      :class="icon + ' props-icon'"
      @click.stop="click"
      @submit.prevent.native="false"
    />
    <slot
      ref="headerSearchSelect"
    />
  </div>
</template>

<script>
export default {
  name: 'IconElement',
  props: {
    icon: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isShowElement: false // show input from search,
    }
  },
  watch: {
    isShowElement(value) {
      if (value) {
        document.body.addEventListener('click', this.close)
      } else {
        document.body.removeEventListener('click', this.close)
      }
    }
  },
  methods: {
    click() {
      this.isShowElement = !this.isShowElement
      if (this.isShowElement) {
        this.$refs.headerSearchSelect && this.$refs.headerSearchSelect.focus()
      }
    },
    close() {
      this.$refs.headerSearchSelect && this.$refs.headerSearchSelect.blur()
      this.options = []
      this.show = false
    }
  }
}
</script>

<style lang="scss">
  .search-detail {
    height: 28px;
    // width: 100%;
    float: right;
    left: 5%;
    padding-top: 10px;
    .props-icon {
      cursor: pointer;
      font-size: 18px;
      margin-top: 15px;
      color: #000;
      // position: absolute;
      vertical-align: middle;
    }

    .header-search-input {
      font-size: 12px;
      transition: width 0.2s;
      width: 0;
      overflow: hidden;
      background: transparent;
      border-radius: 0;
      display: inline-block;
      vertical-align: middle;
      height: 28px;

      /deep/ .el-input__inner {
        border-radius: 0;
        border: 0;
        padding-left: 0;
        padding-right: 0;
        box-shadow: none !important;
        border-bottom: 1px solid #d9d9d9;
        vertical-align: middle;
      }
    }.header-search-select {
      font-size: 12px;
      transition: width 0.2s;
      width: 30px;
      overflow: hidden;
      background: transparent;
      border-radius: 0;
      display: inline-block;
      vertical-align: middle;
      height: 28px;

      /deep/ .el-input__inner {
        border-radius: 0;
        border: 0;
        padding-left: 0;
        padding-right: 0;
        box-shadow: none !important;
        border-bottom: 1px solid #d9d9d9;
        vertical-align: middle;
      }
    }
    &.show-input-seacrh {
      .header-search-input {
        width: 250px;
        margin-top: 8px;
        // margin-left: 5px; // separation with the icon
      }
    }
  }
</style>
