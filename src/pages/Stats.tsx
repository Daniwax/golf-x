import React from 'react';
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
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonNote,
  IonProgressBar
} from '@ionic/react';
import { 
  trendingUpOutline,
  trendingDownOutline,
  statsChartOutline,
  golfOutline,
  trophyOutline,
  timeOutline
} from 'ionicons/icons';
import { useState } from 'react';

const Stats: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState<string>('overview');

  const overviewStats = [
    { label: 'Total Rounds', value: '42', trend: '+5', isPositive: true },
    { label: 'Best Score', value: '78', trend: '-2', isPositive: true },
    { label: 'Average Score', value: '85.2', trend: '-1.3', isPositive: true },
    { label: 'Current Handicap', value: '12.5', trend: '-0.8', isPositive: true }
  ];

  const recentScores = [
    { course: 'Pebble Beach', score: 82, par: 72, date: 'Jan 15' },
    { course: 'Augusta National', score: 78, par: 72, date: 'Jan 10' },
    { course: 'St. Andrews', score: 85, par: 72, date: 'Jan 5' },
    { course: 'Pinehurst No. 2', score: 88, par: 72, date: 'Dec 28' },
    { course: 'Torrey Pines', score: 84, par: 72, date: 'Dec 20' }
  ];

  const skillsData = [
    { skill: 'Driving Accuracy', percentage: 68, color: 'primary' },
    { skill: 'Greens in Regulation', percentage: 45, color: 'secondary' },
    { skill: 'Putting Average', percentage: 78, color: 'success' },
    { skill: 'Sand Saves', percentage: 35, color: 'warning' },
    { skill: 'Scrambling', percentage: 52, color: 'tertiary' }
  ];

  const achievements = [
    { title: 'First Eagle', description: 'Scored your first eagle!', icon: trophyOutline, date: 'Dec 15' },
    { title: 'Sub-80 Round', description: 'Broke 80 for the first time', icon: golfOutline, date: 'Jan 10' },
    { title: 'Consistent Player', description: 'Played 5 rounds this month', icon: statsChartOutline, date: 'Jan 20' }
  ];

  const getScoreColor = (score: number, par: number) => {
    const diff = score - par;
    if (diff <= 0) return 'success';
    if (diff <= 5) return 'warning';
    return 'danger';
  };

  const renderOverview = () => (
    <div>
      {/* Quick Stats Grid */}
      <IonGrid>
        <IonRow>
          {overviewStats.map((stat, index) => (
            <IonCol size="6" key={index}>
              <IonCard>
                <IonCardContent style={{ textAlign: 'center', padding: '16px' }}>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
                    {stat.value}
                  </h2>
                  <IonNote color="medium" style={{ fontSize: '12px' }}>
                    {stat.label}
                  </IonNote>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginTop: '8px' 
                  }}>
                    <IonIcon 
                      icon={stat.isPositive ? trendingUpOutline : trendingDownOutline}
                      color={stat.isPositive ? 'success' : 'danger'}
                      style={{ fontSize: '16px', marginRight: '4px' }}
                    />
                    <IonNote color={stat.isPositive ? 'success' : 'danger'} style={{ fontSize: '12px' }}>
                      {stat.trend}
                    </IonNote>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          ))}
        </IonRow>
      </IonGrid>

      {/* Recent Scores */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Recent Scores</IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ paddingTop: 0 }}>
          {recentScores.map((round, index) => (
            <IonItem key={index}>
              <IonIcon icon={golfOutline} slot="start" />
              <IonLabel>
                <h3>{round.course}</h3>
                <p>Par {round.par} • {round.date}</p>
              </IonLabel>
              <div slot="end" style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: `var(--ion-color-${getScoreColor(round.score, round.par)})`
                }}>
                  {round.score}
                </div>
                <IonNote color={getScoreColor(round.score, round.par)} style={{ fontSize: '12px' }}>
                  {round.score > round.par ? '+' : ''}{round.score - round.par}
                </IonNote>
              </div>
            </IonItem>
          ))}
        </IonCardContent>
      </IonCard>
    </div>
  );

  const renderPerformance = () => (
    <div>
      {/* Skills Breakdown */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Skills Analysis</IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ paddingTop: 0 }}>
          {skillsData.map((skill, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '8px' 
              }}>
                <IonLabel>{skill.skill}</IonLabel>
                <IonNote color="medium">{skill.percentage}%</IonNote>
              </div>
              <IonProgressBar 
                value={skill.percentage / 100} 
                color={skill.color as any}
              />
            </div>
          ))}
        </IonCardContent>
      </IonCard>

      {/* Course Performance */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Course Performance</IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ paddingTop: 0 }}>
          <IonItem>
            <IonLabel>
              <h3>Best Course</h3>
              <p>Pebble Beach Golf Links</p>
            </IonLabel>
            <IonNote slot="end" color="success">
              Avg: 78.5
            </IonNote>
          </IonItem>
          <IonItem>
            <IonLabel>
              <h3>Most Played</h3>
              <p>Augusta National</p>
            </IonLabel>
            <IonNote slot="end" color="medium">
              8 rounds
            </IonNote>
          </IonItem>
          <IonItem>
            <IonLabel>
              <h3>Toughest Course</h3>
              <p>Torrey Pines (South)</p>
            </IonLabel>
            <IonNote slot="end" color="danger">
              Avg: 92.3
            </IonNote>
          </IonItem>
        </IonCardContent>
      </IonCard>
    </div>
  );

  const renderAchievements = () => (
    <div>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Recent Achievements</IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ paddingTop: 0 }}>
          {achievements.map((achievement, index) => (
            <IonItem key={index}>
              <IonIcon 
                icon={achievement.icon} 
                slot="start" 
                color="primary"
                style={{ fontSize: '24px' }}
              />
              <IonLabel>
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
              </IonLabel>
              <IonNote slot="end" color="medium">
                <IonIcon icon={timeOutline} style={{ fontSize: '14px', marginRight: '4px' }} />
                {achievement.date}
              </IonNote>
            </IonItem>
          ))}
        </IonCardContent>
      </IonCard>

      {/* Goals */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Goals</IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ paddingTop: 0 }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '8px' 
            }}>
              <IonLabel>Break 80 consistently</IonLabel>
              <IonNote color="medium">2/5 rounds</IonNote>
            </div>
            <IonProgressBar value={0.4} color="primary" />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '8px' 
            }}>
              <IonLabel>Lower handicap to 10</IonLabel>
              <IonNote color="medium">12.5 → 10.0</IonNote>
            </div>
            <IonProgressBar value={0.6} color="success" />
          </div>

          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '8px' 
            }}>
              <IonLabel>Play 50 rounds this year</IonLabel>
              <IonNote color="medium">42/50 rounds</IonNote>
            </div>
            <IonProgressBar value={0.84} color="warning" />
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Statistics</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Statistics</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="ion-padding">
          <IonSegment 
            value={selectedSegment} 
            onIonChange={e => setSelectedSegment(e.detail.value as string)}
            style={{ marginBottom: '16px' }}
          >
            <IonSegmentButton value="overview">
              <IonLabel>Overview</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="performance">
              <IonLabel>Performance</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="achievements">
              <IonLabel>Goals</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {selectedSegment === 'overview' && renderOverview()}
          {selectedSegment === 'performance' && renderPerformance()}
          {selectedSegment === 'achievements' && renderAchievements()}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Stats;