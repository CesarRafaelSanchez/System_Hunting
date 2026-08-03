import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { prediosService } from '../../services/predios.service';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useAuthStore } from '../../store/useAuthStore';

interface ImportExportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companiesList?: { id: string, name: string }[];
}

export const ImportExportExcelModal: React.FC<ImportExportExcelModalProps> = ({ isOpen, onClose, onSuccess, companiesList }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(user?.companyId || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Map and validate rows
        const mapped = data.map((row: any) => ({
          nombreEdificio: row['Nombre Proyecto'] || row['Proyecto'] || '',
          tipoVia: row['Tipo Vía'] || row['Tipo Via'] || 'AV.',
          direccion: row['Dirección'] || row['Direccion'] || row['Nombre Vía'] || '',
          numeracionMunicipal: row['Numeración'] || row['Numeracion'] || '',
          distrito: row['Distrito'] || '',
          coordenadas: row['Coordenadas'] || '',
          _valid: !!(row['Nombre Proyecto'] || row['Proyecto']) && !!(row['Distrito'])
        }));

        setPreviewData(mapped);
      } catch (err) {
        toast.error('Error al leer el archivo Excel');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    const validRows = previewData.filter(r => r._valid);
    if (validRows.length === 0) {
      toast.error('No hay filas válidas para importar');
      return;
    }

    setLoading(true);
    try {
      const payloads = validRows.map(row => ({
        ejecutivo: user?.fullName || 'BACKOFFICE',
        nombreEdificio: row.nombreEdificio,
        direccion: `${row.tipoVia} ${row.direccion} ${row.numeracionMunicipal}`.trim(),
        distrito: row.distrito,
        numeroHPs: 0,
        resultadoVisita: 'IMPORTACIÓN MASIVA',
        detalle: 'Importado masivamente',
        tipoVia: row.tipoVia,
        numeracionMunicipal: row.numeracionMunicipal,
        coordenadas: row.coordenadas,
        companyId: selectedCompanyId,
        initialStageCode: 'S4'
      }));

      await prediosService.createPrediosBulk(payloads as any);
      
      toast.success(`${validRows.length} oportunidades importadas correctamente`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Error durante la importación masiva');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setPreviewData([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeModal = () => {
    resetState();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-ghl-blue" />
            Importar Oportunidades
          </h2>
          <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {previewData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                 onClick={() => fileInputRef.current?.click()}>
              <UploadCloud className="w-12 h-12 text-blue-500 mb-3" />
              <p className="text-sm font-bold text-gray-700">Haz clic para subir un archivo Excel (.xlsx)</p>
              <p className="text-xs text-gray-500 mt-1">Debe contener columnas: Nombre Proyecto, Dirección, Distrito</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-gray-700">
                  Previsualización ({previewData.length} filas encontradas)
                </p>
                <button onClick={resetState} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
                  Elegir otro archivo
                </button>
              </div>

              {user?.role === 'ACCOUNT_ADMIN' && companiesList && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center gap-4">
                  <label className="text-xs font-bold text-blue-800 whitespace-nowrap">Asignar todas a:</label>
                  <select 
                    value={selectedCompanyId}
                    onChange={e => setSelectedCompanyId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seleccione empresa</option>
                    {companiesList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-2 text-center w-10">St</th>
                      <th className="p-2">Proyecto</th>
                      <th className="p-2">Dirección</th>
                      <th className="p-2">Distrito</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="p-2 text-center">
                          {row._valid ? <CheckCircle2 className="w-4 h-4 text-green-500 inline" /> : <AlertCircle className="w-4 h-4 text-red-500 inline" />}
                        </td>
                        <td className="p-2 font-medium">{row.nombreEdificio || <span className="text-red-400 italic">Falta</span>}</td>
                        <td className="p-2">{row.direccion} {row.numeracionMunicipal}</td>
                        <td className="p-2">{row.distrito || <span className="text-red-400 italic">Falta</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.length > 10 && (
                <p className="text-xs text-gray-500 text-center italic mt-2">
                  Mostrando los primeros 10 de {previewData.length} registros...
                </p>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={closeModal}
            className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button 
            onClick={handleImport}
            disabled={loading || previewData.length === 0}
            className="px-5 py-2.5 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Importando...' : 'Confirmar Importación'}
          </button>
        </div>
      </div>
    </div>
  );
};
