import React from 'react';
import styled from 'styled-components';
import SudokuCell from '../atoms/SudokuCell';
import { checkIsHighlighted } from '../../utils/sudokuUtils';

// STYLED COMPONENTS
const BoardContainer = styled.div`
    display: grid;
    width: 100%;
    height: auto; 
    
    aspect-ratio: 1 / 1; 

    grid-template-columns: repeat(9, minmax(0, 1fr));
    grid-template-rows: repeat(9, minmax(0, 1fr));
    
    border: 4px solid #2c3e50;
    border-radius: 8px;
    background-color: #fff;
    position: relative;
    
    margin: 0 auto; 
        
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    box-sizing: border-box;

    @media (max-width: 768px)
    {
        width: 100%;
        height: auto;
        border-width: 4px;
        border-radius: 8px;
    }
`;

const LoadingText = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    aspect-ratio: 1 / 1;
    font-size: 1.5rem;
    color: #2c3e50;
    font-weight: bold;
`;

// COMPONENT DEFINITION
const SudokuBoard = ({ board, selectedCell, onCellClick }) => 
{
    if (!board || board.length === 0) 
        return <LoadingText>Loading Board...</LoadingText>;

    let selectedValue = 0;
    if (selectedCell)
    {
        if (board[selectedCell.r])
        {
            if (board[selectedCell.r][selectedCell.c])
                selectedValue = board[selectedCell.r][selectedCell.c].value;
        }
    }

    return (
        <BoardContainer>
            {board.map((row, rIndex) => (
                <React.Fragment key={rIndex}>
                    {row.map((cell, cIndex) => 
                    {
                        const isHighlighted = checkIsHighlighted(rIndex, cIndex, selectedCell);
                        let isSameNumber = false;
                        
                        if (selectedCell)
                        {
                            if (selectedValue !== 0)
                            {
                                if (cell.value === selectedValue)
                                {
                                    if (selectedCell.r !== rIndex || selectedCell.c !== cIndex)
                                        isSameNumber = true;
                                }
                            }
                        }

                        let isSelected = false;
                        if (selectedCell)
                        {
                            if (selectedCell.r === rIndex)
                            {
                                if (selectedCell.c === cIndex)
                                    isSelected = true;
                            }
                        }

                        const isThickRight = (cIndex === 2 || cIndex === 5);
                        const isThickBottom = (rIndex === 2 || rIndex === 5);

                        return (
                            <SudokuCell
                                key={`${rIndex}-${cIndex}`}
                                value={cell.value}
                                isFixed={cell.isFixed}
                                isError={cell.isError}
                                isSelected={isSelected}
                                isHighlighted={isHighlighted}
                                isSameNumber={isSameNumber}
                                onClick={() => onCellClick(rIndex, cIndex)}
                                $isThickRight={isThickRight}
                                $isThickBottom={isThickBottom}
                            />
                        );
                    })}
                </React.Fragment>
            ))}
        </BoardContainer>
    );
};

export default SudokuBoard;