# DigiFi Node.js Library

[![Version](https://img.shields.io/npm/v/@digifi/digifi-node-js.svg)](https://www.npmjs.org/package/@digifi/digifi-node-js)
[![Build Status](https://github.com/digifi-io/digifi-node-js/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/digifi-io/digifi-node-js/actions/workflows/npm-publish.yml)
[![Downloads](https://img.shields.io/npm/dm/@digifi/digifi-node-js.svg)](https://www.npmjs.com/package/@digifi/digifi-node-js)

The DigiFi Node library provides convenient access to the DigiFi API from
applications written in server-side JavaScript.

## Documentation

See the [API docs](https://docs.digifi.io/reference/digifi-api).

## Requirements

Node 12 or higher.

## Installation

Install the package with:

```sh
npm install @digifi/digifi-node-js --save
# or
yarn add @digifi/digifi-node-js
```

## Usage

This package provides `API Clients` and `API Services` to help you communicate with DigiFi platform.

First, you need to create `API Client` that requires url to DigiFi platform (this url can be different if you're using dedicated platform solution) and [api-key](https://docs.digifi.io/reference/digifi-api#api-authentication).

After `API Client` was initialized - you can create `API Service` and start communication with to DigiFi platform API.

<!-- prettier-ignore -->
```js
const Digifi = require('@digifi/digifi-node-js');

const apiClient = new Digifi.AuthorizedApiClient('https://cloud.digifi.io/api', 'digifi-...');

const applicationsApi = new Digifi.ApplicationsApi(apiClient);

const { items, total } = await applicationsApi.find({ productId: '63d...' });

console.log(items);
```

### Usage with TypeScript

DigiFi maintains types for the latest API Version.

```ts
import { AuthorizedApiClient, CreateApplicationParams, Application } from '@digifi/digifi-node-js';

const apiClient = new AuthorizedApiClient('https://cloud.digifi.io/api', 'digifi-...');
const applicationsApi = new ApplicationsApi(apiClient);

const createApplication = async () => {
  const params: CreateApplicationParams = {
    productId: '63d288ae64f7677836046de7',
    ...,
  };

  const application: Application = await applicationsApi.create(params);

  console.log(application.id);
};

createApplication();
```

## Configuration

To initialize `API Service` you need to create API client before.
Here is an example how to achieve that:

```new AuthorizedApiClient(baseUrl: string, apiKey: string, options?: object)``` - default API client with authorization. Requires ```baseUrl``` of DigiFi Platform API endpoint as first argument and [api-key](https://docs.digifi.io/reference/digifi-api#api-authentication) as second argument. Can be initialized with optional [`options`] as third argument.

```js
import { AuthorizedApiClient } from '@digifi/digifi-node-js';

const baseUrl = 'https://cloud.digifi.io/api';
const apiKey = 'digifi-cloud-...';

const authorizedApiClient = new AuthorizedApiClient(baseUrl, apiKey);
```


### Options
API client can be created with optional `options` parameter that has this structure:

| Option                           | Default             | Description                                                                                                                                                                                                                                       |
| -------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enableIdempotencyHeader`        | `false`             | If `true` is provided it allows `POST` requests to be [idempotent](https://docs.digifi.io/reference/digifi-api#idempotent-requests)                                                                                                               |
| `maxNetworkRetries`              | 0                   | The amount of times a request should be retried if error occured                                                                                                                                                                                  |
| `logger`                         | `null`              | Logger for tracing errors and requests                                                                                                                                                                                                            |
| `apiVersion`                         | `12/20/2023`              | [Api version](https://docs.digifi.io/reference/api-versions-changelog) to use for client.                                                                                                                                                                                                          |


### Idempotency

[Idempotency Header](https://docs.digifi.io/reference/digifi-api#idempotent-requests) can be enabled with the `enableIdempotencyHeader` to prevent duplication in cause of retry. Librabry will automatically assign idempotency header key (generated by `UUID v4`) to each `POST` request.

```js
const apiClient = new AuthorizedApiClient('https://cloud.digifi.io/api', 'digifi-cloud-...', {
  enableIdempotencyHeader: true, // Will assign idempotency key to each POST request using UUID
});
```

### Network retries

Automatic network retries can be enabled with the `maxNetworkRetries` config option.
This will retry requests `n` times with exponential backoff if they fail due to an intermittent network problem.

```js
const apiClient = new AuthorizedApiClient('https://cloud.digifi.io/api', 'digifi-cloud-...', {
  maxNetworkRetries: 2, // Retry a request twice before giving up
});
```

## API Services
`Api Service` - class that provides you an interface which will simplify communicating with DigiFi Platform API without need to use `AuthorizedApiClient` directly. Each `Api Service` represent entity/domain in DigiFi system.

For example, if you need to create a borrower in DigiFi Platform you can use `BorrowersApi`:

```js
const apiClient = new AuthorizedApiClient(...);
const borrowersApi = new BorrowersApi(apiClient);

const borrowers = await borrowersApi.create({ ... });

console.log(borrower.id);
```

> **Note**
> You can communicate with DigiFi Platform API directly by `AuthorizedApiClient`, since it provides method `makeCall`, but it's recommended to use `API Services` to make sure that you're using correct request structure.

Here the list of `API Services` that DigiFi Node JS Library provides:

- `new AccountsApi(apiClient: ApiClient, reference: 'borrowers' | 'intermediaries')` - api service for borrower/intermediary (depends on `reference` argument) accounts.
  - `findAccountByEmail(email: string)` - returns [borrower](https://docs.digifi.io/reference/find-borrower-user-account)/[intermediary](https://docs.digifi.io/reference/find-borrower-user-account-email) (depends on `reference` passed to the service) account.
  - `createAccount(accountParams: object, refreshTokenExpirationTimeMinutes?: number)` - creates and returns [borrower](https://docs.digifi.io/reference/create-borrower-account)/[intermediary](https://docs.digifi.io/reference/create-intermediary-account) (depends on `reference` passed to the service) account.
  - `getCurrentUser(accountAccessToken: string)` - returns current [borrower](https://docs.digifi.io/reference/find-borrower-user-account-token)/[intermediary](https://docs.digifi.io/reference/find-borrower-user-account-token-1) (depends on `reference` passed to the service) account by `accountAccessToken`.
  - `sendUpdatePhoneNumberCode(phone: string, accountAccessToken: string, accountPasswordValidationToken: string)` - send code that confirms phone update for [borrower](https://docs.digifi.io/reference/send-code-to-update-phone-number)/[intermediary](https://docs.digifi.io/reference/send-update-phone-number-sms-code) (depends on `reference` passed to the service) account.
  - `updatePhoneNumber(code: string, accountAccessToken: string)` - confirms phone update for [borrower](https://docs.digifi.io/reference/verify-code-update-phone-number)/[intermediary](https://docs.digifi.io/reference/update-phone-number-by-verifying-code) (depends on `reference` passed to the service) by `code` and `accountAccessToken`.
  - `sendAddPhoneNumberCode(phone: string, accountAccessToken: string, accountPasswordValidationToken: string)` - send code that confirms phone adding for [borrower](https://docs.digifi.io/reference/send-code-to-add-phone-number)/[intermediary](https://docs.digifi.io/reference/send-code-to-add-phone-number-intermediary) (depends on `reference` passed to the service) account.
  - `addPhoneNumber(code: string, accountAccessToken: string)` - confirms add phone to [borrower](https://docs.digifi.io/reference/verify-code-add-phone-number)/[intermediary](https://docs.digifi.io/reference/verify-code-add-phone-number-intermediary) (depends on `reference` passed to the service) by `code` and `accountAccessToken`.
  - `deletePhoneNumber(phone: string, accountAccessToken: string, accountPasswordValidationToken: string)` - deletes phone for [borrower](https://docs.digifi.io/reference/delete-phone-number)/[intermediary](https://docs.digifi.io/reference/delete-phone-number-1) (depends on `reference` passed to the service) by `accountAccessToken` and `accountPasswordValidationToken`.
  - `sendUpdateEmailCode(email: string, accountAccessToken: string, accountPasswordValidationToken: string)` - sends update email code for [borrower](https://docs.digifi.io/reference/send-update-email-verification-code)/[intermediary](https://docs.digifi.io/reference/send-update-email-verification-code-1) (depends on `reference` passed to the service) to account by `accountAccessToken` and `accountPasswordValidationToken`.
  - `updateEmailAddress(code: string, accountAccessToken: string)` - confirms email update for [borrower](https://docs.digifi.io/reference/update-email-address-by-verifying-code)/[intermediary](https://docs.digifi.io/reference/update-email-address-by-verifying-code-1) (depends on `reference` passed to the service) for account by `accountAccessToken`.
  - `createPasswordValidationToken(password: string, accountAccessToken: string)` - creates password validation token for [borrower](https://docs.digifi.io/reference/create-password-validation-token)/[intermediary](https://docs.digifi.io/reference/create-password-validation-token-1) (depends on `reference` passed to the service) account by `password` and `accountAccessToken`.
  - `updatePassword(oldPassword: string, newPassword: string, accountAccessToken: string)` - updates password for [borrower](https://docs.digifi.io/reference/update-password)/[intermediary](https://docs.digifi.io/reference/update-password-1) (depends on `reference` passed to the service) account.
  - `find(params: object)` - finds [borrower](https://docs.digifi.io/reference/search-borrower-accounts)/[intermediary](https://docs.digifi.io/reference/search-intermediary-accounts) (depends on `reference` passed to the service) accounts by `params` object.
- `new EmailVerificationApi(apiClient: ApiClient, reference: 'borrowers' | 'intermediaries')` - api service for borrower/intermediary (depends on `reference` argument) accounts email verification.
  - `sendVerificationEmail(accountAccessToken: string)` - sends verification email for [borrower](https://docs.digifi.io/reference/send-email-verification-code)/[intermediary](https://docs.digifi.io/reference/send-email-verification-code-1) (depends on `reference` passed to the service) account by `accountAccessToken`.
  - `verifyEmail(code: string, accountAccessToken: string)` - verifies email for [borrower](https://docs.digifi.io/reference/verify-email-verification-code)/[intermediary](https://docs.digifi.io/reference/verify-email-verification-code-1) (depends on `reference` passed to the service) account using `code` by `accountAccessToken`.
- `new InvitesApi(apiClient: ApiClient, reference: 'borrowers' | 'intermediaries')` - api service for borrower/intermediary (depends on `reference` argument) invitation management.
  - `acceptInvite(password: string, phone: string, token: string, refreshTokenExpirationTimeMinutes?: number)` - accepts invite for [borrower](https://docs.digifi.io/reference/create-account-accept-invitation)/[intermediary](https://docs.digifi.io/reference/create-account-accept-invitation-1) (depends on `reference` passed to the service) account.
  - `getInviteInfo(token: string)` - retrieves invitation information for [borrower](https://docs.digifi.io/reference/get-user-info-from-invitation-token)/[intermediary](https://docs.digifi.io/reference/get-user-info-from-invitation-token-1) (depends on `reference` passed to the service) account by `token`.
- `new PhoneVerificationApi(apiClient: ApiClient, reference: 'borrowers' | 'intermediaries')` - api service for borrower/intermediary (depends on `reference` argument) phone verification management.
  - `sendMfaCode(phone: string, accountAccessToken: string)` - sends mfa code for [borrower](https://docs.digifi.io/reference/borrower-send-2fa-phone-code)/[intermediary](https://docs.digifi.io/reference/send-2fa-sms-phone-code) (depends on `reference` passed to the service) account phone by `accountAccessToken`.
  - `verifyMfaCode(code: string, accountAccessToken: string)` - verifies mfa code for [borrower](https://docs.digifi.io/reference/borrower-verify-2fa-phone-code)/[intermediary](https://docs.digifi.io/reference/verify-2fa-sms-phone-code) (depends on `reference` passed to the service) account by `accountAccessToken`.
- `new ResetPasswordApi(apiClient: ApiClient, reference: 'borrowers' | 'intermediaries')` - api service for borrower/intermediary (depends on `reference` argument) account reset password management.
  - `sendResetPasswordLink(email: string)` - sends reset password link to [borrower](https://docs.digifi.io/reference/send-reset-password-emaillink)/[intermediary](https://docs.digifi.io/reference/send-reset-password-link) (depends on `reference` passed to the service) account email.
  - `resetPassword(password: string, resetPasswordToken: string)` - resets password for [borrower](https://docs.digifi.io/reference/reset-password)/[intermediary](https://docs.digifi.io/reference/reset-password-1) (depends on `reference` passed to the service) account by `resetPasswordToken`.
  - `getResetPasswordTokenInfo(resetPasswordToken: string)` - retrieves reset password token info for [borrower](https://docs.digifi.io/reference/get-user-info-from-reset-password-token)/[intermediary](https://docs.digifi.io/reference/get-user-info-from-reset-password-token-1) (depends on `reference` passed to the service) account by `resetPasswordToken`.
- `new SessionsApi(apiClient: ApiClient, reference: 'borrowers' | 'intermediaries')` - api service for borrower/intermediary (depends on `reference` argument) account session management.
  - `createSession(email: string, password: string, refreshTokenExpirationTimeMinutes?: number)` - creates session for [borrower](https://docs.digifi.io/reference/sign-in-borrower-create-session)/[intermediary](https://docs.digifi.io/reference/sign-in-intermediary-create-session) (depends on `reference` passed to the service) account.
  - `createSessionWithPhoneVerificationCode(phoneVerificationCode: string, refreshTokenExpirationTimeMinutes?: number)` - creates session for [borrower](https://docs.digifi.io/reference/sign-in-borrower-create-session)/[intermediary](https://docs.digifi.io/reference/sign-in-intermediary-create-session) (depends on `reference` passed to the service) account by `phoneVerificationCode`.
  - `sendPhoneVerificationCode(phone: string)` - sends phone verification code for [borrower](https://docs.digifi.io/reference/sign-in-borrower-send-phone-verification-code)/[intermediary](https://docs.digifi.io/reference/sign-in-send-phone-verification-code) (depends on `reference` passed to the service) account by `phone`.
  - `validateToken(accountAccessToken: string)` - validates access token for [borrower](https://docs.digifi.io/reference/verify-session-is-active)/[intermediary](https://docs.digifi.io/reference/verify-session-is-active-1) (depends on `reference` passed to the service) account.
  - `logout(accountAccessToken: string)` - kills session associated with [borrower](https://docs.digifi.io/reference/logout-borrower-end-session)/[intermediary](https://docs.digifi.io/reference/logout-borrower) (depends on `reference` passed to the service) account by `accountAccessToken`.
  - `resignAccessToken(accountRefreshToken: string)` - resign access token for [borrower](https://docs.digifi.io/reference/sign-in-borrower-create-session)/[intermediary](https://docs.digifi.io/reference/sign-in-intermediary-create-session) (depends on `reference` passed to the service) account by `accountRefreshToken`.
- `new UsersApi(apiClient: ApiClient)` - api service for users management.
  - `find(params: object)` - [finds organization users](https://docs.digifi.io/reference/search-team-members) by `params` object.
- `new VariablesApi(apiClient: ApiClient)` - api service for variables management.
  - `find(params: object)` - [finds organization variables](https://docs.digifi.io/reference/get-variable-by-system-name) by `params` object. 
- `new DecisionsApi(apiClient: ApiClient)` - api service for decisions management.
  - `find(params; object)` - [finds organization decisions](https://docs.digifi.io/reference/search-decision-results) by `params` object.
  - `findById(id: string)` - [finds organization decision](https://docs.digifi.io/reference/get-decision-results) by `id`.
  - `delete(id: string)` - [deletes organization decision](https://docs.digifi.io/reference/delete-decision-results) by `id`.
- `new BorrowerStandardPortalGeneralSettingsApi(apiClient: ApiClient)` - api service for borrower standard portal settings management.
  - `getGeneralSettings()` - retrieves general settings of standard borrower portal for current organization.
- `new BorrowerStandardPortalLegalDocumentApi(apiClient)` - api service for borrower standard portal legal documents management.
  - `getLegalDocuments()` - retrieves borrower standard portal legal documents for current organization.
- `new BrandingApi(apiClient: ApiClient)` - api service for organization branding management.
  - `getBranding()` - [retrieves current organization branding](https://docs.digifi.io/reference/get-branding-data).
  - `getLogo()` - [retrieves current organization logo](https://docs.digifi.io/reference/get-branding-logo).
  - `getFavicon()` - [retrieves current organization favicon](https://docs.digifi.io/reference/get-branding-favicon).
- `new DecisionProcessingApi(apiClient: ApiClient)` - api service for processing decisions.
  - `runDecisions(params: object)` - [runs one/many decisions](https://docs.digifi.io/reference/create-decisions) for current organization by `params` object.
- `new IntegrationFileDownloadApi(apiClient: ApiClient)` - api service for integration files downloads management.
  - `downloadById(id: string)` - [downloads integration result file](https://docs.digifi.io/reference/download-of-integration-result-files) by `id`. 
- `new IntegrationProcessingApi(apiClient: ApiClient)` - api service for processing integrations.
  - `processIntegration(params: object)` - [processes integration](https://docs.digifi.io/reference/run-integration) for current organization by `params` object.
- `new IntegrationResultFilesApi(apiClient: ApiClient)` - api service for integration result files management.
  - `uploadMany(integrationResultId: string, files: object[])` - [uploads few files for integration result](https://docs.digifi.io/reference/upload-of-integration-files).
- `new IntegrationResultsApi(apiClient: ApiClient)` - api service for integration results management.
  - `find(params: object)` - [finds integration results](https://docs.digifi.io/reference/search-integration-results) for current organization by `params` object.
  - `findById(id: string)` - [finds integration result](https://docs.digifi.io/reference/get-integration-result) by `id`.
  - `delete(id: string)` - [deletes integration result](https://docs.digifi.io/reference/delete-integration-result) by `id`.
- `new ApplicationDecisionProcessingApi(apiClient: ApiClient)` - api service for processing application decisions.
  - `makeDecision(params: object)` - [processes application decision](https://docs.digifi.io/reference/run-application-decision) for current organization by `params` object.
- `new ApplicationDetailsCardsApi(apiClient: ApiClient)` - api service for applications details cards management.
  - `find(productId: string)` - [finds application details cards](/home/eugene/Pictures/Screenshot_20230127_140735.png) for current organization and mode (depends on `api-key` provided to api client) by `productId`.
- `new ApplicationDocumentConfigurationApi(apiClient: ApiClient)` -  api service for application document configuration management.
  - `find(productId: string)` - [finds application document configurations](https://docs.digifi.io/reference/get-application-documents-configuration) for current organization and mode (depends on `api-key` provided to api client) by `productId`.
- `new ApplicationDocumentsApi(apiClient: ApiClient)` - api service for application documents management.
  - `find(params: object)` - [finds application documents](https://docs.digifi.io/reference/search-application-documents) by `params` object.
  - `findById(id)` - [finds application document](https://docs.digifi.io/reference/get-application-document-by-id) by `id`.
  - `create(params: object)` - [uploads application document](https://docs.digifi.io/reference/upload-application-document) by `params` object.
  - `createMany(params: object)` - [uploads few application documents](https://docs.digifi.io/reference/batch-upload-of-application-documents) by `params` object.
  - `update(id: string, params: object)` - [updates application document](https://docs.digifi.io/reference/update-application-document) by `id` and `params` object.
  - `createFolder(params: object)` - [creates application document folder](https://docs.digifi.io/reference/create-application-document-folder) by `params`.
  - `delete(id: string)` - [deletes application document](https://docs.digifi.io/reference/delete-application-document) by `id`.
- `new ApplicationDocumentsDownloadsApi(apiClient: ApiClient)` - api service for application documents download.
  - `downloadById(id: string)` - [downloads application document](https://docs.digifi.io/reference/download-application-document) by id.
  - `downloadAll(applicationId: string, accessPermission?: ApplicationDocumentAccessPermission)` - [downloads all application documents](https://docs.digifi.io/reference/download-all-application-documents). 
- `new ApplicationDocumentsPreviewApi(apiClient: ApiClient)` - api service for document preview management.
  - `createToken(documentId: string)` - [creates preview token for document](https://docs.digifi.io/reference/application-documents-preview) by `documentId`. 
- `new ApplicationIntegrationProcessingApi(apiClient: ApiClient)` - api service for processing application integrations.
  - `processIntegration(params: object)` - [processes integration for application](https://docs.digifi.io/reference/run-application-integration) by `params` object.
- `new ApplicationsApi(apiClient: ApiClient)` - api service for applications management.
  - `find(params: object)` - [finds applications](https://docs.digifi.io/reference/search-applications) by `params` object.
  - `findById(id: string)` - [finds application](https://docs.digifi.io/reference/get-application-1) by `id`.
  - `create(params: object)` - [creates application](https://docs.digifi.io/reference/create-application-1) by `params` object.
  - `update(id: string, params: object)` - [updates application](https://docs.digifi.io/reference/update-application-1) by `id` and `params` object.
  - `delete(id: string)` - [deletes application](https://docs.digifi.io/reference/delete-application) by `id`.
  - `updateCoBorrowers(id: string, params: object)` - [updates application co-borrowers](https://docs.digifi.io/reference/update-application-co-borrower) by `id` and `params` object.
  - `updateIntermediary(id: string, params: object)` - [updates application intermediary](https://docs.digifi.io/reference/update-application-intermediary) by `id` and `params` object.
  - `getVariables(id: string, variablesToInclude?: string[])` - retrieves application variables by `id` (optional argument `variablesToInclude` includes only specified variables).
  - `runCalculations(id: string, params: object)` - [re-runs applications calculations](https://docs.digifi.io/reference/re-run-application-calculations) by `id` and optional `params` object (provide `variablesToRun` in `params` object to re-run only specified variables).
  - `addLabels(id: string, labelsIds: string[])` - adds labels to application by `id`.
  - `addTeamMembers(id: string, teamMembersIds: string[])` - adds team members to application by `id`.
- `new ApplicationStatusesApi(apiClient: ApiClient)` - api service for application statuses management.
  - `find(productId: string)` - [finds application statuses](https://docs.digifi.io/reference/get-application-statuses) for current organization and mode (depends on `api-key` provided to api client) by `productId`.
- `new BorrowerProfileCardsApi(apiClient: ApiClient)` - api service borrower profile cards management.
  - `find(borrowerType?: 'person' | 'company')` - [finds borrower profile cards](https://docs.digifi.io/reference/get-borrower-profile-cards) for current organization and mode (depends on `api-key` provided to api client) by optional `borrowerType`. 
- `new BorrowersApi(apiClient: ApiClient)` - api service for borrowers management.
  - `find(params: object)` - [finds borrowers](https://docs.digifi.io/reference/search-borrowers) by `params` object.
  - `findById(id: string)` - [finds borrower](https://docs.digifi.io/reference/get-borrower) by `id`.
  - `create(params: object)` - [creates borrower](https://docs.digifi.io/reference/create-borrower) by `params` object.
  - `update(id: string, params: object)` - [updates borrower](https://docs.digifi.io/reference/update-borrower) by `id` and `params` object.
  - `delete(id: string)` - [deletes borrower](https://docs.digifi.io/reference/delete-borrower) by `id`.
- `new CommentsApi(apiClient: ApiClient)` - api service for comments management.
  - `find(params: object)` - [finds comments](https://docs.digifi.io/reference/get-comments) by `params` object.
  - `findById(id: string)` - finds comment by `id`.
  - `create(params: object)` - [creates comment](https://docs.digifi.io/reference/create-comment) by `params` object.
  - `update(id: string, params: object)` - [updates comment](https://docs.digifi.io/reference/update-comment) by `id` and `params` object.
  - `delete(id: string)` - [deletes comment](https://docs.digifi.io/reference/delete-comment) by `id`.
- `new IntermediariesApi(apiClient: ApiClient)` - api service for intermediaries management.
  - `find(params: object)` - [finds intermediaries](https://docs.digifi.io/reference/search-intermediaries) by `params` object.
  - `findById(id: string)` - [finds intermediary](https://docs.digifi.io/reference/get-intermediary-1) by `id`.
  - `create(params: object)` - [creates intermediary](https://docs.digifi.io/reference/create-intermediary-1) by `params` object.
  - `update(id: string, params: object)` - [updates intermediary](https://docs.digifi.io/reference/update-intermediary-1) by `id` and `params` object.
  - `delete(id: string)` - [deletes intermediary](https://docs.digifi.io/reference/delete-intermediary) by `id`.
  - `getSuggestions(params: object)` - retrieves intermediary suggestions by `params` object.
  - `createMany(intermediaries: object[])` - creates few intermediaries.
- `new ProductCalculationsApi(apiClient: ApiClient)` - api service for product calculations management.
  - `find(productId: string)` - finds product calculations for current organization and mode (depends on `api-key` provided to api client) by `productId`.
- `new ProductsApi(apiClient: ApiClient)` - api service for products management.
  - `find(params: object)` - [finds products](https://docs.digifi.io/reference/get-products) for current organization and mode (depends on `api-key` provided to api client) by `params`.
  - `findById(id: string)` - [finds product](https://docs.digifi.io/reference/get-product) for current organization and mode (depends on `api-key` provided to api client) by `id`.
- `new TasksApi(apiClient: ApiClient)` - api service for application tasks management.
  - `find(params: object)` - [finds tasks](https://docs.digifi.io/reference/search-tasks) by `params` object.
  - `findById(id: string)` - [finds task](https://docs.digifi.io/reference/get-task) by `id`.
  - `create(params: object)` - [creates task](https://docs.digifi.io/reference/create-task) by `params` object.
  - `update(id: string, params: object)` - [updates task](https://docs.digifi.io/reference/update-task) by `id` and `params` object.
  - `delete(id: string)` - [deletes task](https://docs.digifi.io/reference/delete-task) by `id`.
  - `bulkCreate(params: object)` - [creates many tasks](https://docs.digifi.io/reference/batch-create-of-application-tasks) by `params` object.
- `new WebhookEndpointsApi(apiClient: ApiClient)` - api service for webhooks management.
  - `find(params: object)` - finds webhook endpoints by `params` object.
  - `findById(id: string)` - finds webhook endpoints by `id`.
  - `create(params: object)` - creates webhook endpoint by `params` object.
  - `update(id: string, params: object)` - updates webhook endpoints by `id` and `params` object.
  - `delete(id: string)` - deletes webhook endpoint by `id`.

## Webhook signing

DigiFi can verify webhook events signature it sends to your endpoint, allowing you to validate that they were not sent by a third-party. You can read more about it [here](https://docs.digifi.io/reference/digifi-webhooks).

Please note that you must pass the _raw_ request body, exactly as received from DigiFi, to the `verifyWebhookSignature()` function; this will not work with a parsed (i.e., JSON) request body.

Here is an example how to use it with [express](https://expressjs.com/):

```js
const express = require('express');
const digifi = require('digifi-node-js');
const bodyParser = require('body-parser');

const app = express();
const endpointSecret = '...';

app.post('/webhooks', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const timestamp = req.headers['x-digifi-event-timestamp'];
  const signature = req.headers['x-digifi-signature'];
  
  if (!digifi.verifyWebhookSignature(req.body, endpointSecret, timestamp, signature)) {
    res.status(400).send({ message: 'Invalid signature' });
    
    return;
  }
  
  if (!digifi.verifyWebhookTimestamp(timestamp)) {
    res.status(400).send({ message: 'Invalid timestamp' });
    
    return;
  }

  switch (req.body.eventType) {
    case 'application.created': {
      handleApplicationCreate();
    }
    case 'application.updated': {
      handleApplicationUpdate();
    }
  }

  res.status(200).send({});
});

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:3000`)
});
```

## Support

New features and bug fixes are released on the latest major version of the `@digifi/digifi-node-js` package. If you are on an older major version, we recommend that you upgrade to the latest in order to use the new features and bug fixes including those for security vulnerabilities. Older major versions of the package will continue to be available for use, but will not be receiving any updates.

## More Information

- [DigiFi API Docs](https://docs.digifi.io/reference/digifi-api)

<!--
# vim: set tw=79:
-->