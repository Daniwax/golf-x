import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
  IonChip,
  IonSpinner,
  IonButton,
  IonButtons,
  IonBackButton,
  IonText
} from '@ionic/react';
import { 
  statsChartOutline,
  golfOutline,
  trophyOutline,
} from 'ionicons/icons';
import { useAuth } from '../lib/useAuth';
import { useRefresher } from '../lib/useRefresher';
import { useHoleStats } from '../hooks/useHoleStats';

const HoleStats: React.FC = () => {
  const { user } = useAuth();
  const [selectedSegment, setSelectedSegment] = useState<string>('by-hole');
  const [selectedHole, setSelectedHole] = useState<number | null>(null);
  
  // Use the hook for all data fetching
  const { holeStats, parPerformance, loading, refresh } = useHoleStats(user?.id);

  const { RefresherComponent } = useRefresher(refresh);

  const getScoreColor = (scoreToPar: number) => {
    if (scoreToPar < 0) return 'success';
    if (scoreToPar === 0) return 'primary';
    if (scoreToPar === 1) return 'warning';
    return 'danger';
  };


  const renderEmptyState = () => (
    <IonCard>
      <IonCardContent className="ion-text-center" style={{ padding: '40px 20px' }}>
        <IonIcon 
          icon={golfOutline} 
          style={{ fontSize: '64px', color: 'var(--ion-color-medium)' }}
        />
        <h2 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--ion-color-medium)' }}>
          No Statistics Yet
        </h2>
        <IonText color="medium">
          <p style={{ margin: '0' }}>
            Play some rounds to see your hole-by-hole statistics here.
          </p>
          <p style={{ marginTop: '10px' }}>
            Start a new game to begin tracking your performance!
          </p>
        </IonText>
      </IonCardContent>
    </IonCard>
  );

  const renderHoleStats = () => {
    if (holeStats.length === 0) {
      return renderEmptyState();
    }

    const selectedHoleData = selectedHole 
      ? holeStats.find(h => h.holeNumber === selectedHole)
      : null;

    return (
      <div>
        {/* Hole Selector Grid */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Select Hole</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                {Array.from({ length: 18 }, (_, i) => i + 1).map((hole) => {
                  const stats = holeStats.find(h => h.holeNumber === hole);
                  const hasData = stats && stats.totalRounds > 0;
                  
                  return (
                    <IonCol size="2" key={hole}>
                      <IonButton
                        expand="block"
                        fill={selectedHole === hole ? 'solid' : 'outline'}
                        color={selectedHole === hole ? 'primary' : hasData ? 'medium' : 'light'}
                        onClick={() => setSelectedHole(hole)}
                        disabled={!hasData}
                        style={{ 
                          height: '40px',
                          fontSize: '14px',
                          fontWeight: selectedHole === hole ? 'bold' : 'normal'
                        }}
                      >
                        {hole}
                      </IonButton>
                    </IonCol>
                  );
                })}
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* Selected Hole Details */}
        {selectedHoleData ? (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Hole {selectedHole} Performance</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol size="6">
                      <div style={{ textAlign: 'center', padding: '10px' }}>
                        <IonText color="medium">
                          <p style={{ margin: '0 0 5px 0', fontSize: '12px' }}>Avg Score</p>
                        </IonText>
                        <h2 style={{ margin: '0', fontSize: '28px' }}>
                          {selectedHoleData.averageScore.toFixed(1)}
                        </h2>
                        <IonText color="medium">
                          <p style={{ margin: '5px 0 0 0', fontSize: '11px' }}>
                            {selectedHoleData.totalRounds} rounds
                          </p>
                        </IonText>
                      </div>
                    </IonCol>
                    <IonCol size="6">
                      <div style={{ textAlign: 'center', padding: '10px' }}>
                        <IonText color="medium">
                          <p style={{ margin: '0 0 5px 0', fontSize: '12px' }}>Avg Putts</p>
                        </IonText>
                        <h2 style={{ margin: '0', fontSize: '28px' }}>
                          {selectedHoleData.averagePutts > 0 
                            ? selectedHoleData.averagePutts.toFixed(1)
                            : 'N/A'}
                        </h2>
                        <IonText color="medium">
                          <p style={{ margin: '5px 0 0 0', fontSize: '11px' }}>
                            Best: {selectedHoleData.bestScore}
                          </p>
                        </IonText>
                      </div>
                    </IonCol>
                  </IonRow>
                </IonGrid>

                {/* Scoring Distribution */}
                <div style={{ marginTop: '20px' }}>
                  <IonText color="medium">
                    <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>
                      SCORING DISTRIBUTION
                    </p>
                  </IonText>
                  {selectedHoleData.scoringDistribution.map((score, index) => (
                    <div key={index} style={{ marginBottom: '15px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '5px' 
                      }}>
                        <IonLabel>{score.label}</IonLabel>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <IonNote color="medium">{score.value} times</IonNote>
                          <IonChip 
                            color={
                              score.label === 'Eagle' ? 'success' :
                              score.label === 'Birdie' ? 'success' :
                              score.label === 'Par' ? 'primary' :
                              score.label === 'Bogey' ? 'warning' : 'danger'
                            }
                            style={{ height: '20px', fontSize: '11px' }}
                          >
                            {score.percentage.toFixed(0)}%
                          </IonChip>
                        </div>
                      </div>
                      <IonProgressBar 
                        value={score.percentage / 100} 
                        color={
                          score.label === 'Eagle' || score.label === 'Birdie' ? 'success' :
                          score.label === 'Par' ? 'primary' :
                          score.label === 'Bogey' ? 'warning' : 'danger'
                        }
                      />
                    </div>
                  ))}
                </div>
              </IonCardContent>
            </IonCard>
          </>
        ) : selectedHole && (
          <IonCard>
            <IonCardContent className="ion-text-center" style={{ padding: '30px' }}>
              <IonText color="medium">
                <p>No data available for Hole {selectedHole}</p>
                <p style={{ fontSize: '14px', marginTop: '10px' }}>
                  Play this hole to start tracking statistics
                </p>
              </IonText>
            </IonCardContent>
          </IonCard>
        )}

        {/* Overall Summary */}
        {holeStats.length > 0 && !selectedHole && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Overall Hole Performance</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonIcon icon={trophyOutline} slot="start" color="success" />
                <IonLabel>
                  <h3>Best Performing Hole</h3>
                  <p>
                    {(() => {
                      const validHoles = holeStats.filter(h => h.totalRounds > 0);
                      if (validHoles.length === 0) return 'No data yet';
                      const best = validHoles.reduce((prev, current) => 
                        current.averageScore < prev.averageScore ? current : prev
                      );
                      return `Hole ${best.holeNumber} - Avg: ${best.averageScore.toFixed(1)}`;
                    })()}
                  </p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={flagOutline} slot="start" color="danger" />
                <IonLabel>
                  <h3>Most Challenging Hole</h3>
                  <p>
                    {(() => {
                      const validHoles = holeStats.filter(h => h.totalRounds > 0);
                      if (validHoles.length === 0) return 'No data yet';
                      const worst = validHoles.reduce((prev, current) => 
                        current.averageScore > prev.averageScore ? current : prev
                      );
                      return `Hole ${worst.holeNumber} - Avg: ${worst.averageScore.toFixed(1)}`;
                    })()}
                  </p>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={statsChartOutline} slot="start" color="primary" />
                <IonLabel>
                  <h3>Total Holes Played</h3>
                  <p>{holeStats.reduce((sum, h) => sum + h.totalRounds, 0)} holes</p>
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>
        )}
      </div>
    );
  };

  const renderParPerformance = () => {
    if (parPerformance.length === 0) {
      return renderEmptyState();
    }

    return (
      <div>
        {parPerformance.map((par) => (
          <IonCard key={par.parType}>
            <IonCardHeader>
              <IonCardTitle>Par {par.parType} Holes</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol size="4">
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ margin: '0' }}>{par.averageScore.toFixed(1)}</h3>
                      <IonNote style={{ fontSize: '11px' }}>Avg Score</IonNote>
                    </div>
                  </IonCol>
                  <IonCol size="4">
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ 
                        margin: '0',
                        color: `var(--ion-color-${getScoreColor(par.averageScoreToPar)})`
                      }}>
                        {par.averageScoreToPar > 0 ? '+' : ''}{par.averageScoreToPar.toFixed(1)}
                      </h3>
                      <IonNote style={{ fontSize: '11px' }}>vs Par</IonNote>
                    </div>
                  </IonCol>
                  <IonCol size="4">
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ margin: '0' }}>{par.totalHoles}</h3>
                      <IonNote style={{ fontSize: '11px' }}>Holes Played</IonNote>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>

              <div style={{ marginTop: '20px' }}>
                <IonText color="medium">
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>
                    SCORING BREAKDOWN
                  </p>
                </IonText>
                <IonGrid>
                  <IonRow>
                    {par.scoringDistribution.eagles > 0 && (
                      <IonCol size="4">
                        <div style={{ textAlign: 'center' }}>
                          <IonChip color="success" style={{ width: '100%' }}>
                            <IonLabel>{par.scoringDistribution.eagles}</IonLabel>
                          </IonChip>
                          <IonNote style={{ display: 'block', fontSize: '10px', marginTop: '4px' }}>
                            Eagles
                          </IonNote>
                        </div>
                      </IonCol>
                    )}
                    {par.scoringDistribution.birdies > 0 && (
                      <IonCol size="4">
                        <div style={{ textAlign: 'center' }}>
                          <IonChip color="success" style={{ width: '100%' }}>
                            <IonLabel>{par.scoringDistribution.birdies}</IonLabel>
                          </IonChip>
                          <IonNote style={{ display: 'block', fontSize: '10px', marginTop: '4px' }}>
                            Birdies
                          </IonNote>
                        </div>
                      </IonCol>
                    )}
                    <IonCol size="4">
                      <div style={{ textAlign: 'center' }}>
                        <IonChip color="primary" style={{ width: '100%' }}>
                          <IonLabel>{par.scoringDistribution.pars}</IonLabel>
                        </IonChip>
                        <IonNote style={{ display: 'block', fontSize: '10px', marginTop: '4px' }}>
                          Pars
                        </IonNote>
                      </div>
                    </IonCol>
                    <IonCol size="4">
                      <div style={{ textAlign: 'center' }}>
                        <IonChip color="warning" style={{ width: '100%' }}>
                          <IonLabel>{par.scoringDistribution.bogeys}</IonLabel>
                        </IonChip>
                        <IonNote style={{ display: 'block', fontSize: '10px', marginTop: '4px' }}>
                          Bogeys
                        </IonNote>
                      </div>
                    </IonCol>
                    <IonCol size="4">
                      <div style={{ textAlign: 'center' }}>
                        <IonChip color="danger" style={{ width: '100%' }}>
                          <IonLabel>{par.scoringDistribution.doubleBogeys}</IonLabel>
                        </IonChip>
                        <IonNote style={{ display: 'block', fontSize: '10px', marginTop: '4px' }}>
                          Doubles
                        </IonNote>
                      </div>
                    </IonCol>
                    {par.scoringDistribution.others > 0 && (
                      <IonCol size="4">
                        <div style={{ textAlign: 'center' }}>
                          <IonChip color="danger" style={{ width: '100%' }}>
                            <IonLabel>{par.scoringDistribution.others}</IonLabel>
                          </IonChip>
                          <IonNote style={{ display: 'block', fontSize: '10px', marginTop: '4px' }}>
                            Others
                          </IonNote>
                        </div>
                      </IonCol>
                    )}
                  </IonRow>
                </IonGrid>
              </div>
            </IonCardContent>
          </IonCard>
        ))}

        {/* Overall Par Performance Summary */}
        {parPerformance.length > 0 && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Overall Performance</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel>
                  <h3>Total Score Distribution</h3>
                </IonLabel>
              </IonItem>
              <div style={{ padding: '10px' }}>
                {(() => {
                  const totals = parPerformance.reduce((acc, par) => ({
                    eagles: acc.eagles + par.scoringDistribution.eagles,
                    birdies: acc.birdies + par.scoringDistribution.birdies,
                    pars: acc.pars + par.scoringDistribution.pars,
                    bogeys: acc.bogeys + par.scoringDistribution.bogeys,
                    doubleBogeys: acc.doubleBogeys + par.scoringDistribution.doubleBogeys,
                    others: acc.others + par.scoringDistribution.others
                  }), { eagles: 0, birdies: 0, pars: 0, bogeys: 0, doubleBogeys: 0, others: 0 });

                  const totalShots = Object.values(totals).reduce((a, b) => a + b, 0);
                  
                  return (
                    <>
                      {totals.eagles > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <IonLabel>Eagles</IonLabel>
                            <IonNote>{totals.eagles} ({(totals.eagles / totalShots * 100).toFixed(1)}%)</IonNote>
                          </div>
                          <IonProgressBar value={totals.eagles / totalShots} color="success" />
                        </div>
                      )}
                      {totals.birdies > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <IonLabel>Birdies</IonLabel>
                            <IonNote>{totals.birdies} ({(totals.birdies / totalShots * 100).toFixed(1)}%)</IonNote>
                          </div>
                          <IonProgressBar value={totals.birdies / totalShots} color="success" />
                        </div>
                      )}
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <IonLabel>Pars</IonLabel>
                          <IonNote>{totals.pars} ({(totals.pars / totalShots * 100).toFixed(1)}%)</IonNote>
                        </div>
                        <IonProgressBar value={totals.pars / totalShots} color="primary" />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <IonLabel>Bogeys</IonLabel>
                          <IonNote>{totals.bogeys} ({(totals.bogeys / totalShots * 100).toFixed(1)}%)</IonNote>
                        </div>
                        <IonProgressBar value={totals.bogeys / totalShots} color="warning" />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <IonLabel>Double Bogeys</IonLabel>
                          <IonNote>{totals.doubleBogeys} ({(totals.doubleBogeys / totalShots * 100).toFixed(1)}%)</IonNote>
                        </div>
                        <IonProgressBar value={totals.doubleBogeys / totalShots} color="danger" />
                      </div>
                      {totals.others > 0 && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <IonLabel>Others</IonLabel>
                            <IonNote>{totals.others} ({(totals.others / totalShots * 100).toFixed(1)}%)</IonNote>
                          </div>
                          <IonProgressBar value={totals.others / totalShots} color="danger" />
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </IonCardContent>
          </IonCard>
        )}
      </div>
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/stats" />
          </IonButtons>
          <IonTitle>Hole Statistics</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Hole Statistics</IonTitle>
          </IonToolbar>
        </IonHeader>

        <RefresherComponent />

        <div className="ion-padding">
          <IonSegment 
            value={selectedSegment} 
            onIonChange={e => {
              setSelectedSegment(e.detail.value as string);
              setSelectedHole(null);
            }}
            style={{ marginBottom: '16px' }}
          >
            <IonSegmentButton value="by-hole">
              <IonLabel>By Hole</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="by-par">
              <IonLabel>By Par</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <IonSpinner />
            </div>
          ) : (
            <>
              {selectedSegment === 'by-hole' && renderHoleStats()}
              {selectedSegment === 'by-par' && renderParPerformance()}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HoleStats;