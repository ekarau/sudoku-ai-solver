import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import SudokuBoard from '../components/organisms/SudokuBoard';
import BackToHomeLink from '../components/atoms/BackToHomeLink';
import useAISolver from '../hooks/useAISolver';

// ANIMATIONS
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

// STYLED COMPONENTS
const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f1f0;
    padding: 20px;
    padding-top: 40px;
    box-sizing: border-box;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    font-weight: 800;
    color: #2c3e50;
    margin-bottom: 10px;
    text-align: center;
    animation: ${fadeIn} 0.5s ease-out;

    span
    {
        color: #15c65c;
    }

    @media (max-width: 768px)
    {
        font-size: 1.8rem;
    }
`;

const Subtitle = styled.p`
    font-size: 1.1rem;
    color: #6b7280;
    margin-bottom: 30px;
    text-align: center;
    animation: ${fadeIn} 0.5s ease-out 0.1s both;

    @media (max-width: 768px)
    {
        font-size: 0.95rem;
        margin-bottom: 20px;
    }
`;

const MainLayout = styled.div`
    display: flex;
    gap: 40px;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    max-width: 1400px;
    animation: ${fadeIn} 0.5s ease-out 0.2s both;

    @media (max-width: 1024px)
    {
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }
`;

const BoardsWrapper = styled.div`
    display: flex;
    gap: 24px;
    align-items: flex-start;
    flex-shrink: 0;

    @media (max-width: 1024px)
    {
        flex-direction: column;
        align-items: center;
        width: 100%;
    }
`;

const BoardColumn = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
`;

const BoardLabel = styled.div`
    font-size: 0.85rem;
    font-weight: 700;
    color: ${props => props.$color || '#6b7280'};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const BoardWrapper = styled.div`
    width: ${props => props.$compact ? '360px' : '450px'};
    flex-shrink: 0;
    transition: width 0.3s ease;

    @media (max-width: 768px)
    {
        width: 100%;
        max-width: 400px;
    }
`;

const SidePanel = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 320px;

    @media (max-width: 1024px)
    {
        width: 100%;
        max-width: 450px;
    }
`;

const Card = styled.div`
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #e5e7eb;
`;

const CardTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const ControlGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const Label = styled.label`
    font-size: 0.85rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const Select = styled.select`
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 500;
    color: #374151;
    background-color: #f9fafb;
    cursor: pointer;
    transition: all 0.2s;

    &:focus
    {
        outline: none;
        border-color: #15c65c;
        box-shadow: 0 0 0 3px rgba(21, 198, 92, 0.15);
    }
`;

const AlgorithmButtons = styled.div`
    display: flex;
    gap: 8px;
`;

const AlgoButton = styled.button`
    flex: 1;
    padding: 12px 8px;
    border: 2px solid ${props => props.$active ? '#15c65c' : '#e5e7eb'};
    border-radius: 10px;
    background: ${props => props.$active ? '#f0fdf4' : 'white'};
    color: ${props => props.$active ? '#15803d' : '#6b7280'};
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover
    {
        border-color: #15c65c;
        background: #f0fdf4;
    }
`;

const ActionButton = styled.button`
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 12px;
    font-size: 1.05rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;

    background: ${props =>
    {
        if (props.$variant === 'solve')
            return 'linear-gradient(135deg, #15c65c, #0ea44e)';
        if (props.$variant === 'stop')
            return 'linear-gradient(135deg, #ef4444, #dc2626)';
        if (props.$variant === 'reset')
            return '#f3f4f6';
        return 'linear-gradient(135deg, #3b82f6, #2563eb)';
    }};

    color: ${props => props.$variant === 'reset' ? '#374151' : 'white'};

    &:hover
    {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:disabled
    {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const SolutionToggleButton = styled.button`
    width: 100%;
    padding: 14px;
    border: 2px solid ${props => props.$active ? '#8b5cf6' : '#e5e7eb'};
    border-radius: 12px;
    font-size: 1.05rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    background: ${props => props.$active ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'white'};
    color: ${props => props.$active ? 'white' : '#6b7280'};

    &:hover:not(:disabled)
    {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        border-color: #8b5cf6;
    }

    &:disabled
    {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
`;

const StatItem = styled.div`
    background: ${props => props.$highlight ? '#f0fdf4' : '#f9fafb'};
    border-radius: 10px;
    padding: 12px;
    text-align: center;
    border: 1px solid ${props => props.$highlight ? '#bbf7d0' : '#e5e7eb'};
`;

const StatLabel = styled.div`
    font-size: 0.75rem;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
`;

const StatValue = styled.div`
    font-size: 1.4rem;
    font-weight: 800;
    color: ${props => props.$color || '#2c3e50'};
    animation: ${props => props.$pulse ? pulse : 'none'} 1s ease-in-out infinite;
`;

const StatusBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 12px;

    background: ${props =>
    {
        if (props.$status === 'solved') return '#f0fdf4';
        if (props.$status === 'solving') return '#eff6ff';
        if (props.$status === 'failed') return '#fef2f2';
        return '#f9fafb';
    }};

    color: ${props =>
    {
        if (props.$status === 'solved') return '#15803d';
        if (props.$status === 'solving') return '#1d4ed8';
        if (props.$status === 'failed') return '#dc2626';
        return '#6b7280';
    }};

    border: 1px solid ${props =>
    {
        if (props.$status === 'solved') return '#bbf7d0';
        if (props.$status === 'solving') return '#bfdbfe';
        if (props.$status === 'failed') return '#fecaca';
        return '#e5e7eb';
    }};
`;

const StatusDot = styled.span`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: ${props => props.$status === 'solving' ? pulse : 'none'} 1s ease-in-out infinite;

    background: ${props =>
    {
        if (props.$status === 'solved') return '#15803d';
        if (props.$status === 'solving') return '#1d4ed8';
        if (props.$status === 'failed') return '#dc2626';
        return '#9ca3af';
    }};
`;

const EmptyBoard = styled.div`
    width: 100%;
    aspect-ratio: 1 / 1;
    background: white;
    border: 4px solid #2c3e50;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #9ca3af;
    font-size: 1.2rem;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
`;

const EmptyIcon = styled.span`
    font-size: 3rem;
`;

// COMPONENT DEFINITION
const AISolver = () =>
{
    const [difficulty, setDifficulty] = useState('Medium');
    const [showSolution, setShowSolution] = useState(false);
    const {
        board,
        solution,
        algorithm,
        setAlgorithm,
        status,
        stats,
        generatePuzzle,
        startSolving,
        stopSolving,
        reset,
    } = useAISolver();

    const statusLabels = {
        idle: 'Ready',
        loading: 'Generating...',
        solving: 'Solving...',
        solved: 'Solved!',
        stopped: 'Stopped',
        failed: 'Failed',
    };

    const getStatusEmoji = () =>
    {
        if (status === 'solved') return '✅';
        if (status === 'solving') return '🧠';
        if (status === 'stopped') return '⏸️';
        if (status === 'failed') return '❌';
        if (status === 'loading') return '⏳';
        return '⚡';
    };

    const comparedBoard = (showSolution && solution && board)
        ? board.map((row, r) =>
            row.map((cell, c) => ({
                ...cell,
                isError: !cell.isFixed && cell.value !== '' && cell.value !== solution[r][c].value,
            }))
        )
        : board;

    const getFitnessColor = () =>
    {
        if (stats.fitness === null) return '#2c3e50';
        if (stats.fitness === 0) return '#15803d';
        if (stats.fitness < 10) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <PageContainer>
            <BackToHomeLink />

            <Title>
                Learn with <span>AI</span>
            </Title>
            <Subtitle>
                Watch AI algorithms solve Sudoku step by step
            </Subtitle>

            <MainLayout>
                <SidePanel>
                    <Card>
                        <CardTitle>Controls</CardTitle>
                        <ControlGroup>
                            <Label>Difficulty</Label>
                            <Select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                disabled={status === 'solving'}
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                                <option value="Expert">Expert</option>
                                <option value="Extreme">Extreme</option>
                            </Select>

                            <Label>Algorithm</Label>
                            <AlgorithmButtons>
                                <AlgoButton
                                    $active={algorithm === 'ga'}
                                    onClick={() => setAlgorithm('ga')}
                                    disabled={status === 'solving'}
                                >
                                    Genetic Algorithm
                                </AlgoButton>
                                <AlgoButton
                                    $active={algorithm === 'sa'}
                                    onClick={() => setAlgorithm('sa')}
                                    disabled={status === 'solving'}
                                >
                                    Simulated Annealing
                                </AlgoButton>
                            </AlgorithmButtons>

                            <ActionButton
                                onClick={() => generatePuzzle(difficulty)}
                                disabled={status === 'solving' || status === 'loading'}
                            >
                                Generate Puzzle
                            </ActionButton>

                            {status === 'solving' ? (
                                <ActionButton
                                    $variant="stop"
                                    onClick={stopSolving}
                                >
                                    Stop
                                </ActionButton>
                            ) : (
                                <ActionButton
                                    $variant="solve"
                                    onClick={startSolving}
                                    disabled={!board || status === 'loading'}
                                >
                                    Solve with AI
                                </ActionButton>
                            )}

                            <ActionButton
                                $variant="reset"
                                onClick={reset}
                                disabled={status === 'solving' || !board}
                            >
                                Reset
                            </ActionButton>

                            <SolutionToggleButton
                                $active={showSolution}
                                onClick={() => setShowSolution(prev => !prev)}
                                disabled={!solution}
                            >
                                {showSolution ? '🙈 Hide Solution' : '👁️ Show Solution'}
                            </SolutionToggleButton>
                        </ControlGroup>
                    </Card>
                </SidePanel>

                <BoardsWrapper>
                    <BoardColumn>
                        <BoardLabel $color="#2c3e50">AI Progress</BoardLabel>
                        <BoardWrapper $compact={showSolution && solution}>
                            {board ? (
                                <SudokuBoard
                                    board={comparedBoard}
                                    selectedCell={null}
                                    onCellClick={() => {}}
                                />
                            ) : (
                                <EmptyBoard>
                                    <EmptyIcon>🧩</EmptyIcon>
                                    Click "Generate Puzzle"
                                    to get started
                                </EmptyBoard>
                            )}
                        </BoardWrapper>
                    </BoardColumn>

                    {showSolution && solution && (
                        <BoardColumn>
                            <BoardLabel $color="#8b5cf6">Correct Solution</BoardLabel>
                            <BoardWrapper $compact>
                                <SudokuBoard
                                    board={solution}
                                    selectedCell={null}
                                    onCellClick={() => {}}
                                />
                            </BoardWrapper>
                        </BoardColumn>
                    )}
                </BoardsWrapper>

                <SidePanel>
                    <Card>
                        <CardTitle>Statistics</CardTitle>

                        <StatusBadge $status={status}>
                            <StatusDot $status={status} />
                            {getStatusEmoji()} {statusLabels[status]}
                        </StatusBadge>

                        <StatsGrid>
                            {algorithm === 'ga' && (
                                <StatItem>
                                    <StatLabel>Generation</StatLabel>
                                    <StatValue $pulse={status === 'solving'}>
                                        {stats.generation !== null ? stats.generation : '-'}
                                    </StatValue>
                                </StatItem>
                            )}

                            <StatItem $highlight={stats.fitness === 0}>
                                <StatLabel>Fitness</StatLabel>
                                <StatValue $color={getFitnessColor()} $pulse={status === 'solving'}>
                                    {stats.fitness !== null ? stats.fitness : '-'}
                                </StatValue>
                            </StatItem>

                            {algorithm === 'sa' && (
                                <StatItem>
                                    <StatLabel>Temperature</StatLabel>
                                    <StatValue $pulse={status === 'solving'}>
                                        {stats.temperature !== null ? stats.temperature.toFixed(4) : '-'}
                                    </StatValue>
                                </StatItem>
                            )}

                            <StatItem>
                                <StatLabel>Elapsed</StatLabel>
                                <StatValue>
                                    {stats.elapsed !== null ? `${stats.elapsed}s` : '-'}
                                </StatValue>
                            </StatItem>
                        </StatsGrid>
                    </Card>

                    <Card>
                        <CardTitle>{algorithm === 'ga' ? 'Genetic Algorithm' : 'Simulated Annealing'}</CardTitle>
                        {algorithm === 'ga' ? (
                            <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                                Multiple random solution attempts (population) are created.
                                The best ones are selected, crossed over, and mutated.
                                Solutions improve with each generation. When fitness reaches 0,
                                the puzzle is solved.
                            </p>
                        ) : (
                            <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: '1.6', margin: 0 }}>
                                Starts from a single solution. Small random changes are made.
                                Initially, worse moves are also accepted (high temperature).
                                As temperature drops, only better moves are accepted.
                                When fitness reaches 0, the puzzle is solved.
                            </p>
                        )}
                    </Card>
                </SidePanel>
            </MainLayout>
        </PageContainer>
    );
};

export default AISolver;
