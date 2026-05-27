// AzureAIWeather IaC.
//
// IMPORTANT: The budget below is an ALERT mechanism. It does NOT auto-disable
// the Function App on threshold breach. True auto-disable requires either:
//   (a) a Logic App subscribed to the budget webhook that calls
//       `az functionapp stop` on the Function App, or
//   (b) scoping the Function App to a separate subscription with a hard cap.
// See functions/azureaiweather/DEPLOY.md "Optional: real auto-disable" section.

@description('Resource name prefix (3-12 chars, lowercase letters and digits)')
@minLength(3)
@maxLength(12)
param namePrefix string = 'aiwx'

@description('Azure region')
param location string = 'eastus2'

@description('Email to receive budget alerts')
param budgetContactEmail string

@description('Monthly budget USD; notifies at 80% and 100%')
param monthlyBudgetUsd int = 10

var storageName = toLower('${namePrefix}st${uniqueString(resourceGroup().id)}')
var planName = '${namePrefix}-plan'
var funcName = '${namePrefix}-func'
var appiName = '${namePrefix}-appi'
var lawName = '${namePrefix}-law'
var actionGroupName = '${namePrefix}-ag'
var budgetName = '${namePrefix}-budget'

resource law 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: lawName
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

resource appi 'Microsoft.Insights/components@2020-02-02' = {
  name: appiName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: law.id
  }
}

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
  }
}

resource tableService 'Microsoft.Storage/storageAccounts/tableServices@2023-05-01' = {
  parent: storage
  name: 'default'
}
resource subTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-05-01' = {
  parent: tableService
  name: 'subscribers'
}
resource snapTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-05-01' = {
  parent: tableService
  name: 'snapshots'
}

resource plan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: planName
  location: location
  sku: { name: 'Y1', tier: 'Dynamic' }
  properties: { reserved: true }
  kind: 'functionapp,linux'
}

resource funcApp 'Microsoft.Web/sites@2024-04-01' = {
  name: funcName
  location: location
  kind: 'functionapp,linux'
  identity: { type: 'SystemAssigned' }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20'
      appSettings: [
        { name: 'AzureWebJobsStorage', value: 'DefaultEndpointsProtocol=https;AccountName=${storage.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${listKeys(storage.id, '2023-05-01').keys[0].value}' }
        { name: 'TABLES_CONNECTION', value: 'DefaultEndpointsProtocol=https;AccountName=${storage.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${listKeys(storage.id, '2023-05-01').keys[0].value}' }
        { name: 'FUNCTIONS_EXTENSION_VERSION', value: '~4' }
        { name: 'FUNCTIONS_WORKER_RUNTIME', value: 'node' }
        { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '~20' }
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appi.properties.ConnectionString }
        { name: 'VAPID_SUBJECT', value: 'mailto:${budgetContactEmail}' }
        { name: 'SUBSCRIBE_RATE_LIMIT_PER_IP_PER_HOUR', value: '5' }
      ]
    }
  }
}

resource ag 'microsoft.insights/actionGroups@2024-10-01-preview' = {
  name: actionGroupName
  location: 'Global'
  properties: {
    groupShortName: 'aiwxbudget'
    enabled: true
    emailReceivers: [
      {
        name: 'budget-owner'
        emailAddress: budgetContactEmail
        useCommonAlertSchema: true
      }
    ]
  }
}

resource budget 'Microsoft.Consumption/budgets@2023-05-01' = {
  name: budgetName
  properties: {
    timePeriod: {
      startDate: '2026-05-01'
    }
    timeGrain: 'Monthly'
    amount: monthlyBudgetUsd
    category: 'Cost'
    notifications: {
      atEightyPercent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        contactEmails: [ budgetContactEmail ]
        contactGroups: [ ag.id ]
        thresholdType: 'Actual'
      }
      atOneHundredPercent: {
        enabled: true
        operator: 'GreaterThanOrEqualTo'
        threshold: 100
        contactEmails: [ budgetContactEmail ]
        contactGroups: [ ag.id ]
        thresholdType: 'Actual'
      }
    }
  }
}

output functionAppUrl string = 'https://${funcApp.properties.defaultHostName}'
output subscribeEndpoint string = 'https://${funcApp.properties.defaultHostName}/api/subscribe'
output feedRssEndpoint string = 'https://${funcApp.properties.defaultHostName}/api/feed.rss'
output storageAccountName string = storage.name
output appInsightsName string = appi.name
output budgetAlertEmail string = budgetContactEmail
