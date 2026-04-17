import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { registerUser, loginUser } from '../../services/api';
import {
    Overlay,
    ModalContainer,
    Title,
    Form,
    Input,
    SubmitButton,
    Divider,
    IntraButton,
    FooterContainer,
    CloseButton,
    ErrorMessage,
} from './Login';

const LoginLink = styled.span`
    color: #15803d;
    cursor: pointer;
    font-weight: bold;
    &:hover { text-decoration: underline; }
`;

// COMPONENT DEFINITION
const SignUp = ({ isOpen, onClose, onSwitchToLogin }) =>
{
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen)
        return null;

    const handleSubmit = async (e) =>
    {
        e.preventDefault();
        setError(null);

        if (username.length < 3)
        {
            setError("Username must be at least 3 characters long.");
            return;
        }

        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        if (!alphanumericRegex.test(username))
        {
            setError("Username can only contain alphanumeric characters.");
            return;
        }

        if (password.length < 8)
        {
            setError("Password must be at least 8 characters long.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email))
        {
            setError("Please enter a valid email address.");
            return;
        }

        if (password !== confirmPassword)
        {
            setError("Passwords do not match!");
            return;
        }

        setIsLoading(true);

        try
        {
            // 1. Kayıt Ol
            await registerUser(username, email, password);

            // 2. Login.jsx'teki gibi loginUser'ı çağır
            const userData = await loginUser(username, password);

            // 3. Login.jsx'teki gibi Context'teki login fonksiyonunu çalıştır
            // Bu fonksiyon hem tokenları kaydeder hem de state'i günceller.
            login(userData);

            // 4. Modalı kapat
            onClose();
        }
        catch (err)
        {
            setError(err.message || "An error occurred.");
        }
        finally
        {
            setIsLoading(false);
        }
    };

    const handleIntraRegister = () =>
    {
        window.location.href = `/api/user/auth/login/`;
    };

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <Title>Sign Up</Title>

                <Form onSubmit={handleSubmit}>
                    {error && <ErrorMessage>{error}</ErrorMessage>}

                    <Input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <Input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <Input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <SubmitButton type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </SubmitButton>

                    <Divider><span>OR</span></Divider>

                    <IntraButton type="button" onClick={handleIntraRegister} disabled={isLoading}>
                        Sign up with 42
                    </IntraButton>
                </Form>

                <FooterContainer>
                    Already have an account?{' '}
                    <LoginLink onClick={onSwitchToLogin}>Log In</LoginLink>
                </FooterContainer>

                <CloseButton onClick={onClose} disabled={isLoading}>Close</CloseButton>
            </ModalContainer>
        </Overlay>
    );
};

export default SignUp;
