import styled, { keyframes } from 'styled-components';

// STYLED COMPONENTS
const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const slideUp = keyframes`
    from
    {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }

    to
    {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContainer = styled.div`
    background: #ffffff;
    width: 90%;
    max-width: 420px;
    border-radius: 24px;
    padding: 40px 30px;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    animation: ${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 16px;
    right: 20px;
    background: none;
    border: none;
    font-size: 24px;
    color: #9ca3af;
    cursor: pointer;
    transition: color 0.2s;

    &:hover
    {
        color: #4b5563;
    }
`;

const IconWrapper = styled.div`
    font-size: 48px;
    margin-bottom: 16px;
`;

const Title = styled.h2`
    margin: 0 0 12px 0;
    color: #1f2937;
    font-size: 1.6rem;
    font-weight: 800;
`;

const Description = styled.p`
    color: #4b5563;
    font-size: 1rem;
    line-height: 1.5;
    margin: 0 0 30px 0;
`;

const ButtonGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const BaseButton = styled.button`
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
`;

const PrimaryButton = styled(BaseButton)`
    background-color: #09c10f;
    color: white;
    border: 2px solid #338437;

    &:hover
    {
        background-color: #248528;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(9, 193, 15, 0.2);
    }
`;

const SecondaryButton = styled(BaseButton)`
    background-color: #f3f4f6;
    color: #374151;
    border: 2px solid #e5e7eb;

    &:hover
    {
        background-color: #e5e7eb;
        transform: translateY(-2px);
    }
`;

// COMPONENT
const AuthRequiredModal = ({ isOpen, onClose, onOpenLogin, onOpenSignUp }) => {
    if (!isOpen) return null;

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose}>&times;</CloseButton>
                
                <IconWrapper>🔒</IconWrapper>
                <Title>Account Required</Title>
                <Description>
                    To play Sudoku (Combat or Single), you need to have an account. Join us to track your scores and challenge others!
                </Description>

                <ButtonGroup>
                    <PrimaryButton onClick={onOpenSignUp}>
                        Create New Account
                    </PrimaryButton>
                    <SecondaryButton onClick={onOpenLogin}>
                        I Already Have an Account
                    </SecondaryButton>
                </ButtonGroup>
            </ModalContainer>
        </Overlay>
    );
};

export default AuthRequiredModal;