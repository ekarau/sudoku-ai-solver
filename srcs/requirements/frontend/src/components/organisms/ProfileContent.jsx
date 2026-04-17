import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { getUserDetails, updateUserProfile } from '../../services/userService';
import { addFriend, getFriends, removeFriend } from '../../services/api';
import BadgeWidget from '../molecules/BadgeWidget';
import ProfileImage from '../atoms/ProfileImage';
import FriendListWidget from '../organisms/FriendListWidget';
import PerformanceStats from '../molecules/PerformanceStats';
import MatchHistoryTable from '../molecules/MatchHistoryTable';
import EditProfileModal from '../molecules/EditProfileModal';

// STYLED COMPONENTS
const DashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 25px;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    box-sizing: border-box;
`;

const ProfileGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr); 
    gap: 20px;
    width: 100%;
    align-items: stretch;

    @media (max-width: 1024px)
    {
        grid-template-columns: 1fr;
    }
`;

const BaseCard = styled.div`
    width: 100%;
    height: 450px;
    display: flex;
    flex-direction: column;
    background-color: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 20px;
    box-sizing: border-box;

    @media (max-width: 1024px)
    {
        height: auto;
        min-height: 400px;
    }
`;

const ProfileHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
`;

const ImageWrapper = styled.div`
    cursor: ${props => 
    {
        if (props.$isOtherUser)
            return 'default';
            
        return 'pointer';
    }};
`;

const StyledProfileImage = styled(ProfileImage)`
    width: 150px !important;
    height: 150px !important;
`;

const InfoEditArea = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    align-items: center;
    margin-bottom: 20px;
`;

const ProfileName = styled.h2`
    margin: 0;
`;

const ProfileEmail = styled.p`
    margin: 0;
    color: #666;
`;

const ActionsWrapper = styled.div`
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
`;

const BaseBtn = styled.button`
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
    text-align: center;
    font-weight: bold;
    border: none;
`;

const GreenOutlineBtn = styled(BaseBtn)`
    background: transparent;
    color: #10b981;
    border: 2px solid #10b981;

    &:hover:not(:disabled)
    {
        background-color: #f0fdf4;
    }

    &:disabled
    {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const DangerBtn = styled(BaseBtn)`
    background-color: #ef4444;
    color: white;

    &:hover
    {
        background-color: #dc2626;
    }
`;

const TextDangerBtn = styled(BaseBtn)`
    background: transparent;
    color: #dc2626;
    border: 1px solid #fee2e2;

    &:hover
    {
        background-color: #fef2f2;
        border-color: #dc2626;
    }
`;

const StatusMessage = styled.p`
    margin-top: 10px;
    font-size: 0.9rem;
    text-align: center;
    
    color: ${props => 
    {
        if (props.$type === 'success')
            return '#16a34a';
            
        return '#dc2626';
    }};
`;

const AlreadyFriendsText = styled.p`
    padding: 10px 20px;
    background-color: #dcfce7;
    color: #166534;
    border-radius: 6px;
    text-align: center;
    font-weight: 500;
    margin: 0;
`;

const PendingText = styled.p`
    padding: 10px 20px;
    background-color: #fef9c3;
    color: #854d0e;
    border-radius: 6px;
    text-align: center;
    font-weight: 500;
    margin: 0;
`;

// COMPONENT DEFINITION
const ProfileContent = ({ userDetails, stats, onLogout, onDeleteAccount, isOtherUser }) =>
{
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const [friendAddStatus, setFriendAddStatus] = useState('idle'); 
    const [friendAddMessage, setFriendAddMessage] = useState('');
    const [relationshipStatus, setRelationshipStatus] = useState('none');
    const [relationshipId, setRelationshipId] = useState(null);

    const refreshRelationshipStatus = async (targetUsername) =>
    {
        if (!targetUsername)
            return 'none';

        const friendsData = await getFriends();

        const friends = Array.isArray(friendsData?.friends) ? friendsData.friends : [];
        const sent = Array.isArray(friendsData?.sent_requests) ? friendsData.sent_requests : [];
        const incoming = Array.isArray(friendsData?.pending_requests) ? friendsData.pending_requests : [];

        const friendRel = friends.find(f => f.username === targetUsername);
        if (friendRel)
        {
            setRelationshipStatus('friends');
            setRelationshipId(friendRel.rel_id);
            return 'friends';
        }

        const sentRel = sent.find(f => f.username === targetUsername);
        if (sentRel)
        {
            setRelationshipStatus('sent');
            setRelationshipId(sentRel.rel_id);
            return 'sent';
        }

        const incomingRel = incoming.find(f => f.username === targetUsername);
        if (incomingRel)
        {
            setRelationshipStatus('incoming');
            setRelationshipId(incomingRel.rel_id);
            return 'incoming';
        }

        setRelationshipStatus('none');
        setRelationshipId(null);
        return 'none';
    };

    useEffect(() =>
    {
        const loadData = async () =>
        {
            try
            {
                if (isOtherUser && userDetails)
                {
                    setUserData(userDetails);
                    
                    try 
                    {
                        await refreshRelationshipStatus(userDetails.username);
                    } 
                    catch (error) 
                    {
                        console.error("Failed to check friend status:", error);
                    }
                    
                    setLoading(false);
                    return;
                }
                
                const data = await getUserDetails();
                if (data) 
                    setUserData(data);
            }
            catch (error)
            {
                console.error("Failed to load profile data", error);
            }
            finally
            {
                setLoading(false);
            }
        };
        loadData();
    }, [isOtherUser, userDetails]);

    const handleSaveProfile = async (formData) =>
    {
        try
        {
            const result = await updateUserProfile(formData);
            if (result && result.user)
            {
                let newNickname = result.user.username;
                if (result.user.display_name)
                    newNickname = result.user.display_name;

                let newAvatar = userData.avatar;
                if (result.user.avatar)
                    newAvatar = `${result.user.avatar}?t=${new Date().getTime()}`;

                setUserData({
                    ...userData,
                    nickname: newNickname,
                    email: result.user.email,
                    avatar: newAvatar
                });
                
                setIsEditModalOpen(false);
            }
        }
        catch (error)
        {
            alert(`Error: ${error.message}`);
        }
    };

    const handleAddFriend = async () =>
    {
        try 
        {
            setFriendAddStatus('loading');
            const response = await addFriend(userData?.username);

            const responseMessage = String(response?.message || '').toLowerCase();
            if (responseMessage.includes('relationship already exists'))
            {
                const status = await refreshRelationshipStatus(userData?.username);
                if (status === 'friends')
                    setFriendAddMessage('You are already friends with this user');
                else
                    setFriendAddMessage('Friend request is already pending');

                setFriendAddStatus('error');

                setTimeout(() =>
                {
                    setFriendAddStatus('idle');
                    setFriendAddMessage('');
                }, 2000);
                return;
            }
            
            setFriendAddMessage('Friend request sent. Waiting for approval.');
            setFriendAddStatus('success');
            setRelationshipStatus('sent');

            await refreshRelationshipStatus(userData?.username);
            
            setTimeout(() => 
            {
                setFriendAddStatus('idle');
                setFriendAddMessage('');
            }, 2000);
        } 
        catch (error) 
        {
            console.error('Error adding friend:', error);
            
            let errorMessage = 'Failed to add friend';
            if (error.message)
                errorMessage = error.message;
            
            const lowerMessage = errorMessage.toLowerCase();

            if (lowerMessage.includes('relationship already exists') || lowerMessage.includes('already friends') || lowerMessage.includes('pending')) 
            {
                const status = await refreshRelationshipStatus(userData?.username);

                if (status === 'friends')
                    setFriendAddMessage('You are already friends with this user');
                else
                    setFriendAddMessage('Friend request is already pending');

                setFriendAddStatus('error');
            } 
            else 
            {
                setFriendAddMessage(errorMessage);
                setFriendAddStatus('error');
            }
            
            setTimeout(() => 
            {
                setFriendAddStatus('idle');
                setFriendAddMessage('');
            }, 3000);
        }
    };

    const handleRemoveFriend = async () =>
    {
        if (!relationshipId)
            return;

        try
        {
            setFriendAddStatus('loading');
            await removeFriend(relationshipId);
            setRelationshipStatus('none');
            setRelationshipId(null);
            setFriendAddStatus('success');
            setFriendAddMessage('Friend removed successfully.');
        }
        catch (error)
        {
            setFriendAddStatus('error');
            setFriendAddMessage('Failed to remove friend.');
        }
        finally
        {
            setTimeout(() =>
            {
                setFriendAddStatus('idle');
                setFriendAddMessage('');
            }, 2000);
        }
    };

    if (loading) 
        return <DashboardContainer>Loading...</DashboardContainer>;

    let displayName = 'User';
    if (userData)
    {
        if (userData.display_name)
            displayName = userData.display_name;
        else if (userData.nickname)
            displayName = userData.nickname;
        else if (userData.username)
            displayName = userData.username;
    }

    let currentUsername = '';
    if (userData && userData.username)
        currentUsername = userData.username;

    let currentAvatar = null;
    if (userData && userData.avatar)
        currentAvatar = userData.avatar;

    let actionsContent = null;
    
    if (!isOtherUser)
    {
        actionsContent = (
            <>
                <GreenOutlineBtn onClick={() => setIsEditModalOpen(true)}>
                    Edit Profile
                </GreenOutlineBtn>
                <DangerBtn onClick={onLogout}>
                    Log Out
                </DangerBtn>
                <TextDangerBtn onClick={onDeleteAccount}>
                    Delete Account
                </TextDangerBtn>
            </>
        );
    }
    else if (user)
    {
        let friendActionBtn = null;
        
        if (relationshipStatus === 'friends')
        {
            friendActionBtn = (
                <>
                    <AlreadyFriendsText>
                        ✓ Already Friends
                    </AlreadyFriendsText>
                    <TextDangerBtn onClick={handleRemoveFriend}>
                        Unfriend
                    </TextDangerBtn>
                </>
            );
        }
        else if (relationshipStatus === 'sent')
        {
            friendActionBtn = (
                <PendingText>
                    ⏳ Friend Request Pending
                </PendingText>
            );
        }
        else if (relationshipStatus === 'incoming')
        {
            friendActionBtn = (
                <PendingText>
                    ⏳ Incoming Request (accept from Social Hub)
                </PendingText>
            );
        }
        else
        {
            let addBtnText = 'Add Friend';
            if (friendAddStatus === 'loading')
                addBtnText = 'Adding...';
            else if (friendAddStatus === 'success' && relationshipStatus === 'sent')
                addBtnText = 'Added!';
            else if (friendAddStatus === 'error')
                addBtnText = 'Error';

            friendActionBtn = (
                <GreenOutlineBtn 
                    onClick={handleAddFriend}
                    disabled={friendAddStatus === 'loading'}
                >
                    {addBtnText}
                </GreenOutlineBtn>
            );
        }

        let friendMessageEl = null;
        if (friendAddMessage)
        {
            let msgType = 'error';
            if (friendAddStatus === 'success')
                msgType = 'success';

            friendMessageEl = (
                <StatusMessage $type={msgType}>
                    {friendAddMessage}
                </StatusMessage>
            );
        }

        actionsContent = (
            <>
                {friendActionBtn}
                {friendMessageEl}
            </>
        );
    }

    let friendsSection = null;
    if (!isOtherUser)
    {
        friendsSection = (
            <BaseCard>
                <FriendListWidget />
            </BaseCard>
        );
    }

    let editModalSection = null;
    if (!isOtherUser)
    {
        editModalSection = (
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentUserData={userData}
                onSave={handleSaveProfile}
            />
        );
    }

    return (
        <DashboardContainer>
            
            <ProfileGrid>
                
                <BaseCard>
                    <ProfileHeader>
                        <ImageWrapper 
                            $isOtherUser={isOtherUser}
                            onClick={() => 
                            {
                                if (!isOtherUser)
                                    setIsEditModalOpen(true);
                            }}
                        >
                            <StyledProfileImage src={currentAvatar} fallbackSeed={currentUsername} />
                        </ImageWrapper>
                        <InfoEditArea>
                            <ProfileName>{displayName}</ProfileName>
                            <ProfileEmail>@{currentUsername}</ProfileEmail>
                        </InfoEditArea>
                    </ProfileHeader>
                    
                    <ActionsWrapper>
                        {actionsContent}
                    </ActionsWrapper>
                </BaseCard>

                {friendsSection}

                <BaseCard>
                    <BadgeWidget username={currentUsername} userId={userData?.id} />
                </BaseCard>
                
            </ProfileGrid>

            <PerformanceStats username={currentUsername} userId={userData?.id} />
            
            <BaseCard>
                <MatchHistoryTable username={currentUsername} userId={userData?.id} />
            </BaseCard>

            {editModalSection}
            
        </DashboardContainer>
    );
};

export default ProfileContent;