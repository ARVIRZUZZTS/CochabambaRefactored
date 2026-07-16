create table viajeBodega (
  viajeCod varchar(25) primary key,
  placa varchar(10),
  fecha date
  --estado varchar(1)
);

create table encomiendaBodega (
  conEnc varchar(20) primary key,
  viajeCod varchar(25),
  consignatario varchar(100),
  conTelf varchar(15),
  total int,
  bulto text,
  estadoPaga varchar(1)
)
