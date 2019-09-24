<template>
  <component
    :is="templateDevice"
    :menu-parent-uuid="menuParentUuid"
    :parent-uuid="parentUuid"
    :container-uuid="containerUuid"
    :panel-type="panelType"
    :is-report="isReport"
    :last-parameter="lastParameter"
    :report-format="reportFormat"
    :modal-metadata="modalMetadata"
    :is-insert-record="isInsertRecord"
  />
</template>

<script>
export default {
  name: 'ContextMenu',
  props: {
    menuParentUuid: {
      type: String,
      default: undefined
    },
    // uuid of the component where it is called
    parentUuid: {
      type: String,
      default: undefined
    },
    // uuid of the component where it is called
    containerUuid: {
      type: String,
      required: true
    },
    panelType: {
      type: String,
      default: undefined
    },
    isReport: {
      type: Boolean,
      default: false
    },
    lastParameter: {
      type: String,
      default: undefined
    },
    reportFormat: {
      type: String,
      default: undefined
    },
    modalMetadata: {
      type: Object,
      default: () => {}
    },
    // used only window
    isInsertRecord: {
      type: Boolean,
      default: undefined
    }
  },
  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    templateDevice() {
      var template = 'contextMenuDesktop'
      if (this.isMobile) {
        template = 'contextMenuMobile'
      }
      return () => import(`@/components/ADempiere/ContextMenu/${template}`)
    }
  }
}
</script>
