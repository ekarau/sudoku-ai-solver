import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import BackToHomeLink from '../components/atoms/BackToHomeLink';
import Footer from '../components/atoms/Footer';
import ProfileContent from '../components/organisms/ProfileContent';
import ConfirmationModal from '../components/molecules/ConfirmationModal';
import { getUserStats, logoutUser, deleteUserAccount } from '../services/api';
import { getUserDetails} from '../services/userService';

// STYLED COMPONENTS
const PageContainer = styled.div`
    min-height: 100vh;
    background-color: #f0fdf4;
    color: #333;
    font-family: 'Inter', system-ui, sans-serif;
    padding-top: 110px;
    padding-bottom: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    @media (max-width: 768px)
    {
        padding-top: 20px;
    }

    h3 {
        color: #14532d;
        margin-bottom: 15px;
        font-size: 1.2rem;
        border-bottom: 2px solid #dcfce7;
        padding-bottom: 10px;
        display: flex;
        justify-content: space-between;
        margin-top: 0;
    }

    .m-badge-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 15px;
        min-height: 200px;
    }

    .a-badge-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 10px;
        background: #f9fafb;
        border-radius: 12px;
        transition: transform 0.2s;
    }

    .a-badge-item:hover {
        transform: scale(1.05);
        background: #edfdf5;
    }

    .a-badge-icon {
        font-size: 2rem;
        margin-bottom: 5px;
    }

    .a-badge-name {
        font-size: 0.8rem;
        font-weight: 600;
        color: #555;
    }

    .m-pagination-controls {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 20px;
    }

    .a-page-btn {
        background: #f0fdf4;
        border: 1px solid #4ade80;
        color: #14532d;
        padding: 5px 15px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
    }

    .a-page-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        border-color: #ddd;
        background: #eee;
    }

    .profile-back-link {
        position: absolute;
        top: 40px;
        left: 40px;
        text-decoration: none;
        color: #14532d;
        font-weight: 700;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
        z-index: 10;
    }

    .profile-back-link:hover {
        color: #4ade80;
        transform: translateX(-5px);
    }

    @media (max-width: 768px) {
        .profile-back-link {
            position: static;
            align-self: flex-start;
            margin-bottom: 20px;
            margin-left: 20px;
        }
    }
`;

const ErrorMessage = styled.div`
    padding: 40px 20px;
    height: 100px;
    width: 250px;
    background-color: #fee2e2;
    color: #7f1d1d;
    border-radius: 8px;
    margin: 20px;
    text-align: center;
    font-weight: 700;
`;

const LoadingText = styled.div`
    color: #14532d;
    margin-top: 100px;
    text-align: center;
`;

// COMPONENT DEFINITION
const Profile = () =>
{
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { username: paramUsername } = useParams();

    const [userDetails, setUserDetails] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOtherUser, setIsOtherUser] = useState(false);
    const [error, setError] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleLogout = async () =>
    {
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        try
        {
            await logoutUser();
        }
        catch (error)
        {
            console.error(error);
        }
        finally
        {
            logout();
            navigate('/');
        }
    };

    const handleDeleteRequest = () =>
    {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () =>
    {
        const success = await deleteUserAccount();

        if (success)
        {
            setIsDeleteModalOpen(false);
            alert("Your account has been successfully deleted.");
            logout();
            navigate('/');
        }
        else
        {
            setIsDeleteModalOpen(false);
            alert("An error occurred while deleting the account.");
        }
    };

    useEffect(() =>
    {
        const fetchData = async () =>
        {
            setLoading(true);
            setError(null);

            if (paramUsername) 
            {
                try 
                {
                    let tempUserDetails = null;
                    const userResponse = await fetch(`/api/v1/user/by-username/${paramUsername}/`);
                    if (userResponse.ok)
                        tempUserDetails = await userResponse.json();

                    if (!tempUserDetails || !tempUserDetails.id)
                    {
                        setError(`User "${paramUsername}" not found`);
                        setLoading(false);
                        return;
                    }

                    const statsData = await getUserStats(tempUserDetails.username, tempUserDetails.id);
                    setUserDetails(tempUserDetails);
                    setStats(statsData);

                    let isCurrentUser = false;
                    if (user)
                    {
                        if (user.username === paramUsername)
                            isCurrentUser = true;
                    }

                    setIsOtherUser(!isCurrentUser);
                } 
                catch (error) 
                {
                    console.error("Error fetching user profile:", error);
                    setError(`User "${paramUsername}" not found`);
                    setLoading(false);
                    return;
                }
            }
            else if (user)
            {
                try 
                {
                    const details = await getUserDetails();
                    if (details)
                    {
                        setUserDetails(details);
                        const statsData = await getUserStats(details.username, details.id);
                        setStats(statsData);
                        setIsOtherUser(false);
                    }
                } 
                catch (err) 
                {
                    console.error("Error fetching profile:", err);
                    setError("Failed to load profile");
                }
            }
            else
            {
                navigate('/');
                return;
            }

            setLoading(false);
        };

        fetchData();
    }, [user, paramUsername, navigate]);

    if (!user)
    {
        if (!paramUsername)
            return null;
    }

    let contentElement = null;

    if (error)
    {
        contentElement = (
            <ErrorMessage>
                {error}
            </ErrorMessage>
        );
    }
    else if (loading)
    {
        contentElement = (
            <LoadingText>
                Loading Profile...
            </LoadingText>
        );
    }
    else
    {
        let logoutFunc = null;
        if (!isOtherUser)
            logoutFunc = handleLogout;

        let deleteFunc = null;
        if (!isOtherUser)
            deleteFunc = handleDeleteRequest;

        let confirmationModalElement = null;
        if (!isOtherUser)
        {
            confirmationModalElement = (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Account"
                    message="Are you sure you want to delete your account? This action cannot be undone and you will lose all your data."
                />
            );
        }

        contentElement = (
            <>
                <ProfileContent
                    userDetails={userDetails}
                    stats={stats}
                    onLogout={logoutFunc}
                    onDeleteAccount={deleteFunc}
                    isOtherUser={isOtherUser}
                />
                
                {confirmationModalElement}
            </>
        );
    }

    return (
        <PageContainer>

            <BackToHomeLink />

            {contentElement}

            <Footer />

        </PageContainer>
    );
};

export default Profile;