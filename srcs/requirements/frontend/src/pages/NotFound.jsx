import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #f9fafb;
    padding: 20px;
    text-align: center;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const ErrorCode = styled.h1`
    font-size: clamp(6rem, 15vw, 10rem);
    font-weight: 900;
    color: #29972d;
    margin: 0;
    line-height: 1;
    text-shadow: 0 10px 30px rgba(41, 151, 45, 0.2);
`;

const Title = styled.h2`
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    color: #1a2e1b;
    font-weight: 800;
    margin: 20px 0 10px 0;
`;

const Description = styled.p`
    font-size: clamp(1rem, 2vw, 1.2rem);
    color: #4b5563;
    max-width: 500px;
    margin: 0 0 40px 0;
    line-height: 1.6;
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 32px;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 700;
    background: linear-gradient(135deg, #338437 60%, #37e831 100%);
    color: #fff;
    border: none;
    box-shadow: 0 8px 20px rgba(51, 132, 55, 0.2);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 25px rgba(51, 132, 55, 0.3);
        background: linear-gradient(135deg, #29972d 60%, #37e831 100%);
    }

    &:active {
        transform: translateY(1px);
    }
`;

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <PageContainer>
            <ErrorCode>404</ErrorCode>
            <Title>Page Not Found</Title>
            <Description>
                Oops! It seems you've wandered off the Sudoku board. The page you are looking for doesn't exist or has been moved.
            </Description>
            <BackButton onClick={() => navigate('/')}>
                🏠 Return to Homepage
            </BackButton>
        </PageContainer>
    );
};

export default NotFound;