SELECT * FROM `encomienda` WHERE `conEnc`='1-YCB'
UPDATE `encomienda` SET `estadoPaga`='1' WHERE `conEnc`='1-YCB'
-- CHOFER
-- eliminar CHOFER
---------------------------------------------
-- ENCOMIENDA
-- añadimos priT segT destino
-- elimino entregadoPor entregado
---------------------------------------------
-- FLOTA  ----------------------------------- revisar el autoincrement
-- creamos flota ----------------------------
-- añadimos sus datos ----------------------- 
---------------------------------------------
-- PLACA
-- eliminat PLACA
---------------------------------------------
-- PROPIETARIO
-- eliminar PROPIETARIO
---------------------------------------------
-- VIAJE x-----------------------------------
-- mantener x--------------------------------
---------------------------------------------
-- ZONAS  x---------------------------------- revsar el auto increment
-- Añadir zonas   x--------------------------
---------------------------------------------
CREATE TABLE `encomienda` (
  `conEnc` varchar(20) NOT NULL,
  `codeViaje` varchar(25) DEFAULT NULL,
  `remitente` varchar(100) DEFAULT NULL,
  `remTelf` varchar(15) DEFAULT NULL,
  `consignatario` varchar(100) DEFAULT NULL,
  `conTelf` varchar(15) DEFAULT '0',
  `priT` int(11) NOT NULL,
  `segT` int(11) NOT NULL,
  `total` int(7) DEFAULT NULL,
  `bulto` varchar(500) DEFAULT NULL,
  `valDeclarado` varchar(2) DEFAULT NULL,
  `estadoPaga` varchar(2) DEFAULT NULL,
  `fecha` varchar(10) DEFAULT NULL,
  `origen` varchar(20) DEFAULT NULL,
  `destino` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

----------FLOTA----------
CREATE TABLE `flota` (
  `placa` varchar(10) NOT NULL,
  `propietario` varchar(100) DEFAULT NULL,
  `chofer` varchar(100) DEFAULT NULL,
  `licencia` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
INSERT INTO `flota` (`placa`, `propietario`, `chofer`, `licencia`) VALUES
('1194-UKE', 'ERICK MENDOZA', 'ERICK MENDOZA MONTESINOS', '6472193'),
('1461-KUX', 'VIVIAN CABALLERO', 'WILSON LAZARTE MONTAÑO', '8691695'),
('1580-EYR', 'JUAN QUISPE LLAMPA', 'JUAN QUISPE LLAMPAS', '4321568'),
('1800-FIU', 'MIGUELINA PEREDO', 'MARIO CRUZ LACATO', '7995969'),
('1803-BNE', 'CARMEN VELASCO', '-', '0'),
('2130-YXG', 'JHONNY VARGAS', 'JHONNY VARGAS', '6053938'),
('2264-KGD', 'VICTOR HUGO VELASCO', 'VICTOR HUGO VELASCO CAERO', '4403658'),
('2447-CPE', 'ELOY TERCEROS', 'ELOY TERCEROS MONTAÑO', '4512727'),
('2447-DKT', 'RICHAR IRUSTA', 'RICHAR IRUSTA JIMENEZ', '4560090'),
('2494-RXU', 'JHONNY CABALLERO', 'CALIXTO ANDIA QUINTEROS', '2951649'),
('2537-DER', 'REINALDO ALBERTO', 'REINALDO JORGE OCZACHOQUE', '3531243'),
('2550-TFU', 'RUTH CABALLERO', 'DEMETRIO GALINDO MERIDA', '4438619'),
('2701-YNF', 'JHONNY CABALLERO', 'ARCENIO CABALLERO V.', '3567742'),
('2830-UTA', 'JHONNY CABALLERO', 'ARIEL VARGAS VALLEJOS', '7939232'),
('2996-UKF', 'JHONNY CABALLERO', 'JHONNY VARGAS HERBAS', '3780185'),
('3056-EAY', 'JHONNY CABALLERO', 'HUGO GABRIEL RASGUIDO', '8036400');

----------USUARIOS----------
CREATE TABLE `usuarios` (
  `usCod` int(11) NOT NULL,
  `user` varchar(20) DEFAULT NULL,
  `cont` varchar(300) DEFAULT NULL,
  `zona` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
INSERT INTO `usuarios` (`usCod`, `user`, `cont`, `zona`) VALUES
(1, 'cbba', '$2y$10$NKJGwIvgXs3/RFpK8bpFz.0FdsxbizOQsOy89G.Spvs3QojedmCim', 'Cochabamba'),
(2, 'scz', '$2y$10$qmMWzshRAKvECuXxoO5bi.2CvMkCElrulwNnDGHHDpHpqt.r5/pe6', 'Santa Cruz'),
(3, 'mon', '$2y$10$mW9Oxvhi7Xkfap0LhaPBLeVN0/veqZXlPpiUns6KDNRTvucEnYT0e', 'Montero'),
(4, 'yac', '$2y$10$TY4ikr8loFhX1l7uwobEWOKV7arwrKXOI1/hd3nfMcIkHpjzNPk9u', 'Yacuiba'),
(5, 'david', '$2y$10$lA5DAcGz98yTv6zBa5PTKeXxVqvz6o3nGtaa9X1uDx1i.HBAd1A9W', 'Montero'),
(12, 'joao', '$2y$10$ZG2vUfcgZuWg6bPYCyF19OaYaFL7K5q63pMrNVCQGBNCtszHLfUEu', 'Santa Cruz');

----------VIAJE----------
CREATE TABLE `viaje` (
  `viajeCod` varchar(25) NOT NULL,
  `propietario` varchar(100) DEFAULT NULL,
  `chofer` varchar(100) DEFAULT NULL,
  `ayudante` varchar(100) DEFAULT NULL,
  `placa` varchar(10) DEFAULT NULL,
  `origen` varchar(20) DEFAULT NULL,
  `destino` varchar(20) DEFAULT NULL,
  `fecha` varchar(10) DEFAULT NULL,
  `hora` varchar(5) DEFAULT NULL,
  `estadoImp` varchar(2) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

----------ZONAS----------
CREATE TABLE `zonas` (
  `nombreZona` varchar(50) NOT NULL,
  `abrev` varchar(4) DEFAULT NULL,
  `informacion` varchar(300) NOT NULL,
  `telefono` varchar(100) NOT NULL,
  `prioridad` int(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
INSERT INTO `zonas` (`nombreZona`, `abrev`, `informacion`, `telefono`, `prioridad`) VALUES
('Cochabamba', 'CBBA', 'Av. Ayacucho S/N Sudoeste Edif Terminal de Buses Bodega N° 6', '73794391', 0),
('La Paz', 'LP', 'CALLE LA PAZA aaaa', '123456', 0),
('Montero', 'MON', 'C. Brasil N° 9 Noroeste Edif Terminal Bimodal Bodega N° 7 - Montero', '73606700', 2),
('Santa Cruz', 'SCZ', 'C. Brasil N° 9 Noroeste Edif Terminal Bimodal Bodega N° 7', '73606700', 1),
('Yacuiba', 'YCB', 'C. Brasil N° 9 Noroeste Edif Terminal Bimodal Bodega N° 7 - Yacuiba', '73606700', 3);