import React from 'react';
import styled from 'styled-components';

// STYLED COMPONENTS
const CellContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    box-sizing: border-box;

    font-size: clamp(14px, 4.5vw, 28px);
    
    font-weight: bold;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.1s;
    
    border-right: ${props => props.$isThickRight ? '3px solid #091420' : '1px solid #8c8d8f'};
    border-bottom: ${props => props.$isThickBottom ? '3px solid #091420' : '1px solid #8c8d8f'};
    
    &:nth-child(9n) 
    {
        border-right: none;
    }
    
    &:nth-child(n+73) 
    {
        border-bottom: none;
    }

    background-color: ${props => 
    {
        if (props.$isSelected)
            return '#2ecc71';
        else if (props.$isSameNumber)
            return '#a3e4d7';
        else if (props.$isHighlighted)
            return '#d1f2eb';
        else if (props.$isError)
            return '#ffcdd2';
        else if (props.$isFixed)
            return '#ffffff';
            
        return 'transparent';
    }};

    color: ${props => 
    {
        if (props.$isSelected)
            return '#ffffff';
        else if (props.$isSameNumber)
            return '#0f4f42';
        else if (props.$isError)
            return '#c62828';
            
        return '#2c3e50';
    }};

    &:hover 
    {
        background-color: ${props => 
        {
            if (props.$isSelected)
                return '#2ecc71';
            else if (props.$isFixed)
                return '#ffffff';
            else if (props.$isError)
                return '#ffcdd2';
                
            return '#e3f2fd';
        }};
    }
    
    @media (max-width: 768px)
    {
        font-size: clamp(16px, 6vw, 24px);
    }
`;

// COMPONENT DEFINITION
const SudokuCell = ({ 
    value, 
    isFixed, 
    isError, 
    isSelected, 
    isHighlighted, 
    isSameNumber, 
    onClick,
    $isThickRight,
    $isThickBottom 
}) => 
{
    return (
        <CellContainer
            onClick={onClick}
            $isFixed={isFixed}
            $isError={isError}
            $isSelected={isSelected}
            $isHighlighted={isHighlighted}
            $isSameNumber={isSameNumber}
            $isThickRight={$isThickRight}
            $isThickBottom={$isThickBottom}
        >
            {value !== 0 ? value : ''}
        </CellContainer>
    );
};

export default SudokuCell;