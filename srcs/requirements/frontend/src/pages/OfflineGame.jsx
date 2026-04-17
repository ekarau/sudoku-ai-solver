import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import useGameLogic from '../hooks/useGameLogic';
import GameHeader from '../components/molecules/GameHeader';
import PlayerCard from '../components/molecules/PlayerCard';
import SudokuBoard from '../components/organisms/SudokuBoard';
import Numpad from '../components/molecules/Numpad';
import HintModal from '../components/molecules/HintModal';
import ActionBtn from '../components/atoms/ActionBtn';
import BackToHomeLink from '../components/atoms/BackToHomeLink';
import GameOverOverlay from '../components/organisms/GameOverOverlay';
import { getUserById } from '../services/userService';
import ExitConfirmModal from '../components/molecules/ExitConfirmModal';
import useGameExit from '../hooks/useGameExit';
import Footer from '../components/atoms/Footer';

// STYLED COMPONENTS
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

const SideColumn = styled.div`
    flex: 0 0 180px; 
    width: 180px;
    min-width: 180px;
    max-width: 180px;
    display: flex;
    justify-content: center;
    padding-top: 10px;

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

const ControlsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 450px;
    margin: 24px auto 40px auto;
`;

const ControlsArea = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;
`;

const ModeCardWrapper = styled.div`
    background-color: #f3f7ff;
    padding: 12%; 
    border-radius: 16px;
    width: 100%;
    aspect-ratio: 3 / 4;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8%;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    box-sizing: border-box;

    @media (max-width: 950px)
    {
        aspect-ratio: auto;
        width: 100%;
        height: auto;
        flex-direction: row; 
        justify-content: flex-start; 
        padding: 12px 20px;
        gap: 16px;
        border-radius: 12px;
    }
`;

const ModeCardTitle = styled.div`
    font-weight: bold;
    font-size: 1.15rem;
    color: #111827;

    @media (max-width: 950px)
    {
        font-size: 1.1rem;
    }
`;

const ModeText = styled.div`
    font-size: 0.95rem;
    font-weight: bold;
    color: #6b7280;

    @media (max-width: 950px)
    {
        font-size: 0.85rem;
    }
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

// COMPONENT DEFINITION
const OfflineGame = () => 
{
    const location = useLocation();
    const { user } = useAuth();
    
    const boardRef = useRef(null);
    const controlsRef = useRef(null); 
    
    const [playerName, setPlayerName] = useState('You');
    const [playerAvatar, setPlayerAvatar] = useState(null);

    let logicUsername = playerName;
    if (user)
    {
        if (user.username)
            logicUsername = user.username;
    }

    useEffect(() =>
    {
        if (user)
        {
            if (user.display_name)
                setPlayerName(user.display_name);
            else if (user.username)
                setPlayerName(user.username);

            if (user.avatar)
                setPlayerAvatar(user.avatar);
            else if (user.avatar_url)
                setPlayerAvatar(user.avatar_url);
        }
    }, [user]);

    const logicUserId = user?.id ?? user?.user_id ?? null;

    const { 
        board, timer, seconds, difficulty, lives, selectedCell, isGameOver,
        handleCellClick, handleInput, showError, errorMessage,
        isHintModalOpen, hintData, handleHint, applyHint,
        gameResult,
        setSelectedCell,
        setStartTime
    } = useGameLogic('offline', null, { username: logicUsername, userId: logicUserId });

    const { isExitModalOpen, handleBackClick, confirmExitGame, cancelExit } = useGameExit({
        isGameOver,
        gameResult,
        mode: 'offline',
        difficulty,
        seconds,
        username: logicUsername,
        userId: logicUserId,
        opponentUsername: 'Computer'
    });

    useEffect(() => {
        if (location.state && location.state.exactStartTime)
            setStartTime(location.state.exactStartTime);
        else
            setStartTime(Date.now());
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
        if (location.state)
        {
            if (location.state.userId)
            {
                getUserById(location.state.userId).then(data => 
                {
                    let finalName = "Player";
                    
                    if (data.display_name)
                        finalName = data.display_name;
                    else if (data.nickname)
                        finalName = data.nickname;
                    else if (data.username)
                        finalName = data.username;

                    let finalAvatar = null;
                    if (data.avatar)
                        finalAvatar = data.avatar;
                    else if (data.avatar_url)
                        finalAvatar = data.avatar_url;
                        
                    setPlayerName(finalName);
                    setPlayerAvatar(finalAvatar);
                }).catch(() => {});
            }
            else if (location.state.username)
                setPlayerName(location.state.username);
        }
    }, [location.state]);

    // LOGIC-DRIVEN RENDERING
    let winnerName = "Computer";
    if (gameResult === 'win')
        winnerName = playerName;

    let loserName = "Computer";
    if (gameResult === 'lose')
        loserName = playerName;

    let isGameDisabled = false;
    if (isGameOver)
        isGameDisabled = true;
    else if (gameResult !== null)
        isGameDisabled = true;

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
            
            <GameOverOverlay 
                result={gameResult} 
                winnerName={winnerName} 
                loserName={loserName} 
            />

            <BackToHomeLink onClick={handleBackClick} />
            
            <GameHeader 
                timer={timer} 
                difficulty={difficulty} 
            />

            <GameMainArea>

                <SideColumn>
                    <PlayerCard 
                        title={playerName} 
                        lives={lives} 
                        avatar={playerAvatar}
                    />
                </SideColumn>

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

                <SideColumn>
                    <ModeCardWrapper>
                        <ModeCardTitle>Mode</ModeCardTitle>
                        <ModeText>Single</ModeText>
                    </ModeCardWrapper>
                </SideColumn>
                
            </GameMainArea>

            <ControlsWrapper ref={controlsRef}>
                <ControlsArea>
                    <ActionBtn onClick={handleHint} disabled={isGameDisabled}>
                        Hint
                    </ActionBtn>
                    <Numpad onNumberClick={handleInput} disabled={isGameDisabled} />
                </ControlsArea>
            </ControlsWrapper>

            <HintModal 
                isOpen={isHintModalOpen} 
                data={hintData} 
                onApply={applyHint} 
            />

            <Footer />

        </GameContainer>
    );
};

export default OfflineGame;