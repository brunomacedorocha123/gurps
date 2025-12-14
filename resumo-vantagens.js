// ============================================
// RESUMO-VANTAGENS.JS
// Sistema SIMPLES para mostrar vantagens, desvantagens e peculiaridades no resumo
// Não interfere em nada mais - Só faz sua parte
// ============================================

// ============================================
// 1. CAPTURA SIMPLES DE VANTAGENS
// ============================================

function capturarVantagensResumo() {
    try {
        const vantagens = [];
        let totalPontos = 0;
        
        if (window.sistemaVantagens && window.sistemaVantagens.vantagensAdquiridas) {
            window.sistemaVantagens.vantagensAdquiridas.forEach(v => {
                vantagens.push({
                    nome: v.nome || v.nomeBase || 'Vantagem',
                    pontos: v.custo || 0,
                    descricao: v.descricao || ''
                });
                totalPontos += v.custo || 0;
            });
        }
        
        if (vantagens.length === 0) {
            const lista = document.getElementById('vantagens-adquiridas');
            if (lista && !lista.innerHTML.includes('lista-vazia')) {
                const itens = lista.querySelectorAll('.item-lista, .item-adquirido, [class*="item"]');
                itens.forEach(item => {
                    const nomeElem = item.querySelector('.item-nome, h4, strong');
                    const pontosElem = item.querySelector('.item-custo, .custo');
                    
                    if (nomeElem) {
                        const nome = nomeElem.textContent.trim();
                        if (nome && !nome.includes('Nenhuma')) {
                            let pontos = 0;
                            if (pontosElem) {
                                const texto = pontosElem.textContent.trim();
                                const match = texto.match(/(\d+)/);
                                pontos = match ? parseInt(match[1]) : 0;
                            }
                            
                            vantagens.push({
                                nome: nome,
                                pontos: pontos,
                                descricao: ''
                            });
                            totalPontos += pontos;
                        }
                    }
                });
            }
        }
        
        return { vantagens, totalPontos };
        
    } catch (error) {
        return { vantagens: [], totalPontos: 0 };
    }
}

// ============================================
// 2. CAPTURA SIMPLES DE DESVANTAGENS
// ============================================

function capturarDesvantagensResumo() {
    try {
        const desvantagens = [];
        let totalPontos = 0;
        
        if (window.sistemaDesvantagens && window.sistemaDesvantagens.desvantagensAdquiridas) {
            window.sistemaDesvantagens.desvantagensAdquiridas.forEach(d => {
                desvantagens.push({
                    nome: d.nome || 'Desvantagem',
                    pontos: d.custo || 0,
                    descricao: d.descricao || ''
                });
                totalPontos += d.custo || 0;
            });
        }
        
        if (desvantagens.length === 0) {
            const lista = document.getElementById('desvantagens-adquiridas');
            if (lista && !lista.innerHTML.includes('lista-vazia')) {
                const itens = lista.querySelectorAll('.item-lista, [class*="item"]');
                itens.forEach(item => {
                    const nomeElem = item.querySelector('.item-nome, h4, strong');
                    const pontosElem = item.querySelector('.item-custo, .custo');
                    
                    if (nomeElem) {
                        const nome = nomeElem.textContent.trim();
                        if (nome && !nome.includes('Nenhuma')) {
                            let pontos = 0;
                            if (pontosElem) {
                                const texto = pontosElem.textContent.trim();
                                const match = texto.match(/(-?\d+)/);
                                pontos = match ? parseInt(match[1]) : 0;
                            }
                            
                            desvantagens.push({
                                nome: nome,
                                pontos: pontos,
                                descricao: ''
                            });
                            totalPontos += pontos;
                        }
                    }
                });
            }
        }
        
        return { desvantagens, totalPontos: Math.abs(totalPontos) };
        
    } catch (error) {
        return { desvantagens: [], totalPontos: 0 };
    }
}

// ============================================
// 3. CAPTURA SIMPLES DE PECULIARIDADES
// ============================================

function capturarPeculiaridadesResumo() {
    try {
        const peculiaridades = [];
        let totalPontos = 0;
        
        if (window.sistemaVantagens && window.sistemaVantagens.peculiaridades) {
            window.sistemaVantagens.peculiaridades.forEach(p => {
                peculiaridades.push({
                    texto: p.texto || 'Peculiaridade',
                    pontos: -1
                });
                totalPontos -= 1;
            });
        }
        
        if (peculiaridades.length === 0) {
            const lista = document.getElementById('lista-peculiaridades');
            if (lista && !lista.innerHTML.includes('lista-vazia')) {
                const itens = lista.querySelectorAll('.peculiaridade-item, [class*="peculiaridade"]');
                itens.forEach(item => {
                    const textoElem = item.querySelector('.peculiaridade-texto, .texto');
                    if (textoElem) {
                        const texto = textoElem.textContent.trim();
                        if (texto && !texto.includes('Nenhuma')) {
                            peculiaridades.push({
                                texto: texto,
                                pontos: -1
                            });
                            totalPontos -= 1;
                        }
                    }
                });
            }
        }
        
        return { peculiaridades, totalPontos: Math.abs(totalPontos) };
        
    } catch (error) {
        return { peculiaridades: [], totalPontos: 0 };
    }
}

// ============================================
// 4. ATUALIZAR O RESUMO
// ============================================

function atualizarVantagensNoResumo() {
    try {
        const vantagensData = capturarVantagensResumo();
        const desvantagensData = capturarDesvantagensResumo();
        const peculiaridadesData = capturarPeculiaridadesResumo();
        
        const pontosVantagens = document.getElementById('pontosVantagens');
        const pontosDesvantagens = document.getElementById('pontosDesvantagens');
        const pontosPeculiaridades = document.getElementById('pontosPeculiaridades');
        
        if (pontosVantagens) {
            pontosVantagens.textContent = `+${vantagensData.totalPontos}`;
            pontosVantagens.className = 'card-pontos positivo';
        }
        
        if (pontosDesvantagens) {
            pontosDesvantagens.textContent = `-${desvantagensData.totalPontos}`;
            pontosDesvantagens.className = 'card-pontos negativo';
        }
        
        if (pontosPeculiaridades) {
            pontosPeculiaridades.textContent = `-${peculiaridadesData.totalPontos}`;
            pontosPeculiaridades.className = 'card-pontos negativo';
        }
        
        atualizarListaResumo('listaVantagensResumo', vantagensData.vantagens, 'vantagem');
        atualizarListaResumo('listaDesvantagensResumo', desvantagensData.desvantagens, 'desvantagem');
        atualizarListaResumo('listaPeculiaridadesResumo', peculiaridadesData.peculiaridades, 'peculiaridade');
        
    } catch (error) {
        // Silencioso
    }
}

function atualizarListaResumo(containerId, itens, tipo) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (itens.length === 0) {
        container.innerHTML = '<div class="vazio">Nenhum ' + 
            (tipo === 'vantagem' ? 'vantagem' : 
             tipo === 'desvantagem' ? 'desvantagem' : 'peculiaridade') + 
            '</div>';
        return;
    }
    
    const itensLimitados = itens.slice(0, 10);
    let html = '';
    
    itensLimitados.forEach(item => {
        const nome = item.nome || item.texto || 'Item';
        const pontos = item.pontos || 0;
        const pontosTexto = pontos >= 0 ? `+${pontos}` : `${pontos}`;
        const classe = pontos >= 0 ? 'positivo' : 'negativo';
        
        html += `
            <div class="resumo-item-${tipo}">
                <div class="${tipo}-info">
                    <div class="${tipo}-nome">${nome}</div>
                    <div class="${tipo}-custo ${classe}">${pontosTexto}</div>
                </div>
            </div>
        `;
    });
    
    if (itens.length > 10) {
        html += `<div class="mais-itens">+${itens.length - 10} mais...</div>`;
    }
    
    container.innerHTML = html;
}

// ============================================
// 5. MONITORAMENTO SIMPLES
// ============================================

function iniciarMonitoramentoVantagens() {
    if (window.monitorVantagensAtivo) return;
    window.monitorVantagensAtivo = true;
    
    document.addEventListener('click', function(e) {
        const tabBtn = e.target.closest('.tab-btn');
        if (tabBtn && tabBtn.dataset.tab === 'resumo') {
            setTimeout(atualizarVantagensNoResumo, 300);
        }
    });
    
    setInterval(() => {
        const resumoAba = document.getElementById('resumo');
        if (resumoAba && resumoAba.classList.contains('active')) {
            atualizarVantagensNoResumo();
        }
    }, 5000);
    
    setTimeout(atualizarVantagensNoResumo, 1000);
}

// ============================================
// 6. INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const temContainers = 
            document.getElementById('listaVantagensResumo') &&
            document.getElementById('listaDesvantagensResumo') &&
            document.getElementById('listaPeculiaridadesResumo');
        
        if (temContainers) {
            iniciarMonitoramentoVantagens();
        } else {
            setTimeout(iniciarMonitoramentoVantagens, 2000);
        }
    }, 1500);
});

window.addEventListener('load', function() {
    setTimeout(() => {
        if (!window.monitorVantagensAtivo) {
            iniciarMonitoramentoVantagens();
        }
    }, 2000);
});

// ============================================
// 7. FUNÇÃO PARA USO EXTERNO
// ============================================

window.atualizarResumoVantagens = function() {
    atualizarVantagensNoResumo();
    return true;
};

window.verificarStatusVantagensResumo = function() {
    return {
        monitorAtivo: window.monitorVantagensAtivo || false,
        containers: {
            vantagens: !!document.getElementById('listaVantagensResumo'),
            desvantagens: !!document.getElementById('listaDesvantagensResumo'),
            peculiaridades: !!document.getElementById('listaPeculiaridadesResumo')
        }
    };
};