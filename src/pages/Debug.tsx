import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonNote,
  IonItemDivider
} from '@ionic/react';
import { 
  codeSlashOutline, 
  colorPaletteOutline,
  constructOutline,
  documentTextOutline,
  layersOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const Debug: React.FC = () => {
  const history = useHistory();

  const debugSections = [
    {
      title: 'UI Components',
      items: [
        {
          name: 'Templates Gallery',
          description: 'Pre-built page templates and layouts',
          icon: colorPaletteOutline,
          path: '/debug/templates'
        },
        {
          name: 'Components Showcase',
          description: 'Individual component examples',
          icon: layersOutline,
          path: '/debug/components',
          disabled: true
        }
      ]
    },
    {
      title: 'Development Tools',
      items: [
        {
          name: 'API Explorer',
          description: 'Test Supabase API endpoints',
          icon: codeSlashOutline,
          path: '/debug/api',
          disabled: true
        },
        {
          name: 'Theme Editor',
          description: 'Live theme customization',
          icon: constructOutline,
          path: '/debug/theme',
          disabled: true
        },
        {
          name: 'Documentation',
          description: 'Component usage and guidelines',
          icon: documentTextOutline,
          path: '/debug/docs',
          disabled: true
        }
      ]
    }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Debug Tools</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Debug Tools</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonList>
          {debugSections.map((section, sectionIndex) => (
            <React.Fragment key={sectionIndex}>
              <IonItemDivider>
                <IonLabel>{section.title}</IonLabel>
              </IonItemDivider>
              {section.items.map((item, itemIndex) => (
                <IonItem
                  key={itemIndex}
                  button
                  detail
                  disabled={item.disabled}
                  onClick={() => !item.disabled && history.push(item.path)}
                >
                  <IonIcon icon={item.icon} slot="start" />
                  <IonLabel>
                    <h2>{item.name}</h2>
                    <p>{item.description}</p>
                  </IonLabel>
                  {item.disabled && (
                    <IonNote slot="end">Coming Soon</IonNote>
                  )}
                </IonItem>
              ))}
            </React.Fragment>
          ))}
        </IonList>

        <div style={{ padding: '20px', textAlign: 'center' }}>
          <IonNote>
            Debug tools for UI development and testing.
            <br />
            Use these pages for component inspiration and testing.
          </IonNote>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Debug;