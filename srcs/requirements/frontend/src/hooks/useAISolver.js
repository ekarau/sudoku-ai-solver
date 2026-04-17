import { useState, useRef, useCallback } from 'react';
import { solveWithAI } from '../services/aiService';

const useAISolver = () =>
{
    const [puzzle, setPuzzle] = useState(null);       // Orijinal puzzle (sabit hücreleri belirlemek için)
    const [board, setBoard] = useState(null);          // Güncel board durumu
    const [algorithm, setAlgorithm] = useState('ga');  // "ga" veya "sa"
    const [status, setStatus] = useState('idle');       // "idle", "loading", "solving", "solved", "failed"
    const [stats, setStats] = useState({
        generation: null,
        fitness: null,
        temperature: null,
        elapsed: null,
    });

    const controllerRef = useRef(null);

    // Puzzle'ı SudokuBoard formatına çevir
    const formatBoard = useCallback((rawBoard, originalPuzzle) =>
    {
        if (!rawBoard)
            return null;

        return rawBoard.map((row, r) =>
            row.map((val, c) => ({
                value: val === 0 ? '' : val,
                isFixed: originalPuzzle ? originalPuzzle[r][c] !== 0 : false,
                isError: false,
                isAIFilled: originalPuzzle ? originalPuzzle[r][c] === 0 && val !== 0 : false,
            }))
        );
    }, []);

    const generatePuzzle = useCallback(async (difficulty) =>
    {
        setStatus('loading');
        setStats({ generation: null, fitness: null, temperature: null, elapsed: null });

        try
        {
            const response = await fetch(`/api/game/generate?difficulty=${difficulty}`);

            if (!response.ok)
                throw new Error(`Server returned ${response.status}`);

            const data = await response.json();

            if (!data.board)
                throw new Error('Invalid response from game service');

            setPuzzle(data.board);
            setBoard(formatBoard(data.board, data.board));
            setStatus('idle');
        }
        catch (err)
        {
            console.error('Puzzle generation failed:', err);
            setStatus('failed');
        }
    }, [formatBoard]);

    const startSolving = useCallback(() =>
    {
        if (!puzzle)
            return;

        setStatus('solving');

        const controller = solveWithAI(
            puzzle,
            algorithm,
            (stepData) =>
            {
                // "done" eventi board içermez, sadece geçerli adımları işle
                if (!stepData.board)
                    return;

                setBoard(formatBoard(stepData.board, puzzle));
                setStats({
                    generation: stepData.generation,
                    fitness: stepData.fitness,
                    temperature: stepData.temperature,
                    elapsed: stepData.elapsed,
                });

                if (stepData.status === 'solved')
                    setStatus('solved');
                else if (stepData.status === 'failed')
                    setStatus('failed');
            },
            () =>
            {
                setStatus((prev) => prev === 'solving' ? 'failed' : prev);
            },
            (err) =>
            {
                console.error('AI solver error:', err);
                setStatus('failed');
            }
        );

        controllerRef.current = controller;
    }, [puzzle, algorithm, formatBoard]);

    const stopSolving = useCallback(() =>
    {
        if (controllerRef.current)
        {
            controllerRef.current.abort();
            controllerRef.current = null;
        }
        setStatus('stopped');
    }, []);

    const reset = useCallback(() =>
    {
        stopSolving();
        if (puzzle)
            setBoard(formatBoard(puzzle, puzzle));
        setStats({ generation: null, fitness: null, temperature: null, elapsed: null });
        setStatus('idle');
    }, [puzzle, formatBoard, stopSolving]);

    return {
        puzzle,
        board,
        algorithm,
        setAlgorithm,
        status,
        stats,
        generatePuzzle,
        startSolving,
        stopSolving,
        reset,
    };
};

export default useAISolver;
