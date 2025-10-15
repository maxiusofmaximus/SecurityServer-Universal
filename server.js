#!/usr/bin/env node

/**
 * Servidor Universal de Seguridad con NPX
 * Proporciona medidas de seguridad avanzadas para proyectos Node.js, React, Python, C++
 * Utiliza las últimas características de NPX y mejores prácticas de seguridad 2024
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { Command } from 'commander';
import fs from 'fs-extra';
import { glob } from 'glob';
import semver from 'semver';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// Configuración del servidor
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Configuración de seguridad
const SECURITY_CONFIG = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: 'Demasiadas solicitudes desde esta IP'
  },
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    optionsSuccessStatus: 200
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }
};

// Plantillas de proyectos soportados
const PROJECT_TEMPLATES = {
  'nodejs': {
    name: 'Node.js Application',
    command: 'npx create-node-app',
    security: ['audit-ci', 'eslint', 'prettier', 'helmet'],
    description: 'Aplicación Node.js con Express y medidas de seguridad'
  },
  'react': {
    name: 'React Application',
    command: 'npx create-react-app',
    security: ['audit-ci', 'eslint', 'prettier', '@types/react'],
    description: 'Aplicación React con TypeScript y seguridad'
  },
  'nextjs': {
    name: 'Next.js Application',
    command: 'npx create-next-app@latest',
    security: ['audit-ci', 'eslint', 'prettier', 'next-secure-headers'],
    description: 'Aplicación Next.js con SSR y seguridad avanzada'
  },
  'vue': {
    name: 'Vue.js Application',
    command: 'npx create-vue@latest',
    security: ['audit-ci', 'eslint', 'prettier', 'vue-tsc'],
    description: 'Aplicación Vue.js con Composition API'
  },
  'angular': {
    name: 'Angular Application',
    command: 'npx @angular/cli new',
    security: ['audit-ci', 'eslint', 'prettier', '@angular/cli'],
    description: 'Aplicación Angular con TypeScript'
  },
  'express': {
    name: 'Express Server',
    command: 'npx express-generator',
    security: ['audit-ci', 'helmet', 'cors', 'express-rate-limit'],
    description: 'Servidor Express con middleware de seguridad'
  },
  'python': {
    name: 'Python Project',
    command: 'python -m venv venv && pip install -r requirements.txt',
    security: ['bandit', 'safety', 'pip-audit'],
    description: 'Proyecto Python con análisis de seguridad'
  },
  'cpp': {
    name: 'C++ Project',
    command: 'cmake -B build',
    security: ['cppcheck', 'clang-tidy', 'valgrind'],
    description: 'Proyecto C++ con análisis estático'
  }
};

// Crear aplicación Express
const app = express();
const server = createServer(app);

// Configurar middleware de seguridad
app.use(helmet(SECURITY_CONFIG.helmet));
app.use(cors(SECURITY_CONFIG.cors));
app.use(rateLimit(SECURITY_CONFIG.rateLimit));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar multer para uploads seguros
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(js|jsx|ts|tsx|json|md|txt|py|cpp|h|hpp)$/;
    if (allowedTypes.test(file.originalname.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

// WebSocket para comunicación en tiempo real
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log(chalk.green('🔌 Cliente conectado al WebSocket'));
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      await handleWebSocketMessage(ws, data);
    } catch (error) {
      ws.send(JSON.stringify({ error: 'Mensaje inválido' }));
    }
  });
  
  ws.on('close', () => {
    console.log(chalk.yellow('🔌 Cliente desconectado del WebSocket'));
  });
});

// Rutas de la API

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    name: 'Security Server Universal',
    version: '1.0.0',
    description: 'Servidor de seguridad universal con NPX',
    endpoints: {
      '/api/templates': 'GET - Lista de plantillas disponibles',
      '/api/security/scan': 'POST - Escaneo de seguridad',
      '/api/security/audit': 'POST - Auditoría de dependencias',
      '/api/project/create': 'POST - Crear nuevo proyecto',
      '/api/project/analyze': 'POST - Analizar proyecto existente'
    }
  });
});

// Obtener plantillas disponibles
app.get('/api/templates', (req, res) => {
  res.json({
    templates: PROJECT_TEMPLATES,
    count: Object.keys(PROJECT_TEMPLATES).length
  });
});

// Escaneo de seguridad
app.post('/api/security/scan', 
  body('projectPath').isString().notEmpty(),
  body('projectType').isIn(Object.keys(PROJECT_TEMPLATES)),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { projectPath, projectType } = req.body;
      const scanResult = await performSecurityScan(projectPath, projectType);
      res.json(scanResult);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Auditoría de dependencias
app.post('/api/security/audit',
  body('projectPath').isString().notEmpty(),
  async (req, res) => {
    try {
      const { projectPath } = req.body;
      const auditResult = await performDependencyAudit(projectPath);
      res.json(auditResult);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Crear nuevo proyecto
app.post('/api/project/create',
  body('name').isString().notEmpty(),
  body('type').isIn(Object.keys(PROJECT_TEMPLATES)),
  body('path').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, type, path: projectPath } = req.body;
      const result = await createSecureProject(name, type, projectPath);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Analizar proyecto existente
app.post('/api/project/analyze',
  upload.array('files', 10),
  body('projectPath').isString().notEmpty(),
  async (req, res) => {
    try {
      const { projectPath } = req.body;
      const files = req.files;
      const analysis = await analyzeExistingProject(projectPath, files);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Funciones de utilidad

async function handleWebSocketMessage(ws, data) {
  switch (data.type) {
    case 'scan_progress':
      // Enviar progreso de escaneo en tiempo real
      break;
    case 'audit_status':
      // Enviar estado de auditoría
      break;
    default:
      ws.send(JSON.stringify({ error: 'Tipo de mensaje no reconocido' }));
  }
}

async function performSecurityScan(projectPath, projectType) {
  console.log(chalk.blue(`🔍 Iniciando escaneo de seguridad para ${projectType}`));
  
  const results = {
    timestamp: new Date().toISOString(),
    projectPath,
    projectType,
    vulnerabilities: [],
    recommendations: [],
    score: 0
  };

  try {
    // Escaneo con NPX audit-ci
    const auditCommand = `npx audit-ci --config audit-ci.json`;
    const { stdout, stderr } = await execAsync(auditCommand, { cwd: projectPath });
    
    if (stderr) {
      results.vulnerabilities.push({
        type: 'dependency',
        severity: 'high',
        message: 'Vulnerabilidades encontradas en dependencias',
        details: stderr
      });
    }

    // Escaneo adicional según el tipo de proyecto
    const template = PROJECT_TEMPLATES[projectType];
    for (const tool of template.security) {
      try {
        await runSecurityTool(tool, projectPath, results);
      } catch (error) {
        console.log(chalk.yellow(`⚠️ Error ejecutando ${tool}: ${error.message}`));
      }
    }

    // Calcular puntuación de seguridad
    results.score = calculateSecurityScore(results);
    
    console.log(chalk.green(`✅ Escaneo completado. Puntuación: ${results.score}/100`));
    return results;

  } catch (error) {
    console.error(chalk.red(`❌ Error en escaneo: ${error.message}`));
    throw error;
  }
}

async function runSecurityTool(tool, projectPath, results) {
  const commands = {
    'audit-ci': 'npx audit-ci',
    'eslint': 'npx eslint . --ext .js,.jsx,.ts,.tsx --format json',
    'prettier': 'npx prettier --check .',
    'bandit': 'bandit -r . -f json',
    'safety': 'safety check --json',
    'cppcheck': 'cppcheck --enable=all --xml .'
  };

  const command = commands[tool];
  if (!command) return;

  try {
    const { stdout } = await execAsync(command, { cwd: projectPath });
    
    // Procesar resultados según la herramienta
    if (tool === 'eslint' && stdout) {
      const eslintResults = JSON.parse(stdout);
      eslintResults.forEach(file => {
        file.messages.forEach(message => {
          if (message.severity === 2) {
            results.vulnerabilities.push({
              type: 'code_quality',
              severity: 'medium',
              file: file.filePath,
              line: message.line,
              message: message.message,
              rule: message.ruleId
            });
          }
        });
      });
    }
  } catch (error) {
    // Algunas herramientas fallan si no encuentran problemas
    if (error.code !== 0 && tool !== 'prettier') {
      throw error;
    }
  }
}

async function performDependencyAudit(projectPath) {
  console.log(chalk.blue('🔍 Iniciando auditoría de dependencias'));
  
  const auditResult = {
    timestamp: new Date().toISOString(),
    projectPath,
    vulnerabilities: {
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0
    },
    dependencies: {
      total: 0,
      outdated: 0,
      deprecated: 0
    },
    recommendations: []
  };

  try {
    // Auditoría con NPX
    const commands = [
      'npx audit-ci --config audit-ci.json',
      'npx better-npm-audit audit',
      'npx npm-check-updates --jsonUpgraded',
      'npx depcheck --json'
    ];

    for (const command of commands) {
      try {
        const { stdout } = await execAsync(command, { cwd: projectPath });
        // Procesar resultados de cada comando
        processAuditOutput(command, stdout, auditResult);
      } catch (error) {
        console.log(chalk.yellow(`⚠️ ${command} falló: ${error.message}`));
      }
    }

    console.log(chalk.green('✅ Auditoría de dependencias completada'));
    return auditResult;

  } catch (error) {
    console.error(chalk.red(`❌ Error en auditoría: ${error.message}`));
    throw error;
  }
}

function processAuditOutput(command, output, result) {
  if (command.includes('audit-ci') && output) {
    try {
      const auditData = JSON.parse(output);
      if (auditData.vulnerabilities) {
        Object.keys(auditData.vulnerabilities).forEach(severity => {
          result.vulnerabilities[severity] = auditData.vulnerabilities[severity];
        });
      }
    } catch (e) {
      // Output no es JSON válido
    }
  }
  
  if (command.includes('npm-check-updates') && output) {
    try {
      const updates = JSON.parse(output);
      result.dependencies.outdated = Object.keys(updates).length;
    } catch (e) {
      // Output no es JSON válido
    }
  }
}

async function createSecureProject(name, type, projectPath) {
  console.log(chalk.blue(`🚀 Creando proyecto ${type}: ${name}`));
  
  const template = PROJECT_TEMPLATES[type];
  const fullPath = path.join(projectPath, name);

  try {
    // Crear directorio del proyecto
    await fs.ensureDir(fullPath);

    // Ejecutar comando de creación del template
    const createCommand = template.command.replace(/npx\s+/, 'npx ');
    await execAsync(`${createCommand} ${name}`, { cwd: projectPath });

    // Instalar herramientas de seguridad
    await installSecurityTools(fullPath, template.security);

    // Configurar archivos de seguridad
    await setupSecurityFiles(fullPath, type);

    // Ejecutar auditoría inicial
    const initialAudit = await performDependencyAudit(fullPath);

    console.log(chalk.green(`✅ Proyecto ${name} creado con medidas de seguridad`));
    
    return {
      name,
      type,
      path: fullPath,
      template: template.name,
      security: template.security,
      initialAudit
    };

  } catch (error) {
    console.error(chalk.red(`❌ Error creando proyecto: ${error.message}`));
    throw error;
  }
}

async function installSecurityTools(projectPath, securityTools) {
  console.log(chalk.blue('🔧 Instalando herramientas de seguridad'));
  
  for (const tool of securityTools) {
    try {
      const installCommand = `npx ${tool} --version || npm install --save-dev ${tool}`;
      await execAsync(installCommand, { cwd: projectPath });
      console.log(chalk.green(`✅ ${tool} instalado`));
    } catch (error) {
      console.log(chalk.yellow(`⚠️ Error instalando ${tool}: ${error.message}`));
    }
  }
}

async function setupSecurityFiles(projectPath, projectType) {
  console.log(chalk.blue('📝 Configurando archivos de seguridad'));
  
  // Copiar configuraciones de seguridad
  const securityFiles = [
    'audit-ci.json',
    '.npmrc'
  ];

  for (const file of securityFiles) {
    try {
      const sourcePath = path.join(__dirname, file);
      const destPath = path.join(projectPath, file);
      await fs.copy(sourcePath, destPath);
      console.log(chalk.green(`✅ ${file} configurado`));
    } catch (error) {
      console.log(chalk.yellow(`⚠️ Error configurando ${file}: ${error.message}`));
    }
  }

  // Crear scripts de seguridad específicos del proyecto
  await createProjectSecurityScripts(projectPath, projectType);
}

async function createProjectSecurityScripts(projectPath, projectType) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  try {
    const packageJson = await fs.readJson(packageJsonPath);
    
    // Agregar scripts de seguridad
    packageJson.scripts = {
      ...packageJson.scripts,
      'security:audit': 'npx audit-ci --config audit-ci.json',
      'security:scan': 'npx @cyclonedx/cyclonedx-npm --output-format json',
      'security:check': 'npx better-npm-audit audit',
      'security:deps': 'npx depcheck',
      'security:outdated': 'npx npm-check-updates',
      'security:full': 'npm run security:audit && npm run security:scan && npm run security:check'
    };

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    console.log(chalk.green('✅ Scripts de seguridad agregados al package.json'));
  } catch (error) {
    console.log(chalk.yellow(`⚠️ Error configurando scripts: ${error.message}`));
  }
}

async function analyzeExistingProject(projectPath, files) {
  console.log(chalk.blue('🔍 Analizando proyecto existente'));
  
  const analysis = {
    timestamp: new Date().toISOString(),
    projectPath,
    projectType: 'unknown',
    files: files ? files.map(f => f.originalname) : [],
    dependencies: {},
    vulnerabilities: [],
    recommendations: [],
    score: 0
  };

  try {
    // Detectar tipo de proyecto
    analysis.projectType = await detectProjectType(projectPath);
    
    // Analizar dependencias
    analysis.dependencies = await analyzeDependencies(projectPath);
    
    // Ejecutar escaneo de seguridad
    const scanResult = await performSecurityScan(projectPath, analysis.projectType);
    analysis.vulnerabilities = scanResult.vulnerabilities;
    analysis.score = scanResult.score;
    
    // Generar recomendaciones
    analysis.recommendations = generateRecommendations(analysis);
    
    console.log(chalk.green('✅ Análisis completado'));
    return analysis;

  } catch (error) {
    console.error(chalk.red(`❌ Error en análisis: ${error.message}`));
    throw error;
  }
}

async function detectProjectType(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const requirementsPath = path.join(projectPath, 'requirements.txt');
  const cmakeListsPath = path.join(projectPath, 'CMakeLists.txt');

  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    
    if (packageJson.dependencies?.react) return 'react';
    if (packageJson.dependencies?.next) return 'nextjs';
    if (packageJson.dependencies?.vue) return 'vue';
    if (packageJson.dependencies?.['@angular/core']) return 'angular';
    if (packageJson.dependencies?.express) return 'express';
    return 'nodejs';
  }
  
  if (await fs.pathExists(requirementsPath)) return 'python';
  if (await fs.pathExists(cmakeListsPath)) return 'cpp';
  
  return 'unknown';
}

async function analyzeDependencies(projectPath) {
  const dependencies = {
    total: 0,
    direct: 0,
    dev: 0,
    outdated: [],
    vulnerable: []
  };

  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      
      dependencies.direct = Object.keys(packageJson.dependencies || {}).length;
      dependencies.dev = Object.keys(packageJson.devDependencies || {}).length;
      dependencies.total = dependencies.direct + dependencies.dev;
    }
  } catch (error) {
    console.log(chalk.yellow(`⚠️ Error analizando dependencias: ${error.message}`));
  }

  return dependencies;
}

function generateRecommendations(analysis) {
  const recommendations = [];

  if (analysis.score < 70) {
    recommendations.push({
      type: 'security',
      priority: 'high',
      message: 'Puntuación de seguridad baja. Se requieren mejoras inmediatas.',
      actions: ['Actualizar dependencias vulnerables', 'Configurar herramientas de seguridad']
    });
  }

  if (analysis.vulnerabilities.length > 0) {
    recommendations.push({
      type: 'vulnerabilities',
      priority: 'critical',
      message: `Se encontraron ${analysis.vulnerabilities.length} vulnerabilidades.`,
      actions: ['Revisar y corregir vulnerabilidades', 'Ejecutar auditoría completa']
    });
  }

  if (analysis.dependencies.outdated?.length > 5) {
    recommendations.push({
      type: 'dependencies',
      priority: 'medium',
      message: 'Múltiples dependencias desactualizadas.',
      actions: ['Actualizar dependencias', 'Configurar renovate o dependabot']
    });
  }

  return recommendations;
}

function calculateSecurityScore(results) {
  let score = 100;
  
  // Penalizar por vulnerabilidades
  results.vulnerabilities.forEach(vuln => {
    switch (vuln.severity) {
      case 'critical': score -= 20; break;
      case 'high': score -= 15; break;
      case 'medium': score -= 10; break;
      case 'low': score -= 5; break;
    }
  });

  return Math.max(0, score);
}

// CLI Interface
const program = new Command();

program
  .name('security-server')
  .description('Servidor Universal de Seguridad con NPX')
  .version('1.0.0');

program
  .command('start')
  .description('Iniciar el servidor')
  .option('-p, --port <port>', 'Puerto del servidor', '3001')
  .option('-h, --host <host>', 'Host del servidor', 'localhost')
  .action((options) => {
    startServer(options.port, options.host);
  });

program
  .command('scan <path>')
  .description('Escanear proyecto para vulnerabilidades')
  .option('-t, --type <type>', 'Tipo de proyecto')
  .action(async (projectPath, options) => {
    try {
      const projectType = options.type || await detectProjectType(projectPath);
      const result = await performSecurityScan(projectPath, projectType);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('create')
  .description('Crear nuevo proyecto con medidas de seguridad')
  .action(async () => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Nombre del proyecto:',
          validate: input => input.length > 0
        },
        {
          type: 'list',
          name: 'type',
          message: 'Tipo de proyecto:',
          choices: Object.keys(PROJECT_TEMPLATES).map(key => ({
            name: PROJECT_TEMPLATES[key].name,
            value: key
          }))
        },
        {
          type: 'input',
          name: 'path',
          message: 'Ruta donde crear el proyecto:',
          default: process.cwd()
        }
      ]);

      const result = await createSecureProject(answers.name, answers.type, answers.path);
      console.log(chalk.green('✅ Proyecto creado exitosamente:'));
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

function startServer(port = PORT, host = HOST) {
  server.listen(port, host, () => {
    console.log(chalk.green('🚀 Servidor Universal de Seguridad iniciado'));
    console.log(chalk.blue(`📡 Servidor: http://${host}:${port}`));
    console.log(chalk.blue(`🔌 WebSocket: ws://${host}:${port}`));
    console.log(chalk.yellow('📋 Plantillas disponibles:'));
    
    Object.entries(PROJECT_TEMPLATES).forEach(([key, template]) => {
      console.log(chalk.cyan(`   ${key}: ${template.description}`));
    });
    
    console.log(chalk.green('\n✅ Servidor listo para recibir solicitudes'));
  });

  // Manejo de errores del servidor
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(chalk.red(`❌ Puerto ${port} ya está en uso`));
    } else {
      console.error(chalk.red(`❌ Error del servidor: ${error.message}`));
    }
    process.exit(1);
  });

  // Manejo de cierre graceful
  process.on('SIGTERM', () => {
    console.log(chalk.yellow('🛑 Cerrando servidor...'));
    server.close(() => {
      console.log(chalk.green('✅ Servidor cerrado correctamente'));
      process.exit(0);
    });
  });
}

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.length === 2) {
    // Sin argumentos, iniciar servidor
    startServer();
  } else {
    // Con argumentos, usar CLI
    program.parse();
  }
}

export default app;