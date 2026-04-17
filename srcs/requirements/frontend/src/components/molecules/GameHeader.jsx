import React from 'react';
import styled from 'styled-components';

// STYLED COMPONENTS
const HeaderContainer = styled.div`
    padding-top: 50px;
    display: flex;
    justify-content: space-between;
    gap: clamp(10px, 2vw, 16px);
    margin-bottom: clamp(16px, 3vw, 24px);
    
    width: 100%;
    max-width: 450px; 
    
    @media (max-width: 768px)
    {
        max-width: 90vw;
    }
`;

const BaseBadge = styled.div`
    padding: clamp(8px, 2vw, 12px) 0;
    border-radius: 8px;
    
    font-size: clamp(1rem, 4vw, 1.25rem);
    font-weight: bold;
    width: 48%;
    text-align: center;
    box-shadow: 0 3px 6px rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const TimerBadge = styled(BaseBadge)`
    background-color: #ecf0f1; 
    border: 2px solid #bdc3c7;
    color: #2c3e50;
`;

const DifficultyBadge = styled(BaseBadge)`
    color: #ffffff;
    font-size: clamp(0.9rem, 3.5vw, 1.15rem);
    transition: background-color 0.3s ease, border-color 0.3s ease;
    
    background-color: ${props => props.$bg};
    border: 2px solid ${props => props.$border};
`;

// COMPONENT DEFINITION
const GameHeader = ({ timer, difficulty }) => 
{
    let bgColor = '#95a5a6';
    let borderColor = '#7f8c8d';
    let diffLabel = 'Unknown';

    if (difficulty)
    {
        const d = String(difficulty).toLowerCase();
        diffLabel = String(difficulty);

        if (d === '1' || d === 'easy')
        {
            bgColor = '#31e67c';
            borderColor = '#0ebf57';
            diffLabel = 'Easy';
        }
        else if (d === '2' || d === 'medium')
        {
            bgColor = '#28a4f6';
            borderColor = '#2980b9';
            diffLabel = 'Medium';
        }
        else if (d === '3' || d === 'hard')
        {
            bgColor = '#faca08';
            borderColor = '#f39c12';
            diffLabel = 'Hard';
        }
        else if (d === '4' || d === 'expert')
        {
            bgColor = '#f17406';
            borderColor = '#d35400';
            diffLabel = 'Expert';
        }
        else if (d === '5' || d === 'extreme')
        {
            bgColor = '#f5250d';
            borderColor = '#a21607';
            diffLabel = 'Extreme';
        }
    }

    let displayTimer = timer;
    if (typeof timer === 'number')
    {
        const m = Math.floor(timer / 60).toString().padStart(2, '0');
        const s = (timer % 60).toString().padStart(2, '0');
        displayTimer = `${m}:${s}`;
    }

    return (
        <HeaderContainer>
            
            <TimerBadge>
                ⏱ {displayTimer}
            </TimerBadge>

            <DifficultyBadge $bg={bgColor} $border={borderColor}>
                {diffLabel}
            </DifficultyBadge>
            
        </HeaderContainer>
    );
};

export default GameHeader;