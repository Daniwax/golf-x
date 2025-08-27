import { 
  IonApp, 
  IonRouterOutlet, 
  IonTabBar, 
  IonTabButton, 
  IonTabs, 
  IonLabel, 
  IonIcon,
  setupIonicReact 
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { 
  homeOutline, 
  personOutline, 
  statsChartOutline, 
  trophyOutline,
  bugOutline 
} from 'ionicons/icons';

// Import pages
import Home from './pages/Home';
import Profile from './pages/Profile';
import Stats from './pages/Stats';
import Tournaments from './pages/Tournaments';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Debug from './pages/Debug';
import Templates from './pages/debug/Templates';
import IonicShowcase from './pages/debug/templates/IonicShowcase';
import CoursesList from './pages/debug/CoursesList';
import CourseDetail from './pages/debug/CourseDetail';
import ConfigError from './pages/ConfigError';
import Friends from './pages/Friends';
import FriendProfile from './pages/FriendProfile';

// Import Supabase config check
import { isConfigured } from './lib/supabase';

// Import authentication hook
import { useAuth } from './lib/useAuth';

setupIonicReact({
  mode: 'ios'
});

function App() {
  // Must call all hooks unconditionally
  const authResult = useAuth();

  // Check if Supabase is configured first
  if (!isConfigured) {
    return <ConfigError />;
  }

  const { user, loading } = authResult;

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return (
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/login" component={Login} />
            <Route exact path="/signup" component={Signup} />
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/home" component={Home} />
            <Route exact path="/profile" component={Profile} />
            <Route exact path="/stats" component={Stats} />
            <Route exact path="/tournaments" component={Tournaments} />
            <Route exact path="/friends" component={Friends} />
            <Route exact path="/friend/:id" component={FriendProfile} />
            <Route exact path="/debug" component={Debug} />
            <Route exact path="/debug/templates" component={Templates} />
            <Route exact path="/debug/templates/ionic-showcase" component={IonicShowcase} />
            <Route exact path="/debug/courses" component={CoursesList} />
            <Route exact path="/debug/courses/:id" component={CourseDetail} />
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>
          
          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/home">
              <IonIcon icon={homeOutline} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>
            
            <IonTabButton tab="stats" href="/stats">
              <IonIcon icon={statsChartOutline} />
              <IonLabel>Stats</IonLabel>
            </IonTabButton>
            
            <IonTabButton tab="tournaments" href="/tournaments">
              <IonIcon icon={trophyOutline} />
              <IonLabel>Tournaments</IonLabel>
            </IonTabButton>
            
            <IonTabButton tab="profile" href="/profile">
              <IonIcon icon={personOutline} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
            
            <IonTabButton tab="debug" href="/debug">
              <IonIcon icon={bugOutline} />
              <IonLabel>Debug</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
