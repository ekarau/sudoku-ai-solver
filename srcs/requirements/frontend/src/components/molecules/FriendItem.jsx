import React, { useState } from 'react';
import styled from 'styled-components';
import { device } from '../../utils/device';
import ActionBtn from '../atoms/ActionBtn';
import PlayerInfoPopup from './PlayerInfoPopup';

// STYLED COMPONENTS
const ItemContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    padding: 8px 10px;
    margin-bottom: 8px;
    background: #ffffff;
    border: 1px solid #f3f4f6;
    border-radius: 10px;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    
    cursor: ${props => 
    {
        if (props.$isPending)
            return 'default';
            
        return 'pointer';
    }};

    &:hover
    {
        border-color: #d1d5db;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
`;

const AvatarWrapper = styled.div`
    position: relative;
    width: 36px;
    height: 36px;
`;

const AvatarImg = styled.img`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px #e5e7eb;
    background-color: #f3f4f6;
`;

const StatusDot = styled.div`
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid #fff;
    z-index: 10;
    
    background-color: ${props => 
    {
        switch (props.$statusType)
        {
            case 'online':
                return '#22c55e';
            case 'pending':
                return '#fbbf24';
            default:
                return '#9ca3af';
        }
    }};
    
    box-shadow: 0 0 0 1px ${props => 
    {
        switch (props.$statusType)
        {
            case 'online':
                return '#bbf7d0';
            case 'pending':
                return '#fde68a';
            default:
                return '#e5e7eb';
        }
    }};
`;

const TextDetails = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
`;

const DisplayName = styled.span`
    font-size: 0.95rem;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const UsernameText = styled.span`
    font-size: 0.75rem;
    color: #9ca3af;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ActionsWrapper = styled.div`
    display: flex;
    gap: 6px;
    align-items: center;
    flex-shrink: 0;
    margin-left: 8px;
`;

const SmallActionBtn = styled(ActionBtn)`
    width: 26px !important;
    height: 26px !important;
    border-radius: 6px !important;
    border: none !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    font-size: 0.85rem !important;
    font-weight: bold !important;
    padding: 0 !important;
    min-width: unset !important;
    box-shadow: none !important;
`;

const ApproveButton = styled(SmallActionBtn)`
    background-color: #22c55e !important;
    color: white !important;

    &:hover 
    {
        background-color: #16a34a !important;
        transform: scale(1.1) !important;
    }
`;

const RemoveButton = styled(SmallActionBtn)`
    background-color: #ef4444 !important;
    color: white !important;

    &:hover 
    {
        background-color: #dc2626 !important;
        transform: scale(1.1) !important;
    }
`;

// COMPONENT DEFINITION
const FriendItem = ({ id, username, displayName, avatar, status, isOnline, onApprove, onRemove }) => 
{
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    
    const isPendingStatus = (status === 'pending');
    const isSentStatus = (status === 'sent');
    const isRequestStatus = isPendingStatus || isSentStatus;
    let statusClass = 'offline';

    if (isRequestStatus)
        statusClass = 'pending';
    else if (isOnline)
        statusClass = 'online';
    
    const BASE_URL = ''; 
    let avatarSrc = "https://ui-avatars.com/api/?background=random&name=" + username;

    if (avatar)
    {
        if (avatar.startsWith('http'))
            avatarSrc = avatar;
        else
            avatarSrc = `${BASE_URL}${avatar}`;
    }

    const handleItemClick = () =>
    {
        if (!isRequestStatus)
            setIsPopupOpen(true);
    };

    const handleAvatarError = (e) => 
    {
        e.target.src = "https://ui-avatars.com/api/?background=random&name=" + username;
    };

    return (
        <>
            <ItemContainer $isPending={isRequestStatus} onClick={handleItemClick}>
                
                <UserInfo>
                    <AvatarWrapper>
                        <AvatarImg 
                            src={avatarSrc} 
                            alt={username} 
                            onError={handleAvatarError}
                        />
                        <StatusDot $statusType={statusClass} />
                    </AvatarWrapper>
                    
                    <TextDetails>
                        <DisplayName>
                            {displayName || username}
                        </DisplayName>
                        <UsernameText>
                            @{username}
                        </UsernameText>
                    </TextDetails>
                </UserInfo>
                
                <ActionsWrapper>
                    {isPendingStatus && 
                    (
                        <ApproveButton onClick={(e) => { e.stopPropagation(); onApprove(id); }}>
                            ✓
                        </ApproveButton>
                    )}
                    
                    <RemoveButton onClick={(e) => { e.stopPropagation(); onRemove(id); }}>
                        ✕
                    </RemoveButton>
                </ActionsWrapper>

            </ItemContainer>

            <PlayerInfoPopup 
                isOpen={isPopupOpen} 
                onClose={() => setIsPopupOpen(false)} 
                username={username} 
            />
        </>
    );
};

export default FriendItem;