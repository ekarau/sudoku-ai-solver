import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Navbar from '../components/organisms/Navbar';
import Leaderboard from '../components/organisms/LeaderboardWidget';
import DifficultyModal from '../components/molecules/DifficultyModal';
import OnlineGameModal from '../components/organisms/OnlineGamePopup';
import SudokuBoard from '../components/organisms/SudokuBoard';
import Footer from '../components/atoms/Footer';
import AuthRequiredModal from '../components/molecules/AuthRequiredModal';
import Login from '../components/organisms/Login';
import SignUp from '../components/organisms/Signup';
import { useAuth } from '../context/AuthContext'; 
import { startGame, createCombatRoom, joinRoom } from '../services/api';

// ANIMATIONS
const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #f9fafb;
`;

// Scale yerine Translate ile çok daha temiz bir animasyon
const fadeInBoard = keyframes`
    from 
    { 
        opacity: 0; 
        transform: translateY(30px); 
    }
    to 
    { 
        opacity: 0.9; 
        transform: translateY(0); 
    }
`;

// STYLED COMPONENTS
const HeroSection = styled.main`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 100vh;
    background-color: #f8f9fa;
    
    padding-top: clamp(100px, 12vh, 140px);
    padding-bottom: clamp(40px, 6vh, 80px);
    padding-left: 20px;
    padding-right: 20px;
    
    position: relative;
    overflow: hidden;
    
    box-sizing: border-box; 
`;

const DecorativeBoardWrapper = styled.div`
    width: 100%;
    max-width: 400px; 
    margin: 0 auto 30px auto;
    opacity: 0.9;
    animation: ${fadeInBoard} 1s ease-out forwards;

    @media (max-width: 768px)
    {
        max-width: 280px;
        margin-bottom: 24px;
    }
`;

const DashboardContainer = styled.div`
    display: flex;
    gap: clamp(20px, 3vw, 40px);
    width: 100%;
    max-width: 1200px;
    z-index: 2;
    align-items: stretch;
    justify-content: center;

    @media (max-width: 950px)
    {
        flex-direction: column;
        align-items: center;
    }
`;

const ActionsColumn = styled.div`
    flex: 1.2;
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    max-width: 600px; 
`;

const ModeCard = styled.div`
    width: 100%; 
    background: #ffffff;
    border-radius: 20px;
    padding: clamp(24px, 4vw, 40px); 
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: clamp(16px, 3vw, 30px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    border: 3px solid transparent;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-sizing: border-box;

    &:hover
    {
        transform: translateY(-4px);
        box-shadow: 0 15px 30px rgba(0,0,0,0.1);
        border-color: #29972d;
    }

    @media (max-width: 480px)
    {
        padding: 20px 16px;
    }
`;

const OnlineCard = styled(ModeCard)`
    &:hover
    {
        background: linear-gradient(to right, #ffffff, #f0fdf4);
    }
`;

const OfflineCard = styled(ModeCard)`
    &:hover
    {
        background: linear-gradient(to right, #ffffff, #f7fee7);
    }
`;

const IconWrapper = styled.div`
    font-size: clamp(2.5rem, 4vw, 4rem); 
    background-color: #f0fdf4;
    
    width: clamp(70px, 8vw, 100px);
    height: clamp(70px, 8vw, 100px);
    
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    flex-shrink: 0;
    color: #29972d;
`;

const CardContent = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;

    h2
    {
        margin: 0;
        font-size: clamp(1.4rem, 3vw, 2.2rem); 
        color: #1a2e1b;
        font-weight: 800;
        line-height: 1.2;
    }

    p
    {
        margin: 6px 0 0;
        color: #4b5563;
        font-size: clamp(0.9rem, 1.5vw, 1.2rem); 
    }
`;

const LeaderboardWrapper = styled.div`
    flex: 0.8;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 600px;

    @media (max-width: 950px)
    {
        max-width: 600px;
        align-self: center;
    }
`;

// COMPONENT DEFINITION
const Home = () =>
{
    const navigate = useNavigate();
    const { user } = useAuth();

    const boardRef = useRef(null); 
    const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
    const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
    const [difficultyContext, setDifficultyContext] = useState(null);
    const [loading, setLoading] = useState(false);

    const [createdRoomId, setCreatedRoomId] = useState(null);
    const [isOpponentJoined, setIsOpponentJoined] = useState(false);
    const [playerRole, setPlayerRole] = useState(null);
    const [roomDifficulty, setRoomDifficulty] = useState("Medium");

    const [selectedCell, setSelectedCell] = useState(null);

    const [isAuthRequiredOpen, setIsAuthRequiredOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);
    
    const [boardData, setBoardData] = useState(() =>
    {
        const initialBoard = [];
        for (let r = 0; r < 9; r++)
        {
            const row = [];
            for (let c = 0; c < 9; c++)
            {
                row.push({ value: 0, isFixed: false, isError: false });
            }
            initialBoard.push(row);
        }
        
        let count = 0;
        while (count < 18)
        {
            const r = Math.floor(Math.random() * 9);
            const c = Math.floor(Math.random() * 9);
            const val = Math.floor(Math.random() * 9) + 1;

            if (initialBoard[r][c].value === 0)
            {
                initialBoard[r][c] = { value: val, isFixed: true, isError: false };
                count++;
            }
        }
        return initialBoard;
    });

    const handleKeyDown = useCallback((e) =>
    {
        if (!selectedCell)
            return;
            
        const { r, c } = selectedCell;
        
        if (boardData[r][c].isFixed)
            return;

        if (e.key >= '1' && e.key <= '9')
        {
            const newBoard = [...boardData];
            newBoard[r][c] = { ...newBoard[r][c], value: parseInt(e.key) };
            setBoardData(newBoard);
        } 
        else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0')
        {
            const newBoard = [...boardData];
            newBoard[r][c] = { ...newBoard[r][c], value: 0 };
            setBoardData(newBoard);
        }
    }, [selectedCell, boardData]);

    useEffect(() =>
    {
        window.addEventListener('keydown', handleKeyDown);

        const handleClickOutside = (event) =>
        {
            if (boardRef.current)
            {
                if (!boardRef.current.contains(event.target))
                    setSelectedCell(null);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);

        return () =>
        {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleKeyDown]);

    const handleCellClick = (r, c) =>
    {
        setSelectedCell({ r, c });
    };

    const getUserId = () =>
    {
        if (!user)
            return null;
            
        if (user.id)
            return user.id;
            
        if (user.user)
        {
            if (user.user.id)
                return user.user.id;
        }
        
        return null;
    };

    const currentUserId = getUserId();
    
    const getCurrentUserName = () => 
    {
        if (!user)
            return "Player";
            
        if (user.display_name)
            return user.display_name;
            
        if (user.username)
            return user.username;
            
        if (user.user)
        {
            if (user.user.display_name)
                return user.user.display_name;
                
            if (user.user.username)
                return user.user.username;
        }
        
        return "Player";
    };
    
    const currentUserName = getCurrentUserName();

    const handlePlayClick = (mode) =>
    {
        if (!user) 
        {
            setIsAuthRequiredOpen(true);
            return;
        }

        if (mode === 'online')
            setIsOnlineModalOpen(true);
        else
        {
            setDifficultyContext('OFFLINE');
            setIsDifficultyOpen(true);
        }
    };

    const handleOnlineCreateClick = () =>
    {
        setIsOnlineModalOpen(false);
        setDifficultyContext('ONLINE');
        setIsDifficultyOpen(true);
    };

    const handleCancelRoom = async (roomId) =>
    {
        try
        {
            const stateRes = await fetch(`/api/room/game-state/${roomId}`);
            const stateData = await stateRes.json();
            
            if (!stateData.success)
            {
                console.error("Room not found or already deleted.");
                setCreatedRoomId(null);
                return;
            }

            const dbOwnerId = stateData.ownerId;
            
            console.log(`DB Identity: ${dbOwnerId} | Current Identity: ${currentUserId}`);

            const response = await fetch(`/api/room/leave/${roomId}`,
            {
                method: 'DELETE',
                headers: 
                { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(
                { 
                    userId: dbOwnerId 
                })
            });
            
            const data = await response.json();
            
            if (data.success)
            {
                console.log("Room successfully deleted from database!");
                setCreatedRoomId(null);
            }
            else
                console.error("Backend rejected the deletion:", data.message);
        }
        catch (error)
        {
            console.error("Network error while deleting the room:", error);
        }
    };

    const handleJoinRoom = async (roomIdInput) =>
    {
        if (!roomIdInput)
        {
            alert("Please enter a Room ID");
            return;
        }
        if (!currentUserId)
        {
            alert("User ID not found. Please log in.");
            return;
        }

        setLoading(true);
        try
        {
            const data = await joinRoom(roomIdInput, currentUserId);
            
            let targetRoomId = data.roomId;
            if (data.room_id)
                targetRoomId = data.room_id;
                
            setCreatedRoomId(targetRoomId);
            setPlayerRole('guest');
            setIsOpponentJoined(true);
            setIsOnlineModalOpen(true);
        }
        catch (err)
        {
            console.error(err);
            alert("Error joining room: " + err.message);
            setIsOnlineModalOpen(false);
        }
        finally
        {
            setLoading(false);
        }
    };

    const [startTime, setStartTime] = useState(null);

    const handleDifficultySelect = async (difficulty) =>
    {
        setIsDifficultyOpen(false);
        setLoading(true);
        
        let levelStr = "Medium";
        if (difficulty === 1)
            levelStr = "Easy";
        else if (difficulty === 2)
            levelStr = "Medium";
        else if (difficulty === 3)
            levelStr = "Hard";
        else if (difficulty === 4)
            levelStr = "Expert";
        else if (difficulty === 5)
            levelStr = "Extreme";

        try
        {
            if (difficultyContext === 'OFFLINE')
            {
                const gameData = await startGame('offline', difficulty);
                const now = Date.now();
                setStartTime(now);
                navigate('/offline-game', { state: { gameData, difficulty, exactStartTime: now } });
            }
            else if (difficultyContext === 'ONLINE')
            {
                if (!currentUserId)
                    throw new Error("User not authenticated");

                const data = await createCombatRoom(currentUserId, String(difficulty), currentUserName);
                
                let roomId = null;
                if (data.roomId)
                    roomId = data.roomId;
                else if (data.room_id)
                    roomId = data.room_id;
                else if (data.id)
                    roomId = data.id;

                if (!roomId)
                    throw new Error("Failed to retrieve Room ID from server.");

                setCreatedRoomId(roomId);
                setPlayerRole('owner');
                setRoomDifficulty(levelStr);
                setIsOpponentJoined(false);
                setIsOnlineModalOpen(true);
            }
        }
        catch (error)
        {
            console.error("Game Start Error:", error);
            
            let errMsg = "An error occurred while starting the game.";
            if (error.message)
                errMsg = error.message;
                
            alert(errMsg);
        }
        finally
        {
            setLoading(false);
            setDifficultyContext(null);
        }
    };

   const handleCountdownComplete = (exactStartTime) => {
        setIsOnlineModalOpen(false);

        const finalStartTime = exactStartTime || Date.now();
        
        setStartTime(finalStartTime);
        
        navigate(`/online-game/${createdRoomId}`, { 
            state: { 
                role: playerRole, 
                exactStartTime: finalStartTime
            } 
        });
    };

    return (
        <PageContainer>
            
            <Navbar />
            
            <HeroSection>
                
                <DecorativeBoardWrapper ref={boardRef}>
                    <SudokuBoard 
                        board={boardData} 
                        selectedCell={selectedCell} 
                        onCellClick={handleCellClick}
                        showError={false}
                    />
                </DecorativeBoardWrapper>

                <DashboardContainer>
                    
                    <ActionsColumn>
                        
                        <OnlineCard onClick={() => handlePlayClick('online')}>
                            <IconWrapper>⚔️</IconWrapper>
                            <CardContent>
                                <h2>Play Combat</h2>
                                <p>Challenge friends or random opponents</p>
                            </CardContent>
                        </OnlineCard>

                        <OfflineCard onClick={() => handlePlayClick('offline')}>
                            <IconWrapper>🗡️</IconWrapper>
                            <CardContent>
                                <h2>Play Single</h2>
                                <p>Practice solo to improve your skills</p>
                            </CardContent>
                        </OfflineCard>

                    </ActionsColumn>
                    
                    <LeaderboardWrapper>
                        <Leaderboard />
                    </LeaderboardWrapper>
                    
                </DashboardContainer>
                
            </HeroSection>

            <Footer />

            <DifficultyModal 
                isOpen={isDifficultyOpen} 
                onClose={() => setIsDifficultyOpen(false)}
                onSelect={handleDifficultySelect}
                isLoading={loading}
            />
            
            <OnlineGameModal
                isOpen={isOnlineModalOpen}
                onClose={() => setIsOnlineModalOpen(false)}
                onCreate={handleOnlineCreateClick}
                onJoin={handleJoinRoom}
                onCancel={handleCancelRoom}
                isLoading={loading}
                createdRoomId={createdRoomId}
                isOpponentJoined={isOpponentJoined}
                onCountdownComplete={handleCountdownComplete}
                currentUserId={currentUserId}
            />

            <AuthRequiredModal 
                isOpen={isAuthRequiredOpen}
                onClose={() => setIsAuthRequiredOpen(false)}
                onOpenLogin={() => { setIsAuthRequiredOpen(false); setIsLoginOpen(true); }}
                onOpenSignUp={() => { setIsAuthRequiredOpen(false); setIsSignUpOpen(true); }}
            />

            <Login 
                isOpen={isLoginOpen} 
                onClose={() => setIsLoginOpen(false)} 
                onSwitchToSignup={() => { setIsLoginOpen(false); setIsSignUpOpen(true); }}
            />
            
            <SignUp 
                isOpen={isSignUpOpen} 
                onClose={() => setIsSignUpOpen(false)}
                onSwitchToLogin={() => { setIsSignUpOpen(false); setIsLoginOpen(true); }}
            />
            
        </PageContainer>
    );
};

export default Home;