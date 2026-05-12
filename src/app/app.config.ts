import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { 
  LucideAngularModule, Building, MapPin, Users, MessageSquare, Star, Search, 
  ChevronDown, Eye, Trash2, Info, TriangleAlert, AlertTriangle, IndianRupee, 
  Calendar, Loader2, Building2, X, AlertCircle, ChevronRight, Zap, Package, 
  Maximize2, ImageOff, CheckCircle2, Check, Tag, Plus, Mail, Phone, 
  ShieldCheck, FileText, FileCheck, XCircle, User, List, Clock, 
  MessageSquareOff, ShieldX, CheckCircle, TrendingUp, Wallet,
  CalendarCheck, Download, ClipboardList, CalendarX, RefreshCw, ShieldOff, ScrollText
} from 'lucide-angular';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    importProvidersFrom(LucideAngularModule.pick({ 
      Building, MapPin, Users, MessageSquare, Star, Search, ChevronDown, Eye, 
      Trash2, Info, TriangleAlert, AlertTriangle, IndianRupee, Calendar, 
      Loader2, Building2, X, AlertCircle, ChevronRight, Zap, Package, 
      Maximize2, ImageOff, CheckCircle2, Check, Tag, Plus, Mail, Phone, 
      ShieldCheck, FileText, FileCheck, XCircle, User, List, Clock, 
      MessageSquareOff, ShieldX, CheckCircle, TrendingUp, Wallet,
      CalendarCheck, Download, ClipboardList, CalendarX, RefreshCw, ShieldOff, ScrollText
    }))
  ]
};
