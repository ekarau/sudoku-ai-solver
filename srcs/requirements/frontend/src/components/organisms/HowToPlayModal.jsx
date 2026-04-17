import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// --- STYLED COMPONENTS ---

export const HowToPlayButton = styled.button`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 28px;
    border-radius: 35px;
    font-size: 20px;
    font-weight: 700;
    background: linear-gradient(135deg, #338437 60%, #37e831 100%);
    color: #fff;
    border: 2px solid #29972d;
    box-shadow: 0 4px 12px rgba(51, 132, 55, 0.15);
    cursor: pointer;
    transition: all 0.2s;
    outline: none;
    position: relative;

    &:hover {
        background: linear-gradient(135deg, #29972d 60%, #37e831 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(51, 132, 55, 0.22);
    }

    .how-to-play-icon
    {
        font-size: 1.5em;
        margin-right: 6px;
        display: flex;
        align-items: center;
    }

    @media (max-width: 768px)
    {
        padding: 8px 20px;
        font-size: 16px;
        gap: 8px;
    }

    @media (max-width: 480px)
    {
        padding: 7px 14px;
        font-size: 14px;
        gap: 6px;
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    padding: 16px;
    box-sizing: border-box;
`;

const ModalContent = styled.div`
    position: relative;
    background: #ffffff;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    animation: fadeIn 0.3s ease-out forwards;
    box-sizing: border-box;

    @keyframes fadeIn
    {
        from
        {
            opacity: 0;
            transform: translateY(20px);
        }
        to
        {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 480px)
    {
        padding: 18px 14px;
        border-radius: 12px;
    }

    @media (max-width: 375px)
    {
        padding: 14px 10px;
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #29972d 60%, #37e831 100%);
    color: #fff;
    font-size: 1.5rem;
    font-weight: 900;
    box-shadow: 0 2px 8px rgba(51, 132, 55, 0.13);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, transform 0.1s;
    z-index: 10;
    flex-shrink: 0;

    &:hover
    {
        background: linear-gradient(135deg, #338437 60%, #37e831 100%);
        transform: scale(1.05);
    }

    &:active
    {
        transform: scale(0.95);
    }

    @media (max-width: 480px)
    {
        top: 10px;
        right: 10px;
        width: 32px;
        height: 32px;
        min-width: 32px;
        min-height: 32px;
    }
`;

const Title = styled.h2`
    text-align: center;
    color: #29972d;
    margin-bottom: 20px;
    font-weight: 900;
    font-size: 2.1rem;
    letter-spacing: -1px;
    margin-top: 8px;
    padding-right: 40px;

    @media (max-width: 480px)
    {
        font-size: 1.6rem;
        margin-bottom: 16px;
    }

    @media (max-width: 375px)
    {
        font-size: 1.4rem;
        margin-bottom: 12px;
    }
`;

const SectionWrapper = styled.div`
    margin-bottom: 24px;

    &:last-child
    {
        margin-bottom: 0;
    }

    @media (max-width: 480px)
    {
        margin-bottom: 18px;
    }
`;

const SectionTitle = styled.h3`
    color: #338437;
    font-weight: 800;
    font-size: 1.3rem;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;

    @media (max-width: 480px)
    {
        font-size: 1.1rem;
        gap: 6px;
    }

    @media (max-width: 375px)
    {
        font-size: 1rem;
    }
`;

const InfoBox = styled.div`
    background: #f4f8f4;
    border-radius: 10px;
    padding: 14px 18px;
    font-size: 1.08rem;
    color: #222;
    border: 1.5px solid #e0e0e0;
    line-height: 1.5;

    b
    {
        font-weight: 700;
        color: #1a6b1e;
    }

    @media (max-width: 480px)
    {
        padding: 10px 12px;
        font-size: 0.95rem;
        line-height: 1.45;
    }

    @media (max-width: 375px)
    {
        padding: 8px 10px;
        font-size: 0.88rem;
    }
`;

const AIButton = styled.button`
    width: 100%;
    margin-top: 12px;
    padding: 14px 24px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
    }

    @media (max-width: 480px) {
        font-size: 0.95rem;
        padding: 11px 16px;
    }
`;

// --- COMPONENT ---

const HowToPlayModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleAIClick = () =>
    {
        onClose();
        navigate('/ai-solver');
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose} aria-label="Kapat">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="10" fill="none"/>
                        <path d="M6.7 6.7L13.3 13.3M13.3 6.7L6.7 13.3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
                    </svg>
                </CloseButton>

                <div>
                    <Title>How to Play?</Title>
                    
                    <SectionWrapper>
                        <SectionTitle>
                            <span role="img" aria-label="single">🗡️</span> Singleplayer Mode
                        </SectionTitle>
                        <InfoBox>
                            Sudoku is a 9x9 grid. This grid is divided by bold lines into 9 separate 3x3 boxes. The goal of the game is to fill the empty cells with numbers from 1 to 9.
                            Each number from 1 to 9 must appear only once in <b>every row</b>, <b>every column</b>, and <b>every 3x3 box</b>.
                        </InfoBox>
                    </SectionWrapper>

                    <SectionWrapper>
                        <SectionTitle>
                            <span role="img" aria-label="multi">⚔️</span> Multiplayer Mode
                        </SectionTitle>
                        <InfoBox>
                            You and your opponent <b>race</b> to solve the same sudoku puzzle.<br />
                            Each player starts with <b>3 lives</b> and loses 1 life for every mistake.<br />
                            A player who loses all their lives is defeated and the other wins; or, after the puzzle is solved, the player with <b>more correct moves</b> wins.
                        </InfoBox>
                    </SectionWrapper>

                    <SectionWrapper>
                        <SectionTitle>
                            <span role="img" aria-label="ai">🧠</span> AI Solver
                        </SectionTitle>
                        <InfoBox>
                            Watch how AI algorithms solve Sudoku step by step!
                            Choose between <b>Genetic Algorithm</b> or <b>Simulated Annealing</b> and observe the solving process in real-time.
                        </InfoBox>
                        <AIButton onClick={handleAIClick}>
                            🤖 Learn with AI
                        </AIButton>
                    </SectionWrapper>
                </div>
            </ModalContent>
        </ModalOverlay>
    );
};

export default HowToPlayModal;