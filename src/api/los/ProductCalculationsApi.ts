import { IApiClient } from '../../clients';
import getSearchParams from '../../utils/getSearchParams';
import { VariableType } from '../../enums';
import { SearchParams } from '../BaseSystemApi';

export interface ProductCalculation {
  id: string;
  code: string;
  productId: string;
  organizationId: string;
  organizationVersion: number | null;
  requiredVariables: string[];
  createdAt?: Date;
  updatedAt?: Date;
  variable: {
    id: string;
    dataType: VariableType;
    systemName: string;
    name: string;
  };
}

export interface GetProductCalculationsParams {
  productId?: string;
  variable?: string;
  search?: string;
}

export default class ProductCalculationsApi {
  protected path = '/product-calculations';

  constructor(
    protected apiClient: IApiClient,
  ) {}

  public getProductCalculations(params?: GetProductCalculationsParams): Promise<ProductCalculation[]> {
    const queryParams = getSearchParams((params || {}) as SearchParams);

    return this.apiClient.makeCall<ProductCalculation[]>(`/${this.path}/?${queryParams}`);
  }
}
