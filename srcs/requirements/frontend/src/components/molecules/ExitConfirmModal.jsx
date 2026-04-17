import React from 'react';
import styled from 'styled-components';

// --- STYLED COMPONENTS ---
const ExitModalOverlay = styled.div`
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
`;

const ExitModalBox = styled.div`
    background: white;
    padding: 4vmin;
    border-radius: 2vmin;
    text-align: center;
    max-width: 400px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    animation: fadeIn 0.2s ease-out;

    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
`;

const ExitModalTitle = styled.h2`
    color: #e74c3c;
    margin-top: 0;
    font-size: 2.5rem;
    margin-bottom: 15px;
`;

const ExitModalText = styled.p`
    font-size: 1.2rem;
    color: #2c3e50;
    margin-bottom: 30px;
    line-height: 1.5;
`;

const ExitBtnGroup = styled.div`
    display: flex;
    justify-content: center;
    gap: 15px;
`;

const CancelBtn = styled.button`
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    background: #95a5a6;
    color: white;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
    &:hover { background: #7f8c8d; }
`;

const SurrenderBtn = styled.button`
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    background: #e74c3c;
    color: white;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
    &:hover { background: #c0392b; }
`;

// --- COMPONENT ---
const ExitConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <ExitModalOverlay>
            <ExitModalBox>
                <ExitModalTitle>Warning!</ExitModalTitle>
                <ExitModalText>
                    Are you sure you want to leave? If you <b>leave</b> the match now, you will automatically <b>lose</b> the game.
                </ExitModalText>
                <ExitBtnGroup>
                    <CancelBtn onClick={onClose}>Cancel</CancelBtn>
                    <SurrenderBtn onClick={onConfirm}>Leave & Lose</SurrenderBtn>
                </ExitBtnGroup>
            </ExitModalBox>
        </ExitModalOverlay>
    );
};

export default ExitConfirmModal;