import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
import bcrypt
from flasgger import Swagger

app = Flask(__name__)
CORS(app)
swagger = Swagger(app)

# Conexión a la base de datos
def conectar(vhost, vuser, vpass, vdb):
    conn = pymysql.connect(
        host=vhost,
        user=vuser,
        password=vpass,
        db=vdb,
        charset='utf8mb4'
    )
    return conn

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASS = os.getenv('DB_PASS', '')
DB_NAME = os.getenv('DB_NAME', 'gestor_contrasena')

# Ruta para consulta general
@app.route("/", methods=['GET'])
def consulta_general():
    """
    Consulta general del baúl de contraseñas
    ---
    responses:
      200:
        description: Lista de registros
    """
    try:
        conn = conectar(DB_HOST, DB_USER, DB_PASS, DB_NAME)
        cur = conn.cursor()
        cur.execute("SELECT * FROM baul")
        datos = cur.fetchall()
        data = []
        for row in datos:
            dato = {'id_baul': row[0], 'Plataforma': row[1], 'usuario': row[2], 'clave': row[3]}
            data.append(dato)
        cur.close()
        conn.close()
        return jsonify({'baul': data, 'mensaje': 'Baúl de contraseñas'})
    except Exception as ex:
        print('ERROR al consultar general:', ex)
        return jsonify({'mensaje': 'Error', 'detalle': str(ex)})

# Ruta para consulta individual
@app.route("/consulta_individual/<codigo>", methods=['GET'])
def consulta_individual(codigo):
    """
    Consulta individual por ID
    ---
    parameters:
      - name: codigo
        in: path
        required: true
        type: integer
    responses:
      200:
        description: Registro encontrado
    """
    try:
        codigo = int(codigo)
        conn = conectar(DB_HOST, DB_USER, DB_PASS, DB_NAME)
        cur = conn.cursor()
        cur.execute("SELECT * FROM baul WHERE id_baul = %s", (codigo,))
        datos = cur.fetchone()
        cur.close()
        conn.close()
        if datos:
            dato = {'id_baul': datos[0], 'Plataforma': datos[1], 'usuario': datos[2], 'clave': datos[3]}
            return jsonify({'baul': dato, 'mensaje': 'Registro encontrado'})
        else:
            return jsonify({'mensaje': 'Registro no encontrado'})
    except Exception as ex:
        print('ERROR al consultar individual:', ex)
        return jsonify({'mensaje': 'Error', 'detalle': str(ex)})

# Ruta para registro
@app.route("/registro/", methods=['POST'])
def registro():
    """
    Registrar nueva contraseña
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            plataforma:
              type: string
            usuario:
              type: string
            clave:
              type: string
    responses:
      200:
        description: Registro agregado
    """
    try:
        data = request.get_json()
        plataforma = data['plataforma']
        usuario = data['usuario']
        clave = bcrypt.hashpw(data['clave'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        conn = conectar(DB_HOST, DB_USER, DB_PASS, DB_NAME)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO baul (plataforma, usuario, clave) VALUES (%s, %s, %s)",
            (plataforma, usuario, clave)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'mensaje': 'Registro agregado'})
    except pymysql.err.IntegrityError as ex:
        print('ERROR de integridad al insertar:', ex)
        if 'Duplicate entry' in str(ex) and 'Plataforma' in str(ex):
            return jsonify({'mensaje': 'Duplicado', 'detalle': 'La plataforma ya existe'})
        return jsonify({'mensaje': 'Error', 'detalle': str(ex)})
    except Exception as ex:
        print('ERROR al insertar:', ex)
        return jsonify({'mensaje': 'Error', 'detalle': str(ex)})

# Ruta para eliminar registro
@app.route("/eliminar/<codigo>", methods=['DELETE'])
def eliminar(codigo):
    """
    Eliminar registro por ID
    ---
    parameters:
      - name: codigo
        in: path
        required: true
        type: integer
    responses:
      200:
        description: Registro eliminado
    """
    try:
        codigo = int(codigo)
        conn = conectar(DB_HOST, DB_USER, DB_PASS, DB_NAME)
        cur = conn.cursor()
        cur.execute("DELETE FROM baul WHERE id_baul = %s", (codigo,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'mensaje': 'Eliminado'})
    except Exception as ex:
        print('ERROR al eliminar:', ex)
        return jsonify({'mensaje': 'Error', 'detalle': str(ex)})

# Ruta para actualizar registro
@app.route("/actualizar/<codigo>", methods=['PUT'])
def actualizar(codigo):
    """
    Actualizar registro por ID
    ---
    parameters:
      - name: codigo
        in: path
        required: true
        type: integer
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            plataforma:
              type: string
            usuario:
              type: string
            clave:
              type: string
    responses:
      200:
        description: Registro actualizado
    """
    try:
        codigo = int(codigo)
        data = request.get_json()
        plataforma = data['plataforma']
        usuario = data['usuario']
        clave = bcrypt.hashpw(data['clave'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        conn = conectar(DB_HOST, DB_USER, DB_PASS, DB_NAME)
        cur = conn.cursor()
        cur.execute(
            "UPDATE baul SET plataforma = %s, usuario = %s, clave = %s WHERE id_baul = %s",
            (plataforma, usuario, clave, codigo)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'mensaje': 'Registro actualizado'})
    except pymysql.err.IntegrityError as ex:
        print('ERROR de integridad al actualizar:', ex)
        if 'Duplicate entry' in str(ex) and 'Plataforma' in str(ex):
            return jsonify({'mensaje': 'Duplicado', 'detalle': 'La plataforma ya existe'})
        return jsonify({'mensaje': 'Error', 'detalle': str(ex)})
    except Exception as ex:
        print('ERROR al actualizar:', ex)
        return jsonify({'mensaje': 'Error', 'detalle': str(ex)})

if __name__ == '__main__':
    app.run(debug=True)