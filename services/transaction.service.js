const TRANSACTIONS_URL = 'http://localhost:8000/transactions/';
const LOGIN_URL = 'http://localhost:8000/login';
const SUMMARY_URL = 'http://localhost:8000/summary';


// Função Auxiliar para montar os cabeçalhos com o Token
function getHeaders() {
    const token = localStorage.getItem('user_token');
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    };
}

export const ApiService = {
    // Função para realizar "login" e armazenar o token
    async login(username, password) {
        const response = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                "username" : username, 
                "password" : password 
            })
        });
    
        if (!response.ok) {
            throw new Error('Login failed');
        }
    
        const data = await response.json();
        localStorage.setItem('user_token', data.access);
    },

    // GET
    async get(descriptionFilter = '', orderBy = '-date') {
        let url = `${TRANSACTIONS_URL}?`;
        
        if (descriptionFilter) {
            url += `description=${encodeURIComponent(descriptionFilter)}&`;
        }
        if (orderBy) {
            url += `order_by=${encodeURIComponent(orderBy)}&`;
        }

        const response = await fetch(`${url}`, {
            method: 'GET',
            headers: getHeaders() 
        });
        
        if (response.status === 401) {
            throw new Error('Sessão expirada');
        }

        return await response.json();
    },
    // GET
    async specific_get(url) {

        const response = await fetch(`${url}`, {
            method: 'GET',
            headers: getHeaders() 
        });
        
        if (response.status === 401) {
            throw new Error('Sessão expirada');
        }

        return await response.json();
    },

    // POST
    async post(transaction) {
        const response = await fetch(`${TRANSACTIONS_URL}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(transaction)
        });

        if (response.status === 401) {
            logout();
            throw new Error('Sessão expirada');
        }

        return await response.json();
    },

    // DELETE
    async delete(id) {
        const response = await fetch(`${TRANSACTIONS_URL}${id}/`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (response.status === 401) {
            throw new Error('Sessão expirada');
        }
    },

    // SUMMARY
    async summary(descriptionFilter = '', orderBy = '-date') {
        let url = `${SUMMARY_URL}?`;
        
        if (descriptionFilter) {
            url += `description=${encodeURIComponent(descriptionFilter)}&`;
        }
        if (orderBy) {
            url += `order_by=${encodeURIComponent(orderBy)}&`;
        }

        const response = await fetch(`${url}`, {
            method: 'GET',
            headers: getHeaders() 
        });
        
        if (response.status === 401) {
            throw new Error('Sessão expirada');
        }

        return await response.json();
    }
};
