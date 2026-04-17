import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useGameExit = ({
    isGameOver,
    gameResult,
    mode,
    difficulty,
    seconds,
    userId,
    username,
    opponentUsername,
    wsRef = null,
    roomId = null,
    isOwner = false
}) => {
    const navigate = useNavigate();
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);

    const handleBackClick = () => {
        if (isGameOver || gameResult)
            navigate('/');
        else
            setIsExitModalOpen(true);
    };

    const cancelExit = () => setIsExitModalOpen(false);

    const confirmExitGame = async () => {
        setIsExitModalOpen(false);

        if (mode === 'online' && wsRef?.current?.readyState === WebSocket.OPEN)
        {
            wsRef.current.send(JSON.stringify({
                event: 'move',
                data: {
                    roomId: roomId.toString(),
                    role: isOwner ? 'owner' : 'guest',
                    action: 'surrender'
                }
            }));
        }

        try
        {
            const diffMap = { 'Easy': 1, 'Medium': 2, 'Hard': 3, 'Expert': 4, 'Extreme': 5 };
            await fetch('/api/stats/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId || 0,
                    username: username || "Player",
                    difficulty: diffMap[difficulty] || 2,
                    mode: mode,
                    result: 'lose',
                    time_seconds: seconds || 0,
                    opponent: opponentUsername || "Computer"
                })
            });
        }
        catch (error)
        {
            console.error(`Failed to send ${mode} exit stats:`, error);
        }

        navigate('/');
    };

    return {
        isExitModalOpen,
        handleBackClick,
        confirmExitGame,
        cancelExit
    };
};

export default useGameExit;