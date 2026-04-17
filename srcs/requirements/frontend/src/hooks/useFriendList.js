import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

function getCookie(name)
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

const useFriendList = () =>
{
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const onlineUserIds = useWebSocket() || new Set();
    const API_URL = '/api/v1/user/friends/';

    const fetchFriends = useCallback(async () =>
    {
        try
        {
            setLoading(true);
            const response = await fetch(API_URL);

            if (response.ok)
            {
                const data = await response.json();
                const combinedList = [];

                if (data.pending_requests)
                {
                    data.pending_requests.forEach(req =>
                    {
                        combinedList.push({
                            id: req.rel_id,
                            userId: req.id,
                            username: req.username,
                            displayName: req.display_name || req.username,
                            avatar: req.avatar,
                            status: 'pending',
                            is_online: false
                        });
                    });
                }

                if (data.sent_requests)
                {
                    data.sent_requests.forEach(req =>
                    {
                        combinedList.push({
                            id: req.rel_id,
                            userId: req.id,
                            username: req.username,
                            displayName: req.display_name || req.username,
                            avatar: req.avatar,
                            status: 'sent',
                            is_online: false
                        });
                    });
                }

                if (data.friends)
                {
                    data.friends.forEach(friend =>
                    {
                        combinedList.push({
                            id: friend.rel_id,
                            userId: friend.id,
                            username: friend.username,
                            displayName: friend.display_name || friend.username,
                            avatar: friend.avatar,
                            status: 'accepted',
                            is_online: false
                        });
                    });
                }

                setFriends(combinedList);
            }
        }
        catch (err)
        {
            setError('Network error');
        }
        finally
        {
            setLoading(false);
        }
    }, []);

    useEffect(() =>
    {
        fetchFriends();
    }, [fetchFriends]);

    const friendsWithRealTimeStatus = friends.map(f =>
    {
        if (f.status === 'accepted')
        {
            return {
                ...f,
                is_online: onlineUserIds.has(Number(f.userId))
            };
        }
        return f;
    });

    const performAction = async (payload) =>
    {
        setError(null);
        setSuccessMsg(null);
        const csrftoken = getCookie('csrftoken');

        try
        {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok || response.status === 201)
            {
                setSuccessMsg(result.message || 'Success');
                fetchFriends();
                setTimeout(() => setSuccessMsg(null), 3000);
                return true;
            }
            else
            {
                setError(result.error || result.message || 'Operation Failed');
                setTimeout(() => setError(null), 3000);
                return false;
            }
        }
        catch (err)
        {
            setError('Network Error');
            return false;
        }
    };

    const addFriend = (username) => performAction({
        action: 'send',
        target_username: username
    });

    const approveFriend = (relId) => performAction({
        action: 'approve',
        rel_id: relId
    });

    const removeFriend = (relId) => performAction({
        action: 'remove',
        rel_id: relId
    });

    return {
        friends: friendsWithRealTimeStatus,
        loading,
        error,
        successMsg,
        addFriend,
        approveFriend,
        removeFriend,
        refresh: fetchFriends
    };
};

export default useFriendList;