import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonIcon
} from '@ionic/react';
import { trophyOutline, addCircleOutline, peopleOutline, flagOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import '../../styles/golf_style.css';

const TournamentHub: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage className="golf-letter-container">
      <IonHeader>
        <IonToolbar style={{ '--background': 'transparent', position: 'absolute', '--border-width': '0' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" style={{ color: '#f8f6f0' }} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': 'transparent' }}>
        {/* Augusta-inspired hero section */}
        <div style={{
          background: 'linear-gradient(180deg, #0a4f2c 0%, #2a5434 50%, #3d7c47 100%)',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative pattern overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(255, 255, 255, 0.02) 35px,
              rgba(255, 255, 255, 0.02) 70px
            )`,
            pointerEvents: 'none'
          }} />

          {/* Main content */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            padding: '80px 20px 40px',
            textAlign: 'center'
          }}>
            {/* Tournament crest/logo area */}
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 30px',
              background: 'radial-gradient(circle, #f8f6f0 0%, #d4c4a0 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              border: '3px solid #b8860b'
            }}>
              <IonIcon 
                icon={trophyOutline} 
                style={{ 
                  fontSize: '60px', 
                  color: '#2a5434'
                }} 
              />
            </div>

            {/* Main title */}
            <h1 style={{
              fontSize: '36px',
              color: '#f8f6f0',
              fontFamily: 'Georgia, serif',
              fontWeight: '400',
              margin: '0 0 8px 0',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              letterSpacing: '3px',
              textTransform: 'uppercase'
            }}>
              Championship
            </h1>
            
            <div style={{
              fontSize: '42px',
              color: '#b8860b',
              fontFamily: 'Georgia, serif',
              fontWeight: '700',
              margin: '0 0 12px 0',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              letterSpacing: '2px'
            }}>
              GOLF X
            </div>

            {/* Subtitle */}
            <p style={{
              fontSize: '14px',
              color: 'rgba(248, 246, 240, 0.8)',
              fontFamily: 'serif',
              fontStyle: 'italic',
              margin: '0 0 60px 0',
              letterSpacing: '1px'
            }}>
              Est. 2025 • Where Legends Are Made
            </p>

            {/* Action cards */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              {/* Create Championship Card */}
              <div 
                onClick={() => history.push('/tournament/create')}
                style={{
                  background: 'rgba(248, 246, 240, 0.95)',
                  borderRadius: '12px',
                  padding: '30px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid #b8860b',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
                }}
              >
                <IonIcon 
                  icon={addCircleOutline} 
                  style={{ 
                    fontSize: '48px', 
                    color: '#2a5434',
                    marginBottom: '12px'
                  }} 
                />
                <h3 style={{
                  fontSize: '18px',
                  color: '#2a5434',
                  fontFamily: 'Georgia, serif',
                  margin: '0 0 8px 0',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Host Championship
                </h3>
                <p style={{
                  fontSize: '12px',
                  color: '#8b7355',
                  fontFamily: 'serif',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  Create your own tournament and invite competitors to chase glory
                </p>
              </div>

              {/* Join Championship Card */}
              <div 
                onClick={() => history.push('/tournament/leaderboard')}
                style={{
                  background: 'rgba(248, 246, 240, 0.95)',
                  borderRadius: '12px',
                  padding: '30px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid #b8860b',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
                }}
              >
                <IonIcon 
                  icon={peopleOutline} 
                  style={{ 
                    fontSize: '48px', 
                    color: '#2a5434',
                    marginBottom: '12px'
                  }} 
                />
                <h3 style={{
                  fontSize: '18px',
                  color: '#2a5434',
                  fontFamily: 'Georgia, serif',
                  margin: '0 0 8px 0',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Join Championship
                </h3>
                <p style={{
                  fontSize: '12px',
                  color: '#8b7355',
                  fontFamily: 'serif',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  Enter active tournaments and compete for the coveted green jacket
                </p>
              </div>
            </div>

            {/* Recent champions section */}
            <div style={{
              marginTop: '60px',
              padding: '20px',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <h4 style={{
                fontSize: '12px',
                color: '#b8860b',
                fontFamily: 'serif',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                margin: '0 0 16px 0'
              }}>
                Recent Champions
              </h4>
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                gap: '20px'
              }}>
                {['Masters Cup', 'Spring Classic', 'Club Championship'].map((tournament, index) => (
                  <div key={index} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '10px',
                      color: 'rgba(248, 246, 240, 0.6)',
                      fontFamily: 'serif',
                      marginBottom: '4px'
                    }}>
                      {tournament}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#f8f6f0',
                      fontFamily: 'Georgia, serif',
                      fontWeight: '600'
                    }}>
                      J. Smith
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#b8860b',
                      fontFamily: 'serif'
                    }}>
                      -12
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom decorative element */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0%, transparent 100%)'
          }} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TournamentHub;