import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreatePredioDto } from './dto/create-predio.dto';
import { UpdatePredioDto } from './dto/update-predio.dto';
import { CreatePropertyContactDto } from './dto/create-property-contact.dto';
import { Predio } from '../database/entities/predio.entity';
import { Torre } from '../database/entities/torre.entity';
import { Piso } from '../database/entities/piso.entity';
import { Contact } from '../database/entities/contact.entity';
import { PropertyContact } from '../database/entities/property-contact.entity';
import { Opportunity } from '../database/entities/opportunity.entity';

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

  async createPredio(user: any, dto: CreatePredioDto, manager: EntityManager) {
    let totalHogaresGlobal = 0;
    const totalTorres = dto.torresEstructura?.length || 1;

    // Crear la entidad principal
    const predio = manager.create(Predio, {
      companyId: user.companyId,
      nombreProyecto: dto.nombreProyecto,
      tipoDesarrollo: dto.tipoDesarrollo,
      origenProspeccion: dto.origenProspeccion,
      clasificacionProyecto: dto.clasificacionProyecto,
      estadoConstruccion: dto.estadoConstruccion,
      fechaEntrega: dto.fechaEntrega ? new Date(dto.fechaEntrega) : undefined,
      juntaDirectiva: dto.juntaDirectiva,
      distritoId: dto.distritoId,
      tipoVia: dto.tipoVia,
      nombreVia: dto.nombreVia,
      numeracionMunicipal: dto.numeracionMunicipal,
      totalTorres: totalTorres,
      hunterPrincipalId: user.id
    });

    if (dto.latitude && dto.longitude) {
      predio.coordenadasGps = `(${dto.longitude},${dto.latitude})`;
    }

    const savedPredio = await manager.save(predio);

    // Iterar y crear infraestructura relacional (Torres y Pisos)
    if (dto.torresEstructura && dto.torresEstructura.length > 0) {
      for (let i = 0; i < dto.torresEstructura.length; i++) {
        const torreDto = dto.torresEstructura[i];
        
        const torre = manager.create(Torre, {
          predioId: savedPredio.id,
          nombreTorre: torreDto.nombreTorre || `Torre ${i + 1}`
        });
        
        const savedTorre = await manager.save(torre);
        const hogaresArray = this.parseHogaresPorPiso(torreDto.hogaresPorPiso, torreDto.totalPisos);

        for (let p = 0; p < torreDto.totalPisos; p++) {
          const hogares = hogaresArray[p] || 0;
          const piso = manager.create(Piso, {
            torreId: savedTorre.id,
            numeroPiso: p + 1,
            hogaresCantidad: hogares
          });
          await manager.save(piso);
          totalHogaresGlobal += hogares;
        }
      }
    }

    // Actualizar el total de hogares en el predio
    savedPredio.totalHogares = totalHogaresGlobal;
    await manager.save(savedPredio);

    // Automatizar el Génesis de la Oportunidad (Etapa 1)
    const opportunity = manager.create(Opportunity, {
      code: `OPP-${Date.now().toString().slice(-6)}`,
      companyId: user.companyId,
      propertyId: savedPredio.id,
      createdByUserId: user.id,
      currentOwnerUserId: user.id,
      status: 'OPEN',
      canalHunting: 'TERRENO', // Default MVP
      currentStageId: '00000000-0000-0000-0000-000000000001', // UUID dummy MVP para Etapa 1
      leadSourceId: '00000000-0000-0000-0000-000000000002', // UUID dummy MVP
      pipelineId: '00000000-0000-0000-0000-000000000003', // UUID dummy MVP
      currentStageEnteredAt: new Date(),
    });
    await manager.save(opportunity);

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
      predio.coordenadasGps = `(${dto.longitude},${dto.latitude})`;
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
