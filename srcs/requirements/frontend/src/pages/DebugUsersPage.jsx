import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/atoms/Footer';

// --- STYLED COMPONENTS ---

const PageWrapper = styled.div`
    min-height: 100vh;
    background-color: #f9fafb;
    display: flex;
    flex-direction: column;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const ContentContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    width: 100%;
    box-sizing: border-box;
    flex: 1;
    display: flex;
    flex-direction: column;
`;

const Header = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 15px;

    @media (max-width: 480px)
    {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }
`;

const Title = styled.h1`
    font-size: 2rem;
    color: #111827;
    margin: 0;
    font-weight: bold;
`;

const LogoutButton = styled.button`
    padding: 10px 20px;
    background-color: #e74c3c;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    font-family: inherit;

    &:hover
    {
        background-color: #c0392b;
        transform: translateY(-2px);
    }

    &:active
    {
        transform: translateY(1px);
    }
`;

const TableWrapper = styled.div`
    background: #ffffff;
    border-radius: 15px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow-x: auto;
    margin-bottom: 40px;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    text-align: left;
`;

const Th = styled.th`
    padding: 18px 20px;
    border-bottom: 2px solid #f3f4f6;
    background-color: #f8f9fa;
    font-weight: 700;
    color: #4b5563;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
    white-space: nowrap;
`;

const Td = styled.td`
    padding: 16px 20px;
    border-bottom: 1px solid #f3f4f6;
    color: #374151;
    font-size: 0.95rem;
`;

const TableRow = styled.tr`
    transition: background-color 0.2s ease;

    &:hover 
    {
        background-color: #f9fafb;
    }
    
    &:last-child ${Td}
    {
        border-bottom: none;
    }
`;

const MessageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.25rem;
    font-weight: 600;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: ${props => props.$isError ? '#e74c3c' : '#4b5563'};
    background-color: #f9fafb;
`;

// --- COMPONENT DEFINITION ---

const DebugUsersPage = () => 
{
    const { user, logout, loading: authLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => 
    {
        if (authLoading)
        {
            return;
        }

        if (!user || !user.is_superuser)
        {
            window.location.href = '/';
            return;
        }

        const fetchUsers = async () => 
        {
            try
            {
                const response = await fetch('/api/v1/user/debug-users/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (response.ok)
                {
                    const data = await response.json();
                    setUsers(data);
                }
                else
                {
                    setError('Failed to fetch users');
                }
            }
            catch (err)
            {
                setError('An error occurred while fetching users');
                console.error(err);
            }
            finally
            {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [authLoading, user]);

    const handleLogout = () => 
    {
        logout();
    };

    if (loading)
    {
        return <MessageContainer>Loading users...</MessageContainer>;
    }

    if (error)
    {
        return <MessageContainer $isError>{error}</MessageContainer>;
    }

    return (
        <PageWrapper>
            <ContentContainer>
                <Header>
                    <Title>Debug Users</Title>
                    <LogoutButton onClick={handleLogout}>
                        Logout
                    </LogoutButton>
                </Header>
                
                <main style={{ flex: 1 }}>
                    <TableWrapper>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>ID</Th>
                                    <Th>Username</Th>
                                    <Th>Display Name</Th>
                                    <Th>Email</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((userData) => (
                                    <TableRow key={userData.id}>
                                        <Td>{userData.id}</Td>
                                        <Td><strong>{userData.username}</strong></Td>
                                        <Td>{userData.display_name || '-'}</Td>
                                        <Td>{userData.email || 'N/A'}</Td>
                                    </TableRow>
                                ))}
                            </tbody>
                        </Table>
                    </TableWrapper>
                </main>
            </ContentContainer>
            
            <Footer />
        </PageWrapper>
    );
};

export default DebugUsersPage;