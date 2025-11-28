import { mockData } from './mock/transactions.js';

// ---
// ESTADO GLOBAL
// ---
let transactions = [...mockData];
let currentTheme = 'light';

// ---
// SELETORES DO DOM (Constantes - Padrão UPPER_SNAKE_CASE)
// ---
const BTN_THEME_SWITCHER = document.getElementById('btn-theme-switcher');
const BODY = document.body;
const IMG_THEME_SWITCHER = document.querySelector('.img-theme-switcher');

// ---
// FUNÇÕES AUXILIARES 
// ---

/**
 * Formata uma string de data (YYYY-MM-DD) para o padrão brasileiro (DD/MM/YYYY).
 * @param {string} dateString - A data no formato ISO.
 * @returns {string} A data formatada.
 */
// function formatDate(dateString) { ... }


// ---
// MANIPULADORES DE EVENTOS
// ---

/**
 * Lida com o clique no botão de trocar o tema (Light/Dark).
 */
BTN_THEME_SWITCHER.addEventListener('click', () => {
    console.log('Clicou no botão de trocar tema');

    // Alterna o tema atual
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    BODY.setAttribute('data-theme', currentTheme);

    // Atualiza o ícone do botão conforme o tema
    if (currentTheme === 'light') {
        IMG_THEME_SWITCHER.src = 'assets/icons/moon.svg';
    } else {
        IMG_THEME_SWITCHER.src = 'assets/icons/sun.svg';
    }

});

/**
 * Função de inicialização da aplicação. A "main"
 */
function init() {
}

// Inicia a aplicação
init();
