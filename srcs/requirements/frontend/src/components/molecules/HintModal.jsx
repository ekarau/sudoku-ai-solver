import React from 'react';
import styled from 'styled-components';

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
    z-index: 2000;
`;

const ModalContent = styled.div`
    background-color: white;
    padding: 25px;
    border-radius: 15px;
    width: 90%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
`;

const Title = styled.div`
    font-size: 1.5rem;
    color: #2c3e50;
    margin-bottom: 15px;
    font-weight: bold;
`;

const Message = styled.p`
    font-size: 1rem;
    color: #555;
    margin-bottom: 25px;
    line-height: 1.5;
`;

const ValueDisplay = styled.div`
    font-size: 2rem;
    font-weight: bold;
    margin: 10px 0;
    color: #2980b9;
`;

const ApplyButton = styled.button`
    background-color: #27ae60;
    color: white;
    border: none;
    padding: 10px 30px;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover
    {
        background-color: #2ecc71;
    }
`;

// COMPONENT DEFINITION
const HintModal = ({ isOpen, data, onApply }) => 
{
    if (!isOpen)
        return null;

    if (!data)
        return null;

    return (
        <Overlay>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                
                <Title>
                    💡 Hint Found!
                </Title>
                
                <Message>
                    {data.message}
                </Message>
                
                <ValueDisplay>
                    {data.value}
                </ValueDisplay>
                
                <ApplyButton onClick={onApply}>
                    Apply Hint
                </ApplyButton>
                
            </ModalContent>
        </Overlay>
    );
};

export default HintModal;