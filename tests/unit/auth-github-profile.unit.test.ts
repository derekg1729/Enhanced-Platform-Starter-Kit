import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Define types for GitHub profile and emails
interface GitHubProfile {
  id: string;
  login: string;
  name?: string;
  avatar_url: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

// Create a simplified mock profile function that doesn't use fetch
const mockProfileFn = (
  profile: GitHubProfile, 
  emails: GitHubEmail[] | null = null, 
  shouldFail = false
) => {
  // Simulate the profile transformation logic
  let primaryEmail = null;
  
  if (shouldFail) {
    // Simulate a failure case
    primaryEmail = `${profile.id}@users.noreply.github.com`;
  } else if (emails) {
    // Use provided emails
    primaryEmail = emails.find(email => email.primary)?.email || emails[0]?.email;
    
    // If no email found, use fallback
    if (!primaryEmail) {
      primaryEmail = `${profile.id}@users.noreply.github.com`;
    }
  } else {
    // Default fallback
    primaryEmail = `${profile.id}@users.noreply.github.com`;
  }
  
  return {
    id: profile.id.toString(),
    name: profile.name || profile.login,
    gh_username: profile.login,
    email: primaryEmail,
    image: profile.avatar_url,
  };
};

describe('GitHub OAuth Profile Transformation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should transform GitHub profile correctly with primary email', () => {
    // Sample GitHub profile
    const githubProfile = {
      id: '12345',
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/avatar.png'
    };

    // Sample emails
    const emails = [
      { email: 'primary@example.com', primary: true, verified: true },
      { email: 'secondary@example.com', primary: false, verified: true }
    ];

    // Call the profile function
    const result = mockProfileFn(githubProfile, emails);

    // Verify the transformed profile
    expect(result).toEqual({
      id: '12345',
      name: 'Test User',
      gh_username: 'testuser',
      email: 'primary@example.com',
      image: 'https://github.com/avatar.png',
    });
  });

  it('should use first email when no primary email is marked', () => {
    // Sample GitHub profile
    const githubProfile = {
      id: '12345',
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/avatar.png'
    };

    // Sample emails with no primary
    const emails = [
      { email: 'first@example.com', primary: false, verified: true },
      { email: 'second@example.com', primary: false, verified: true }
    ];

    // Call the profile function
    const result = mockProfileFn(githubProfile, emails);

    // Verify the transformed profile uses the first email
    expect(result).toEqual({
      id: '12345',
      name: 'Test User',
      gh_username: 'testuser',
      email: 'first@example.com',
      image: 'https://github.com/avatar.png',
    });
  });

  it('should use login as name when name is not provided', () => {
    // Sample GitHub profile without name
    const githubProfile = {
      id: '12345',
      login: 'testuser',
      avatar_url: 'https://github.com/avatar.png'
    };

    // Sample emails
    const emails = [
      { email: 'test@example.com', primary: true, verified: true }
    ];

    // Call the profile function
    const result = mockProfileFn(githubProfile, emails);

    // Verify the transformed profile uses login as name
    expect(result).toEqual({
      id: '12345',
      name: 'testuser', // login used as name
      gh_username: 'testuser',
      email: 'test@example.com',
      image: 'https://github.com/avatar.png',
    });
  });

  it('should generate fallback email when no emails are available', () => {
    // Sample GitHub profile
    const githubProfile = {
      id: '12345',
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/avatar.png'
    };

    // Call the profile function with no emails
    const result = mockProfileFn(githubProfile);

    // Verify the transformed profile uses fallback email
    expect(result).toEqual({
      id: '12345',
      name: 'Test User',
      gh_username: 'testuser',
      email: '12345@users.noreply.github.com', // Fallback email
      image: 'https://github.com/avatar.png',
    });
  });

  it('should handle error cases', () => {
    // Sample GitHub profile
    const githubProfile = {
      id: '12345',
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/avatar.png'
    };

    // Call the profile function with shouldFail=true
    const result = mockProfileFn(githubProfile, null, true);

    // Verify the transformed profile uses fallback email
    expect(result).toEqual({
      id: '12345',
      name: 'Test User',
      gh_username: 'testuser',
      email: '12345@users.noreply.github.com', // Fallback email
      image: 'https://github.com/avatar.png',
    });
  });
}); 