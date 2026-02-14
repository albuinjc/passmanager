
export const MOCK_USER = {
    id: "mock-user-id",
    email: "demo@securepass.corp",
    role: "authenticated",
}

export const MOCK_PROFILE = {
    id: "mock-user-id",
    email: "demo@securepass.corp",
    role: "Admin",
}

export const MOCK_USERS = [
    {
        id: "mock-user-id",
        name: "John Doe",
        email: "john.doe@company.com",
        role: "Admin",
        description: "System Administrator",
        active: true,
        created_at: "2023-01-01T12:00:00Z",
    },
    {
        id: "user-2",
        name: "Jane Smith",
        email: "jane.smith@company.com",
        role: "Editor",
        description: "Marketing Lead",
        active: true,
        created_at: "2023-02-15T09:30:00Z",
    },
    {
        id: "user-3",
        name: "Bob Jones",
        email: "bob.jones@company.com",
        role: "Viewer",
        description: "Intern",
        active: false,
        created_at: "2023-03-10T14:45:00Z",
    },
]

export const MOCK_CREDENTIALS = [
    {
        id: "cred-1",
        created_by: "mock-user-id",
        title: "Google Workspace",
        username: "john.doe@company.com",
        password: "secure-password-123",
        url: "https://workspace.google.com",
        description: "Corporate email and drive access",
        two_fa_seed: "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP", 
        created_at: new Date().toISOString(),
    },
    {
        id: "cred-2",
        created_by: "mock-user-id",
        title: "AWS Console (Dev)",
        username: "dev-admin",
        password: "aws-complex-password-!@#",
        url: "https://aws.amazon.com/console",
        description: "Development environment access",
        two_fa_seed: "NEHGEZDGNBVWS3TDOQNEG5LOM4XGS322", 
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: "cred-3",
        created_by: "mock-user-id",
        title: "Slack Admin",
        username: "admin@slack.com",
        password: "slack-password-456",
        url: "https://slack.com",
        description: "Team communication platform",
        two_fa_seed: "AAABBBCCCDDDEEEFFFGGGHHHIIIJJJKK", 
        created_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
        id: "cred-4",
        created_by: "mock-user-id",
        title: "GitHub Organization",
        username: "git-master",
        password: "github-pat-token",
        url: "https://github.com",
        description: "Source code repositories",
        two_fa_seed: "MZXW6YTDOIMZXW6YTDOIMZXW6YTDOI22", 
        created_at: new Date(Date.now() - 259200000).toISOString(),
    }
]

export const MOCK_SHARED_CREDENTIALS = [
    {
        id: "cred-shared-1",
        created_by: "other-user-id",
        title: "Marketing HubSpot",
        username: "marketing-team",
        password: "hubspot-shared-password",
        url: "https://hubspot.com",
        description: "Shared marketing access",
        two_fa_seed: "MZXW6YTDOIMZXW6YTDOIMZXW6YTDOI22",
        created_at: new Date(Date.now() - 5000000).toISOString(),
    }
]
