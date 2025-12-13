// sistema-condicoes.js - VERSÃO SIMPLES

let condicoesMarcadas = [];

// Quando carregar a página
window.onload = function() {
    // Carrega condições salvas
    const salvo = localStorage.getItem('condicoesFicha');
    if (salvo) {
        condicoesMarcadas = JSON.parse(salvo);
        
        // Marca os checkboxes salvos
        condicoesMarcadas.forEach(condicao => {
            const elemento = document.querySelector(`[data-condicao="${condicao}"]`);
            if (elemento) elemento.classList.add('ativa');
        });
        
        // Atualiza contador
        atualizarContador();
    }
};

// Função de clicar (já no seu HTML)
function alternarCondicao(elemento) {
    const condicao = elemento.getAttribute('data-condicao');
    
    // Marca/desmarca visualmente
    elemento.classList.toggle('ativa');
    
    // Adiciona ou remove da lista
    if (elemento.classList.contains('ativa')) {
        if (!condicoesMarcadas.includes(condicao)) {
            condicoesMarcadas.push(condicao);
        }
    } else {
        condicoesMarcadas = condicoesMarcadas.filter(c => c !== condicao);
    }
    
    // Atualiza número
    atualizarContador();
    
    // Salva
    localStorage.setItem('condicoesFicha', JSON.stringify(condicoesMarcadas));
    
    // Envia pro resumo (só atualiza uma div)
    atualizarResumo();
}

// Atualiza o número [X] ativas
function atualizarContador() {
    const contador = document.getElementById('condicoesAtivas');
    if (contador) {
        contador.textContent = condicoesMarcadas.length;
    }
}

// Atualiza a aba de resumo
function atualizarResumo() {
    const resumoDiv = document.getElementById('resumoCondicoes');
    if (!resumoDiv) return;
    
    // Limpa
    resumoDiv.innerHTML = '';
    
    // Se não tem condições
    if (condicoesMarcadas.length === 0) {
        resumoDiv.innerHTML = '<span class="sem-condicoes">Nenhuma condição ativa</span>';
        return;
    }
    
    // Mostra as condições ativas
    condicoesMarcadas.forEach(condicao => {
        const span = document.createElement('span');
        span.className = 'condicao-resumo';
        span.textContent = condicao; // Ou o nome bonito
        resumoDiv.appendChild(span);
    });
}

// Pra limpar todas (opcional)
function limparTodasCondicoes() {
    if (confirm('Limpar todas as condições?')) {
        condicoesMarcadas = [];
        document.querySelectorAll('.condicao-item.ativa').forEach(item => {
            item.classList.remove('ativa');
        });
        atualizarContador();
        atualizarResumo();
        localStorage.removeItem('condicoesFicha');
    }
}