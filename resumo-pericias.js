// ============================================
// RESUMO-PERICIAS.JS
// Sistema SIMPLES para mostrar perícias no resumo
// Não interfere em nada mais - Só faz sua parte
// ============================================

// ============================================
// 1. CAPTURA SIMPLES DE PERÍCIAS
// ============================================

function capturarPericiasResumo() {
    try {
        const pericias = [];
        let totalPontos = 0;
        
        // MÉTODO A: Usar sistema de perícias se disponível
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            window.estadoPericias.periciasAprendidas.forEach(p => {
                pericias.push({
                    nome: p.nome || 'Perícia',
                    nivel: p.nivel || 0,
                    atributo: p.atributo || 'IQ',
                    pontos: p.investimentoAcumulado || p.custo || 0,
                    especializacao: p.especializacao || null
                });
                totalPontos += p.investimentoAcumulado || p.custo || 0;
            });
        }
        
        // MÉTODO B: Tentar pegar da lista HTML
        if (pericias.length === 0) {
            const listaPericias = document.getElementById('pericias-aprendidas');
            if (listaPericias && !listaPericias.innerHTML.includes('nenhuma-pericia-aprendida')) {
                const itens = listaPericias.querySelectorAll('.pericia-aprendida-item, [class*="pericia"]');
                
                itens.forEach(item => {
                    const nomeElem = item.querySelector('.pericia-aprendida-nome, h4, strong');
                    
                    if (nomeElem) {
                        const nome = nomeElem.textContent.trim();
                        if (nome && !nome.includes('Nenhuma') && !nome.includes('Carregando')) {
                            
                            // Extrair pontos
                            let pontos = 0;
                            const pontosElem = item.querySelector('.pericia-aprendida-custo, .custo');
                            if (pontosElem) {
                                const texto = pontosElem.textContent.trim();
                                const match = texto.match(/(\d+)/);
                                pontos = match ? parseInt(match[1]) : 0;
                            }
                            
                            // Extrair nível
                            let nivel = 0;
                            const nivelElem = item.querySelector('.pericia-aprendida-nivel');
                            if (nivelElem) {
                                const texto = nivelElem.textContent.trim();
                                const match = texto.match(/(-?\d+)/);
                                nivel = match ? parseInt(match[1]) : 0;
                            }
                            
                            // Determinar atributo (simples)
                            let atributo = 'IQ'; // padrão
                            const textoCompleto = item.textContent || '';
                            if (textoCompleto.includes('DX')) atributo = 'DX';
                            else if (textoCompleto.includes('IQ')) atributo = 'IQ';
                            else if (textoCompleto.includes('HT')) atributo = 'HT';
                            else if (textoCompleto.includes('PERC')) atributo = 'PERC';
                            
                            pericias.push({
                                nome: nome,
                                nivel: nivel,
                                atributo: atributo,
                                pontos: pontos
                            });
                            totalPontos += pontos;
                        }
                    }
                });
            }
        }
        
        return { pericias, totalPontos };
        
    } catch (error) {
        console.error('Erro capturar perícias:', error);
        return { pericias: [], totalPontos: 0 };
    }
}

// ============================================
// 2. ATUALIZAR PERÍCIAS NO RESUMO
// ============================================

function atualizarPericiasNoResumo() {
    try {
        console.log('🎓 Atualizando perícias no resumo...');
        
        // 1. Capturar dados
        const periciasData = capturarPericiasResumo();
        
        // 2. Atualizar pontos no resumo
        const pontosElemento = document.getElementById('pontosPericias');
        if (pontosElemento) {
            pontosElemento.textContent = periciasData.totalPontos;
        }
        
        // 3. Atualizar tabela no resumo
        atualizarTabelaPericiasResumo(periciasData.pericias);
        
        console.log(`✅ Atualizadas ${periciasData.pericias.length} perícias (${periciasData.totalPontos} pontos)`);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar perícias no resumo:', error);
    }
}

function atualizarTabelaPericiasResumo(pericias) {
    const tabelaBody = document.getElementById('tabelaPericiasResumo');
    if (!tabelaBody) return;
    
    // Limitar a 20 itens para a tabela
    const periciasLimitadas = pericias.slice(0, 20);
    
    if (periciasLimitadas.length === 0) {
        tabelaBody.innerHTML = `
            <tr class="vazio">
                <td colspan="3">Nenhuma perícia</td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    periciasLimitadas.forEach(pericia => {
        // Formatar nome (limitar tamanho)
        let nomeDisplay = pericia.nome;
        if (nomeDisplay.length > 25) {
            nomeDisplay = nomeDisplay.substring(0, 22) + '...';
        }
        
        // Adicionar indicação de especialização se houver
        if (pericia.especializacao) {
            nomeDisplay += ` (${pericia.especializacao.substring(0, 10)}${pericia.especializacao.length > 10 ? '...' : ''})`;
        }
        
        html += `
            <tr>
                <td title="${pericia.nome}">${nomeDisplay}</td>
                <td class="td-nivel">${pericia.nivel >= 0 ? '+' : ''}${pericia.nivel}</td>
                <td class="td-pontos">${pericia.pontos}</td>
            </tr>
        `;
    });
    
    tabelaBody.innerHTML = html;
}

// ============================================
// 3. MONITORAMENTO SIMPLES
// ============================================

function iniciarMonitoramentoPericias() {
    // Só inicia uma vez
    if (window.monitorPericiasAtivo) return;
    window.monitorPericiasAtivo = true;
    
    console.log('👁️ Iniciando monitoramento de perícias...');
    
    // Atualizar quando a aba Resumo for aberta
    document.addEventListener('click', function(e) {
        const tabBtn = e.target.closest('.tab-btn');
        if (tabBtn && tabBtn.dataset.tab === 'resumo') {
            setTimeout(atualizarPericiasNoResumo, 300);
        }
    });
    
    // Monitorar mudanças na aba Perícias
    const tabPericias = document.querySelector('[data-tab="pericias"]');
    if (tabPericias) {
        tabPericias.addEventListener('click', () => {
            // Quando o usuário sai da aba Perícias, atualizar resumo
            setTimeout(() => {
                const resumoAba = document.getElementById('resumo');
                if (resumoAba && resumoAba.classList.contains('active')) {
                    atualizarPericiasNoResumo();
                }
            }, 1000);
        });
    }
    
    // Atualizar periodicamente quando na aba Resumo
    setInterval(() => {
        const resumoAba = document.getElementById('resumo');
        if (resumoAba && resumoAba.classList.contains('active')) {
            atualizarPericiasNoResumo();
        }
    }, 5000);
    
    // Atualização inicial
    setTimeout(atualizarPericiasNoResumo, 1500);
}

// ============================================
// 4. INICIALIZAÇÃO
// ============================================

// Iniciar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Carregado - Aguardando para iniciar monitoramento de perícias...');
    
    // Esperar um pouco para tudo carregar
    setTimeout(() => {
        // Verificar se a tabela existe
        const tabelaExiste = document.getElementById('tabelaPericiasResumo');
        
        if (tabelaExiste) {
            iniciarMonitoramentoPericias();
        } else {
            // Se não existir, tentar novamente depois
            setTimeout(iniciarMonitoramentoPericias, 2000);
        }
    }, 1500);
});

// Backup: Iniciar após load completo
window.addEventListener('load', function() {
    setTimeout(() => {
        if (!window.monitorPericiasAtivo) {
            iniciarMonitoramentoPericias();
        }
    }, 2000);
});

// ============================================
// 5. FUNÇÕES PARA USO EXTERNO
// ============================================

// Função para ser chamada pelo sistema-resumo.js
window.atualizarResumoPericias = function() {
    atualizarPericiasNoResumo();
    return true;
};

// Função para verificar status
window.verificarStatusPericiasResumo = function() {
    return {
        monitorAtivo: window.monitorPericiasAtivo || false,
        tabelaExiste: !!document.getElementById('tabelaPericiasResumo')
    };
};

console.log('✅ resumo-pericias.js carregado - Pronto para usar');