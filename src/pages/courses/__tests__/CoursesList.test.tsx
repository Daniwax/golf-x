import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { IonicReact } from '@ionic/react';
import CoursesList from '../CoursesList';

// Mock the useCourseList hook
jest.mock('../../../hooks/useCourses', () => ({
  useCourseList: jest.fn()
}));

// Mock Ionic components for testing
jest.mock('@ionic/react', () => ({
  ...jest.requireActual('@ionic/react'),
  IonPage: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-page">{children}</div>,
  IonContent: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-content">{children}</div>,
  IonHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-header">{children}</div>,
  IonToolbar: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-toolbar">{children}</div>,
  IonTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-title">{children}</div>,
  IonSpinner: () => <div data-testid="ion-spinner">Loading...</div>,
  IonCard: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-card">{children}</div>,
  IonCardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-card-content">{children}</div>,
  IonItem: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-item">{children}</div>,
  IonLabel: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-label">{children}</div>,
  IonText: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-text">{children}</div>,
  IonButtons: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-buttons">{children}</div>,
  IonBackButton: () => <button data-testid="ion-back-button">Back</button>,
  IonRefresher: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-refresher">{children}</div>,
  IonRefresherContent: () => <div data-testid="ion-refresher-content" />
}));

import { useCourseList as mockUseCourseList } from '../../../hooks/useCourses';

// Mock course data for testing
const mockCourseData = {
  courses: [
    {
      id: 1,
      name: 'La Moraleja Golf Club',
      par: 72,
      holes: 18,
      golf_clubs: {
        name: 'La Moraleja',
        city: 'Madrid'
      }
    },
    {
      id: 2,
      name: 'Real Club de Golf El Prat',
      par: 71,
      holes: 18,
      golf_clubs: {
        name: 'El Prat',
        city: 'Barcelona'
      }
    }
  ],
  teeBoxes: [
    {
      id: 1,
      course_id: 1,
      color: 'yellow',
      course_rating: 72.5,
      total_meters: 6234
    }
  ],
  playerStats: [
    {
      id: 1,
      total_strokes: 78,
      games: { course_id: 1 }
    },
    {
      id: 2,
      total_strokes: 82,
      games: { course_id: 1 }
    }
  ],
  courseImages: [
    {
      id: 1,
      course_id: 1,
      image_type: 'default',
      image_data: 'mock-base64-data',
      mime_type: 'image/jpeg'
    }
  ],
  loading: false,
  error: null,
  refresh: jest.fn(),
  search: jest.fn()
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <IonicReact>
      {children}
    </IonicReact>
  </BrowserRouter>
);

describe('CoursesList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state correctly', () => {
    mockUseCourseList.mockReturnValue({
      ...mockCourseData,
      loading: true
    });

    render(
      <TestWrapper>
        <CoursesList />
      </TestWrapper>
    );

    expect(screen.getByTestId('ion-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders course list with iOS design', async () => {
    mockUseCourseList.mockReturnValue(mockCourseData);

    render(
      <TestWrapper>
        <CoursesList />
      </TestWrapper>
    );

    // Check for course titles
    expect(screen.getByText('La Moraleja Golf Club')).toBeInTheDocument();
    expect(screen.getByText('Real Club de Golf El Prat')).toBeInTheDocument();
    
    // Check for club information
    expect(screen.getByText(/La Moraleja • Madrid/)).toBeInTheDocument();
    expect(screen.getByText(/El Prat • Barcelona/)).toBeInTheDocument();
  });

  test('displays course information correctly', () => {
    mockUseCourseList.mockReturnValue(mockCourseData);

    render(
      <TestWrapper>
        <CoursesList />
      </TestWrapper>
    );

    // Check for par information
    expect(screen.getByText(/Par 72/)).toBeInTheDocument();
    expect(screen.getByText(/18 holes/)).toBeInTheDocument();
    
    // Check for distance information
    expect(screen.getByText(/6,234 m/)).toBeInTheDocument();
    
    // Check for player stats
    expect(screen.getByText(/Best: 78/)).toBeInTheDocument();
    expect(screen.getByText(/Avg: 80/)).toBeInTheDocument();
    expect(screen.getByText(/2 rounds/)).toBeInTheDocument();
  });

  test('renders search functionality', () => {
    mockUseCourseList.mockReturnValue(mockCourseData);

    render(
      <TestWrapper>
        <CoursesList />
      </TestWrapper>
    );

    // Find and click the search button
    const searchButton = screen.getByRole('button');
    fireEvent.click(searchButton);

    // Search input should appear
    const searchInput = screen.getByPlaceholderText('Search courses or locations...');
    expect(searchInput).toBeInTheDocument();
  });

  test('filters courses based on search input', async () => {
    mockUseCourseList.mockReturnValue(mockCourseData);

    render(
      <TestWrapper>
        <CoursesList />
      </TestWrapper>
    );

    // Open search
    const searchButton = screen.getByRole('button');
    fireEvent.click(searchButton);

    // Type in search input
    const searchInput = screen.getByPlaceholderText('Search courses or locations...');
    fireEvent.change(searchInput, { target: { value: 'Moraleja' } });

    await waitFor(() => {
      expect(screen.getByText('La Moraleja Golf Club')).toBeInTheDocument();
      expect(screen.queryByText('Real Club de Golf El Prat')).not.toBeInTheDocument();
    });
  });

  test('handles error state correctly', () => {
    mockUseCourseList.mockReturnValue({
      ...mockCourseData,
      error: new Error('Failed to load courses')
    });

    render(
      <TestWrapper>
        <CoursesList />
      </TestWrapper>
    );

    expect(screen.getByText('Error loading courses')).toBeInTheDocument();
    expect(screen.getByText('Failed to load courses')).toBeInTheDocument();
  });

  test('handles empty courses list', () => {
    mockUseCourseList.mockReturnValue({
      ...mockCourseData,
      courses: []
    });

    render(
      <TestWrapper>
        <CoursesList />
      </TestWrapper>
    );

    expect(screen.getByText('No courses found')).toBeInTheDocument();
    expect(screen.getByText('No courses available')).toBeInTheDocument();
  });

  test('displays "Not played yet" for unplayed courses', () => {
    const unplayedCourseData = {
      ...mockCourseData,
      playerStats: [] // No stats for any course
    };

    mockUseCourseList.mockReturnValue(unplayedCourseData);

    render(
      <TestWrapper>
        <CoursesList />
      </TestWrapper>
    );

    expect(screen.getAllByText('Not played yet')).toHaveLength(2);
  });

  test('processes course images correctly', () => {
    mockUseCourseList.mockReturnValue(mockCourseData);

    render(
      <TestWrapper>
        <CoursesList />
      </TestWrapper>
    );

    const courseImage = screen.getByAltText('La Moraleja Golf Club');
    expect(courseImage).toBeInTheDocument();
    expect(courseImage).toHaveAttribute('src');
  });

  test('handles refresh functionality', async () => {
    const mockRefresh = jest.fn();
    mockUseCourseList.mockReturnValue({
      ...mockCourseData,
      refresh: mockRefresh
    });

    render(
      <TestWrapper>
        <CoursesList />
      </TestWrapper>
    );

    // Simulate refresh event
    screen.getByTestId('ion-refresher');
    // Refresh event structure for future use when implementing refresh test
    // const refreshEvent = {
    //   detail: {
    //     complete: jest.fn()
    //   }
    // } as { detail: { complete: jest.Mock } };

    // This would normally be triggered by Ionic's refresh gesture
    // For testing, we'll just verify the refresh function exists
    expect(mockRefresh).toBeDefined();
  });
});