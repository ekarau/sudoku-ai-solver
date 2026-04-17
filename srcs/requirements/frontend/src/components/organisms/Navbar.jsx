import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../services/api';
import { getUserDetails } from '../../services/userService';
import FriendListWidget from './FriendListWidget';
import Login from './Login';
import SignUp from './Signup';
import HowToPlayModal from './HowToPlayModal';

// STYLED COMPONENTS
const NavContainer = styled.nav`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 50px;
    height: 90px;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 50;
    background-color: #f0f1f0;
    border-bottom: 2px solid #e0e0e0;
    box-sizing: border-box;

    @media (max-width: 900px)
    {
        padding: 0 20px;
        height: 75px;
    }

    @media (max-width: 768px)
    {
        padding: 0 12px;
        height: 60px;
    }
`;

const LogoContainer = styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
`;

const LogoTextBase = styled.span`
    font-size: 32px;
    font-weight: 900;
    letter-spacing: -1px;
    user-select: none;

    @media (max-width: 900px)
    {
        font-size: 26px;
    }

    @media (max-width: 768px)
    {
        font-size: 20px;
    }
`;

const LogoTextSudo = styled(LogoTextBase)`
    color: #038135; 
`;

const LogoTextKu = styled(LogoTextBase)`
    color: #15c65c;
    margin-left: 5px;
`;

const AuthButtons = styled.div`
    display: flex;
    gap: 20px;
    align-items: center;

    @media (max-width: 900px)
    {
        gap: 12px;
    }

    @media (max-width: 768px)
    {
        gap: 8px;
    }
`;

const ActionContainer = styled.div`
    display: flex;
    gap: 20px;
    align-items: center;

    @media (max-width: 900px)
    {
        gap: 12px;
    }

    @media (max-width: 768px)
    {
        gap: 8px;
    }
`;

const DropdownContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

/* YENİ ZIRH: Ekran küçüldüğünde buton içindeki YAZILARI gizler, ikonları bırakır */
const ButtonText = styled.span`
    @media (max-width: 768px)
    {
        display: none;
    }
`;

const TriggerButton = styled.button`
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px 30px;
    border-radius: 35px;
    font-size: 20px;
    font-weight: 700;
    background-color: #29972d;
    color: #ffffff;
    border: 2px solid #03830b;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover
    {
        transform: translateY(-2px);
        background-color: #248528;
        box-shadow: 0 6px 15px rgba(0,0,0,0.2);
    }

    @media (max-width: 900px)
    {
        padding: 8px 18px;
        gap: 10px;
        font-size: 16px;
    }

    @media (max-width: 768px)
    {
        padding: 7px 10px;
        gap: 0;
        font-size: 0.95rem;
        border-width: 1.5px;
    }

    @media (max-width: 480px)
    {
        padding: 5px 8px;
        font-size: 0.9rem;
    }
`;

const HowToPlayNavButton = styled.button`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 30px;
    border-radius: 35px;
    font-size: 20px;
    font-weight: 700;
    background: linear-gradient(135deg, #338437 60%, #37e831 100%);
    color: #fff;
    border: 2px solid #29972d;
    box-shadow: 0 4px 12px rgba(51, 132, 55, 0.15);
    cursor: pointer;
    transition: all 0.2s ease;
    outline: none;

    &:hover
    {
        background: linear-gradient(135deg, #29972d 60%, #37e831 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(51, 132, 55, 0.22);
    }

    @media (max-width: 900px)
    {
        padding: 8px 18px;
        font-size: 16px;
        gap: 8px;
    }

    @media (max-width: 768px)
    {
        padding: 7px 10px;
        font-size: 0.95rem;
        gap: 0;
        border-width: 1.5px;
    }

    @media (max-width: 480px)
    {
        padding: 5px 8px;
        font-size: 0.9rem;
    }
`;

const FriendsTriggerButton = styled(TriggerButton)`
`;

const AvatarImage = styled.img`
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid white;

    @media (max-width: 900px)
    {
        width: 38px;
        height: 38px;
    }

    @media (max-width: 768px)
    {
        width: 32px;
        height: 32px;
    }
`;

const DisplayName = styled.span`
    @media (max-width: 768px)
    {
        display: none;
    }
`;

const BaseDropdownMenu = styled.div`
    position: absolute;
    top: calc(100% + 15px);
    right: 0;
    background: white;
    border: 3px solid #222;
    border-radius: 14px;
    box-shadow: 0 15px 40px rgba(0,0,0,0.25);
    z-index: 1000;
    overflow: hidden;
`;

const ProfileDropdownMenu = styled(BaseDropdownMenu)`
    width: 250px;
    padding: 12px 0;
`;

const FriendsDropdownMenu = styled(BaseDropdownMenu)`
    width: 400px;
    padding: 20px;

    @media (max-width: 900px)
    {
        width: 300px;
        right: -60px;
    }
`;

const WidgetWrapper = styled.div`
    width: 100%;
    max-height: 500px;
    display: flex;
    flex-direction: column;
`;

const UserInfoBox = styled.div`
    padding: 12px 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    strong 
    {
        font-size: 1.1rem;
        color: #111;
    }

    span 
    {
        font-size: 0.85rem;
        color: #666;
    }
`;

const MenuItem = styled.button`
    width: 100%;
    padding: 14px 20px;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    transition: background 0.2s;

    &:hover
    {
        background: #f0f1f0;
    }
`;

const LogoutMenuItem = styled(MenuItem)`
    color: #d9534f;
`;

const Divider = styled.div`
    height: 1px;
    background: #222;
    margin: 8px 0;
    opacity: 0.1;
`;

const BasicButton = styled.button`
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
    border: none;

    @media (max-width: 900px)
    {
        padding: 8px 16px;
        font-size: 0.9rem;
    }

    @media (max-width: 768px)
    {
        padding: 7px 12px;
        font-size: 0.85rem;
    }
`;

const PrimaryButton = styled(BasicButton)`
    background-color: #09c10f;
    color: white;
    border: 2px solid #338437;

    &:hover
    {
        background-color: #248528;
    }
`;

const SecondaryButton = styled(BasicButton)`
    background-color: transparent;
    color: #338437;
    border: 2px solid #338437;

    &:hover
    {
        background-color: #f0fdf4;
    }
`;

// COMPONENT DEFINITION
const Navbar = () =>
{
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [dbUser, setDbUser] = useState(null);
    
    // MODAL STATE'LERİ
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);
    const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false); 
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isFriendsOpen, setIsFriendsOpen] = useState(false);
    
    const dropdownRef = useRef(null);
    const friendsRef = useRef(null);

    const BASE_URL = '';

    useEffect(() =>
    {
        const fetchLatestDetails = async () =>
        {
            if (user)
            {
                try 
                {
                    const data = await getUserDetails();
                    if (data)
                        setDbUser(data);
                }
                catch (error)
                {
                    console.error(error);
                }
            }
        };
        fetchLatestDetails();
    }, [user]);

    useEffect(() =>
    {
        const handleClickOutside = (event) =>
        {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target))
                setIsDropdownOpen(false);
                
            if (friendsRef.current && !friendsRef.current.contains(event.target))
                setIsFriendsOpen(false);
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () =>
    {
        await logout();
        setIsDropdownOpen(false);
        setIsFriendsOpen(false);
        navigate('/');
    };

    const getUserDisplayData = () =>
    {
        let source = user;
        
        if (dbUser)
            source = dbUser;
        else if (user && user.user)
            source = user.user;
        
        if (!user)
        {
            return { 
                name: 'Guest', 
                username: 'guest',
                avatar: "https://ui-avatars.com/api/?background=random&name=Guest" 
            };
        }

        let currentUsername = 'user';
        if (source && source.username)
            currentUsername = source.username;

        let currentDisplayName = currentUsername;
        if (source && source.display_name)
            currentDisplayName = source.display_name;
        else if (source && source.nickname)
            currentDisplayName = source.nickname;

        let avatarSrc = "https://ui-avatars.com/api/?background=random&name=" + currentUsername;
        
        if (source && source.avatar)
        {
            if (source.avatar.startsWith('http'))
                avatarSrc = source.avatar;
            else
                avatarSrc = `${BASE_URL}${source.avatar}`;
        }

        return { name: currentDisplayName, username: currentUsername, avatar: avatarSrc };
    };

    const { name, username, avatar } = getUserDisplayData();

    const handleAvatarError = (e) =>
    {
        e.target.src = "https://ui-avatars.com/api/?background=random&name=" + username;
    };

    const toggleFriends = () =>
    {
        setIsFriendsOpen(!isFriendsOpen);
        setIsDropdownOpen(false);
    };

    const toggleProfile = () =>
    {
        setIsDropdownOpen(!isDropdownOpen);
        setIsFriendsOpen(false);
    };

    let friendsMenuElement = null;
    if (isFriendsOpen)
    {
        friendsMenuElement = (
            <FriendsDropdownMenu>
                <WidgetWrapper>
                    <FriendListWidget />
                </WidgetWrapper>
            </FriendsDropdownMenu>
        );
    }

    let profileMenuElement = null;
    if (isDropdownOpen)
    {
        profileMenuElement = (
            <ProfileDropdownMenu>
                <UserInfoBox>
                    <strong>{name}</strong>
                    <span>@{username}</span>
                </UserInfoBox>
                <Divider />
                <MenuItem onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}>
                    👤 Profile Details
                </MenuItem>
                <Divider />
                <LogoutMenuItem onClick={handleLogout}>
                    Log Out
                </LogoutMenuItem>
            </ProfileDropdownMenu>
        );
    }

    let authSectionElement = null;
    if (user)
    {
        authSectionElement = (
            <ActionContainer>
                
                <DropdownContainer ref={friendsRef}>
                    <FriendsTriggerButton type="button" onClick={toggleFriends}>
                        <span role="img" aria-label="social">👥</span>
                        <ButtonText>Social Hub</ButtonText>
                    </FriendsTriggerButton>
                    {friendsMenuElement}
                </DropdownContainer>

                <DropdownContainer ref={dropdownRef}>
                    <TriggerButton type="button" onClick={toggleProfile}>
                        <AvatarImage 
                            src={avatar} 
                            alt={username} 
                            onError={handleAvatarError} 
                        />
                        <DisplayName>{name}</DisplayName>
                    </TriggerButton>
                    {profileMenuElement}
                </DropdownContainer>
                
            </ActionContainer>
        );
    }
    else
    {
        authSectionElement = (
            <>
                <SecondaryButton onClick={() => setIsLoginOpen(true)}>
                    Log In
                </SecondaryButton>
                <PrimaryButton onClick={() => setIsSignUpOpen(true)}>
                    Sign Up
                </PrimaryButton>
            </>
        );
    }

    let modalsElement = null;
    if (!user)
    {
        modalsElement = (
            <>
                <Login 
                    isOpen={isLoginOpen} 
                    onClose={() => setIsLoginOpen(false)} 
                    onSwitchToSignup={() => { setIsLoginOpen(false); setIsSignUpOpen(true); }}
                />
                <SignUp 
                    isOpen={isSignUpOpen} 
                    onClose={() => setIsSignUpOpen(false)}
                    onSwitchToLogin={() => { setIsSignUpOpen(false); setIsLoginOpen(true); }}
                />
            </>
        );
    }

    return (
        <>
            <NavContainer>
                
                <LogoContainer onClick={() => navigate('/')}>
                    <LogoTextSudo>Sudo</LogoTextSudo>
                    <LogoTextKu>ku</LogoTextKu>
                </LogoContainer>
                
                <AuthButtons>
                    <HowToPlayNavButton onClick={() => setIsHowToPlayOpen(true)}>
                        <span role="img" aria-label="help">❓</span>
                        <ButtonText>How to Play</ButtonText>
                    </HowToPlayNavButton>

                    {authSectionElement}
                </AuthButtons>
                
            </NavContainer>

            {modalsElement}
            
            <HowToPlayModal 
                isOpen={isHowToPlayOpen} 
                onClose={() => setIsHowToPlayOpen(false)} 
            />
        </>
    );
};

export default Navbar;