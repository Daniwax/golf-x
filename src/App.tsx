import React from 'react';
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
  trophyOutline
} from 'ionicons/icons';

// Import pages
import Home from './pages/Home';  // Reverted to original
import Profile from './pages/Profile';
import Stats from './pages/Stats';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CoursesList from './pages/courses/CoursesList';
import CourseDetail from './pages/courses/CourseDetail';

import ConfigError from './pages/ConfigError';
import Friends from './pages/Friends';
import FriendProfile from './pages/FriendProfile';

// Import Normal Game components
import CreateGame from './features/normal-game/components/CreateGame';
import CreateGameCustom from './features/normal-game/components/CreateGameCustom';
import GhostConfig from './features/normal-game/components/GhostConfig';
import AddParticipants from './features/normal-game/components/AddParticipants';
import PlayerConfiguration from './features/normal-game/components/PlayerConfiguration';
import GameSummary from './features/normal-game/components/GameSummary';

// Import Tournament components
import TournamentHub from './features/tournament/TournamentHub';
import TournamentLeaderboard from './features/tournament/TournamentLeaderboard';
import LiveGame from './features/normal-game/components/LiveGame';
import ViewCompletedGame from './features/normal-game/components/ViewCompletedGame';
import HoleStats from './pages/HoleStats';

// Import Test pages
import HandicapEngineTest from './pages/test/HandicapEngineTest';
import ScoringEngineTest from './pages/test/ScoringEngineTest';
import MatchHistory from './pages/MatchHistory';
import TestCompletedScorecard from './pages/TestCompletedScorecard';

// Import Supabase config check
import { isConfigured } from './lib/supabase';

// Import authentication hook
import { useAuth } from './lib/useAuth';
import { DevAuthWarning } from './components/DevAuthWarning';

setupIonicReact({
  mode: 'ios'
});

// Component that conditionally shows tab bar
const AppWithTabs: React.FC = () => {
  const location = useLocation();
  const hideTabBar = location.pathname.startsWith('/game/live/') || 
    location.pathname.startsWith('/game/view/') || 
    location.pathname.startsWith('/course') || 
    location.pathname === '/courses';

  // Track page visits
  React.useEffect(() => {
    import('./services/sessionTrackingService').then(({ sessionTracker }) => {
      sessionTracker.trackPageVisit(location.pathname);
    });
  }, [location.pathname]);

  // End session on app close/refresh
  React.useEffect(() => {
    const handleBeforeUnload = async () => {
      const { sessionTracker } = await import('./services/sessionTrackingService');
      await sessionTracker.endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/home" component={Home} />
        <Route exact path="/profile" component={Profile} />
        <Route exact path="/profile/match-history" component={MatchHistory} />
        <Route exact path="/stats" component={Stats} />
        <Route exact path="/stats/holes" component={HoleStats} />
        <Route exact path="/tournaments" component={TournamentHub} />
        <Route exact path="/tournament" component={TournamentHub} />
        <Route exact path="/tournament/leaderboard" component={TournamentLeaderboard} />
        <Route exact path="/friends" component={Friends} />
        <Route exact path="/friend/:id" component={FriendProfile} />
        
        {/* Normal Game Routes */}
        <Route exact path="/game/create" component={CreateGame} />
        <Route exact path="/game/create-custom" component={CreateGameCustom} />
        <Route exact path="/game/ghost-config" component={GhostConfig} />
        <Route exact path="/game/add-participants" component={AddParticipants} />
        <Route exact path="/game/configure-players" component={PlayerConfiguration} />
        <Route exact path="/game/summary" component={GameSummary} />
        <Route exact path="/game/live/:gameId" component={LiveGame} />
        <Route exact path="/game/view/:gameId" component={ViewCompletedGame} />
        
        {/* Course Routes */}
        <Route exact path="/courses" component={CoursesList} />
        <Route exact path="/course/:id" component={CourseDetail} />
        
        {/* Test Routes - Only for development */}
        <Route exact path="/test/handicap-engine" component={HandicapEngineTest} />
        <Route exact path="/test/scoring-engine" component={ScoringEngineTest} />
        <Route exact path="/test/completed-scorecard" component={TestCompletedScorecard} />
        
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
          
          <IonTabButton tab="tournaments" href="/tournaments">
            <IonIcon icon={trophyOutline} />
            <IonLabel>Tournaments</IonLabel>
          </IonTabButton>
          
          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={personOutline} />
            <IonLabel>Profile</IonLabel>
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
      <DevAuthWarning />
      <IonReactRouter>
        <AppWithTabs />
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
