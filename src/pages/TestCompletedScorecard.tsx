import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton
} from '@ionic/react';
import CompletedScorecard from '../features/normal-game/components/CompletedScorecard';

const TestCompletedScorecard: React.FC = () => {
  // Sample test data with fixed scores
  const participants = [
    {
      user_id: 'user1',
      profiles: {
        full_name: 'John Doe'
      }
    },
    {
      user_id: 'user2',
      profiles: {
        full_name: 'Jane Smith'
      }
    }
  ];

  const holes = Array.from({ length: 18 }, (_, i) => ({
    hole_number: i + 1,
    par: [4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4][i]
  }));

  // Fixed scores for testing
  const scores = [
    // John Doe's scores
    { user_id: 'user1', hole_number: 1, strokes: 4 },
    { user_id: 'user1', hole_number: 2, strokes: 5 },
    { user_id: 'user1', hole_number: 3, strokes: 3 },
    { user_id: 'user1', hole_number: 4, strokes: 5 },
    { user_id: 'user1', hole_number: 5, strokes: 4 },
    { user_id: 'user1', hole_number: 6, strokes: 3 },
    { user_id: 'user1', hole_number: 7, strokes: 6 },
    { user_id: 'user1', hole_number: 8, strokes: 4 },
    { user_id: 'user1', hole_number: 9, strokes: 4 },
    { user_id: 'user1', hole_number: 10, strokes: 4 },
    { user_id: 'user1', hole_number: 11, strokes: 2 },
    { user_id: 'user1', hole_number: 12, strokes: 5 },
    { user_id: 'user1', hole_number: 13, strokes: 4 },
    { user_id: 'user1', hole_number: 14, strokes: 4 },
    { user_id: 'user1', hole_number: 15, strokes: 3 },
    { user_id: 'user1', hole_number: 16, strokes: 5 },
    { user_id: 'user1', hole_number: 17, strokes: 5 },
    { user_id: 'user1', hole_number: 18, strokes: 4 },
    // Jane Smith's scores
    { user_id: 'user2', hole_number: 1, strokes: 5 },
    { user_id: 'user2', hole_number: 2, strokes: 6 },
    { user_id: 'user2', hole_number: 3, strokes: 4 },
    { user_id: 'user2', hole_number: 4, strokes: 4 },
    { user_id: 'user2', hole_number: 5, strokes: 5 },
    { user_id: 'user2', hole_number: 6, strokes: 3 },
    { user_id: 'user2', hole_number: 7, strokes: 5 },
    { user_id: 'user2', hole_number: 8, strokes: 5 },
    { user_id: 'user2', hole_number: 9, strokes: 4 },
    { user_id: 'user2', hole_number: 10, strokes: 5 },
    { user_id: 'user2', hole_number: 11, strokes: 3 },
    { user_id: 'user2', hole_number: 12, strokes: 6 },
    { user_id: 'user2', hole_number: 13, strokes: 5 },
    { user_id: 'user2', hole_number: 14, strokes: 4 },
    { user_id: 'user2', hole_number: 15, strokes: 4 },
    { user_id: 'user2', hole_number: 16, strokes: 4 },
    { user_id: 'user2', hole_number: 17, strokes: 6 },
    { user_id: 'user2', hole_number: 18, strokes: 5 },
  ];

  const coursePar = holes.reduce((sum, hole) => sum + hole.par, 0);

  console.log('Test data:', { participants, holes, scores, coursePar });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Test Completed Scorecard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen style={{ '--background': '#f5f5f5' }}>
        <div style={{ padding: '20px' }}>
          <h2>Testing CompletedScorecard Component</h2>
          <p>If you see this text but no scorecard below, the component is not rendering.</p>
          <CompletedScorecard
            participants={participants}
            scores={scores}
            holes={holes}
            coursePar={coursePar}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TestCompletedScorecard;