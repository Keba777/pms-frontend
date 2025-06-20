import { Approval } from "./approval";

export interface StoreRequisition {
  id: string;
  description?: string;
  unitOfMeasure: string;
  quantity: number;
  remarks?: string;
  approvalId: string;
  approval?: Approval;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStoreRequisitionInput {
  description?: string;
  unitOfMeasure: string;
  quantity: number;
  remarks?: string;
  approvalId: string;
}

export interface UpdateStoreRequisitionInput {
  id: string;
  description?: string;
  unitOfMeasure?: string;
  quantity?: number;
  remarks?: string;
  approvalId?: string;
}
