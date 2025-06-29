'use client'

import styled from 'styled-components';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { theme } from '@/styles/theme';
import { LogOut, User, LogIn } from 'lucide-react';
import SignInModal from './SignInModal';
import SignUpModal from './SignUpModal';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  padding: 0.75rem 2rem;
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.light};
  font-size: ${theme.typography.fontSize.lg};
  transition: all ${theme.transitions.zen};
  
  &:hover {
    opacity: 0.7;
  }
`;

const LogoIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${theme.colors.primary[400]};
  opacity: 0.8;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  
  @media (max-width: 768px) {
    gap: 0.375rem;
    font-size: ${theme.typography.fontSize.xs};
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${theme.colors.primary[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary[600]};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: ${theme.typography.fontSize.xs};
  }
`;

const UserName = styled.span`
  font-weight: ${theme.typography.fontWeight.normal};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.xs};
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const SignOutButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.muted};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${theme.borderRadius.base};
  transition: all ${theme.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    color: ${theme.colors.text.primary};
    background: ${theme.colors.gray[50]};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SignInButton = styled.button`
  background: none;
  border: 1px solid ${theme.colors.gray[200]};
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: ${theme.borderRadius.base};
  transition: all ${theme.transitions.normal};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.normal};
  white-space: nowrap;
  
  &:hover {
    color: ${theme.colors.text.primary};
    border-color: ${theme.colors.gray[300]};
    background: ${theme.colors.gray[50]};
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: ${theme.typography.fontSize.sm};
    min-width: 80px;
    justify-content: center;
    gap: 0;
    
    svg {
      display: none;
    }
  }
`;

export function Header() {
  const { data: session } = useSession();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback: force reload to clear session
      window.location.href = '/';
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSignIn = () => {
    setIsSignInModalOpen(true);
  };

  const handleCloseSignInModal = () => {
    setIsSignInModalOpen(false);
  };

  const handleSignUp = () => {
    setIsSignUpModalOpen(true);
  };

  const handleCloseSignUpModal = () => {
    setIsSignUpModalOpen(false);
  };

  const handleSwitchToSignUp = () => {
    setIsSignInModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  const handleSwitchToSignIn = () => {
    setIsSignUpModalOpen(false);
    setIsSignInModalOpen(true);
  };

  const getUserInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      return name;
    }
    if (email) {
      return email.split('@')[0];
    }
    return 'User';
  };

  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <Logo href="/">
            <LogoIcon />
            routinely
          </Logo>
          
          {session?.user ? (
            <UserSection>
              <UserInfo>
                <UserAvatar>
                  {getUserInitials(session.user.name, session.user.email)}
                </UserAvatar>
                <UserName>
                  {getDisplayName(session.user.name, session.user.email)}
                </UserName>
              </UserInfo>
              <SignOutButton
                onClick={handleSignOut}
                aria-label="Sign out"
                title="Sign out"
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <div style={{ 
                    width: '18px', 
                    height: '18px', 
                    border: `2px solid ${theme.colors.gray[300]}`,
                    borderTop: `2px solid ${theme.colors.text.muted}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <LogOut size={18} />
                )}
              </SignOutButton>
            </UserSection>
          ) : (
            <SignInButton
              onClick={handleSignIn}
              aria-label="Sign in"
              title="Sign in"
            >
              <LogIn size={16} />
              <span>Sign in</span>
            </SignInButton>
          )}
        </HeaderContent>
      </HeaderContainer>
      
      <SignInModal 
        isOpen={isSignInModalOpen}
        onClose={handleCloseSignInModal}
        onSwitchToSignUp={handleSwitchToSignUp}
      />
      
      <SignUpModal 
        isOpen={isSignUpModalOpen}
        onClose={handleCloseSignUpModal}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
    </>
  );
} 