import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: clamp(7px, 1.2vmin, 10px) clamp(14px, 3vmin, 24px);
    font-size: clamp(0.7rem, 1.6vmin, 0.95rem);
    font-weight: 700;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #ffffff;
    background: linear-gradient(135deg, #2c3e50, #34495e);
    border: none;
    border-radius: clamp(8px, 1.5vmin, 12px);
    box-shadow: 0 4px 0 #1a252f, 0 6px 10px rgba(0,0,0,0.2);
    cursor: pointer;
    transition: all 0.15s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    outline: none;
    user-select: none;
    white-space: nowrap;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 0 #1a252f, 0 8px 15px rgba(0,0,0,0.3);
    }

    &:active:not(:disabled) {
        transform: translateY(4px);
        box-shadow: 0 0 0 #1a252f, 0 2px 4px rgba(0,0,0,0.2);
    }

    &:disabled {
        background: #95a5a6;
        box-shadow: 0 4px 0 #7f8c8d;
        color: #ecf0f1;
        cursor: not-allowed;
        opacity: 0.7;
        transform: none;
    }
`;

const IconWrapper = styled.span`
    font-size: clamp(0.8rem, 1.6vmin, 1.1rem);
    display: flex;
    align-items: center;
    flex-shrink: 0;
`;

const TextWrapper = styled.span`
    display: flex;
    align-items: center;
    font-size: clamp(0.7rem, 1.6vmin, 0.95rem);
`;

const ActionBtn = ({ className = '', children, ...props }) => 
{
    let icon = '';
    let textContent = '';

    if (typeof children === 'string')
        textContent = children.toLowerCase();
    
    if (textContent.includes('erase'))
        icon = '🧹';
    else if (textContent.includes('hint'))
        icon = '💡';

    return (
        <StyledButton className={className} {...props}>
            {icon !== '' && (
                <IconWrapper>{icon}</IconWrapper>
            )}
            <TextWrapper>{children}</TextWrapper>
        </StyledButton>
    );
};

export default ActionBtn;