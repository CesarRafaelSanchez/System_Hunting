import sys
import json
import os

try:
    import openpyxl
    from openpyxl.drawing.image import Image
    from openpyxl.styles import Border, Side, Alignment, PatternFill
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
            
        # 2. FUENTE/ORIGEN (E12: PROPIO, M12: REFERIDO)
        origen = str(property_data.get('origen', '')).upper()
        if 'REFERIDO' in origen:
            safe_write(ws, 'M12', 'X')
            safe_write(ws, 'E12', '')
        else:
            safe_write(ws, 'E12', 'X')
            safe_write(ws, 'M12', '')
            
        # 3. CLASIFICACION (E16: EDIFICIO, I16: CONDOMINIO)
        clasificacion = str(property_data.get('clasificacion', '')).upper()
        total_torres = int(property_data.get('totalTorres', 1))
        if 'CONDOMINIO' in clasificacion or total_torres >= 3:
            safe_write(ws, 'I16', 'X')
            safe_write(ws, 'E16', '')
        else:
            safe_write(ws, 'E16', 'X')
            safe_write(ws, 'I16', '')
            
        # 4. TIPO DE CONSTRUCCION (E22: ESTRENO, I22: MODERNO, L22: ANTIGUO)
        tipo_construccion = str(property_data.get('tipoConstruccion', '')).upper()
        if 'ESTRENO' in tipo_construccion:
            safe_write(ws, 'E22', 'X')
            safe_write(ws, 'I22', '')
            safe_write(ws, 'L22', '')
            # Si es Estreno, inyectamos las fechas correspondientes
            safe_write(ws, 'E23', str(property_data.get('fechaEntrega', '')))
            safe_write(ws, 'E25', str(property_data.get('fechaMontantes', '')))
        elif 'ANTIGUO' in tipo_construccion:
            safe_write(ws, 'L22', 'X')
            safe_write(ws, 'E22', '')
            safe_write(ws, 'I22', '')
        else:
            safe_write(ws, 'I22', 'X')
            safe_write(ws, 'E22', '')
            safe_write(ws, 'L22', '')

        # JUNTA DIRECTIVA (E31: SI, I31: NO)
        junta_directiva = str(property_data.get('juntaDirectiva', '')).upper()
        if 'SI' in junta_directiva or 'SÍ' in junta_directiva:
            safe_write(ws, 'E31', 'X')
            safe_write(ws, 'I31', '')
        else:
            safe_write(ws, 'I31', 'X')
            safe_write(ws, 'E31', '')

        # 5. DIRECCION Y COORDENADAS
        safe_write(ws, 'C46', str(property_data.get('tipoVia', '')).upper()) # TIPO VIA
        safe_write(ws, 'C47', str(property_data.get('nombreVia', '')).upper()) # NOMBRE VIA
        safe_write(ws, 'C48', str(property_data.get('numeracion', '')).upper()) # NUMERO VIA
        
        safe_write(ws, 'C44', str(property_data.get('distrito', '')).upper()) # DISTRITO (C44:E44)
        safe_write(ws, 'C45', str(property_data.get('codigoPostal', ''))) # CODIGO POSTAL (C45)
        safe_write(ws, 'C49', str(property_data.get('coordenadas', ''))) # COORDENADAS (C49:M49)
        
        safe_write(ws, 'C53', total_torres) # TOTAL TORRES
        safe_write(ws, 'C54', int(property_data.get('totalHogares', 0))) # TOTAL HOGARES
        
        # RESPONSABLE
        safe_write(ws, 'D34', str(property_data.get('cargoResponsable', '')).upper()) # CARGO
        safe_write(ws, 'I34', str(property_data.get('responsable', '')).upper()) # NOMBRE
        safe_write(ws, 'D35', str(property_data.get('telefonoResponsable', ''))) # CELULAR
        safe_write(ws, 'I35', str(property_data.get('correoResponsable', '')).upper()) # CORREO

        # VISITA TECNICA
        safe_write(ws, 'D39', str(property_data.get('fechaVisitaTecnica', ''))) # FECHA
        horario = str(property_data.get('horarioVisita', '')).upper()
        if '9' in horario or '12' in horario or ('AM' in horario and '1' not in horario):
            safe_write(ws, 'I39', 'X')
            safe_write(ws, 'L39', '')
        elif '1' in horario or '4' in horario or 'PM' in horario:
            safe_write(ws, 'L39', 'X')
            safe_write(ws, 'I39', '')
        else:
            safe_write(ws, 'I39', '')
            safe_write(ws, 'L39', '')
            
        # Matriz de Torres Relacional
        matrix_list = property_data.get('matrixList', []) if isinstance(property_data, dict) else []
        if not matrix_list:
            matrix_list = data.get('matrixList', [])
        if not matrix_list:
            matrix_list = [matrix_data]
            
        col_letters = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
        
        # 6. CANAL / AGENCIA
        safe_write(ws, 'C58', str(data.get('canalHunting', '')).upper())
        
        # 7. GESTOR Y SUPERVISOR
        is_referral = data.get('isReferral', False)
        if is_referral:
            safe_write(ws, 'C62', str(data.get('referredHunterName', '')).upper()) # NOMBRE DEL HUNTER
            safe_write(ws, 'C63', 'N/A') # CELULAR DEL HUNTER
            safe_write(ws, 'C66', str(data.get('partnerSupervisorName', '')).upper()) # NOMBRE DEL SUPERVISOR
            safe_write(ws, 'C67', str(data.get('partnerSupervisorPhone', ''))) # CELULAR DEL SUPERVISOR
        else:
            safe_write(ws, 'C62', str(data.get('currentOwnerName', '')).upper()) # NOMBRE DEL HUNTER
            safe_write(ws, 'C63', str(data.get('currentOwnerPhone', ''))) # CELULAR DEL HUNTER
            safe_write(ws, 'C66', str(data.get('currentOwnerSupervisorName', '')).upper()) # NOMBRE DEL SUPERVISOR
            safe_write(ws, 'C67', str(data.get('currentOwnerSupervisorPhone', ''))) # CELULAR DEL SUPERVISOR

        current_row = 59
        extra_rows_inserted = 0
        
        thin_border = Border(top=Side(style='thin'), left=Side(style='thin'), right=Side(style='thin'), bottom=Side(style='thin'))
        center_align = Alignment(horizontal='center', vertical='center')
        header_fill = PatternFill(start_color="F2F2F2", end_color="F2F2F2", fill_type="solid") # Gris claro

        for idx, tower_matrix in enumerate(matrix_list):
            if idx >= 4: break # El Excel de ejemplo soporta hasta 4 torres
            
            pisos = [p.strip() for p in str(tower_matrix).split(',') if p.strip()]
            if not pisos:
                pisos = ['0'] # Fallback
                
            # Dividir en chunks de 10
            chunks = [pisos[i:i + 10] for i in range(0, len(pisos), 10)]
            
            for chunk_idx, chunk in enumerate(chunks):
                if chunk_idx > 0:
                    ws.insert_rows(current_row - 1, 3)
                    extra_rows_inserted += 3
                    
                # Escribir la etiqueta de TORRE (por ejemplo, A58 = TORRE 1)
                label = f'TORRE {idx + 1}'
                if chunk_idx > 0:
                    label += f' (cont. {chunk_idx + 1})'
                safe_write(ws, f'A{current_row - 1}', label)
                
                # Iterar sobre las 10 columnas
                for i in range(10):
                    col_letter = col_letters[i]
                    cell_piso = f'{col_letter}{current_row - 1}'
                    cell_hogares = f'{col_letter}{current_row}'
                    
                    if i < len(chunk):
                        # Escribir número de piso
                        piso_num = (chunk_idx * 10) + i + 1
                        safe_write(ws, cell_piso, piso_num)
                        
                        # Escribir hogares por piso
                        try:
                            val = int(chunk[i])
                        except ValueError:
                            val = 0
                        safe_write(ws, cell_hogares, val)
                    else:
                        # Rellenar con N/A
                        safe_write(ws, cell_piso, 'N/A')
                        safe_write(ws, cell_hogares, 'N/A')
                    
                    # Aplicar estilos básicos si es una fila insertada para que no se vea desordenado
                    if chunk_idx > 0:
                        ws[cell_piso].border = thin_border
                        ws[cell_piso].alignment = center_align
                        ws[cell_piso].fill = header_fill
                        
                        ws[cell_hogares].border = thin_border
                        ws[cell_hogares].alignment = center_align
                        
            current_row += 3
            
        # Incrustar imágenes físicamente
        # Las fotos ahora deben considerar el desplazamiento de filas extra insertadas
        photo_row = 80 + extra_rows_inserted
        cells = [f'A{photo_row}', f'F{photo_row}']
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
