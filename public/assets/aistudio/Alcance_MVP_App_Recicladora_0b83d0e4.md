**ESPECIFICACIÓN DE REQUERIMIENTOS DE SOFTWARE**

**Documento de Definición de Alcance del MVP  
Sistema de Gestión para Empresa Recicladora**

_Control de Compras en Báscula, Clasificación de Materiales, Inventario de Patio y Mermas_

# **1\. Visión General del Producto**

El presente sistema tiene como propósito digitalizar y optimizar la operación integral de una planta recicladora y centro de acopio de materiales (metales, plásticos, cartón, papel, vidrio y residuos industriales). La plataforma conecta el proceso de pesaje y compra en báscula, la categorización de materiales, la deducción por mermas/impurezas, la consolidación de stock en patio y la posterior venta a clientes mayoristas o fundidoras.  
<br/>El software está concebido para funcionar tanto en computadoras de escritorio (en caseta de báscula y administración) como en dispositivos móviles/tablets para personal de patio y choferes de recolección.

**PROPÓSITO DEL MVP:** Garantizar la transparencia en la compra en báscula, evitar pérdidas por clasificación incorrecta de materiales, controlar las mermas por humedad/impurezas y proporcionar un balance preciso de flujo de efectivo e inventario disponible en tiempo real.

# **2\. Módulos Prioritarios para el MVP**

## **Módulo 1: Catálogo de Materiales y Tarifario Dinámico**

Gestión centralizada de los materiales aceptados y sus precios actualizables según fluctuaciones del mercado.

- **Categorización de Materiales:** Clasificación jerárquica (Ej: Metales Ferrosos, Metales No Ferrosos, Plásticos PET/HDPE, Cartón/Papel, Electrónicos).
- **Precios de Compra y Venta:** Definición de tarifas por kilogramo o tonelada para proveedores estándar, preferenciales y clientes finales.
- **Márgenes y Alertas de Variación:** Visualización del margen de ganancia estimado entre el precio de acopio y el precio de venta mayorista.

## **Módulo 2: Pesaje y Punto de Compra en Báscula (Entradas)**

Módulo central para la recepción física de materiales traídos por recolección o proveedores independientes.

- **Captura de Pesaje (Bruto / Tara / Neto):** Registro de peso inicial de vehículo/contenedor, peso vacío y cálculo automático del peso neto.
- **Descuento por Mermas e Impurezas:** Aplicación de porcentaje o kg de descuento por suciedad, humedad o material no reciclable presente.
- **Emisión de Ticket de Compra:** Generación instantánea de comprobante de compra con desglose de material, peso neto, precio unitario y total.
- **Liquidación al Proveedor:** Registro de pago inmediato en efectivo, cheque o transferencia bancaria.

## **Módulo 3: Control de Inventario de Patio y Procesamiento**

Seguimiento del volumen de material almacenado en planta y su transformación.

- **Existencias en Patio (Stock Real):** Visualización en tiempo real del tonelaje acumulado por tipo y grado de material.
- **Registro de Procesamiento / Compactación:** Conversión de material a granel en pacas, lingotes o triturado, actualizando el estado del inventario.
- **Ajustes por Mermas Operativas:** Registro de pérdidas por volatilización, limpieza o desperdicio final procesado.

## **Módulo 4: Venta de Material Procesado y Salidas Mayoristas**

Gestión de despachos hacia fundidoras, exportadores o clientes finales.

- **Órdenes de Venta y Embarque:** Creación de notas de remisión para salida de tráileres o contenedores de material procesado.
- **Pesaje de Salida:** Verificación en báscula del peso bruto y tara de las unidades de transporte de clientes.
- **Facturación y Registro de Ingresos:** Contabilización de los ingresos por venta masiva de reciclables.

## **Módulo 5: Control de Caja, Flujo de Efectivo y Reportes**

Asegura el control financiero de los fondos operados en la caseta de compra.

- **Fondo de Compras y Arqueo:** Asignación de efectivo inicial a báscula para pago a recolectores y cierre de turno con conciliación.
- **Reportes de Rendimiento:** Indicadores de volumen comprado vs. vendido, material más rentable y balance diario neto de flujo de caja.

# **3\. Flujo de Trabajo Operativo Diario**

**1\. Apertura de Caseta y Asignación de Fondo**

El operador de báscula inicia sesión y recibe el fondo de caja destinado al pago de compras en efectivo del día.

**2\. Recepción de Vehículo / Proveedor en Báscula**

Llega el vehículo con material. Se registra el Proveedor, el Peso Bruto (vehículo lleno) y se clasifica el material por tipo/subtipo.

**3\. Inspección, Descuento y Pesaje Neto**

El personal de patio inspecciona la carga. Se registra la Tara (vehículo vacío) y se aplica el porcentaje de merma/impurezas si aplica.

**4\. Liquidación y Comprobante**

El sistema calcula el Pago Neto. Se imprime el ticket de compra y se efectúa el pago (Efectivo/Transferencia). El stock del material se incrementa en automático.

**5\. Despacho Mayorista (Salida de Venta)**

Para la venta a fundidoras, se pesa el tráiler de salida, se descuenta el stock de patio y se registra la remisión e ingreso de fondos.

**6\. Cierre de Turno y Arqueo Financiero**

Al final del día, se efectúa la conciliación del efectivo pagado en báscula contra los tickets emitidos y el balance de inventario actualizado.

# **4\. Estructura de Datos Básica (Entidades Principales)**

A continuación se detallan las entidades requeridas en la base de datos para dar soporte a la operación:

| **Entidad**                 | **Atributos / Campos Clave**                                                                               | **Descripción / Propósito**                           |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Material**                | ID, Nombre, Categoria, Precio_Compra_Kg, Precio_Venta_Kg, Stock_Kg, Tolerancia_Merma                       | Catálogo de materiales reciclables y tarifas.         |
| **Proveedor**               | ID, Nombre_RazonSocial, Tipo (Recolector/Empresa), RFC_Identificacion, Telefono, Historial_Compras         | Registro de vendedores de material a la planta.       |
| **Ticket_Compra (Entrada)** | ID, Fecha_Hora, Proveedor_ID, Operador_ID, Peso_Bruto, Tara, Merma_Kg, Peso_Neto, Total_Pagar, Estado_Pago | Registro de pesaje y liquidación de acopio.           |
| **Detalle_Compra**          | ID, Ticket_ID, Material_ID, Peso_Kg, Precio_Unitario, Subtotal                                             | Desglose por tipo de material contenido en el pesaje. |
| **Orden_Venta (Salida)**    | ID, Fecha, Cliente_ID, Peso_Salida_Kg, Total_Venta, Factura_Ref, Estado                                    | Despacho mayorista a fundidoras/compradores final.    |
| **Arqueo_Caja**             | ID, Fecha, Operador_ID, Fondo_Inicial, Total_Efectivo_Pagado, Balance_Calculado, Diferencia                | Conciliación financiera de caseta de báscula.         |

# **5\. Consideraciones Técnicas e Integraciones Futuras**

- **Integración con Básculas Electrónicas (Indicadores de Peso):** En etapas posteriores o fase 2, el software podrá conectarse mediante puerto serie (RS232) o TCP/IP para capturar automáticamente el peso sin intervención manual del operador, previniendo manipulaciones.
- **Modo Fuera de Línea (Offline) para Choferes:** Si se emplean unidades de recolección en campo, la aplicación móvil debe contar con almacenamiento local para guardar registros de compra y sincronizarlos al retornar a planta.
- **Impresión Térmica Móvil / Fija:** Soporte para miniprinters de 80mm en caseta de báscula para emisión de tickets físicos con código QR de verificación.