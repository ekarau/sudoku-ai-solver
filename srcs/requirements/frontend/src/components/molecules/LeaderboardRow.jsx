import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import PlayerInfoPopup from './PlayerInfoPopup';

// HELPER FUNCTION
const getRankIcon = (index) =>
{
    switch (index)
    {
        case 0:
          return '🥇';
        case 1:
          return '🥈';
        case 2:
          return '🥉';
        default:
          return `#${index + 1}`;
    }
};

// STYLED COMPONENTS
const RowContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 8px;
    border-radius: 10px;
    transition: all 0.2s ease;
    
    background-color: ${props => 
        props.$rankIndex === 0 ? '#fef9c3' : 
        props.$rankIndex === 1 ? '#f3f4f6' : 
        props.$rankIndex === 2 ? '#ffedd5' : 
        '#ffffff'
    };
    
    border: 1px solid ${props => 
        props.$rankIndex === 0 ? '#fde047' : 
        props.$rankIndex === 1 ? '#e5e7eb' : 
        props.$rankIndex === 2 ? '#fdba74' : 
        '#f3f4f6'
    };

    ${props => props.$highlight && `
        border-color: #22c55e;
        box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.25), 0 4px 10px rgba(34, 197, 94, 0.2);
        background-color: #f0fdf4;
    `}

    cursor: pointer;

    &:hover 
    {
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }
`;

const RankIcon = styled.span`
    width: 40px;
    font-size: 1rem;
    font-weight: bold;
    color: #6b7280;
    text-align: center;
    flex-shrink: 0;
`;

const Avatar = styled.img`
    width: 34px;
    height: 34px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 10px;
    border: 1px solid #e5e7eb;
    background: #f3f4f6;
    flex-shrink: 0;
`;

const PlayerInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    padding-right: 10px;
`;

const DisplayName = styled.span`
    font-size: 1rem;
    font-weight: 600;
    color: #000000;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const UsernameSubtitle = styled.span`
    font-size: 0.75rem;
    color: #313439;
`;

const PointsText = styled.span`
    font-size: 1rem;
    font-weight: 700;
    color: #000000;
    white-space: nowrap;
`;

// COMPONENT DEFINITION
const LeaderboardRow = ({ player, index }) =>
{
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const icon = getRankIcon(index);
    const displayName = player.display_name || player.username || `User #${player.user_id}`;
    const username = player.username;
    const wins = player.wins || 0;
    const points = (player.score !== undefined && player.score !== null) ? player.score : wins;
    const avatarSrc = player.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent((username || displayName || 'US').slice(0, 2).toUpperCase())}`;

    const currentUsername = String(user?.username || '').trim().toLowerCase();
    const playerUsername = String(username || '').trim().toLowerCase();
    const currentUserId = user?.id ?? user?.user_id;
    const playerUserId = player?.user_id ?? player?.id;

    const isCurrentUser = (
        (currentUsername && playerUsername && currentUsername === playerUsername) ||
        (currentUserId !== undefined && currentUserId !== null && playerUserId !== undefined && playerUserId !== null && Number(currentUserId) === Number(playerUserId))
    );

    const handleRowClick = () =>
    {
        if (isCurrentUser)
            navigate('/profile');
        else
            setIsPopupOpen(true);
    };

    const handleAvatarError = (e) =>
    {
        e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent((username || displayName || 'US').slice(0, 2).toUpperCase())}`;
    };

    return (
        <>
            <RowContainer $rankIndex={index} $highlight={isCurrentUser} onClick={handleRowClick}>
                
                <RankIcon>
                    {icon}
                </RankIcon>

                <Avatar
                    src={avatarSrc}
                    alt={username || displayName}
                    onError={handleAvatarError}
                />
                
                <PlayerInfo>
                    <DisplayName>
                        {displayName}
                    </DisplayName>
                    {username !== undefined && username !== null && username !== '' && 
                    (
                        <UsernameSubtitle>
                            @{username}
                        </UsernameSubtitle>
                    )}
                </PlayerInfo>
                
                <PointsText>
                    {points} pts
                </PointsText>
                
            </RowContainer>

            {!isCurrentUser && (
                <PlayerInfoPopup
                    isOpen={isPopupOpen}
                    onClose={() => setIsPopupOpen(false)}
                    username={username}
                    dimBackground={false}
                />
            )}
        </>
    );
};

export default LeaderboardRow;