import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/',
    component: ComponentCreator('/', 'e89'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', '2a5'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', '40b'),
            routes: [
              {
                path: '/category/getting-started',
                component: ComponentCreator('/category/getting-started', '883'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/category/legal',
                component: ComponentCreator('/category/legal', '81e'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/category/more-features',
                component: ComponentCreator('/category/more-features', '12b'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/category/tab-reference',
                component: ComponentCreator('/category/tab-reference', 'c2f'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/getting-started/connect-live',
                component: ComponentCreator('/getting-started/connect-live', '7b9'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/getting-started/keyboard',
                component: ComponentCreator('/getting-started/keyboard', '8b8'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/getting-started/manage-files',
                component: ComponentCreator('/getting-started/manage-files', 'b2d'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/getting-started/navigation',
                component: ComponentCreator('/getting-started/navigation', '60c'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/legal/nondiscrimination',
                component: ComponentCreator('/legal/nondiscrimination', '64c'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/legal/open-source-license',
                component: ComponentCreator('/legal/open-source-license', 'fef'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/legal/privacy-policy',
                component: ComponentCreator('/legal/privacy-policy', '0d4'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/legal/support',
                component: ComponentCreator('/legal/support', 'f43'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/more-features/advantagescope-xr',
                component: ComponentCreator('/more-features/advantagescope-xr', '1bf'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/more-features/custom-assets',
                component: ComponentCreator('/more-features/custom-assets', '8af'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/more-features/export',
                component: ComponentCreator('/more-features/export', '813'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/more-features/gltf-convert',
                component: ComponentCreator('/more-features/gltf-convert', '97b'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/more-features/nt-publishing',
                component: ComponentCreator('/more-features/nt-publishing', '684'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/more-features/phoenix-diagnostics',
                component: ComponentCreator('/more-features/phoenix-diagnostics', 'b57'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/more-features/urcl',
                component: ComponentCreator('/more-features/urcl', 'ab2'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/more-features/zebra',
                component: ComponentCreator('/more-features/zebra', '327'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/tab-reference/3d-field',
                component: ComponentCreator('/tab-reference/3d-field', '8de'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/tab-reference/console',
                component: ComponentCreator('/tab-reference/console', '34f'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/tab-reference/joysticks',
                component: ComponentCreator('/tab-reference/joysticks', '41d'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/tab-reference/line-graph',
                component: ComponentCreator('/tab-reference/line-graph', '992'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/tab-reference/mechanism',
                component: ComponentCreator('/tab-reference/mechanism', '61f'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/tab-reference/metadata',
                component: ComponentCreator('/tab-reference/metadata', '3e6'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/tab-reference/odometry',
                component: ComponentCreator('/tab-reference/odometry', '68b'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/tab-reference/points',
                component: ComponentCreator('/tab-reference/points', '86e'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/tab-reference/statistics',
                component: ComponentCreator('/tab-reference/statistics', '072'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/tab-reference/swerve',
                component: ComponentCreator('/tab-reference/swerve', '8f1'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/tab-reference/table',
                component: ComponentCreator('/tab-reference/table', '3d3'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/tab-reference/video',
                component: ComponentCreator('/tab-reference/video', 'e2e'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/whats-new/',
                component: ComponentCreator('/whats-new/', 'f45'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/whats-new/full-changelog',
                component: ComponentCreator('/whats-new/full-changelog', 'bef'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/whats-new/legacy-formats',
                component: ComponentCreator('/whats-new/legacy-formats', 'e91'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/',
                component: ComponentCreator('/', '93f'),
                exact: true,
                sidebar: "sidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
