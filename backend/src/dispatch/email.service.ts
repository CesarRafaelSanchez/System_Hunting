import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config(); // fallback to current dir

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    console.log("Valores SMTP:", process.env.EMAIL_EMISOR, process.env.EMAIL_PASSWORD ? "Cargada" : "Vacía");
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER || 'mail.conection-futura.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_EMISOR,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendAssignationRequestEmail(data: any) {
    try {
      const p = data.property || {};
      const body = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <p>Estimados,</p>
        <p>Solicitamos la asignación del predio en mención.</p>
        
        <h3 style="color: #0056b3; border-bottom: 2px solid #0056b3; padding-bottom: 5px;">FORMATO DE ASIGNACION</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
          <tbody>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold; width: 40%;">Tipo de Predio</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${p.tipoEdificio || 'Edificio'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Nombre del predio</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${p.nombreEdificio || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Direccion</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${p.direccion || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Distrito</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${p.distrito || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Coordenadas</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${p.coordenadas || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Estreno</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${p.estreno || 'No'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Fecha de Instalación de Montantes</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${p.fechaMontantes || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Fecha de Entrega a los Propietarios</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${p.fechaEntrega || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Inmobiliaria</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${p.inmobiliaria || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
        
        <br>
        <p>Saludos,<br>
        <strong>Stefano Sotomarino Goche</strong><br>
        <span style="color: #666; font-size: 12px;">Back Office - Futura</span></p>
      </div>`;

      const mailOptions = {
        from: `"Sistema Hunting" <${process.env.EMAIL_EMISOR}>`,
        to: process.env.EMAIL_DESTINO,
        cc: process.env.EMAIL_CC_FICHA_DATOS,
        subject: `[FUTURA] Solicitud de Asignación - ${p.nombreEdificio || 'Predio'}`,
        html: body,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Correo de Asignación enviado exitosamente: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Error enviando correo de Asignación SMTP: ${error.message}`);
    }
  }

  async sendReportEmail(data: any, filePath: string) {
    try {
      const p = data.property || {};
      const body = `Buen día,

Se adjunta la ficha de datos correspondiente al proyecto:

${p.nombreEdificio || 'N/A'}

Datos principales:
- Distrito: ${p.distrito || 'N/A'}
- Dirección: ${p.direccion || 'N/A'}
- Responsable: ${p.responsable || 'N/A'}
- Teléfono: ${p.telefonoResponsable || 'N/A'}

Saludos,
Futura`;

      const mailOptions = {
        from: `"Sistema Hunting" <${process.env.EMAIL_EMISOR}>`,
        to: process.env.EMAIL_DESTINO,
        cc: process.env.EMAIL_CC_FICHA_DATOS,
        subject: `[FUTURA] Ficha de Datos - ${p.nombreEdificio || 'Predio'}`,
        text: body, // Plaintext
        attachments: [
          {
            filename: `Ficha_${data.opportunityId}.xlsx`,
            path: filePath,
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Correo de Ficha enviado exitosamente: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Error enviando correo Ficha SMTP: ${error.message}`);
    }
  }
}
