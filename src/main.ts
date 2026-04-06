/* import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

 bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err)); */

import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { provideHttpClient } from '@angular/common/http';

// ✅ CHART FIX (VERY IMPORTANT)
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
     provideHttpClient(),
    provideCharts(withDefaultRegisterables()) // ✅ FIXES "line not registered"
  ]
  

}).catch(err => console.error(err));