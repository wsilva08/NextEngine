/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { states } from './brazil-states-cities';

// Handle header style change on scroll
const header = document.querySelector<HTMLElement>('.header');
window.addEventListener('scroll', () => {
    if (header) {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        } else {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            header.style.boxShadow = 'none';
        }
    }
});

// --- Hamburger Menu ---
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

const toggleNav = () => {
    hamburger?.classList.toggle('is-active');
    navMenu?.classList.toggle('is-active');
    document.body.classList.toggle('no-scroll');
};

hamburger?.addEventListener('click', toggleNav);

// Close menu when a nav link is clicked
document.querySelectorAll('.nav-menu a[href^="#"]').forEach(navLink => {
    navLink.addEventListener('click', () => {
        if (navMenu?.classList.contains('is-active')) {
            toggleNav();
        }
    });
});


// Handle "Back to Top" button visibility and functionality
const backToTopButton = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    if (backToTopButton) {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    }
});

backToTopButton?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// --- Modal Handling ---

const modalTriggers = document.querySelectorAll<HTMLAnchorElement>('[data-modal-trigger]');
let lastActiveElement: HTMLElement | null = null;


// --- Legal Modal Logic ---

const legalModalOverlay = document.getElementById('legal-modal-overlay');
const legalModalTitle = document.getElementById('modal-title');
const legalModalContent = document.getElementById('modal-content');
const legalModalCloseBtn = document.querySelector('#legal-modal .modal-close-btn') as HTMLButtonElement;

const legalContent = {
    privacy: {
        title: 'Política de Privacidade',
        content: `
            <p>A sua privacidade é importante para nós. É política do Next Evolution respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site Next Evolution, e outros sites que possuímos e operamos.</p>
            <h4>1. Coleta de Informações</h4>
            <p>Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.</p>
            <h4>2. Uso de Informações</h4>
            <p>Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.</p>
            <h4>3. Divulgação a Terceiros</h4>
            <p>Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.</p>`
    },
    terms: {
        title: 'Termos de Uso',
        content: `
            <h4>1. Aceitação dos Termos</h4>
            <p>Ao acessar o site Next Evolution, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.</p>
            <h4>2. Uso de Licença</h4>
            <p>É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Next Evolution, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título.</p>
            <h4>3. Limitações</h4>
            <p>Em nenhum caso o Next Evolution ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em Next Evolution.</p>`
    },
    cookies: {
        title: 'Política de Cookies',
        content: `
            <h4>O que são cookies?</h4>
            <p>Como é prática comum em quase todos os sites profissionais, este site usa cookies, que são pequenos arquivos baixados no seu computador, para melhorar sua experiência. Esta página descreve quais informações eles coletam, como as usamos e por que às vezes precisamos armazenar esses cookies.</p>
            <h4>Como usamos cookies?</h4>
            <p>Utilizamos cookies por vários motivos, detalhados abaixo. Infelizmente, na maioria dos casos, não existem opções padrão do setor para desativar os cookies sem desativar completamente a funcionalidade e os recursos que eles adicionam a este site. É recomendável que você deixe todos os cookies se não tiver certeza se precisa ou não deles, caso sejam usados para fornecer um serviço que você usa.</p>`
    },
    lgpd: {
        title: 'Conformidade com a LGPD',
        content: `
            <p>A Next Evolution está em conformidade com a Lei Geral de Proteção de Dados (LGPD), Lei nº 13.709/2018, que visa proteger os dados pessoais de todos os cidadãos.</p>
            <h4>Seus Direitos</h4>
            <p>Você tem o direito de solicitar acesso, correção, exclusão ou portabilidade dos seus dados. Também pode retirar o consentimento ou opor-se ao processamento a qualquer momento.</p>
            <h4>Contato do DPO</h4>
            <p>Para exercer seus direitos ou para quaisquer dúvidas relacionadas à proteção de seus dados, entre em contato com nosso Encarregado de Proteção de Dados (DPO) através do e-mail: dpo@nextevolution.ia.br</p>`
    }
};

const openLegalModal = (page: string) => {
    const content = legalContent[page as keyof typeof legalContent];
    if (content && legalModalTitle && legalModalContent && legalModalOverlay) {
        lastActiveElement = document.activeElement as HTMLElement;
        legalModalTitle.textContent = content.title;
        legalModalContent.innerHTML = content.content;
        legalModalOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        legalModalCloseBtn?.focus();
    }
};

const closeLegalModal = () => {
    if (legalModalOverlay) {
        legalModalOverlay.classList.remove('show');
        document.body.style.overflow = '';
        lastActiveElement?.focus();
    }
};

legalModalCloseBtn?.addEventListener('click', closeLegalModal);

legalModalOverlay?.addEventListener('click', (e) => {
    if (e.target === legalModalOverlay) {
        closeLegalModal();
    }
});


// --- Contact Modal Logic ---

const contactModalOverlay = document.getElementById('contact-modal-overlay');
const contactModalCloseBtn = document.querySelector('#contact-modal .modal-close-btn') as HTMLButtonElement;
const contactForm = document.getElementById('contact-form') as HTMLFormElement;
const formStatus = document.getElementById('form-status');
const submitButton = contactForm?.querySelector('button[type="submit"]') as HTMLButtonElement;
const stateSelect = document.getElementById('contact-state') as HTMLSelectElement;
const citySelect = document.getElementById('contact-city') as HTMLSelectElement;


const openContactModal = () => {
    if (contactModalOverlay) {
        lastActiveElement = document.activeElement as HTMLElement;
        contactModalOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        contactModalCloseBtn?.focus();
    }
};

const closeContactModal = () => {
    if (contactModalOverlay) {
        contactModalOverlay.classList.remove('show');
        document.body.style.overflow = '';
        contactForm?.reset();
        citySelect.innerHTML = '<option value="">Escolha a cidade</option>';
        citySelect.disabled = true;
        lastActiveElement?.focus();
        if(formStatus) {
            formStatus.textContent = '';
            formStatus.className = 'form-status';
        }
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar';
        }
    }
};

contactModalCloseBtn?.addEventListener('click', closeContactModal);

contactModalOverlay?.addEventListener('click', (e) => {
    if (e.target === contactModalOverlay) {
        closeContactModal();
    }
});

// Populate states dropdown
states.forEach(state => {
    const option = document.createElement('option');
    option.value = state.sigla;
    option.textContent = state.nome;
    stateSelect?.appendChild(option);
});

// Handle state change to populate cities
stateSelect?.addEventListener('change', () => {
    const selectedStateAbbr = stateSelect.value;
    citySelect.innerHTML = '<option value="">Carregando...</option>';

    const selectedState = states.find(s => s.sigla === selectedStateAbbr);

    if (selectedState) {
        citySelect.innerHTML = '<option value="">Selecione o estado</option>';
        selectedState.cidades.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
        citySelect.disabled = false;
    } else {
        citySelect.innerHTML = '<option value="">Selecione a cidade</option>';
        citySelect.disabled = true;
    }
});

contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = (contactForm.elements.namedItem('name') as HTMLInputElement)?.value;
    const email = (contactForm.elements.namedItem('email') as HTMLInputElement)?.value;
    const phone = (contactForm.elements.namedItem('phone') as HTMLInputElement)?.value;
    const state = (contactForm.elements.namedItem('state') as HTMLSelectElement)?.value;
    const city = (contactForm.elements.namedItem('city') as HTMLSelectElement)?.value;

    if (name && email && phone && state && city) {
        if(submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';
        }
        if (formStatus) {
            formStatus.textContent = 'Sucesso! Redirecionando para o WhatsApp...';
            formStatus.className = 'form-status success';
        }

        setTimeout(() => {
            const phoneNumber = '5519974036518';
            const message = `Olá! Gostaria de solicitar uma consultoria.\n\n*Nome:* ${name}\n*E-mail:* ${email}\n*Telefone:* ${phone}\n*Cidade:* ${city} - ${state}`;
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            window.open(whatsappUrl, '_blank');
            closeContactModal();
        }, 1500);
    }
});


// --- Global Modal Triggers ---

modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const page = trigger.dataset.modalTrigger;
        if (page) {
            if (page in legalContent) {
                openLegalModal(page);
            } else if (page === 'contact') {
                // If mobile nav is open, close it before opening the modal
                if (navMenu?.classList.contains('is-active')) {
                   toggleNav();
                }
                openContactModal();
            }
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (legalModalOverlay?.classList.contains('show')) {
            closeLegalModal();
        }
        if (contactModalOverlay?.classList.contains('show')) {
            closeContactModal();
        }
    }
});

// --- Smooth Scrolling for Anchor Links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (this: HTMLAnchorElement, e: MouseEvent) {
        // Exclude modal triggers from this custom scrolling logic
        if (this.dataset.modalTrigger) {
            return;
        }

        e.preventDefault(); // Prevent default anchor behavior

        const href = this.getAttribute('href');

        // Special case for scrolling to the very top
        if (!href || href === '#' || href === '#hero') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            return;
        }

        // For all other sections
        const targetElement = document.querySelector<HTMLElement>(href);
        if (targetElement) {
            // The CSS 'scroll-padding-top' is respected by scrollIntoView,
            // ensuring the section is not hidden behind the fixed header.
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});