Puntos fuertes de la reunion 
* Producto terminado - Entregado - Stock
* Produccion de ovillado - Embolsado y su respectivo producto terminado 
* Producto recuperado/Producto defectuoso - Stock 'desorden de producto defectuoso'
* Ingresos - Stock entregado a planta/Entregado a almacen *Colorante y auxiliares
                                                          *Etiquetas
                                                          *Bolsas
* Informe detallado de tintoreria 
* Facturas de suministros 
* Salidas de producto terminado - ventas 
* Lotes
* Notas (Sistema de facturas propias de la empresa) 'Revisar y optimizar'
* Clientes

### SISTEMA SIC JAC 1

REPORTES 
Los reportes estan estructurados por 7 secciones:
* Codigo 
Es el numero de item asignado 
* Descripcion 
Informacion detallada acerca de la categoria/sub categoria/item dependiendo del tipo de reporte solicitado
* Unidad 
La unidad de medida usada para el producto (Kilos, litros o  Bolivianos dependiendo del tipo de item manejado)
* Saldo (Un dia anterior al inicio del reporte)
Es todo el stock almacenado antes de la fecha inicio del reporte, consta de dos partes.
Cantidad:
Indica la cantidad almacenada del producto en kilos 
Valor:
Es el precio general del lote expresado en Bolivianos 
* Entrada 
Son todos los productos añadidos a la fecha desde la fecha inicio del reporte que consta igual de la cantidad y el valor 
* Salida 
Son los productos vendidos hasta la ultima fecha del reporte que consta igual de la cantidad y el valor del lote en general 
* Saldos 
Es el Stock al ultimo dia del reporte, los preductos que sobraron o no se vendieron 
Formula 
(Saldo (Un dia anterior al inicio del reporte) + Entrada) - Salidas = Saldos
Los reportes estan divididos en tres categorias:
Categoria 
Es el reporte mas general posible que abarca muy poco detalle ej: 'Lanas'
Sub categorias
Es el reporte un poco mas detallado que incluye las categorias dentro de 'Lanas' ej: 'Lanas sauves' 'Lanas especiales' etc
Item
Es el reporte mas detallado generado el cual incluye y se centra en cada item vendido divido en categoria sub categoria y dando informacion del item en especifico ej: 'Lana verde' 'Lana roja'
ENTRADAS
En el apartado de entradas es en donde se hace la añadidura del producto en base al Stock:
* Numero de lote
* Un numero de entrada (Generada por sistema)
* Una descripcion del item (Mayormente nombre del producto especifico)
* La fecha en la que el producto fue ingresado
* Numero de nota (Numero de facturacion)
* Fuente (De donde proviene el producto)
* Proveedor (Illampu Textiles (Fijo))
* Concepto (Depende si el producto esta ingresando recien o es una devolucion)
* Autorizado por (El nombre del responsable(Ing. Bernardo))
* Entregado a (Einard Lopez (Fijo))
INGRESO
En el apartado de ingresos se hace la añadidura de un nuevo item:
* Codigo (El numero de lote ej:01-26-47 (El primer numero es el numero de camion del distribuidor, el segundo numero es la gestion, el tercer numero es el numero de ingreso))
* Categoria (Es a la categoria a la que pertenece el item ej: repuesto o lana)
* Sub Categoria (tipos de titulo, recuperado)
* Descripcion (Es el item en especifo si es lana por ej: 'lana roja' 'lana verde' si es pieza: 'correa' 'tornillo')
* Unidad 
Se refiere a la unidad de medida (Kilos, Litros o  )