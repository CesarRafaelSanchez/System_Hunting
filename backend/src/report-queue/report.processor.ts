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
    
    // 1. Extraer los datos de la oportunidad (y sus relaciones simuladas)
    const opportunity = await this.opportunityRepository.findOne({
      where: { id: job.data.opportunityId },
      relations: { property: true }
    });

    if (!opportunity) {
      this.logger.error(`Oportunidad ${job.data.opportunityId} no encontrada`);
      throw new Error('Oportunidad no encontrada');
    }

    const payload = {
      opportunityId: opportunity.code,
      canalHunting: opportunity.canalHunting || 'NOVACORE',
      property: job.data.property || {
        nombreEdificio: opportunity.property?.nombreProyecto || 'Mock Edificio',
        tipoEdificio: opportunity.property?.tipoDesarrollo || 'Estreno',
        direccion: (opportunity.property?.tipoVia || '') + ' ' + (opportunity.property?.nombreVia || '') + ' ' + (opportunity.property?.numeracionMunicipal || ''),
        distrito: opportunity.property?.distrito?.nombre || 'Lima',
        coordenadas: opportunity.property?.coordenadasGps || '-12.04318, -77.02824',
        estreno: 'No',
        fechaMontantes: 'N/A',
        fechaEntrega: 'N/A',
        inmobiliaria: 'N/A',
        responsable: 'Administrador',
        telefonoResponsable: '999999999'
      },
      matrix: job.data.matrix || '4,4,4,4',
      photos: job.data.photos || []
    };

    if (job.name === 'send-win-request') {
      this.logger.log('Ejecutando Job de Solicitud de Asignación (Etapa 7) - Sin Excel');
      await this.emailService.sendAssignationRequestEmail(payload);
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
}
