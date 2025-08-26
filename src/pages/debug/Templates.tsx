import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
  IonBackButton,
  IonBadge
} from '@ionic/react';
import { useHistory } from 'react-router-dom';

interface Template {
  id: string;
  name: string;
  description: string;
  library: string;
  components: string[];
  path: string;
  preview?: string;
  category: string;
}

const Templates: React.FC = () => {
  const history = useHistory();

  const templates: Template[] = [
    {
      id: 'ionic-showcase',
      name: 'Ionic Components Showcase',
      description: 'Complete showcase of Ionic React components with iOS styling',
      library: 'Ionic React',
      components: ['IonCard', 'IonButton', 'IonSegment', 'IonModal', 'IonAccordion', 'IonFab'],
      path: '/debug/templates/ionic-showcase',
      category: 'Component Gallery',
      preview: '🎨'
    },
    {
      id: 'dashboard-cards',
      name: 'Dashboard with Cards',
      description: 'Modern dashboard layout with stats cards and charts',
      library: 'Ionic React',
      components: ['IonCard', 'IonGrid', 'IonProgressBar', 'IonBadge'],
      path: '/debug/templates/dashboard-cards',
      category: 'Layouts',
      preview: '📊'
    },
    {
      id: 'form-elements',
      name: 'Form Elements',
      description: 'All form inputs and controls in one page',
      library: 'Ionic React',
      components: ['IonInput', 'IonSelect', 'IonToggle', 'IonRadio', 'IonCheckbox', 'IonRange'],
      path: '/debug/templates/form-elements',
      category: 'Forms',
      preview: '📝'
    },
    {
      id: 'lists-collection',
      name: 'Lists & Collections',
      description: 'Various list styles and item layouts',
      library: 'Ionic React',
      components: ['IonList', 'IonItemSliding', 'IonReorder', 'IonVirtualScroll'],
      path: '/debug/templates/lists-collection',
      category: 'Lists',
      preview: '📋'
    }
  ];

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/debug" />
          </IonButtons>
          <IonTitle>UI Templates</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">UI Templates</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div style={{ padding: '20px' }}>
          {categories.map(category => (
            <div key={category} style={{ marginBottom: '30px' }}>
              <h2 style={{ marginBottom: '15px', paddingLeft: '5px' }}>{category}</h2>
              <IonGrid>
                <IonRow>
                  {templates
                    .filter(t => t.category === category)
                    .map(template => (
                      <IonCol size="12" sizeMd="6" sizeLg="4" key={template.id}>
                        <IonCard 
                          button 
                          onClick={() => history.push(template.path)}
                          style={{ height: '100%', cursor: 'pointer' }}
                        >
                          <IonCardHeader>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '40px' }}>{template.preview}</span>
                              <IonBadge color="primary">{template.library}</IonBadge>
                            </div>
                            <IonCardTitle>{template.name}</IonCardTitle>
                            <IonCardSubtitle>{template.description}</IonCardSubtitle>
                          </IonCardHeader>
                          <IonCardContent>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                              {template.components.map(component => (
                                <IonChip key={component} outline color="medium">
                                  <IonLabel>{component}</IonLabel>
                                </IonChip>
                              ))}
                            </div>
                          </IonCardContent>
                        </IonCard>
                      </IonCol>
                    ))}
                </IonRow>
              </IonGrid>
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Templates;