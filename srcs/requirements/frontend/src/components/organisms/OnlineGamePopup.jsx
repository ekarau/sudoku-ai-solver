import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import ActionBtn from '../atoms/ActionBtn';

// ANIMATIONS
const fadeIn = keyframes`
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

const spin = keyframes`
    0% 
    { 
        transform: rotate(0deg); 
    }
    100% 
    { 
        transform: rotate(360deg); 
    }
`;

const pulse = keyframes`
    0% 
    { 
        transform: scale(1); 
    }
    50% 
    { 
        transform: scale(1.1); 
    }
    100% 
    { 
        transform: scale(1); 
    }
`;

// STYLED COMPONENTS
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    font-family: inherit;
`;

const Modal = styled.div`
    background-color: #ffffff;
    padding: 2rem;
    border-radius: 16px;
    width: 550px;
    max-width: 95vw;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    position: relative;
    box-sizing: border-box;
`;

const Title = styled.h2`
    margin-bottom: 1.5rem;
    text-align: center;
    color: #14532d;
    font-size: 1.8rem;
`;

const LobbyActions = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 15px;

    @media (max-width: 480px)
    {
        flex-direction: column;
    }
`;

const StyledActionBtn = styled(ActionBtn)`
    padding: 12px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    transition: opacity 0.2s, background-color 0.2s, transform 0.2s;
    color: white;
    width: 100%;

    &:disabled
    {
        opacity: 0.6;
        cursor: not-allowed;
    }

    &:hover:not(:disabled)
    {
        transform: translateY(-2px);
    }
`;

const CreateButton = styled(StyledActionBtn)`
    background-color: #14532d;
    flex: 1;
    margin: 0;
    height: 50px;

    &:hover:not(:disabled)
    {
        background-color: #166534;
    }
`;

const RefreshButton = styled(StyledActionBtn)`
    background-color: #14532d;
    flex: 1;
    margin: 0;
    max-width: 150px;
    height: 50px;

    &:hover:not(:disabled)
    {
        background-color: #166534;
    }
`;

const ListContainer = styled.div`
    background: #f9fafb;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 20px;
    max-height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
    border: 1px solid #e5e7eb;

    &::-webkit-scrollbar
    {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb
    {
        background: #cbd5e1;
        border-radius: 10px;
    }
`;

const ListTitle = styled.h3`
    font-size: 1.1rem;
    margin-bottom: 10px;
    margin-top: 0;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 8px;
`;

const NoRoomsMsg = styled.p`
    text-align: center;
    color: #9ca3af;
    font-style: italic;
    padding: 20px 0;
`;

const RoomListWrapper = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const RoomItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    transition: all 0.2s ease;
    box-sizing: border-box;
    width: 100%;

    &:hover
    {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        border-color: #4ade80;
    }

    @media (max-width: 480px)
    {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
`;

const RoomInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    overflow: hidden;
`;

const OwnerName = styled.span`
    display: flex;
    align-items: center;
    font-weight: 800;
    font-size: 1.1rem;
    color: #1f2937;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const IdBadge = styled.span`
    background-color: #f3f4f6;
    color: #4b5563;
    font-size: 0.8rem;
    padding: 4px 8px;
    border-radius: 6px;
    margin-right: 10px;
    font-weight: bold;
    border: 1px solid #e5e7eb;
`;

const RoomDifficulty = styled.span`
    font-size: 0.9rem;
    color: #6b7280;
`;

const RoomStatus = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;

    @media (max-width: 480px)
    {
        width: 100%;
        justify-content: space-between;
    }
`;

const PlayerCount = styled.span`
    background: #ecfdf5;
    color: #059669;
    padding: 6px 12px;
    border-radius: 12px;
    font-weight: bold;
    font-size: 0.9rem;
`;

const JoinButton = styled.button`
    background: #4ade80;
    color: #14532d;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;

    ${RoomItem}:hover &
    {
        background: #22c55e;
        color: white;
    }

    &:disabled
    {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const CloseButton = styled(StyledActionBtn)`
    margin-top: 10px;
    background-color: transparent;
    border: 2px;
    color: #ffffff;

    &:hover:not(:disabled)
    {
        background-color: #fef2f2;
        transform: translateY(0);
    }
`;

const CenteredView = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 20px;
`;

const RoomIdDisplay = styled.div`
    p 
    {
        margin: 0;
        color: #6b7280;
    }
`;

const RoomIdText = styled.h3`
    font-size: 2.5rem;
    color: #14532d;
    margin: 15px 0;
    background: #f0fdf4;
    padding: 10px 30px;
    border-radius: 16px;
    border: 2px dashed #4ade80;
    display: inline-block;
`;

const SpinnerContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 20px 0;
    color: #4b5563;
`;

const Spinner = styled.div`
    border: 4px solid #f3f4f6;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border-left-color: #4ade80;
    animation: ${spin} 1s linear infinite;
    margin-bottom: 15px;
`;

const CancelButton = styled(StyledActionBtn)`
    margin-top: 20px;

    &:hover
    {
        background-color: #0c143f;
    }
`;

const CountdownCircle = styled.div`
    h1 
    {
        font-size: 6rem;
        color: #4ade80;
        margin: 20px 0;
        animation: ${pulse} 1s infinite;
        text-shadow: 0 4px 10px rgba(74, 222, 128, 0.3);
    }
`;

// HELPERS
const DIFFICULTY_LABELS = { '1': 'Easy', '2': 'Medium', '3': 'Hard', '4': 'Expert', '5': 'Extreme' };

// COMPONENT DEFINITION
const OnlineGameModal = ({ 
    isOpen, 
    onClose, 
    onCreate, 
    onJoin, 
    onCancelRoom,
    isLoading,
    createdRoomId,
    isOpponentJoined,
    onCountdownComplete,
    currentUserId
}) => 
{
    const [view, setView] = useState('LOBBY'); 
    const [countdown, setCountdown] = useState(3);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [isFetchingRooms, setIsFetchingRooms] = useState(false);
    const [targetTimestamp, setTargetTimestamp] = useState(null);

    useEffect(() => 
    {
        if (isOpen)
        {
            if (view === 'LOBBY')
            {
                fetchRooms();
                const interval = setInterval(fetchRooms, 5000);
                
                return () => 
                {
                    clearInterval(interval);
                };
            }
        }
    }, [isOpen, view]);

    const fetchRooms = async () => 
    {
        setIsFetchingRooms(true);
        try
        {
            const res = await fetch('/api/room/list');
            const data = await res.json();
            
            if (data.success)
            {
                if (data.rooms)
                {
                    const waitingRooms = data.rooms.filter(r => r.status === 'waiting');
                    setAvailableRooms(waitingRooms);
                }
            }
        }
        catch (error)
        {
            console.error("Odalar çekilemedi:", error);
        }
        finally
        {
            setIsFetchingRooms(false);
        }
    };

    useEffect(() => 
    {
        if (createdRoomId)
        {
            if (!isOpponentJoined)
                setView('WAITING');
        }
    }, [createdRoomId, isOpponentJoined]);

    useEffect(() => 
    {
        let pollInterval;
        let heartbeatInterval;
        
        if (view === 'WAITING' && createdRoomId)
        {
            pollInterval = setInterval(async () => 
            {
                try
                {
                    const res = await fetch(`/api/room/game-state/${createdRoomId}`);
                    const data = await res.json();
                    
                    if (data.success && data.status === 'playing')
                    {
                        clearInterval(pollInterval);
                        clearInterval(heartbeatInterval);
                        
                        if (data.gameStartTime)
                            setTargetTimestamp(new Date(data.gameStartTime).getTime());
                        setView('COUNTDOWN');
                    }
                }
                catch (error) { console.error(error); }
            }, 2000);

            heartbeatInterval = setInterval(async () => 
            {
                try
                {
                    await fetch(`/api/room/heartbeat/${createdRoomId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: currentUserId })
                    });
                }
                catch (e) { console.error("Heartbeat failed"); }
            }, 2000);
        }

        return () => 
        {
            clearInterval(pollInterval);
            clearInterval(heartbeatInterval); 
        };
    }, [view, createdRoomId, currentUserId]);

    useEffect(() => {
        if (isOpponentJoined && createdRoomId && view !== 'COUNTDOWN') {
            fetch(`/api/room/game-state/${createdRoomId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.gameStartTime)
                    {
                        setTargetTimestamp(new Date(data.gameStartTime).getTime());
                        setView('COUNTDOWN');
                    }
                })
                .catch(err => console.error(err));
        }
    }, [isOpponentJoined, createdRoomId, view]);

    useEffect(() => 
    {
        let timer;
        
        if (view === 'COUNTDOWN' && targetTimestamp)
        {
            timer = setInterval(() => {
                const now = Date.now();
                const diffMs = targetTimestamp - now;
                
                if (diffMs <= 0)
                {
                    setCountdown(0);
                    clearInterval(timer);
                    if (onCountdownComplete)
                        onCountdownComplete();
                }
                else
                    setCountdown(Math.ceil(diffMs / 1000));
            }, 100); 
        }
        
        return () => clearInterval(timer);
    }, [view, targetTimestamp, onCountdownComplete]);

    useEffect(() => 
    {
        if (!isOpen)
        {
            setView('LOBBY');
            setCountdown(3);
            setTargetTimestamp(null);
        }
    }, [isOpen]);

    if (!isOpen)
        return null;

    let handleOverlayClick = null;
    if (view === 'LOBBY')
        handleOverlayClick = onClose;

    let createBtnText = '⚡ Create New Room';
    if (isLoading)
        createBtnText = 'Creating...';

    let roomsContent = null;
    
    if (isFetchingRooms && availableRooms.length === 0)
    {
        roomsContent = (
            <SpinnerContainer>
                <Spinner />
            </SpinnerContainer>
        );
    }
    else if (availableRooms.length === 0)
    {
        roomsContent = (
            <NoRoomsMsg>
                No active rooms found. Be the first to create one!
            </NoRoomsMsg>
        );
    }
    else
    {
        roomsContent = (
            <RoomListWrapper>
                {availableRooms.map(room => 
                {
                    let ownerName = 'Unknown Player';
                    if (room.ownerName)
                        ownerName = room.ownerName;

                    let difficultyText = 'Normal';
                    if (room.difficulty)
                        difficultyText = DIFFICULTY_LABELS[String(room.difficulty)] || room.difficulty;

                    return (
                        <RoomItem key={room.id} onClick={() => onJoin(room.id)}>
                            
                            <RoomInfo>
                                <OwnerName>
                                    <IdBadge>#{room.id}</IdBadge>
                                    {ownerName}
                                </OwnerName>
                                <RoomDifficulty>
                                    Difficulty: <strong>{difficultyText}</strong>
                                </RoomDifficulty>
                            </RoomInfo>
                            
                            <RoomStatus>
                                <PlayerCount>1 / 2</PlayerCount>
                                <JoinButton disabled={isLoading}>
                                    Join
                                </JoinButton>
                            </RoomStatus>
                            
                        </RoomItem>
                    );
                })}
            </RoomListWrapper>
        );
    }

    let viewContent = null;
    
    if (view === 'LOBBY')
    {
        viewContent = (
            <>
                <Title>Combat Lobby</Title>
                
                <LobbyActions>
                    <CreateButton onClick={onCreate} disabled={isLoading}>
                        {createBtnText}
                    </CreateButton>
                    <RefreshButton onClick={fetchRooms} disabled={isFetchingRooms}>
                        🔄 Refresh
                    </RefreshButton>
                </LobbyActions>

                <ListContainer>
                    <ListTitle>Available Rooms</ListTitle>
                    {roomsContent}
                </ListContainer>

                <CloseButton onClick={onClose} disabled={isLoading}>
                    Cancel
                </CloseButton>
            </>
        );
    }
    else if (view === 'WAITING')
    {
        viewContent = (
            <CenteredView>
                <Title>Room Created!</Title>
                <RoomIdDisplay>
                    <p>Your Room ID:</p>
                    <RoomIdText>{createdRoomId}</RoomIdText>
                </RoomIdDisplay>
                <SpinnerContainer>
                    <Spinner />
                    <p>Waiting for opponent to join...</p>
                </SpinnerContainer>
                <CancelButton onClick={() => {
                    if (onCancelRoom) onCancelRoom(createdRoomId);
                    onClose();
                }}>
                    Cancel Room
                </CancelButton>
            </CenteredView>
        );
    }
    else if (view === 'COUNTDOWN')
    {
        viewContent = (
            <CenteredView>
                <Title>Game Starting!</Title>
                <CountdownCircle>
                    <h1>{countdown}</h1>
                </CountdownCircle>
                <p>Get ready to play...</p>
            </CenteredView>
        );
    }

    return (
        <Overlay onClick={handleOverlayClick}>
            <Modal onClick={(e) => e.stopPropagation()}>
                {viewContent}
            </Modal>
        </Overlay>
    );
};

export default OnlineGameModal;