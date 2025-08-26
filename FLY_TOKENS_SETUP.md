# Fly.io Token Setup Strategy

## Recommended Approach: Separate Tokens

### 1. Create Two Tokens in Fly.io Dashboard

**Token 1: Staging Deployment Token**
- Name: `golf-x-staging-deploy`
- Associated App: `golf-x-staging`
- Use for: GitHub Actions staging workflow

**Token 2: Production Deployment Token**
- Name: `golf-x-production-deploy`
- Associated App: `golf-x`
- Use for: GitHub Actions production workflow

## Benefits of Separate Tokens

1. **Security Isolation**: If one token is compromised, the other environment remains secure
2. **Audit Trail**: Easier to track which deployments used which token
3. **Permission Management**: Can revoke staging access without affecting production
neverm4. **Environment-specific**: Each token is tied to its specific app

## How to Create Tokens

1. Go to https://fly.io/dashboard
2. Navigate to Account → Access Tokens
3. Click "Create token"
4. Name it appropriately (e.g., `golf-x-staging-deploy`)
5. Select the specific app if possible
6. Copy the token immediately (it won't be shown again)

## GitHub Secrets Configuration

After creating both tokens, add them to GitHub:

### For Staging (uses staging.yml workflow)
- Secret Name: `FLY_API_TOKEN_STAGING`
- Value: [Your staging token]

### For Production (uses deploy.yml workflow)
- Secret Name: `FLY_API_TOKEN`
- Value: [Your production token]

## Update Workflow Files

We'll need to update the staging.yml to use the staging-specific token:

```yaml
env:
  FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN_STAGING }}
```

This way each environment uses its own dedicated token.