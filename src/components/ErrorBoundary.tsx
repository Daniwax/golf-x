import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText
} from '@ionic/react';
import { alertCircleOutline, refreshOutline } from 'ionicons/icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, you would log this to an error reporting service
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    // Reload the page to reset the app state
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <IonPage>
          <IonContent className="ion-padding">
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              textAlign: 'center'
            }}>
              <IonIcon 
                icon={alertCircleOutline} 
                style={{ 
                  fontSize: '64px', 
                  color: 'var(--ion-color-danger)',
                  marginBottom: '20px'
                }} 
              />
              
              <IonCard style={{ maxWidth: '500px', width: '100%' }}>
                <IonCardHeader>
                  <IonCardTitle>Oops! Something went wrong</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonText>
                    <p>We're sorry, but something unexpected happened.</p>
                    <p>Please try refreshing the page or contact support if the problem persists.</p>
                  </IonText>
                  
                  {import.meta.env.DEV && this.state.error && (
                    <div style={{ 
                      marginTop: '20px', 
                      padding: '10px', 
                      background: '#f4f4f4', 
                      borderRadius: '8px',
                      textAlign: 'left'
                    }}>
                      <IonText color="danger">
                        <strong>Error Details (Development Only):</strong>
                        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                          {this.state.error.toString()}
                          {this.state.errorInfo?.componentStack}
                        </pre>
                      </IonText>
                    </div>
                  )}
                  
                  <IonButton 
                    expand="block" 
                    onClick={this.handleReset}
                    style={{ marginTop: '20px' }}
                  >
                    <IonIcon slot="start" icon={refreshOutline} />
                    Refresh Page
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </div>
          </IonContent>
        </IonPage>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;