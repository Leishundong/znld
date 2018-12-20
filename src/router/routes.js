let routes = [
  {
    name: 'index',
    path: '/',
    redirect: '/user'
  },
  {
    name: 'user',
    path: '/user',
    component: r => require(['views/user/user'], r),
    redirect: '/user/login',
    children: [
      {
        name: 'login',
        path: 'login',
        component: r => require(['views/user/children/login'], r)
      }/*,
      {
        name: 'register',
        path: 'register',
        component: r => require(['views/user/children/register'], r)
      }*/
    ]
  },
 {
    name: 'main',
    path: '/main',
    component: r => require(['layout/mainLayout'], r),
    children: [
      {
        name: 'home',
        path: 'home',
        component: r => require(['views/home/home'], r)
      },
      {
        name: 'userManage',
        path: 'userManage',
        component: r => require(['views/user/manage'], r)
      },
      {
        name: 'add',
        path: 'add',
        component: r => require(['views/add/add'], r)
      }
      /*
       {
         name: 'export',
         path: 'export',
         component: r => require(['views/export/export'], r)
       },
       {
         name: 'aging',
         path: 'aging',
         component: r => require(['views/aging/aging'], r)
       }*/
     ]
   },
   {
     name: 'app',
     path: '/:projectId/app',
     component: r => require(['layout/layout'], r),
     redirect: '/:projectId/app/device/map',
     children: [
       {
         name: 'device',
         path: 'device',
         redirect: '/:projectId/app/device/map'
       },
       {
         name: 'deviceMap',
         path: 'device/map',
         component: r => require(['views/device/map'], r)
       },
       {
         name: 'monitor',
         path: 'monitor',
         component: r => require(['views/monitor/monitor'], r)
       },
       {
         name: 'warn',
         path: 'warn',
         component: r => require(['views/warn/warn'], r)
       },
       {
         name: 'strategy',
         path: 'strategy',
         component: r => require(['views/strategy/strategy'], r)
       },
       {
         name: 'group',
         path: 'group',
         component: r => require(['views/group/group'], r)
       },
       {
         name: 'project',
         path: 'project',
         component: r => require(['views/project/project'], r)
       },
       {
         name: 'deviceList',
         path: 'device/list',
         component: r => require(['views/device/list'], r)
       }
     ]
   }
];

// const routesModules = require.context('./modules', false, /\.js$/)
// routesModules.keys().forEach(item => {
//   const route = routesModules(item).default
//   routes = routes.concat(route)
// })

export default routes



// WEBPACK FOOTER //
// ./src/router/routes.js
