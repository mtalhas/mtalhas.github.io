# Deploy AzureAIWeather

This document covers the manual one-time steps the operator must run to provision the AzureAIWeather Function App in their own Azure tenant. No resources were provisioned during the build session; everything below is your responsibility.

## Prerequisites

- Azure subscription with permission to create resource groups, function apps, and budgets
- `az` CLI 2.60+
- `gh` CLI authenticated to `github.com/mtalhas`
- An Entra ID user or service principal you control

## One-time setup

```bash
# 1. Pick a region and create the resource group
az group create --name aiwx-rg --location eastus2

# 2. Create the Entra ID app + federated credential for GitHub OIDC
APP_ID=$(az ad app create --display-name "github-aiwx-deploy" --query appId -o tsv)
SP_OBJ=$(az ad sp create --id $APP_ID --query id -o tsv)
SUB_ID=$(az account show --query id -o tsv)

# Grant Contributor on the resource group
az role assignment create --role Contributor --scope "/subscriptions/$SUB_ID/resourceGroups/aiwx-rg" --assignee-object-id $SP_OBJ --assignee-principal-type ServicePrincipal

# Federated credential bound to this repo + main branch
az ad app federated-credential create --id $APP_ID --parameters '{
  "name":"mtalhas-main",
  "issuer":"https://token.actions.githubusercontent.com",
  "subject":"repo:mtalhas/mtalhas.github.io:ref:refs/heads/main",
  "audiences":["api://AzureADTokenExchange"]
}'

# 3. Push the GitHub secrets the workflow needs
TENANT_ID=$(az account show --query tenantId -o tsv)
gh secret set AZURE_CLIENT_ID --body "$APP_ID"
gh secret set AZURE_TENANT_ID --body "$TENANT_ID"
gh secret set AZURE_SUBSCRIPTION_ID --body "$SUB_ID"
gh secret set AZURE_RESOURCE_GROUP --body "aiwx-rg"
gh secret set AZUREAIWEATHER_BUDGET_EMAIL --body "you@example.com"
gh secret set AZUREAIWEATHER_FUNC_NAME --body "aiwx-func"

# 4. First Bicep deploy (workflow will then re-deploy from CI on every push)
az deployment group create \
  --resource-group aiwx-rg \
  --template-file infra/azureaiweather.bicep \
  --parameters budgetContactEmail=you@example.com
```

## Optional: real auto-disable

The `Microsoft.Consumption/budgets` resource in the Bicep template sends ALERT emails to the action group at 80% and 100% of the monthly budget. It does NOT stop the Function App on threshold breach. For true auto-disable, deploy a small Logic App that:

1. Subscribes to the budget webhook (`microsoft.consumption/budgets` event grid)
2. Calls `https://management.azure.com/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Web/sites/{func}/stop?api-version=2024-04-01` with a managed identity that has Website Contributor

A reference Logic App template is intentionally NOT included in this session because it expands scope; document this as a follow-up. If unsure, just leave the budget alerts on and review your monthly cost manually.

## VAPID keys for Web Push

```bash
# Run once on any machine with web-push installed
npx web-push generate-vapid-keys

# Set as Function App settings (or have the workflow set them):
az functionapp config appsettings set \
  --name aiwx-func --resource-group aiwx-rg \
  --settings VAPID_PUBLIC_KEY="..." VAPID_PRIVATE_KEY="..." VAPID_SUBJECT="mailto:you@example.com"
```

## Smoke test

```bash
curl https://<funcname>.azurewebsites.net/api/feed.rss | head -20
# Expect RSS XML

curl -X POST https://<funcname>.azurewebsites.net/api/subscribe \
  -H 'content-type: application/json' \
  -d '{"channel":"slack","endpoint":"https://hooks.slack.com/services/TFAKE00000000FAKE/BFAKE00000000FAKE/FAKEEXAMPLEFAKEEXAMPLE0123"}'
# Expect {"ok": true}
```

## Source confidence notes

- `azure-updates-rss`, `azure-status-rss`: **high** confidence (real RSS feeds).
- `azure-openai-region-availability`: **medium** confidence (HTML table scrape; structure may change).
- `foundry-model-cards`: **low** confidence by default. `ai.azure.com/explore/models` is a client-rendered SPA; cheerio sees the shell only. To upgrade to high confidence, swap to the documented `/models` REST endpoint with managed identity bearer token. See `src/lib/sources.ts` comment block.
- `arm-model-capacities`: **medium** confidence. Requires the Function App's managed identity to have the `Cognitive Services Usages Reader` role on the subscription. Without it the source returns an empty array (graceful).

## RBAC the Function needs

After provisioning, run these once:

```bash
FUNC_PRINCIPAL=$(az functionapp identity show --name aiwx-func --resource-group aiwx-rg --query principalId -o tsv)
az role assignment create --role "Cognitive Services Usages Reader" --assignee-object-id $FUNC_PRINCIPAL --scope "/subscriptions/$SUB_ID"
# Optional: for full Foundry model card data, also grant the relevant reader role
```

## Operational notes

- Anonymous `POST /subscribe` is rate-limited to 5 calls per IP per hour by default. Tune via the `SUBSCRIBE_RATE_LIMIT_PER_IP_PER_HOUR` app setting.
- An IP-rate-limit is the v1 mitigation against subscription-spam abuse (see PLAN-B Devils Advocate FM-3). A follow-up task adds a confirmation-token round trip before activating Slack subscriptions.
- No resources were provisioned during the build session; you must run the commands above before the deploy workflow can succeed.
