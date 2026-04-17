export const API_BASE_URL = "";

export function getCookie(name) 
{
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') 
  {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) 
    {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) 
      {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const getHeaders = () => 
{
  const csrftoken = getCookie('csrftoken');
  return {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrftoken || '',
  };
};

const ensureCsrfToken = async () => 
{
  try
  {
    await fetch(`${API_BASE_URL}/api/v1/user/csrf/`, { 
      method: 'GET', 
      credentials: 'include' 
    });
    console.log("CSRF cookie requested successfully");
  }
  catch (err)
  {
    console.error("CSRF setup failed:", err);
  }
};

export const loginUser = async (username, password) => 
{
  const url = `${API_BASE_URL}/api/v1/user/login/`;

  await ensureCsrfToken();

  try
  {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });

    const textData = await response.text();
    console.log("RAW SERVER RESPONSE:", textData);

    let data;
    try
    {
      data = JSON.parse(textData);
    }
    catch (err)
    {
      console.error("JSON Parse Error.");
      throw new Error("Sunucu hatası: Beklenmeyen yanıt döndü.");
    }

    if (!response.ok)
    {
      const errorMessage = data.detail || data.message || 'Login failed.';
      throw new Error(errorMessage);
    }

    return data;
  }
  catch (error)
  {
    console.error("Login Error:", error);
    throw error;
  }
};

export const registerUser = async (username, email, password) => 
{
  const url = `${API_BASE_URL}/api/v1/user/signup/`;

  await ensureCsrfToken();

  try
  {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        username,
        password,
        email,
        avatar: null
      }),
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok)
    {
      let errorMsg = data.message;
      if (!errorMsg && typeof data === 'object')
        errorMsg = Object.values(data).flat().join(' ');
      throw new Error(errorMsg || 'Registration failed.');
    }
    return data;
  }
  catch (error)
  {
    console.error("API Error:", error);
    throw error;
  }
};

export const getFriends = async () => 
{
  const url = `${API_BASE_URL}/api/v1/user/friends/`;
  try
  {
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    if (!response.ok)
      throw new Error('Failed to fetch friends list');
    return await response.json();
  }
  catch (error)
  {
    console.error("API Error:", error);
    throw error;
  }
};

export const removeFriend = async (friendId) => 
{
  const primaryUrl = `${API_BASE_URL}/api/v1/user/friends/`;
  const fallbackUrl = `${API_BASE_URL}/api/v1/user/friends/remove/`;

  try
  {
    const primaryResponse = await fetch(primaryUrl, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action: 'remove', rel_id: friendId }),
      credentials: 'include'
    });

    if (primaryResponse.ok)
      return await primaryResponse.json();

    const fallbackResponse = await fetch(fallbackUrl, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ friend_id: friendId }),
      credentials: 'include'
    });

    if (!fallbackResponse.ok)
      throw new Error('Failed to remove friend');

    return await fallbackResponse.json();
  }
  catch (error)
  {
    console.error("API Error:", error);
    throw error;
  }
};

export const addFriend = async (username) => 
{
  const url = `${API_BASE_URL}/api/v1/user/friends/`;
  try
  {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action: 'send', target_username: username }),
      credentials: 'include'
    });
    if (!response.ok)
    {
      const err = await response.json();
      throw new Error(err.error || err.message || 'Failed to add friend');
    }
    return await response.json();
  }
  catch (error)
  {
    console.error("API Error:", error);
    throw error;
  }
};

export const startGame = async (mode, difficulty) =>
{
    const difficultyMap = { 1: "Easy", 2: "Medium", 3: "Hard", 4: "Expert", 5: "Extreme" };
    const levelStr = difficultyMap[difficulty] || "Medium";

    const response = await fetch(`${API_BASE_URL}/api/play/start/offline`, 
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: String(difficulty) })
    });
    
    if (!response.ok)
    {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
    }
    
    return response.json();
};

export const createCombatRoom = async (userId, levelStr, currentUserName) =>
{
    const response = await fetch(`${API_BASE_URL}/api/play/start/online`, 
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
        { 
            userId: userId, 
            difficulty: levelStr, 
            ownerName: currentUserName 
        })
    });
    
    if (!response.ok)
        throw new Error("Failed to create online room");
    
    return response.json();
};

export const makeMove = async (gameId, row, col, value) => 
{
  const url = `${API_BASE_URL}/api/play/move`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ gameId, row, col, value }),
    credentials: 'include'
  });
  if (!response.ok)
    throw new Error('The move could not be sent');
  return await response.json();
};

export const getUserStats = async (username, userId = null) => 
{
  try
  {
    const url = (userId !== null && userId !== undefined)
      ? `${API_BASE_URL}/api/stats/id/${encodeURIComponent(userId)}`
      : `${API_BASE_URL}/api/stats/${username}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok)
    {
      console.error(`Failed to fetch user stats: ${response.status}`);
      return {
        totalGames: 0,
        winRate: 0,
        ranks: { easy: "-", medium: "-", hard: "-", expert: "-", extreme: "-" }
      };
    }
    
    const data = await response.json();
    return data || {
      totalGames: 0,
      winRate: 0,
      ranks: { easy: "-", medium: "-", hard: "-", expert: "-", extreme: "-" }
    };
  }
  catch (error)
  {
    console.error('Error fetching user stats:', error);
    return {
      totalGames: 0,
      winRate: 0,
      ranks: { easy: "-", medium: "-", hard: "-", expert: "-", extreme: "-" }
    };
  }
};

export const logoutUser = async () => 
{
  const url = `${API_BASE_URL}/logout/`;
  try
  {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      credentials: 'include'
    });
  }
  catch (error)
  {
    console.error("Logout request failed:", error);
  }
};

export const joinRoom = async (roomId, userId) => 
{
  const url = `${API_BASE_URL}/api/room/join/${roomId}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId }),
    credentials: 'include'
  });
  if (!response.ok)
  {
    const err = await response.json();
    throw new Error(err.message || 'Failed to join room');
  }
  return await response.json();
};

export const deleteUserAccount = async () => 
{
  const url = `${API_BASE_URL}/api/user/profile/delete/`;
  try
  {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      credentials: 'include'
    });
    return response.ok;
  }
  catch (error)
  {
    console.error("Delete failed:", error);
    return false;
  }
};

export const getMatchHistory = async (username, userId = null) => 
{
  try
  {
    const url = (userId !== null && userId !== undefined)
      ? `${API_BASE_URL}/api/stats/id/${encodeURIComponent(userId)}/history`
      : `${API_BASE_URL}/api/stats/${username}/history`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok)
    {
      console.error(`Failed to fetch match history: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data || [];
  }
  catch (error)
  {
    console.error('Error fetching match history:', error);
    return [];
  }
};

export const getLeaderboard = async (mode = 'Total', scope = 'alltime', limit = null) => 
{
  try
  {
    let url = `${API_BASE_URL}/api/stats/leaderboard/${mode}?scope=${encodeURIComponent(scope)}`;
    if (limit !== null && limit !== undefined)
      url += `&limit=${encodeURIComponent(limit)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok)
    {
      console.error(`Failed to fetch leaderboard: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data || [];
  }
  catch (error)
  {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

export const getUserAchievements = async (username, userId = null) => 
{
  try 
  {
    const url = (userId !== null && userId !== undefined)
      ? `${API_BASE_URL}/api/stats/achievements/id/${encodeURIComponent(userId)}`
      : `${API_BASE_URL}/api/stats/achievements/${username}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) 
    {
      console.error(`Failed to fetch achievements: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.achievements || [];
  }
  catch (error)
  {
    console.error('Error fetching achievements:', error);
    return [];
  }
};