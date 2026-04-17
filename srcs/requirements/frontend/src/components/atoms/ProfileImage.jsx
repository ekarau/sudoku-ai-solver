import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==";

const buildInitialsAvatar = (seedText) =>
{
    if (!seedText || typeof seedText !== 'string')
        return DEFAULT_AVATAR;

    const cleaned = seedText.replace('@', '').trim();
    if (!cleaned)
        return DEFAULT_AVATAR;

    const initials = cleaned.slice(0, 2).toUpperCase();
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}`;
};

// STYLED COMPONENTS
const OverlayWrapper = styled.div`
    position: absolute;
    top: 0; 
    left: 0; 
    width: 100%; 
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.2s;

    span 
    {
        color: white;
        font-size: 0.9rem;
        font-weight: bold;
    }
`;

const ImageContainer = styled.div`
    position: relative;
    overflow: hidden;
    border-radius: 50%;
    background-color: #e0e0e0;
    width: 150px;
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 4px solid #23da63;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    transition: transform 0.2s ease;
    cursor: pointer;

    &:hover
    {
        transform: ${props => 
        {
            if (props.$isClickable)
                return 'scale(1.02)';
            
            return 'none';
        }};
    }

    &:hover ${OverlayWrapper}
    {
        opacity: 1;
    }
`;

const AvatarImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
`;

// COMPONENT DEFINITION
const ProfileImage = ({ src, alt = "Avatar", className = "", style = {}, onClick, fallbackSeed = "" }) => 
{
    const fallbackAvatar = buildInitialsAvatar(fallbackSeed || alt);
    const [imgSrc, setImgSrc] = useState(src || fallbackAvatar);
    const isClickable = (typeof onClick === 'function');

    useEffect(() => 
    {
        setImgSrc(src || fallbackAvatar);
    }, [src, fallbackAvatar]);

    const handleError = () => 
    {
        if (imgSrc !== fallbackAvatar)
            setImgSrc(fallbackAvatar);
    };

    return (
        <ImageContainer 
            className={className} 
            onClick={onClick}
            style={style} 
            $isClickable={isClickable}
        >
            <AvatarImage 
                src={imgSrc} 
                alt={alt} 
                onError={handleError}
            />
            
            {isClickable && 
            (
                <OverlayWrapper>
                    <span>Change</span>
                </OverlayWrapper>
            )}
        </ImageContainer>
    );
};

export default ProfileImage;