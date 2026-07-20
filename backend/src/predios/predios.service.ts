import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateRegistroInicialDto } from './dto/create-registro-inicial.dto';
import { UpdatePredioDto } from './dto/update-predio.dto';
import { CreatePropertyContactDto } from './dto/create-property-contact.dto';
import { Predio } from '../database/entities/predio.entity';
import { Torre } from '../database/entities/torre.entity';
import { Piso } from '../database/entities/piso.entity';
import { FormSubmission } from '../database/entities/form-submission.entity';
import { Contact } from '../database/entities/contact.entity';
import { PropertyContact } from '../database/entities/property-contact.entity';
import { Opportunity } from '../database/entities/opportunity.entity';
import { Distrito } from '../database/entities/distrito.entity';
import { PipelineStage } from '../database/entities/pipeline-stage.entity';
import { Pipeline } from '../database/entities/pipeline.entity';
import { LeadSource } from '../database/entities/lead-source.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class PrediosService {
  
  // Función para parsear la cantidad de hogares basada en la flexibilidad requerida
  private parseHogaresPorPiso(hogaresStr: number | string, totalPisos: number): number[] {
    if (typeof hogaresStr === 'number') {
      return Array(totalPisos).fill(hogaresStr);
    }
    
    if (typeof hogaresStr === 'string') {
      const parts = hogaresStr.split(',').map(p => parseInt(p.trim(), 10)).filter(p => !isNaN(p));
      if (parts.length === 1) {
        return Array(totalPisos).fill(parts[0]);
      } else if (parts.length > 0) {
        const arr = [];
        for (let i = 0; i < totalPisos; i++) {
          arr.push(parts[i] !== undefined ? parts[i] : 0);
        }
        return arr;
      }
    }
    return Array(totalPisos).fill(0);
  }

  async createPredio(user: any, dto: CreateRegistroInicialDto, manager: EntityManager) {
    console.log('[createPredio] Received DTO in backend:', JSON.stringify(dto));
    // ── 1. Resolver el UUID del distrito desde su nombre ──────────────────────
    const distritoNombre = dto.distrito?.trim();
    if (!distritoNombre) {
      throw new BadRequestException('El campo distrito es requerido.');
    }
    let distrito = await manager.createQueryBuilder(Distrito, 'd')
      .where('LOWER(TRIM(d.nombre)) = LOWER(TRIM(:nombre))', { nombre: distritoNombre })
      .getOne();
    if (!distrito) {
      // Si no existe aún en la BD, lo creamos dinámicamente
      distrito = manager.create(Distrito, { nombre: distritoNombre });
      await manager.save(distrito);
    }

    // ── 2. Resolver Pipeline y Etapa Inicial real desde la BD ─────────────────
    const pipeline = await manager.findOne(Pipeline, { where: { isActive: true } });
    if (!pipeline) {
      throw new BadRequestException('No existe un pipeline configurado.');
    }
    
    let targetStage: PipelineStage | null = null;
    if (user.role === 'ADMIN' || user.role === 'BACKOFFICE') {
      const codeToSearch = dto.initialStageCode || 'S4';
      targetStage = await manager.findOne(PipelineStage, {
        where: { pipelineId: pipeline.id, code: codeToSearch }
      });
    }

    if (!targetStage) {
      targetStage = await manager.findOne(PipelineStage, {
        where: { pipelineId: pipeline.id, isInitial: true }
      });
    }

    if (!targetStage) {
      throw new BadRequestException('El pipeline no tiene una etapa inicial configurada.');
    }

    // ── 3. Crear el Predio mapeando campos del formulario ─────────────────────
    const totalHPs = parseInt(dto.numeroHPs as string, 10) || 0;
    
    let direccionClean = (dto.direccion || '').trim();

    const assignedCompanyId = (user.role === 'ADMIN' || user.role === 'BACKOFFICE') && dto.companyId 
      ? dto.companyId 
      : user.companyId;

    const predio = manager.create(Predio, {
      companyId: assignedCompanyId,
      nombreProyecto: dto.nombreProyecto,
      direccionExacta: direccionClean,
      resultadoVisita: dto.resultadoVisita || '-',
      detalleVisita: dto.detalle || '-',
      tipoDesarrollo: dto.tipoDesarrollo || 'MULTIFAMILIAR',
      origenProspeccion: dto.origenProspeccion || 'TERRENO',
      clasificacionProyecto: dto.clasificacionProyecto || 'PRIMARIO',
      estadoConstruccion: dto.estadoConstruccion || 'EN_CONSTRUCCION',
      juntaDirectiva: dto.juntaDirectiva || 'NO',
      distritoId: distrito.id,
      departamento: dto.departamento || 'Lima',
      provincia: dto.provincia || 'Lima',
      tipoVia: '-',
      nombreVia: '-',
      numeracionMunicipal: '-',
      totalTorres: 1,
      totalHogares: totalHPs,
      hunterPrincipalId: user.id
    });

    // Coordenadas opcionales: "lat, lng" → point(lon, lat)
    if (dto.coordenadas) {
      const match = dto.coordenadas.match(/(-?\d+(?:\.\d+)?)\s*[,\s;\/]*\s*(-?\d+(?:\.\d+)?)/);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          predio.coordenadasGps = { x: lng, y: lat };
        }
      }
    }

    const savedPredio = await manager.save(predio);

    // ── 4. Torre por defecto con el número de HPs ─────────────────────────────
    if (totalHPs > 0) {
      const torre = manager.create(Torre, { predioId: savedPredio.id, nombreTorre: 'Torre 1' });
      const savedTorre = await manager.save(torre);
      const piso = manager.create(Piso, { torreId: savedTorre.id, numeroPiso: 1, hogaresCantidad: totalHPs });
      await manager.save(piso);
    }

    // ── 5. Génesis de la Oportunidad en la Etapa Inicial ─────────────────────
    let leadSource = await manager.findOne(LeadSource, { where: { name: 'Scraping' } });
    if (!leadSource) {
      leadSource = manager.create(LeadSource, { id: '00000000-0000-0000-0000-000000000002', name: 'Scraping', code: 'SCR' });
      await manager.save(leadSource);
    }

    let assignedOwnerId = user.id;
    if (dto.isReferral) {
      const boUser = await manager.findOne(User, { where: { role: 'BACKOFFICE', companyId: assignedCompanyId } });
      if (boUser) {
        assignedOwnerId = boUser.id;
      } else {
        const adminUser = await manager.findOne(User, { where: { role: 'ADMIN' } });
        if (adminUser) assignedOwnerId = adminUser.id;
      }
    }

    const opportunity = manager.create(Opportunity, {
      code: `OPP-${Date.now().toString().slice(-6)}`,
      companyId: assignedCompanyId,
      propertyId: savedPredio.id,
      createdByUserId: user.id,
      currentOwnerUserId: assignedOwnerId,
      status: 'OPEN',
      leadSourceId: leadSource.id,
      currentStageId: targetStage.id,  // UUID real de la BD
      pipelineId: pipeline.id,          // UUID real de la BD
      currentStageEnteredAt: new Date(),
      isReferral: dto.isReferral || false,
      referredHunterName: dto.referredHunterName,
      partnerSupervisorId: dto.partnerSupervisorId,
    });
    const savedOpportunity = await manager.save(opportunity);

    const submission = manager.create(FormSubmission, {
      opportunityId: opportunity.id,
      formCode: 'FORM_REGISTRO_INICIAL',
      submittedByUserId: user.id,
      rawPayloadJson: dto,
    });
    await manager.save(submission);

    return savedPredio;
  }

  async updatePredio(id: string, user: any, dto: UpdatePredioDto, manager: EntityManager) {
    const predio = await manager.findOne(Predio, {
      where: { id, companyId: user.companyId },
      relations: { torres: { pisos: true } }
    });

    if (!predio) throw new NotFoundException('Predio no encontrado');

    // Actualizar datos base
    Object.assign(predio, {
      ...dto,
      torresEstructura: undefined, // ignorar para Object.assign
      latitude: undefined,
      longitude: undefined,
      fechaEntrega: dto.fechaEntrega ? new Date(dto.fechaEntrega) : predio.fechaEntrega
    });

    if (dto.latitude && dto.longitude) {
      predio.coordenadasGps = { x: dto.longitude, y: dto.latitude };
    }

    // Reestructurar Torres y Pisos si vienen en el payload (Manejo de Cascada Físico)
    if (dto.torresEstructura) {
      predio.totalTorres = dto.torresEstructura.length;
      let totalHogaresGlobal = 0;

      // Borrar torres excedentes si hay menos torres ahora
      const torresToDelete = predio.torres.slice(dto.torresEstructura.length);
      if (torresToDelete.length > 0) {
        await manager.remove(torresToDelete); // DELETE físico
      }

      for (let i = 0; i < dto.torresEstructura.length; i++) {
        const torreDto = dto.torresEstructura[i];
        let torre = predio.torres[i];
        
        // Si no existe, crearla
        if (!torre) {
          torre = manager.create(Torre, {
            predioId: predio.id,
            nombreTorre: torreDto.nombreTorre || `Torre ${i + 1}`
          });
          torre = await manager.save(torre);
          torre.pisos = [];
        } else {
          // Actualizar nombre
          if (torreDto.nombreTorre) {
            torre.nombreTorre = torreDto.nombreTorre;
            await manager.save(torre);
          }
        }

        const hogaresArray = this.parseHogaresPorPiso(torreDto.hogaresPorPiso, torreDto.totalPisos);

        // Borrar pisos excedentes
        const pisosToDelete = torre.pisos.slice(torreDto.totalPisos);
        if (pisosToDelete.length > 0) {
          await manager.remove(pisosToDelete); // DELETE físico
        }

        for (let p = 0; p < torreDto.totalPisos; p++) {
          const hogares = hogaresArray[p] || 0;
          let piso = torre.pisos[p];
          if (!piso) {
            piso = manager.create(Piso, {
              torreId: torre.id,
              numeroPiso: p + 1,
              hogaresCantidad: hogares
            });
          } else {
            piso.hogaresCantidad = hogares;
          }
          await manager.save(piso);
          totalHogaresGlobal += hogares;
        }
      }
      predio.totalHogares = totalHogaresGlobal;
    }

    await manager.save(predio);
    return predio;
  }

  async addContact(predioId: string, user: any, dto: CreatePropertyContactDto, manager: EntityManager) {
    const predio = await manager.findOne(Predio, { where: { id: predioId, companyId: user.companyId } });
    if (!predio) throw new NotFoundException('Predio no encontrado');

    // Buscar si el contacto ya existe por email o crearlo (lógica simplificada)
    let contact = null;
    if (dto.email) {
      contact = await manager.findOne(Contact, { where: { email: dto.email, companyId: user.companyId } });
    }
    
    if (!contact) {
      contact = manager.create(Contact, {
        companyId: user.companyId,
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email,
        contactType: dto.contactType,
        createdByUserId: user.id
      });
      contact = await manager.save(contact);
    }

    // Si este va a ser primario, quitar el flag a otros si existieran (opcional, dependiendo regla de negocio, aquí asumimos simple)
    if (dto.isPrimary) {
      await manager.update(PropertyContact, { propertyId: predioId, isPrimary: true }, { isPrimary: false });
    }

    const propContact = manager.create(PropertyContact, {
      propertyId: predio.id,
      contactId: contact.id,
      relationshipType: dto.relationshipType,
      isPrimary: dto.isPrimary || false
    });

    await manager.save(propContact);
    return propContact;
  }
}
