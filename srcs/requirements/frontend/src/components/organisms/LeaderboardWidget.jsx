import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useLeaderboardWidget from '../../hooks/useLeaderboardWidget';
import LeaderboardRow from '../molecules/LeaderboardRow';

// STYLED COMPONENTS
const WidgetContainer = styled.div`
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    padding: 1.5rem;
    width: 100%;
    max-width: 400px;
    height: fit-content;
    border: 1px solid #eaeaea;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;
    box-sizing: border-box;

    &:hover
    {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    }

    @media (max-width: 950px)
    {
        max-width: 100%;
    }
`;

const WidgetHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #f0f2f5;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
`;

const WidgetTitle = styled.h3`
    margin: 0;
    color: #2c3e50;
    font-size: 1.5rem;
`;

const AllTimeButton = styled.button`
    font-size: 0.8rem;
    color: #ffffff;
    background: #16a34a;
    border: none;
    border-radius: 8px;
    padding: 8px 10px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover
    {
        background: #15803d;
    }
`;

const MetaInfo = styled.div`
    font-size: 0.8rem;
    color: #6b7280;
    margin-bottom: 0.8rem;
    font-weight: 600;
`;

const ModeSelectWrapper = styled.div`
    position: relative;
    margin-bottom: 1rem;
`;

const ModeSelectButton = styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    padding: 10px 12px;
    background: #ffffff;
    color: #374151;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;

    &:hover
    {
        border-color: #4ade80;
    }
`;

const ModeMenu = styled.div`
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    z-index: 20;
    overflow: hidden;
`;

const ModeMenuItem = styled.button`
    width: 100%;
    text-align: left;
    border: none;
    background: ${props => props.$active ? '#dcfce7' : '#ffffff'};
    color: ${props => props.$active ? '#166534' : '#374151'};
    padding: 10px 12px;
    font-size: 0.95rem;
    font-weight: ${props => props.$active ? '700' : '600'};
    cursor: pointer;

    &:hover
    {
        background: #f0fdf4;
    }
`;

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const StateMessage = styled.div`
    text-align: center;
    padding: 10px;
    color: #888;
`;

const MODES = ['Extreme', 'Expert', 'Hard', 'Medium', 'Easy'];

const formatCountdown = (nextResetAt) =>
{
    if (!nextResetAt)
        return 'Calculating reset...';

    const diff = new Date(nextResetAt).getTime() - Date.now();
    if (Number.isNaN(diff))
        return 'Calculating reset...';

    if (diff <= 0)
        return 'Resetting...';

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0)
        return `${days}d ${hours}h ${minutes}m`;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// COMPONENT DEFINITION
const LeaderboardWidget = () =>
{
    const navigate = useNavigate();
    const [mode, setMode] = useState('Extreme');
    const [countdownText, setCountdownText] = useState('Calculating reset...');
    const [resetTriggered, setResetTriggered] = useState(false);
    const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
    const modeSelectRef = useRef(null);
    const { players, loading, nextResetAt, refresh } = useLeaderboardWidget(mode);

    useEffect(() =>
    {
        const handleOutsideClick = (event) =>
        {
            if (modeSelectRef.current && !modeSelectRef.current.contains(event.target))
                setIsModeMenuOpen(false);
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    useEffect(() =>
    {
        setResetTriggered(false);
        setCountdownText(formatCountdown(nextResetAt));
    }, [nextResetAt]);

    useEffect(() =>
    {
        const timer = setInterval(() =>
        {
            const nextText = formatCountdown(nextResetAt);
            setCountdownText(nextText);

            if (nextText === 'Resetting...' && !resetTriggered)
            {
                setResetTriggered(true);
                refresh();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [nextResetAt, refresh, resetTriggered]);

    const listContent = useMemo(() =>
    {
        if (players && players.length > 0)
        {
            return players.map((player, index) => (
                <LeaderboardRow
                    key={`${player.username}-${index}`}
                    player={player}
                    index={index}
                />
            ));
        }

        return (
            <StateMessage>
                No records yet.
            </StateMessage>
        );
    }, [players]);


    if (loading)
    {
        return (
            <WidgetContainer>
                <StateMessage>
                    Loading...
                </StateMessage>
            </WidgetContainer>
        );
    }

    return (
        <WidgetContainer>
            
            <WidgetHeader>
                <WidgetTitle>
                    🏆 Weekly Leaderboard
                </WidgetTitle>
                <AllTimeButton
                    type="button"
                    onClick={() => navigate('/leaderboard')}
                    title="Go to Hall of Fame"
                >
                    All Time Rankings
                </AllTimeButton>
            </WidgetHeader>

            <MetaInfo>
                Weekly reset: {countdownText}
            </MetaInfo>

            <ModeSelectWrapper
                ref={modeSelectRef}
                onClick={(e) => e.stopPropagation()}
            >
                <ModeSelectButton
                    type="button"
                    onClick={() => setIsModeMenuOpen(prev => !prev)}
                >
                    {mode}
                    <span>{isModeMenuOpen ? '▲' : '▼'}</span>
                </ModeSelectButton>

                {isModeMenuOpen && (
                    <ModeMenu>
                        {MODES.map((difficultyMode) => (
                            <ModeMenuItem
                                key={difficultyMode}
                                type="button"
                                $active={difficultyMode === mode}
                                onClick={() =>
                                {
                                    setMode(difficultyMode);
                                    setIsModeMenuOpen(false);
                                }}
                            >
                                {difficultyMode}
                            </ModeMenuItem>
                        ))}
                    </ModeMenu>
                )}
            </ModeSelectWrapper>
            
            <ListContainer>
                {listContent}
            </ListContainer>
            
        </WidgetContainer>
    );
};

export default LeaderboardWidget;