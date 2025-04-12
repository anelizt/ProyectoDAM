const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'zombie_escape_training'
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado a la base de datos');
});

const secretKey = 'secreto_super_seguro';

// LOGIN
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Error en el servidor' });
        if (results.length === 0) return res.json({ success: false, message: 'Usuario no encontrado' });

        const user = results[0];
        bcrypt.compare(password, user.contraseña, (err, match) => {
            if (!match) return res.json({ success: false, message: 'Contraseña incorrecta' });
            
            const token = jwt.sign({ id: user.id_usuario, rol: user.rol }, secretKey, { expiresIn: '1h' });
            res.json({ success: true, token, rol: user.rol, id_usuario: user.id_usuario });
        });
    });
});

// REGISTRO
app.post('/register', (req, res) => {
    const { nombre, email, password } = req.body;
    
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ success: false, message: 'Error al cifrar contraseña' });
        
        const sql = 'INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES (?, ?, ?, ?)';
        db.query(sql, [nombre, email, hash, 'usuario'], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: 'Error al registrar usuario' });
            res.json({ success: true, message: 'Usuario registrado correctamente', id_usuario: result.insertId });
        });
    });
});

// REGISTRO DE ENTRENAMIENTOS
app.post('/entrenamientos', (req, res) => {
    const { id_usuario, fecha, tipo_ejercicio, repeticiones, series, peso, tiempo, notas } = req.body;
    const sql = 'INSERT INTO entrenamientos (id_usuario, fecha, tipo_ejercicio, repeticiones, series, peso, tiempo, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [id_usuario, fecha, tipo_ejercicio, repeticiones, series, peso, tiempo, notas], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Error al registrar entrenamiento' });
        res.json({ success: true, message: 'Entrenamiento registrado correctamente' });
    });
});

// ELIMINAR UN ENTRENAMIENTO
app.delete('/entrenamientos/:id', (req, res) => {
    const id_entrenamiento = req.params.id;

    const sql = 'DELETE FROM entrenamientos WHERE id_entrenamiento = ?';
    db.query(sql, [id_entrenamiento], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Error en el servidor' });
        if (result.affectedRows === 0) return res.json({ success: false, message: 'Entrenamiento no encontrado' });

        res.json({ success: true, message: 'Entrenamiento eliminado correctamente' });
    });
});

// EDITAR UN ENTRENAMIENTO
app.put('/entrenamientos/:id', (req, res) => {
    const id_entrenamiento = req.params.id;
    const { fecha, tipo_ejercicio, repeticiones, series, peso, tiempo, notas } = req.body;
    
    const sql = 'UPDATE entrenamientos SET fecha = ?, tipo_ejercicio = ?, repeticiones = ?, series = ?, peso = ?, tiempo = ?, notas = ? WHERE id_entrenamiento = ?';
    db.query(sql, [fecha, tipo_ejercicio, repeticiones, series, peso, tiempo, notas, id_entrenamiento], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Error en el servidor' });
        if (result.affectedRows === 0) return res.json({ success: false, message: 'Entrenamiento no encontrado' });

        res.json({ success: true, message: 'Entrenamiento actualizado correctamente' });
    });
});

// OBTENER ENTRENAMIENTOS DE UN USUARIO
app.get('/entrenamientos/:id_usuario', (req, res) => {
    const sql = 'SELECT *, DATE_FORMAT(fecha, "%d/%m/%Y") AS fecha FROM entrenamientos WHERE id_usuario = ?';
    db.query(sql, [req.params.id_usuario], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Error en el servidor' });
        res.json({ success: true, entrenamientos: results });
    });
});

// OBTENER UN ENTRENAMIENTO POR SU ID
app.get('/entrenamiento/:id', (req, res) => {
    const id_entrenamiento = req.params.id;

    console.log("Buscando entrenamiento con ID:", id_entrenamiento); // <-- Nueva línea para depuración

    const sql = 'SELECT * FROM entrenamientos WHERE id_entrenamiento = ?';
    db.query(sql, [id_entrenamiento], (err, results) => {
        if (err) {
            console.error("Error en la consulta SQL:", err);
            return res.status(500).json({ success: false, message: 'Error en el servidor' });
        }

        console.log("Resultados de la consulta:", results); // <-- Otra línea para ver qué datos devuelve

        if (results.length === 0) {
            return res.json({ success: false, message: 'Entrenamiento no encontrado' });
        }

        res.json({ success: true, entrenamiento: results[0] });
    });
});

// OBTENER USUARIOS (ADMIN)
app.get('/usuarios', (req, res) => {
    const sql = 'SELECT id_usuario, nombre, email, rol, fecha_registro FROM usuarios';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Error en el servidor' });
        res.json({ success: true, usuarios: results });
    });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

// ELIMINAR UN USUARIO
app.delete('/usuarios/:id', (req, res) => {
    const id_usuario = req.params.id;

    const sql = 'DELETE FROM usuarios WHERE id_usuario = ?';
    db.query(sql, [id_usuario], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Error en el servidor' });
        if (result.affectedRows === 0) return res.json({ success: false, message: 'Usuario no encontrado' });

        res.json({ success: true, message: 'Usuario eliminado correctamente' });
    });
});

// EDITAR UN USUARIO
app.put('/usuarios/:id', (req, res) => {
    const id_usuario = req.params.id;
    const { nombre, email, rol } = req.body;

    const sql = 'UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id_usuario = ?';
    db.query(sql, [nombre, email, rol, id_usuario], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Error en el servidor' });
        if (result.affectedRows === 0) return res.json({ success: false, message: 'Usuario no encontrado' });

        res.json({ success: true, message: 'Usuario actualizado correctamente' });
    });
});
