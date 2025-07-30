import { Equipment } from "./equipment";
import { LaborInformation } from "./laborInformation";
import { User } from "./user";

export interface Kpi {
    id: string;
    type: 'Labor' | 'Machinery';
    score: number;
    status: 'Bad' | 'Good' | 'V.Good' | 'Excellent';
    remark?: string;
    userLaborId?: string;
    userLabor?: User;
    laborInfoId?: string;
    laborInformation: LaborInformation;
    equipmentId?: string;
    equipment?: Equipment;
    target?: number;
}

export interface CreateKpiInput {
    type: 'Labor' | 'Machinery';
    score: number;
    status: 'Bad' | 'Good' | 'V.Good' | 'Excellent';
    remark?: string;
    userLaborId?: string;
    laborInfoId?: string;
    equipmentId?: string;
    target?: number;
}

export interface UpdateKpiInput {
    id?: string;
    type?: 'Labor' | 'Machinery';
    score?: number;
    status?: 'Bad' | 'Good' | 'V.Good' | 'Excellent';
    remark?: string;
    userLaborId?: string;
    laborInfoId?: string;
    equipmentId?: string;
    target?: number;
}