import React from 'react';
import styled from 'styled-components';

// STYLED COMPONENTS
const NumpadGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 6px; 
    margin-top: 12px;
    width: 100%;
    max-width: 420px; 

    @media (max-width: 768px)
    {
        grid-template-columns: repeat(3, 1fr);
        max-width: 120px; 
        gap: 6px;
    }
`;

const NumKey = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    
    width: 100%; 
    font-size: 1.25rem; 
    font-weight: 700;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #ffffff;
    background-color: #34495e;
    
    border: none;
    border-radius: 6px; 
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;
    outline: none;

    box-shadow: 0 3px 0 #1a252f;

    &:hover:not(:disabled)
    {
        background-color: #2c3e50;
        transform: translateY(-2px);
        box-shadow: 0 5px 0 #1a252f;
    }

    &:active:not(:disabled)
    {
        transform: translateY(2px);
        box-shadow: 0 1px 0 #cbd1d6;
    }

    &:disabled
    {
        background-color: #9ca3af;
        box-shadow: 0 3px 0 #6b7280;
        cursor: not-allowed;
        opacity: 0.6;
    }

    @media (max-width: 768px)
    {
        font-size: 1rem; 
        border-radius: 6px;
    }
`;

// COMPONENT DEFINITION (Aynı kalıyor)
const Numpad = ({ onNumberClick, disabled }) => 
{
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
        <NumpadGrid>
            {numbers.map((num) => (
                <NumKey 
                    key={num} 
                    disabled={disabled}
                    onClick={(e) => 
                    {
                        e.stopPropagation(); 
                        onNumberClick(num);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    {num}
                </NumKey>
            ))}
        </NumpadGrid>
    );
};

export default Numpad;