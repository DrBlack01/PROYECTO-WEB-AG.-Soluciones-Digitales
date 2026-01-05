document.addEventListener('DOMContentLoaded', () => {

    // Función para mostrar notificación toast personalizada
    function showToast(title, message, type = 'success') {
        // Crear el elemento toast
        const toast = document.createElement('div');
        toast.className = 'toast-notification';

        const icon = type === 'success' ? '✅' : '⚠️';

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    // 1. Mobile Navigation Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const header = document.getElementById('header');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            // Change icon between hamburger and close
            if (navMenu.classList.contains('active')) {
                menuToggle.textContent = '✕';
            } else {
                menuToggle.textContent = '☰';
            }
        });
    }

    // Close menu when clicking a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.textContent = '☰';
        });
    });

    // 2. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Account for fixed header height
                const headerHeight = header.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 3. Sticky Header Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
            header.style.background = 'rgba(255, 255, 255, 0.9)';
        }
    });

    // 4. Scroll Animations (Simple Reveal)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // 5. Form Submission to Google Sheets
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // IMPORTANTE: Reemplaza esta URL con la que te da Google Apps Script
            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzzi2Ood8F6GoJZ5pCH0gwOWue30plE9uyhY4TN6aqDCoX6mylOm1anDGx_3CdUp3c0/exec';

            // Obtener valores del formulario
            const nombre = document.getElementById('name').value.trim();
            const negocio = document.getElementById('business').value.trim();
            const telefono = document.getElementById('phone').value.trim();
            const mensaje = document.getElementById('message').value.trim();

            // --- VALIDACIÓN DEL FORMULARIO ---

            // 1. Validar campos obligatorios (Ahora incluye NEGOCIO)
            if (!nombre || !telefono || !negocio) {
                showToast('Campos incompletos', 'Por favor, completa: Nombre, Negocio y Teléfono', 'error');
                return;
            }

            // 2. Validar longitud del nombre y negocio
            if (nombre.length < 2) {
                showToast('Error de validación', 'El nombre es muy corto', 'error');
                return;
            }
            if (negocio.length < 2) {
                showToast('Error de validación', 'El nombre del negocio es muy corto', 'error');
                return;
            }

            // 3. Validar teléfono (Mínimo 7 dígitos, permite + - ( ) y espacios)
            const phoneRegex = /^[0-9+\- ()]{7,20}$/;
            // Validación extra: contar solo los dígitos
            const digitCount = telefono.replace(/[^0-9]/g, '').length;

            if (!phoneRegex.test(telefono) || digitCount < 7) {
                showToast('Teléfono inválido', 'Por favor, ingresa un número válido (mínimo 7 dígitos)', 'error');
                return;
            }

            // ---------------------------------

            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;

            // Mostrar estado de envío
            btn.innerText = 'Enviando...';
            btn.disabled = true;

            try {
                // Enviar datos a Google Sheets
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    },
                    body: JSON.stringify({
                        nombre: nombre,
                        negocio: negocio,
                        telefono: telefono,
                        mensaje: mensaje
                    })
                });

                // Mostrar mensaje de éxito (CONFIRMACIÓN)
                // Usamos un alert por ahora, pero podríamos usar una modal más elegante
                showToast('¡Mensaje Enviado Exitosamente!', `Gracias ${nombre}. Nos pondremos en contacto contigo al ${telefono} a la brevedad.`);
                contactForm.reset();

            } catch (error) {
                console.error('Error:', error);
                showToast('Error al enviar', 'Por favor, intenta de nuevo o contáctanos por WhatsApp', 'error');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }
});
