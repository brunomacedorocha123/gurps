// ============================================
// RESUMO-PERICIAS.JS ATUALIZADO
// Sistema para mostrar perícias E técnicas no resumo
// Mostra NH (Número de Habilidade) e Nível corretamente
// ============================================

// ============================================
// 1. CAPTURA AVANÇADA DE PERÍCIAS (COM NH)
// ============================================

function capturarPericiasComNH() {
    try {
        const pericias = [];
        let totalPontos = 0;
        
        console.log('🔍 Capturando perícias para resumo...');
        
        // MÉTODO A: Usar sistema de perícias principal
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            console.log(`📊 ${window.estadoPericias.periciasAprendidas.length} perícias no sistema`);
            
            window.estadoPericias.periciasAprendidas.forEach(p => {
                // Obter atributo base atual
                let atributoBase = 10;
                switch(p.atributo) {
                    case 'DX': atributoBase = obterAtributoAtual('DX'); break;
                    case 'IQ': atributoBase = obterAtributoAtual('IQ'); break;
                    case 'HT': atributoBase = obterAtributoAtual('HT'); break;
                    case 'PERC': atributoBase = obterAtributoAtual('PERC'); break;
                }
                
                // Calcular NH (Atributo + Nível)
                const nh = atributoBase + (p.nivel || 0);
                
                pericias.push({
                    nome: p.nome || 'Perícia',
                    nivel: p.nivel || 0,
                    atributo: p.atributo || 'IQ',
                    pontos: p.investimentoAcumulado || p.custo || 0,
                    especializacao: p.especializacao || null,
                    nh: nh, // Adicionando NH
                    atributoBase: atributoBase
                });
                
                totalPontos += p.investimentoAcumulado || p.custo || 0;
            });
        }
        
        // MÉTODO B: Se não encontrou, tentar extrair da tabela
        if (pericias.length === 0) {
            console.log('⚠️ Usando método de extração da tabela...');
            const listaPericias = document.getElementById('pericias-aprendidas');
            
            if (listaPericias && !listaPericias.innerHTML.includes('nenhuma-pericia-aprendida')) {
                const itens = listaPericias.querySelectorAll('.pericia-aprendida-item, .pericia-item');
                
                itens.forEach(item => {
                    const nomeElem = item.querySelector('.pericia-aprendida-nome, .pericia-nome, h4, strong');
                    
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
                            
                            // Extrair NH se disponível
                            let nh = 0;
                            const nhElem = item.querySelector('.pericia-aprendida-nh');
                            if (nhElem) {
                                const texto = nhElem.textContent.trim();
                                const match = texto.match(/\b(\d+)\b/);
                                if (match) nh = parseInt(match[1]);
                            } else {
                                // Calcular NH aproximado (atributo base + nível)
                                nh = 10 + nivel; // Default
                            }
                            
                            // Determinar atributo
                            let atributo = 'IQ';
                            const textoCompleto = item.textContent || '';
                            if (textoCompleto.includes('DX')) atributo = 'DX';
                            else if (textoCompleto.includes('IQ')) atributo = 'IQ';
                            else if (textoCompleto.includes('HT')) atributo = 'HT';
                            else if (textoCompleto.includes('PERC')) atributo = 'PERC';
                            
                            pericias.push({
                                nome: nome,
                                nivel: nivel,
                                atributo: atributo,
                                pontos: pontos,
                                nh: nh
                            });
                            
                            totalPontos += pontos;
                        }
                    }
                });
            }
        }
        
        console.log(`✅ Capturadas ${pericias.length} perícias, NHs calculados`);
        return { pericias, totalPontos };
        
    } catch (error) {
        console.error('❌ Erro capturar perícias com NH:', error);
        return { pericias: [], totalPontos: 0 };
    }
}

// Função auxiliar para obter atributos
function obterAtributoAtual(atributo) {
    try {
        // Tentar usar função global
        if (window.obterAtributoAtual) {
            return window.obterAtributoAtual(atributo);
        }
        
        // Tentar pegar dos elementos
        const elementos = {
            'DX': document.getElementById('resumoDX') || document.querySelector('[data-atributo="DX"]'),
            'IQ': document.getElementById('resumoIQ') || document.querySelector('[data-atributo="IQ"]'),
            'HT': document.getElementById('resumoHT') || document.querySelector('[data-atributo="HT"]'),
            'PERC': document.getElementById('resumoPercepcao') || document.querySelector('[data-atributo="PERC"]')
        };
        
        const elem = elementos[atributo];
        if (elem) {
            const valor = parseInt(elem.textContent || elem.value || '10');
            return isNaN(valor) ? 10 : valor;
        }
        
        return 10; // Default
    } catch (e) {
        return 10;
    }
}

// ============================================
// 2. CAPTURA DE TÉCNICAS
// ============================================

function capturarTecnicasResumo() {
    try {
        const tecnicas = [];
        let totalPontosTecnicas = 0;
        
        console.log('🔧 Capturando técnicas para resumo...');
        
        // MÉTODO A: Usar sistema de técnicas
        if (window.estadoTecnicas && window.estadoTecnicas.aprendidas) {
            console.log(`🔧 ${window.estadoTecnicas.aprendidas.length} técnicas no sistema`);
            
            window.estadoTecnicas.aprendidas.forEach(t => {
                tecnicas.push({
                    id: t.id,
                    nome: t.nome || 'Técnica',
                    pontos: t.custoTotal || 0,
                    dificuldade: t.dificuldade || 'Difícil'
                });
                
                totalPontosTecnicas += t.custoTotal || 0;
            });
        }
        
        // MÉTODO B: Extrair da lista de técnicas aprendidas
        if (tecnicas.length === 0) {
            const listaTecnicas = document.getElementById('tecnicas-aprendidas');
            
            if (listaTecnicas && !listaTecnicas.innerHTML.includes('Nenhuma técnica')) {
                const itens = listaTecnicas.querySelectorAll('.pericia-item, .tecnica-item');
                
                itens.forEach(item => {
                    const nomeElem = item.querySelector('h3, h4, strong');
                    
                    if (nomeElem) {
                        const nome = nomeElem.textContent.trim();
                        if (nome && !nome.includes('Nenhuma')) {
                            
                            // Extrair pontos
                            let pontos = 0;
                            const pontosElem = item.querySelector('[class*="custo"], [class*="pontos"]');
                            if (pontosElem) {
                                const texto = pontosElem.textContent.trim();
                                const match = texto.match(/(\d+)/);
                                pontos = match ? parseInt(match[1]) : 0;
                            }
                            
                            tecnicas.push({
                                nome: nome,
                                pontos: pontos
                            });
                            
                            totalPontosTecnicas += pontos;
                        }
                    }
                });
            }
        }
        
        console.log(`✅ Capturadas ${tecnicas.length} técnicas`);
        return { tecnicas, totalPontos: totalPontosTecnicas };
        
    } catch (error) {
        console.error('❌ Erro capturar técnicas:', error);
        return { tecnicas: [], totalPontos: 0 };
    }
}

// ============================================
// 3. ATUALIZAR PERÍCIAS NO RESUMO (COM NH)
// ============================================

function atualizarPericiasNoResumo() {
    try {
        console.log('🎓 Atualizando perícias no resumo (com NH)...');
        
        // 1. Capturar dados com NH
        const periciasData = capturarPericiasComNH();
        
        // 2. Atualizar pontos no resumo
        const pontosElemento = document.getElementById('pontosPericias');
        if (pontosElemento) {
            pontosElemento.textContent = periciasData.totalPontos;
        }
        
        // 3. Atualizar tabela no resumo (AGORA COM NH)
        atualizarTabelaPericiasResumoComNH(periciasData.pericias);
        
        console.log(`✅ Atualizadas ${periciasData.pericias.length} perícias com NH`);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar perícias no resumo:', error);
    }
}

// NOVA FUNÇÃO: Atualizar tabela com NH
function atualizarTabelaPericiasResumoComNH(pericias) {
    const tabelaBody = document.getElementById('tabelaPericiasResumo');
    if (!tabelaBody) {
        console.log('⚠️ Tabela de perícias não encontrada no resumo');
        return;
    }
    
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
        if (nomeDisplay.length > 22) {
            nomeDisplay = nomeDisplay.substring(0, 19) + '...';
        }
        
        // Adicionar indicação de especialização se houver
        if (pericia.especializacao) {
            const especAbrev = pericia.especializacao.substring(0, 8);
            nomeDisplay += ` (${especAbrev}${pericia.especializacao.length > 8 ? '...' : ''})`;
        }
        
        // Formatar nível (com sinal + se positivo)
        const nivelDisplay = pericia.nivel >= 0 ? `+${pericia.nivel}` : pericia.nivel;
        
        html += `
            <tr>
                <td title="${pericia.nome}${pericia.especializacao ? ` (${pericia.especializacao})` : ''}">
                    ${nomeDisplay}
                </td>
                <td class="td-nivel" title="Nível: ${nivelDisplay}">
                    ${nivelDisplay}
                </td>
                <td class="td-pontos" title="NH: ${pericia.nh} (${pericia.atributo}${pericia.nivel >= 0 ? '+' : ''}${pericia.nivel})">
                    ${pericia.nh}
                </td>
            </tr>
        `;
    });
    
    tabelaBody.innerHTML = html;
    
    // Atualizar cabeçalho da tabela
    const thead = tabelaBody.closest('table')?.querySelector('thead');
    if (thead) {
        thead.innerHTML = `
            <tr>
                <th>PERÍCIA</th>
                <th class="th-nivel">NÍVEL</th>
                <th class="th-pontos">NH</th>
            </tr>
        `;
    }
}

// ============================================
// 4. ATUALIZAR TÉCNICAS NO RESUMO
// ============================================

function atualizarTecnicasNoResumo() {
    try {
        console.log('🛠️ Atualizando técnicas no resumo...');
        
        // 1. Capturar técnicas
        const tecnicasData = capturarTecnicasResumo();
        
        // 2. Atualizar pontos no resumo
        const pontosElemento = document.getElementById('pontosTecnicas');
        if (pontosElemento) {
            pontosElemento.textContent = tecnicasData.totalPontos;
        }
        
        // 3. Atualizar lista de técnicas no resumo
        atualizarListaTecnicasResumo(tecnicasData.tecnicas);
        
        console.log(`✅ Atualizadas ${tecnicasData.tecnicas.length} técnicas`);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar técnicas no resumo:', error);
    }
}

function atualizarListaTecnicasResumo(tecnicas) {
    const listaContainer = document.getElementById('listaTecnicasResumo');
    if (!listaContainer) {
        console.log('⚠️ Lista de técnicas não encontrada no resumo');
        return;
    }
    
    if (tecnicas.length === 0) {
        listaContainer.innerHTML = '<div class="vazio">Nenhuma técnica</div>';
        return;
    }
    
    // Limitar a 10 itens
    const tecnicasLimitadas = tecnicas.slice(0, 10);
    
    let html = '';
    
    tecnicasLimitadas.forEach((tecnica, index) => {
        // Formatar nome
        let nomeDisplay = tecnica.nome;
        if (nomeDisplay.length > 25) {
            nomeDisplay = nomeDisplay.substring(0, 22) + '...';
        }
        
        // Ícone baseado no tipo
        const icone = tecnica.dificuldade === 'Média' ? '🔸' : '🔹';
        
        html += `
            <div class="tecnica-resumo-item" title="${tecnica.nome} (${tecnica.pontos} pontos)">
                <span class="tecnica-resumo-icone">${icone}</span>
                <span class="tecnica-resumo-nome">${nomeDisplay}</span>
                <span class="tecnica-resumo-pontos">${tecnica.pontos}</span>
            </div>
        `;
    });
    
    listaContainer.innerHTML = html;
}

// ============================================
// 5. ATUALIZAR TUDO NO RESUMO
// ============================================

function atualizarTudoNoResumo() {
    console.log('🔄 Atualizando tudo no resumo...');
    atualizarPericiasNoResumo();
    atualizarTecnicasNoResumo();
}

// ============================================
// 6. MONITORAMENTO COMPLETO
// ============================================

function iniciarMonitoramentoCompleto() {
    // Só inicia uma vez
    if (window.monitorResumoAtivo) return;
    window.monitorResumoAtivo = true;
    
    console.log('👁️ Iniciando monitoramento completo do resumo...');
    
    // Atualizar quando a aba Resumo for aberta
    document.addEventListener('click', function(e) {
        const tabBtn = e.target.closest('.tab-btn');
        if (tabBtn && tabBtn.dataset.tab === 'resumo') {
            setTimeout(atualizarTudoNoResumo, 300);
        }
    });
    
    // Monitorar mudanças nas abas
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            if (tabId === 'pericias' || tabId === 'tecnicas') {
                // Quando o usuário sai de Perícias ou Técnicas, atualizar resumo
                setTimeout(() => {
                    const resumoAba = document.getElementById('resumo');
                    if (resumoAba && resumoAba.classList.contains('active')) {
                        atualizarTudoNoResumo();
                    }
                }, 800);
            }
        });
    });
    
    // Atualizar periodicamente quando na aba Resumo
    setInterval(() => {
        const resumoAba = document.getElementById('resumo');
        if (resumoAba && resumoAba.classList.contains('active')) {
            atualizarTudoNoResumo();
        }
    }, 3000);
    
    // Atualização inicial
    setTimeout(atualizarTudoNoResumo, 2000);
}

// ============================================
// 7. INICIALIZAÇÃO
// ============================================

// Iniciar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Carregado - Iniciando sistema de resumo...');
    
    // Esperar um pouco para tudo carregar
    setTimeout(() => {
        // Verificar se os containers existem
        const tabelaPericiasExiste = document.getElementById('tabelaPericiasResumo');
        const listaTecnicasExiste = document.getElementById('listaTecnicasResumo');
        
        if (tabelaPericiasExiste || listaTecnicasExiste) {
            iniciarMonitoramentoCompleto();
        } else {
            // Tentar novamente depois
            setTimeout(() => {
                if (!window.monitorResumoAtivo) {
                    iniciarMonitoramentoCompleto();
                }
            }, 3000);
        }
    }, 1500);
});

// Backup: Iniciar após load completo
window.addEventListener('load', function() {
    setTimeout(() => {
        if (!window.monitorResumoAtivo) {
            iniciarMonitoramentoCompleto();
        }
    }, 2500);
});

// ============================================
// 8. FUNÇÕES PARA USO EXTERNO
// ============================================

// Função para ser chamada pelo sistema-resumo.js
window.atualizarResumoCompleto = function() {
    atualizarTudoNoResumo();
    return true;
};

// Função específica para perícias
window.atualizarResumoPericias = function() {
    atualizarPericiasNoResumo();
    return true;
};

// Função específica para técnicas
window.atualizarResumoTecnicas = function() {
    atualizarTecnicasNoResumo();
    return true;
};

// Função para verificar status
window.verificarStatusResumo = function() {
    return {
        monitorAtivo: window.monitorResumoAtivo || false,
        tabelaPericias: !!document.getElementById('tabelaPericiasResumo'),
        listaTecnicas: !!document.getElementById('listaTecnicasResumo')
    };
};

console.log('✅ resumo-pericias.js ATUALIZADO - Agora mostra NH e inclui técnicas!');

// ============================================
// 9. CSS ADICIONAL PARA A TABELA COM NH
// ============================================
function adicionarCssResumo() {
    const styleId = 'resumo-estilos-adicionais';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Estilos para a nova tabela com NH */
        #tabelaPericiasResumo tr:hover {
            background: rgba(255, 140, 0, 0.08) !important;
        }
        
        #tabelaPericiasResumo .td-nivel {
            color: #ffd700;
            font-weight: 600;
            text-align: center;
            font-size: 0.85rem;
        }
        
        #tabelaPericiasResumo .td-pontos {
            color: #2ecc71;
            font-weight: 700;
            text-align: center;
            font-size: 0.9rem;
            background: rgba(46, 204, 113, 0.1);
            border-radius: 3px;
        }
        
        /* Estilos para técnicas no resumo */
        .tecnica-resumo-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            margin-bottom: 4px;
            background: rgba(155, 89, 182, 0.1);
            border-radius: 4px;
            border-left: 3px solid #9b59b6;
            font-size: 0.8rem;
        }
        
        .tecnica-resumo-item:hover {
            background: rgba(155, 89, 182, 0.2);
        }
        
        .tecnica-resumo-icone {
            color: #9b59b6;
            font-size: 0.9rem;
        }
        
        .tecnica-resumo-nome {
            flex: 1;
            color: #ddd;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .tecnica-resumo-pontos {
            color: #ffd700;
            font-weight: 600;
            background: rgba(255, 215, 0, 0.1);
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 0.75rem;
        }
        
        /* Tooltip para NH */
        [title]:hover:after {
            content: attr(title);
            padding: 4px 8px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            border-radius: 4px;
            position: absolute;
            z-index: 1000;
            font-size: 0.75rem;
            max-width: 250px;
            white-space: pre-wrap;
        }
    `;
    
    document.head.appendChild(style);
    console.log('🎨 Estilos adicionais para resumo aplicados');
}

// Aplicar CSS quando carregar
setTimeout(adicionarCssResumo, 1000);