<template>
  <el-upload
    :ref="metadata.columnName"
    :action="getImage(metadata.value)"
    :show-file-list="false"
    :on-success="handleAvatarSuccess"
    :before-upload="beforeAvatarUpload"
    :disabled="isDisabled"
    :class="cssClassStyle"
  >
    <img v-if="value" :src="value" class="avatar">
    <i v-else class="el-icon-plus avatar-uploader-icon" />
  </el-upload>
</template>

<script>
import fieldMixin from '@/components/ADempiere/Field/mixin/mixinField.js'
import {
  requestResourceReference
} from '@/api/ADempiere/user-interface.js'
import { requestImage } from '@/api/ADempiere/persistence.js'
import { buildImageFromArrayBuffer } from '@/utils/ADempiere/resource.js'

export default {
  name: 'FieldImage',
  mixins: [fieldMixin],
  data() {
    return {
      valuesImage: [{
        identifier: 'undefined',
        value: '',
        isLoaded: true
      }]
    }
  },
  computed: {
    cssClassStyle() {
      let styleClass = ' custom-field-image '
      if (!this.isEmptyValue(this.metadata.cssClassName)) {
        styleClass += this.metadata.cssClassName
      }
      return styleClass
    }
  },
  methods: {
    requestResourceReference,
    srcImage() {
      requestResourceReference({
        recordUuid: this.metadata.recordUuid
      })
        .then(resource => {
          this.getImage(resource)
        })
    },
    handleAvatarSuccess(res, file) {
      this.value = URL.createObjectURL(file.raw)
      // TODO: define one method to control change value
      this.handleFieldChange({ value: this.value })
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      // const isGIF = file.type === 'image/gif'
      // const isBMP = file.type === 'image/bmp'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isLt2M) {
        this.$message.error(this.$t('components.imageError'))
      }
      return isJPG + isPNG + isLt2M
    },
    getImage(resource) {
      if (this.isEmptyValue(resource)) {
        return 'https://jsonplaceholder.typicode.com/posts/'
      }
      const { fileName, contentType } = resource
      if (!this.valuesImage.some(item => item.identifier === fileName)) {
        this.valuesImage.push({
          identifier: fileName,
          value: '',
          isLoaded: false
        })
      }
      if (resource[fileName]) {
        this.valuesImage.forEach(item => {
          if (item.identifier === fileName) {
            item.value = resource[fileName]
            item.isLoaded = true
          }
        })
      } else { // Reload
        if (!this.valuesImage.some(item => item.identifier === fileName)) {
          this.valuesImage.push({
            identifier: fileName,
            value: '',
            isLoaded: false
          })
        }
        // the name of the image plus the height and width of the container is sent
        requestImage({
          file: fileName,
          width: 50,
          height: 50
        }).then(responseImage => {
          const arrayBufferAsImage = buildImageFromArrayBuffer({
            arrayBuffer: responseImage,
            contentType
          })

          resource[fileName] = arrayBufferAsImage
          this.valuesImage.forEach(item => {
            if (item.identifier === fileName) {
              item.value = arrayBufferAsImage
              item.isLoaded = true
            }
          })
        })
      }
    }
  }
}
</script>

<style scoped>
  .custom-field-image .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .custom-field-image .el-upload:hover {
    border-color: #409EFF;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
