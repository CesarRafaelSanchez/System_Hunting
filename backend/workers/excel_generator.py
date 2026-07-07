import sys
import json
import os

try:
    import openpyxl
    from openpyxl.drawing.image import Image
except ImportError:
    # MVP fallback if openpyxl is not installed natively
    print(json.dumps({"status": "error", "message": "openpyxl not installed"}))
    sys.exit(1)

def generate_excel(payload_json):
    try:
        data = json.loads(payload_json)
        
        # Mapeo de datos básicos
        opp_id = data.get('opportunityId', 'UNKNOWN')
        property_data = data.get('property', {})
        matrix_data = data.get('matrix', '0')
        photos = data.get('photos', [])
        nombre_proyecto = str(property_data.get('nombreEdificio', '')).upper()
        
        template_name = "Ficha de Datos NOMBRE DEL PROYECTO - Junio.xlsx"
        template_path = os.path.join(os.path.dirname(__file__), '..', 'templates', template_name)
        
        # Resolve to absolute path to be sure
        template_path = os.path.abspath(template_path)
        
        # Simulación de carga de plantilla corporativa real
        if os.path.exists(template_path):
            wb = openpyxl.load_workbook(template_path)
            ws = wb.active
        else:
            # Fallback en caso de que la plantilla física no esté subida aún al contenedor
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = "Ficha Tecnica"
        
        def safe_write(ws, cell, val):
            try:
                ws[cell] = val
            except Exception:
                pass

        # Inyectando campos validados en MAYÚSCULAS
        # Usamos safe_write para no crashear con las celdas combinadas de la plantilla
        safe_write(ws, 'C5', nombre_proyecto) # NOMBRE DEL EDIFICIO/CONDOMINIO (C5:M5)
        
        safe_write(ws, 'H8', str(property_data.get('tipoEdificio', '')).upper()) # Checkbox o lado
        
        safe_write(ws, 'C46', str(property_data.get('direccion', '')).upper()) # TIPO VIA
        
        safe_write(ws, 'C44', str(property_data.get('distrito', '')).upper()) # DISTRITO (C44:E44)
        
        safe_write(ws, 'C49', str(property_data.get('coordenadas', ''))) # COORDENADAS (C49:M49)
        
        safe_write(ws, 'I35', str(property_data.get('responsable', '')).upper()) # Debajo de NOMBRE
        
        safe_write(ws, 'D35', str(property_data.get('telefonoResponsable', ''))) # Debajo de CELULAR
            
        # Matriz de Torres Relacional
        # En la plantilla nueva, la matriz empieza en la fila 58
        # Piso 1 es C58, hogares es C59...
        
        # El arreglo de torres/pisos viene como string separado por comas (simplificado MVP)
        pisos = [p.strip() for p in str(matrix_data).split(',') if p.strip()]
        
        # Inyectando pisos en la fila 59 (C59 hasta L59)
        col_letters = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
        for i, p in enumerate(pisos):
            if i >= len(col_letters): break
            try:
                val = int(p)
            except ValueError:
                val = 0
            safe_write(ws, f'{col_letters[i]}59', val)
        
        # Incrustar imágenes físicamente
        # Las fotos en payload son rutas relativas o absolutas
        img_row = 5
        img_col = 'G'
        for idx, photo_path in enumerate(photos):
            if idx >= 2: break # Solo Fachada y Montante
            if os.path.exists(photo_path):
                try:
                    img = Image(photo_path)
                    # Escalar imagen
                    img.width = 300
                    img.height = 300
                    cell = f"{img_col}{img_row + (idx * 15)}"
                    ws.add_image(img, cell)
                except Exception as e:
                    safe_write(ws, f"{img_col}{img_row + (idx * 15)}", f"Error cargando imagen: {str(e)}")
            else:
                safe_write(ws, f"{img_col}{img_row + (idx * 15)}", "Imagen no encontrada")

        # Guardado final
        output_name = f"Ficha_de_Datos_{nombre_proyecto.replace(' ', '_')}_{opp_id}.xlsx"
        output_path = os.path.join(os.path.dirname(__file__), output_name)
        wb.save(output_path)
        
        print(json.dumps({
            "status": "success",
            "message": "Report generated successfully",
            "file": output_path
        }))
        
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        generate_excel(sys.argv[1])
    else:
        print(json.dumps({"status": "error", "message": "No payload provided"}))
        sys.exit(1)
