/** Temporary client-side ID for bale rows not yet persisted */
export type TempId = `temp-${string}`;

export interface BaleRow {
  /** Temporary client-side ID; replaced by server ID on creation */
  id: TempId;
  baleCode: string;
  materialCode: string;
  grossWeight: number;
  tares: number[];
  netWeight: number;
  lotCode: string;
  observations: string;
}

export interface TruckReceptionFormData {
  truckLicensePlate: string;
  carrier: string;
  materialCode: string;
  lotCode: string;
}

export interface CreateBalePayload {
  bale_code: string;
  material_code: string;
  gross_weight_kg: number;
  tares_kg: number[];
  net_weight_kg: number;
  lot_code: string;
  observations?: string;
}

export interface CreateReceptionPayload {
  truck_license_plate: string;
  carrier: string;
  material_code: string;
  lot_code: string;
  bales: CreateBalePayload[];
}

export interface CreatedBaleResponse {
  id: string;
  bale_code: string;
}

export interface CreatedReceptionResponse {
  reception_id: string;
  bales: CreatedBaleResponse[];
}
