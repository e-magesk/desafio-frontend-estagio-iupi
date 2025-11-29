import { mockData } from './mock/transactions.js';

// ---
// ESTADO GLOBAL
// ---
let transactions = [...mockData];
let currentTheme = 'light';
let nextId = -1; // Será inicializado posteriormente
let newTransaction = {
        id: "",
        description: "",
        amount: "",
        date: "",
        type: "income"
    };

// ---
// SELETORES DO DOM (Constantes - Padrão UPPER_SNAKE_CASE)
// ---
const BODY = document.body;
const BTN_THEME_SWITCHER = document.getElementById('btn-theme-switcher');
const IMG_THEME_SWITCHER = document.querySelector('.img-theme-switcher');
const TABLE_TRANSACTIONS_BODY = document.getElementById('tbody-transactions');
const BADGE_TOTAL = document.getElementById('badge-total');
const INPUT_SEARCH = document.getElementById('input-search');
const SELECT_FILTER = document.getElementById('select-filter');
const WIDGET_TOTAL_AMOUNT = document.getElementById('widget-value-total-amount');
const WIDGET_TOTAL_INCOME = document.getElementById('widget-value-total-income');
const WIDGET_TOTAL_EXPENSE = document.getElementById('widget-value-total-expense');
const BTN_INCOME = document.getElementById('btn-income');
const BTN_EXPENSE = document.getElementById('btn-expense');
const INPUT_DESCRIPTION = document.getElementById('input-description');
const INPUT_AMOUNT = document.getElementById('input-amount');
const INPUT_DATE = document.getElementById('input-date');
const INPUT_DESCRIPTION_VALIDATION = document.getElementById('input-form-validation-description');
const INPUT_AMOUNT_VALIDATION = document.getElementById('input-form-validation-amount');
const INPUT_DATE_VALIDATION = document.getElementById('input-form-validation-date');


// ---
// FUNÇÕES AUXILIARES 
// ---

/**
 * Formata uma string de data (YYYY-MM-DD) para o padrão brasileiro (DD/MM/YYYY).
 * @param {string} dateString - A data no formato ISO.
 * @returns {string} A data formatada.
 */
function formatDate(dateString) { 
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

/**
 * Formata um valor numérico para o padrão brasileiro com duas casas decimais.
 * @param {number} amount - O valor numérico a ser formatado.
 * @returns {string} O valor formatado.
 */
function formatAmount(amount) {
    return new Intl.NumberFormat("pt-BR", 
        { minimumFractionDigits: 2, style: "currency", currency: "BRL" }).format(amount);

}

/**
 * Retorna a classe CSS do badge com base no tipo de transação.
 * @param {string} type - O tipo de transação (income ou expense).
 * @returns {string} A classe CSS do badge correspondente.
 */
function getBadgeClass(type) {

    if (type === 'income') {
        return 'badge badge-green';
    } else if (type === 'expense') {
        return 'badge badge-yellow';
    }
}

/**
 * Retorna a tradução do tipo de transação.
 * @param {string} type - O tipo de transação (income ou expense).
 * @returns {string} A tradução do tipo de transação.
 */
function getTranslatedType(type) {
    
    if (type === 'income') {
        return 'Entrada';
    }
    else if (type === 'expense') {
        return 'Saída';
    }
}

/**
 * Compara dois objetos de transação com base no valor do campo "amount".
 * @param {Object} a - O primeiro objeto de transação.
 * @param {Object} b - O segundo objeto de transação.
 * @returns {number} Um valor negativo, zero ou positivo, dependendo do resultado de a-b.
 * A ordenção é crescente.
 */
function compareAmounts(a, b) {
    return a.amount - b.amount;
}

/**
 * Compara dois objetos de transação com base no valor do campo "date".
 * @param {Object} a - O primeiro objeto de transação.
 * @param {Object} b - O segundo objeto de transação.
 * @returns {number} Um valor negativo, zero ou positivo, dependendo do resultado da comparação de datas.
 * A ordenção é crescente.
 */
function compareDates(a, b) {
    if (a.date < b.date) {
    return -1;
    }
    if (a.date > b.date) {
        return 1;
    }
    return 0;
}

/** * Calcula o valor final das transações somando entradas e subtraindo saídas.
 * @returns {number} O valor final das transações, considerando as entradas e saídas.
 */ 
function calculateFinalAmount(transactionsList) {
    return transactionsList.reduce((total, transaction) => {
        return transaction.type === 'income' 
            ? total + transaction.amount 
            : total - transaction.amount;
    }, 0);
}

/** * Calcula o valor total das transações do tipo "income".
 * @returns {number} O valor total das transações do tipo "income".
 */
function calculateTotalIncome(transactionsList) {
    return transactionsList
        .filter(transaction => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);
}

/** * Calcula o valor total das transações do tipo "expense".
 * @returns {number} O valor total das transações do tipo "expense".
 */
function calculateTotalExpense(transactionsList) {
    return transactionsList
        .filter(transaction => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);
}

/**
 * Calcula (apenas chamado na inicialização) qual é o próximo id a ser usado
 * ao adicionar uma nova transação
 */
function findNextId() {
    nextId = transactions.reduce((actual, transaction) => {
        return transaction.id > actual
            ? transaction.id + 1 
            : actual;
    }, -1);
    newTransaction.id = nextId;
}

// ---
// MANIPULADORES DE EVENTOS
// ---

/**
 * Lida com o clique no botão de trocar o tema (Light/Dark).
 */
BTN_THEME_SWITCHER.addEventListener('click', () => {

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
 * Lida com a entrada de texto no campo de busca.
 * Filtra as transações com base na descrição digitada pelo usuário.
 */
INPUT_SEARCH.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    
    // Filtra as transações com base no termo de busca
    const filteredTransactions = transactions.filter(transaction => 
        transaction.description.toLowerCase().includes(searchTerm)
    );

    // Renderiza as transações filtradas
    renderTransactions(filteredTransactions);
});

/**
 * Lida com a mudança na seleção do filtro.
 * Ordena as transações com base no critério selecionado (amount ou date).
 */
SELECT_FILTER.addEventListener('change', (event) => {
    const filterValue = event.target.value;

    let sortedTransactions = [...transactions];

    if (filterValue === 'amount') {
        sortedTransactions.sort(compareAmounts);
    } else if (filterValue === 'date') {
        sortedTransactions.sort(compareDates);
    }

    // Renderiza as transações ordenadas
    renderTransactions(sortedTransactions);
});

/**
 * Como o botão de deletar será criado apenas posteriormente, é preciso
 * monitorar a tabela inteira para saber qual botão de deletar foi selecionado.
 * 
 * Após a identificação da linha refente ao botão, o item é permanentemente 
 * removido da lista de transações
 */
TABLE_TRANSACTIONS_BODY.addEventListener('click', (event) => {
    if (event.target.closest('#btn-delete-transaction')) {

        const buttonDeleteClicked = event.target.closest('#btn-delete-transaction');
        const transactionId = parseInt(buttonDeleteClicked.dataset.id);

        // Remove a transação do estado global
        transactions = transactions.filter(transaction => transaction.id !== transactionId);
    
        // Renderiza as transações novamente
        renderTransactions(transactions);
    }
});

/**
 * Seleciona a opção de tipo de transação para "income"
 */
BTN_INCOME.addEventListener('click', (event) => {
    newTransaction.type = 'income';

    const styles = getComputedStyle(BODY);

    // Muda as cores do botão INCOME para SELECIONADO
    BTN_INCOME.style.color = styles.getPropertyValue('--system-font-color-btn-income-selected');
    BTN_INCOME.style.backgroundColor = styles.getPropertyValue('--system-bg-btn-income-selected');
    BTN_INCOME.style.borderColor = styles.getPropertyValue('--system-border-btn-income-selected');

    // Muda as cores do botão EXPENSE para NÃO SELECIONADO
    BTN_EXPENSE.style.color = styles.getPropertyValue('--system-font-color-btn-expense-income-default');
    BTN_EXPENSE.style.backgroundColor = styles.getPropertyValue('--system-bg-btn-expense-income-default');
    BTN_EXPENSE.style.borderColor = styles.getPropertyValue('--system-border-btn-expense-income-default');
});

/**
 * Seleciona a opção de tipo de transação para "expense"
 */
BTN_EXPENSE.addEventListener('click', (event) => {
    newTransaction.type = 'expense';

    const styles = getComputedStyle(BODY);

    // Muda as cores do botão INCOME para SELECIONADO
    BTN_EXPENSE.style.color = styles.getPropertyValue('--system-font-color-btn-expense-selected');
    BTN_EXPENSE.style.backgroundColor = styles.getPropertyValue('--system-bg-btn-expense-selected');
    BTN_EXPENSE.style.borderColor = styles.getPropertyValue('--system-border-btn-expense-selected');

    // Muda as cores do botão EXPENSE para NÃO SELECIONADO
    BTN_INCOME.style.color = styles.getPropertyValue('--system-font-color-btn-expense-income-default');
    BTN_INCOME.style.backgroundColor = styles.getPropertyValue('--system-bg-btn-expense-income-default');
    BTN_INCOME.style.borderColor = styles.getPropertyValue('--system-border-btn-expense-income-default');
});

/**
 * Lida com a entrada de texto no campo DESCRIÇÃO de preencher nova transição.
 */
INPUT_DESCRIPTION.addEventListener('input', (event) => {
    let description = event.target.value;
    const styles = getComputedStyle(BODY);

    if(description !== ""){
        INPUT_DESCRIPTION_VALIDATION.style.display = 'none';
        INPUT_DESCRIPTION.style.borderColor = styles.getPropertyValue('--system-border-color-form');
    }
});

/**
 * Lida com a validação no campo DESCRIÇÃO de preencher nova transição.
 * 
 */
INPUT_DESCRIPTION.addEventListener('blur', (event) => {
    const description = event.target.value;
    const styles = getComputedStyle(BODY);

    if(description === ""){
        INPUT_DESCRIPTION_VALIDATION.style.display = 'flex';
        INPUT_DESCRIPTION.style.borderColor = styles.getPropertyValue('--system-validation-error-color');
    }
});

/**
 * Lida com a entrada de texto no campo VALOR de preencher nova transição.
 */
INPUT_AMOUNT.addEventListener('input', (event) => {
    let amount = event.target.value;
    const styles = getComputedStyle(BODY);

    if(amount !== ""){
        INPUT_AMOUNT_VALIDATION.style.display = 'none';
        INPUT_AMOUNT.style.borderColor = styles.getPropertyValue('--system-border-color-form');
    }
});

/**
 * Lida com a validação no campo VALOR de preencher nova transição.
 * 
 */
INPUT_AMOUNT.addEventListener('blur', (event) => {
    const amount = event.target.value;
    const styles = getComputedStyle(BODY);

    if(amount === ""){
        INPUT_AMOUNT_VALIDATION.style.display = 'flex';
        INPUT_AMOUNT.style.borderColor = styles.getPropertyValue('--system-validation-error-color');
    }
});

/**
 * Lida com a entrada de texto no campo DATA de preencher nova transição.
 */
INPUT_DATE.addEventListener('input', (event) => {
    let date = event.target.value;
    const styles = getComputedStyle(BODY);

    if(date !== ""){
        INPUT_DATE_VALIDATION.style.display = 'none';
        INPUT_DATE.style.borderColor = styles.getPropertyValue('--system-border-color-form');
    }
});

/**
 * Lida com a validação no campo DATA de preencher nova transição.
 * 
 */
INPUT_DATE.addEventListener('blur', (event) => {
    const date = event.target.value;
    const styles = getComputedStyle(BODY);

    if(date === ""){
        INPUT_DATE_VALIDATION.style.display = 'flex';
        INPUT_DATE.style.borderColor = styles.getPropertyValue('--system-validation-error-color');
    }
});

/**
 * Função de inicialização da aplicação. A "main"
 */
function init() {

    // Ordena as transações por data ao iniciar
    transactions.sort(compareDates);

    // Renderiza as transações iniciais obtidas através do mock
    renderTransactions(transactions);

    // Renderiza o total de transações no badge
    renderBadgeTransactionTotal();

    // Encontra o próximo id para adicionar uma nova transação
    findNextId();
}

// ---
// RENDERIZAÇÃO DA APLICAÇÃO
// ---

/**
 * Renderiza a lista de transações na tabela.
 * @param {Array} transactionsList - A lista de transações a ser renderizada na tabela de Lançamentos.
*/
function renderTransactions(transactionsList) {
    
    // Limpa o corpo da tabela antes de renderizar
    TABLE_TRANSACTIONS_BODY.innerHTML = '';

    // Atualiza os widgets de resumo após renderizar as transações
    // Isso possibilita que os widgets reflitam apenas as transações atualmente exibidas
    // na tabela, mesmo com um filtro de busca aplicado.
    renderWidgets(transactionsList);

    if (transactionsList.length === 0) {
        renderNonTransactionFoundMessage();
        return;
    }

    // Itera sobre cada transação e cria uma linha na tabela
    transactionsList.forEach(transaction => {
        const row = document.createElement('tr');
        row.classList.add('tr-body');

        // Cria as células da linha
        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(transaction.date);

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = transaction.description;

        const amountCell = document.createElement('td');
        amountCell.textContent = formatAmount(transaction.amount);

        const typeCell = document.createElement('td');
        const badgeSpan = document.createElement('span');
        badgeSpan.className = getBadgeClass(transaction.type);
        badgeSpan.textContent = getTranslatedType(transaction.type);
        typeCell.innerHTML = '';
        typeCell.appendChild(badgeSpan);

        const buttonCell = document.createElement('td');
        const button = document.createElement('button');
        button.className = 'btn-icon';
        button.innerHTML = '<img src="assets/icons/trash.svg" alt="Excluir">';
        button.id = 'btn-delete-transaction';
        button.dataset.id = transaction.id;
        buttonCell.appendChild(button);
        
        // Adiciona as células à linha
        row.appendChild(dateCell);
        row.appendChild(descriptionCell);
        row.appendChild(amountCell);
        row.appendChild(typeCell);
        row.appendChild(buttonCell);

        // Adiciona a linha ao corpo da tabela
        TABLE_TRANSACTIONS_BODY.appendChild(row);
    });

}

/**
 * Renderiza o total de transações no badge.
 * @param {number} total - O total de transações a ser exibido.
 */
function renderBadgeTransactionTotal() {
    BADGE_TOTAL.textContent = transactions.length;
}

/**
 * Renderiza a mensagem de "Nenhuma transação encontrada" na tabela.
 * Será usada quando a função ""renderTransactions" for chamada com uma lista vazia.
 */
function renderNonTransactionFoundMessage() {
    const message = document.createElement('tr');
    message.innerHTML = '<td style="text-align: center;" colspan="5">Nenhuma transação encontrada.</td>';
    TABLE_TRANSACTIONS_BODY.appendChild(message);
}

/**
 * Renderiza os valores nos widgets de resumo, sendo eles: ENTRADAS, SAÍDAS e TOTAL.
 * Essa função é chamada sempre que há uma atualização nas transações exibidas.
 */
function renderWidgets(transactionsList) {
    WIDGET_TOTAL_AMOUNT.textContent = formatAmount(calculateFinalAmount(transactionsList));
    WIDGET_TOTAL_INCOME.textContent = formatAmount(calculateTotalIncome(transactionsList));
    WIDGET_TOTAL_EXPENSE.textContent = formatAmount(calculateTotalExpense(transactionsList));
}

// Inicia a aplicação
init();
