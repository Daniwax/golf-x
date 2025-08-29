import React, { useCallback } from 'react';
import { IonRefresher, IonRefresherContent } from '@ionic/react';
import type { RefresherEventDetail } from '@ionic/react';

/**
 * Custom hook for pull-to-refresh functionality
 * Provides consistent refresh behavior across the app
 * Uses native iOS styling with custom typography
 * 
 * @param onRefresh - Async function to call when refreshing
 * @returns Object with RefresherComponent and handleRefresh function
 */
export function useRefresher(onRefresh: () => Promise<void>) {
  const handleRefresh = useCallback(async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      event.detail.complete();
    }
  }, [onRefresh]);

  // iOS-styled refresher with native appearance
  const RefresherComponent = React.memo(() => (
    <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
      <IonRefresherContent
        pullingText="Pull to refresh"
        refreshingText="Refreshing..."
      />
    </IonRefresher>
  ));

  RefresherComponent.displayName = 'RefresherComponent';

  return {
    RefresherComponent,
    handleRefresh
  };
}

/**
 * HOC (Higher Order Component) that adds pull-to-refresh to any IonContent
 * 
 * @param onRefresh - Async function to call when refreshing
 * @returns Component to wrap IonContent
 */
export function withRefresher(onRefresh: () => Promise<void>) {
  return function RefresherWrapper({ children }: { children: React.ReactNode }) {
    const { RefresherComponent } = useRefresher(onRefresh);
    
    return (
      <>
        <RefresherComponent />
        {children}
      </>
    );
  };
}