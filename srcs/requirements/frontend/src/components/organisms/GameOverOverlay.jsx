import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// ANIMATIONS
const fadeIn = keyframes`
    from 
    { 
        opacity: 0; 
    } 
    to 
    { 
        opacity: 1; 
    }
`;

const fall = keyframes`
    to 
    { 
        transform: translateY(110vh) rotate(360deg); 
    }
`;

// STYLED COMPONENTS
const OverlayWrapper = styled.div`
    position: absolute;
    top: 0; 
    left: 0; 
    right: 0; 
    bottom: 0;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    animation: ${fadeIn} 1s ease forwards;

    background: ${props => 
    {
        if (props.$isWin)
            return 'rgba(255, 215, 0, 0.2)';
            
        return 'rgba(40, 0, 0, 0.6)';
    }};

`;

const EffectContainer = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    top: -10%;
    pointer-events: none;
`;

const ConfettiPiece = styled.div`
    position: absolute;
    width: 10px;
    height: 20px;
    animation: ${fall} 3s linear infinite;
    
    background-color: ${props => props.$color};
    left: ${props => props.$left}%;
    animation-delay: ${props => props.$delay}s;
`;

const RainDrop = styled.div`
    position: absolute;
    width: 2px;
    height: 50px;
    background: rgba(255, 255, 255, 0.3);
    animation: ${fall} 1s linear infinite;

    left: ${props => props.$left}%;
    animation-delay: ${props => props.$delay}s;
`;

const ContentBox = styled.div`
    background: var(--bg-color, #1a1a2e);
    padding: 3rem;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    z-index: 10;
    border: 2px solid rgba(255,255,255,0.1);
`;

const ResultTitle = styled.h1`
    font-size: 3rem;
    margin-bottom: 1rem;
    margin-top: 0;

    color: ${props => 
    {
        if (props.$isWin)
            return '#ffd700';
            
        return '#ff4444';
    }};

    text-shadow: ${props => 
    {
        if (props.$isWin)
            return '0 0 10px #ffd700';
            
        return '0 0 10px #ff0000';
    }};
`;

const ResultSubtitleWrapper = styled.div`
    margin-top: 10px;
    margin-bottom: 20px;
`;

const ResultSubtitleText = styled.h2`
    font-size: 2rem;
    margin: 0;

    color: ${props => 
    {
        if (props.$isWin)
            return '#ffd700';
            
        return '#ff4444';
    }};
`;

const HomeButton = styled.button`
    margin-top: 2rem;
    padding: 10px 20px;
    font-size: 1.2rem;
    background: #4a4e69;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover
    {
        background: #9a8c98;
    }
`;

// COMPONENT DEFINITION
const GameOverOverlay = ({ result }) => 
{
    const navigate = useNavigate();

    if (!result)
        return null;

    let isWin = false;
    if (result === 'win')
        isWin = true;

    let backgroundEffects = null;
    
    if (isWin)
    {
        const confettiElements = [];
        
        for (let i = 0; i < 20; i++)
        {
            let colorHex = '#f00'; 
            
            if (i % 5 === 1) 
                colorHex = '#0f0';
            else if (i % 5 === 2) 
                colorHex = '#00f';
            else if (i % 5 === 3) 
                colorHex = '#ff0';
            else if (i % 5 === 4) 
                colorHex = '#0ff';

            const randomLeft = Math.random() * 100;
            const randomDelay = Math.random() * 2;

            confettiElements.push(
                <ConfettiPiece 
                    key={i} 
                    $color={colorHex} 
                    $left={randomLeft} 
                    $delay={randomDelay} 
                />
            );
        }
        
        backgroundEffects = (
            <EffectContainer>
                {confettiElements}
            </EffectContainer>
        );
    }
    else
    {
        const rainElements = [];
        
        for (let i = 0; i < 20; i++)
        {
            const randomLeft = Math.random() * 100;
            const randomDelay = Math.random() * 2;

            rainElements.push(
                <RainDrop 
                    key={i} 
                    $left={randomLeft} 
                    $delay={randomDelay} 
                />
            );
        }
        
        backgroundEffects = (
            <EffectContainer>
                {rainElements}
            </EffectContainer>
        );
    }

    // TEXT LOGIC
    let titleText = '💀 DEFEAT 💀';
    if (isWin)
        titleText = '🏆 VICTORY 🏆';

    let subtitleText = 'You Lose!';
    if (isWin)
        subtitleText = 'You Win!';

    return (
        <OverlayWrapper $isWin={isWin}>
            
            {backgroundEffects}

            <ContentBox>
                
                <ResultTitle $isWin={isWin}>
                    {titleText}
                </ResultTitle>
                
                <ResultSubtitleWrapper>
                    <ResultSubtitleText $isWin={isWin}>
                        {subtitleText}
                    </ResultSubtitleText>
                </ResultSubtitleWrapper>

                <HomeButton onClick={() => navigate('/')}>
                    Back to Home
                </HomeButton>
                
            </ContentBox>
            
        </OverlayWrapper>
    );
};

export default GameOverOverlay;