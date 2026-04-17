import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterContainer = styled.footer`
    width: 100%;
    padding-top: 20px;
    padding-bottom: 20px;
    margin-top: auto; 
    display: flex;
    justify-content: center;
    gap: 20px;
    background-color: transparent;
`;

const FooterLink = styled(Link)`
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 0.875rem;
    color: #9ca3af;
    text-decoration: none;
    transition: color 0.2s;

    &:hover
    {
        color: #2c3e50;
        text-decoration: underline;
    }
`;

const Footer = () =>
{
    return (
        <FooterContainer>
            <FooterLink to="/terms-of-service">
                Terms of Service
            </FooterLink>
            <FooterLink to="/privacy-policy">
                Privacy Policy
            </FooterLink>
        </FooterContainer>
    );
};

export default Footer;