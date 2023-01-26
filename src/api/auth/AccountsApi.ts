import { AuthApiClient } from '../../clients';
import { Headers } from 'node-fetch';
import { AuthResponseParams } from '../../types';
import getSearchParams from '../../utils/getSearchParams';
import { SearchParams } from '../BaseSystemApi';

export enum AccountStatus {
  Active = 'active',
  Blocked = 'blocked',
  Pending = 'pending',
}

export interface BaseAccountPhone {
  value: string;
  verified: boolean;
  deletedAt?: Date;
}

export type BaseAccountInfo = {
  id: string;
  isEmailNotVerified: true | undefined;
  isMfaIncomplete: true | undefined;
  email: string;
  phones: BaseAccountPhone[];
  lastActiveAt: number | null;
  status: AccountStatus;
} & {
  [key in string]: string;
}

export type CreateAccountParams = {
  email: string;
  phone?: string;
  password?: string;
} & {
  [key in string]: string;
};

export interface CreatePasswordValidationTokenResponseParams {
  passwordValidationToken: string
}

export type FindAccountsParams = {
  ids?: string[];
  emails?: string[];
  phones?: string[];
} & {
  [key in 'borrowerIds' | 'intermediaryIds']?: string[];
}

class AccountsApi {
  protected path = '/accounts';

  constructor(
    private apiClient: AuthApiClient,
  ) {}

  public findAccountByEmail(email: string): Promise<BaseAccountInfo> {
    return this.apiClient.makeCall(`${this.path}/${email}`);
  }

  public createAccount(params: CreateAccountParams, refreshTokenExpirationTimeMinutes?: number): Promise<AuthResponseParams> {
    return this.apiClient.makeCall(`${this.path}`, 'POST', { ...params, refreshTokenExpirationTimeMinutes });
  }

  public getCurrentUser(accountAccessToken: string): Promise<BaseAccountInfo> {
    return this.apiClient.makeCall(`${this.path}`, 'GET', undefined, {
      headers: new Headers({
        accountAccessToken,
      }),
    });
  }

  public sendUpdatePhoneNumberCode(phone: string, accountAccessToken: string, accountPasswordValidationToken: string): Promise<void> {
    return this.apiClient.makeCall(`${this.path}/phone`, 'PUT', { phone }, {
      headers: new Headers({
        accountAccessToken,
        accountPasswordValidationToken,
      }),
    });
  }

  public updatePhoneNumber(code: string, accountAccessToken: string): Promise<void> {
    return this.apiClient.makeCall(`${this.path}/phone/${code}`, 'PUT', undefined, {
      headers: new Headers({
        accountAccessToken,
      }),
    });
  }

  public sendAddPhoneNumberCode(phone: string, accountAccessToken: string, accountPasswordValidationToken: string): Promise<void> {
    return this.apiClient.makeCall(`${this.path}/phone`, 'POST', { phone }, {
      headers: new Headers({
        accountAccessToken,
        accountPasswordValidationToken,
      }),
    });
  }

  public addPhoneNumber(code: string, accountAccessToken: string): Promise<void> {
    return this.apiClient.makeCall(`${this.path}/phone/${code}`, 'POST', undefined, {
      headers: new Headers({
        accountAccessToken,
      }),
    });
  }

  public deletePhoneNumber(phone: string, accountAccessToken: string, accountPasswordValidationToken: string): Promise<void> {
    return this.apiClient.makeCall(`${this.path}/delete-phone`, 'PUT', { phone }, {
      headers: new Headers({
        accountAccessToken,
        accountPasswordValidationToken,
      }),
    });
  }

  public sendUpdateEmailCode(email: string, accountAccessToken: string, accountPasswordValidationToken: string): Promise<void> {
    return this.apiClient.makeCall(`${this.path}/email`, 'PUT', { email }, {
      headers: new Headers({
        accountAccessToken,
        accountPasswordValidationToken,
      }),
    });
  }

  public updateEmailAddress(code: string, accountAccessToken: string): Promise<void> {
    return this.apiClient.makeCall(`${this.path}/email/${code}`, 'PUT', undefined, {
      headers: new Headers({
        accountAccessToken,
      }),
    });
  }

  public createPasswordValidationToken(password: string, accountAccessToken: string): Promise<CreatePasswordValidationTokenResponseParams> {
    return this.apiClient.makeCall(`${this.path}/password-validation-token`, 'POST', { password }, {
      headers: new Headers({
        accountAccessToken,
      }),
    });
  }

  public updatePassword(oldPassword: string, newPassword: string, accountAccessToken: string): Promise<void> {
    return this.apiClient.makeCall(`${this.path}/password`, 'PUT', {
      oldPassword,
      newPassword,
    }, {
      headers: new Headers({
        accountAccessToken,
      }),
    });
  }

  public find(params: FindAccountsParams): Promise<BaseAccountInfo[]> {
    const urlSearchParams = getSearchParams(params as unknown as SearchParams);

    return this.apiClient.makeCall(`/${this.path}/search?${urlSearchParams}`);
  }
}

export default AccountsApi;
