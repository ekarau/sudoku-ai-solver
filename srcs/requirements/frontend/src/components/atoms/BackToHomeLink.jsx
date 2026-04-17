import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// STYLED COMPONENTS
const StyledButton = styled.button`
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 999;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 15px 30px;
    background: linear-gradient(90deg, #4ade80 0%, #22c55e 100%);
    color: white;
    border-radius: 50px;
    box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3);
    text-decoration: none;
    border: none;
    transition: all 0.2s ease;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    user-select: none;

    &:hover
    {
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(34, 197, 94, 0.4);
        background: linear-gradient(90deg, #5ce590 0%, #2bd46d 100%);
    }

    &:active
    {
        transform: translateY(1px);
        box-shadow: 0 2px 5px rgba(34, 197, 94, 0.3);
    }

    @media (max-width: 768px)
    {
        position: relative;
        top: 0;
        left: 0;
        margin: 15px auto 10px auto;
        width: fit-content;
        padding: 10px 18px;
    }

    @media (max-width: 480px)
    {
        padding: 8px 16px;
        gap: 6px;
    }

    @media (max-width: 320px)
    {
        padding: 7px 14px;
        gap: 5px;
    }
`;

const IconWrapper = styled.span`
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));

    @media (max-width: 768px)
    {
        font-size: 1.1rem;
    }
`;

const TextWrapper = styled.span`
    font-weight: 700;
    font-size: 1.2rem;
    letter-spacing: 0.3px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);

    @media (max-width: 768px)
    {
        font-size: 0.85rem;
    }
`;

// COMPONENT DEFINITION
const BackToHomeLink = ({ onClick }) => 
{
    const navigate = useNavigate();

    const handleClick = (e) => 
    {
        if (onClick)
            onClick(e);
        else
            navigate('/');
    };

    return (
        <StyledButton onClick={handleClick}>
            
            <IconWrapper>
                🏠
            </IconWrapper>
            
            <TextWrapper>
                Go to Homepage
            </TextWrapper>

        </StyledButton>
    );
};

export default BackToHomeLink;