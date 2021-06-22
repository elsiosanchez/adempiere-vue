<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Elsio Sanchez elsiosanches@gmail.com www.erpya.com
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
  <el-carousel :ref="stepReference" arrow="never" :autoplay="false" :initial-index="indicator" style="height: 100%;">
    <el-carousel-item v-for="(item, key) in steps" :key="key">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <p style="margin: 0px;text-align: center;">
            <b>
              {{ item.name }}
            </b>
          </p>
          <p style="margin: 0px;text-align: center;">
            {{ item.description }}
          </p>
        </div>
        <div class="text item">
          <slot />
        </div>
      </el-card>
    </el-carousel-item>
  </el-carousel>
</template>

<script>

export default {
  name: 'Carousel',
  props: {
    stepReference: {
      type: String,
      default: 'carousel'
    },
    steps: {
      type: Array,
      default: () => []
    },
    indicator: {
      type: Number,
      default: 0
    }
  },
  watch: {
    indicator(value) {
      this.$refs[this.stepReference].activeIndex = value
    }
  }
}
</script>

<style>
.setting {
  z-index: 3;
  width: 2.5%;
  height: 10%;
  right: 0%;
  position: absolute;
  top: 250px;
}
.showme {
  display: block;
}

.setting:hover .showme {
  display: block;
}
.showrightMenu {
  overflow: visible;
  position: relative;
  width: calc(100% - 15px);
}
</style>

<style lang="scss" scoped>
.rightMenu-background {
  opacity: 0;
  transition: opacity .3s cubic-bezier(.7, .3, .1, 1);
  background: rgba(0, 0, 0, .2);
  width: 0;
  height: 0;
  top: 0;
  left: 0;
  position: fixed;
  z-index: -1;
}

.rightMenu {
  background: #fff;
  z-index: 3000;
  position: fixed;
  height: 100vh;
  width: 100%;
  max-width: 80%;
  top: 0px;
  left: 0px;
  box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, .05);
  transition: all .25s cubic-bezier(.7, .3, .1, 1);
  transform: translate(100%);
  z-index: 40000;
  left: auto;
  right: 0px;
}

.show {
  transition: all .3s cubic-bezier(.7, .3, .1, 1);

  .rightMenu-background {
    z-index: 20000;
    opacity: 1;
    width: 100%;
    height: 100%;
  }

  .rightMenu {
    transform: translate(0);
  }
}

.handle-button {
  width: 48px;
  height: 48px;
  position: absolute;
  left: -48px;
  text-align: center;
  font-size: 24px;
  border-radius: 6px 0 0 6px !important;
  z-index: 0;
  pointer-events: auto;
  cursor: pointer;
  color: #fff;
  line-height: 48px;
  i {
    font-size: 24px;
    line-height: 48px;
  }
}
</style>
