import { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api';

const MODES = ['Extreme', 'Expert', 'Hard', 'Medium', 'Easy'];

const useLeaderboardPage = () =>
{
  const [mode, setMode] = useState('Extreme');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() =>
  {
    const fetchData = async () =>
    {
      setLoading(true);
      try
      {
        const data = await getLeaderboard(mode, 'alltime', 0);
        
        let validData = [];
        if (Array.isArray(data))
          validData = data;
        else if (data && Array.isArray(data.data))
          validData = data.data;

        // Enrich with display names and avatars
        const enrichedData = await Promise.all(
          validData.map(async (player) => {
            try {
              const userResponse = await fetch(`/api/v1/user/by-username/${player.username}/`);
              if (userResponse.ok) {
                const userData = await userResponse.json();
                return { ...player, display_name: userData.display_name, avatar: userData.avatar };
              }
            } catch (err) {
              console.error(`Failed to fetch display name for ${player.username}:`, err);
            }
            return player;
          })
        );

        const sorted = [...enrichedData].sort((a, b) =>
        {
          const scoreDiff = (b.score || 0) - (a.score || 0);
          if (scoreDiff !== 0)
            return scoreDiff;

          const gamesDiff = (b.games || 0) - (a.games || 0);
          if (gamesDiff !== 0)
            return gamesDiff;

          return (b.winrate || 0) - (a.winrate || 0);
        });
        setPlayers(sorted);
      }
      catch (error)
      {
        console.error("Leaderboard Page Error:", error);
      } 
      finally
      {
        setLoading(false);
      }
    };

    fetchData();
  }, [mode]);

  return {
    mode,
    setMode,
    players,
    loading,
    modes: MODES
  };
};

export default useLeaderboardPage;