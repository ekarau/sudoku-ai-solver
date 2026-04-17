import React from 'react';
import styled, { keyframes } from 'styled-components';

// ANIMATIONS
const fadeIn = keyframes`
    from
    {
        opacity: 0;
        transform: translateY(-20px);
    }
    to
    {
        opacity: 1;
        transform: translateY(0);
    }
`;

// STYLED COMPONENTS
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
`;

const ModalContainer = styled.div`
    background-color: white;
    padding: 30px;
    border-radius: 20px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    text-align: center;
    border: 1px solid #fee2e2;
    animation: ${fadeIn} 0.3s ease-out;
`;

const Title = styled.h3`
    color: #dc2626;
    font-size: 1.5rem;
    margin-bottom: 10px;
    font-weight: 700;
    margin-top: 0;
`;

const Message = styled.p`
    color: #4b5563;
    font-size: 1rem;
    margin-bottom: 25px;
    line-height: 1.5;
`;

const Actions = styled.div`
    display: flex;
    justify-content: center;
    gap: 15px;
`;

const BaseButton = styled.button`
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
`;

const CancelButton = styled(BaseButton)`
    background-color: #f3f4f6;
    color: #374151;

    &:hover
    {
        background-color: #e5e7eb;
    }
`;

const ConfirmButton = styled(BaseButton)`
    background-color: #dc2626;
    color: white;

    &:hover
    {
        background-color: #b91c1c;
    }
`;

// COMPONENT DEFINITION
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => 
{
    if (!isOpen)
        return null;

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                
                <Title>
                    {title}
                </Title>
                
                <Message>
                    {message}
                </Message>
                
                <Actions>
                    <CancelButton onClick={onClose}>
                        Cancel
                    </CancelButton>
                    <ConfirmButton onClick={onConfirm}>
                        Delete Account
                    </ConfirmButton>
                </Actions>
                
            </ModalContainer>
        </Overlay>
    );
};

export default ConfirmationModal;