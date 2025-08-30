import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon
} from '@ionic/react';
import { trophyOutline, medalOutline, ribbonOutline } from 'ionicons/icons';
import '../../styles/golf_style.css';

interface Player {
  position: number;
  name: string;
  score: number;
  thru: number;
  today: number;
  rounds: number[];
  totalStrokes: number;
  movement: 'up' | 'down' | 'same';
}

const TournamentLeaderboard: React.FC = () => {
  const [selectedSegment, setSelectedSegment] = useState('leaderboard');

  // Mock data for 6 players - Stableford scoring
  const players: Player[] = [
    { 
      position: 1, 
      name: 'Tiger Woods', 
      score: 42, // Stableford points
      thru: 18, 
      today: 42,
      rounds: [42],
      totalStrokes: 68,
      movement: 'same'
    },
    { 
      position: 2, 
      name: 'Jack Nicklaus', 
      score: 39,
      thru: 18, 
      today: 39,
      rounds: [39],
      totalStrokes: 70,
      movement: 'up'
    },
    { 
      position: 3, 
      name: 'Arnold Palmer', 
      score: 37,
      thru: 18, 
      today: 37,
      rounds: [37],
      totalStrokes: 71,
      movement: 'down'
    },
    { 
      position: 4, 
      name: 'Ben Hogan', 
      score: 36,
      thru: 18, 
      today: 36,
      rounds: [36],
      totalStrokes: 72,
      movement: 'same'
    },
    { 
      position: 5, 
      name: 'Bobby Jones', 
      score: 35,
      thru: 17, 
      today: 35,
      rounds: [35],
      totalStrokes: 73,
      movement: 'up'
    },
    { 
      position: 6, 
      name: 'Sam Snead', 
      score: 34,
      thru: 16, 
      today: 34,
      rounds: [34],
      totalStrokes: 74,
      movement: 'down'
    }
  ];

  const getPositionIcon = (position: number) => {
    switch(position) {
      case 1: return trophyOutline;
      case 2: return medalOutline;
      case 3: return ribbonOutline;
      default: return null;
    }
  };

  const getPositionColor = (position: number) => {
    switch(position) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#2a5434';
    }
  };

  return (
    <IonPage className="golf-letter-container">
      <IonHeader>
        <IonToolbar style={{ '--background': '#2a5434' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tournament" style={{ color: '#f8f6f0' }} />
          </IonButtons>
          <IonTitle style={{ color: '#f8f6f0', fontFamily: 'serif' }}>
            Masters Championship 2025
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#f8f6f0' }}>
        {/* Tournament header */}
        <div style={{
          background: 'linear-gradient(180deg, #2a5434 0%, #3d7c47 100%)',
          padding: '20px',
          color: '#f8f6f0',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 50px,
              rgba(255, 255, 255, 0.03) 50px,
              rgba(255, 255, 255, 0.03) 100px
            )`,
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontSize: '24px',
              fontFamily: 'Georgia, serif',
              margin: '0 0 8px 0',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              Final Round
            </h2>
            <p style={{
              fontSize: '12px',
              fontFamily: 'serif',
              opacity: 0.9,
              margin: 0
            }}>
              Augusta National Golf Club • Stableford Scoring
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '30px',
              marginTop: '16px',
              fontSize: '11px',
              fontFamily: 'serif'
            }}>
              <div>
                <span style={{ opacity: 0.7 }}>Purse:</span> <strong>$100,000</strong>
              </div>
              <div>
                <span style={{ opacity: 0.7 }}>Format:</span> <strong>18 Holes</strong>
              </div>
              <div>
                <span style={{ opacity: 0.7 }}>Players:</span> <strong>6</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Segment control */}
        <IonSegment 
          value={selectedSegment} 
          onIonChange={e => setSelectedSegment(e.detail.value!)}
          style={{
            padding: '16px',
            '--background': '#f8f6f0'
          }}
        >
          <IonSegmentButton value="leaderboard">
            <IonLabel style={{ fontFamily: 'serif', fontSize: '12px' }}>Leaderboard</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="scorecard">
            <IonLabel style={{ fontFamily: 'serif', fontSize: '12px' }}>Scorecard</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Leaderboard */}
        {selectedSegment === 'leaderboard' && (
          <div style={{ padding: '0 16px 20px' }}>
            {/* Header row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '50px 1fr 60px 50px 50px',
              padding: '12px 16px',
              fontSize: '10px',
              fontFamily: 'serif',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#8b7355',
              borderBottom: '2px solid #d4c4a0'
            }}>
              <div>Pos</div>
              <div>Player</div>
              <div style={{ textAlign: 'center' }}>Points</div>
              <div style={{ textAlign: 'center' }}>Thru</div>
              <div style={{ textAlign: 'center' }}>Today</div>
            </div>

            {/* Player rows */}
            {players.map((player, index) => (
              <div 
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 60px 50px 50px',
                  padding: '16px',
                  alignItems: 'center',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafaf8',
                  borderRadius: '8px',
                  marginTop: '8px',
                  border: player.position <= 3 ? `2px solid ${getPositionColor(player.position)}30` : '1px solid #e8e4da',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Position */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {getPositionIcon(player.position) && (
                    <IonIcon 
                      icon={getPositionIcon(player.position)!} 
                      style={{ 
                        fontSize: '20px',
                        color: getPositionColor(player.position)
                      }} 
                    />
                  )}
                  {!getPositionIcon(player.position) && (
                    <span style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#2a5434',
                      fontFamily: 'Georgia, serif'
                    }}>
                      {player.position}
                    </span>
                  )}
                </div>

                {/* Player name */}
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#2a5434',
                    fontFamily: 'serif'
                  }}>
                    {player.name}
                  </div>
                  {player.movement !== 'same' && (
                    <div style={{
                      fontSize: '10px',
                      color: player.movement === 'up' ? '#22c55e' : '#ef4444',
                      marginTop: '2px'
                    }}>
                      {player.movement === 'up' ? '↑' : '↓'} {player.movement === 'up' ? 'Up' : 'Down'}
                    </div>
                  )}
                </div>

                {/* Score (Points) */}
                <div style={{
                  textAlign: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: player.position === 1 ? '#b8860b' : '#2a5434',
                  fontFamily: 'Georgia, serif'
                }}>
                  {player.score}
                </div>

                {/* Thru */}
                <div style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#8b7355',
                  fontFamily: 'serif'
                }}>
                  {player.thru === 18 ? 'F' : player.thru}
                </div>

                {/* Today */}
                <div style={{
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2a5434',
                  fontFamily: 'serif'
                }}>
                  {player.today}
                </div>
              </div>
            ))}

            {/* Prize distribution */}
            <div style={{
              marginTop: '32px',
              padding: '20px',
              background: 'linear-gradient(135deg, #2a5434 0%, #3d7c47 100%)',
              borderRadius: '12px',
              color: '#f8f6f0'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontFamily: 'serif',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                margin: '0 0 16px 0',
                textAlign: 'center'
              }}>
                Prize Distribution
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                fontSize: '11px',
                fontFamily: 'serif'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#FFD700', fontSize: '16px', marginBottom: '4px' }}>1st</div>
                  <div style={{ fontWeight: 'bold' }}>$50,000</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#C0C0C0', fontSize: '16px', marginBottom: '4px' }}>2nd</div>
                  <div style={{ fontWeight: 'bold' }}>$25,000</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#CD7F32', fontSize: '16px', marginBottom: '4px' }}>3rd</div>
                  <div style={{ fontWeight: 'bold' }}>$15,000</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scorecard view */}
        {selectedSegment === 'scorecard' && (
          <div style={{ padding: '0 16px 20px' }}>
            <div className="golf-card" style={{ marginTop: '16px' }}>
              <div className="golf-header-bar" />
              <h3 style={{
                fontSize: '16px',
                color: '#2a5434',
                fontFamily: 'Georgia, serif',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                Hole-by-Hole Scoring
              </h3>
              <p style={{
                fontSize: '12px',
                color: '#8b7355',
                fontFamily: 'serif',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                Stableford Points System • Par 72
              </p>
              
              {/* Scoring explanation */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                fontSize: '11px',
                fontFamily: 'serif',
                color: '#8b7355',
                padding: '16px',
                background: '#fafaf8',
                borderRadius: '8px'
              }}>
                <div>• Eagle or better: <strong>4 pts</strong></div>
                <div>• Birdie: <strong>3 pts</strong></div>
                <div>• Par: <strong>2 pts</strong></div>
                <div>• Bogey: <strong>1 pt</strong></div>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default TournamentLeaderboard;