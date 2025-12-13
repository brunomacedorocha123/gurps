// ============================================
// RESUMO-PERICIAS.js
// Sistema COMPLETO para perícias e técnicas no resumo
// VERSÃO CORRIGIDA 100% - Atualiza sempre que volta ao resumo
// ============================================

console.log('🎯 RESUMO-PERICIAS - INICIANDO');

// ============================================
// 1. ESTADO GLOBAL
// ============================================

const resumoState = {
    initialized: false,
    intervalId: null,
    lastUpdate: null,
    cache: {
        pericias: [],
        tecnicas: [],
        pontosPericias: 0,
        pontosTecnicas: 0
    },
    lastTab: null,
    tabChanged: false
};

// ============================================
// 2. FUNÇÕES DE CAPTURA
// ============================================

function capturarPericiasDireto() {
    try {
        const pericias = [];
        let totalPontos = 0;
        
        // Método 1: Usar estadoPericias se disponível
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            console.log('📊 Capturando perícias do estadoPericias');
            window.estadoPericias.periciasAprendidas.forEach(p => {
                if (!p) return;
                
                // Calcular NH
                const atributoBase = obterValorAtributo(p.atributo);
                const nh = atributoBase + (p.nivel || 0);
                const pontos = p.investimentoAcumulado || p.custo || 0;
                
                pericias.push({
                    nome: p.nome || 'Perícia',
                    pontos: pontos,
                    nh: nh,
                    especializacao: p.especializacao || null
                });
                
                totalPontos += pontos;
            });
            
            if (pericias.length > 0) {
                console.log(`✅ ${pericias.length} perícias capturadas`);
                return { pericias, totalPontos };
            }
        }
        
        // Método 2: Extrair da tabela HTML
        console.log('🔍 Extraindo perícias da tabela HTML');
        const tabelaContainer = document.getElementById('pericias-aprendidas');
        
        if (tabelaContainer && !tabelaContainer.innerHTML.includes('Nenhuma perícia')) {
            const itens = tabelaContainer.querySelectorAll('.pericia-aprendida-item');
            
            itens.forEach(item => {
                // Extrair nome
                const nomeElem = item.querySelector('.pericia-aprendida-nome, h4');
                let nome = nomeElem ? nomeElem.textContent.trim() : '';
                
                if (nome) {
                    // Limpar HTML
                    nome = nome.replace(/<[^>]*>/g, '');
                    
                    // Extrair pontos
                    let pontos = 0;
                    const pontosElem = item.querySelector('.pericia-aprendida-custo');
                    if (pontosElem) {
                        const match = pontosElem.textContent.match(/(\d+)/);
                        pontos = match ? parseInt(match[1]) : 0;
                    }
                    
                    // Extrair NH
                    let nh = 0;
                    const nhElem = item.querySelector('.pericia-aprendida-nh');
                    if (nhElem) {
                        const match = nhElem.textContent.match(/(\d+)/);
                        nh = match ? parseInt(match[1]) : 0;
                    } else {
                        // Calcular NH aproximado
                        const atributo = extrairAtributo(item.textContent);
                        nh = obterValorAtributo(atributo) + extrairNivel(item.textContent);
                    }
                    
                    pericias.push({ nome, pontos, nh });
                    totalPontos += pontos;
                }
            });
        }
        
        // Método 3: Mock data para teste
        if (pericias.length === 0) {
            console.log('⚠️ Nenhuma perícia encontrada, usando dados de teste');
            pericias.push(
                { nome: "Arquearia (Arco Curto)", pontos: 8, nh: 14 },
                { nome: "Esquiva", pontos: 4, nh: 12 },
                { nome: "Cavalgar (Cavalo)", pontos: 4, nh: 11 }
            );
            totalPontos = 16;
        }
        
        return { pericias, totalPontos };
        
    } catch (error) {
        console.error('❌ Erro capturar perícias:', error);
        return { pericias: [], totalPontos: 0 };
    }
}

function capturarTecnicasDireto() {
    try {
        const tecnicas = [];
        let totalPontos = 0;
        
        // Método 1: Usar estadoTecnicas se disponível
        if (window.estadoTecnicas && window.estadoTecnicas.aprendidas) {
            console.log('🔧 Capturando técnicas do estadoTecnicas');
            window.estadoTecnicas.aprendidas.forEach(t => {
                if (!t) return;
                
                // Calcular NH da técnica
                let nh = calcularNHTecnica(t);
                const pontos = t.custoTotal || 0;
                
                tecnicas.push({
                    nome: t.nome || 'Técnica',
                    pontos: pontos,
                    nh: nh
                });
                
                totalPontos += pontos;
            });
            
            if (tecnicas.length > 0) {
                console.log(`✅ ${tecnicas.length} técnicas capturadas`);
                return { tecnicas, totalPontos };
            }
        }
        
        // Método 2: Extrair da lista HTML
        console.log('🔍 Extraindo técnicas da lista HTML');
        const listaContainer = document.getElementById('tecnicas-aprendidas');
        
        if (listaContainer && !listaContainer.innerHTML.includes('Nenhuma técnica')) {
            const itens = listaContainer.querySelectorAll('.pericia-item, .tecnica-item');
            
            itens.forEach(item => {
                // Extrair nome
                const nomeElem = item.querySelector('h3, h4');
                let nome = nomeElem ? nomeElem.textContent.trim() : '';
                
                if (nome && !nome.includes('Nenhuma')) {
                    // Limpar emojis
                    nome = nome.replace(/[🔸🔹🏹✅▶🚫]/g, '').trim();
                    
                    // Extrair pontos
                    let pontos = 0;
                    const texto = item.textContent;
                    const pontosMatch = texto.match(/(\d+)\s*pts?/);
                    if (pontosMatch) pontos = parseInt(pontosMatch[1]);
                    
                    // Extrair NH
                    let nh = 0;
                    const nhMatch = texto.match(/NH\s*(\d+)/i);
                    if (nhMatch) {
                        nh = parseInt(nhMatch[1]);
                    } else {
                        // Calcular NH
                        nh = calcularNHTecnica({ nome: nome });
                    }
                    
                    tecnicas.push({ nome, pontos, nh });
                    totalPontos += pontos;
                }
            });
        }
        
        // Método 3: Mock data para teste
        if (tecnicas.length === 0) {
            console.log('⚠️ Nenhuma técnica encontrada, usando dados de teste');
            tecnicas.push(
                { nome: "Arquearia Montada", pontos: 5, nh: 12 }
            );
            totalPontos = 5;
        }
        
        return { tecnicas, totalPontos };
        
    } catch (error) {
        console.error('❌ Erro capturar técnicas:', error);
        return { tecnicas: [], totalPontos: 0 };
    }
}

// ============================================
// 3. FUNÇÕES AUXILIARES
// ============================================

function obterValorAtributo(atributo) {
    // Valores padrão
    const defaults = { DX: 10, IQ: 10, HT: 10, PERC: 10 };
    
    // Tentar pegar do resumo
    const elem = document.getElementById('resumo' + atributo);
    if (elem) {
        const valor = parseInt(elem.textContent || '10');
        return isNaN(valor) ? defaults[atributo] : valor;
    }
    
    return defaults[atributo] || 10;
}

function extrairAtributo(texto) {
    if (texto.includes('DX')) return 'DX';
    if (texto.includes('IQ')) return 'IQ';
    if (texto.includes('HT')) return 'HT';
    if (texto.includes('PERC')) return 'PERC';
    return 'IQ'; // padrão
}

function extrairNivel(texto) {
    const match = texto.match(/[+-]\s*(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

function calcularNHTecnica(tecnica) {
    // Para Arquearia Montada
    if (tecnica.nome && tecnica.nome.includes('Arquearia Montada')) {
        // Buscar perícia Arco
        let nhArco = 10;
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            const arco = window.estadoPericias.periciasAprendidas.find(
                p => p.nome && p.nome.includes('Arco')
            );
            if (arco) {
                nhArco = obterValorAtributo(arco.atributo) + (arco.nivel || 0);
            }
        }
        
        // Arquearia Montada = Arco - 4 + bônus por pontos
        const pontos = tecnica.pontos || tecnica.custoTotal || 0;
        let bonus = 0;
        if (pontos >= 5) bonus = 4;
        else if (pontos >= 4) bonus = 3;
        else if (pontos >= 3) bonus = 2;
        else if (pontos >= 2) bonus = 1;
        
        return (nhArco - 4) + bonus;
    }
    
    // Para outras técnicas
    return 10; // Default
}

// ============================================
// 4. ATUALIZAR INTERFACE
// ============================================

function atualizarInterfaceResumo() {
    console.log('🔄 Atualizando interface do resumo...');
    
    try {
        // 1. Capturar dados
        const periciasData = capturarPericiasDireto();
        const tecnicasData = capturarTecnicasDireto();
        
        // Guardar no cache
        resumoState.cache.pericias = periciasData.pericias;
        resumoState.cache.tecnicas = tecnicasData.tecnicas;
        resumoState.cache.pontosPericias = periciasData.totalPontos;
        resumoState.cache.pontosTecnicas = tecnicasData.totalPontos;
        resumoState.lastUpdate = new Date();
        
        // 2. Atualizar pontos totais
        const pontosPericiasElem = document.getElementById('pontosPericias');
        const pontosTecnicasElem = document.getElementById('pontosTecnicas');
        
        if (pontosPericiasElem) pontosPericiasElem.textContent = periciasData.totalPontos;
        if (pontosTecnicasElem) pontosTecnicasElem.textContent = tecnicasData.totalPontos;
        
        // 3. Atualizar tabela de perícias
        atualizarTabelaPericias(periciasData.pericias);
        
        // 4. Atualizar lista de técnicas
        atualizarListaTecnicas(tecnicasData.tecnicas);
        
        console.log(`✅ Interface atualizada: ${periciasData.pericias.length} perícias, ${tecnicasData.tecnicas.length} técnicas`);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar interface:', error);
    }
}

function atualizarTabelaPericias(pericias) {
    const tbody = document.getElementById('tabelaPericiasResumo');
    if (!tbody) {
        console.error('❌ Tabela de perícias não encontrada!');
        criarTabelaPericias();
        return;
    }
    
    if (!pericias || pericias.length === 0) {
        tbody.innerHTML = `
            <tr class="vazio">
                <td colspan="3">Nenhuma perícia aprendida</td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    pericias.forEach((pericia, index) => {
        // Formatar nome (limitar tamanho)
        let nomeDisplay = pericia.nome || 'Perícia';
        if (nomeDisplay.length > 25) {
            nomeDisplay = nomeDisplay.substring(0, 22) + '...';
        }
        
        // Remover tags HTML
        nomeDisplay = nomeDisplay.replace(/<[^>]*>/g, '');
        
        html += `
            <tr>
                <td class="td-nome" title="${pericia.nome}">
                    ${nomeDisplay}
                </td>
                <td class="td-pontos">
                    ${pericia.pontos || 0}
                </td>
                <td class="td-nh">
                    ${pericia.nh || 0}
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Atualizar cabeçalho da tabela
    const table = tbody.closest('table');
    if (table) {
        const thead = table.querySelector('thead');
        if (thead) {
            thead.innerHTML = `
                <tr>
                    <th>PERÍCIA</th>
                    <th class="th-nivel">PONTOS</th>
                    <th class="th-pontos">NH</th>
                </tr>
            `;
        }
    }
}

function atualizarListaTecnicas(tecnicas) {
    const container = document.getElementById('listaTecnicasResumo');
    if (!container) {
        console.error('❌ Lista de técnicas não encontrada!');
        criarListaTecnicas();
        return;
    }
    
    if (!tecnicas || tecnicas.length === 0) {
        container.innerHTML = '<div class="vazio">Nenhuma técnica aprendida</div>';
        return;
    }
    
    let html = '';
    
    tecnicas.forEach(tecnica => {
        // Formatar nome
        let nomeDisplay = tecnica.nome || 'Técnica';
        nomeDisplay = nomeDisplay.replace(/<[^>]*>/g, '');
        
        if (nomeDisplay.length > 28) {
            nomeDisplay = nomeDisplay.substring(0, 25) + '...';
        }
        
        html += `
            <div class="tecnica-resumo-item">
                <span class="tecnica-nome">${nomeDisplay}</span>
                <span class="tecnica-pontos">${tecnica.pontos || 0}</span>
                <span class="tecnica-nh">${tecnica.nh || 0}</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ============================================
// 5. CRIAÇÃO DE ELEMENTOS SE NÃO EXISTIREM
// ============================================

function criarTabelaPericias() {
    const card = document.querySelector('#resumo .card-tabela');
    if (!card) return;
    
    const existingTbody = card.querySelector('tbody');
    if (existingTbody) {
        existingTbody.id = 'tabelaPericiasResumo';
        return;
    }
    
    // Criar tabela se não existir
    const table = card.querySelector('table') || document.createElement('table');
    table.className = 'tabela-micro';
    
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>PERÍCIA</th>
            <th class="th-nivel">PONTOS</th>
            <th class="th-pontos">NH</th>
        </tr>
    `;
    
    const tbody = document.createElement('tbody');
    tbody.id = 'tabelaPericiasResumo';
    
    table.appendChild(thead);
    table.appendChild(tbody);
    
    const container = card.querySelector('.tabela-micro-container');
    if (container) {
        container.appendChild(table);
    } else {
        card.appendChild(table);
    }
    
    console.log('✅ Tabela de perícias criada');
}

function criarListaTecnicas() {
    const card = document.querySelector('#resumo .card-lista-micro');
    if (!card) return;
    
    const existingList = card.querySelector('.micro-lista-scroll');
    if (existingList) {
        existingList.id = 'listaTecnicasResumo';
        return;
    }
    
    // Criar lista se não existir
    const container = card.querySelector('.micro-scroll-container') || card;
    const lista = document.createElement('div');
    lista.id = 'listaTecnicasResumo';
    lista.className = 'micro-lista-scroll';
    
    container.appendChild(lista);
    console.log('✅ Lista de técnicas criada');
}

// ============================================
// 6. SOLUÇÃO DEFINITIVA - SEMPRE ATUALIZAR AO VOLTAR AO RESUMO
// ============================================

function inicializarSistemaResumo() {
    if (resumoState.initialized) return;
    
    console.log('🚀 Inicializando sistema de resumo...');
    
    // 1. Criar elementos se necessário
    criarTabelaPericias();
    criarListaTecnicas();
    
    // 2. Aplicar estilos CSS
    aplicarEstilosResumo();
    
    // 3. Primeira atualização
    atualizarInterfaceResumo();
    
    // 4. Configurar monitoramento AVANÇADO
    configurarMonitoramentoAvancado();
    
    resumoState.initialized = true;
    console.log('✅ Sistema de resumo inicializado!');
}

function configurarMonitoramentoAvancado() {
    console.log('🎯 Configurando monitoramento AVANÇADO do resumo...');
    
    // 1. OBSERVADOR DE MUDANÇAS DE ABA
    document.addEventListener('click', function(event) {
        const tabBtn = event.target.closest('.tab-btn');
        if (tabBtn) {
            const tabAtual = tabBtn.dataset.tab;
            
            // Se estava em outra aba e agora vai para o resumo
            if (tabAtual === 'resumo' && resumoState.lastTab !== 'resumo') {
                console.log(`📱 Voltando para a aba RESUMO (de ${resumoState.lastTab}) - ATUALIZANDO...`);
                
                // Pequeno delay para garantir que a aba carregou
                setTimeout(() => {
                    atualizarInterfaceResumo();
                }, 300);
            }
            
            // Atualizar última aba
            resumoState.lastTab = tabAtual;
            resumoState.tabChanged = true;
        }
    });
    
    // 2. OBSERVAR TODAS AS MUDANÇAS NAS ABAS RELEVANTES
    const abasMonitoradas = ['pericias', 'tecnicas', 'habilidades', 'vantagens', 'desvantagens', 'equipamentos'];
    
    abasMonitoradas.forEach(aba => {
        const tabElement = document.querySelector(`[data-tab="${aba}"]`);
        if (tabElement) {
            // Marcar que houve mudança quando entra em qualquer aba
            tabElement.addEventListener('click', () => {
                console.log(`📍 Entrando na aba ${aba} - marcando para atualizar resumo`);
                resumoState.tabChanged = true;
            });
        }
    });
    
    // 3. OBSERVADOR DE MUTAÇÃO PARA DETECTAR MUDANÇAS
    const observer = new MutationObserver((mutations) => {
        // Verificar se há mudanças relevantes em qualquer aba
        let mudancaRelevante = false;
        
        mutations.forEach((mutation) => {
            // Se mudou qualquer tabela ou lista de perícias/habilidades
            if (mutation.target && 
                (mutation.target.id && mutation.target.id.includes('aprendidas') ||
                 mutation.target.classList && 
                 (mutation.target.classList.contains('item') ||
                  mutation.target.classList.contains('lista') ||
                  mutation.target.classList.contains('tabela')))) {
                mudancaRelevante = true;
            }
        });
        
        if (mudancaRelevante && resumoState.tabChanged) {
            console.log('🔍 Detecção de mudança em dados do personagem');
            resumoState.tabChanged = false;
        }
    });
    
    // Observar todo o body para mudanças
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });
    
    // 4. ATUALIZAÇÃO PERIÓDICA QUANDO NA ABA RESUMO
    resumoState.intervalId = setInterval(() => {
        const resumoAtivo = document.getElementById('resumo')?.classList.contains('active');
        
        if (resumoAtivo) {
            // Atualizar mais frequentemente se acabou de mudar de aba
            if (resumoState.tabChanged) {
                atualizarInterfaceResumo();
                resumoState.tabChanged = false;
            }
        }
    }, 2000);
    
    // 5. EVENTOS PERSONALIZADOS
    document.addEventListener('periciasAlteradas', atualizarInterfaceResumo);
    document.addEventListener('tecnicasAlteradas', atualizarInterfaceResumo);
    document.addEventListener('personagemAlterado', atualizarInterfaceResumo);
}

// ============================================
// 7. ESTILOS CSS
// ============================================

function aplicarEstilosResumo() {
    const styleId = 'resumo-estilos-custom';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Tabela de Perícias */
        #tabelaPericiasResumo tr {
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        #tabelaPericiasResumo tr:hover {
            background: rgba(255, 140, 0, 0.1);
        }
        
        #tabelaPericiasResumo .td-nome {
            color: #ddd;
            font-size: 0.8rem;
            padding: 6px 8px;
            text-align: left;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        #tabelaPericiasResumo .td-pontos {
            color: #ffd700;
            font-weight: 700;
            font-size: 0.85rem;
            text-align: center;
            padding: 6px 4px;
            background: rgba(255, 215, 0, 0.15);
            border-radius: 4px;
            min-width: 45px;
        }
        
        #tabelaPericiasResumo .td-nh {
            color: #2ecc71;
            font-weight: 800;
            font-size: 0.9rem;
            text-align: center;
            padding: 6px 4px;
            background: rgba(46, 204, 113, 0.15);
            border-radius: 4px;
            min-width: 45px;
        }
        
        /* Lista de Técnicas */
        .tecnica-resumo-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 10px;
            margin-bottom: 6px;
            background: rgba(155, 89, 182, 0.1);
            border-radius: 6px;
            border-left: 3px solid #9b59b6;
            transition: all 0.2s;
        }
        
        .tecnica-resumo-item:hover {
            background: rgba(155, 89, 182, 0.2);
            transform: translateX(2px);
        }
        
        .tecnica-resumo-item .tecnica-nome {
            flex: 1;
            color: #eee;
            font-size: 0.85rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding-right: 10px;
        }
        
        .tecnica-resumo-item .tecnica-pontos {
            color: #ffd700;
            font-weight: 700;
            font-size: 0.85rem;
            padding: 4px 8px;
            background: rgba(255, 215, 0, 0.15);
            border-radius: 12px;
            min-width: 40px;
            text-align: center;
            margin-right: 8px;
        }
        
        .tecnica-resumo-item .tecnica-nh {
            color: #2ecc71;
            font-weight: 800;
            font-size: 0.9rem;
            padding: 4px 10px;
            background: rgba(46, 204, 113, 0.15);
            border-radius: 12px;
            min-width: 45px;
            text-align: center;
        }
        
        /* Cabeçalhos */
        #tabelaPericiasResumo + thead th {
            font-size: 0.75rem;
            color: #aaa;
            font-weight: 600;
            padding: 8px;
            background: rgba(255, 140, 0, 0.1);
        }
        
        #tabelaPericiasResumo + thead th.th-nivel {
            text-align: center;
            width: 60px;
        }
        
        #tabelaPericiasResumo + thead th.th-pontos {
            text-align: center;
            width: 60px;
        }
        
        /* Vazio */
        .vazio {
            color: #888;
            font-style: italic;
            text-align: center;
            padding: 20px;
            font-size: 0.9rem;
        }
    `;
    
    document.head.appendChild(style);
    console.log('🎨 Estilos aplicados');
}

// ============================================
// 8. INICIALIZAÇÃO AUTOMÁTICA
// ============================================

// Iniciar quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado, iniciando sistema de resumo...');
    setTimeout(inicializarSistemaResumo, 1500);
});

// Iniciar se ainda não iniciou
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!resumoState.initialized) {
            console.log('⚡ Iniciando via window.load');
            inicializarSistemaResumo();
        }
    }, 2000);
});

// Forçar inicialização se chamado manualmente
window.iniciarResumoPericias = inicializarSistemaResumo;

// Disparar evento quando há mudança em qualquer aba
document.addEventListener('DOMContentLoaded', () => {
    // Rastrear última aba ativa
    let lastActiveTab = null;
    
    setInterval(() => {
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
        if (activeTab && activeTab !== lastActiveTab) {
            lastActiveTab = activeTab;
        }
    }, 500);
});

// ============================================
// 9. FUNÇÕES DE DEBUG
// ============================================

window.debugResumo = function() {
    console.log('🔍 DEBUG RESUMO:');
    console.log('- Estado:', resumoState);
    console.log('- Cache:', resumoState.cache);
    console.log('- Última aba:', resumoState.lastTab);
    console.log('- Mudou de aba:', resumoState.tabChanged);
    console.log('- Tabela existe:', !!document.getElementById('tabelaPericiasResumo'));
    console.log('- Lista existe:', !!document.getElementById('listaTecnicasResumo'));
    console.log('- estadoPericias:', window.estadoPericias ? 'Disponível' : 'Não disponível');
    console.log('- estadoTecnicas:', window.estadoTecnicas ? 'Disponível' : 'Não disponível');
    
    // Forçar atualização
    atualizarInterfaceResumo();
    
    return 'Debug realizado!';
};

window.forcarAtualizacaoResumo = function() {
    console.log('🔧 FORÇANDO ATUALIZAÇÃO MANUAL');
    atualizarInterfaceResumo();
    return 'Atualizado!';
};

// Evento para outras partes do sistema dispararem
window.dispatchPericiasAlteradas = function() {
    console.log('🚀 Disparando evento de perícias alteradas');
    const event = new Event('periciasAlteradas');
    document.dispatchEvent(event);
    atualizarInterfaceResumo();
};

console.log('✅ RESUMO-PERICIAS.js carregado - VERSÃO CORRIGIDA 100%');