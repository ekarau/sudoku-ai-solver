import React, { useState } from 'react';
import styled from 'styled-components';
import { device } from '../../utils/device';
import ActionBtn from '../atoms/ActionBtn';

// STYLED COMPONENTS
const FormWrapper = styled.form`
    display: flex;
    gap: 8px;
    margin-bottom: 15px;

    @media ${device.mobileL}
    {
        gap: 6px;
        margin-bottom: 10px;
    }
`;

const InputField = styled.input`
    flex: 1;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 12px;
    color: #374151;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.2s;

    &:focus
    {
        border-color: #16d65d;
        background: #fff;
        box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.1);
    }

    @media ${device.mobileL}
    {
        padding: 8px 10px;
        font-size: 0.85rem;
    }
`;

const ValidationMsg = styled.div`
    color: #991b1b;
    background-color: #fef2f2;
    border: 1px solid #f87171;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 0.8rem;
    font-weight: 500;
    margin-bottom: 10px;
    margin-top: -8px;
`;

const SubmitButton = styled(ActionBtn)`
    background: #16d65d;
    align-items: normal;
    color: white;
    border: none;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 1.4rem;
    box-shadow: none;
    cursor: pointer;
    align-self: center;

    &:hover:not(:disabled)
    {
        background: #22c55e;
        transform: translateY(-0.1vmin);
        box-shadow: 0.1vmin 0.3vmin 0.8vmin rgba(34, 197, 94, 0.3);
    }

    @media ${device.mobileL}
    {
        padding: 3px 12px;
        font-size: 1.1rem;
    }
`;

// COMPONENT DEFINITION
const AddFriendForm = ({ onAdd }) =>
{
    const [username, setUsername] = useState('');
    const [validationError, setValidationError] = useState('');

    const handleSubmit = (e) =>
    {
        e.preventDefault();
        setValidationError('');

        const trimmed = username.trim();

        if (trimmed === '')
            return;

        if (trimmed.length < 3)
        {
            setValidationError('Username must be at least 3 characters.');
            return;
        }

        const alphanumericRegex = /^[a-zA-Z0-9_]+$/;
        if (!alphanumericRegex.test(trimmed))
        {
            setValidationError('Username can only contain letters, numbers and underscores.');
            return;
        }

        onAdd(trimmed).then((success) =>
        {
            if (success === true)
                setUsername('');
        });
    };

    return (
        <>
            <FormWrapper onSubmit={handleSubmit}>

                <InputField
                    type="text"
                    placeholder="Username..."
                    value={username}
                    onChange={(e) =>
                    {
                        setUsername(e.target.value);
                        if (validationError)
                            setValidationError('');
                    }}
                />

                <SubmitButton>
                    +
                </SubmitButton>

            </FormWrapper>
            {validationError && <ValidationMsg>{validationError}</ValidationMsg>}
        </>
    );
};

export default AddFriendForm;