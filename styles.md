        665 -            {/* Tee Selector */}
        666 -            <div style={{ padding: '20px 0' }}>
        667 -              <IonSegment 
        668 -                value={selectedStatsTee} 
        669 -                onIonChange={e => setSelectedStatsTee(e.detail.value === 'all' ? null : e.detail.value)}
        670 -                className="premium-segment"
        671 -                style={{
        672 -                  background: 'rgba(255, 255, 255, 0.05)',
        673 -                  borderRadius: '12px',
        674 -                  padding: '4px'
        675 -                }}
        624 +    const renderStats = () => (
        625 +      <div className="space-y-4 pb-20">
        626 +        {/* Tee Filter */}
        627 +        <div className="bg-white rounded-lg p-3 shadow-sm">
        628 +          <p className="text-sm text-gray-600 mb-2">Filter by Tee Box</p>
        629 +          <div className="flex space-x-2 overflow-x-auto">
        630 +            <button
        631 +              onClick={() => setSelectedStatsTee(null)}
        632 +              className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
        633 +                selectedStatsTee === null
        634 +                  ? 'bg-blue-500 text-white'
        635 +                  : 'bg-gray-100 text-gray-700'
        636 +              }`}
        637 +            >
        638 +              All Tees
        639 +            </button>
        640 +            {teeBoxes.map((tee) => (
        641 +              <button
        642 +                key={tee.id}
        643 +                onClick={() => setSelectedStatsTee(tee.id)}
        644 +                className={`px-3 py-2 rounded-lg flex items-center space-x-2 whitespace-nowrap transition-all ${
        645 +                  selectedStatsTee === tee.id
        646 +                    ? 'bg-blue-500 text-white'
        647 +                    : 'bg-gray-100 text-gray-700'
        648 +                }`}
        649                >
        650 -                <IonSegmentButton value="all">
        651 -                  <IonLabel style={{ fontSize: '12px', fontWeight: '500' }}>All</IonLabel>
        652 -                </IonSegmentButton>
        653 -                {teeBoxes.map(tee => (
        654 -                  <IonSegmentButton key={tee.id} value={tee.id}>
        655 -                    <IonLabel style={{ fontSize: '12px', fontWeight: '500' }}>{tee.name}</IonLabel>
        656 -                  </IonSegmentButton>
        657 -                ))}
        658 -              </IonSegment>
        659 -            </div>
        660 -  
        661 -            <div className="no-stats">
        662 -              <p>No games played {selectedStatsTee ? 'from this tee' : ''} on this course yet</p>
        663 -            </div>
        650 +                <div
        651 +                  className="w-4 h-4 rounded-full border border-gray-300"
        652 +                  style={{ backgroundColor: getTeeColor(tee.color) }}
        653 +                />
        654 +                <span className="text-sm">{tee.name}</span>
        655 +              </button>
        656 +            ))}
        657            </div>
        658 -        );
        659 -      }
        658 +        </div>
        659    
        660 -      return (
        661 -        <div className="player-stats-content">
        662 -          <h2 className="section-title">
        663 -            <User size={20} />
        664 -            Your Performance
        665 -          </h2>
        666 -  
        667 -          {/* Tee Selector */}
        668 -          <div style={{ padding: '20px 0' }}>
        669 -            <IonSegment 
        670 -              value={selectedStatsTee === null ? 'all' : selectedStatsTee} 
        671 -              onIonChange={e => setSelectedStatsTee(e.detail.value === 'all' ? null : e.detail.value)}
        672 -              className="premium-segment"
        673 -              style={{
        674 -                background: 'rgba(255, 255, 255, 0.05)',
        675 -                borderRadius: '12px',
        676 -                padding: '4px'
        677 -              }}
        678 -            >
        679 -              <IonSegmentButton value="all">
        680 -                <IonLabel style={{ fontSize: '12px', fontWeight: '500' }}>All</IonLabel>
        681 -              </IonSegmentButton>
        682 -              {teeBoxes.map(tee => (
        683 -                <IonSegmentButton key={tee.id} value={tee.id}>
        684 -                  <IonLabel style={{ fontSize: '12px', fontWeight: '500' }}>{tee.name}</IonLabel>
        685 -                </IonSegmentButton>
        686 -              ))}
        687 -            </IonSegment>
        688 -          </div>
        689 -  
        690 -          {/* Performance Stats Grid */}
        691 -          <div className="stats-grid">
        692 -            <div className="stat-card">
        693 -              <Trophy className="stat-icon" size={24} />
        694 -              <div className="stat-info">
        695 -                <span className="stat-value">{filteredStats.gamesPlayed}</span>
        696 -                <span className="stat-label">Games Played</span>
        660 +        {processedStats ? (
        661 +          <>
        662 +            {/* Summary Stats */}
        663 +            <div className="grid grid-cols-2 gap-4">
        664 +              <div className="bg-white rounded-lg p-4 shadow-sm">
        665 +                <div className="flex items-center space-x-3">
        666 +                  <Trophy className="text-yellow-500" size={24} />
        667 +                  <div>
        668 +                    <p className="text-sm text-gray-500">Best Score</p>
        669 +                    <p className="text-xl font-bold">{processedStats.bestScore || '-'}</p>
        670 +                  </div>
        671 +                </div>
        672                </div>
        673 -            </div>
        674 -  
        675 -            <div className="stat-card">
        676 -              <Star className="stat-icon" size={24} />
        677 -              <div className="stat-info">
        678 -                <span className="stat-value">{filteredStats.bestScore || 'N/A'}</span>
        679 -                <span className="stat-label">Best Score</span>
        673 +              <div className="bg-white rounded-lg p-4 shadow-sm">
        674 +                <div className="flex items-center space-x-3">
        675 +                  <BarChart3 className="text-blue-500" size={24} />
        676 +                  <div>
        677 +                    <p className="text-sm text-gray-500">Avg Score</p>
        678 +                    <p className="text-xl font-bold">
        679 +                      {processedStats.averageScore?.toFixed(1) || '-'}
        680 +                    </p>
        681 +                  </div>
        682 +                </div>
        683                </div>
        684 -            </div>
        685 -  
        686 -            <div className="stat-card">
        687 -              <BarChart3 className="stat-icon" size={24} />
        688 -              <div className="stat-info">
        689 -                <span className="stat-value">{filteredStats.averageScore || 'N/A'}</span>
        690 -                <span className="stat-label">Average Score</span>
        684 +              <div className="bg-white rounded-lg p-4 shadow-sm">
        685 +                <div className="flex items-center space-x-3">
        686 +                  <Target className="text-green-500" size={24} />
        687 +                  <div>
        688 +                    <p className="text-sm text-gray-500">Rounds Played</p>
        689 +                    <p className="text-xl font-bold">{processedStats.totalRounds}</p>
        690 +                  </div>
        691 +                </div>
        692                </div>
        693 -            </div>
        694 -  
        695 -            <div className="stat-card">
        696 -              <Target className="stat-icon" size={24} />
        697 -              <div className="stat-info">
        698 -                <span className="stat-value">{filteredStats.bestPutts || 'N/A'}</span>
        699 -                <span className="stat-label">Best Putts</span>
        693 +              <div className="bg-white rounded-lg p-4 shadow-sm">
        694 +                <div className="flex items-center space-x-3">
        695 +                  <Flag className="text-purple-500" size={24} />
        696 +                  <div>
        697 +                    <p className="text-sm text-gray-500">Avg Putts</p>
        698 +                    <p className="text-xl font-bold">
        699 +                      {processedStats.averagePutts?.toFixed(1) || '-'}
        700 +                    </p>
        701 +                  </div>
        702 +                </div>
        703                </div>
        704              </div>
        705    
        706 -            <div className="stat-card">
        707 -              <TrendingUp className="stat-icon" size={24} />
        708 -              <div className="stat-info">
        709 -                <span className="stat-value">{filteredStats.averagePutts || 'N/A'}</span>
        710 -                <span className="stat-label">Avg Putts</span>
        706 +            {/* Score Trend Chart */}
        707 +            {processedStats.recentRounds.length > 0 && (
        708 +              <div className="bg-white rounded-lg p-4 shadow-sm">
        709 +                <h3 className="font-semibold text-lg mb-4">Recent Rounds</h3>
        710 +                <ResponsiveContainer width="100%" height={200}>
        711 +                  <ComposedChart data={processedStats.recentRounds}>
        712 +                    <CartesianGrid strokeDasharray="3 3" />
        713 +                    <XAxis dataKey="round" />
        714 +                    <YAxis />
        715 +                    <Tooltip />
        716 +                    <Legend />
        717 +                    <Bar dataKey="strokes" fill="#3B82F6" name="Strokes" />
        718 +                    <Line type="monotone" dataKey="putts" stroke="#10B981" name="Putts" />
        719 +                    <ReferenceLine 
        720 +                      y={course.par} 
        721 +                      stroke="#EF4444" 
        722 +                      strokeDasharray="5 5"
        723 +                      label="Par"
        724 +                    />
        725 +                  </ComposedChart>
        726 +                </ResponsiveContainer>
        727                </div>
        728 -            </div>
        728 +            )}
        729    
        730 -            <div className="stat-card">
        731 -              <Award className="stat-icon" size={24} />
        732 -              <div className="stat-info">
        733 -                <span className="stat-value">{filteredStats.bestNetScore || 'N/A'}</span>
        734 -                <span className="stat-label">Best Net</span>
        735 -              </div>
        736 -            </div>
        737 -          </div>
        738 -  
        739 -          {/* Match Play Stats */}
        740 -          <div className="info-section">
        741 -            <h2 className="section-title">
        742 -              <Flag size={20} />
        743 -              Match Play Record
        744 -            </h2>
        745 -
        746 -            <div className="info-grid">
        747 -              <div className="info-item">
        748 -                <span className="info-label">Holes Won</span>
        749 -                <span className="info-value">{filteredStats.totalHolesWon || 0}</span>
        750 -              </div>
        751 -              <div className="info-item">
        752 -                <span className="info-label">Holes Lost</span>
        753 -                <span className="info-value">{filteredStats.totalHolesLost || 0}</span>
        754 -              </div>
        755 -              <div className="info-item">
        756 -                <span className="info-label">Holes Halved</span>
        757 -                <span className="info-value">{filteredStats.totalHolesHalved || 0}</span>
        758 -              </div>
        759 -              <div className="info-item">
        760 -                <span className="info-label">Last Played</span>
        761 -                <span className="info-value">
        762 -                  {filteredStats.lastPlayed ? 
        763 -                    new Date(filteredStats.lastPlayed).toLocaleDateString() : 
        764 -                    'Never'
        765 -                  }
        766 -                </span>
        767 -              </div>
        768 -            </div>
        769 -          </div>
        770 -  
        771 -          {/* Playing Partners */}
        772 -          {filteredStats.mostFrequentPartner && (
        773 -            <div className="club-section">
        774 -              <h2 className="section-title">
        775 -                <UserCheck size={20} />
        776 -                Frequent Playing Partner
        777 -              </h2>
        778 -
        779 -              <div className="partner-card">
        780 -                <User size={32} className="partner-icon" />
        781 -                <div className="partner-info">
        782 -                  <h3>{filteredStats.mostFrequentPartner.name}</h3>
        783 -                  <p>{filteredStats.mostFrequentPartner.count} games together</p>
        730 +            {/* Score Distribution */}
        731 +            <div className="bg-white rounded-lg p-4 shadow-sm">
        732 +              <h3 className="font-semibold text-lg mb-4">Score Range</h3>
        733 +              <div className="space-y-3">
        734 +                <div className="flex items-center justify-between">
        735 +                  <span className="text-sm text-gray-600">Best</span>
        736 +                  <span className="font-bold text-green-600">
        737 +                    {processedStats.bestScore || '-'}
        738 +                  </span>
        739                  </div>
        740 +                <div className="flex items-center justify-between">
        741 +                  <span className="text-sm text-gray-600">Average</span>
        742 +                  <span className="font-bold">
        743 +                    {processedStats.averageScore?.toFixed(1) || '-'}
        744 +                  </span>
        745 +                </div>
        746 +                <div className="flex items-center justify-between">
        747 +                  <span className="text-sm text-gray-600">Worst</span>
        748 +                  <span className="font-bold text-red-600">
        749 +                    {processedStats.worstScore || '-'}
        750 +                  </span>
        751 +                </div>
        752 +                <div className="flex items-center justify-between">
        753 +                  <span className="text-sm text-gray-600">vs Par</span>
        754 +                  <span className="font-bold">
        755 +                    {processedStats.averageScore 
        756 +                      ? `${processedStats.averageScore > course.par ? '+' : ''}${(processedStats.averageScore - course.par).toFixed(1)}`
        757 +                      : '-'}
        758 +                  </span>
        759 +                </div>
        760                </div>
        761              </div>
        762 -          )}
        763 -        </div>
        764 -      );
        765 -    };
        766 -  
        767 -    if (loading) {
        768 -      return (
        769 -        <IonPage className="course-detail">
        770 -          <IonContent fullscreen style={{ '--background': '#0f1a0f' }}>
        771 -            <div style={{
        772 -              display: 'flex',
        773 -              flexDirection: 'column',
        774 -              alignItems: 'center',
        775 -              justifyContent: 'center',
        776 -              minHeight: '100vh',
        777 -              background: 'linear-gradient(135deg, #0f1a0f 0%, #1e2d1e 100%)'
        778 -            }}>
        779 -              <div style={{
        780 -                display: 'flex',
        781 -                flexDirection: 'column',
        782 -                alignItems: 'center',
        783 -                gap: '24px',
        784 -                padding: '40px',
        785 -                background: 'linear-gradient(135deg, #1a252f 0%, #141f28 100%)',
        786 -                borderRadius: '24px',
        787 -                border: '1px solid rgba(255, 215, 0, 0.2)',
        788 -                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        789 -              }}>
        790 -                <IonSpinner 
        791 -                  name="crescent" 
        792 -                  style={{
        793 -                    '--color': '#ffd700',
        794 -                    width: '60px',
        795 -                    height: '60px'
        796 -                  }} 
        797 -                />
        798 -                <p style={{
        799 -                  color: '#ffd700',
        800 -                  fontSize: '16px',
        801 -                  fontWeight: '500',
        802 -                  letterSpacing: '0.5px',
        803 -                  textTransform: 'uppercase',
        804 -                  margin: 0
        805 -                }}>
        806 -                  Loading Course Details
        807 -                </p>
        808 -              </div>
        809 -            </div>
        810 -          </IonContent>
        811 -        </IonPage>
        812 -      );
        813 -    }
        814 -  
        815 -    if (error || !course) {
        816 -      return (
        817 -        <IonPage className="course-detail">
        818 -          <div className="error-container">
        819 -            <p>Unable to load course details</p>
        762 +          </>
        763 +        ) : (
        764 +          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
        765 +            <Trophy className="mx-auto text-gray-300 mb-4" size={48} />
        766 +            <p className="text-gray-500">No stats available</p>
        767 +            <p className="text-sm text-gray-400 mt-2">
        768 +              Play some rounds to see your statistics
        769 +            </p>
        770            </div>
        771 -        </IonPage>
        772 -      );
        773 -    }
        771 +        )}
        772 +      </div>
        773 +    );
        774    
        775      return (
        776 -      <IonPage className="course-detail-3">
        777 -        <IonHeader className="green-header">
        776 +      <IonPage>
        777 +        <IonHeader>
        778            <IonToolbar>
        779              <IonButtons slot="start">
        780                <IonBackButton defaultHref="/courses" />
        781              </IonButtons>
        782 -            <div className="course-header-title">
        783 -              {course ? course.name : 'Course Details'}
        784 -            </div>
        782            </IonToolbar>
        783          </IonHeader>
        784    
        785 -        <IonContent fullscreen className="premium-content">
        786 -          {/* Course Header with Background Image */}
        787 -          <div 
        788 -            className="course-header-section"
        789 -            style={{
        790 -              backgroundImage: courseImage ? `url(${courseImage})` : 'none'
        791 -            }}
        792 -          >
        793 -            <div className="course-header-overlay" />
        794 -            <div className="course-header-content">
        795 -              <div className="course-badge">{course.course_type.replace('-', ' ').toUpperCase()}</div>
        796 -              <h1 className="course-title">{course.name}</h1>
        797 -              <p className="club-title">{course.golf_clubs.name}</p>
        798 -              <div className="course-basic-stats">
        799 -                <span>Par {course.par}</span>
        800 -                <span className="separator">•</span>
        801 -                <span>{course.holes} Holes</span>
        802 -                <span className="separator">•</span>
        803 -                <span>{course.golf_clubs.city}</span>
        804 -              </div>
        805 -            </div>
        806 -          </div>
        807 -  
        808 -          {/* Segments */}
        809 -          <div className="segment-container">
        785 +        <IonContent fullscreen>
        786 +          <div className="p-4">
        787 +            {/* Segment Control */}
        788              <IonSegment 
        789                value={selectedSegment} 
        790 -              onIonChange={e => setSelectedSegment(e.detail.value!)}
        791 -              className="premium-segment"
        790 +              onIonChange={e => setSelectedSegment(e.detail.value as string)}
        791 +              className="mb-4"
        792              >
        793                <IonSegmentButton value="overview">
        794 -                <Eye size={18} />
        794 +                <IonLabel>Overview</IonLabel>
        795                </IonSegmentButton>
        796 -              <IonSegmentButton value="holes">
        797 -                <Flag size={18} />
        796 +              <IonSegmentButton value="scorecard">
        797 +                <IonLabel>Scorecard</IonLabel>
        798                </IonSegmentButton>
        799 +              <IonSegmentButton value="tees">
        800 +                <IonLabel>Tees</IonLabel>
        801 +              </IonSegmentButton>
        802                <IonSegmentButton value="stats">
        803 -                <User size={18} />
        803 +                <IonLabel>Stats</IonLabel>
        804                </IonSegmentButton>
        805              </IonSegment>
        806 -          </div>
        806    
        807 -          {/* Content */}
        808 -          <div className="detail-content">
        809 -            <div className="content-container">
        810 -              {selectedSegment === 'overview' && renderOverview()}
        811 -              {selectedSegment === 'holes' && renderHoles()}
        812 -              {selectedSegment === 'stats' && renderPlayerStats()}
        813 -            </div>
        807 +            {/* Content based on segment */}
        808 +            {selectedSegment === 'overview' && renderOverview()}
        809 +            {selectedSegment === 'scorecard' && renderScorecard()}
        810 +            {selectedSegment === 'tees' && renderTeeBoxes()}
        811 +            {selectedSegment === 'stats' && renderStats()}
        812            </div>
        813 -  
        814 -          {/* Simplified CSS Styles */}
        815 -          <style>{`
        816 -            .course-detail {
        817 -              --background: #0f1a0f;
        818 -            }
        819 -  
        820 -            .green-header {
        821 -              --background: linear-gradient(135deg, #1e2d1e 0%, #2d4a2d 100%);
        822 -              --border-width: 0;
        823 -            }
        824 -  
        825 -            .green-header ion-toolbar {
        826 -              --background: linear-gradient(135deg, #1e2d1e 0%, #2d4a2d 100%);
        827 -              --color: #f1f5f9;
        828 -            }
        829 -  
        830 -            .green-header ion-back-button {
        831 -              --color: #ffc107;
        832 -            }
        833 -  
        834 -            .course-header-title {
        835 -              position: absolute;
        836 -              left: 50%;
        837 -              top: 50%;
        838 -              transform: translateX(-50%) translateY(-50%);
        839 -              color: #f1f5f9;
        840 -              font-size: 16px;
        841 -              font-weight: 500;
        842 -              text-align: center;
        843 -            }
        844 -  
        845 -            .premium-content {
        846 -              --background: #0f1a0f;
        847 -            }
        848 -  
        849 -            .loading-container,
        850 -            .error-container {
        851 -              display: flex;
        852 -              flex-direction: column;
        853 -              align-items: center;
        854 -              justify-content: center;
        855 -              min-height: 100vh;
        856 -              color: rgba(255, 255, 255, 0.7);
        857 -            }
        858 -  
        859 -            .premium-spinner {
        860 -              --color: #ffd700;
        861 -              transform: scale(1.5);
        862 -            }
        863 -  
        864 -            .course-header-section {
        865 -              position: relative;
        866 -              padding: 0;
        867 -              height: 250px;
        868 -              background-size: cover;
        869 -              background-position: center;
        870 -              background-repeat: no-repeat;
        871 -              display: flex;
        872 -              align-items: flex-end;
        873 -              border-bottom: 1px solid rgba(255, 193, 7, 0.2);
        874 -            }
        875 -  
        876 -            .course-header-section:not([style*="background-image"]) {
        877 -              background: linear-gradient(135deg, #1e2d1e 0%, #2d4a2d 100%);
        878 -            }
        879 -  
        880 -            .course-header-overlay {
        881 -              position: absolute;
        882 -              inset: 0;
        883 -              background: linear-gradient(180deg, 
        884 -                rgba(30, 45, 30, 0.3) 0%, 
        885 -                rgba(30, 45, 30, 0.8) 70%,
        886 -                rgba(30, 45, 30, 0.95) 100%);
        887 -            }
        888 -  
        889 -            .course-header-section:not([style*="background-image"]) .course-header-overlay {
        890 -              background: rgba(0, 0, 0, 0.1);
        891 -            }
        892 -  
        893 -            .course-header-content {
        894 -              position: relative;
        895 -              z-index: 10;
        896 -              padding: 30px 20px;
        897 -              width: 100%;
        898 -              text-align: center;
        899 -            }
        900 -  
        901 -            .course-badge {
        902 -              display: inline-block;
        903 -              padding: 6px 12px;
        904 -              background: #ffd700;
        905 -              color: #0a0e14;
        906 -              font-size: 11px;
        907 -              font-weight: 700;
        908 -              letter-spacing: 1px;
        909 -              border-radius: 6px;
        910 -              margin-bottom: 15px;
        911 -            }
        912 -  
        913 -            .course-title {
        914 -              font-size: 28px;
        915 -              font-weight: 500;
        916 -              color: #f1f5f9;
        917 -              margin-bottom: 8px;
        918 -            }
        919 -  
        920 -            .club-title {
        921 -              font-size: 16px;
        922 -              color: rgba(255, 255, 255, 0.8);
        923 -              margin-bottom: 15px;
        924 -            }
        925 -  
        926 -            .course-basic-stats {
        927 -              display: flex;
        928 -              justify-content: center;
        929 -              gap: 12px;
        930 -              font-size: 14px;
        931 -              color: #ffc107;
        932 -              align-items: center;
        933 -            }
        934 -  
        935 -            .separator {
        936 -              opacity: 0.5;
        937 -            }
        938 -  
        939 -            .segment-container {
        940 -              padding: 20px;
        941 -              background: linear-gradient(135deg, #0f1a0f 0%, #1e2d1e 100%);
        942 -              border-bottom: 1px solid rgba(255, 193, 7, 0.2);
        943 -            }
        944 -  
        945 -            .premium-segment {
        946 -              background: rgba(255, 255, 255, 0.05);
        947 -              border-radius: 12px;
        948 -              padding: 4px;
        949 -            }
        950 -  
        951 -            .premium-segment ion-segment-button {
        952 -              --color: rgba(255, 255, 255, 0.6);
        953 -              --color-checked: #0a0e14;
        954 -              --background: transparent;
        955 -              --background-checked: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
        956 -              --indicator-height: 0;
        957 -              border-radius: 8px;
        958 -              font-weight: 500;
        959 -              letter-spacing: 0.5px;
        960 -              text-transform: uppercase;
        961 -              font-size: 12px;
        962 -              min-height: 36px;
        963 -            }
        964 -  
        965 -            .detail-content {
        966 -              background: linear-gradient(135deg, #0a0e14 0%, #1a252f 100%);
        967 -              min-height: 50vh;
        968 -            }
        969 -  
        970 -            .content-container {
        971 -              padding: 20px;
        972 -            }
        973 -  
        974 -            .section-title {
        975 -              display: flex;
        976 -              align-items: center;
        977 -              gap: 12px;
        978 -              padding: 15px 20px;
        979 -              margin: 0 -20px 25px -20px;
        980 -              background: linear-gradient(135deg, #1e2d1e 0%, #2d4a2d 100%);
        981 -              font-size: 16px;
        982 -              font-weight: 500;
        983 -              letter-spacing: 0.5px;
        984 -              text-transform: uppercase;
        985 -              color: #f1f5f9;
        986 -            }
        987 -  
        988 -            .section-title svg {
        989 -              color: #ffc107;
        990 -            }
        991 -  
        992 -            .stats-grid {
        993 -              display: grid;
        994 -              grid-template-columns: repeat(2, 1fr);
        995 -              gap: 15px;
        996 -              margin-bottom: 30px;
        997 -            }
        998 -  
        999 -            .stat-card {
       1000 -              background: linear-gradient(135deg, #1a252f 0%, #141f28 100%);
       1001 -              border: 1px solid rgba(255, 215, 0, 0.1);
       1002 -              border-radius: 16px;
       1003 -              padding: 20px;
       1004 -              display: flex;
       1005 -              align-items: center;
       1006 -              gap: 15px;
       1007 -              /* cursor: pointer; */
       1008 -              transition: all 0.3s ease;
       1009 -            }
       1010 -  
       1011 -            .stat-icon {
       1012 -              color: #ffd700;
       1013 -            }
       1014 -  
       1015 -            .stat-info {
       1016 -              display: flex;
       1017 -              flex-direction: column;
       1018 -            }
       1019 -  
       1020 -            .stat-value {
       1021 -              font-size: 24px;
       1022 -              font-weight: 300;
       1023 -              color: white;
       1024 -            }
       1025 -  
       1026 -            .stat-label {
       1027 -              font-size: 12px;
       1028 -              color: rgba(255, 255, 255, 0.6);
       1029 -              text-transform: uppercase;
       1030 -              letter-spacing: 0.5px;
       1031 -            }
       1032 -  
       1033 -            .info-section,
       1034 -            .club-section {
       1035 -              margin-bottom: 30px;
       1036 -            }
       1037 -  
       1038 -            .info-grid {
       1039 -              display: grid;
       1040 -              grid-template-columns: repeat(2, 1fr);
       1041 -              gap: 15px;
       1042 -            }
       1043 -  
       1044 -            .info-item {
       1045 -              display: flex;
       1046 -              flex-direction: column;
       1047 -              gap: 5px;
       1048 -            }
       1049 -  
       1050 -            .info-label {
       1051 -              font-size: 12px;
       1052 -              color: rgba(255, 255, 255, 0.5);
       1053 -              text-transform: uppercase;
       1054 -              letter-spacing: 0.5px;
       1055 -            }
       1056 -  
       1057 -            .info-value {
       1058 -              font-size: 16px;
       1059 -              color: white;
       1060 -            }
       1061 -  
       1062 -            .status-active {
       1063 -              color: #4ade80;
       1064 -            }
       1065 -  
       1066 -            .club-card {
       1067 -              background: linear-gradient(135deg, #1a252f 0%, #141f28 100%);
       1068 -              border: 1px solid rgba(255, 215, 0, 0.1);
       1069 -              border-radius: 20px;
       1070 -              padding: 25px;
       1071 -              position: relative;
       1072 -            }
       1073 -  
       1074 -            .royal-badge {
       1075 -              position: absolute;
       1076 -              top: 15px;
       1077 -              right: 15px;
       1078 -              padding: 6px 12px;
       1079 -              background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
       1080 -              color: #0a0e14;
       1081 -              font-size: 10px;
       1082 -              font-weight: 700;
       1083 -              letter-spacing: 1px;
       1084 -              border-radius: 6px;
       1085 -            }
       1086 -  
       1087 -            .club-card h3 {
       1088 -              font-size: 20px;
       1089 -              color: white;
       1090 -              margin-bottom: 10px;
       1091 -            }
       1092 -  
       1093 -            .club-address,
       1094 -            .club-city {
       1095 -              color: rgba(255, 255, 255, 0.7);
       1096 -              margin-bottom: 5px;
       1097 -            }
       1098 -  
       1099 -            .club-actions {
       1100 -              display: flex;
       1101 -              gap: 15px;
       1102 -              margin-top: 20px;
       1103 -            }
       1104 -  
       1105 -            .action-button {
       1106 -              display: flex;
       1107 -              align-items: center;
       1108 -              gap: 8px;
       1109 -              padding: 10px 20px;
       1110 -              background: rgba(255, 215, 0, 0.1);
       1111 -              border: 1px solid #ffd700;
       1112 -              border-radius: 25px;
       1113 -              color: #ffd700;
       1114 -              text-decoration: none;
       1115 -              font-size: 14px;
       1116 -              transition: all 0.3s ease;
       1117 -            }
       1118 -  
       1119 -            .action-button:active {
       1120 -              background: #ffd700;
       1121 -              color: #0a0e14;
       1122 -              transform: scale(0.95);
       1123 -            }
       1124 -  
       1125 -            .tee-cards {
       1126 -              display: flex;
       1127 -              flex-direction: column;
       1128 -              gap: 15px;
       1129 -            }
       1130 -  
       1131 -            .tee-card {
       1132 -              display: flex;
       1133 -              gap: 15px;
       1134 -              background: linear-gradient(135deg, #1a252f 0%, #141f28 100%);
       1135 -              border: 1px solid rgba(255, 215, 0, 0.1);
       1136 -              border-radius: 16px;
       1137 -              padding: 20px;
       1138 -              /* cursor: pointer; */
       1139 -              transition: all 0.3s ease;
       1140 -            }
       1141 -  
       1142 -            .tee-color-indicator {
       1143 -              width: 6px;
       1144 -              border-radius: 3px;
       1145 -              flex-shrink: 0;
       1146 -            }
       1147 -  
       1148 -            .tee-info {
       1149 -              flex: 1;
       1150 -            }
       1151 -  
       1152 -            .tee-header {
       1153 -              display: flex;
       1154 -              justify-content: space-between;
       1155 -              align-items: center;
       1156 -              margin-bottom: 15px;
       1157 -            }
       1158 -  
       1159 -            .tee-header h3 {
       1160 -              color: white;
       1161 -              font-size: 18px;
       1162 -              margin: 0;
       1163 -            }
       1164 -  
       1165 -            .tee-gender {
       1166 -              padding: 4px 10px;
       1167 -              background: rgba(255, 215, 0, 0.1);
       1168 -              border-radius: 12px;
       1169 -              color: #ffd700;
       1170 -              font-size: 12px;
       1171 -              text-transform: uppercase;
       1172 -            }
       1173 -  
       1174 -            .tee-stats {
       1175 -              display: flex;
       1176 -              gap: 30px;
       1177 -            }
       1178 -  
       1179 -            .tee-stat {
       1180 -              display: flex;
       1181 -              flex-direction: column;
       1182 -            }
       1183 -  
       1184 -            .tee-stat-value {
       1185 -              font-size: 18px;
       1186 -              color: white;
       1187 -              font-weight: 300;
       1188 -            }
       1189 -  
       1190 -            .tee-stat-label {
       1191 -              font-size: 11px;
       1192 -              color: rgba(255, 255, 255, 0.5);
       1193 -              text-transform: uppercase;
       1194 -              letter-spacing: 0.5px;
       1195 -            }
       1196 -  
       1197 -            .holes-grid {
       1198 -              display: grid;
       1199 -              grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
       1200 -              gap: 15px;
       1201 -            }
       1202 -  
       1203 -            .hole-card {
       1204 -              background: linear-gradient(135deg, #1a252f 0%, #141f28 100%);
       1205 -              border: 1px solid rgba(255, 215, 0, 0.1);
       1206 -              border-radius: 16px;
       1207 -              padding: 15px;
       1208 -              /* cursor: pointer; */
       1209 -              transition: all 0.3s ease;
       1210 -            }
       1211 -  
       1212 -            .hole-header {
       1213 -              display: flex;
       1214 -              justify-content: space-between;
       1215 -              align-items: center;
       1216 -              margin-bottom: 10px;
       1217 -            }
       1218 -  
       1219 -            .hole-number {
       1220 -              font-size: 18px;
       1221 -              color: #ffd700;
       1222 -              font-weight: 500;
       1223 -            }
       1224 -  
       1225 -            .hole-badges {
       1226 -              display: flex;
       1227 -              gap: 5px;
       1228 -            }
       1229 -  
       1230 -            .par-badge,
       1231 -            .hcp-badge {
       1232 -              padding: 2px 6px;
       1233 -              background: rgba(255, 215, 0, 0.1);
       1234 -              border-radius: 4px;
       1235 -              font-size: 10px;
       1236 -              color: rgba(255, 255, 255, 0.7);
       1237 -            }
       1238 -  
       1239 -            .hole-distances {
       1240 -              display: flex;
       1241 -              flex-direction: column;
       1242 -              gap: 5px;
       1243 -            }
       1244 -  
       1245 -            .distance-item {
       1246 -              display: flex;
       1247 -              align-items: center;
       1248 -              gap: 8px;
       1249 -            }
       1250 -  
       1251 -            .distance-color {
       1252 -              width: 12px;
       1253 -              height: 12px;
       1254 -              border-radius: 50%;
       1255 -              border: 1px solid rgba(255, 255, 255, 0.2);
       1256 -            }
       1257 -  
       1258 -            .distance-value {
       1259 -              font-size: 12px;
       1260 -              color: rgba(255, 255, 255, 0.7);
       1261 -            }
       1262 -  
       1263 -            .amenities-grid {
       1264 -              display: grid;
       1265 -              grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
       1266 -              gap: 15px;
       1267 -            }
       1268 -  
       1269 -            .amenity-card {
       1270 -              background: linear-gradient(135deg, #1a252f 0%, #141f28 100%);
       1271 -              border: 1px solid rgba(255, 215, 0, 0.1);
       1272 -              border-radius: 16px;
       1273 -              padding: 20px;
       1274 -              display: flex;
       1275 -              flex-direction: column;
       1276 -              align-items: center;
       1277 -              gap: 10px;
       1278 -              /* cursor: pointer; */
       1279 -              transition: all 0.3s ease;
       1280 -            }
       1281 -  
       1282 -            .amenity-icon {
       1283 -              color: #ffd700;
       1284 -            }
       1285 -  
       1286 -            .amenity-label {
       1287 -              font-size: 12px;
       1288 -              color: white;
       1289 -              text-align: center;
       1290 -            }
       1291 -  
       1292 -            .no-stats {
       1293 -              text-align: center;
       1294 -              padding: 40px 20px;
       1295 -              color: rgba(255, 255, 255, 0.6);
       1296 -            }
       1297 -  
       1298 -            .partner-card {
       1299 -              background: linear-gradient(135deg, #1a252f 0%, #141f28 100%);
       1300 -              border: 1px solid rgba(255, 215, 0, 0.1);
       1301 -              border-radius: 16px;
       1302 -              padding: 20px;
       1303 -              display: flex;
       1304 -              align-items: center;
       1305 -              gap: 15px;
       1306 -            }
       1307 -  
       1308 -            .partner-icon {
       1309 -              color: #ffc107;
       1310 -            }
       1311 -  
       1312 -            .partner-info h3 {
       1313 -              color: white;
       1314 -              font-size: 18px;
       1315 -              margin: 0 0 5px 0;
       1316 -            }
       1317 -  
       1318 -            .partner-info p {
       1319 -              color: rgba(255, 255, 255, 0.7);
       1320 -              margin: 0;
       1321 -              font-size: 14px;
       1322 -            }
       1323 -          `}</style>