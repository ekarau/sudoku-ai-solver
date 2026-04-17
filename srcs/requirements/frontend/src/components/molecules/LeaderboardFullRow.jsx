import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { device } from '../../utils/device';
import PlayerInfoPopup from './PlayerInfoPopup';

// HELPER FUNCTIONS
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

const calculateWinRate = (wins, games) =>
{
    if (!games || games === 0)
    {
        return "0.0%";
    }
    
    const rate = (wins / games) * 100;
    return rate.toFixed(1) + "%";
};

// STYLED COMPONENTS
const RowContainer = styled.div`
    display: grid;
    grid-template-columns: 60px minmax(180px, 2fr) minmax(90px, 1fr) minmax(90px, 1fr) minmax(90px, 1fr);
    column-gap: 10px;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 10px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    background-color: ${props => 
    {
        switch (props.$rankIndex)
        {
            case 0:
                return '#fef9c3';
            case 1:
                return '#f3f4f6';
            case 2:
                return '#ffedd5';
            default:
                return '#ffffff';
        }
    }};
    
    border: 1px solid ${props => 
    {
        switch (props.$rankIndex)
        {
            case 0:
                return '#fde047';
            case 1:
                return '#e5e7eb';
            case 2:
                return '#fdba74';
            default:
                return '#f3f4f6';
        }
    }};
    
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

    ${props => props.$highlight && `
        border-color: #22c55e;
        box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.25), 0 4px 10px rgba(34, 197, 94, 0.2);
        background-color: #f0fdf4;
    `}

    &:hover 
    {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        
        background-color: ${props => 
        {
            switch (props.$rankIndex)
            {
                case 0:
                    return '#fef08a';
                case 1:
                    return '#e5e7eb';
                case 2:
                    return '#fed7aa';
                default:
                    return '#f9fafb';
            }
        }};
    }

    @media ${device.tablet}
    {
        grid-template-columns: 50px minmax(100px, 2fr) minmax(50px, 1fr) minmax(50px, 1fr) minmax(60px, 1fr);
        column-gap: 6px;
        padding: 10px 12px;
        font-size: 0.85rem;
    }

    @media ${device.mobileL}
    {
        grid-template-columns: 36px minmax(70px, 2fr) minmax(32px, 1fr) minmax(32px, 1fr) minmax(46px, 1fr);
        column-gap: 3px;
        padding: 8px 6px;
        font-size: 0.72rem;
    }

    @media ${device.mobileS}
    {
        grid-template-columns: 30px minmax(60px, 2fr) minmax(28px, 1fr) minmax(28px, 1fr) minmax(42px, 1fr);
        column-gap: 2px;
        padding: 6px 4px;
        font-size: 0.65rem;
    }
`;

const RankIcon = styled.span`
    font-size: 1.5rem;
    font-weight: bold;
    color: #6b7280;
    text-align: center;

    @media ${device.mobileL}
    {
        font-size: 1rem;
    }
`;

const PlayerCell = styled.span`
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
    padding-left: 10px;

    @media ${device.mobileL}
    {
        gap: 5px;
        padding-left: 4px;
    }
`;

const Avatar = styled.img`
    width: 34px;
    height: 34px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #e5e7eb;
    background: #f3f4f6;
    flex-shrink: 0;

    @media ${device.mobileL}
    {
        width: 24px;
        height: 24px;
    }
`;

const PlayerInfo = styled.span`
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
`;

const DisplayName = styled.span`
    font-weight: 700;
    color: #000000;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const UsernameSubtitle = styled.span`
    font-size: 0.75rem;
    color: #313439;
`;

const StatText = styled.span`
    font-weight: 600;
    color: #313439;
    text-align: center;
`;

const HighlightedStat = styled(StatText)`
    color: #000000;
    font-weight: 700;
`;

// COMPONENT DEFINITION
const LeaderboardFullRow = ({ player, index, rank, highlight = false }) =>
{
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const effectiveRank = (rank !== undefined && rank !== null) ? rank : index;
    const icon = getRankIcon(effectiveRank);
    let name = `User #${player.user_id}`;
    
    if (player.display_name !== undefined && player.display_name !== null && player.display_name !== '')
        name = player.display_name;
    else if (player.username !== undefined && player.username !== null && player.username !== '')
        name = player.username;

    const username = player.username;
    const wins = player.wins || 0;
    const games = player.games || 0;
    const points = (player.score !== undefined && player.score !== null) ? player.score : wins;
    const avatarSrc = player.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent((username || name || 'US').slice(0, 2).toUpperCase())}`;
    
    const currentUsername = String(user?.username || '').trim().toLowerCase();
    const playerUsername = String(player?.username || '').trim().toLowerCase();
    const currentUserId = user?.id ?? user?.user_id;
    const playerUserId = player?.user_id ?? player?.id;

    let isCurrentUser = false;
    if (currentUsername && playerUsername && currentUsername === playerUsername)
        isCurrentUser = true;
    else if (currentUserId !== undefined && currentUserId !== null && playerUserId !== undefined && playerUserId !== null)
        isCurrentUser = Number(currentUserId) === Number(playerUserId);

    const handleRowClick = () => 
    {
        if (isCurrentUser) 
            navigate('/profile');
        else 
            setIsPopupOpen(true);
    };

    const handleAvatarError = (e) =>
    {
        e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent((username || name || 'US').slice(0, 2).toUpperCase())}`;
    };

    return (
        <>
            <RowContainer $rankIndex={effectiveRank} $highlight={highlight || isCurrentUser} onClick={handleRowClick}>
                
                <RankIcon>
                    {icon}
                </RankIcon>
                
                <PlayerCell>
                    <Avatar
                        src={avatarSrc}
                        alt={username || name}
                        onError={handleAvatarError}
                    />

                    <PlayerInfo>
                        <DisplayName>
                            {name}
                        </DisplayName>
                        {username !== undefined && username !== null && username !== '' && 
                        (
                            <UsernameSubtitle>
                                @{username}
                            </UsernameSubtitle>
                        )}
                    </PlayerInfo>
                </PlayerCell>
                
                <HighlightedStat>
                    {wins}
                </HighlightedStat>
                
                <StatText>
                    {points}
                </StatText>
                
                <HighlightedStat>
                    {calculateWinRate(wins, games)}
                </HighlightedStat>
                
            </RowContainer>

            {isCurrentUser === false && 
            (
                <PlayerInfoPopup 
                    isOpen={isPopupOpen} 
                    onClose={() => setIsPopupOpen(false)} 
                    username={player.username} 
                />
            )}
        </>
    );
};

export default LeaderboardFullRow;