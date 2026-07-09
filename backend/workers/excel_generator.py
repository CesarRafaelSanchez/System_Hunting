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
        safe_write(ws, 'C5', nombre_proyecto) # NOMBRE DEL EDIFICIO/CONDOMINIO (C5:M5)
        
        # 1. TIPO DE PROYECTO (H8: NUEVO PREDIO, M8: AMPLIACION DE TORRE)
        tipo_desarrollo = str(property_data.get('tipoDesarrollo', '')).upper()
        if 'AMPLIACION' in tipo_desarrollo or 'CONDOMINIO' in tipo_desarrollo:
            safe_write(ws, 'M8', 'X')
        else:
            safe_write(ws, 'H8', 'X')
            
        # 2. FUENTE/ORIGEN (H12: PROPIO, M12: REFERIDO)
        origen = str(property_data.get('origen', '')).upper()
        if 'REFERIDO' in origen:
            safe_write(ws, 'M12', 'X')
        else:
            safe_write(ws, 'H12', 'X')
            
        # 3. CLASIFICACION (G16: EDIFICIO, M16: CONDOMINIO)
        clasificacion = str(property_data.get('clasificacion', '')).upper()
        total_torres = int(property_data.get('totalTorres', 1))
        if 'CONDOMINIO' in clasificacion or total_torres >= 3:
            safe_write(ws, 'M16', 'X')
        else:
            safe_write(ws, 'G16', 'X')
            
        # 4. TIPO DE CONSTRUCCION (G22: ESTRENO, J22: MODERNO, M22: ANTIGUO)
        tipo_construccion = str(property_data.get('tipoConstruccion', '')).upper()
        if 'ESTRENO' in tipo_construccion:
            safe_write(ws, 'G22', 'X')
            # Si es Estreno, inyectamos las fechas correspondientes
            safe_write(ws, 'E23', str(property_data.get('fechaEntrega', '')))
            safe_write(ws, 'E25', str(property_data.get('fechaMontantes', '')))
        elif 'ANTIGUO' in tipo_construccion:
            safe_write(ws, 'M22', 'X')
        else:
            safe_write(ws, 'J22', 'X')

        # 5. DIRECCION Y COORDENADAS
        safe_write(ws, 'C46', str(property_data.get('tipoVia', '')).upper()) # TIPO VIA
        safe_write(ws, 'C47', str(property_data.get('nombreVia', '')).upper()) # NOMBRE VIA
        safe_write(ws, 'C48', str(property_data.get('numeracion', '')).upper()) # NUMERO VIA
        
        safe_write(ws, 'C44', str(property_data.get('distrito', '')).upper()) # DISTRITO (C44:E44)
        safe_write(ws, 'C45', str(property_data.get('codigoPostal', ''))) # CODIGO POSTAL (C45)
        safe_write(ws, 'C49', str(property_data.get('coordenadas', ''))) # COORDENADAS (C49:M49)
        
        safe_write(ws, 'C53', total_torres) # TOTAL TORRES
        safe_write(ws, 'C54', int(property_data.get('totalHogares', 0))) # TOTAL HOGARES
        
        safe_write(ws, 'I35', str(property_data.get('responsable', '')).upper()) # Debajo de NOMBRE
        safe_write(ws, 'D35', str(property_data.get('telefonoResponsable', ''))) # Debajo de CELULAR
            
        # Matriz de Torres Relacional
        matrix_list = property_data.get('matrixList', []) if isinstance(property_data, dict) else []
        if not matrix_list:
            matrix_list = data.get('matrixList', [])
        if not matrix_list:
            matrix_list = [matrix_data]
            
        col_letters = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
        for idx, tower_matrix in enumerate(matrix_list):
            if idx >= 4: break # El Excel de ejemplo soporta hasta 4 torres
            
            row_num = 59 + (idx * 3)
            # Escribir la etiqueta de TORRE (por ejemplo, A61 = TORRE 2)
            safe_write(ws, f'A{row_num - 1}', f'TORRE {idx + 1}')
            
            pisos = [p.strip() for p in str(tower_matrix).split(',') if p.strip()]
            for i, p in enumerate(pisos):
                if i >= len(col_letters): break
                # Escribir número de piso (por ejemplo, C61 = 1)
                safe_write(ws, f'{col_letters[i]}{row_num - 1}', i + 1)
                
                # Escribir hogares por piso (por ejemplo, C62 = 4)
                try:
                    val = int(p)
                except ValueError:
                    val = 0
                safe_write(ws, f'{col_letters[i]}{row_num}', val)
            
        # Incrustar imágenes físicamente
        # Fachada goes into A80 (covers A80:E102)
        # Montantes goes into F80 (covers F80:M102)
        cells = ['A80', 'F80']
        for idx, photo_path in enumerate(photos):
            if idx >= len(cells): break
            cell = cells[idx]
            if os.path.exists(photo_path):
                try:
                    from PIL import Image as PILImage
                    final_path = photo_path
                    
                    # Inspect actual image format (WebP files might be saved with .jpg extension)
                    with PILImage.open(photo_path) as im:
                        real_format = str(im.format).upper()
                        if real_format not in ['PNG', 'JPEG']:
                            png_path = os.path.splitext(photo_path)[0] + '_converted.png'
                            im.convert('RGB').save(png_path, 'PNG')
                            final_path = png_path
                    
                    img = Image(final_path)
                    img.width = 320
                    img.height = 340
                    ws.add_image(img, cell)
                except Exception as e:
                    safe_write(ws, cell, f"Error cargando imagen: {str(e)}")
            else:
                safe_write(ws, cell, "Imagen no encontrada")

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
