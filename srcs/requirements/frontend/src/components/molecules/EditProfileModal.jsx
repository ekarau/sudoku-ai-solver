import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import ProfileImage from '../atoms/ProfileImage';

// ANIMATIONS
const epFadeIn = keyframes`
    from
    {
        opacity: 0;
    }
    to
    {
        opacity: 1;
    }
`;

const epPopIn = keyframes`
    from
    {
        transform: scale(0.9);
        opacity: 0;
    }
    to
    {
        transform: scale(1);
        opacity: 1;
    }
`;

// STYLED COMPONENTS
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(83, 81, 81, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    animation: ${epFadeIn} 0.2s ease-out;
`;

const Card = styled.div`
    background: #ffffff;
    width: 90%;
    max-width: 400px;
    border-radius: 24px;
    box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: ${epPopIn} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
`;

const Header = styled.div`
    padding: 20px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    border-bottom: 1px solid #f3f4f6;

    h3
    {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 800;
        color: #111827;
        letter-spacing: -0.5px;
    }
`;

const CloseButton = styled.button`
    background: #f3f4f6;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;

    &:hover
    {
        background: #fee2e2;
        color: #ef4444;
        transform: rotate(90deg);
    }
`;

const Body = styled.div`
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 25px;
`;

const AvatarSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
`;

const AvatarOverlay = styled.div`
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.2s;

    span
    {
        color: white;
        font-size: 1.5rem;
        font-weight: bold;
    }
`;

const AvatarWrapper = styled.label`
    position: relative;
    width: 110px;
    height: 110px;
    border-radius: 50%;
    padding: 4px;
    background: #fff;
    border: 2px dashed #d1d5db;
    cursor: pointer;
    transition: border-color 0.3s;
    box-sizing: border-box;

    &:hover
    {
        border-color: #10b981;
    }

    &:hover ${AvatarOverlay}
    {
        opacity: 1;
    }
`;

const StyledProfileImage = styled(ProfileImage)`
    width: 100% !important;
    height: 100% !important;
    border: none !important;
    object-fit: cover;
`;

const FileInput = styled.input`
    display: none;
`;

const HintText = styled.span`
    font-size: 0.8rem;
    color: #9ca3af;
    font-weight: 500;
`;

const ErrorText = styled.div`
    color: #ef4444;
    font-size: 0.85rem;
    font-weight: 600;
    text-align: center;
    background: #fef2f2;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #fee2e2;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-size: 0.85rem;
    font-weight: 700;
    color: #374151;
    margin-left: 4px;
`;

const InputField = styled.input`
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px solid #f3f4f6;
    font-size: 0.95rem;
    color: #1f2937;
    background: #f9fafb;
    transition: all 0.2s;
    outline: none;
    box-sizing: border-box;

    &:focus
    {
        background: #fff;
        border-color: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
    }

    &:disabled
    {
        background: #f3f4f6;
        color: #9ca3af;
        border-color: transparent;
        cursor: not-allowed;
    }
`;

const Footer = styled.div`
    padding: 20px 30px;
    background: #ffffff;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
`;

const BaseButton = styled.button`
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.2s, background-color 0.2s;
    border: none;

    &:active
    {
        transform: scale(0.98);
    }

    &:disabled
    {
        cursor: not-allowed;
        box-shadow: none;
    }
`;

const CancelButton = styled(BaseButton)`
    background: #f3f4f6;
    color: #4b5563;

    &:hover:not(:disabled)
    {
        background: #e5e7eb;
        color: #1f2937;
    }
`;

const SaveButton = styled(BaseButton)`
    background: #10b981;
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

    &:hover:not(:disabled)
    {
        background: #059669;
        box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
    }

    &:disabled
    {
        background: #a7f3d0;
    }
`;

// COMPONENT DEFINITION
const EditProfileModal = ({ isOpen, onClose, currentUserData, onSave }) =>
{
    const [displayName, setDisplayName] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() =>
    {
        if (isOpen && currentUserData)
        {
            let initialName = '';
            if (currentUserData.nickname)
                initialName = currentUserData.nickname;
            else if (currentUserData.display_name)
                initialName = currentUserData.display_name;

            let initialAvatar = null;
            if (currentUserData.avatar)
                initialAvatar = currentUserData.avatar;

            setDisplayName(initialName);
            setPreviewUrl(initialAvatar);
            setSelectedFile(null);
        }
    }, [isOpen, currentUserData]);

    if (!isOpen)
        return null;

    const handleFileChange = (e) =>
    {
        const file = e.target.files[0];
        if (file)
        {
            // 10MB Limit Validation
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize)
            {
                setError('File size exceeds 10MB. Please choose a smaller image.');
                return;
            }

            setError('');
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () =>
    {
        if (displayName.trim().length < 3)
        {
            setError("Display Name must be at least 3 characters long.");
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('display_name', displayName);
        
        if (selectedFile)
            formData.append('avatar', selectedFile);

        await onSave(formData);
        setIsLoading(false);
    };

    // LOGIC-DRIVEN RENDERING
    let currentUsername = '';
    if (currentUserData && currentUserData.username)
        currentUsername = `@${currentUserData.username}`;

    let saveButtonText = 'Save Changes';
    if (isLoading)
        saveButtonText = 'Saving...';

    return (
        <Overlay onClick={onClose}>
            <Card onClick={(e) => e.stopPropagation()}>
                
                <Header>
                    <h3>Edit Profile</h3>
                    <CloseButton onClick={onClose}>
                        &times;
                    </CloseButton>
                </Header>

                <Body>
                    <AvatarSection>
                        <AvatarWrapper>
                            
                            <StyledProfileImage src={previewUrl} fallbackSeed={currentUserData?.username || ''} />
                            
                            <AvatarOverlay>
                                <span>📷</span>
                            </AvatarOverlay>
                            
                            <FileInput 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange}
                                disabled={isLoading}
                            />
                            
                        </AvatarWrapper>
                        
                        <HintText>
                            Tap photo to change
                        </HintText>
                    </AvatarSection>

                    {error && <ErrorText>{error}</ErrorText>}

                    <FormGroup>
                        <Label>Display Name</Label>
                        <InputField 
                            type="text" 
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="How should we call you?"
                            maxLength={20}
                            disabled={isLoading}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Username</Label>
                        <InputField 
                            type="text" 
                            value={currentUsername} 
                            disabled 
                        />
                    </FormGroup>
                </Body>

                <Footer>
                    <CancelButton onClick={onClose} disabled={isLoading}>
                        Cancel
                    </CancelButton>
                    <SaveButton 
                        onClick={handleSubmit} 
                        disabled={isLoading || !!error}
                    >
                        {saveButtonText}
                    </SaveButton>
                </Footer>

            </Card>
        </Overlay>
    );
};

export default EditProfileModal;