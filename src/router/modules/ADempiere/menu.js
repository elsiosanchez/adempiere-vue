import { getMenu } from '@/api/user'
import { getToken } from '@/utils/auth'

/* Layout  */
import Layout from '@/layout'

// Get Menu from server
export function loadMainMenu() {
  return getMenu(getToken()).then(menu => {
    const asyncRouterMap = [
      {
        path: '*',
        redirect: '/404',
        hidden: true
      },
      {
        path: '/ProcessActivity',
        component: Layout,
        children: [
          {
            path: 'index',
            component: () => import('@/views/ADempiere/ProcessActivity'),
            name: 'ProcessActivity',
            meta: { title: 'ProcessActivity', icon: 'skill', noCache: true }
          }
        ]
      },
      {
        path: '/SearchWindow',
        component: Layout,
        hidden: true,
        children: [
          {
            path: 'index',
            component: () => import('@/views/ADempiere/SearchWindow'),
            name: 'SearchWindow',
            meta: { title: 'SearchWindow', icon: 'search', noCache: true }
          }
        ]
      },
      {
        path: '/report-viewer',
        component: Layout,
        hidden: true,
        redirect: 'report-viewer/:processUuid/:instanceUuid/:fileName',
        children: [
          {
            path: ':processUuid/:instanceUuid/:fileName',
            component: () => import('@/views/ADempiere/ReportViewer'),
            name: 'Report Viewer',
            meta: {
              title: 'ReportViewer'
            }
          }
        ]
      }
    ]
    menu.getChildsList().forEach((menu) => {
      const optionMenu = getRouteFromMenuItem(menu)
      if (menu.getIssummary()) {
        menu.getChildsList().forEach((menu, index) => {
          optionMenu.children.push(getChildFromAction(menu, index = 0))
        })
      } else {
        optionMenu.children.push(getChildFromAction(menu))
      }
      asyncRouterMap.push(optionMenu)
    })
    return asyncRouterMap
  }).catch(error => {
    console.log('Error with Login: ' + error)
  })
}

// Get Only Child
function getChildFromAction(menu, index) {
  const action = menu.getAction()
  var actionAttributes = convertAction(action)
  var routeIdentifier = actionAttributes.name + '/' + menu.getReferenceuuid()
  let selectedComponent
  if (action === 'W') {
    selectedComponent = () => import('@/views/ADempiere/Window')
    routeIdentifier = actionAttributes.name + '/' + menu.getReferenceuuid() + '/:uuidRecord?'
  } else if (action === 'S') {
    selectedComponent = () => import('@/views/ADempiere/Browser')
  } else if (action === 'P' || action === 'R') {
    selectedComponent = () => import('@/views/ADempiere/Process')
  } else {
    routeIdentifier = actionAttributes.name + '/' + menu.getUuid()
    selectedComponent = () => import('@/views/ADempiere/Summary')
  }
  var option = {
    path: routeIdentifier,
    component: selectedComponent,
    name: menu.getUuid(),
    // hidden: actionAttributes.hidden,
    hidden: index > 0,
    meta: {
      isIndex: actionAttributes.isIndex,
      title: menu.getName(),
      uuid: menu.getReferenceuuid(),
      type: actionAttributes.name,
      parentUuid: menu.getParentuuid(),
      icon: actionAttributes.icon,
      alwaysShow: true,
      noCache: false
    }
  }
  if (option.meta.type === 'summary') {
    option['children'] = []
    menu.getChildsList().forEach((child, index) => {
      option.children.push(getChildFromAction(child, index = 1))
    })
  }
  return option
}

// Convert menu item from server to Route
function getRouteFromMenuItem(menu) {
  const action = menu.getAction()
  var actionAttributes = convertAction(action)
  var optionMenu = []
  optionMenu = {
    path: '/' + menu.getUuid().replace(/ /g, ''),
    redirect: '/' + menu.getUuid().replace(/ /g, '') + '/index',
    component: Layout,
    name: menu.getUuid(),
    meta: {
      title: menu.getName(),
      type: actionAttributes.name,
      icon: actionAttributes.icon,
      noCache: true
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/ADempiere/Summary'),
        name: menu.getUuid() + '-index',
        hidden: true,
        meta: {
          isIndex: actionAttributes.isIndex,
          parentUuid: menu.getUuid(),
          title: menu.getName(),
          type: actionAttributes.name,
          noCache: true
        }
      }
    ]
  }
  return optionMenu
}

// Convert action to action name for route
function convertAction(action) {
  var actionAttributes = {
    name: '',
    icon: '',
    hidden: false,
    isIndex: false
  }
  switch (action) {
    case 'B':
      actionAttributes.name = 'workbech'
      actionAttributes.icon = 'peoples'
      break
    case 'F':
      actionAttributes.name = 'workflow'
      actionAttributes.icon = 'example'
      break
    case 'P':
      actionAttributes.name = 'process'
      actionAttributes.icon = 'component'
      break
    case 'R':
      actionAttributes.name = 'report'
      actionAttributes.icon = 'skill'
      break
    case 'S':
      actionAttributes.name = 'browser'
      actionAttributes.icon = 'search'
      break
    case 'T':
      actionAttributes.name = 'task'
      break
    case 'W':
      actionAttributes.name = 'window'
      actionAttributes.icon = 'tab'
      break
    case 'X':
      actionAttributes.name = 'form'
      actionAttributes.icon = 'form'

      break
    default:
      actionAttributes.name = 'summary'
      actionAttributes.icon = 'nested'
      // actionAttributes.hidden = true
      actionAttributes.isIndex = true
      break
  }
  return actionAttributes
}
