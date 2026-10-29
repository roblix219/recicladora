export type MaterialCategory =
  | 'Metales Ferrosos'
  | 'Metales No Ferrosos'
  | 'Plásticos'
  | 'Cartón y Papel'
  | 'Electrónicos'
  | 'Vidrio'
  | 'Residuos Industriales';

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  buyPriceStandard: number; // Precio compra al público/recolector por kg
  buyPricePreferential: number; // Precio compra a proveedores frecuentes/empresas por kg
  sellPriceWholesale: number; // Precio venta a fundidora o molino por kg
  stockKg: number;
  processedStockKg?: number; // Stock ya compactado/empacado
  moistureDeductionTolerance: number; // Tolerancia permitida de merma en % (ej. 2%)
  minStockAlertKg: number;
  unit: 'KG' | 'TON';
  code: string;
}

export type SupplierType = 'Recolector Independiente' | 'Empresa / Taller' | 'Ruta / Chofer Propio';

export interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  taxId: string; // RFC o Identificación
  phone: string;
  address?: string;
  preferentialTariff: boolean;
  defaultVehiclePlate?: string;
  totalDeliveredKg: number;
  totalPaid: number;
  notes?: string;
}

export interface TicketItem {
  id: string;
  materialId: string;
  materialName: string;
  category: MaterialCategory;
  grossKg: number;
  tareKg: number;
  deductionPercent: number; // % por suciedad, humedad o impureza
  deductionKg: number;
  netKg: number;
  unitPrice: number;
  subtotal: number;
}

export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Cheque';
export type PaymentStatus = 'Pagado' | 'Pendiente' | 'Cancelado';

export interface TicketPurchase {
  id: string;
  folio: string;
  timestamp: string;
  supplierId: string;
  supplierName: string;
  supplierType: SupplierType;
  operatorName: string;
  vehiclePlate?: string;
  vehicleType?: string;
  vehicleGrossKg?: number;
  vehicleTareKg?: number;
  totalGrossKg: number;
  totalTareKg: number;
  totalMermaKg: number;
  totalNetKg: number;
  items: TicketItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  offlineCreated?: boolean;
}

export interface SalesOrder {
  id: string;
  folio: string;
  date: string;
  clientName: string; // Ej: Siderúrgica San Luis, BioPappel, PetStar
  contactPhone?: string;
  driverName: string;
  vehiclePlate: string;
  carrierCompany: string;
  materialId: string;
  materialName: string;
  category: MaterialCategory;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  unitPrice: number;
  totalAmount: number;
  invoiceRef?: string;
  paymentStatus: 'Cobrado' | 'A Crédito 15d' | 'Pendiente';
  notes?: string;
  offlineCreated?: boolean;
}

export type ProcessType =
  | 'Compactación a Pacas'
  | 'Cizallado / Oxicorte'
  | 'Triturado / Molienda'
  | 'Clasificación y Limpieza';

export interface YardProcess {
  id: string;
  folio: string;
  date: string;
  type: ProcessType;
  operatorName: string;
  sourceMaterialId: string;
  sourceMaterialName: string;
  sourceWeightKg: number;
  resultWeightKg: number;
  operationalLossKg: number; // Merma de proceso (desperdicio, polvo, impurezas descartadas)
  lossPercentage: number;
  destinationNotes: string;
}

export interface CashRegister {
  id: string;
  date: string;
  shift: 'Matutino' | 'Vespertino' | 'Completo';
  operatorName: string;
  initialCash: number; // Fondo de compras inicial
  totalCashPurchases: number; // Total pagado a proveedores en efectivo
  totalCashSales: number; // Ventas cobradas en efectivo
  cashReplenishments: number; // Aportes de caja durante el turno
  expectedBalance: number; // Fondo + Ventas + Aportes - Compras
  countedCash: number; // Conteo físico al cierre
  difference: number; // Sobrante (+) o Faltante (-)
  status: 'Abierta' | 'Cerrada';
  openedAt: string;
  closedAt?: string;
  notes?: string;
}

export interface ScaleReading {
  weightKg: number;
  isStable: boolean;
  unit: 'kg';
  connected: boolean;
  mode: 'Bruto' | 'Tara' | 'Neto';
  lastReadingTime: string;
}
