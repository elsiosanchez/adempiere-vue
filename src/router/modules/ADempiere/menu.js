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
        redirect: '/dashboard',
        hidden: true
      }
    ]
    menu.getChildsList().forEach(function(menu) {
      const optionMenu = getRouteFromMenuItem(menu)
      if (menu.getIssummary()) {
        menu.getChildsList().forEach(function(menu) {
          optionMenu.children.push(getChildFromAction(menu))
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
function getChildFromAction(menu) {
  const action = menu.getAction()
  var actionName = convertAction(action)
  var routeIdentifier = actionName + '/' + menu.getReferenceuuid()
  let selectedComponent
  if (action === 'W') {
    selectedComponent = () => import('@/components/ADempiere/Window/window')
  } else if (action === 'S') {
    selectedComponent = () => import('@/components/ADempiere/Browser')
  } else if (action === 'P' || action === 'R') {
    selectedComponent = () => import('@/components/ADempiere/Process')
  } else {
    routeIdentifier = actionName + '/' + menu.getUuid()
  }
  var option = {
    path: routeIdentifier,
    component: selectedComponent,
    name: menu.getReferenceuuid(),
    meta: {
      title: menu.getName(),
      uuid: menu.getReferenceuuid(),
      type: action,
      parentUuid: menu.getParentuuid(),
      icon: 'chart',
      noCache: false
    }
  }
  return option
}

// Convert menu item from server to Route
function getRouteFromMenuItem(menu) {
  var optionMenu = []
  optionMenu = {
    path: '/' + menu.getUuid().replace(/ /g, ''),
    component: Layout,
    name: menu.getUuid(),
    meta: {
      title: menu.getName(),
      icon: 'chart',
      noCache: true
    },
    children: []
  }
  return optionMenu
}

// Convert action to action name for route
function convertAction(action) {
  var actionName = ''
  switch (action) {
    case 'B':
      actionName = 'workbech'
      break
    case 'F':
      actionName = 'workflow'
      break
    case 'P':
      actionName = 'process'
      break
    case 'R':
      actionName = 'report'
      break
    case 'S':
      actionName = 'browser'
      break
    case 'T':
      actionName = 'task'
      break
    case 'W':
      actionName = 'window'
      break
    case 'X':
      actionName = 'form'
      break
    default:
      actionName = 'summary'
      break
  }
  return actionName
}
