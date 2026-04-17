import React from 'react';
import styled from 'styled-components';
import ProfileImage from '../atoms/ProfileImage';

const BASE_URL = '';

// STYLED COMPONENTS
const CardWrapper = styled.div`
    background-color: #ffffff;
    padding: 24px 16px;
    border-radius: 16px;
    width: 100%;
    max-width: 180px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    
    opacity: ${props => props.$align === 'right' ? '0.95' : '1'};
    transition: all 0.3s ease;

    @media (max-width: 768px)
    {
        max-width: 60vw;
        min-width: 180px;
        height: auto;
        max-height: 200px;
        min-height: 60px;
        flex-direction: ${props => props.$align === 'right' ? 'row-reverse' : 'row'}; 
        justify-content: flex-start; 
        padding: 12px 20px;
        gap: 16px;
        border-radius: 12px;
    }
`;

const StyledProfileImage = styled(ProfileImage)`
    width: 80px !important; 
    height: 80px !important;
    border-width: 4px !important;
    flex-shrink: 0;

    @media (max-width: 768px)
    {
        width: 40px !important;
        height: 40px !important;
        border-width: 3px !important;
    }
`;

const InfoWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 4px;
    overflow: hidden;
    width: 100%;

    @media (max-width: 768px)
    {
        align-items: ${props => props.$align === 'right' ? 'flex-end' : 'flex-start'};
        text-align: ${props => props.$align === 'right' ? 'right' : 'left'};
    }
`;

const CardTitle = styled.h3`
    font-weight: bold;
    font-size: 1.15rem;
    color: #111827;
    margin: 0;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;

    @media (max-width: 768px)
    {
        font-size: 1.1rem;
    }
`;

const UsernameText = styled.span`
    font-size: 0.85rem;
    color: #6b7280;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;

    @media (max-width: 768px)
    {
        font-size: 0.8rem;
    }
`;

const HeartsContainer = styled.div`
    display: flex;
    gap: 4px;
    font-size: 1.2rem;
    margin-top: 4px;

    @media (max-width: 768px)
    {
        font-size: 1.1rem;
        margin-top: 0;
    }
`;

const MovesContainer = styled.div`
    font-size: 0.85rem;
    color: #374151;
    font-weight: 600;
    background: #f3f4f6;
    padding: 4px 12px;
    border-radius: 12px;
    margin-top: 4px;

    @media (max-width: 768px)
    {
        font-size: 0.8rem;
        padding: 2px 8px;
    }
`;

const HeartIcon = styled.span`
    opacity: ${props => props.$isBroken ? '0.4' : '1'};
    filter: ${props => props.$isBroken ? 'grayscale(1)' : 'none'};
    transition: all 0.3s ease;
`;

// COMPONENT DEFINITION
const PlayerCard = ({ title, username, lives, align, avatar, moves }) => 
{
    let finalAvatarUrl = null;
    
    if (avatar) 
    {
        if (avatar.startsWith('http'))
            finalAvatarUrl = avatar;
        else
            finalAvatarUrl = `${BASE_URL}${avatar}`;
    }

    const renderHearts = () => 
    {
        const hearts = [];
        
        for (let i = 0; i < 3; i++) 
        {
            let isBroken = false;
            if (i >= lives)
                isBroken = true;

            let heartSymbol = '❤️';
            if (isBroken)
                heartSymbol = '🖤';

            hearts.push(
                <HeartIcon key={i} $isBroken={isBroken}>
                    {heartSymbol}
                </HeartIcon>
            );
        }
        
        return hearts;
    };

    return (
        <CardWrapper $align={align}>
            
            <StyledProfileImage 
                src={finalAvatarUrl} 
                alt={title}
                fallbackSeed={title}
            />

            <InfoWrapper $align={align}>
                <CardTitle>
                    {title}
                </CardTitle>

                {username && username !== '' && (
                    <UsernameText>
                        @{username}
                    </UsernameText>
                )}
                
                <HeartsContainer>
                    {renderHearts()}
                </HeartsContainer>

                {moves !== undefined && (
                    <MovesContainer>
                        Moves: {moves}
                    </MovesContainer>
                )}
            </InfoWrapper>
            
        </CardWrapper>
    );
};

export default PlayerCard;