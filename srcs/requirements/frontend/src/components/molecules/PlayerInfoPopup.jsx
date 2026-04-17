import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// ANIMATIONS
const slideIn = keyframes`
    from 
    {
        opacity: 0;
        transform: translateY(-20px);
    }
    to 
    {
        opacity: 1;
        transform: translateY(0);
    }
`;

// STYLED COMPONENTS
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.$dimBackground ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.08)'};
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const PopupContainer = styled.div`
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    position: relative;
    animation: ${slideIn} 0.3s ease-out;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #666;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: color 0.2s;

    &:hover 
    {
        color: #333;
    }
`;

const LoadingText = styled.div`
    text-align: center;
    color: #666;
    padding: 40px 20px;
`;

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 12px;
`;

const Avatar = styled.img`
    width: 58px;
    height: 58px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #dcfce7;
    background: #f3f4f6;
`;

const NameBlock = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
`;

const DisplayName = styled.h3`
    margin: 0;
    font-size: 1.2rem;
    color: #14532d;
    font-weight: 800;
    letter-spacing: 0.03em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Username = styled.span`
    margin-top: 2px;
    font-size: 0.82rem;
    color: #6b7280;
    font-weight: 400;
`;

const StatsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const StatRowItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: #f9fafb;
    border-radius: 8px;
    border-left: 4px solid #14532d;
`;

const StatLabel = styled.span`
    font-weight: 600;
    color: #374151;
    font-size: 0.95rem;
`;

const StatValue = styled.span`
    font-weight: 700;
    color: #14532d;
    font-size: 1.1rem;
`;

const ActionsContainer = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 10px;
`;

const ViewProfileBtn = styled.button`
    flex: 1;
    padding: 10px 16px;
    background-color: #14532d;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.95rem;
    transition: background-color 0.2s ease;

    &:hover 
    {
        background-color: #0f3d20;
    }
`;

// COMPONENT DEFINITION
const PlayerInfoPopup = ({ isOpen, onClose, username, dimBackground = true }) => 
{
    const navigate = useNavigate();
    const [playerInfo, setPlayerInfo] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => 
    {
        if (!isOpen || !username) 
            return;

        const fetchPlayerInfo = async () => 
        {
            try 
            {
                setLoading(true);
                const userResponse = await fetch(`/api/v1/user/by-username/${username}/`);

                if (userResponse.ok)
                {
                    const userData = await userResponse.json();
                    setUserInfo(userData);

                    const statsUrl = (userData?.id !== undefined && userData?.id !== null)
                        ? `/api/stats/id/${userData.id}`
                        : `/api/stats/${username}`;

                    const statsResponse = await fetch(statsUrl);
                    if (statsResponse.ok)
                    {
                        const data = await statsResponse.json();
                        setPlayerInfo(data);
                    }
                }
            } 
            catch (error) 
            {
                console.error('Error fetching player info:', error);
            } 
            finally 
            {
                setLoading(false);
            }
        };

        fetchPlayerInfo();
    }, [isOpen, username]);

    const handleViewProfile = () => 
    {
        navigate(`/profile/${username}`);
        onClose();
    };

    if (!isOpen) 
        return null;

    let totalGames = 0;
    let totalWins = 0;
    const displayName = userInfo?.display_name || username;
    const avatarSrc = userInfo?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent((username || 'US').slice(0, 2).toUpperCase())}`;

    if (playerInfo && playerInfo.difficulties)
    {
        const diffValues = Object.values(playerInfo.difficulties);
        
        diffValues.forEach(diff => 
        {
            let onlineWins = 0;
            let onlineLosses = 0;
            
            if (diff.online)
            {
                if (diff.online.wins)
                    onlineWins = diff.online.wins;
                if (diff.online.losses)
                    onlineLosses = diff.online.losses;
            }

            let offlineWins = 0;
            let offlineLosses = 0;
            
            if (diff.offline)
            {
                if (diff.offline.wins)
                    offlineWins = diff.offline.wins;
                if (diff.offline.losses)
                    offlineLosses = diff.offline.losses;
            }

            totalWins = totalWins + onlineWins + offlineWins;
            totalGames = totalGames + onlineWins + onlineLosses + offlineWins + offlineLosses;
        });
    }

    const handleAvatarError = (e) =>
    {
        e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent((username || 'US').slice(0, 2).toUpperCase())}`;
    };

    // LOGIC-DRIVEN RENDERING
    let popupContent = null;
    if (loading)
        popupContent = <LoadingText>Loading...</LoadingText>;
    else
    {
        let statsContent = null;
        if (playerInfo)
        {
            statsContent = (
                <StatsContainer>
                    <StatRowItem>
                        <StatLabel>Total Matches:</StatLabel>
                        <StatValue>{totalGames}</StatValue>
                    </StatRowItem>

                    <StatRowItem>
                        <StatLabel>Total Wins:</StatLabel>
                        <StatValue>{totalWins}</StatValue>
                    </StatRowItem>
                </StatsContainer>
            );
        }

        popupContent = (
            <ContentWrapper>
                
                <Header>
                    <Avatar
                        src={avatarSrc}
                        alt={displayName}
                        onError={handleAvatarError}
                    />
                    <NameBlock>
                        <DisplayName>{displayName}</DisplayName>
                        <Username>@{username}</Username>
                    </NameBlock>
                </Header>

                {statsContent}

                <ActionsContainer>
                    <ViewProfileBtn onClick={handleViewProfile}>
                        Go to Profile
                    </ViewProfileBtn>
                </ActionsContainer>
                
            </ContentWrapper>
        );
    }

    return (
        <Overlay onClick={onClose} $dimBackground={dimBackground}>
            <PopupContainer onClick={(e) => e.stopPropagation()}>
                
                <CloseButton onClick={onClose}>
                    ×
                </CloseButton>

                {popupContent}
                
            </PopupContainer>
        </Overlay>
    );
};

export default PlayerInfoPopup;