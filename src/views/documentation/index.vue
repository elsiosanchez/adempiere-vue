<template>
  <div>
    <el-row>
      <el-col :span="defaultSize" :style="style">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>
              {{ $t('documentation.documentation') }}
            </span>
            <a class="document-btn" target="_blank" href="//adempiere.github.io/adempiere-vue-site/" style="float: right; padding: 3px 0">
              <svg-icon icon-class="link" />
            </a>
          </div>
          <div>
            <p align="center">
              <img width="220" src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Adempiere-logo.png">
            </p>

            <p align="center">
              <a href="https://github.com/vuejs/vue">
                <img src="https://img.shields.io/badge/vue-2.6.10-brightgreen.svg" alt="vue">
              </a>
              <a href="https://github.com/ElemeFE/element">
                <img src="https://img.shields.io/badge/element--ui-2.7.0-brightgreen.svg" alt="element-ui">
              </a>
              <a href="https://travis-ci.org/adempiere/adempiere-vue" rel="nofollow">
                <img src="https://travis-ci.org/adempiere/adempiere=vue.svg?branch=develop" alt="Build Status">
              </a>
              <a href="https://github.com/adempiere/adempiere-vue/blob/master/LICENSE">
                <img src="https://img.shields.io/badge/license-GNU/GPL%20(v3)-blue" alt="license">
              </a>
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="defaultSize" :style="style">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>
              {{ $t('documentation.github') }}
            </span>
            <a class="document-btn" target="_blank" href="https://github.com/adempiere/adempiere-vue" style="float: right; padding: 3px 0">
              <svg-icon icon-class="link" />
            </a>
          </div>
          <div>
            <p align="center">
              <img width="220" src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Adempiere-logo.png">
            </p>

            <p align="center">
              <a href="https://github.com/vuejs/vue">
                <img src="https://img.shields.io/badge/vue-2.6.10-brightgreen.svg" alt="vue">
              </a>
              <a href="https://github.com/ElemeFE/element">
                <img src="https://img.shields.io/badge/element--ui-2.7.0-brightgreen.svg" alt="element-ui">
              </a>
              <a href="https://travis-ci.org/adempiere/adempiere-vue" rel="nofollow">
                <img src="https://travis-ci.org/adempiere/adempiere=vue.svg?branch=develop" alt="Build Status">
              </a>
              <a href="https://github.com/adempiere/adempiere-vue/blob/master/LICENSE">
                <img src="https://img.shields.io/badge/license-GNU/GPL%20(v3)-blue" alt="license">
              </a>
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="defaultSize" :style="style">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>
              {{ releasesLabel }}
            </span>
            <a class="document-btn" target="_blank" href="https://github.com/adempiere/adempiere-vue/releases" style="float: right; padding: 3px 0">
              <svg-icon icon-class="link" />
            </a>
          </div>
          <el-collapse
            v-model="activeNames"
            accordion
          >
            <el-collapse-item
              v-for="(releases, key) in releasesList"
              :key="key"
              :name="key"
            >
              <template slot="title">
                <svg v-if="key !== stopper" class="octicon octicon-tag" viewBox="0 0 16 16" version="1.1" width="16" height="16" style="margin-right: 2%;">
                  <path fill-rule="evenodd" :d="icon" />
                </svg>
                <b>
                  {{
                    releases.title
                  }}
                </b>
              </template>
              <a class="document-btn" target="_blank" :href="releases.download" style="float: right; padding: 3px 0">
                <i class="el-icon-download" />
              </a>
              <div v-if="!isEmptyValue(releases)" id="markdown" v-markdown="releases.body" />
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// import DropdownMenu from '@/components/Share/DropdownMenu'
import { fetchReleasesList } from '@/api/documentation/releases'
import { config } from '@/utils/ADempiere/config'

export default {
  name: 'Documentation',
  // components: { DropdownMenu },
  data() {
    return {
      releasesList: [],
      activeNames: ['1'],
      icon: 'M2.5 7.775V2.75a.25.25 0 01.25-.25h5.025a.25.25 0 01.177.073l6.25 6.25a.25.25 0 010 .354l-5.025 5.025a.25.25 0 01-.354 0l-6.25-6.25a.25.25 0 01-.073-.177zm-1.5 0V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 010 2.474l-5.026 5.026a1.75 1.75 0 01-2.474 0l-6.25-6.25A1.75 1.75 0 011 7.775zM6 5a1 1 0 100 2 1 1 0 000-2z',
      releaseNotes: {
        body: ''
      },
      releasesLabel: this.$t('documentation.releases')
    }
  },
  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    defaultSize() {
      if (this.isMobile) {
        return 24
      }
      return 8
    },
    style() {
      return 'margin-top: 2%;padding: 1%;'
    },
    stopper() {
      return this.releasesList.length - 1
    }
  },
  created() {
    this.loadReleasesList()
  },
  methods: {
    loadReleasesList() {
      fetchReleasesList()
        .then(response => {
          if (response) {
            response.forEach(release => {
              this.releasesList.push({
                title: release.name,
                href: release.html_url,
                author: release.author.login,
                body: release.body,
                created_at: release.created_at,
                download: release.assets[0].browser_download_url
              })
            })
            if (config.repository.releaseNo !== undefined && this.releasesList.length > 0) {
              this.releaseNotes = this.releasesList.find(release => {
                return release.title === config.repository.releaseNo
              })
              if (!this.releaseNotes) {
                this.releaseNotes = this.releasesList[0]
              }
            }
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.documentation-container {
  margin: 50px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;

  .document-btn {
    flex-shrink: 0;
    display: block;
    cursor: pointer;
    background: black;
    color: white;
    height: 60px;
    padding: 0 16px;
    margin: 16px;
    line-height: 60px;
    font-size: 20px;
    text-align: center;
  }
  .el-col {
    margin-top: 2%;
    padding: 1%;
  }
}
</style>
