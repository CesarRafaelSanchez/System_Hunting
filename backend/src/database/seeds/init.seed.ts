import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Company } from '../entities/company.entity';
import { User } from '../entities/user.entity';
import { UserCompany } from '../entities/user-company.entity';
import { Distrito } from '../entities/distrito.entity';
import { Pipeline } from '../entities/pipeline.entity';
import { PipelineStage } from '../entities/pipeline-stage.entity';
import { LeadSource } from '../entities/lead-source.entity';
import { VentaFija } from '../entities/venta-fija.entity';
import { Team } from '../entities/team.entity';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const companyRepo = dataSource.getRepository(Company);
  const userRepo = dataSource.getRepository(User);
  const userCompanyRepo = dataSource.getRepository(UserCompany);
  const distritoRepo = dataSource.getRepository(Distrito);
  const pipelineRepo = dataSource.getRepository(Pipeline);
  const stageRepo = dataSource.getRepository(PipelineStage);
  const leadSourceRepo = dataSource.getRepository(LeadSource);
  const predioRepo = dataSource.getRepository('Predio');
  const oppRepo = dataSource.getRepository('Opportunity');
  const ventaFijaRepo = dataSource.getRepository(VentaFija);
  const teamRepo = dataSource.getRepository(Team);

  console.log('--- Iniciando Seeder Automático de Base de Datos Multi-Tenant ---');

  const passwordHash = await bcrypt.hash('Prueba123!', 10);

  // 1. Crear Administrador Global de la Agencia
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@tuempresa.com';
  const adminName = process.env.INITIAL_ADMIN_NAME || 'Administrador de Agencia';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Prueba123!';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  let agencyAdmin = await userRepo.findOne({ where: { email: adminEmail } });
  if (!agencyAdmin) {
    agencyAdmin = userRepo.create({
      email: adminEmail,
      fullName: adminName,
      passwordHash: adminPasswordHash,
      globalRole: 'AGENCY_ADMIN',
      isActive: true,
      role: 'AGENCY_ADMIN', // Legacy fallback
    });
    agencyAdmin = await userRepo.save(agencyAdmin);
    console.log(`[+] AGENCY_ADMIN Creado: ${adminEmail}`);
  } else {
    agencyAdmin.fullName = adminName;
    agencyAdmin.passwordHash = adminPasswordHash;
    agencyAdmin.globalRole = 'AGENCY_ADMIN';
    agencyAdmin.role = 'AGENCY_ADMIN';
    agencyAdmin.isActive = true;
    agencyAdmin = await userRepo.save(agencyAdmin);
    console.log(`[*] AGENCY_ADMIN Actualizado: ${adminEmail}`);
  }

  // 2. Crear las 3 Compañías Semilla
  const seedCompanies = [
    { name: 'Futura', slug: 'futura', ruc: '20111111111', tipoNegocio: 'HUNTING_EDIFICIOS' },
    { name: 'Novacore', slug: 'novacore', ruc: '20222222222', tipoNegocio: 'HUNTING_EDIFICIOS' },
    { name: 'FS', slug: 'fs', ruc: '20333333333', tipoNegocio: 'VENTAS_B2B' },
  ];

  const companiesMap: Record<string, Company> = {};

  for (const c of seedCompanies) {
    let company = await companyRepo.findOne({ where: { slug: c.slug } });
    if (!company) {
      company = companyRepo.create({
        name: c.name,
        slug: c.slug,
        ruc: c.ruc,
        tipoNegocio: c.tipoNegocio,
        isActive: true,
      });
      company = await companyRepo.save(company);
      console.log(`[+] Compañía ${c.name} creada (Vertical: ${c.tipoNegocio})`);
    } else {
      company.tipoNegocio = c.tipoNegocio; // Asegurar consistencia
      company = await companyRepo.save(company);
      console.log(`[=] Compañía ${c.name} ya existe.`);
    }
    companiesMap[c.slug] = company;
  }

  // 3. Crear Pipelines y Etapas Oficiales
  const HUNTING_STAGES = [
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
    'Hunting Perdido/ No Recuperable',
  ];

  const VENTAS_STAGES = [
    'Lead',
    'Sin Factibilidad 1',
    '25% Propuesta Enviada',
    'SEC Creada',
    'Rechazo Oferta',
    '50% Propuesta Aceptada',
    'Llamada Validación',
    '75% Agendada',
    'SOT Creada',
    'Confirmación Visita',
    'Técnico no Asiste',
    'Cliente no Contesta',
    'Sin Factibilidad',
    'Instalación Incompleta',
    '100% Instalación Completada',
    // ── TRAMO POSTVENTA ──
    'Llamada de Control',
    'Llamada Postventa',
    'Recibo 1',
    'Recibo 2',
    'Recibo 3',
    'Baja de Cliente',
  ];

  const pipelineMap: Record<string, Pipeline> = {};
  const stagesMap: Record<string, PipelineStage[]> = {};

  for (const slug of ['futura', 'novacore', 'fs']) {
    const comp = companiesMap[slug];
    const isVentas = comp.tipoNegocio === 'VENTAS_B2B';
    const pipeName = `Pipeline ${comp.name}`;
    const pipeCode = isVentas ? `PVB-${slug.toUpperCase()}` : `PHU-${slug.toUpperCase()}`;

    let pipeline = await pipelineRepo.findOne({ where: { name: pipeName, companyId: comp.id } });
    if (!pipeline) {
      pipeline = pipelineRepo.create({
        name: pipeName,
        code: pipeCode,
        companyId: comp.id,
      });
      pipeline = await pipelineRepo.save(pipeline);
      console.log(`[+] Pipeline creado para ${comp.name}`);
    }
    pipelineMap[slug] = pipeline;

    const stagesList = isVentas ? VENTAS_STAGES : HUNTING_STAGES;
    const currentStages: PipelineStage[] = [];

    for (let i = 0; i < stagesList.length; i++) {
      const sName = stagesList[i];
      const pos = i + 1;
      let stage = await stageRepo.findOne({ where: { name: sName, pipelineId: pipeline.id } });
      
      let stageType = 'STANDARD';
      let isWon = false;
      let isLost = false;
      let isFinal = false;

      if (sName === 'Habilitación Completa' || sName === 'Recibo 3') {
        stageType = 'WON';
        isWon = true;
        isFinal = true;
      } else if (
        sName === 'Hunting Perdido/ No Recuperable' ||
        sName === 'Prospecto Rechazado / No Trabajable' ||
        sName === 'Sin Factibilidad' ||
        sName === 'Rechazo Oferta' ||
        sName === 'Baja de Cliente'
      ) {
        stageType = 'LOST';
        isLost = true;
        isFinal = true;
      }

      if (!stage) {
        stage = stageRepo.create({
          pipelineId: pipeline.id,
          name: sName,
          code: `${pipeCode}-S${pos}`,
          position: pos,
          isInitial: pos === 1,
          isWon,
          isLost,
          isFinal,
          stageType,
        });
        stage = await stageRepo.save(stage);
      } else {
        // Actualizar flags si la etapa ya existe (migración de '100% Instalación Completada' de WON → STANDARD)
        let needsUpdate = false;
        if (stage.isWon !== isWon) { stage.isWon = isWon; needsUpdate = true; }
        if (stage.isLost !== isLost) { stage.isLost = isLost; needsUpdate = true; }
        if (stage.isFinal !== isFinal) { stage.isFinal = isFinal; needsUpdate = true; }
        if (stage.stageType !== stageType) { stage.stageType = stageType; needsUpdate = true; }
        if (stage.position !== pos) { stage.position = pos; needsUpdate = true; }
        if (needsUpdate) {
          await stageRepo.save(stage);
          console.log(`    [~] Etapa actualizada: ${sName} (${stageType})`);
        }
      }
      currentStages.push(stage);
    }
    stagesMap[slug] = currentStages;
  }

  // 4. Crear Usuarios y Vincular a Subcuentas (Multi-Membresía)
  const usersToSeed = [
    // Futura
    { email: 'admin@futura.pe', fullName: 'Admin Futura', slug: 'futura', role: 'ACCOUNT_ADMIN', supervisorEmail: null },
    { email: 'supervisor@futura.pe', fullName: 'Supervisor Futura', slug: 'futura', role: 'SUPERVISOR_HUNTING', supervisorEmail: null },
    { email: 'backoffice@futura.pe', fullName: 'BO Futura', slug: 'futura', role: 'BACKOFFICE', supervisorEmail: null },
    { email: 'hunter@futura.pe', fullName: 'Hunter Futura', slug: 'futura', role: 'HUNTER', supervisorEmail: null },
    // Novacore
    { email: 'admin@novacore.pe', fullName: 'Admin Novacore', slug: 'novacore', role: 'ACCOUNT_ADMIN', supervisorEmail: null },
    { email: 'hunter@novacore.pe', fullName: 'Hunter Novacore', slug: 'novacore', role: 'HUNTER', supervisorEmail: null },
    // FS (Ventas B2B) - Administradores y Auxiliares
    { email: 'admin@fs.pe', fullName: 'Admin FS', slug: 'fs', role: 'ACCOUNT_ADMIN', supervisorEmail: null },
    { email: 'backoffice@fs.pe', fullName: 'Backoffice FS', slug: 'fs', role: 'BACKOFFICE', supervisorEmail: null },
    { email: 'postventa@fs.pe', fullName: 'Postventa FS', slug: 'fs', role: 'POSTVENTA', supervisorEmail: null },
    { email: 'asesor.test@fs.pe', fullName: 'Asesor Prueba', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'giovanni.figueroa@conection-futura.com' },
    
    // FS - Supervisores
    { email: 'giovanni.figueroa@conection-futura.com', fullName: 'Giovanni Figueroa', slug: 'fs', role: 'SUPERVISOR_VENTAS', supervisorEmail: null },
    { email: 'joselyn.rengifo@conection-futura.com', fullName: 'Joselyn Rengifo', slug: 'fs', role: 'SUPERVISOR_VENTAS', supervisorEmail: null },
    { email: 'edwin.roca@conection-futura.com', fullName: 'Edwin Roca', slug: 'fs', role: 'SUPERVISOR_VENTAS', supervisorEmail: null },
    { email: 'subagencia@conection-futura.com', fullName: 'SubAgencia', slug: 'fs', role: 'SUPERVISOR_VENTAS', supervisorEmail: null },
    
    // FS - Asesores de Giovanni Figueroa
    { email: 'sheyla.rivera@conection-futura.com', fullName: 'SHEYLA RIVERA', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'giovanni.figueroa@conection-futura.com' },
    { email: 'brigith.vilca@conection-futura.com', fullName: 'BRIGITH VILCA', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'giovanni.figueroa@conection-futura.com' },
    { email: 'ivan.oyola@conection-futura.com', fullName: 'IVAN OYOLA', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'giovanni.figueroa@conection-futura.com' },
    { email: 'nancy.crisostomo@conection-futura.com', fullName: 'NANCY CRISOSTOMO', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'giovanni.figueroa@conection-futura.com' },
    { email: 'subagencia.giovanni@conection-futura.com', fullName: 'SUBAGENCIA (G)', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'giovanni.figueroa@conection-futura.com' },
    { email: 'giovanni.personal@conection-futura.com', fullName: 'GIOVANNI FIGUEROA (P)', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'giovanni.figueroa@conection-futura.com' },

    // FS - Asesores de Joselyn Rengifo
    { email: 'lesly.vargas@conection-futura.com', fullName: 'LESLY VARGAS', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'joselyn.rengifo@conection-futura.com' },
    { email: 'william.santacruz@conection-futura.com', fullName: 'WILLIAM SANTA CRUZ', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'joselyn.rengifo@conection-futura.com' },
    { email: 'ivette.pachas@conection-futura.com', fullName: 'IVETTE PACHAS', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'joselyn.rengifo@conection-futura.com' },
    { email: 'hellen.flores@conection-futura.com', fullName: 'HELLEN FLORES', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'joselyn.rengifo@conection-futura.com' },
    { email: 'carlos.alvarez@conection-futura.com', fullName: 'CARLOS ALVAREZ', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'joselyn.rengifo@conection-futura.com' },

    // FS - Asesores de Edwin Roca
    { email: 'katherine.zapata@conection-futura.com', fullName: 'KATHERINE ZAPATA', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'edwin.roca@conection-futura.com' },
    { email: 'deysi.diaz@conection-futura.com', fullName: 'DEYSI DIAZ', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'edwin.roca@conection-futura.com' },
    { email: 'subagencia.edwin@conection-futura.com', fullName: 'SUBAGENCIA (E)', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'edwin.roca@conection-futura.com' },
    { email: 'rebeca.boza@conection-futura.com', fullName: 'REBECA BOZA', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'edwin.roca@conection-futura.com' },
    { email: 'marco.perez@conection-futura.com', fullName: 'MARCO PEREZ', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'edwin.roca@conection-futura.com' },

    // FS - Asesores de SubAgencia
    { email: 'pablo.saenz@conection-futura.com', fullName: 'PABLO SAENZ', slug: 'fs', role: 'ASESOR_VENTAS', supervisorEmail: 'subagencia@conection-futura.com' },
  ];

  const userInstanceMap: Record<string, User> = {};

  for (const item of usersToSeed) {
    const comp = companiesMap[item.slug];
    let user = await userRepo.findOne({ where: { email: item.email } });
    if (!user) {
      user = userRepo.create({
        email: item.email,
        fullName: item.fullName,
        passwordHash,
        isActive: true,
        companyId: comp.id,
        role: item.role,
      });
      user = await userRepo.save(user);
      console.log(`[+] Usuario Creado: ${item.email}`);
    }
    userInstanceMap[item.email] = user;

    // Vincular en pivote user_companies
    let userComp = await userCompanyRepo.findOne({ where: { userId: user.id, companyId: comp.id } });
    if (!userComp) {
      userComp = userCompanyRepo.create({
        userId: user.id,
        companyId: comp.id,
        role: item.role,
        isActive: true,
      });
      await userCompanyRepo.save(userComp);
      console.log(`    [+] Membresía: ${user.fullName} es ${item.role} en ${comp.name}`);
    }
  }

  // 4.1. Crear Equipos (Teams) para FS
  const fsCompany = companiesMap['fs'];
  const teamsToSeed = [
    { name: 'Equipo Giovanni Figueroa', supervisorEmail: 'giovanni.figueroa@conection-futura.com' },
    { name: 'Equipo Joselyn Rengifo', supervisorEmail: 'joselyn.rengifo@conection-futura.com' },
    { name: 'Equipo Edwin Roca', supervisorEmail: 'edwin.roca@conection-futura.com' },
    { name: 'Equipo SubAgencia', supervisorEmail: 'subagencia@conection-futura.com' },
  ];
  
  const teamInstanceMap: Record<string, Team> = {};

  for (const t of teamsToSeed) {
    let team = await teamRepo.findOne({ where: { name: t.name, companyId: fsCompany.id } });
    const sup = userInstanceMap[t.supervisorEmail];
    if (!team) {
      team = teamRepo.create({
        companyId: fsCompany.id,
        name: t.name,
        supervisorId: sup ? sup.id : null,
        isActive: true,
      });
      team = await teamRepo.save(team);
      console.log(`[+] Equipo Creado: ${t.name}`);
    } else {
      if (team.supervisorId !== (sup ? sup.id : null)) {
        team.supervisorId = sup ? sup.id : null;
        team = await teamRepo.save(team);
      }
    }
    teamInstanceMap[t.supervisorEmail] = team;
  }

  // Segunda pasada: Vincular supervisorId y teamId
  for (const item of usersToSeed) {
    const u = userInstanceMap[item.email];
    const comp = companiesMap[item.slug];
    
    if (item.supervisorEmail) {
      const sup = userInstanceMap[item.supervisorEmail];
      if (u && sup) {
        u.supervisorId = sup.id;
        await userRepo.save(u);
        console.log(`    [~] Jerarquía: ${u.fullName} asignado a supervisor ${sup.fullName}`);
        
        const team = teamInstanceMap[item.supervisorEmail];
        if (team) {
          let uc = await userCompanyRepo.findOne({ where: { userId: u.id, companyId: comp.id } });
          if (uc) {
            uc.teamId = team.id;
            await userCompanyRepo.save(uc);
          }
        }
      }
    } else if (item.role === 'SUPERVISOR_VENTAS') {
        const team = teamInstanceMap[item.email];
        if (team) {
          let uc = await userCompanyRepo.findOne({ where: { userId: u.id, companyId: comp.id } });
          if (uc) {
            uc.teamId = team.id;
            await userCompanyRepo.save(uc);
          }
        }
    }
  }

  // 5. Distrito Base
  let dist = await distritoRepo.findOne({ where: { nombre: 'San Isidro' } });
  if (!dist) {
    dist = distritoRepo.create({ id: '44444444-4444-4444-4444-444444444443', nombre: 'San Isidro' });
    await distritoRepo.save(dist);
    console.log(`[+] Distrito Creado: San Isidro`);
  }

  // LeadSource
  let lead = await leadSourceRepo.findOne({ where: { name: 'Scraping' } });
  if (!lead) {
    lead = leadSourceRepo.create({ id: '00000000-0000-0000-0000-000000000002', name: 'Scraping', code: 'SCR' });
    await leadSourceRepo.save(lead);
    console.log(`[+] LeadSource Creado: Scraping`);
  }

  // 6. Sembrar Oportunidades y Predios (Hunting)
  console.log('--- Sembrando Oportunidades de Hunting (Futura/Novacore) ---');
  for (const slug of ['futura', 'novacore']) {
    const comp = companiesMap[slug];
    const hunter = userInstanceMap[`hunter@${slug}.pe`];
    const stages = stagesMap[slug];

    for (let i = 1; i <= 5; i++) {
      const pName = `Predio ${comp.name} ${i}`;
      let predio = await predioRepo.findOne({ where: { nombreProyecto: pName } });
      if (!predio) {
        predio = predioRepo.create({
          companyId: comp.id,
          nombreProyecto: pName,
          tipoDesarrollo: 'Residencial',
          origenProspeccion: 'Scraping',
          clasificacionProyecto: 'A',
          estadoConstruccion: 'Construido',
          distritoId: dist.id,
          tipoVia: 'Avenida',
          nombreVia: 'El Sol',
          numeracionMunicipal: `20${i}`,
          hunterPrincipalId: hunter?.id,
          juntaDirectiva: 'Sí',
        });
        predio = await predioRepo.save(predio);
      }

      let opp = await oppRepo.findOne({ where: { propertyId: predio.id } });
      if (!opp) {
        opp = oppRepo.create({
          code: `HUNT-${comp.name.toUpperCase().slice(0,3)}-0${i}`,
          companyId: comp.id,
          propertyId: predio.id,
          leadSourceId: lead.id,
          pipelineId: pipelineMap[slug].id,
          currentStageId: stages[0].id, // Primer etapa
          currentOwnerUserId: hunter?.id,
          createdByUserId: hunter?.id,
          canalHunting: comp.name.toUpperCase(),
          status: 'OPEN',
          currentStageEnteredAt: new Date(),
        });
        await oppRepo.save(opp);
        console.log(`    [+] Opp Hunting Creada: ${opp.code} (${comp.name})`);
      }
    }
  }

  // 7. Sembrar Oportunidades B2B (FS)
  console.log('--- Sembrando Oportunidades de Ventas B2B (FS) ---');
  const compFs = companiesMap['fs'];
  const asesor = userInstanceMap['asesor.test@fs.pe'];
  const stagesFs = stagesMap['fs'];

  const seedVentasB2B = [
    { ruc: '20555555551', razonSocial: 'Corporación Inka S.A.C.', cargo: 450.0 },
    { ruc: '20555555552', razonSocial: 'Logística Transandina', cargo: 720.0 },
    { ruc: '20555555553', razonSocial: 'Servicios Médicos del Perú', cargo: 310.0 },
  ];

  for (let i = 0; i < seedVentasB2B.length; i++) {
    const item = seedVentasB2B[i];
    const code = `VNT-FS-0${i + 1}`;

    let opp = await oppRepo.findOne({ where: { code } });
    if (!opp) {
      opp = oppRepo.create({
        code,
        companyId: compFs.id,
        propertyId: null, // Sin predio
        leadSourceId: lead.id,
        pipelineId: pipelineMap['fs'].id,
        currentStageId: stagesFs[0].id, // Lead
        currentOwnerUserId: asesor?.id,
        createdByUserId: asesor?.id,
        status: 'OPEN',
        currentStageEnteredAt: new Date(),
      });
      opp = await oppRepo.save(opp);

      // Crear VentaFija asociada
      const venta = ventaFijaRepo.create({
        opportunityId: opp.id,
        ruc: item.ruc,
        razonSocial: item.razonSocial,
        representanteLegal: 'Juan Perez Lopez',
        dniRrll: '40404040',
        celularRrll: '999888777',
        correoElectronico: 'contacto@cliente.com',
        tipoDomicilio: 'Oficina',
        direccionFiscal: 'Av. Paseo de la República 321',
        direccionInstalacion: 'Av. Paseo de la República 321, Int 502',
        departamento: 'Lima',
        provincia: 'Lima',
        distrito: 'San Isidro',
        tipoTecnologia: 'FTTH',
        tipoPlay: '1Play',
        velocidad: '400 Mbps',
        cargoFijoSinIgv: item.cargo,
        campana: 'Campaña Corporativa 2026',
        observaciones: 'Cliente corporativo de televentas',
      });
      await ventaFijaRepo.save(venta);
      console.log(`    [+] Opp B2B Creada: ${opp.code} (Cliente: ${item.razonSocial})`);
    }
  }

  console.log('--- Seeding Terminado Exitosamente ---');
  await app.close();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
