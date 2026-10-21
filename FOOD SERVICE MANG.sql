-- Base de datos Food Service Mang
-- PostgreSQL 18

BEGIN;

-- Catálogos

CREATE TABLE rol (
    id_rol SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE area_preparacion (
    id_area SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE categoria_producto (
    id_categoria SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE metodo_pago (
    id_metodo SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
);


-- Usuarios

CREATE TABLE usuario (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_rol SMALLINT NOT NULL REFERENCES rol(id_rol),
    nombre VARCHAR(80) NOT NULL,
    username VARCHAR(40) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Productos del menú

CREATE TABLE producto (
    id_producto INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_categoria SMALLINT NOT NULL
        REFERENCES categoria_producto(id_categoria),
    id_area SMALLINT NOT NULL
        REFERENCES area_preparacion(id_area),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_url VARCHAR(255),
    precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Inventario

CREATE TABLE insumo (
    id_insumo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    unidad_medida VARCHAR(10) NOT NULL,
    stock_actual NUMERIC(12,3) NOT NULL DEFAULT 0
        CHECK (stock_actual >= 0),
    stock_minimo NUMERIC(12,3) NOT NULL DEFAULT 0
        CHECK (stock_minimo >= 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Relaciona los productos con los insumos que utilizan

CREATE TABLE receta (
    id_producto INTEGER NOT NULL
        REFERENCES producto(id_producto) ON DELETE CASCADE,
    id_insumo INTEGER NOT NULL
        REFERENCES insumo(id_insumo),
    cantidad_por_porcion NUMERIC(12,3) NOT NULL
        CHECK (cantidad_por_porcion > 0),
    PRIMARY KEY (id_producto, id_insumo)
);

CREATE TABLE movimiento_inventario (
    id_movimiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_insumo INTEGER NOT NULL REFERENCES insumo(id_insumo),
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
    tipo VARCHAR(10) NOT NULL
        CHECK (tipo IN ('entrada', 'salida', 'ajuste', 'merma')),
    cantidad NUMERIC(12,3) NOT NULL CHECK (cantidad <> 0),
    motivo VARCHAR(200),
    fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Mesas

CREATE TABLE mesa (
    id_mesa SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero SMALLINT NOT NULL UNIQUE CHECK (numero > 0),
    capacidad SMALLINT NOT NULL DEFAULT 4
        CHECK (capacidad > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'libre'
        CHECK (estado IN (
            'libre',
            'ocupada',
            'pide_cuenta',
            'por_limpiar'
        )),
    activa BOOLEAN NOT NULL DEFAULT TRUE
);


-- Turnos de caja

CREATE TABLE turno (
    id_turno INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
    apertura TIMESTAMPTZ NOT NULL DEFAULT now(),
    cierre TIMESTAMPTZ,
    fondo_inicial NUMERIC(10,2) NOT NULL DEFAULT 0
        CHECK (fondo_inicial >= 0),
    estado VARCHAR(10) NOT NULL DEFAULT 'abierto'
        CHECK (estado IN ('abierto', 'cerrado')),
    CHECK (cierre IS NULL OR cierre >= apertura)
);

CREATE UNIQUE INDEX ux_un_turno_abierto
ON turno (estado)
WHERE estado = 'abierto';


-- Comandas

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE comanda (
    id_comanda UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_mesa SMALLINT NOT NULL REFERENCES mesa(id_mesa),
    id_mesero INTEGER NOT NULL REFERENCES usuario(id_usuario),
    id_turno INTEGER REFERENCES turno(id_turno),
    num_comensales SMALLINT CHECK (num_comensales > 0),
    estado VARCHAR(15) NOT NULL DEFAULT 'abierta'
        CHECK (estado IN (
            'abierta',
            'enviada',
            'pide_cuenta',
            'pagada',
            'cancelada'
        )),
    iva_tasa NUMERIC(5,2) NOT NULL DEFAULT 16.00
        CHECK (iva_tasa >= 0),
    descuento NUMERIC(10,2) NOT NULL DEFAULT 0
        CHECK (descuento >= 0),
    propina NUMERIC(10,2) NOT NULL DEFAULT 0
        CHECK (propina >= 0),
    creada_en TIMESTAMPTZ NOT NULL DEFAULT now(),
    cerrada_en TIMESTAMPTZ,
    sincronizada_en TIMESTAMPTZ
);

CREATE TABLE detalle_comanda (
    id_detalle UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_comanda UUID NOT NULL
        REFERENCES comanda(id_comanda) ON DELETE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES producto(id_producto),
    cantidad SMALLINT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL
        CHECK (precio_unitario >= 0),
    notas VARCHAR(200),
    estado VARCHAR(15) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN (
            'pendiente',
            'preparando',
            'listo',
            'entregado',
            'cancelado'
        )),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Pagos

CREATE TABLE pago (
    id_pago UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_comanda UUID NOT NULL REFERENCES comanda(id_comanda),
    id_metodo SMALLINT NOT NULL REFERENCES metodo_pago(id_metodo),
    id_cajero INTEGER NOT NULL REFERENCES usuario(id_usuario),
    id_turno INTEGER NOT NULL REFERENCES turno(id_turno),
    monto NUMERIC(10,2) NOT NULL CHECK (monto > 0),
    monto_recibido NUMERIC(10,2)
        CHECK (monto_recibido IS NULL OR monto_recibido >= monto),
    referencia VARCHAR(60),
    pagado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cierre_caja (
    id_turno INTEGER NOT NULL REFERENCES turno(id_turno),
    id_metodo SMALLINT NOT NULL REFERENCES metodo_pago(id_metodo),
    monto_esperado NUMERIC(10,2) NOT NULL,
    monto_real NUMERIC(10,2) NOT NULL,
    diferencia NUMERIC(10,2)
        GENERATED ALWAYS AS (monto_real - monto_esperado) STORED,
    PRIMARY KEY (id_turno, id_metodo)
);


-- Índices

CREATE INDEX ix_comanda_mesa_estado
ON comanda (id_mesa, estado);

CREATE INDEX ix_comanda_sync
ON comanda (sincronizada_en)
WHERE sincronizada_en IS NULL;

CREATE INDEX ix_detalle_comanda
ON detalle_comanda (id_comanda);

CREATE INDEX ix_detalle_estado
ON detalle_comanda (estado)
WHERE estado IN ('pendiente', 'preparando');

CREATE INDEX ix_pago_comanda
ON pago (id_comanda);

CREATE INDEX ix_pago_turno
ON pago (id_turno);

CREATE INDEX ix_producto_categoria
ON producto (id_categoria);

CREATE INDEX ix_producto_area
ON producto (id_area);

CREATE INDEX ix_mov_insumo_fecha
ON movimiento_inventario (id_insumo, fecha);


-- Vista para consultar el total de una comanda

CREATE VIEW v_cuenta AS
SELECT
    c.id_comanda,
    c.id_mesa,
    SUM(d.cantidad * d.precio_unitario) AS subtotal_con_iva,
    ROUND(
        SUM(d.cantidad * d.precio_unitario)
        * c.iva_tasa / (100 + c.iva_tasa),
        2
    ) AS iva_incluido,
    c.descuento,
    c.propina,
    SUM(d.cantidad * d.precio_unitario)
        - c.descuento
        + c.propina AS total_a_pagar
FROM comanda c
JOIN detalle_comanda d
    ON d.id_comanda = c.id_comanda
WHERE d.estado <> 'cancelado'
GROUP BY
    c.id_comanda,
    c.id_mesa,
    c.iva_tasa,
    c.descuento,
    c.propina;


-- Vista para revisar el inventario

CREATE VIEW v_alcance_inventario AS
SELECT
    i.id_insumo,
    i.nombre AS insumo,
    i.stock_actual,
    i.unidad_medida,
    CASE
        WHEN i.stock_actual = 0 THEN 'agotado'
        WHEN i.stock_actual <= i.stock_minimo THEN 'bajo'
        ELSE 'ok'
    END AS nivel,
    COALESCE(
        MIN(FLOOR(i.stock_actual / r.cantidad_por_porcion)),
        0
    ) AS platillos_posibles
FROM insumo i
LEFT JOIN receta r
    ON r.id_insumo = i.id_insumo
GROUP BY i.id_insumo;


-- Datos iniciales

INSERT INTO rol (nombre) VALUES
    ('administrador'),
    ('mesero'),
    ('cajero'),
    ('cocina'),
    ('barra');

INSERT INTO area_preparacion (nombre) VALUES
    ('Cocina'),
    ('Barra');

INSERT INTO categoria_producto (nombre) VALUES
    ('Entradas'),
    ('Platos fuertes'),
    ('Bebidas'),
    ('Postres');

INSERT INTO metodo_pago (nombre) VALUES
    ('Efectivo'),
    ('Tarjeta'),
    ('Transferencia');

COMMIT;