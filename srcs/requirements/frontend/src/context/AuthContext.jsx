import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) =>
{
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() =>
  {
    const checkAuth = async () =>
    {
      try
      {
        const response = await fetch('/api/v1/user/me/', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (response.ok)
        {
          const data = await response.json();
          
          if (data && data.user === null)
          {
            setUser(null);
            localStorage.removeItem('user');
          }
          else
          {
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
          }
        }
        else
        {
          setUser(null);
          localStorage.removeItem('user');
        }
      }
      catch (error)
      {
        console.error("Auth check failed:", error);
        setUser(null);
        localStorage.removeItem('user');
      }
      finally
      {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) =>
  {
    const userToStore = userData.user || userData;
    setUser(userToStore);
    localStorage.setItem('user', JSON.stringify(userToStore));
  };

  const logout = async () =>
  {
    try
    {
      const getCookie = (name) =>
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
      };

      const csrfToken = getCookie('csrftoken');

      await fetch('/api/v1/user/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
      });
    }
    catch (error)
    {
      console.error("Logout error:", error);
    }
    finally
    {
      localStorage.removeItem('user');
      setUser(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);