#!/usr/bin/env node

const { program } = require('commander');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');

const SERVER_URL = 'http://localhost:3000';

program
  .name('security-server')
  .description('Servidor Universal de Seguridad para proyectos NPX')
  .version('1.0.0');

// Comando para iniciar el servidor
program
  .command('start')
  .description('Iniciar el servidor de seguridad')
  .option('-p, --port <port>', 'Puerto del servidor', '3000')
  .action(async (options) => {
    console.log(chalk.blue('🚀 Iniciando Servidor Universal de Seguridad...'));
    
    const spinner = ora('Configurando servidor...').start();
    
    try {
      // Aquí se iniciaría el servidor
      const { spawn } = require('child_process');
      const serverProcess = spawn('node', ['server.js'], {
        env: { ...process.env, PORT: options.port },
        stdio: 'inherit'
      });
      
      spinner.succeed('Servidor iniciado correctamente');
      console.log(chalk.green(`✅ Servidor ejecutándose en http://localhost:${options.port}`));
      
      serverProcess.on('error', (error) => {
        spinner.fail('Error al iniciar el servidor');
        console.error(chalk.red('❌ Error:'), error.message);
      });
      
    } catch (error) {
      spinner.fail('Error al iniciar el servidor');
      console.error(chalk.red('❌ Error:'), error.message);
    }
  });

// Comando para escanear un proyecto
program
  .command('scan')
  .description('Escanear un proyecto en busca de vulnerabilidades')
  .argument('<project-path>', 'Ruta del proyecto a escanear')
  .option('-t, --type <type>', 'Tipo de proyecto (nodejs, react, python, cpp)', 'auto')
  .option('-o, --output <file>', 'Archivo de salida para el reporte')
  .action(async (projectPath, options) => {
    console.log(chalk.blue('🔍 Escaneando proyecto...'));
    
    const spinner = ora('Analizando vulnerabilidades...').start();
    
    try {
      const response = await axios.post(`${SERVER_URL}/api/scan`, {
        projectPath: path.resolve(projectPath),
        projectType: options.type
      });
      
      spinner.succeed('Escaneo completado');
      
      const results = response.data;
      
      console.log(chalk.green('\\n📊 Resultados del escaneo:'));
      console.log(chalk.yellow(`Vulnerabilidades encontradas: ${results.vulnerabilities?.length || 0}`));
      console.log(chalk.yellow(`Dependencias analizadas: ${results.dependencies?.length || 0}`));
      
      if (results.vulnerabilities?.length > 0) {
        console.log(chalk.red('\\n⚠️  Vulnerabilidades críticas:'));
        results.vulnerabilities.forEach(vuln => {
          console.log(chalk.red(`  - ${vuln.title} (${vuln.severity})`));
        });
      }
      
      if (options.output) {
        fs.writeFileSync(options.output, JSON.stringify(results, null, 2));
        console.log(chalk.green(`\\n💾 Reporte guardado en: ${options.output}`));
      }
      
    } catch (error) {
      spinner.fail('Error durante el escaneo');
      console.error(chalk.red('❌ Error:'), error.message);
    }
  });

// Comando para crear un nuevo proyecto seguro
program
  .command('create')
  .description('Crear un nuevo proyecto con medidas de seguridad')
  .argument('<project-name>', 'Nombre del proyecto')
  .option('-t, --type <type>', 'Tipo de proyecto')
  .option('-d, --directory <dir>', 'Directorio de destino', '.')
  .action(async (projectName, options) => {
    console.log(chalk.blue('🏗️  Creando proyecto seguro...'));
    
    let projectType = options.type;
    
    // Si no se especifica el tipo, preguntar al usuario
    if (!projectType) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'type',
          message: '¿Qué tipo de proyecto deseas crear?',
          choices: [
            { name: '📦 Node.js', value: 'nodejs' },
            { name: '⚛️  React', value: 'react' },
            { name: '🐍 Python', value: 'python' },
            { name: '⚡ C++', value: 'cpp' }
          ]
        }
      ]);
      projectType = answers.type;
    }
    
    const spinner = ora(`Creando proyecto ${projectType}...`).start();
    
    try {
      const response = await axios.post(`${SERVER_URL}/api/create`, {
        name: projectName,
        type: projectType,
        directory: path.resolve(options.directory)
      });
      
      spinner.succeed('Proyecto creado exitosamente');
      
      console.log(chalk.green('\\n✅ Proyecto creado con las siguientes características:'));
      console.log(chalk.yellow(`📁 Directorio: ${response.data.path}`));
      console.log(chalk.yellow(`🔧 Tipo: ${response.data.type}`));
      console.log(chalk.yellow(`🛡️  Medidas de seguridad: ${response.data.securityFeatures?.length || 0}`));
      
      if (response.data.securityFeatures) {
        console.log(chalk.green('\\n🛡️  Medidas de seguridad implementadas:'));
        response.data.securityFeatures.forEach(feature => {
          console.log(chalk.green(`  ✓ ${feature}`));
        });
      }
      
      console.log(chalk.blue('\\n📝 Próximos pasos:'));
      console.log(chalk.white(`  1. cd ${projectName}`));
      console.log(chalk.white(`  2. npm install`));
      console.log(chalk.white(`  3. npm run security:audit`));
      
    } catch (error) {
      spinner.fail('Error al crear el proyecto');
      console.error(chalk.red('❌ Error:'), error.message);
    }
  });

// Comando para auditar dependencias
program
  .command('audit')
  .description('Auditar dependencias de un proyecto')
  .argument('<project-path>', 'Ruta del proyecto')
  .option('-f, --fix', 'Intentar corregir vulnerabilidades automáticamente')
  .action(async (projectPath, options) => {
    console.log(chalk.blue('🔍 Auditando dependencias...'));
    
    const spinner = ora('Ejecutando auditoría de seguridad...').start();
    
    try {
      const response = await axios.post(`${SERVER_URL}/api/audit`, {
        projectPath: path.resolve(projectPath),
        autoFix: options.fix
      });
      
      spinner.succeed('Auditoría completada');
      
      const results = response.data;
      
      console.log(chalk.green('\\n📊 Resultados de la auditoría:'));
      console.log(chalk.yellow(`Vulnerabilidades: ${results.vulnerabilities}`));
      console.log(chalk.yellow(`Dependencias: ${results.dependencies}`));
      console.log(chalk.yellow(`Actualizaciones disponibles: ${results.updates}`));
      
      if (results.vulnerabilities > 0) {
        console.log(chalk.red('\\n⚠️  Se encontraron vulnerabilidades'));
        if (options.fix) {
          console.log(chalk.green('🔧 Intentando corregir automáticamente...'));
        } else {
          console.log(chalk.yellow('💡 Usa --fix para intentar corregir automáticamente'));
        }
      } else {
        console.log(chalk.green('\\n✅ No se encontraron vulnerabilidades'));
      }
      
    } catch (error) {
      spinner.fail('Error durante la auditoría');
      console.error(chalk.red('❌ Error:'), error.message);
    }
  });

// Comando para mostrar plantillas disponibles
program
  .command('templates')
  .description('Mostrar plantillas de seguridad disponibles')
  .action(async () => {
    console.log(chalk.blue('📋 Plantillas de seguridad disponibles:'));
    
    try {
      const response = await axios.get(`${SERVER_URL}/api/templates`);
      const templates = response.data;
      
      templates.forEach(template => {
        console.log(chalk.green(`\\n📦 ${template.name}`));
        console.log(chalk.white(`   Tipo: ${template.type}`));
        console.log(chalk.white(`   Descripción: ${template.description}`));
        console.log(chalk.yellow(`   Comandos NPX: ${template.npxCommands?.length || 0}`));
        console.log(chalk.yellow(`   Paquetes de seguridad: ${template.securityPackages?.runtime?.length || 0}`));
      });
      
    } catch (error) {
      console.error(chalk.red('❌ Error al obtener plantillas:'), error.message);
    }
  });

// Comando para configurar un proyecto existente
program
  .command('configure')
  .description('Configurar medidas de seguridad en un proyecto existente')
  .argument('<project-path>', 'Ruta del proyecto')
  .option('-t, --type <type>', 'Tipo de proyecto')
  .action(async (projectPath, options) => {
    console.log(chalk.blue('⚙️  Configurando medidas de seguridad...'));
    
    let projectType = options.type;
    
    if (!projectType) {
      // Detectar tipo de proyecto automáticamente
      const packageJsonPath = path.join(projectPath, 'package.json');
      const requirementsPath = path.join(projectPath, 'requirements.txt');
      const cmakePath = path.join(projectPath, 'CMakeLists.txt');
      
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.dependencies?.react) {
          projectType = 'react';
        } else {
          projectType = 'nodejs';
        }
      } else if (fs.existsSync(requirementsPath)) {
        projectType = 'python';
      } else if (fs.existsSync(cmakePath)) {
        projectType = 'cpp';
      } else {
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'type',
            message: '¿Qué tipo de proyecto es?',
            choices: [
              { name: '📦 Node.js', value: 'nodejs' },
              { name: '⚛️  React', value: 'react' },
              { name: '🐍 Python', value: 'python' },
              { name: '⚡ C++', value: 'cpp' }
            ]
          }
        ]);
        projectType = answers.type;
      }
    }
    
    const spinner = ora(`Configurando proyecto ${projectType}...`).start();
    
    try {
      const response = await axios.post(`${SERVER_URL}/api/configure`, {
        projectPath: path.resolve(projectPath),
        projectType
      });
      
      spinner.succeed('Configuración completada');
      
      console.log(chalk.green('\\n✅ Medidas de seguridad configuradas:'));
      response.data.configuredFeatures?.forEach(feature => {
        console.log(chalk.green(`  ✓ ${feature}`));
      });
      
      console.log(chalk.blue('\\n📝 Archivos creados/modificados:'));
      response.data.modifiedFiles?.forEach(file => {
        console.log(chalk.yellow(`  📄 ${file}`));
      });
      
    } catch (error) {
      spinner.fail('Error durante la configuración');
      console.error(chalk.red('❌ Error:'), error.message);
    }
  });

// Comando para mostrar el estado del servidor
program
  .command('status')
  .description('Mostrar el estado del servidor de seguridad')
  .action(async () => {
    console.log(chalk.blue('📊 Verificando estado del servidor...'));
    
    try {
      const response = await axios.get(`${SERVER_URL}/api/status`);
      const status = response.data;
      
      console.log(chalk.green('\\n✅ Servidor activo'));
      console.log(chalk.yellow(`Versión: ${status.version}`));
      console.log(chalk.yellow(`Uptime: ${status.uptime}`));
      console.log(chalk.yellow(`Proyectos escaneados: ${status.projectsScanned}`));
      console.log(chalk.yellow(`Vulnerabilidades detectadas: ${status.vulnerabilitiesFound}`));
      
    } catch (error) {
      console.log(chalk.red('\\n❌ Servidor no disponible'));
      console.log(chalk.yellow('💡 Usa "security-server start" para iniciarlo'));
    }
  });

program.parse();