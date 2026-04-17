import React from 'react';
import styled from 'styled-components';

// CUSTOM HOOK & COMPONENTS
import useLeaderboardPage from '../hooks/useLeaderboardPage';
import BackToHomeLink from '../components/atoms/BackToHomeLink';
import LeaderboardTabs from '../components/molecules/LeaderboardTabs';
import LeaderboardTable from '../components/organisms/LeaderboardTable';
import Footer from '../components/atoms/Footer';

// STYLED COMPONENTS
const PageWrapper = styled.div`
    min-height: 100vh;
    background-color: #f9fafb;
    display: flex;
    flex-direction: column;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const ContentContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100px 20px 40px;
    width: 100%;
    box-sizing: border-box;

    @media (max-width: 768px)
    {
        padding: 20px 12px 30px;
    }

    @media (max-width: 320px)
    {
        padding: 15px 8px 20px;
    }
`;

const CardContainer = styled.div`
    background: #ffffff;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    width: 100%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    @media (max-width: 768px)
    {
        padding: 20px;
    }

    @media (max-width: 320px)
    {
        padding: 12px;
        gap: 12px;
    }
`;

const Title = styled.h1`
    text-align: center;
    color: #111827;
    font-size: 2.2rem;
    font-weight: bold;
    margin: 0 0 10px 0;

    @media (max-width: 480px)
    {
        font-size: 1.8rem;
    }
`;

// COMPONENT DEFINITION
const LeaderboardPage = () =>
{
    const { mode, setMode, players, loading, modes } = useLeaderboardPage();

    return (
        <PageWrapper>
            
            <BackToHomeLink />

            <ContentContainer>
                <CardContainer>
                    
                    <Title>
                        🏆 Hall of Fame
                    </Title>

                    <LeaderboardTabs 
                        modes={modes} 
                        currentMode={mode} 
                        onModeChange={setMode} 
                    />

                    <LeaderboardTable 
                        players={players} 
                        loading={loading} 
                        mode={mode} 
                    />
                    
                </CardContainer>
            </ContentContainer>
            
            <Footer />
            
        </PageWrapper>
    );
};

export default LeaderboardPage;