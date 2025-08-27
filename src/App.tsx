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
import { Redirect, Route, useLocation } from 'react-router-dom';
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

// Import Normal Game components
import CreateGame from './features/normal-game/components/CreateGame';
import AddParticipants from './features/normal-game/components/AddParticipants';
import PlayerConfiguration from './features/normal-game/components/PlayerConfiguration';
import GameSummary from './features/normal-game/components/GameSummary';
import LiveGame from './features/normal-game/components/LiveGame';
import ViewCompletedGame from './features/normal-game/components/ViewCompletedGame';

// Import Supabase config check
import { isConfigured } from './lib/supabase';

// Import authentication hook
import { useAuth } from './lib/useAuth';

setupIonicReact({
  mode: 'ios'
});

// Component that conditionally shows tab bar
const AppWithTabs: React.FC = () => {
  const location = useLocation();
  const hideTabBar = location.pathname.startsWith('/game/live/');

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/home" component={Home} />
        <Route exact path="/profile" component={Profile} />
        <Route exact path="/stats" component={Stats} />
        <Route exact path="/tournaments" component={Tournaments} />
        <Route exact path="/friends" component={Friends} />
        <Route exact path="/friend/:id" component={FriendProfile} />
        
        {/* Normal Game Routes */}
        <Route exact path="/game/create" component={CreateGame} />
        <Route exact path="/game/add-participants" component={AddParticipants} />
        <Route exact path="/game/configure-players" component={PlayerConfiguration} />
        <Route exact path="/game/summary" component={GameSummary} />
        <Route exact path="/game/live/:gameId" component={LiveGame} />
        <Route exact path="/game/view/:gameId" component={ViewCompletedGame} />
        
        {/* Debug Routes */}
        <Route exact path="/debug" component={Debug} />
        <Route exact path="/debug/templates" component={Templates} />
        <Route exact path="/debug/templates/ionic-showcase" component={IonicShowcase} />
        <Route exact path="/debug/courses" component={CoursesList} />
        <Route exact path="/debug/course/:id" component={CourseDetail} />
        
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>
      
      {!hideTabBar && (
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
      )}
    </IonTabs>
  );
};

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
        <AppWithTabs />
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
