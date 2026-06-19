# Sistema de reportes global 
El sistema consta de varios archivos desordenados de excel en el cual se rellena la informacion y se pasa a otras hojas adicionales de excel, este sistema fue creado con anterioridad y no es muy optimo ya que esta manejado por formulas y la mayoria de campos no los utiliza y el sistema de correccion de errores es muy malo al equivocarse una vez la mayoria de datos se pierden e aqui algunos de los problemas principales 
## Problemas
### Manejo manual 
El sistema incluye mucho manejo por parte del usuario podria decirse que es totalmente dependiente del usuario, el acomodamiento de celdas, el uso de formulas, la creacion de un nuevo reporte, el acomodo de llenado de datos y demas
### Variacion en montos finales 
En el sistema los reportes no son diarios y muchas veces pueden cometer errores que podrian llegar a alterar la mayor parte del sistema ya que este esta basado en formulas y cualquier error puede desconfigurar toda la celda 
### Manejo manual en datos que son repetibles 
Algunos datos dentro del sistema son repetibles de otra parte pero de todas formas el usuario debe llenarlos manualmente estos datos podria decirse que se deberian mantener fijos al momento de hacer reportes o por lo menos ser seleccionables y mas faciles de llenar 
### Verificacion general fisica 
La verificacion de los datos ingresados se hace de manera fisica y para algun error pasado o algo por el estilo la verificacion es muy tediosa al tener que revisar tantos papeles para encontrar un error y la mayoria de veces al momento de corregirlo son varios datos que se deben cambiar
### Falta de entrega de reportes diario 
Los reportes supuestamente se deberian entregar diariamente pero este no siempre es el caso, aveces los reportes llegan 2 o 3 dias despues incluso pueden llegar a tardar mas 
### Mejorar el sistema de reportes 
Su sistema de reportes esta muy mal optimizado esta todo hecho a base de formulas por lo que al momento de tener algun error accidental una gran parte del sistema termina desconfigurandose o lanzando errores y al momento de corregirlo es muy tedioso 
### Los datos no coiciden 
La mayoria de veces se nos muestra que los datos entregados no coinciden con el dato final llamado "Global" y a causa de esto se debe de revisar dia por dia cada reporte hasta encontrar en donde esta erroneo 
### Variacion de precios 
Los precios de los productos van variando constantemente y en el sistema de reportes afecta a los nuevos que van a salir
### Errores frecuentes al momento de dar reportes 
Los encargados de las distintas areas suelen equivocarse al momento de dar sus reportes, ya sea en los calculos o se les va algun dato, con esto el encargado del sistema debe estar yendo a preguntar fisicamente que paso
## Posibles soluciones
### Pequeña base de datos 
Una base de datos termporal que incluya los datos repetibles o que se seleccionen mas automaticamente como ser (clientes, titulos)
### Edicion de datos 
Como el sistema esta hecho por formulas muchas veces al editar un dato se hace un lio entero, seria mas conveniente que los datos se editen y no se haga tanto lio al momento de sacar los reportes finales 
### Apartado especial para conclusiones finales 
Un apartado que tenga un resumen general de todo lo que se esta ingresando en tiempo real para la verificacion de datos o directamente para sacar el reporte final 
### Formulas automatizadas 
Al momento de llenar los datos hay algunas formulas como sumas y multiplicaciones que cambian que cambian dependiendo al tipo de dato que se este manejando como ser: Al momento de manejar bolsas, conos/ovillos sueltos, clientes, titulos o tipos de material 
### Hoja de reporte actualizada 
Que la hoja de reportes que se maneja se llene en tiempo real y ya no tener que estar acomodando todo manualmente 
## Funcionamiento del sistema de reportes/base de datos 
El sistema tiene muchos archivos aparte , que en cierta forma llegan a estar ordenados pero no del todo, estas se dividen en varias secciones que acontinuacion van a ser detalladas:
### MP (Materia prima)
En este apartado se hace el llenado de la diferente materia prima que llega constantemente almacenando datos de los camiones, cuanta materia prima traen, precios y demas 
#### Estructura 
El primer apartado consta de consta de 8 celdas 
* Celda N1 "Fecha"
* Celda N2 Ingreso "N/E": 
Es el ingreso del tipo de materia prima que se esta ingresando y la cantidad en fardos
* Celda N3 Ingreso "N/E":
Es el ingreso en Kilos de cada camion
* Celda N4 Salida "N/E":
Son las salidas diarias que se tienen en fardos 
* Celda N5 Salida "N/E":
Son las salidas diarias en Kilos que se tiene de cada camion 
* Celda N6 Entega "N/E":
Son los datos Fardos 
* Celda N7 Stock "N/E":
Es el stock de una fila anterior sumando con los ingresos y restado con las salidas este es el resultado de stock en kilos
* Celda N8 Stock "N/E":
Esta es la misma formula solamente que esta llenado en cantidad de fardos 
#### Problemas
El sistema cuenta con varias falencias en cuanto a su estructura, como ser celdas sin especificar, copia y pega de reportes que en muchos casos no se llegan a copiar con el formato requerido y mucho desorden
#### Posible solucion 
El sistema puede ser optimizado y ordenado y las formulas corregidas, el problema principal seria en la generacion de nuevas tablas para llenar 
### PROD (Produccion)
En este apartado se añade todo lo que se produce con reportes diarios con una interfaz mucho mas ordenada pero eso no quiere decir que sea perfecta el problema con las formulas tambien es un inconveniente se tiene que arrastrar manualmente las celdas que se requieren para los diferentes calculos 
#### Estructura
La estructura de esta base de datos esta mucho mas ordenada consta de principalmente para el llenado de datos de 16 celdas:
* Celda N1 Fecha:
* Celda N2 Pasaje:
* Celda N3 Preparacion:
* Celda N4 Continuas: 
* Celda N5 Bobinado:
* Celda N6 Acoplado: 
* Celda N7 Retorcido:
* Celda N8 Madejeado:
* Celda N9 Tintoreria: 
* Celda N10 Secado: 
* Celda N11 Devanado: 
* Celda N12 Embolsado: 
* Celda N13 Ovillado:
* Celda N14 Almacen IND (Industrial): 
* Celda N15 Almacen OV (Ovillado)
* Celda N16 N/E: 
Es la suma total de "Almacen IND" Y "Almacen ov"

Asi mismo cuenta con unas celdas para hacer un pequeño reporte mensual/anual de 8 celdas:
* Celda N17 N/E:
Es la suma mensual de "Almacen IND" 
* Celda N18 N/E:
Es la suma mensula de "Almacen OV" 
* Celda N19 N/E: 
Es la suma mensual de la suma total de "Almacen IND" Y " Almacen OV"
* Celda N20 N/E:
Es una celda de verificacion vinculada con la hoja de reportes el resultado debe ser "0,00" para indicar que los datos coinciden 
* Celda N21 N/E:
Es la celda que suma todos los reportes de "Almacen IND" anualmente
* Celda N22 N/E: 
Es la celda que suma todos los reportes de "Almacen OV" anualmente 
* Celda N23 N/E:
Es la celda que suma los reportes anuales de "Almacen IND" Y "Almacen OV"
* Celda N24 N/E:
Es la celda verificadora que esta conectada con la hoja de reportes
#### Problemas 
Problema con la interfaz, existe un apartado que se debe copiar, pegar y redireccionar mensualmente que a pesar de no ser tedioso, sigue siendo un problema 
#### Posibles soluciones
Un apartado automatico para cada reporte mensual y de gestion 
### VNT.fabrica (Ventas de fabrica)
Podria decirse que es el apartado mas ordenado el cual incluye las ventas diarias de los diferentes productos con detalles especificos 
#### Estructura 
La estructura cuenta con varias celdas ordenadas, cuenta con 10 celdas: 
* Celda N1 N/E:
Fecha 
* Celda N2 N/E: 
Esta celda se usa para el orden del numero de nota el cual es un numero de factura de la misma empresa
* Celda N3 N/E: 
Es la cantidad de titulos distintos en un mismo numero de nota por ejemplo si esta el titulo 2/32 y 2/18 en una misma venta esta casilla sirve para separarlos 
* Celda N4 N/E: 
Cliente
* Celda N5 N/E:
Titulo del producto que se esta vendiendo
* Celda N6 N/E:
Cantidad de bolsas del producto
* Celda N7 N/E: 
Cantidad de conos/ovillos sueltos vendidos
* Celda N8 N/E:
Cantidad de kilos total (Este apartado varia en su conversion dependiendo del titulo)
* Celda N9 N/E: 
Es el precio unitario del producto que se va a vender (El precio varia en base al titulo)
* Celda N10 N/E:
Es el precio por kilos del producto que se va a vender (El precio varia en base al titulo)
#### Problemas 
El apartado es sencillo de no ser por que las formulas en base a los titulos se ajustan manualmente y muchas veces se olvida de eso y causas muchas veces incoherencia en los datos finales 
#### Posibles soluciones
Ajustar la hoja para que las formulas automaticamente se adapten a el numero de titulo correspondiente 