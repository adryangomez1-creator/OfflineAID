-- ============================================
-- OFFLINEAID - BASE DE DATOS FINAL
-- ============================================

DROP DATABASE IF EXISTS offlineaid_in5bm;
CREATE DATABASE offlineaid_in5bm;
USE offlineaid_in5bm;

-- ============================================
-- 1. USUARIOS (con columnas extra que usa el backend)
-- ============================================
CREATE TABLE Usuarios (
    id_usuario         INT AUTO_INCREMENT PRIMARY KEY,
    nombre             VARCHAR(100) NOT NULL,
    apellido           VARCHAR(100) NOT NULL,
    telefono           VARCHAR(20),
    correo             VARCHAR(120) NOT NULL UNIQUE,
    password           VARCHAR(255) NOT NULL,
    rol                ENUM('ADMIN','CIUDADANO','INSTITUCION','OPERADOR') DEFAULT 'CIUDADANO',
    estado             ENUM('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
    token_push         VARCHAR(255) NULL,
    modelo_dispositivo VARCHAR(100) NULL,
    sistema_operativo  VARCHAR(100) NULL,
    fecha_registro     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. TIPOS DE EMERGENCIA
-- ============================================
CREATE TABLE TiposEmergencia (
    id_tipo         INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL UNIQUE,
    descripcion     TEXT,
    nivel_prioridad ENUM('BAJA','MEDIA','ALTA','CRITICA') NOT NULL
);

-- ============================================
-- 3. EMERGENCIAS
-- ============================================
CREATE TABLE Emergencias (
    id_emergencia      INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario         INT NOT NULL,
    id_tipo            INT NOT NULL,
    titulo             VARCHAR(150) NOT NULL,
    descripcion        TEXT NOT NULL,
    latitud            DECIMAL(10,7),
    longitud           DECIMAL(10,7),
    direccion          VARCHAR(255),
    estado             ENUM('PENDIENTE','EN_PROCESO','ATENDIDA','CANCELADA') DEFAULT 'PENDIENTE',
    fecha_creacion     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_tipo)    REFERENCES TiposEmergencia(id_tipo)
);

-- ============================================
-- 4. EVIDENCIAS
-- ============================================
CREATE TABLE Evidencias (
    id_evidencia  INT AUTO_INCREMENT PRIMARY KEY,
    id_emergencia INT NOT NULL,
    url_imagen    MEDIUMTEXT,
    fecha_subida  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_emergencia) REFERENCES Emergencias(id_emergencia) ON DELETE CASCADE
);

-- ============================================
-- 5. INSTITUCIONES
-- ============================================
CREATE TABLE Instituciones (
    id_institucion INT AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(120) NOT NULL,
    tipo           VARCHAR(80),
    telefono       VARCHAR(20),
    correo         VARCHAR(120),
    direccion      VARCHAR(255)
);

-- ============================================
-- 6. ASIGNACIONES
-- ============================================
CREATE TABLE Asignaciones (
    id_asignacion    INT AUTO_INCREMENT PRIMARY KEY,
    id_emergencia    INT NOT NULL,
    id_institucion   INT NOT NULL,
    estado           ENUM('ASIGNADA','EN_PROCESO','FINALIZADA') DEFAULT 'ASIGNADA',
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_emergencia)  REFERENCES Emergencias(id_emergencia) ON DELETE CASCADE,
    FOREIGN KEY (id_institucion) REFERENCES Instituciones(id_institucion)
);

-- ============================================
-- 7. NOTIFICACIONES
-- ============================================
CREATE TABLE Notificaciones (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario      INT NOT NULL,
    titulo          VARCHAR(150),
    mensaje         TEXT,
    leida           BOOLEAN DEFAULT FALSE,
    fecha           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- ============================================
-- 8. COLA OFFLINE
-- ============================================
CREATE TABLE ColaOffline (
    id_cola          INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario       INT NOT NULL,
    tipo_operacion   ENUM('CREAR_EMERGENCIA','ACTUALIZAR_EMERGENCIA','SUBIR_EVIDENCIA','ACTUALIZAR_UBICACION') NOT NULL,
    payload_json     JSON NOT NULL,
    estado_sync      ENUM('PENDIENTE','SINCRONIZADO','ERROR') DEFAULT 'PENDIENTE',
    mensaje_error    TEXT,
    fecha_creacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_sync       TIMESTAMP NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- ============================================
-- DATOS INICIALES - Tipos de Emergencia
-- ============================================
INSERT INTO TiposEmergencia (nombre, descripcion, nivel_prioridad) VALUES
('Accidente de Tránsito',          'Colisión o percance vial de vehículos o peatones',                   'ALTA'),
('Desastre Natural / Terremoto',   'Sismo, terremoto o colapso estructural',                             'CRITICA'),
('Inundación / Deslave',           'Crecida de ríos, inundaciones o deslizamiento de tierra',            'CRITICA'),
('Incendio Estructural / Forestal','Fuego en viviendas, comercios o áreas boscosas',                     'ALTA'),
('Emergencia Médica Grave',        'Paro cardíaco, heridas graves, asfixia o pérdida del conocimiento',  'CRITICA'),
('Emergencia Médica Menor',        'Contusiones leves, caídas o heridas sin riesgo vital inmediato',     'MEDIA'),
('Falla Eléctrica / Apagón Masivo','Corte prolongado de energía en comunidades',                         'BAJA'),
('Búsqueda y Rescate',             'Personas extraviadas en áreas remotas o rurales',                    'ALTA');

-- ============================================
-- DATOS INICIALES - Instituciones
-- ============================================
INSERT INTO Instituciones (nombre, tipo, telefono, correo, direccion) VALUES
('Bomberos Voluntarios',   'Cuerpo de Bomberos y Rescate',                        '122', 'emergencias@bomberosvoluntarios.org', 'Estación Central, Zona 3'),
('Bomberos Municipales',   'Atención de emergencias prehospitalarias e incendios', '123', 'contacto@bomberosmunicipales.gob',    'Bulevar Liberación, Zona 12'),
('Cruz Roja',              'Atención médica humanitaria y ambulancias',            '125', 'info@cruzroja.org',                   '3a Calle 8-40 Zona 1'),
('CONRED',                 'Coordinadora Nacional para la Reducción de Desastres', '119', 'alertas@conred.gob',                  'Avenida Hincapié 21-72 Zona 13'),
('Policía Nacional Civil', 'Seguridad ciudadana y orden público',                  '110', 'denuncias@pnc.gob',                   '10a Calle 13-92 Zona 1');

-- ============================================
-- DATOS INICIALES - Usuarios de prueba
-- NOTA: contraseñas en texto plano (el backend no hashea)
-- ============================================
INSERT INTO Usuarios (nombre, apellido, telefono, correo, password, rol, estado, token_push, modelo_dispositivo, sistema_operativo) VALUES
('Admin',    'Sistema',           '55550001', 'admin@offlineaid.com',        'admin123',    'ADMIN',     'ACTIVO', NULL, 'Web Console', 'Linux'),
('Operador', 'Centro de Despacho','55550002', 'operador@offlineaid.com',     'operador123', 'OPERADOR',  'ACTIVO', NULL, 'Web Console', 'Windows'),
('Carlos',   'Mendoza',           '55551234', 'carlos.mendoza@email.com',    'carlos123',   'CIUDADANO', 'ACTIVO', 'push-token-carlos-001', 'Samsung Galaxy A32', 'Android 13'),
('María',    'González',          '55554321', 'maria.gonzalez@email.com',    'maria123',    'CIUDADANO', 'ACTIVO', 'push-token-maria-002', 'Xiaomi Redmi Note 11', 'Android 12');