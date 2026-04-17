import { useState, useEffect, useCallback } from 'react';
import { getLeaderboard } from '../services/api';

const useLeaderboardWidget = (mode = 'Extreme') =>
{
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextResetAt, setNextResetAt] = useState(null);
  const [periodStart, setPeriodStart] = useState(null);

  const fetchLeaderboard = useCallback(async () =>
  {
    try
    {
      setLoading(true);

      if (!getLeaderboard)
        return;
      
      const data = await getLeaderboard(mode, 'weekly');

      if (data && data.next_reset_at)
        setNextResetAt(data.next_reset_at);

      if (data && data.period_start)
        setPeriodStart(data.period_start);
      
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
      setPlayers(sorted.slice(0, 5));
    }
    catch (err)
    {
      console.error(err);
    }
    finally
    {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() =>
  {
    fetchLeaderboard();
  }, [fetchLeaderboard, mode]);

  return { players, loading, nextResetAt, periodStart, refresh: fetchLeaderboard };
};

export default useLeaderboardWidget;