/**
 * AI Solver SSE Service
 * Backend'den gelen SSE stream'ini okuyarak adım adım board güncellemesi sağlar.
 */

export const solveWithAI = (board, algorithm, onStep, onComplete, onError) =>
{
    const controller = new AbortController();

    fetch('/api/ai/solve',
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board, algorithm }),
        signal: controller.signal,
    })
    .then((response) =>
    {
        if (!response.ok)
            throw new Error(`HTTP ${response.status}`);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const read = () =>
        {
            reader.read().then(({ done, value }) =>
            {
                if (done)
                {
                    if (onComplete)
                        onComplete();
                    return;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Son satır eksik olabilir

                for (const line of lines)
                {
                    if (line.startsWith('data:'))
                    {
                        const jsonStr = line.slice(5).trim();
                        if (jsonStr)
                        {
                            try
                            {
                                const data = JSON.parse(jsonStr);
                                if (onStep)
                                    onStep(data);
                            }
                            catch (e)
                            {
                                // JSON parse hatası, devam et
                            }
                        }
                    }
                }

                read();
            })
            .catch((err) =>
            {
                if (err.name !== 'AbortError' && onError)
                    onError(err);
            });
        };

        read();
    })
    .catch((err) =>
    {
        if (err.name !== 'AbortError' && onError)
            onError(err);
    });

    return controller;
};
