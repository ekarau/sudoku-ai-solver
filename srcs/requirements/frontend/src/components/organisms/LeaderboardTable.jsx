import React from 'react';
import styled from 'styled-components';
import LeaderboardFullRow from '../molecules/LeaderboardFullRow';
import { useAuth } from '../../context/AuthContext';
import { device } from '../../utils/device';

// STYLED COMPONENTS
const TableContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-x: hidden;
`;

const HeaderRow = styled.div`
    display: grid;
    grid-template-columns: 60px minmax(180px, 2fr) minmax(90px, 1fr) minmax(90px, 1fr) minmax(90px, 1fr);
    align-items: center;
    column-gap: 10px;
    padding: 12px 16px;
    border-bottom: 2px solid #eee;
    margin-bottom: 4px;

    span
    {
        font-weight: 900;
        color: #000;
        font-size: 0.95rem;
    }

    @media ${device.tablet}
    {
        grid-template-columns: 50px minmax(100px, 2fr) minmax(50px, 1fr) minmax(50px, 1fr) minmax(60px, 1fr);
        column-gap: 6px;
        padding: 10px 12px;

        span
        {
            font-size: 0.85rem;
        }
    }

    @media ${device.mobileL}
    {
        grid-template-columns: 36px minmax(70px, 2fr) minmax(32px, 1fr) minmax(32px, 1fr) minmax(46px, 1fr);
        column-gap: 3px;
        padding: 8px 6px;

        span
        {
            font-size: 0.72rem;
        }
    }

    @media ${device.mobileS}
    {
        grid-template-columns: 30px minmax(60px, 2fr) minmax(28px, 1fr) minmax(28px, 1fr) minmax(42px, 1fr);
        column-gap: 2px;
        padding: 6px 4px;

        span
        {
            font-size: 0.65rem;
        }
    }
`;

const ColRank = styled.span`
    text-align: center;
`;

const ColPlayer = styled.span`
    text-align: left;
    padding-left: 10px;

    @media ${device.mobileL}
    {
        padding-left: 4px;
    }
`;

const ColWins = styled.span`
    text-align: center; 
`;

const ColGames = styled.span`
    text-align: center; 
`;

const ColRate = styled.span`
    text-align: center;

    .full-label
    {
        display: inline;
    }

    .short-label
    {
        display: none;
    }

    @media ${device.mobileL}
    {
        .full-label
        {
            display: none;
        }

        .short-label
        {
            display: inline;
        }
    }
`;

const StateMessage = styled.div`
    text-align: center;
    padding: 40px;
    color: #888;
`;

const EllipsisRow = styled.div`
    display: grid;
    grid-template-columns: 60px minmax(180px, 2fr) minmax(90px, 1fr) minmax(90px, 1fr) minmax(90px, 1fr);
    column-gap: 10px;
    align-items: center;
    width: 100%;
    min-height: 56px;
    margin: 8px 0 10px 0;

    @media ${device.tablet}
    {
        grid-template-columns: 50px minmax(100px, 2fr) minmax(50px, 1fr) minmax(50px, 1fr) minmax(60px, 1fr);
        column-gap: 6px;
    }

    @media ${device.mobileL}
    {
        grid-template-columns: 36px minmax(70px, 2fr) minmax(32px, 1fr) minmax(32px, 1fr) minmax(46px, 1fr);
        column-gap: 3px;
    }

    @media ${device.mobileS}
    {
        grid-template-columns: 30px minmax(60px, 2fr) minmax(28px, 1fr) minmax(28px, 1fr) minmax(42px, 1fr);
        column-gap: 2px;
    }
`;

const EllipsisCell = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 2rem;
    font-weight: 800;
    line-height: 1;
`;

// COMPONENT DEFINITION
const LeaderboardTable = ({ players, loading, mode }) =>
{
    const { user } = useAuth();

    const isCurrentUserPlayer = (player) =>
    {
        const currentUsername = String(user?.username || '').trim().toLowerCase();
        const playerUsername = String(player?.username || '').trim().toLowerCase();

        if (currentUsername && playerUsername && currentUsername === playerUsername)
            return true;

        const currentUserId = user?.id ?? user?.user_id;
        const playerUserId = player?.user_id ?? player?.id;

        if (currentUserId !== undefined && currentUserId !== null && playerUserId !== undefined && playerUserId !== null)
            return Number(currentUserId) === Number(playerUserId);

        return false;
    };

    if (loading)
    {
        return (
            <StateMessage>
                Loading rankings...
            </StateMessage>
        );
    }

    let contentElement = null;

    if (players && players.length > 0)
    {
        const topFifty = players.slice(0, 50);
        const currentUserIndex = players.findIndex(isCurrentUserPlayer);
        const currentUserOutsideTopFifty = currentUserIndex >= 50;

        const rows = topFifty.map((player, index) => (
            <LeaderboardFullRow 
                key={`${player.username || player.user_id}-${index}`} 
                player={player} 
                index={index}
                rank={index}
                highlight={isCurrentUserPlayer(player)}
            />
        ));

        if (currentUserOutsideTopFifty)
        {
            rows.push(
                <EllipsisRow key="ellipsis">
                    <EllipsisCell>⋮</EllipsisCell>
                    <EllipsisCell>⋮</EllipsisCell>
                    <EllipsisCell>⋮</EllipsisCell>
                    <EllipsisCell>⋮</EllipsisCell>
                    <EllipsisCell>⋮</EllipsisCell>
                </EllipsisRow>
            );

            const me = players[currentUserIndex];
            rows.push(
                <LeaderboardFullRow
                    key={`self-${me.username || me.user_id}`}
                    player={me}
                    index={currentUserIndex}
                    rank={currentUserIndex}
                    highlight={true}
                />
            );
        }

        contentElement = rows;
    }
    else
    {
        contentElement = (
            <StateMessage>
                No records found for <strong>{mode}</strong> mode yet.
            </StateMessage>
        );
    }

    return (
        <TableContainer>
            
            <HeaderRow>
                <ColRank>Rank</ColRank>
                <ColPlayer>Player</ColPlayer>
                <ColWins>Wins</ColWins>
                <ColGames>Pts</ColGames>
                <ColRate><span className="full-label">Win Rate</span><span className="short-label">Rate</span></ColRate>
            </HeaderRow>

            {contentElement}
            
        </TableContainer>
    );
};

export default LeaderboardTable;