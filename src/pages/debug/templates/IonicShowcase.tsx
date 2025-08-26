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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonChip,
  IonAvatar,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonList,
  IonToggle,
  IonRange,
  IonProgressBar,
  IonFab,
  IonFabButton,
  IonFabList,
  IonModal,
  IonSearchbar,
  IonBadge,
  IonNote,
  IonThumbnail,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import type { RefresherEventDetail } from '@ionic/react';
import {
  heartOutline,
  heart,
  shareOutline,
  bookmarkOutline,
  bookmark,
  addOutline,
  documentTextOutline,
  colorPaletteOutline,
  cameraOutline,
  logoIonic,
  chevronDownCircle
} from 'ionicons/icons';

const IonicShowcase: React.FC = () => {
  const [segment, setSegment] = useState('cards');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rangeValue, setRangeValue] = useState(50);
  const [toggleValue, setToggleValue] = useState(false);

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    setTimeout(() => {
      event.detail.complete();
    }, 2000);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/debug/templates" />
          </IonButtons>
          <IonTitle>Ionic Components</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowModal(true)}>
              <IonIcon icon={logoIonic} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircle}
            pullingText="Pull to refresh"
            refreshingSpinner="circles"
            refreshingText="Refreshing..."
          />
        </IonRefresher>

        {/* Header Info */}
        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h1 style={{ margin: 0 }}>Ionic React Showcase</h1>
          <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
            Library: <strong>@ionic/react v7.x</strong>
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.8 }}>
            Complete collection of iOS-styled components
          </p>
        </div>

        {/* Segment Control */}
        <IonSegment value={segment} onIonChange={(e) => setSegment(e.detail.value as string)}>
          <IonSegmentButton value="cards">
            <IonLabel>Cards</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="controls">
            <IonLabel>Controls</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="lists">
            <IonLabel>Lists</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <div style={{ padding: '20px' }}>
          {/* Cards Section */}
          {segment === 'cards' && (
            <>
              {/* Basic Card */}
              <IonCard>
                <img 
                  alt="Golf course" 
                  src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400" 
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
                <IonCardHeader>
                  <IonCardSubtitle>Card Subtitle</IonCardSubtitle>
                  <IonCardTitle>Beautiful Golf Course</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  This is a basic card with an image, demonstrating the standard card layout with image, header, and content sections.
                </IonCardContent>
                <div style={{ padding: '0 16px 16px', display: 'flex', gap: '10px' }}>
                  <IonButton fill="clear" onClick={() => setLiked(!liked)}>
                    <IonIcon slot="icon-only" icon={liked ? heart : heartOutline} color={liked ? 'danger' : undefined} />
                  </IonButton>
                  <IonButton fill="clear">
                    <IonIcon slot="icon-only" icon={shareOutline} />
                  </IonButton>
                  <IonButton fill="clear" onClick={() => setBookmarked(!bookmarked)}>
                    <IonIcon slot="icon-only" icon={bookmarked ? bookmark : bookmarkOutline} color={bookmarked ? 'warning' : undefined} />
                  </IonButton>
                </div>
              </IonCard>

              {/* Card with Chips */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Chip Components</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <IonChip color="primary">
                      <IonLabel>Primary</IonLabel>
                    </IonChip>
                    <IonChip color="secondary">
                      <IonLabel>Secondary</IonLabel>
                    </IonChip>
                    <IonChip color="success">
                      <IonAvatar>
                        <img alt="Avatar" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
                      </IonAvatar>
                      <IonLabel>With Avatar</IonLabel>
                    </IonChip>
                    <IonChip outline color="warning">
                      <IonLabel>Outline</IonLabel>
                    </IonChip>
                  </div>
                </IonCardContent>
              </IonCard>

              {/* Skeleton Loading Card */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Skeleton Loading</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonSkeletonText animated style={{ width: '60%' }} />
                  <IonSkeletonText animated />
                  <IonSkeletonText animated style={{ width: '80%' }} />
                </IonCardContent>
              </IonCard>
            </>
          )}

          {/* Controls Section */}
          {segment === 'controls' && (
            <>
              {/* Buttons */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Buttons</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <IonButton expand="block">Default Button</IonButton>
                    <IonButton expand="block" fill="outline">Outline Button</IonButton>
                    <IonButton expand="block" fill="clear">Clear Button</IonButton>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <IonButton color="success">Success</IonButton>
                      <IonButton color="warning">Warning</IonButton>
                      <IonButton color="danger">Danger</IonButton>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>

              {/* Form Controls */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Form Controls</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonSearchbar placeholder="Search..." />
                  
                  <IonItem lines="none">
                    <IonLabel>Toggle Switch</IonLabel>
                    <IonToggle checked={toggleValue} onIonChange={(e) => setToggleValue(e.detail.checked)} />
                  </IonItem>

                  <IonItem lines="none">
                    <IonLabel>Range Slider: {rangeValue}</IonLabel>
                  </IonItem>
                  <IonRange 
                    value={rangeValue} 
                    onIonChange={(e) => setRangeValue(e.detail.value as number)}
                    pin
                    color="primary"
                  >
                    <IonLabel slot="start">0</IonLabel>
                    <IonLabel slot="end">100</IonLabel>
                  </IonRange>
                </IonCardContent>
              </IonCard>

              {/* Progress Indicators */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Progress Indicators</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonProgressBar value={0.5} />
                  <br />
                  <IonProgressBar type="indeterminate" />
                  <br />
                  <IonProgressBar value={0.75} color="success" />
                </IonCardContent>
              </IonCard>
            </>
          )}

          {/* Lists Section */}
          {segment === 'lists' && (
            <>
              {/* Accordion */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Accordion List</IonCardTitle>
                </IonCardHeader>
                <IonAccordionGroup>
                  <IonAccordion value="first">
                    <IonItem slot="header" color="light">
                      <IonLabel>First Accordion</IonLabel>
                    </IonItem>
                    <div className="ion-padding" slot="content">
                      First accordion content with detailed information about the component.
                    </div>
                  </IonAccordion>
                  <IonAccordion value="second">
                    <IonItem slot="header" color="light">
                      <IonLabel>Second Accordion</IonLabel>
                    </IonItem>
                    <div className="ion-padding" slot="content">
                      Second accordion content with more details.
                    </div>
                  </IonAccordion>
                </IonAccordionGroup>
              </IonCard>

              {/* Media List */}
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Media List Items</IonCardTitle>
                </IonCardHeader>
                <IonList>
                  <IonItem>
                    <IonThumbnail slot="start">
                      <img alt="Thumbnail" src="https://ionicframework.com/docs/img/demos/thumbnail.svg" />
                    </IonThumbnail>
                    <IonLabel>
                      <h2>Item with Thumbnail</h2>
                      <p>Description text here</p>
                    </IonLabel>
                    <IonBadge color="success" slot="end">New</IonBadge>
                  </IonItem>
                  <IonItem>
                    <IonAvatar slot="start">
                      <img alt="Avatar" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
                    </IonAvatar>
                    <IonLabel>
                      <h2>Item with Avatar</h2>
                      <p>Supporting text</p>
                    </IonLabel>
                    <IonNote slot="end">2:45 PM</IonNote>
                  </IonItem>
                </IonList>
              </IonCard>
            </>
          )}
        </div>

        {/* FAB Button */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton>
            <IonIcon icon={addOutline} />
          </IonFabButton>
          <IonFabList side="top">
            <IonFabButton>
              <IonIcon icon={documentTextOutline} />
            </IonFabButton>
            <IonFabButton>
              <IonIcon icon={colorPaletteOutline} />
            </IonFabButton>
            <IonFabButton>
              <IonIcon icon={cameraOutline} />
            </IonFabButton>
          </IonFabList>
        </IonFab>

        {/* Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Modal Example</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <h2>This is a Modal</h2>
            <p>Modals are great for focused tasks and temporary UI.</p>
            <IonButton expand="block" onClick={() => setShowModal(false)}>
              Dismiss Modal
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default IonicShowcase;