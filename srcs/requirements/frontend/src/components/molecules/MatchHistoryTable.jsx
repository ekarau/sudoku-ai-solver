import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getMatchHistory } from '../../services/api';

// STYLED COMPONENTS
const Container = styled.div`
    width: 100%;
    padding: 20px 0;
`;

const Title = styled.h3`
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--dark-green);
    margin-bottom: 15px;
    padding-left: 10px;
    letter-spacing: -0.5px;
`;

const MessageContainer = styled.div`
    color: ${props => 
    {
        if (props.$isError)
            return '#dc2626';
        return '#4b5563';
    }};
    
    padding: 20px;
    text-align: ${props => 
    {
        if (props.$isError)
            return 'center';
        return 'left';
    }};
`;

const TableWrapper = styled.div`
    width: 100%;
    overflow-x: auto;
    max-height: 350px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;

    th, td 
    {
        text-align: left;
        vertical-align: middle;
        padding: 12px;
        color: #374151;
        border-bottom: 1px solid #f3f4f6;
        font-size: 0.95rem;
    }

    th 
    {
        position: sticky;
        top: 0;
        background: #f9fafb;
        font-weight: 700;
        color: #111827;
        z-index: 10;
    }

    th:nth-child(2), td:nth-child(2),
    th:nth-child(3), td:nth-child(3),
    th:nth-child(4), td:nth-child(4),
    th:nth-child(5), td:nth-child(5),
    th:nth-child(6), td:nth-child(6) 
    {
        text-align: center;
    }
`;

const ResultBadge = styled.span`
    display: inline-block;
    min-width: 56px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.8rem;
    padding: 4px 10px;

    background-color: ${props => 
    {
        if (props.$type === 'win')
            return '#dcfce7';
        else if (props.$type === 'lose')
            return '#fee2e2';
            
        return '#f3f4f6';
    }};

    color: ${props => 
    {
        if (props.$type === 'win')
            return '#14532d';
        else if (props.$type === 'lose')
            return '#7f1d1d';
            
        return '#374151';
    }};
`;

const ModeBadge = styled.span`
    display: inline-block;
    min-width: 74px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.75rem;
    padding: 4px 10px;

    background-color: ${props => 
    {
        if (props.$type === 'online')
            return '#dbeafe';
        else if (props.$type === 'offline')
            return '#dcfce7';
            
        return '#f3f4f6';
    }};

    color: ${props => 
    {
        if (props.$type === 'online')
            return '#1e3a8a';
        else if (props.$type === 'offline')
            return '#14532d';
            
        return '#374151';
    }};
`;

// COMPONENT DEFINITION
const MatchHistoryTable = ({ username, userId = null }) => 
{
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const difficultyMap = {
        1: 'Easy',
        2: 'Medium',
        3: 'Hard',
        4: 'Expert',
        5: 'Extreme'
    };

    const formatDuration = (seconds) =>
    {
        const parsed = Number(seconds);

        if (Number.isNaN(parsed) || parsed <= 0)
            return '-';

        const totalSeconds = Math.round(parsed);
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');

        return `${m}:${s}`;
    };

    useEffect(() => 
    {
        if (!username) 
        {
            setLoading(false);
            return;
        }

        const fetchMatchHistory = async () => 
        {
            try 
            {
                setLoading(true);
                const data = await getMatchHistory(username, userId);
                
                let fetchedMatches = [];
                if (data && data.matches)
                    fetchedMatches = data.matches;

                setMatches(fetchedMatches);
                setError(null);
            } 
            catch (err) 
            {
                console.error('Error fetching match history:', err);
                setError('Failed to load match history');
                setMatches([]);
            } 
            finally 
            {
                setLoading(false);
            }
        };

        fetchMatchHistory();
    }, [username, userId]);

    if (!username) 
        return <MessageContainer>Please log in to view match history</MessageContainer>;

    if (loading) 
        return <MessageContainer>Loading match history...</MessageContainer>;

    if (error) 
        return <MessageContainer $isError={true}>{error}</MessageContainer>;

    if (!matches || matches.length === 0) 
        return <MessageContainer>No matches yet</MessageContainer>;

    return (
        <Container>
            
            <Title>
                Recent Matches
            </Title>
            
            <TableWrapper>
                <Table>
                    
                    <thead>
                        <tr>
                            <th>Opponent</th>
                            <th>Difficulty</th>
                            <th>Duration</th>
                            <th>Result</th>
                            <th>Mode</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    
                    <tbody>
                        {matches.map((match, idx) => 
                        {
                            let opponentText = 'Solo';
                            if (match.opponent)
                                opponentText = match.opponent;

                            let diffText = 'Unknown';
                            if (difficultyMap[match.difficulty])
                                diffText = difficultyMap[match.difficulty];

                            const duration = formatDuration(match.time_seconds);

                            let resultText = 'N/A';
                            let resultType = 'none';
                            if (match.result)
                            {
                                resultText = match.result.toUpperCase();
                                resultType = match.result.toLowerCase();
                            }

                            let modeText = 'N/A';
                            let modeType = 'none';
                            if (match.mode)
                            {
                                modeText = match.mode.toUpperCase();
                                modeType = match.mode.toLowerCase();
                            }

                            const dateText = new Date(match.played_at).toLocaleDateString();

                            return (
                                <tr key={idx}>
                                    <td>
                                        {opponentText}
                                    </td>
                                    <td>
                                        {diffText}
                                    </td>
                                    <td>
                                        {duration}
                                    </td>
                                    <td>
                                        <ResultBadge $type={resultType}>
                                            {resultText}
                                        </ResultBadge>
                                    </td>
                                    <td>
                                        <ModeBadge $type={modeType}>
                                            {modeText}
                                        </ModeBadge>
                                    </td>
                                    <td>
                                        {dateText}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    
                </Table>
            </TableWrapper>
            
        </Container>
    );
};

export default MatchHistoryTable;