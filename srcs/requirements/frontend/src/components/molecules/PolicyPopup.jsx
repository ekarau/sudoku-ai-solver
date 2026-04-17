import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// --- STYLED COMPONENTS ---

const PopupContainer = styled.div`
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 30px;
    padding: 12px 24px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    z-index: 9999; 
    display: flex;
    align-items: center;
    gap: 20px;
    width: max-content;
    max-width: 90vw;
    animation: slideUp 0.5s ease-out;

    @keyframes slideUp
    {
        from
        {
            transform: translate(-50%, 100px);
            opacity: 0;
        }

        to
        {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }

    @media (max-width: 768px)
    {
        bottom: 15px;
        flex-direction: column;
        text-align: center;
        gap: 15px;
        border-radius: 20px;
        padding: 16px 20px;
    }
`;

const TextContent = styled.div`
    font-size: 0.95rem;
    color: #4b5563;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const PolicyLink = styled(Link)`
    color: #27ae60;
    text-decoration: none;
    font-weight: 700;
    transition: color 0.2s ease;

    &:hover
    {
        color: #1e8449;
        text-decoration: underline;
    }
`;

const AcceptButton = styled.button`
    padding: 8px 16px;
    background-color: #27ae60;
    color: #ffffff;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 0.9rem;
    transition: background-color 0.2s ease, transform 0.1s ease;
    white-space: nowrap;

    &:hover
    {
        background-color: #1e8449;
    }

    &:active
    {
        transform: scale(0.95);
    }
`;

// --- COMPONENT DEFINITION ---

const PolicyPopup = () => 
{
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => 
    {
        // Kullanıcı daha önce onayladıysa popup'ı gösterme
        const hasAccepted = localStorage.getItem('policy_accepted');
        if (!hasAccepted) 
        {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => 
    {
        // Onaylandığını tarayıcıya kaydet ve popup'ı kapat
        localStorage.setItem('policy_accepted', 'true');
        setIsVisible(false);
    };

    if (!isVisible) 
    {
        return null;
    }

    return (
        <PopupContainer>
            <TextContent>
                By playing Sudoku Combat, you agree to our{' '}
                <PolicyLink to="/terms-of-service">Terms</PolicyLink> and{' '}
                <PolicyLink to="/privacy-policy">Privacy Policy</PolicyLink>.
            </TextContent>
            
            <AcceptButton onClick={handleAccept}>
                I Understand
            </AcceptButton>
        </PopupContainer>
    );
};

export default PolicyPopup;