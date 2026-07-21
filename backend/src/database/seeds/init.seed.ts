import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company } from '../entities/company.entity';
import { User } from '../entities/user.entity';
import { Distrito } from '../entities/distrito.entity';
import { Pipeline } from '../entities/pipeline.entity';
import { PipelineStage } from '../entities/pipeline-stage.entity';
import { LeadSource } from '../entities/lead-source.entity';
import * as bcrypt from 'bcrypt';

import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const dataSource = app.get(DataSource);
  const companyRepo = dataSource.getRepository(Company);
  const userRepo = dataSource.getRepository(User);

  console.log('--- Iniciando Seeder de Base de Datos ---');

  // 1. Crear Empresa
  let company = await companyRepo.findOne({ where: { name: 'Empresa Base E2E' } });
  if (!company) {
    company = companyRepo.create({
      name: 'Empresa Base E2E',
      slug: 'empresa-base-e2e',
      ruc: '20123456789'
    });
    company = await companyRepo.save(company);
    console.log(`[+] Empresa Base E2E creada: ${company.id}`);
  } else {
    console.log(`[=] Empresa Base ya existe: ${company.id}`);
  }

  // 2. Hash Password
  const passwordHash = await bcrypt.hash('Prueba123!', 10);

  // 3. Crear Usuarios Reales
  const usersToSeed = [
    { email: 'humberto.benavides@futura.pe', fullName: 'Humberto Benavides', role: 'ADMIN' },
    { email: 'mathias.villena@futura.pe', fullName: 'Mathias Villena', role: 'ADMIN' },
    { email: 'cesar.sanchez@futura.pe', fullName: 'Cesar Sanchez', role: 'ADMIN' },
    
    { email: 'stefano.sotomarino@futura.pe', fullName: 'Stefano Sotomarino Goche', role: 'BACKOFFICE' },
    { email: 'alexander.watson@futura.pe', fullName: 'Alexander Watson Huamani', role: 'BACKOFFICE' },
    
    { email: 'jean.sihue@futura.pe', fullName: 'Jean Pierre Sihue Silva', role: 'HUNTER' },
    { email: 'carmen.yanagui@futura.pe', fullName: 'Carmen Yanagui Uribe', role: 'HUNTER' },
    { email: 'karlo.dominguez@futura.pe', fullName: 'Karlo Gabriel Dominguez Chavez', role: 'HUNTER' },
    { email: 'ruben.bastardo@futura.pe', fullName: 'Rubén Dario Bastardo Rivera', role: 'HUNTER' },
    { email: 'rosa.acuna@futura.pe', fullName: 'Rosa Jenifer Acuña Vargas', role: 'HUNTER' },
    { email: 'lorena.segura@futura.pe', fullName: 'Lorena Lizet Segura Solis', role: 'HUNTER' },
    { email: 'alex.correa@futura.pe', fullName: 'Alex Aldair Correa Peralta', role: 'HUNTER' },
    { email: 'victor.urrunaga@futura.pe', fullName: 'Victor Enrique Urrunaga Solis', role: 'HUNTER' },
    { email: 'mario.murgado@futura.pe', fullName: 'Mario Eugenio Murgado Blas', role: 'HUNTER' },
    { email: 'isabel.miranda@futura.pe', fullName: 'Isabel Milagros Miranda Castillo', role: 'HUNTER' },
    { email: 'stephany.arias@futura.pe', fullName: 'Stephany Anthuaneth Arias Quiroz', role: 'HUNTER' },
    { email: 'jean.requelme@futura.pe', fullName: 'Jean Pierre Requelme Veliz', role: 'HUNTER' }
  ];

  const hunters: User[] = [];
  const backoffices: User[] = [];

  const userCompanyRepo = dataSource.getRepository(require('../entities/user-company.entity').UserCompany);

  for (const u of usersToSeed) {
    let user = await userRepo.findOne({ where: { email: u.email } });
    
    // Map seed role to a global role if ADMIN, else null
    const gRole = u.role === 'ADMIN' ? 'AGENCY_ADMIN' : null;
    // Local role is the original role, unless it's ADMIN then they could be ACCOUNT_ADMIN locally if we want, but global role covers it.
    const lRole = u.role === 'ADMIN' ? 'ACCOUNT_ADMIN' : u.role;

    if (!user) {
      user = userRepo.create({
        email: u.email,
        fullName: u.fullName,
        passwordHash,
        globalRole: gRole,
        isActive: true
      });
      user = await userRepo.save(user);
      console.log(`[+] Usuario Creado: ${u.email} con Global Role ${gRole}`);
    } else {
      user.globalRole = gRole;
      user.passwordHash = passwordHash;
      await userRepo.save(user);
      console.log(`[=] Usuario ya existe: ${u.email}, actualizado GlobalRol/Password.`);
    }

    let uc = await userCompanyRepo.findOne({ where: { userId: user.id, companyId: company.id } });
    if (!uc) {
      uc = userCompanyRepo.create({
        userId: user.id,
        companyId: company.id,
        role: lRole,
        isActive: true
      });
      await userCompanyRepo.save(uc);
    } else {
      uc.role = lRole;
      await userCompanyRepo.save(uc);
    }

    if (lRole === 'HUNTER') hunters.push(user);
    if (lRole === 'BACKOFFICE') backoffices.push(user);
  }

  // (Optional) Crear un distrito base
  try {
     const distritoRepo = dataSource.getRepository(Distrito);
     let dist = await distritoRepo.findOne({ where: { nombre: 'San Isidro' } });
     if (!dist) {
         dist = distritoRepo.create({ id: '44444444-4444-4444-4444-444444444443', nombre: 'San Isidro' });
         await distritoRepo.save(dist);
         console.log(`[+] Distrito Creado: San Isidro`);
     }

     const pipelineRepo = dataSource.getRepository(Pipeline);
     let pipe = await pipelineRepo.findOne({ where: { name: 'Pipeline Base' } });
     if (!pipe) {
       pipe = pipelineRepo.create({ id: '00000000-0000-0000-0000-000000000003', name: 'Pipeline Base', code: 'PB' });
       await pipelineRepo.save(pipe);
     }

     const stageRepo = dataSource.getRepository(PipelineStage);
     
     const OFFICIAL_STAGES = [
      'Edificio Prospectado',
      'Prospecto Aceptado / Trabajable',
      'Prospecto Rechazado / No Trabajable',
      'Pendiente Envío de Formulario de Asignación',
      'Formulario de Asignación/Reasignación Completado',
      'Validación Back Office',
      'Solicitud de Asignación/Reasignación Enviada a WIN',
      'Esperando Respuesta WIN',
      'Asignación Aprobada',
      'Asignación Rechazada',
      'Pendiente Reasignación',
      'Pendiente Envío de Formulario Ficha de Datos',
      'Formulario de Ficha de Datos Completado',
      'Validación Back Office 2',
      'Ficha de Datos Enviada a WIN',
      'Pendiente Inicio de Habilitación (construcción)',
      'En Habilitación Técnica',
      'Standby por Accesos',
      'Habilitación Completa',
      'Hunting Perdido/ No Recuperable'
     ];

     const stageEntities = [];
     for (let i = 0; i < OFFICIAL_STAGES.length; i++) {
       const stageName = OFFICIAL_STAGES[i];
       const position = i + 1;
       let stage = await stageRepo.findOne({ where: { name: stageName, pipelineId: pipe.id } });
       if (!stage) {
         let stageType = 'STANDARD';
         let isWon = false;
         let isLost = false;
         let isFinal = false;

         if (stageName === 'Habilitación Completa') {
           stageType = 'WON';
           isWon = true;
           isFinal = true;
         } else if (stageName === 'Hunting Perdido/ No Recuperable' || stageName === 'Prospecto Rechazado / No Trabajable') {
           stageType = 'LOST';
           isLost = true;
           isFinal = true;
         }

         stage = stageRepo.create({
           pipelineId: pipe.id,
           name: stageName,
           code: `S${position}`,
           position,
           isInitial: position === 1,
           isWon,
           isLost,
           isFinal,
           stageType
         });
         stage = await stageRepo.save(stage);
       }
       stageEntities.push(stage);
     }

     const leadSourceRepo = dataSource.getRepository(LeadSource);
     let lead = await leadSourceRepo.findOne({ where: { name: 'Scraping' } });
     if (!lead) {
       lead = leadSourceRepo.create({ id: '00000000-0000-0000-0000-000000000002', name: 'Scraping', code: 'SCR' });
       await leadSourceRepo.save(lead);
     }
     console.log(`[+] Pipeline, 20 Stages Oficiales y LeadSource creados.`);

     // Sembrar 10 Oportunidades y Predios
     const predioRepo = dataSource.getRepository('Predio');
     const oppRepo = dataSource.getRepository('Opportunity');

     console.log('--- Iniciando siembra de 40 Predios/Oportunidades simuladas ---');
     for (let i = 1; i <= 40; i++) {
       // Asignar cazador y backoffice alternadamente para distribución equitativa
       const assignedHunter = hunters[i % hunters.length];
       const assignedBO = backoffices[i % backoffices.length];

       // Variedad de etapas
       let stageIndex = 0; // Edificio Prospectado
       let status = 'OPEN';
       let motivoCierre = null;
       
       if (i % 5 === 0) stageIndex = 5; // Validación Back Office (1 etapa BO)
       if (i % 10 === 0) {
         stageIndex = 18; // Habilitación Completa
         status = 'WON';
       }
       if (i % 13 === 0) {
         stageIndex = 19; // Hunting Perdido
         status = 'LOST';
         motivoCierre = 'Competencia / Sin Interés';
       }

       const currentStage = stageEntities[stageIndex];

       // Determinar Owner: si es etapa de validación, el owner es BO
       const ownerUser = (stageIndex === 5) ? assignedBO : assignedHunter;

       // Crear Predio
       let predio = await predioRepo.findOne({ where: { nombreProyecto: `Edificio Ficticio ${i}` } });
       if (!predio) {
         predio = predioRepo.create({
           companyId: company.id,
           nombreProyecto: `Edificio Ficticio ${i}`,
           tipoDesarrollo: 'Residencial',
           origenProspeccion: 'Scraping',
           clasificacionProyecto: 'A',
           estadoConstruccion: 'En planos',
           juntaDirectiva: 'Sí',
           distritoId: dist.id,
           tipoVia: 'Avenida',
           nombreVia: `Principal ${i}`,
           numeracionMunicipal: `10${i}`,
           hunterPrincipalId: assignedHunter?.id
         });
         predio = await predioRepo.save(predio);
       }

       // Crear Oportunidad
       let opp = await oppRepo.findOne({ where: { propertyId: predio.id } });
       if (!opp) {
         opp = oppRepo.create({
           code: `OPP-SIM-${Date.now().toString().slice(-4)}${i}`,
           companyId: company.id,
           propertyId: predio.id,
           leadSourceId: lead.id,
           pipelineId: pipe.id,
           currentStageId: currentStage.id,
           currentOwnerUserId: ownerUser?.id,
           createdByUserId: assignedHunter?.id,
           canalHunting: i % 2 === 0 ? 'FUTURA' : 'NOVACORE',
           status,
           motivoCierre,
           currentStageEnteredAt: new Date()
         });
         await oppRepo.save(opp);
         console.log(`[+] Oportunidad Creada: ${opp.code} en Etapa ${currentStage.name} (Hunter: ${assignedHunter?.fullName})`);
       }
     }
     console.log('--- 40 Oportunidades listas ---');

  } catch (e) {
     console.log('Aviso (Ignorar si no aplica):', e.message);
  }

  console.log('--- Seeding Terminado ---');
  await app.close();
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
