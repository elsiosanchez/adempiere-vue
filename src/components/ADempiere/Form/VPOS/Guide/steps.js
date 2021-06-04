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
    element: '#BusinessPartner',
    popover: {
      title: language.t('form.pos.order.BusinessPartnerCreate.businessPartner'),
      description: language.t('form.guideSteps.businessPartner.description'),
      position: 'bottom'
    }
  },
  {
    element: '#linesOrder',
    popover: {
      title: language.t('form.guideSteps.linesTable.title'),
      description: language.t('form.guideSteps.linesTable.description'),
      position: 'top'
    }
  },
  {
    element: '#buttonPanelLeftPos',
    popover: {
      title: language.t('form.guideSteps.buttonPanelLeftPos.title'),
      description: language.t('form.guideSteps.buttonPanelLeftPos.description'),
      position: 'right'
    }
  },
  {
    element: '#toolPoint',
    popover: {
      title: 'Herramientas del Punto de Venta',
      description: 'Navegar en la tabla, eliminar linea y ir al panel de cobranza',
      position: 'bottom'
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
    element: '#buttonPanelRightPos',
    popover: {
      title: language.t('form.guideSteps.buttonPanelRightPos.title'),
      description: language.t('form.guideSteps.buttonPanelRightPos.description'),
      position: 'left'
    }
  },
  {
    element: '#fieldListCollection',
    popover: {
      title: language.t('form.guideSteps.fieldListCollection.title'),
      description: language.t('form.guideSteps.fieldListCollection.description'),
      position: 'left'
    },
    panel: 'Collection'
  },
  {
    element: '#buttonCollection',
    popover: {
      title: language.t('form.guideSteps.buttonCollection.title'),
      description: language.t('form.guideSteps.buttonCollection.description'),
      position: 'left'
    },
    panel: 'Collection'
  },
  {
    element: '#cardCollection',
    popover: {
      title: language.t('form.guideSteps.cardCollection.title'),
      description: language.t('form.guideSteps.cardCollection.description'),
      position: 'left'
    },
    panel: 'Collection'
  },
  {
    element: '#infoInvoce',
    popover: {
      title: language.t('form.guideSteps.infoInvoce.title'),
      description: language.t('form.guideSteps.infoInvoce.description'),
      position: 'top'
    },
    panel: 'Collection'
  }
]
export default steps
