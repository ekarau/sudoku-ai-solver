import React from 'react';
import styled, { keyframes } from 'styled-components';

// ANIMATIONS
const fadeIn = keyframes`
    from 
    { 
        opacity: 0; 
        transform: scale(0.95) translateY(-20px); 
    }
    to 
    { 
        opacity: 1; 
        transform: scale(1) translateY(0); 
    }
`;

// STYLED COMPONENTS
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    font-family: inherit;
`;

const ModalBox = styled.div`
    background-color: white;
    padding: 2.5rem;
    border-radius: 16px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    text-align: center;
    animation: ${fadeIn} 0.3s ease-out;
`;

const Title = styled.h2`
    margin-bottom: 2rem;
    color: #2c3e50;
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 0;
`;

const ButtonGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const DifficultyButton = styled.button`
    padding: 15px;
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, filter 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    
    background-color: ${props => props.$bgColor};

    &:hover
    {
        filter: brightness(1.1);
        transform: translateY(-2px);
    }
`;

const CloseButton = styled.button`
    margin-top: 2rem;
    background: none;
    border: none;
    color: #5e6767;
    cursor: pointer;
    font-size: 1.2rem;
    text-decoration: underline;
    padding: 5px;
    padding-right: 15px;
    transition: color 0.2s;

    &:hover
    {
        color: #1e2c39;
    }
`;

// COMPONENT DEFINITION
const DifficultyModal = ({ isOpen, onClose, onSelect }) => 
{
    if (!isOpen)
        return null;

    const levels = [
        { level: 1, label: 'Easy', color: '#31e67c' },
        { level: 2, label: 'Medium', color: '#28a4f6' },
        { level: 3, label: 'Hard', color: '#faca08' },
        { level: 4, label: 'Expert', color: '#f17406' },
        { level: 5, label: 'Extreme', color: '#f5250d' },
    ];

    return (
        <Overlay onClick={onClose}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
                
                <Title>
                    Select Difficulty
                </Title>
                
                <ButtonGrid>
                    {levels.map((item) => (
                        <DifficultyButton
                            key={item.level}
                            $bgColor={item.color}
                            onClick={() => onSelect(item.level)}
                        >
                            {item.label}
                        </DifficultyButton>
                    ))}
                </ButtonGrid>
                
                <CloseButton onClick={onClose}>
                    Cancel
                </CloseButton>
                
            </ModalBox>
        </Overlay>
    );
};

export default DifficultyModal;