import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from '../database/entities/opportunity.entity';
import { spawn } from 'child_process';
import * as path from 'path';
import { EmailService } from '../dispatch/email.service';
import { SheetsService } from '../dispatch/sheets.service';
import { MediaAsset } from '../database/entities/media-asset.entity';

@Processor('report-generation')
@Injectable()
export class ReportProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportProcessor.name);

  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,
    private readonly emailService: EmailService,
    private readonly sheetsService: SheetsService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} [${job.name}] for opportunity ${job.data.opportunityId}`);
    
    const manager = this.opportunityRepository.manager;

    // 1. Extraer los datos de la oportunidad (y sus relaciones reales)
    const opportunity = await manager.findOne(Opportunity, {
      where: { id: job.data.opportunityId },
      relations: {
        property: {
          distrito: true,
          torres: {
            pisos: true
          }
        }
      }
    });

    if (!opportunity) {
      this.logger.error(`Oportunidad ${job.data.opportunityId} no encontrada`);
      throw new Error('Oportunidad no encontrada');
    }

    // Ya no usamos form_submissions, tomamos todos los datos del Predio
    // que fueron guardados por OpportunitiesService

    // Formatear coordenadas
    let coordenadasStr = 'N/A';
    if (opportunity.property?.coordenadasGps) {
      const gps = opportunity.property.coordenadasGps;
      if (typeof gps === 'string') {
        coordenadasStr = gps.replace(/[()]/g, '');
      } else if (typeof gps === 'object' && gps.x !== undefined && gps.y !== undefined) {
        coordenadasStr = `${gps.y}, ${gps.x}`;
      }
    }

    // Formatear fechas
    const formatDate = (d: any) => {
      if (!d) return 'N/A';
      const date = new Date(d);
      if (isNaN(date.getTime())) return 'N/A';
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    };

    const estadoConst = (opportunity.property?.estadoConstruccion || '').toUpperCase();
    const estreno = (estadoConst === 'SÍ' || estadoConst === 'SI' || estadoConst === 'YES') ? 'Sí' : 'No';
    const isEstreno = estreno === 'Sí';
    const fechaMontantes = isEstreno ? formatDate(opportunity.property?.terminoMontantes) : 'N/A';
    const fechaEntrega = isEstreno ? formatDate(opportunity.property?.fechaEntrega) : 'N/A';

    // Matriz de hogares de todas las torres
    const sortedTorres = (opportunity.property?.torres || []).slice().sort((a, b) => a.nombreTorre.localeCompare(b.nombreTorre));
    const matrixList = sortedTorres.map(torre => {
      if (torre.pisos && torre.pisos.length > 0) {
        return torre.pisos
          .slice()
          .sort((a, b) => a.numeroPiso - b.numeroPiso)
          .map(p => p.hogaresCantidad)
          .join(',');
      }
      return '';
    }).filter(Boolean);
    const matrixStr = matrixList[0] || '0';

    // Rutas absolutas de fotos físicas en disco
    const mediaRepo = manager.getRepository(MediaAsset);
    const mediaAssets = await mediaRepo.find({
      where: { entityId: opportunity.id, entityType: 'OPPORTUNITY' }
    });

    // Ordenar descendente por takenAt para priorizar las fotos actualizadas
    mediaAssets.sort((a, b) => {
      const tA = a.takenAt ? new Date(a.takenAt).getTime() : 0;
      const tB = b.takenAt ? new Date(b.takenAt).getTime() : 0;
      return tB - tA;
    });

    const photosPaths: string[] = [];
    for (const category of ['FACHADA', 'MONTANTES'] as const) {
      const asset = mediaAssets.find(a => a.category === category);
      if (asset) {
        const filename = asset.fileUrl.split('/').pop();
        if (filename) {
          const absolutePath = path.join(process.cwd(), 'uploads', filename);
          photosPaths.push(absolutePath);
        }
      }
    }

    const tipoVia = (opportunity.property?.tipoVia || '').trim();
    let nombreVia = (opportunity.property?.nombreVia || '').trim();
    
    // Accent-insensitive normalization for removing duplicate prefixes (Jirón jirón)
    const removeAccents = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const normTipo = removeAccents(tipoVia);
    while (tipoVia && removeAccents(nombreVia).startsWith(normTipo)) {
      nombreVia = nombreVia.substring(tipoVia.length).trim();
    }

    const numeracion = (opportunity.property?.numeracionMunicipal || '').trim();
    const direccionStr = `${tipoVia} ${nombreVia} ${numeracion}`.trim() || 'N/A';

    // Determinar origen y clasificacion del predio
    const origenStr = opportunity.property?.origenProspeccion || opportunity.property?.ingreso || 'PROPIO';
    const totalTorres = opportunity.property?.totalTorres || 1;
    const totalHogares = opportunity.property?.totalHogares || 0;
    const tipoConst = isEstreno ? 'ESTRENO' : (opportunity.property?.clasificacionProyecto || 'MODERNO');

    const payload = {
      opportunityId: opportunity.code,
      canalHunting: opportunity.canalHunting || 'NOVACORE',
      property: {
        nombreEdificio: opportunity.property?.nombreProyecto || 'Mock Edificio',
        tipoEdificio: opportunity.property?.clasificacionProyecto || opportunity.property?.tipoDesarrollo || 'Estreno',
        direccion: direccionStr,
        tipoVia: tipoVia,
        nombreVia: nombreVia,
        numeracion: numeracion,
        distrito: opportunity.property?.distrito?.nombre || 'Lima',
        coordenadas: coordenadasStr,
        estreno: estreno,
        fechaMontantes: fechaMontantes,
        fechaEntrega: fechaEntrega,
        inmobiliaria: isEstreno ? (opportunity.property?.inmobiliaria || 'N/A') : 'N/A',
        responsable: opportunity.property?.nombreResponsable || 'N/A',
        telefonoResponsable: opportunity.property?.telefonoResponsable || 'N/A',
        cargoResponsable: opportunity.property?.cargoResponsable || 'N/A',
        correoResponsable: opportunity.property?.correoResponsable || 'N/A',
        fechaVisitaTecnica: formatDate(opportunity.property?.fechaVisitaTecnica),
        horarioVisita: opportunity.property?.horarioVisita || 'N/A',
        juntaDirectiva: opportunity.property?.juntaDirectiva || 'No',
        codigoPostal: opportunity.property?.codigoPostal || '',
        totalTorres: totalTorres,
        totalHogares: totalHogares,
        origen: origenStr,
        clasificacion: opportunity.property?.clasificacionProyecto || 'EDIFICIO',
        tipoConstruccion: tipoConst
      },
      matrix: matrixStr,
      matrixList: matrixList,
      photos: photosPaths
    };

    if (job.name === 'send-win-request') {

      this.logger.log('Ejecutando Job de Solicitud de Asignación (Etapa 7) - Sin Excel');
      await this.emailService.sendAssignationRequestEmail(payload);
      
      this.logger.log('Correo de asignación enviado, transicionando a Etapa 8...');
      await this.triggerTransition(manager, opportunity.id, 'S8');
      
      return { status: 'success', message: 'Correo de asignación enviado correctamente' };
    }

    if (job.name === 'generate-excel') {
      this.logger.log('Ejecutando Job de Ficha de Datos (Etapa 15) - Con Excel');
      const pythonScript = path.resolve(__dirname, '../../../workers/excel_generator.py');
      const payloadJson = JSON.stringify(payload);

      return new Promise((resolve, reject) => {
        const pyCmd = process.platform === 'win32' ? 'py' : 'python';
        const pyProcess = spawn(pyCmd, [pythonScript, payloadJson]);
        let stdoutData = '';
        let stderrData = '';

        pyProcess.stdout.on('data', (data) => {
          stdoutData += data.toString();
        });

        pyProcess.stderr.on('data', (data) => {
          stderrData += data.toString();
        });

        pyProcess.on('close', (code) => {
          if (code !== 0) {
            this.logger.error(`Python script failed with code ${code}: ${stderrData} - STDOUT: ${stdoutData}`);
            return reject(new Error('Error generando reporte (Ficha de datos)'));
          }

          try {
            const result = JSON.parse(stdoutData);
            if (result.status === 'success') {
              this.logger.log(`Excel generado: ${result.file}`);
              // Ahora sí enviar el correo con el adjunto
              this.emailService.sendReportEmail(payload, result.file)
                .then(async () => {
                   // 2. Canal NOVACORE (Sheets)
                   if (payload.canalHunting === 'NOVACORE') {
                     await this.sheetsService.appendRow(payload);
                   }
                   
                   this.logger.log('Correo de Ficha y Excel generado, transicionando a Etapa 16...');
                   await this.triggerTransition(manager, opportunity.id, 'S16');
                   
                   resolve({ status: 'success', file: result.file });
                })
                .catch(err => reject(err));
            } else {
              this.logger.error(`Python error: ${result.message}`);
              reject(new Error(result.message));
            }
          } catch (e) {
            this.logger.error(`Error parsing Python output: ${e.message} - RAW OUT: ${stdoutData} - RAW ERR: ${stderrData}`);
            reject(new Error('Error leyendo salida de Python'));
          }
        });
      });
    }

    this.logger.warn(`Job name ${job.name} no reconocido`);
    return { status: 'ignored' };
  }

  /**
   * Ejecuta la transición de la oportunidad (e.g. S7 -> S8, S15 -> S16)
   */
  private async triggerTransition(manager: any, opportunityId: string, toCode: string) {
    try {
      const opp = await manager.findOne('Opportunity', { where: { id: opportunityId } });
      if (!opp) return;

      const newStage = await manager.findOne('PipelineStage', { where: { code: toCode, pipelineId: opp.pipelineId } });
      if (!newStage) return;

      const oldStageId = opp.currentStageId;
      opp.currentStageId = newStage.id;
      opp.currentStageEnteredAt = new Date();
      opp.lastActivityAt = new Date();
      await manager.save(opp);

      await manager.insert('OpportunityStageHistory', {
        opportunityId: opp.id,
        fromStageId: oldStageId,
        toStageId: newStage.id,
        reason: 'Transición Automática tras Worker exitoso',
        changedByUserId: null
      });
      this.logger.log(`Transición exitosa: Oportunidad ${opportunityId} movida a ${toCode}`);
    } catch (error) {
      this.logger.error(`Error al intentar transicionar oportunidad ${opportunityId} a ${toCode}: ${error.message}`);
    }
  }
}
