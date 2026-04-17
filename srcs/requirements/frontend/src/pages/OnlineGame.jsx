import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import useGameLogic from '../hooks/useGameLogic';
import GameHeader from '../components/molecules/GameHeader';
import PlayerCard from '../components/molecules/PlayerCard';
import SudokuBoard from '../components/organisms/SudokuBoard';
import Numpad from '../components/molecules/Numpad';
import BackToHomeLink from '../components/atoms/BackToHomeLink';
import GameOverOverlay from '../components/organisms/GameOverOverlay';
import { getUserById } from '../services/userService'; 
import ExitConfirmModal from '../components/molecules/ExitConfirmModal';
import useGameExit from '../hooks/useGameExit';
import Footer from '../components/atoms/Footer';

const BASE_URL = '';

// --- STYLED COMPONENTS ---
const GameContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100vw;
    min-height: 100vh;
    padding-top: 40px;
    background-color: #f9fafb;
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
    box-sizing: border-box;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const GameMainArea = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-start; 
    gap: 32px;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px;

    @media (max-width: 950px)
    {
        flex-direction: column; 
        align-items: center;
        gap: 24px;
    }
`;

const PlayerColumn = styled.div`
    flex: 0 0 180px; 
    width: 180px;
    min-width: 180px;
    max-width: 180px;
    display: flex;
    justify-content: center;

    @media (max-width: 950px)
    {
        flex: 0 0 auto;
        width: 100%;
        min-width: auto;
        max-width: 450px;
    }
`;

const BoardWrapper = styled.div`
    flex: 0 0 auto;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    
    width: min(90vw, 450px); 
    aspect-ratio: 1 / 1; 

    & > * {
        width: 100% !important;
        height: 100% !important;
        max-width: 100% !important;
        max-height: 100% !important;
        box-sizing: border-box !important;
        margin: 0 !important;
    }
`;

const DualProgressContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: min(90vw, 450px);
    margin: 0 auto 24px auto;
`;

const StatsRow = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-bottom: 8px;
`;

const CenterStat = styled.span`
    color: #374151;
    font-size: 0.9rem;
    font-weight: bold;
    background: #e5e7eb;
    padding: 6px 16px;
    border-radius: 12px;
    text-align: center;
`;

const BarBackground = styled.div`
    position: relative;
    width: 100%;
    height: 24px; 
    background-color: #d1d5db; 
    border-radius: 12px;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);

    @media (max-width: 768px) {
        height: 28px;
    }
`;

const BarTextLeft = styled.span`
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: white;
    font-size: 0.85rem;
    font-weight: 900;
    z-index: 10;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.8); 
    
    @media (max-width: 768px) {
        font-size: 1rem;
    }
`;

const BarTextRight = styled.span`
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: white;
    font-size: 0.85rem;
    font-weight: 900;
    z-index: 10;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.8);

    @media (max-width: 768px) {
        font-size: 1rem;
    }
`;

const P1Fill = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: linear-gradient(90deg, #e74c3c, #c0392b);
    width: ${props => props.$pct}%;
    transition: width 0.4s ease-out;
    border-radius: 12px 0 0 12px;
`;

const P2Fill = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    background: linear-gradient(90deg, #3498db, #2980b9);
    width: ${props => props.$pct}%;
    transition: width 0.4s ease-out;
    border-radius: 0 12px 12px 0;
`;

const CenterToast = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(231, 76, 60, 0.95);
    color: white;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 1.2rem;
    font-weight: bold;
    z-index: 9999;
    transition: all 0.3s ease-in-out;
    pointer-events: none;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    text-align: center;

    opacity: ${props => props.$isVisible ? '1' : '0'};
    visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
`;

const ControlsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: min(90vw, 500px);
    margin: 24px auto 40px auto;
`;

// COMPONENT DEFINITION
const OnlineGame = () => 
{
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const ws = useRef(null);
    const boardRef = useRef(null); 
    const controlsRef = useRef(null);

    let isOwner = false;
    if (location.state && location.state.role === 'owner')
        isOwner = true;
    
    const [players, setPlayers] = useState({ 
        you: { displayName: 'Loading...', username: '', avatar: null }, 
        opponent: { displayName: 'Waiting...', username: '', avatar: null } 
    });

    const getAvatarUrl = (avatarPath) => 
    {
        if (!avatarPath)
            return null;
        if (avatarPath.startsWith('http'))
            return avatarPath;
        return `${BASE_URL}${avatarPath}`;
    };

    const sendOnlineMove = (row, col, value) => 
    {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) 
        {
            let currentRole = isOwner ? 'owner' : 'guest';
            ws.current.send(JSON.stringify({
                event: 'move',
                data: { roomId: roomId.toString(), role: currentRole, row, col, value }
            }));
        }
    };

    const { 
        board, timer, seconds, difficulty, lives, selectedCell, isGameOver,
        handleCellClick, handleInput, showError, errorMessage,
        setLives, updateBoardFromOpponent,
        setShowError, setErrorMessage,
        gameResult, setGameResult,
        setSelectedCell, 
        setStartTime,
        setDifficulty
    } = useGameLogic('online', sendOnlineMove, { 
        userId: user?.id ?? user?.user_id ?? null,
        username: players.you.username || user?.username || '', 
        opponent: players.opponent.username || '',
        role: isOwner ? 'owner' : 'guest'
    });

    const [opponentLives, setOpponentLives] = useState(3);
    const [playerMoves, setPlayerMoves] = useState(0);
    const [opponentMoves, setOpponentMoves] = useState(0);

    const { isExitModalOpen, handleBackClick, confirmExitGame, cancelExit } = useGameExit({
        isGameOver, gameResult, mode: 'online', difficulty, seconds,
        userId: user?.id ?? user?.user_id ?? null,
        username: players.you.username || user?.username,
        opponentUsername: players.opponent.username,
        wsRef: ws, roomId, isOwner
    });

    const totalCells = 81;

    let filledCells = 0;
    if (board && Array.isArray(board))
    {
        board.forEach(item => {
            if (Array.isArray(item))
            {
                item.forEach(cell => {
                    const val = typeof cell === 'object' ? cell?.value : cell;
                    if (val !== 0 && val !== null && val !== '')
                        filledCells++;
                });
            }
            else
            {
                const val = typeof item === 'object' ? item?.value : item;
                if (val !== 0 && val !== null && val !== '')
                    filledCells++;
            }
        });
    }
    
    const remainingCells = Math.max(0, totalCells - filledCells);
    const totalPlayableCells = playerMoves + opponentMoves + remainingCells;

    let p1Percentage = 0;
    let p2Percentage = 0;

    if (totalPlayableCells > 0)
    {
        p1Percentage = Math.min((playerMoves / totalPlayableCells) * 100, 100);
        p2Percentage = Math.min((opponentMoves / totalPlayableCells) * 100, 100);
    }

    useEffect(() => {
        if (location.state && location.state.exactStartTime)
            setStartTime(location.state.exactStartTime);
    }, [location.state, setStartTime]);

    useEffect(() => 
    {
        const handleClickOutside = (event) => 
        {
            if (isGameOver)
                return;

            let clickedOnBoard = boardRef.current && boardRef.current.contains(event.target);
            let clickedOnControls = controlsRef.current && controlsRef.current.contains(event.target);

            if (!clickedOnBoard && !clickedOnControls && setSelectedCell)
                setSelectedCell(null);
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setSelectedCell, isGameOver]);

    useEffect(() => 
    {
        const fetchNames = async () => 
        {
            try 
            {
                const res = await fetch(`/api/room/game-state/${roomId}`);
                const data = await res.json();
                
                if (data.success) 
                {
                    const oData = await getUserById(data.ownerId);
                    
                    let oName = oData.display_name || oData.nickname || oData.username || "Player 1";
                    let oUsername = oData.username || '';
                    const oAvatar = getAvatarUrl(oData.avatar);
                    
                    let gName = 'Waiting...';
                    let gAvatar = null;
                    let guestUsername = '';
                    
                    if (data.guestId) 
                    {
                        const gData = await getUserById(data.guestId);
                        gName = gData.display_name || gData.nickname || gData.username || "Player 2";
                        guestUsername = gData.username || '';
                        gAvatar = getAvatarUrl(gData.avatar);

                        if (isOwner)
                        {
                            setPlayers({ 
                                you: { displayName: oName, username: oUsername, avatar: oAvatar }, 
                                opponent: { displayName: gName, username: guestUsername, avatar: gAvatar } 
                            });
                        }
                        else
                        {
                            setPlayers({ 
                                you: { displayName: gName, username: guestUsername, avatar: gAvatar }, 
                                opponent: { displayName: oName, username: oUsername, avatar: oAvatar } 
                            });
                        }
                        return;
                    }

                    if (isOwner)
                    {
                        setPlayers({ 
                            you: { displayName: oName, username: oUsername, avatar: oAvatar }, 
                            opponent: { displayName: gName, username: '', avatar: gAvatar } 
                        });
                    }
                    else
                    {
                        setPlayers({ 
                            you: { displayName: gName, username: '', avatar: gAvatar }, 
                            opponent: { displayName: oName, username: oUsername, avatar: oAvatar } 
                        });
                    }
                }
            } 
            catch(e) 
            {
                setPlayers({ 
                    you: { displayName: 'You', username: user?.username || '', avatar: null }, 
                    opponent: { displayName: 'Opponent', username: '', avatar: null } 
                });
            }
        };
        fetchNames();
    }, [roomId, isOwner, user?.username]);

    useEffect(() => 
    {
        if (!roomId)
            return;
            
        ws.current = new WebSocket(`wss://${window.location.host}/api/play`);

        ws.current.onopen = () => {
            ws.current.send(JSON.stringify({ event: 'join_room', data: { roomId: roomId.toString() } }));
        };

        ws.current.onmessage = (event) => 
        {
            const message = JSON.parse(event.data);
            let myRole = isOwner ? 'owner' : 'guest';

            switch (message.event) 
            {
                case 'sync_game':
                    if (message.gameState) 
                    {
                        if (message.gameState.startTime)
                            setStartTime(new Date(message.gameState.startTime).getTime());
                        else
                            setStartTime(location.state.exactStartTime);

                        if (message.gameState.difficulty)
                            setDifficulty(message.gameState.difficulty);

                        if (message.gameState.currBoard)
                        {
                            updateBoardFromOpponent(message.gameState.currBoard);
                            
                            setPlayers(prev => 
                            {
                                if (isOwner && prev.opponent.displayName === 'Waiting...' && message.gameState.guestId) 
                                {
                                    getUserById(message.gameState.guestId).then(gData => 
                                    {
                                        let newGuestName = gData.display_name || gData.nickname || gData.username;
                                        let newGuestUsername = gData.username || '';
                                        const newGuestAvatar = getAvatarUrl(gData.avatar);
                                        
                                        setPlayers(p => ({ 
                                            ...p, 
                                            opponent: { displayName: newGuestName, username: newGuestUsername, avatar: newGuestAvatar } 
                                        }));
                                    });
                                }
                                return prev;
                            });
                        }
                    }
                    
                    if (isOwner)
                    {
                        setLives(message.ownerHealth);
                        setOpponentLives(message.guestHealth);
                        setPlayerMoves(message.ownerMoves || 0);
                        setOpponentMoves(message.guestMoves || 0);
                    }
                    else
                    {
                        setLives(message.guestHealth);
                        setOpponentLives(message.ownerHealth);
                        setPlayerMoves(message.guestMoves || 0);
                        setOpponentMoves(message.ownerMoves || 0);
                    }

                    if (message.valid === false && message.moveBy === myRole)
                    {
                        setErrorMessage("Wrong Move!");
                        setShowError(true);
                        setTimeout(() => setShowError(false), 1500);
                    }

                    if (message.winner || message.loser) 
                    {
                        let isMeWinner = false;
                        if (message.winner)
                        {
                            if (message.winner === myRole)
                                isMeWinner = true;
                        }
                        else if (message.loser)
                        {
                            if (message.loser !== myRole)
                                isMeWinner = true;
                        }

                        let delay = (message.valid === false && message.moveBy === myRole) ? 1500 : 0;
                        let finalRes = isMeWinner ? 'win' : 'lose';

                        setTimeout(() => {
                            setGameResult(prev => prev ? prev : finalRes);
                        }, delay);
                    }
                    break;
                
                case 'player_left':
                    setGameResult(prev => prev ? prev : 'win');
                    break;
                
                case 'error':
                    console.error('Server Error:', message.message);
                    break;

                default:
                    break;
            }
        };

        return () =>
        {
            if (ws.current)
                ws.current.close();
        };
    }, [roomId, isOwner]);

    let isGameDisabled = isGameOver || (gameResult !== null);

    return (
        <GameContainer>
            <ExitConfirmModal 
                isOpen={isExitModalOpen} 
                onClose={cancelExit}
                onConfirm={confirmExitGame} 
            />

            <CenterToast $isVisible={showError}>
                {errorMessage}
            </CenterToast>

            <GameOverOverlay result={gameResult} />
            <BackToHomeLink onClick={handleBackClick} />
            
            <GameHeader timer={timer} difficulty={difficulty} />
            
            <DualProgressContainer>
                <StatsRow>
                    <CenterStat>{remainingCells} Empty</CenterStat>
                </StatsRow>
                <BarBackground>
                    <BarTextLeft>{playerMoves} </BarTextLeft>
                    <P1Fill $pct={p1Percentage} />
                    
                    <P2Fill $pct={p2Percentage} />
                    <BarTextRight>{opponentMoves} </BarTextRight>
                </BarBackground>
            </DualProgressContainer>

            <GameMainArea>
                <PlayerColumn>
                    <PlayerCard 
                        title={players.you.displayName}
                        username={players.you.username}
                        avatar={players.you.avatar} 
                        lives={lives}
                    />
                </PlayerColumn>

                <BoardWrapper ref={boardRef}>
                    <SudokuBoard 
                        board={board}
                        selectedCell={selectedCell}
                        onCellClick={handleCellClick}
                        isGameOver={isGameDisabled}
                        showError={showError} 
                        errorMessage={errorMessage}
                    />
                </BoardWrapper>

                <PlayerColumn>
                    <PlayerCard 
                        title={players.opponent.displayName}
                        username={players.opponent.username}
                        avatar={players.opponent.avatar} 
                        lives={opponentLives}
                        align="right" 
                    />
                </PlayerColumn>
            </GameMainArea>

            <ControlsWrapper ref={controlsRef}>
                <Numpad 
                    onNumberClick={handleInput} 
                    disabled={isGameDisabled} 
                />
            </ControlsWrapper>

            <Footer />

        </GameContainer>
    );
};

export default OnlineGame;