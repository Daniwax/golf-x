import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonBackButton,
  IonList,
  IonListHeader,
  IonToggle,
  IonRange,
  IonNote,
  IonChip,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { 
  playOutline,
  settingsOutline,
  golfOutline,
  peopleOutline,
  flagOutline,
  timeOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const CasualGame: React.FC = () => {
  const history = useHistory();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTeeBox, setSelectedTeeBox] = useState('');
  const [numberOfHoles, setNumberOfHoles] = useState(18);
  const [scoringFormat, setScoringFormat] = useState('stroke');
  const [playersCount, setPlayersCount] = useState(1);

  // Mock courses data - replace with actual data later
  const courses = [
    { id: 'lamoraleja1', name: 'La Moraleja Course 1', par: 72 },
    { id: 'lamoraleja2', name: 'La Moraleja Course 2', par: 72 },
    { id: 'lamoraleja3', name: 'La Moraleja Course 3', par: 72 },
    { id: 'lamoraleja4', name: 'La Moraleja Course 4', par: 72 },
    { id: 'pitch-putt', name: 'La Moraleja Pitch & Putt', par: 54 }
  ];

  const teeBoxes = [
    { id: 'black', name: 'Black', difficulty: 'Championship' },
    { id: 'white', name: 'White', difficulty: 'Mens' },
    { id: 'yellow', name: 'Yellow', difficulty: 'Senior Mens' },
    { id: 'blue', name: 'Blue', difficulty: 'Ladies' },
    { id: 'red', name: 'Red', difficulty: 'Forward' }
  ];

  const handleStartGame = () => {
    if (!selectedCourse || !selectedTeeBox) {
      // Show error toast
      return;
    }
    
    // Navigate to game tracking page
    history.push('/game/play', {
      course: selectedCourse,
      teeBox: selectedTeeBox,
      holes: numberOfHoles,
      format: scoringFormat,
      players: playersCount
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Casual Game Setup</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="ion-padding">
          {/* Course Selection */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={golfOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Select Course
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonSelect 
                value={selectedCourse}
                placeholder="Choose a course"
                onIonChange={e => setSelectedCourse(e.detail.value)}
              >
                {courses.map(course => (
                  <IonSelectOption key={course.id} value={course.id}>
                    {course.name} (Par {course.par})
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonCardContent>
          </IonCard>

          {/* Tee Box Selection */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={flagOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Select Tee Box
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonSelect 
                value={selectedTeeBox}
                placeholder="Choose tee box"
                onIonChange={e => setSelectedTeeBox(e.detail.value)}
                disabled={!selectedCourse}
              >
                {teeBoxes.map(tee => (
                  <IonSelectOption key={tee.id} value={tee.id}>
                    {tee.name} - {tee.difficulty}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonCardContent>
          </IonCard>

          {/* Game Settings */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={settingsOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Game Settings
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {/* Number of Holes */}
                <IonItem>
                  <IonLabel>Number of Holes</IonLabel>
                  <IonSelect 
                    value={numberOfHoles}
                    onIonChange={e => setNumberOfHoles(e.detail.value)}
                  >
                    <IonSelectOption value={9}>9 Holes</IonSelectOption>
                    <IonSelectOption value={18}>18 Holes</IonSelectOption>
                  </IonSelect>
                </IonItem>

                {/* Scoring Format */}
                <IonItem>
                  <IonLabel>Scoring Format</IonLabel>
                  <IonSelect 
                    value={scoringFormat}
                    onIonChange={e => setScoringFormat(e.detail.value)}
                  >
                    <IonSelectOption value="stroke">Stroke Play</IonSelectOption>
                    <IonSelectOption value="stableford">Stableford</IonSelectOption>
                    <IonSelectOption value="match">Match Play</IonSelectOption>
                  </IonSelect>
                </IonItem>

                {/* Number of Players */}
                <IonItem>
                  <IonLabel>
                    <IonIcon icon={peopleOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Players: {playersCount}
                  </IonLabel>
                  <IonRange 
                    min={1} 
                    max={4} 
                    value={playersCount}
                    onIonChange={e => setPlayersCount(e.detail.value as number)}
                    pin={true}
                    snaps={true}
                    step={1}
                  />
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          {/* Game Summary */}
          {selectedCourse && selectedTeeBox && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Game Summary</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol size="6">
                      <IonNote>Course:</IonNote>
                      <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
                        {courses.find(c => c.id === selectedCourse)?.name}
                      </p>
                    </IonCol>
                    <IonCol size="6">
                      <IonNote>Tee Box:</IonNote>
                      <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
                        {teeBoxes.find(t => t.id === selectedTeeBox)?.name}
                      </p>
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol size="6">
                      <IonNote>Holes:</IonNote>
                      <p style={{ margin: '4px 0', fontWeight: 'bold' }}>{numberOfHoles}</p>
                    </IonCol>
                    <IonCol size="6">
                      <IonNote>Format:</IonNote>
                      <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
                        {scoringFormat.charAt(0).toUpperCase() + scoringFormat.slice(1)}
                      </p>
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol>
                      <IonNote>Players:</IonNote>
                      <p style={{ margin: '4px 0', fontWeight: 'bold' }}>{playersCount}</p>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>
          )}

          {/* Start Button */}
          <IonButton
            expand="block"
            size="large"
            disabled={!selectedCourse || !selectedTeeBox}
            onClick={handleStartGame}
            style={{ marginTop: '20px' }}
          >
            <IonIcon icon={playOutline} slot="start" />
            Start Game
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CasualGame;