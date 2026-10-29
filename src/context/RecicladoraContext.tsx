import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Material,
  Supplier,
  TicketPurchase,
  TicketItem,
  SalesOrder,
  YardProcess,
  CashRegister,
  ScaleReading,
  PaymentMethod,
} from '../types';

const INITIAL_MATERIALS: Material[] = [
  // Metales Ferrosos
  {
    id: 'mat-1',
    code: 'FE-01',
    name: 'Chatarra Pesada / Fierro Grueso',
    category: 'Metales Ferrosos',
    buyPriceStandard: 4.20,
    buyPricePreferential: 4.60,
    sellPriceWholesale: 6.20,
    stockKg: 14250,
    processedStockKg: 8500,
    moistureDeductionTolerance: 3,
    minStockAlertKg: 5000,
    unit: 'KG',
  },
  {
    id: 'mat-2',
    code: 'FE-02',
    name: 'Chatarra Ligera / Mixta (Lámina/Tambos)',
    category: 'Metales Ferrosos',
    buyPriceStandard: 3.40,
    buyPricePreferential: 3.80,
    sellPriceWholesale: 5.10,
    stockKg: 8400,
    processedStockKg: 4200,
    moistureDeductionTolerance: 5,
    minStockAlertKg: 4000,
    unit: 'KG',
  },
  {
    id: 'mat-3',
    code: 'FE-03',
    name: 'Fierro Vaciado / Block de Motor',
    category: 'Metales Ferrosos',
    buyPriceStandard: 5.00,
    buyPricePreferential: 5.50,
    sellPriceWholesale: 7.40,
    stockKg: 4100,
    processedStockKg: 0,
    moistureDeductionTolerance: 2,
    minStockAlertKg: 2000,
    unit: 'KG',
  },
  // Metales No Ferrosos
  {
    id: 'mat-4',
    code: 'CU-01',
    name: 'Cobre de Primera (Brillante/Limpio)',
    category: 'Metales No Ferrosos',
    buyPriceStandard: 165.00,
    buyPricePreferential: 174.00,
    sellPriceWholesale: 195.00,
    stockKg: 1840,
    processedStockKg: 1200,
    moistureDeductionTolerance: 1,
    minStockAlertKg: 500,
    unit: 'KG',
  },
  {
    id: 'mat-5',
    code: 'CU-02',
    name: 'Cobre de Segunda (Quemado/Tubería)',
    category: 'Metales No Ferrosos',
    buyPriceStandard: 145.00,
    buyPricePreferential: 152.00,
    sellPriceWholesale: 172.00,
    stockKg: 1220,
    processedStockKg: 800,
    moistureDeductionTolerance: 2,
    minStockAlertKg: 400,
    unit: 'KG',
  },
  {
    id: 'mat-6',
    code: 'BR-01',
    name: 'Bronce y Latón Comercial',
    category: 'Metales No Ferrosos',
    buyPriceStandard: 92.00,
    buyPricePreferential: 98.00,
    sellPriceWholesale: 118.00,
    stockKg: 2150,
    processedStockKg: 1500,
    moistureDeductionTolerance: 2,
    minStockAlertKg: 600,
    unit: 'KG',
  },
  {
    id: 'mat-7',
    code: 'AL-01',
    name: 'Aluminio Perfil Limpio (Cancelería)',
    category: 'Metales No Ferrosos',
    buyPriceStandard: 34.00,
    buyPricePreferential: 37.50,
    sellPriceWholesale: 46.00,
    stockKg: 3900,
    processedStockKg: 2600,
    moistureDeductionTolerance: 1.5,
    minStockAlertKg: 1000,
    unit: 'KG',
  },
  {
    id: 'mat-8',
    code: 'AL-02',
    name: 'Aluminio Bote / Lata (UBC)',
    category: 'Metales No Ferrosos',
    buyPriceStandard: 26.00,
    buyPricePreferential: 29.00,
    sellPriceWholesale: 36.50,
    stockKg: 2750,
    processedStockKg: 1800,
    moistureDeductionTolerance: 4,
    minStockAlertKg: 800,
    unit: 'KG',
  },
  {
    id: 'mat-9',
    code: 'PB-01',
    name: 'Baterías de Plomo Automotriz',
    category: 'Metales No Ferrosos',
    buyPriceStandard: 15.50,
    buyPricePreferential: 17.00,
    sellPriceWholesale: 22.50,
    stockKg: 5600,
    processedStockKg: 0,
    moistureDeductionTolerance: 2,
    minStockAlertKg: 1500,
    unit: 'KG',
  },
  {
    id: 'mat-10',
    code: 'SS-01',
    name: 'Acero Inoxidable Grado 304',
    category: 'Metales No Ferrosos',
    buyPriceStandard: 28.00,
    buyPricePreferential: 31.00,
    sellPriceWholesale: 40.00,
    stockKg: 2100,
    processedStockKg: 0,
    moistureDeductionTolerance: 1.5,
    minStockAlertKg: 700,
    unit: 'KG',
  },
  // Plásticos
  {
    id: 'mat-11',
    code: 'PET-01',
    name: 'Plástico PET Cristal (Transparente)',
    category: 'Plásticos',
    buyPriceStandard: 7.50,
    buyPricePreferential: 8.50,
    sellPriceWholesale: 12.80,
    stockKg: 6400,
    processedStockKg: 4200,
    moistureDeductionTolerance: 3,
    minStockAlertKg: 2500,
    unit: 'KG',
  },
  {
    id: 'mat-12',
    code: 'HDPE-01',
    name: 'Plástico Polietileno Alta Densidad (HDPE)',
    category: 'Plásticos',
    buyPriceStandard: 9.00,
    buyPricePreferential: 10.20,
    sellPriceWholesale: 15.00,
    stockKg: 4800,
    processedStockKg: 3000,
    moistureDeductionTolerance: 3,
    minStockAlertKg: 1500,
    unit: 'KG',
  },
  // Cartón y Papel
  {
    id: 'mat-13',
    code: 'CT-01',
    name: 'Cartón Corrugado Limpio',
    category: 'Cartón y Papel',
    buyPriceStandard: 2.10,
    buyPricePreferential: 2.40,
    sellPriceWholesale: 3.60,
    stockKg: 18500,
    processedStockKg: 14000,
    moistureDeductionTolerance: 5,
    minStockAlertKg: 8000,
    unit: 'KG',
  },
  {
    id: 'mat-14',
    code: 'PP-01',
    name: 'Archivo Blanco / Bond Oficina',
    category: 'Cartón y Papel',
    buyPriceStandard: 3.80,
    buyPricePreferential: 4.30,
    sellPriceWholesale: 6.20,
    stockKg: 4300,
    processedStockKg: 3100,
    moistureDeductionTolerance: 2,
    minStockAlertKg: 1500,
    unit: 'KG',
  },
  // Electrónicos
  {
    id: 'mat-15',
    code: 'RAEE-01',
    name: 'Tarjetas Electrónicas y Motherboards',
    category: 'Electrónicos',
    buyPriceStandard: 45.00,
    buyPricePreferential: 52.00,
    sellPriceWholesale: 78.00,
    stockKg: 850,
    processedStockKg: 0,
    moistureDeductionTolerance: 1,
    minStockAlertKg: 300,
    unit: 'KG',
  },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Don Ramón Torres Aguilar',
    type: 'Recolector Independiente',
    taxId: 'TOAR680412H81',
    phone: '444-819-2340',
    address: 'Col. Bellas Lomas #142',
    preferentialTariff: false,
    defaultVehiclePlate: 'SLP-44-12',
    totalDeliveredKg: 4210,
    totalPaid: 26340,
    notes: 'Acopia chatarra ligera y cartón los martes y viernes.',
  },
  {
    id: 'sup-2',
    name: 'Metalmecánica del Bajío S.A. de C.V.',
    type: 'Empresa / Taller',
    taxId: 'MBJ140612KV4',
    phone: '444-230-9000',
    address: 'Parque Industrial Milenio Nave 4',
    preferentialTariff: true,
    defaultVehiclePlate: 'TR-882-JK',
    totalDeliveredKg: 18450,
    totalPaid: 124800,
    notes: 'Recortes de placa, viruta de bronce y acero inoxidable con certificado.',
  },
  {
    id: 'sup-3',
    name: 'José Luis "El Güero" Medina',
    type: 'Recolector Independiente',
    taxId: 'MELJ850901XY2',
    phone: '444-102-7741',
    address: 'Fracc. Valle Dorado',
    preferentialTariff: false,
    defaultVehiclePlate: 'Triciclo/Piso',
    totalDeliveredKg: 1950,
    totalPaid: 32800,
    notes: 'Principalmente entrega cobre, botes de aluminio y bronce.',
  },
  {
    id: 'sup-4',
    name: 'Empaques y Logística Express',
    type: 'Empresa / Taller',
    taxId: 'ELE091120PT3',
    phone: '444-883-1122',
    address: 'Zona Industrial Eje 120',
    preferentialTariff: true,
    defaultVehiclePlate: 'VN-503-RT',
    totalDeliveredKg: 34200,
    totalPaid: 78660,
    notes: 'Entrega semanal de cartón corrugado y tarimas/playo.',
  },
  {
    id: 'sup-5',
    name: 'Ruta Recolección 01 (Unidad Propia)',
    type: 'Ruta / Chofer Propio',
    taxId: 'ECO-INTERNO-01',
    phone: '444-555-0101',
    address: 'Patio Central',
    preferentialTariff: true,
    defaultVehiclePlate: 'PL-350-HD',
    totalDeliveredKg: 12600,
    totalPaid: 58400,
    notes: 'Camión 3.5 Toneladas recolector de ruta comercial.',
  },
];

const INITIAL_PURCHASES: TicketPurchase[] = [
  {
    id: 'tk-1',
    folio: 'REC-2026-0101',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    supplierId: 'sup-1',
    supplierName: 'Don Ramón Torres Aguilar',
    supplierType: 'Recolector Independiente',
    operatorName: 'Carlos M. (Báscula 1)',
    vehiclePlate: 'SLP-44-12',
    vehicleType: 'Camioneta Pick-up',
    vehicleGrossKg: 2850,
    vehicleTareKg: 1920,
    totalGrossKg: 930,
    totalTareKg: 0,
    totalMermaKg: 37,
    totalNetKg: 893,
    items: [
      {
        id: 'item-1',
        materialId: 'mat-1',
        materialName: 'Chatarra Pesada / Fierro Grueso',
        category: 'Metales Ferrosos',
        grossKg: 520,
        tareKg: 0,
        deductionPercent: 4,
        deductionKg: 20.8,
        netKg: 499.2,
        unitPrice: 4.20,
        subtotal: 2096.64,
      },
      {
        id: 'item-2',
        materialId: 'mat-13',
        materialName: 'Cartón Corrugado Limpio',
        category: 'Cartón y Papel',
        grossKg: 410,
        tareKg: 0,
        deductionPercent: 4,
        deductionKg: 16.4,
        netKg: 393.6,
        unitPrice: 2.10,
        subtotal: 826.56,
      },
    ],
    totalAmount: 2923.20,
    paymentMethod: 'Efectivo',
    paymentStatus: 'Pagado',
    notes: 'Fierro sin rebaba, cartón con mínima humedad.',
  },
  {
    id: 'tk-2',
    folio: 'REC-2026-0102',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    supplierId: 'sup-3',
    supplierName: 'José Luis "El Güero" Medina',
    supplierType: 'Recolector Independiente',
    operatorName: 'Carlos M. (Báscula 1)',
    vehiclePlate: 'Triciclo/Piso',
    vehicleType: 'Carretilla / Bultos',
    totalGrossKg: 142,
    totalTareKg: 12,
    totalMermaKg: 2.6,
    totalNetKg: 127.4,
    items: [
      {
        id: 'item-3',
        materialId: 'mat-4',
        materialName: 'Cobre de Primera (Brillante/Limpio)',
        category: 'Metales No Ferrosos',
        grossKg: 38,
        tareKg: 2,
        deductionPercent: 0,
        deductionKg: 0,
        netKg: 36,
        unitPrice: 165.00,
        subtotal: 5940.00,
      },
      {
        id: 'item-4',
        materialId: 'mat-8',
        materialName: 'Aluminio Bote / Lata (UBC)',
        category: 'Metales No Ferrosos',
        grossKg: 92,
        tareKg: 10,
        deductionPercent: 3,
        deductionKg: 2.46,
        netKg: 79.54,
        unitPrice: 26.00,
        subtotal: 2068.04,
      },
    ],
    totalAmount: 8008.04,
    paymentMethod: 'Efectivo',
    paymentStatus: 'Pagado',
    notes: 'Botes compactados manualmente, cobre excelente calidad.',
  },
];

const INITIAL_SALES: SalesOrder[] = [
  {
    id: 'so-1',
    folio: 'REM-2026-0038',
    date: new Date(Date.now() - 86400000).toISOString(),
    clientName: 'Siderúrgica del Norte / Fundidora Industrial',
    contactPhone: '81-8300-4400',
    driverName: 'Marcos Rentería',
    vehiclePlate: 'NL-920-AA',
    carrierCompany: 'Transportes Pesados Galindo',
    materialId: 'mat-1',
    materialName: 'Chatarra Pesada / Fierro Grueso',
    category: 'Metales Ferrosos',
    grossWeightKg: 32400,
    tareWeightKg: 14200,
    netWeightKg: 18200,
    unitPrice: 6.20,
    totalAmount: 112840.00,
    invoiceRef: 'FAC-E-8891',
    paymentStatus: 'Cobrado',
    notes: 'Tráiler tolva con chatarra pesada cizallada.',
  },
  {
    id: 'so-2',
    folio: 'REM-2026-0039',
    date: new Date().toISOString(),
    clientName: 'BioPappel Reciclados Centro',
    contactPhone: '55-5200-1122',
    driverName: 'Efraín Castillo',
    vehiclePlate: 'DF-441-KK',
    carrierCompany: 'Fletes y Remisiones del Centro',
    materialId: 'mat-13',
    materialName: 'Cartón Corrugado Limpio',
    category: 'Cartón y Papel',
    grossWeightKg: 26800,
    tareWeightKg: 13500,
    netWeightKg: 13300,
    unitPrice: 3.60,
    totalAmount: 47880.00,
    invoiceRef: 'FAC-E-8895',
    paymentStatus: 'A Crédito 15d',
    notes: 'Salida de 24 pacas de cartón compactado.',
  },
];

const INITIAL_PROCESSES: YardProcess[] = [
  {
    id: 'proc-1',
    folio: 'PAC-2026-0012',
    date: new Date(Date.now() - 3600000 * 5).toISOString(),
    type: 'Compactación a Pacas',
    operatorName: 'Gustavo H. (Operador Prensa)',
    sourceMaterialId: 'mat-13',
    sourceMaterialName: 'Cartón Corrugado Limpio',
    sourceWeightKg: 3500,
    resultWeightKg: 3380,
    operationalLossKg: 120,
    lossPercentage: 3.43,
    destinationNotes: '7 pacas de 480kg aprox. almacenadas en nave techada.',
  },
  {
    id: 'proc-2',
    folio: 'PAC-2026-0013',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'Compactación a Pacas',
    operatorName: 'Gustavo H. (Operador Prensa)',
    sourceMaterialId: 'mat-11',
    sourceMaterialName: 'Plástico PET Cristal (Transparente)',
    sourceWeightKg: 1600,
    resultWeightKg: 1540,
    operationalLossKg: 60,
    lossPercentage: 3.75,
    destinationNotes: '4 pacas de PET cristal amarradas con fleje de alta resistencia.',
  },
];

const INITIAL_CASH_REGISTER: CashRegister = {
  id: 'caja-hoy',
  date: new Date().toISOString().split('T')[0],
  shift: 'Matutino',
  operatorName: 'Carlos Mendoza',
  initialCash: 35000.00, // $35,000 MXN fondo para compras
  totalCashPurchases: 10931.24, // Compras pagadas en efectivo hoy
  totalCashSales: 0.00,
  cashReplenishments: 5000.00,
  expectedBalance: 35000 + 0 + 5000 - 10931.24, // $29,068.76
  countedCash: 29070.00,
  difference: 1.24,
  status: 'Abierta',
  openedAt: new Date(new Date().setHours(7, 30, 0, 0)).toISOString(),
  notes: 'Turno activo en caseta de báscula.',
};

interface RecicladoraContextType {
  materials: Material[];
  suppliers: Supplier[];
  purchaseTickets: TicketPurchase[];
  salesOrders: SalesOrder[];
  yardProcesses: YardProcess[];
  currentCashRegister: CashRegister;
  scaleReading: ScaleReading;
  unsyncedCount: number;
  // Actions
  addPurchaseTicket: (ticket: Omit<TicketPurchase, 'id' | 'folio'>) => TicketPurchase;
  createSalesOrder: (order: Omit<SalesOrder, 'id' | 'folio'>) => SalesOrder;
  addYardProcess: (proc: Omit<YardProcess, 'id' | 'folio'>) => YardProcess;
  updateMaterial: (mat: Material) => void;
  addMaterial: (mat: Omit<Material, 'id'>) => void;
  updateSupplier: (sup: Supplier) => void;
  addSupplier: (sup: Omit<Supplier, 'id'>) => Supplier;
  adjustCashRegister: (data: Partial<CashRegister>) => void;
  closeCurrentShift: (countedCash: number, notes: string) => void;
  openNewShift: (initialCash: number, operatorName: string, shift: 'Matutino' | 'Vespertino' | 'Completo') => void;
  // Virtual Scale controls
  setScaleWeight: (weight: number) => void;
  toggleScaleStable: () => void;
  zeroScale: () => void;
  tareScale: () => void;
  simulateVehicleWeight: (vehicleType: 'Camioneta' | 'Camión 3.5' | 'Torton' | 'Tráiler' | 'Triciclo' | 'Piso') => void;
  syncOfflineQueue: () => void;
  resetAllDemoData: () => void;
}

const RecicladoraContext = createContext<RecicladoraContextType | undefined>(undefined);

export const RecicladoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with localStorage or defaults
  const [materials, setMaterials] = useState<Material[]>(() => {
    try {
      const saved = localStorage.getItem('ecorecicla_materials');
      return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
    } catch {
      return INITIAL_MATERIALS;
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem('ecorecicla_suppliers');
      return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  });

  const [purchaseTickets, setPurchaseTickets] = useState<TicketPurchase[]>(() => {
    try {
      const saved = localStorage.getItem('ecorecicla_purchases');
      return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
    } catch {
      return INITIAL_PURCHASES;
    }
  });

  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => {
    try {
      const saved = localStorage.getItem('ecorecicla_sales');
      return saved ? JSON.parse(saved) : INITIAL_SALES;
    } catch {
      return INITIAL_SALES;
    }
  });

  const [yardProcesses, setYardProcesses] = useState<YardProcess[]>(() => {
    try {
      const saved = localStorage.getItem('ecorecicla_processes');
      return saved ? JSON.parse(saved) : INITIAL_PROCESSES;
    } catch {
      return INITIAL_PROCESSES;
    }
  });

  const [currentCashRegister, setCurrentCashRegister] = useState<CashRegister>(() => {
    try {
      const saved = localStorage.getItem('ecorecicla_cash');
      return saved ? JSON.parse(saved) : INITIAL_CASH_REGISTER;
    } catch {
      return INITIAL_CASH_REGISTER;
    }
  });

  // Scale Reading (virtual RS-232 / electronic indicator)
  const [scaleReading, setScaleReading] = useState<ScaleReading>({
    weightKg: 0,
    isStable: true,
    unit: 'kg',
    connected: true,
    mode: 'Bruto',
    lastReadingTime: new Date().toLocaleTimeString(),
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ecorecicla_materials', JSON.stringify(materials));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [materials]);

  useEffect(() => {
    try {
      localStorage.setItem('ecorecicla_suppliers', JSON.stringify(suppliers));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem('ecorecicla_purchases', JSON.stringify(purchaseTickets));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [purchaseTickets]);

  useEffect(() => {
    try {
      localStorage.setItem('ecorecicla_sales', JSON.stringify(salesOrders));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [salesOrders]);

  useEffect(() => {
    try {
      localStorage.setItem('ecorecicla_processes', JSON.stringify(yardProcesses));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [yardProcesses]);

  useEffect(() => {
    try {
      localStorage.setItem('ecorecicla_cash', JSON.stringify(currentCashRegister));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }, [currentCashRegister]);

  // Subtle real-time digital scale fluctuation simulation if weight > 0
  useEffect(() => {
    const timer = setInterval(() => {
      setScaleReading((prev) => {
        if (prev.weightKg <= 0 || !prev.connected) return prev;
        // Natural micro-jitter of industrial scale (+/- 1kg)
        const jitter = Math.floor(Math.random() * 3) - 1;
        const newWeight = Math.max(0, prev.weightKg + jitter);
        return {
          ...prev,
          weightKg: newWeight,
          lastReadingTime: new Date().toLocaleTimeString(),
        };
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Purchase Ticket creation: updates stock and updates cash register
  const addPurchaseTicket = (ticketData: Omit<TicketPurchase, 'id' | 'folio'>): TicketPurchase => {
    const nextNum = purchaseTickets.length + 103;
    const folio = `REC-2026-${String(nextNum).padStart(4, '0')}`;
    const newTicket: TicketPurchase = {
      ...ticketData,
      id: `tk-${Date.now()}`,
      folio,
      offlineCreated: !navigator.onLine,
    };

    // 1. Update yard material stock (+ netKg)
    setMaterials((prev) =>
      prev.map((mat) => {
        const item = newTicket.items.find((i) => i.materialId === mat.id);
        if (item) {
          return {
            ...mat,
            stockKg: mat.stockKg + item.netKg,
          };
        }
        return mat;
      })
    );

    // 2. Update supplier stats
    setSuppliers((prev) =>
      prev.map((sup) => {
        if (sup.id === newTicket.supplierId) {
          return {
            ...sup,
            totalDeliveredKg: sup.totalDeliveredKg + newTicket.totalNetKg,
            totalPaid: sup.totalPaid + newTicket.totalAmount,
          };
        }
        return sup;
      })
    );

    // 3. Update cash register if paid in cash
    if (newTicket.paymentMethod === 'Efectivo' && currentCashRegister.status === 'Abierta') {
      setCurrentCashRegister((prev) => {
        const newPurchases = prev.totalCashPurchases + newTicket.totalAmount;
        const newExpected = prev.initialCash + prev.totalCashSales + prev.cashReplenishments - newPurchases;
        return {
          ...prev,
          totalCashPurchases: Number(newPurchases.toFixed(2)),
          expectedBalance: Number(newExpected.toFixed(2)),
          difference: Number((prev.countedCash - newExpected).toFixed(2)),
        };
      });
    }

    setPurchaseTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  // Wholesale Sales Order: outbound truck dispatch, decreases stock and logs revenue
  const createSalesOrder = (orderData: Omit<SalesOrder, 'id' | 'folio'>): SalesOrder => {
    const nextNum = salesOrders.length + 40;
    const folio = `REM-2026-${String(nextNum).padStart(4, '0')}`;
    const newOrder: SalesOrder = {
      ...orderData,
      id: `so-${Date.now()}`,
      folio,
      offlineCreated: !navigator.onLine,
    };

    // Decrease yard stock
    setMaterials((prev) =>
      prev.map((mat) => {
        if (mat.id === newOrder.materialId) {
          // Discount from processed stock if available, else raw stock
          const newProcessed = Math.max(0, (mat.processedStockKg || 0) - newOrder.netWeightKg);
          const remainingToDeduct = Math.max(0, newOrder.netWeightKg - (mat.processedStockKg || 0));
          return {
            ...mat,
            processedStockKg: newProcessed,
            stockKg: Math.max(0, mat.stockKg - remainingToDeduct),
          };
        }
        return mat;
      })
    );

    // If paid cash, add to cash register
    if (newOrder.paymentStatus === 'Cobrado' && currentCashRegister.status === 'Abierta') {
      setCurrentCashRegister((prev) => {
        const newSales = prev.totalCashSales + newOrder.totalAmount;
        const newExpected = prev.initialCash + newSales + prev.cashReplenishments - prev.totalCashPurchases;
        return {
          ...prev,
          totalCashSales: Number(newSales.toFixed(2)),
          expectedBalance: Number(newExpected.toFixed(2)),
          difference: Number((prev.countedCash - newExpected).toFixed(2)),
        };
      });
    }

    setSalesOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  // Processing & Baling (compacting raw to bales or shredding, with operational scrap loss)
  const addYardProcess = (procData: Omit<YardProcess, 'id' | 'folio'>): YardProcess => {
    const nextNum = yardProcesses.length + 14;
    const folio = `PRC-2026-${String(nextNum).padStart(4, '0')}`;
    const newProcess: YardProcess = {
      ...procData,
      id: `proc-${Date.now()}`,
      folio,
    };

    // Update material: decrease bulk stock, increase processedStockKg
    setMaterials((prev) =>
      prev.map((mat) => {
        if (mat.id === newProcess.sourceMaterialId) {
          return {
            ...mat,
            stockKg: Math.max(0, mat.stockKg - newProcess.sourceWeightKg),
            processedStockKg: (mat.processedStockKg || 0) + newProcess.resultWeightKg,
          };
        }
        return mat;
      })
    );

    setYardProcesses((prev) => [newProcess, ...prev]);
    return newProcess;
  };

  const updateMaterial = (updatedMat: Material) => {
    setMaterials((prev) => prev.map((m) => (m.id === updatedMat.id ? updatedMat : m)));
  };

  const addMaterial = (newMatData: Omit<Material, 'id'>) => {
    const newMat: Material = {
      ...newMatData,
      id: `mat-${Date.now()}`,
    };
    setMaterials((prev) => [...prev, newMat]);
  };

  const updateSupplier = (updatedSup: Supplier) => {
    setSuppliers((prev) => prev.map((s) => (s.id === updatedSup.id ? updatedSup : s)));
  };

  const addSupplier = (newSupData: Omit<Supplier, 'id'>): Supplier => {
    const newSup: Supplier = {
      ...newSupData,
      id: `sup-${Date.now()}`,
    };
    setSuppliers((prev) => [newSup, ...prev]);
    return newSup;
  };

  const adjustCashRegister = (data: Partial<CashRegister>) => {
    setCurrentCashRegister((prev) => {
      const merged = { ...prev, ...data };
      const expected =
        merged.initialCash +
        merged.totalCashSales +
        merged.cashReplenishments -
        merged.totalCashPurchases;
      return {
        ...merged,
        expectedBalance: Number(expected.toFixed(2)),
        difference: Number((merged.countedCash - expected).toFixed(2)),
      };
    });
  };

  const closeCurrentShift = (countedCash: number, closingNotes: string) => {
    setCurrentCashRegister((prev) => {
      const expected = prev.initialCash + prev.totalCashSales + prev.cashReplenishments - prev.totalCashPurchases;
      const diff = countedCash - expected;
      return {
        ...prev,
        countedCash,
        expectedBalance: Number(expected.toFixed(2)),
        difference: Number(diff.toFixed(2)),
        status: 'Cerrada',
        closedAt: new Date().toISOString(),
        notes: closingNotes,
      };
    });
  };

  const openNewShift = (initialCash: number, operatorName: string, shift: 'Matutino' | 'Vespertino' | 'Completo') => {
    const newRegister: CashRegister = {
      id: `caja-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      shift,
      operatorName,
      initialCash,
      totalCashPurchases: 0,
      totalCashSales: 0,
      cashReplenishments: 0,
      expectedBalance: initialCash,
      countedCash: initialCash,
      difference: 0,
      status: 'Abierta',
      openedAt: new Date().toISOString(),
      notes: `Apertura de turno ${shift}`,
    };
    setCurrentCashRegister(newRegister);
  };

  // Virtual Scale controls
  const setScaleWeight = (weight: number) => {
    setScaleReading((prev) => ({
      ...prev,
      weightKg: Math.max(0, Math.round(weight)),
      isStable: true,
      lastReadingTime: new Date().toLocaleTimeString(),
    }));
  };

  const toggleScaleStable = () => {
    setScaleReading((prev) => ({
      ...prev,
      isStable: !prev.isStable,
    }));
  };

  const zeroScale = () => {
    setScaleReading((prev) => ({
      ...prev,
      weightKg: 0,
      isStable: true,
      lastReadingTime: new Date().toLocaleTimeString(),
    }));
  };

  const tareScale = () => {
    setScaleReading((prev) => ({
      ...prev,
      mode: prev.mode === 'Tara' ? 'Bruto' : 'Tara',
    }));
  };

  const simulateVehicleWeight = (vehicleType: 'Camioneta' | 'Camión 3.5' | 'Torton' | 'Tráiler' | 'Triciclo' | 'Piso') => {
    let base = 0;
    switch (vehicleType) {
      case 'Triciclo':
        base = 80 + Math.floor(Math.random() * 90);
        break;
      case 'Piso':
        base = 25 + Math.floor(Math.random() * 45);
        break;
      case 'Camioneta':
        base = 2600 + Math.floor(Math.random() * 850);
        break;
      case 'Camión 3.5':
        base = 5400 + Math.floor(Math.random() * 1600);
        break;
      case 'Torton':
        base = 15800 + Math.floor(Math.random() * 3200);
        break;
      case 'Tráiler':
        base = 32500 + Math.floor(Math.random() * 5000);
        break;
    }
    setScaleWeight(base);
  };

  const unsyncedCount =
    purchaseTickets.filter((t) => t.offlineCreated).length +
    salesOrders.filter((s) => s.offlineCreated).length;

  const syncOfflineQueue = () => {
    setPurchaseTickets((prev) => prev.map((t) => ({ ...t, offlineCreated: false })));
    setSalesOrders((prev) => prev.map((s) => ({ ...s, offlineCreated: false })));
  };

  const resetAllDemoData = () => {
    setMaterials(INITIAL_MATERIALS);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseTickets(INITIAL_PURCHASES);
    setSalesOrders(INITIAL_SALES);
    setYardProcesses(INITIAL_PROCESSES);
    setCurrentCashRegister(INITIAL_CASH_REGISTER);
    localStorage.clear();
  };

  return (
    <RecicladoraContext.Provider
      value={{
        materials,
        suppliers,
        purchaseTickets,
        salesOrders,
        yardProcesses,
        currentCashRegister,
        scaleReading,
        unsyncedCount,
        addPurchaseTicket,
        createSalesOrder,
        addYardProcess,
        updateMaterial,
        addMaterial,
        updateSupplier,
        addSupplier,
        adjustCashRegister,
        closeCurrentShift,
        openNewShift,
        setScaleWeight,
        toggleScaleStable,
        zeroScale,
        tareScale,
        simulateVehicleWeight,
        syncOfflineQueue,
        resetAllDemoData,
      }}
    >
      {children}
    </RecicladoraContext.Provider>
  );
};

export const useRecicladora = () => {
  const context = useContext(RecicladoraContext);
  if (!context) {
    throw new Error('useRecicladora must be used within a RecicladoraProvider');
  }
  return context;
};
