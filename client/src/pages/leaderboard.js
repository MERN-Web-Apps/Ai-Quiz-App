import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosApi from '../utils/axiosApi';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import './leaderboard.css'; // You'll need to create this CSS file

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { quizCode } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axiosApi.get(`leaderboard/${quizCode}`);

        setLeaderboardData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [quizCode]);

  const navigateToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  // Calculate statistics
  const calculateStats = () => {
    if (!leaderboardData?.rankings || leaderboardData.rankings.length === 0) return null;
    
    const scores = leaderboardData.rankings.map(entry => entry.score);
    const times = leaderboardData.rankings.map(entry => entry.timetaken);
    
    // Sort arrays for median calculation
    const sortedScores = [...scores].sort((a, b) => a - b);
    const sortedTimes = [...times].sort((a, b) => a - b);
    
    // Calculate mean
    const meanScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const meanTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    // Calculate median
    const medianScore = sortedScores.length % 2 === 0 
      ? (sortedScores[sortedScores.length/2 - 1] + sortedScores[sortedScores.length/2]) / 2
      : sortedScores[Math.floor(sortedScores.length/2)];
    
    const medianTime = sortedTimes.length % 2 === 0 
      ? (sortedTimes[sortedTimes.length/2 - 1] + sortedTimes[sortedTimes.length/2]) / 2
      : sortedTimes[Math.floor(sortedTimes.length/2)];
    
    // Calculate highest and lowest
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const fastestTime = Math.min(...times);
    const slowestTime = Math.max(...times);
    
    return {
      score: {
        mean: meanScore.toFixed(2),
        median: medianScore,
        highest: highestScore,
        lowest: lowestScore
      },
      time: {
        mean: meanTime.toFixed(2),
        median: medianTime,
        fastest: fastestTime,
        slowest: slowestTime
      }
    };
  };
  
  // Prepare chart data based on the actual data structure
  const prepareScoreDistribution = () => {
    if (!leaderboardData?.rankings || leaderboardData.rankings.length === 0) return null;
    
    // Group scores into ranges (0-20, 21-40, 41-60, 61-80, 81-100)
    const scoreRanges = {
      '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0
    };
    
    leaderboardData.rankings.forEach(entry => {
      const score = entry.score;
      if (score <= 20) scoreRanges['0-20']++;
      else if (score <= 40) scoreRanges['21-40']++;
      else if (score <= 60) scoreRanges['41-60']++;
      else if (score <= 80) scoreRanges['61-80']++;
      else scoreRanges['81-100']++;
    });
    
    return {
      labels: Object.keys(scoreRanges),
      datasets: [
        {
          label: 'Number of participants',
          data: Object.values(scoreRanges),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
          borderWidth: 1
        },
      ],
    };
  };
  
  // Prepare bar chart for score comparison
  const prepareScoreComparisonData = () => {
    if (!leaderboardData?.rankings || leaderboardData.rankings.length === 0) return null;
    
    const stats = calculateStats();
    if (!stats) return null;
    
    return {
      labels: ['Average Score', 'Median Score', 'Highest Score', 'Lowest Score'],
      datasets: [{
        label: 'Score Comparison',
        data: [
          parseFloat(stats.score.mean),
          stats.score.median,
          stats.score.highest,
          stats.score.lowest
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    };
  };
  
  if (loading) {
    return <div className="loading-container"><div className="loader"></div>Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="error-container">Error fetching leaderboard: {error.message}</div>;
  }
  
  // Check if data exists and has the expected structure
  if (!leaderboardData || !leaderboardData.rankings) {
    return (
      <div className="error-container">
        <h2>No leaderboard data available</h2>
        <pre>Received: {JSON.stringify(leaderboardData, null, 2)}</pre>
      </div>
    );
  }

  const scoreDistribution = prepareScoreDistribution();
  const scoreComparisonData = prepareScoreComparisonData();
  const stats = calculateStats();

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>Quiz Leaderboard: {leaderboardData.quizCode}</h1>
        <p>Total participants: {leaderboardData.rankings?.length || 0}</p>
      </div>
      
      <div className="leaderboard-content">
        <div className="leaderboard-table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User ID</th>
                <th>Score</th>
                <th>Time Taken</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.rankings?.map((entry, index) => (
                <tr key={index} className={index === 0 ? 'first-place' : index === 1 ? 'second-place' : index === 2 ? 'third-place' : ''}>
                  <td className="rank-cell">
                    {index + 1}
                  </td>
                  <td>
                    <button 
                      className="username-button"
                      onClick={() => navigateToProfile(entry.userId.username)}
                    >
                      {entry.userId.username}
                    </button>
                  </td>
                  <td><div className="score-pill">{entry.score}</div></td>
                  <td>{formatTime(entry.timetaken)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="statistics-container">
          <h2>Quiz Statistics</h2>
          
          {stats && (
            <div className="stats-summary">
              <div className="stats-card">
                <h3>Score Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Mean:</span>
                    <span className="stat-value">{stats.score.mean}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Median:</span>
                    <span className="stat-value">{stats.score.median}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Highest:</span>
                    <span className="stat-value">{stats.score.highest}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Lowest:</span>
                    <span className="stat-value">{stats.score.lowest}</span>
                  </div>
                </div>
              </div>
              
              <div className="stats-card">
                <h3>Time Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Mean:</span>
                    <span className="stat-value">{formatTime(Math.round(stats.time.mean))}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Median:</span>
                    <span className="stat-value">{formatTime(stats.time.median)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Fastest:</span>
                    <span className="stat-value">{formatTime(stats.time.fastest)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Slowest:</span>
                    <span className="stat-value">{formatTime(stats.time.slowest)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="charts-grid">
            {scoreComparisonData && (
              <div className="chart-container">
                <h3>Score Statistics</h3>
                <Bar 
                  data={scoreComparisonData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      },
                      title: {
                        display: true,
                        text: 'Score Comparison'
                      }
                    }
                  }} 
                />
              </div>
            )}
            
            {scoreDistribution && (
              <div className="chart-container">
                <h3>Score Distribution</h3>
                <Pie 
                  data={scoreDistribution} 
                  options={{ 
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Score Range Distribution'
                      }
                    }
                  }} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;