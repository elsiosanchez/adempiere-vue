import language from '@/lang'
const steps = [
  {
    element: '#ProductValue',
    popover: {
      title: language.t('form.productInfo.codeProduct'),
      description: language.t('form.guideSteps.productValue.description'),
      position: 'bottom'
    }
  },
  {
    element: '#business-partner',
    popover: {
      title: language.t('form.pos.order.BusinessPartnerCreate.businessPartner'),
      description: language.t('form.guideSteps.businessPartner.description'),
      position: 'bottom'
    }
  },
  {
    element: '#linesTable',
    popover: {
      title: language.t('form.guideSteps.inesTable.title'),
      description: language.t('form.guideSteps.linesTable.description'),
      position: 'top'
    }
  },
  {
    element: '#button-panel-left-pos',
    popover: {
      title: language.t('form.guideSteps.buttonPanelLeftPos.title'),
      description: language.t('form.guideSteps.buttonPanelLeftPos.description'),
      position: 'right'
    }
  },
  {
    element: '#point',
    popover: {
      title: language.t('form.pos.title'),
      description: language.t('form.guideSteps.point.description'),
      position: 'right'
    }
  },
  {
    element: '#button-panel-right-pos',
    popover: {
      title: language.t('form.guideSteps.buttonPanelRightPos.title'),
      description: language.t('form.guideSteps.buttonPanelRightPos.description'),
      position: 'left'
    },
    padding: 0
  }
]
export default steps
