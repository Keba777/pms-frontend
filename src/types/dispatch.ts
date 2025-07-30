import { Approval } from "./approval";
import { Site } from "./site";

export interface Dispatch {
    id: string;
    approvalId: string;
    approval?: Approval;
    refNumber?: string;
    totalTransportCost: number;
    estArrivalTime: Date;
    depatureSiteId: string;
    depatureSite?: Site;
    arrivalSiteId: string;
    arrivalSite?: Site;
    remarks?: string;
    dispatchedDate: Date;
    driverName?: string;
    vehicleNumber?: string;
    vehicleType?: string;
    dispatchedBy?: "Plane" | "Truck";
    status: "Pending" | "In Transit" | "Delivered" | "Cancelled";
}

export interface CreateDispatchInput {
    approvalId: string;
    refNumber?: string;
    totalTransportCost: number;
    estArrivalTime: Date;
    depatureSiteId: string;
    arrivalSiteId: string;
    remarks?: string;
    dispatchedDate: Date;
    driverName?: string;
    vehicleNumber?: string;
    vehicleType?: string;
    dispatchedBy?: "Plane" | "Truck";
}

export interface UpdateDispatchInput {
    id?: string;
    approvalId?: string;
    refNumber?: string;
    totalTransportCost?: number;
    estArrivalTime?: Date;
    depatureSiteId?: string;
    arrivalSiteId?: string;
    remarks?: string;
    dispatchedDate?: Date;
    driverName?: string;
    vehicleNumber?: string;
    vehicleType?: string;
    dispatchedBy?: "Plane" | "Truck";
}