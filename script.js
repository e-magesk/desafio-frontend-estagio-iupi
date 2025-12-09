import { mockData } from './mock/transactions.js';
import { ApiService } from './services/transaction.service.js';

// ---
// ESTADO GLOBAL
// ---
let transactions = [...mockData];
let transactionsDisplayed = [...mockData]
let currentTheme = 'light';
let typeNewTransaction = 'income'
let fieldsValidation = {
    'description' : false,
    'amount' : false,
    'date' : false
}

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
const BTN_ADD_TRANSACTION = document.getElementById('btn-add-transaction');
const INPUT_DESCRIPTION = document.getElementById('input-description');
const INPUT_AMOUNT = document.getElementById('input-amount');
const INPUT_DATE = document.getElementById('input-date');
const INPUT_DESCRIPTION_VALIDATION = document.getElementById('input-form-validation-description');
const INPUT_AMOUNT_VALIDATION = document.getElementById('input-form-validation-amount');
const INPUT_DATE_VALIDATION = document.getElementById('input-form-validation-date');
const FORM_NEW_TRANSACTION = document.getElementById('form-new-transaction');


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
 * Compara dois objetos de transação com base no valor do campo "amount".
 * @param {Object} a - O primeiro objeto de transação.
 * @param {Object} b - O segundo objeto de transação.
 * @returns {number} Um valor negativo, zero ou positivo, dependendo do resultado de b-a.
 * A ordenção é decrescente.
 */
function compareAmountsDesc(a, b) {
    return b.amount - a.amount;
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

/**
 * Compara dois objetos de transação com base no valor do campo "date".
 * @param {Object} a - O primeiro objeto de transação.
 * @param {Object} b - O segundo objeto de transação.
 * @returns {number} Um valor negativo, zero ou positivo, dependendo do resultado da comparação de datas.
 * A ordenção é decrescente.
 */
function compareDatesDesc(a, b) {
    if (b.date < a.date) {
    return -1;
    }
    if (b.date > a.date) {
        return 1;
    }
    return 0;
}

/** * Calcula o valor final das transações somando entradas e subtraindo saídas.
 * @param {Array} transactionsList - lista das transações das quais se 
 * calcular o total
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
 * @param {Array} transactionsList - lista das transações das quais se 
 * calcular o total das entradas
 * @returns {number} O valor total das transações do tipo "income".
 */
function calculateTotalIncome(transactionsList) {
    return transactionsList
        .filter(transaction => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);
}

/** * Calcula o valor total das transações do tipo "expense".
 * @param {Array} transactionsList - lista das transações das quais se 
 * calcular o total dos gastos
 * @returns {number} O valor total das transações do tipo "expense".
 */
function calculateTotalExpense(transactionsList) {
    return transactionsList
        .filter(transaction => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);
}

/**
 * Reseta o formulário e o inicializa 
 */
function initForm(){

    const styles = getComputedStyle(BODY);

    // Reseta o form
    FORM_NEW_TRANSACTION.reset();

    // Reseta as mensagens de erro (caso existam)
    INPUT_DESCRIPTION_VALIDATION.style.display = 'none';
    INPUT_DESCRIPTION.style.borderColor = 'var(--system-border-color-form)';

    INPUT_AMOUNT_VALIDATION.style.display = 'none';
    INPUT_AMOUNT.style.borderColor = 'var(--system-border-color-form)';

    INPUT_DATE_VALIDATION.style.display = 'none';
    INPUT_DATE.style.borderColor = 'var(--system-border-color-form)';
}

/**
 * Verifica se o form é válido. O formulário só é válido se todos os campos
 * forem válidos
 */
function isValidForm(){
    if(fieldsValidation.description === true && fieldsValidation.amount === true && fieldsValidation.date === true) return true;
    return false;
}

/**
 * Função para formatar o ojeto recebido com os dados da transação para o formato esperado
 * de cada campo do objto.
 * @param {object} transaction - A transação a ser formatada.
 */
function formatObjectTransaction(transaction) {
    return {
        'id' : parseInt(transaction.id),
        'description' : transaction.description.charAt(0).toUpperCase() + transaction.description.slice(1).toLowerCase(),
        'amount' : parseFloat(transaction.amount.replace(',', '.')),
        'type' : transaction.type,
        'date': transaction.date
    }
}

// ---
// ARMAZENAMENTO
// ---

/**
 * Verifica se há algum dado salvo no navegador sobre as transações ou o tema
 * anteriormente escolhido pelo usuário. Se houver, carrega essas informações.
*/
function loadLocalStorage() {
    
    if(localStorage.getItem('theme')){
        if(localStorage.getItem('theme') === 'dark'){
            BTN_THEME_SWITCHER.click();
        }
    }
}

/**
 * Atualiza o localStorage com as informações atuais sobre o tema e as transações
 */
function updateLocalStorage() {

    localStorage.setItem('theme', currentTheme);
}


// ---
// BANCO DE DADOS
// ---


function loadDbTransactions() {
    ApiService.get()
        .then(data => {
            transactions = data.results.map(transaction => formatObjectTransaction(transaction));
            transactionsDisplayed = [...transactions];

            // Ordena as transações por data ao iniciar
            transactions.sort(compareDates);

            // Renderiza as transações iniciais obtidas através do mock
            renderTransactions(transactions);

            // Renderiza o total de transações no badge
            renderBadgeTransactionTotal(transactions);
        })
        .catch(error => {
            console.error('Erro ao carregar transações do banco:', error);
        });
}

function createDbTransaction(transaction) {
    ApiService.post(transaction)
        .then(data => {
            // Reinicia o formulário
            initForm();
            
            // Reinicia os filtros e tabela
            SELECT_FILTER.value = "date"
            INPUT_SEARCH.value = ""
            loadDbTransactions();
        })
        .catch(error => {
            console.error('Erro ao criar transação no banco:', error);
        });
}

function deleteDbTransaction(id) {
    ApiService.delete(id)
        .then(() => {
            console.log('Transação deletada com sucesso do banco:', id);

            // Recarrega as transações do banco
            loadDbTransactions();

            // Reinicia os filtros e tabela
            SELECT_FILTER.value = "date"
            INPUT_SEARCH.value = ""
        })
        .catch(error => {
            console.error('Erro ao deletar transação do banco:', error);
        });
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

    // Atualiza o localStorage sobre a mudança no tema
    updateLocalStorage();

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

    // Atualiza a lista de transações sendo exibidas
    transactionsDisplayed = [...filteredTransactions]

    // Renderiza as transações filtradas
    renderTransactions(filteredTransactions);
});

/**
 * Lida com a mudança na seleção do filtro.
 * Ordena as transações com base no critério selecionado (amount ou date).
 */
SELECT_FILTER.addEventListener('change', (event) => {
    const filterValue = event.target.value;

    let sortedTransactions = [...transactionsDisplayed];

    if (filterValue === 'amount') {
        sortedTransactions.sort(compareAmounts);
    } else if (filterValue === 'amount desc') {
        sortedTransactions.sort(compareAmountsDesc);
    } else if (filterValue === 'date') {
        sortedTransactions.sort(compareDates);
    } else if (filterValue === 'date desc') {
        sortedTransactions.sort(compareDatesDesc);
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

        // Remove a transação do banco de dados
        deleteDbTransaction(transactionId);
    }
});

/**
 * Seleciona a opção de tipo de transação para "income"
 */
BTN_INCOME.addEventListener('click', (event) => {

    const styles = getComputedStyle(BODY);

    // Muda as cores do botão INCOME para SELECIONADO
    BTN_INCOME.style.color = 'var(--system-font-color-btn-income-selected)';
    BTN_INCOME.style.backgroundColor = 'var(--system-bg-btn-income-selected)';
    BTN_INCOME.style.borderColor = 'var(--system-border-btn-income-selected)';

    // Muda as cores do botão EXPENSE para NÃO SELECIONADO
    BTN_EXPENSE.style.color = 'var(--system-font-color-btn-expense-income-default)';
    BTN_EXPENSE.style.backgroundColor = 'var(--system-bg-btn-expense-income-default)';
    BTN_EXPENSE.style.borderColor = 'var(--system-border-btn-expense-income-default)';

    typeNewTransaction = 'income';
});

/**
 * Seleciona a opção de tipo de transação para "expense"
 */
BTN_EXPENSE.addEventListener('click', (event) => {

    const styles = getComputedStyle(BODY);

    // Muda as cores do botão INCOME para SELECIONADO
    BTN_EXPENSE.style.color = 'var(--system-font-color-btn-expense-selected)';
    BTN_EXPENSE.style.backgroundColor = 'var(--system-bg-btn-expense-selected)';
    BTN_EXPENSE.style.borderColor = 'var(--system-border-btn-expense-selected)';

    // Muda as cores do botão EXPENSE para NÃO SELECIONADO
    BTN_INCOME.style.color = 'var(--system-font-color-btn-expense-income-default)';
    BTN_INCOME.style.backgroundColor = 'var(--system-bg-btn-expense-income-default)';
    BTN_INCOME.style.borderColor = 'var(--system-border-btn-expense-income-default)';

    typeNewTransaction = 'expense';
});

/**
 * Lida com a entrada de texto no campo DESCRIÇÃO de preencher nova transição.
 */
INPUT_DESCRIPTION.addEventListener('input', (event) => {
    let description = event.target.value;
    const styles = getComputedStyle(BODY);

    if(description !== ""){
        INPUT_DESCRIPTION_VALIDATION.style.display = 'none';
        INPUT_DESCRIPTION.style.borderColor = 'var(--system-border-color-form)';
        fieldsValidation.description = true;
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
        INPUT_DESCRIPTION.style.borderColor = 'var(--system-validation-error-color)';
        fieldsValidation.description = false;
    }
});

/**
 * Lida com a entrada de texto no campo VALOR de preencher nova transição.
 */
INPUT_AMOUNT.addEventListener('input', (event) => {
    let amount = event.target.value;
    const styles = getComputedStyle(BODY);

    if(amount !== ""){     
        // Aceita apenas números e uso de vírgula para separação da parte decimal
        let value = amount.replace(/[^0-9,]/g, '');
        INPUT_AMOUNT.value = value;
        
        // Permite apenas duas casas decimais
        if(value.includes(',')){
            let decimal = value.split(',')[1]
            if(decimal.length > 2){
                decimal = decimal.slice(0, 2);
                INPUT_AMOUNT.value = value.split(',')[0] + ',' + decimal;
            }
        }
        
        // Verifica se restou alguma coisa válida
        if (INPUT_AMOUNT.value !== ''){
            INPUT_AMOUNT_VALIDATION.style.display = 'none';
            INPUT_AMOUNT.style.borderColor = 'var(--system-border-color-form)';
            fieldsValidation.amount = true;
        }
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
        INPUT_AMOUNT.style.borderColor = 'var(--system-validation-error-color)';
        INPUT_AMOUNT_VALIDATION.value = 'O preenchimento do campo é obrigatório!';
        fieldsValidation.amount = false;
    }
    else{
        // Completa o número digitado para ser decimal e com exatamente duas casas decimais
        if(!amount.includes(',')){
            INPUT_AMOUNT.value = amount + ',00';
        }
        else{
            if(amount.split(',')[1].length == 1){
                INPUT_AMOUNT.value = amount + '0';
            }
        }

        let value = parseFloat(amount.replace(',', '.'));
        if(value === 0){
            INPUT_AMOUNT_VALIDATION.innerText = 'O valor não pode ser 0,00!';
            INPUT_AMOUNT_VALIDATION.style.display = 'flex';
            INPUT_AMOUNT.style.borderColor = 'var(--system-validation-error-color)';
            fieldsValidation.amount = false;
        }
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
        INPUT_DATE.style.borderColor = 'var(--system-border-color-form)';
        fieldsValidation.date = true;
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
        INPUT_DATE.style.borderColor = 'var(--system-validation-error-color)';
        fieldsValidation.date = false;
    }
});

/**
 * Adiciona uma nova transação na lista de transações existentes a partir
 * dos dados do formulário
 */
BTN_ADD_TRANSACTION.addEventListener('click', (event) => {

    // Se não for válido as mensagens de alerta já estarão lá, é preciso apenas recusar 
    // a solicitação de submit 
    if(!isValidForm()) return;

    const form = new FormData(FORM_NEW_TRANSACTION);

    // Adiciona valores de fora do form que fazem parte da transação
    form.append('type', typeNewTransaction);
    
    // Pega o objeto Transaction do form
    const newTransaction = formatObjectTransaction(Object.fromEntries(form));

    // Cria a transação no banco de dados
    createDbTransaction(newTransaction);
});


/**
 * Função de inicialização da aplicação. A "main"
 */
function init() {

    // Realiza o login do usuário para obter o token de autenticação
    ApiService.login('eduarda', 'admin');

    // Carrega as transações salvas no banco
    loadDbTransactions();

    // Carrega as preferências salvas no localStorage
    loadLocalStorage();

    // Inicializa o form
    initForm();
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
    renderBadgeTransactionTotal(transactionsList);

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
function renderBadgeTransactionTotal(transactions) {
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
 * @param {Array} transactionsList - Transações a serem consideradas para os cálculos
 */
function renderWidgets(transactionsList) {
    WIDGET_TOTAL_AMOUNT.textContent = formatAmount(calculateFinalAmount(transactionsList));
    WIDGET_TOTAL_INCOME.textContent = formatAmount(calculateTotalIncome(transactionsList));
    WIDGET_TOTAL_EXPENSE.textContent = formatAmount(calculateTotalExpense(transactionsList));
}

// Inicia a aplicação
init();
