import { Approval } from "./approval";
import { Site } from "./site";

export interface RequestDelivery {
    id: string;
    approvalId: string;
    approval?: Approval;
    refNumber?: string;
    recievedQuantity: number;
    deliveredBy: string;
    recievedBy: string;
    deliveryDate: Date;
    siteId: string;
    site?: Site;
    remarks?: string;
    status: 'Pending' | 'Delivered' | 'Cancelled';
}

export interface CreateRequestDeliveryInput {
    approvalId: string;
    refNumber?: string;
    recievedQuantity: number;
    deliveredBy: string;
    recievedBy: string;
    deliveryDate: Date;
    siteId: string;
    remarks?: string;
    status: 'Pending' | 'Delivered' | 'Cancelled';
}

export interface UpdateRequestDeliveryInput {
    id: string;
    approvalId?: string;
    refNumber?: string;
    recievedQuantity?: number;
    deliveredBy?: string;
    recievedBy?: string;
    deliveryDate?: Date;
    siteId?: string;
    remarks?: string;
    status?: 'Pending' | 'Delivered' | 'Cancelled';
}