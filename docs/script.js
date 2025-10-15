// JavaScript avanzado para SecurityServer-Universal Guide

document.addEventListener('DOMContentLoaded', function() {
    initializeGuide();
});

function initializeGuide() {
    createReadingProgress();
    createBackToTopButton();
    initializeAnimations();
    initializeParticles();
    initializeNotifications();
    initializeThemeToggle();
    initializeSearchFunctionality();
    initializeLazyLoading();
}

// Barra de progreso de lectura
function createReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Botón de volver arriba
function createBackToTopButton() {
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="bi bi-arrow-up"></i>';
    backToTop.setAttribute('aria-label', 'Volver arriba');
    document.body.appendChild(backToTop);

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Animaciones al hacer scroll
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);

    // Observar elementos que queremos animar
    document.querySelectorAll('.feature-card, .card, .step-number').forEach(el => {
        observer.observe(el);
    });
}

// Sistema de partículas en el hero
function initializeParticles() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'hero-particles';
    heroSection.appendChild(particlesContainer);

    // Crear partículas
    for (let i = 0; i < 20; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Posición y tamaño aleatorios
    const size = Math.random() * 4 + 2;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const delay = Math.random() * 6;
    
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = x + '%';
    particle.style.top = y + '%';
    particle.style.animationDelay = delay + 's';
    
    container.appendChild(particle);
}

// Sistema de notificaciones
function initializeNotifications() {
    window.showNotification = function(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="bi bi-${getNotificationIcon(type)} me-2"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        // Mostrar notificación
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Toggle de tema oscuro/claro
function initializeThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'btn btn-outline-secondary position-fixed';
    themeToggle.style.cssText = 'top: 20px; right: 20px; z-index: 1000; border-radius: 50%; width: 50px; height: 50px;';
    themeToggle.innerHTML = '<i class="bi bi-moon"></i>';
    themeToggle.setAttribute('aria-label', 'Cambiar tema');
    
    document.body.appendChild(themeToggle);
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.innerHTML = `<i class="bi bi-${isDark ? 'sun' : 'moon'}"></i>`;
        
        // Guardar preferencia
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="bi bi-sun"></i>';
    }
}

// Funcionalidad de búsqueda
function initializeSearchFunctionality() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container position-fixed';
    searchContainer.style.cssText = 'top: 80px; right: 20px; z-index: 1000;';
    searchContainer.innerHTML = `
        <div class="input-group" style="width: 250px;">
            <input type="text" class="form-control" placeholder="Buscar en la guía..." id="searchInput">
            <button class="btn btn-outline-secondary" type="button" id="searchBtn">
                <i class="bi bi-search"></i>
            </button>
        </div>
        <div id="searchResults" class="mt-2" style="display: none;"></div>
    `;
    
    document.body.appendChild(searchContainer);
    
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;
        
        const sections = document.querySelectorAll('section');
        const results = [];
        
        sections.forEach(section => {
            const text = section.textContent.toLowerCase();
            if (text.includes(query)) {
                const title = section.querySelector('h2, h3, h4, h5')?.textContent || 'Sección';
                results.push({
                    title: title,
                    element: section
                });
            }
        });
        
        displaySearchResults(results, query);
    }
    
    function displaySearchResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="alert alert-info">No se encontraron resultados</div>';
        } else {
            const resultHTML = results.map(result => `
                <div class="search-result p-2 border-bottom cursor-pointer" onclick="scrollToElement('${result.element.id}')">
                    <strong>${result.title}</strong>
                </div>
            `).join('');
            searchResults.innerHTML = `<div class="bg-white border rounded p-2 shadow">${resultHTML}</div>`;
        }
        
        searchResults.style.display = 'block';
        
        // Ocultar resultados después de 5 segundos
        setTimeout(() => {
            searchResults.style.display = 'none';
        }, 5000);
    }
    
    window.scrollToElement = function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            searchResults.style.display = 'none';
        }
    };
}

// Carga perezosa de imágenes
function initializeLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Funciones de utilidad para los botones de copia mejorados
function enhanceCopyFunctionality() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const codeBlock = this.nextElementSibling;
            const code = codeBlock.textContent;
            
            navigator.clipboard.writeText(code).then(() => {
                showNotification('Código copiado al portapapeles', 'success');
                
                // Efecto visual en el botón
                this.innerHTML = '<i class="bi bi-check"></i> Copiado';
                this.classList.add('btn-success');
                
                setTimeout(() => {
                    this.innerHTML = 'Copiar';
                    this.classList.remove('btn-success');
                }, 2000);
            }).catch(() => {
                showNotification('Error al copiar el código', 'error');
            });
        });
    });
}

// Función para cambiar idiomas de integración con animaciones
function showLanguage(language) {
    // Ocultar todos los contenidos con animación
    document.querySelectorAll('.language-content').forEach(content => {
        content.style.opacity = '0';
        content.style.transform = 'translateY(20px)';
        setTimeout(() => {
            content.style.display = 'none';
        }, 300);
    });
    
    // Remover clase activa de todas las pestañas
    document.querySelectorAll('.language-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar contenido seleccionado con animación
    setTimeout(() => {
        const targetContent = document.getElementById(language + '-integration');
        if (targetContent) {
            targetContent.style.display = 'block';
            setTimeout(() => {
                targetContent.style.opacity = '1';
                targetContent.style.transform = 'translateY(0)';
            }, 50);
        }
        
        // Agregar clase activa a la pestaña clickeada
        event.target.closest('.language-tab').classList.add('active');
    }, 300);
}

// Función para validar formularios (si se agregan en el futuro)
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Función para generar estadísticas de la página
function generatePageStats() {
    const stats = {
        sections: document.querySelectorAll('section').length,
        codeBlocks: document.querySelectorAll('.code-block').length,
        features: document.querySelectorAll('.feature-card').length,
        languages: document.querySelectorAll('.language-tab').length,
        readingTime: Math.ceil(document.body.textContent.split(' ').length / 200) // 200 palabras por minuto
    };
    
    console.log('Estadísticas de la página:', stats);
    return stats;
}

// Función para exportar la guía como PDF (usando window.print)
function exportToPDF() {
    // Ocultar elementos no necesarios para impresión
    document.querySelectorAll('.navbar, .back-to-top, .reading-progress, .search-container').forEach(el => {
        el.style.display = 'none';
    });
    
    // Expandir todo el contenido
    document.querySelectorAll('.language-content').forEach(content => {
        content.style.display = 'block';
    });
    
    window.print();
    
    // Restaurar elementos después de imprimir
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// Función para compartir la página
function shareGuide() {
    if (navigator.share) {
        navigator.share({
            title: 'SecurityServer-Universal - Guía Completa',
            text: 'Guía completa para usar SecurityServer-Universal en tus proyectos',
            url: window.location.href
        });
    } else {
        // Fallback: copiar URL al portapapeles
        navigator.clipboard.writeText(window.location.href).then(() => {
            showNotification('URL copiada al portapapeles', 'success');
        });
    }
}

// Inicializar funcionalidades adicionales cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    enhanceCopyFunctionality();
    generatePageStats();
    
    // Agregar botones de acción adicionales
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons position-fixed';
    actionButtons.style.cssText = 'bottom: 100px; right: 30px; z-index: 1000;';
    actionButtons.innerHTML = `
        <button class="btn btn-primary mb-2 d-block" onclick="exportToPDF()" title="Exportar como PDF">
            <i class="bi bi-file-pdf"></i>
        </button>
        <button class="btn btn-success d-block" onclick="shareGuide()" title="Compartir guía">
            <i class="bi bi-share"></i>
        </button>
    `;
    
    document.body.appendChild(actionButtons);
});

// Función para detectar el navegador y mostrar advertencias si es necesario
function detectBrowser() {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    // Mostrar advertencia para navegadores muy antiguos
    if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
        showNotification('Tu navegador es muy antiguo. Algunas funciones pueden no funcionar correctamente.', 'warning');
    }
    
    return browser;
}

// Inicializar detección de navegador
detectBrowser();