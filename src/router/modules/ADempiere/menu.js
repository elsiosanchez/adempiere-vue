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
      },
      {
        path: '/Notification',
        component: Layout,
        children: [
          {
            path: 'index',
            component: () => import('@/components/ADempiere/Notification'),
            name: 'Notification',
            meta: { title: 'Notification', icon: 'documentation', noCache: true }
          }
        ]
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
  var actionAttributes = convertAction(action)
  var routeIdentifier = actionAttributes.name + '/' + menu.getReferenceuuid()
  let selectedComponent
  if (action === 'W') {
    selectedComponent = () => import('@/components/ADempiere/Window/window')
  } else if (action === 'S') {
    selectedComponent = () => import('@/components/ADempiere/Browser')
  } else if (action === 'P' || action === 'R') {
    selectedComponent = () => import('@/components/ADempiere/Process')
  } else {
    routeIdentifier = actionAttributes.name + '/' + menu.getUuid()
  }
  var option = {
    path: routeIdentifier,
    component: selectedComponent,
    name: menu.getReferenceuuid(),
    hidden: actionAttributes.hidden,
    alwaysShow: false,
    meta: {
      title: menu.getName(),
      uuid: menu.getReferenceuuid(),
      type: actionAttributes.name,
      parentUuid: menu.getParentuuid(),
      icon: actionAttributes.icon,
      noCache: false
    }
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
    component: Layout,
    name: menu.getUuid(),
    meta: {
      title: menu.getName(),
      type: actionAttributes.name,
      icon: actionAttributes.icon,
      noCache: true
    },
    children: []
  }
  return optionMenu
}

// Convert action to action name for route
function convertAction(action) {
  var actionAttributes = {
    name: '',
    icon: '',
    hidden: false
  }
  switch (action) {
    case 'B':
      actionAttributes.name = 'workbech'
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
      actionAttributes.hidden = true
      break
  }
  return actionAttributes
}
