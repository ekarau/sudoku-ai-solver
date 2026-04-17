import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import BackToHomeLink from '../components/atoms/BackToHomeLink';

const PageWrapper = styled.div`
    min-height: 100vh;
    background-color: #f0fdf4;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const ContentContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 100px 20px 40px;
    color: #4b5563;
    line-height: 1.6;
    display: flex;
    flex-direction: column;

    @media (max-width: 768px)
    {
        padding: 20px 15px;
    }
`;

const ContentWrapper = styled.div`
    background: #ffffff;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    margin-top: 20px;

    h1, h2, h3, h4, h5, h6
    {
        color: #111827;
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        font-weight: bold;
    }

    h1
    {
        font-size: 2.2rem;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 10px;
    }

    h2
    {
        font-size: 1.8rem;
    }

    p
    {
        margin-bottom: 1em;
    }

    a
    {
        color: #27ae60;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;

        &:hover
        {
            color: #1e8449;
            text-decoration: underline;
        }
    }

    ul, ol
    {
        margin-left: 20px;
        margin-bottom: 1em;
    }

    @media (max-width: 480px)
    {
        padding: 24px;

        h1
        {
            font-size: 1.8rem;
        }

        h2
        {
            font-size: 1.5rem;
        }
    }
`;

const PolicyPage = ({ content }) =>
{
    useEffect(() =>
    {
        window.scrollTo(0, 0);
    }, []);

    return (
        <PageWrapper>
            <BackToHomeLink />
            <ContentContainer>
                <ContentWrapper>
                    <ReactMarkdown>{content}</ReactMarkdown>
                </ContentWrapper>
            </ContentContainer>
        </PageWrapper>
    );
};

export default PolicyPage;
