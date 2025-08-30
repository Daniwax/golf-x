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
              width: '100px',
              height: '100px',
              margin: '0 auto 25px',
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
                  fontSize: '50px', 
                  color: '#2a5434'
                }} 
              />
            </div>

            {/* Main title */}
            <h1 style={{
              fontSize: '28px',
              color: '#f8f6f0',
              fontFamily: 'Georgia, serif',
              fontWeight: '400',
              margin: '0 0 6px 0',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              Championship
            </h1>
            
            <div style={{
              fontSize: '36px',
              color: '#b8860b',
              fontFamily: 'Georgia, serif',
              fontWeight: '700',
              margin: '0 0 10px 0',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              letterSpacing: '2px'
            }}>
              GOLF X
            </div>

            {/* Subtitle */}
            <p style={{
              fontSize: '13px',
              color: 'rgba(248, 246, 240, 0.9)',
              fontFamily: 'serif',
              fontStyle: 'italic',
              margin: '0 0 35px 0',
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
                  background: 'linear-gradient(135deg, rgba(42, 84, 52, 0.95) 0%, rgba(61, 124, 71, 0.95) 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid rgba(184, 134, 11, 0.5)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.border = '2px solid rgba(184, 134, 11, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.border = '2px solid rgba(184, 134, 11, 0.5)';
                }}
              >
                {/* Decorative corner accent */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '60px',
                  height: '60px',
                  background: 'radial-gradient(circle at top right, rgba(184, 134, 11, 0.3) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />
                
                <IonIcon 
                  icon={addCircleOutline} 
                  style={{ 
                    fontSize: '40px', 
                    color: '#f8f6f0',
                    marginBottom: '10px',
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                  }} 
                />
                <h3 style={{
                  fontSize: '18px',
                  color: '#f8f6f0',
                  fontFamily: 'Georgia, serif',
                  margin: '0 0 8px 0',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                }}>
                  Host Championship
                </h3>
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(248, 246, 240, 0.85)',
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
                  background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.95) 0%, rgba(212, 196, 160, 0.95) 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid rgba(42, 84, 52, 0.5)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.border = '2px solid rgba(42, 84, 52, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.border = '2px solid rgba(42, 84, 52, 0.5)';
                }}
              >
                {/* Decorative corner accent */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '60px',
                  height: '60px',
                  background: 'radial-gradient(circle at top right, rgba(42, 84, 52, 0.3) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />
                
                <IonIcon 
                  icon={peopleOutline} 
                  style={{ 
                    fontSize: '40px', 
                    color: '#2a5434',
                    marginBottom: '10px',
                    filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.5))'
                  }} 
                />
                <h3 style={{
                  fontSize: '18px',
                  color: '#2a5434',
                  fontFamily: 'Georgia, serif',
                  margin: '0 0 8px 0',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  textShadow: '1px 1px 2px rgba(255, 255, 255, 0.5)'
                }}>
                  Join Championship
                </h3>
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(42, 84, 52, 0.9)',
                  fontFamily: 'serif',
                  margin: 0,
                  lineHeight: '1.4',
                  fontWeight: '500'
                }}>
                  Enter active tournaments and compete for the coveted green jacket
                </p>
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