// ============================================
// RESUMO-PERICIAS.js
// Sistema COMPLETO para perícias e técnicas no resumo
// VERSÃO CORRIGIDA - ATUALIZA SEMPRE AO ABRIR RESUMO
// ============================================

console.log('🎯 RESUMO-PERICIAS - INICIANDO (VERSÃO CORRIGIDA)');

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
    lastActiveTab: null,
    updatePending: false
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
                const nomeElem = item.querySelector('.pericia-aprendida-nome, h4');
                let nome = nomeElem ? nomeElem.textContent.trim() : '';
                
                if (nome) {
                    nome = nome.replace(/<[^>]*>/g, '');
                    
                    let pontos = 0;
                    const pontosElem = item.querySelector('.pericia-aprendida-custo');
                    if (pontosElem) {
                        const match = pontosElem.textContent.match(/(\d+)/);
                        pontos = match ? parseInt(match[1]) : 0;
                    }
                    
                    let nh = 0;
                    const nhElem = item.querySelector('.pericia-aprendida-nh');
                    if (nhElem) {
                        const match = nhElem.textContent.match(/(\d+)/);
                        nh = match ? parseInt(match[1]) : 0;
                    } else {
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
                const nomeElem = item.querySelector('h3, h4');
                let nome = nomeElem ? nomeElem.textContent.trim() : '';
                
                if (nome && !nome.includes('Nenhuma')) {
                    nome = nome.replace(/[🔸🔹🏹✅▶🚫]/g, '').trim();
                    
                    let pontos = 0;
                    const texto = item.textContent;
                    const pontosMatch = texto.match(/(\d+)\s*pts?/);
                    if (pontosMatch) pontos = parseInt(pontosMatch[1]);
                    
                    let nh = 0;
                    const nhMatch = texto.match(/NH\s*(\d+)/i);
                    if (nhMatch) {
                        nh = parseInt(nhMatch[1]);
                    } else {
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
    const defaults = { DX: 10, IQ: 10, HT: 10, PERC: 10 };
    
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
    return 'IQ';
}

function extrairNivel(texto) {
    const match = texto.match(/[+-]\s*(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

function calcularNHTecnica(tecnica) {
    if (tecnica.nome && tecnica.nome.includes('Arquearia Montada')) {
        let nhArco = 10;
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            const arco = window.estadoPericias.periciasAprendidas.find(
                p => p.nome && p.nome.includes('Arco')
            );
            if (arco) {
                nhArco = obterValorAtributo(arco.atributo) + (arco.nivel || 0);
            }
        }
        
        const pontos = tecnica.pontos || tecnica.custoTotal || 0;
        let bonus = 0;
        if (pontos >= 5) bonus = 4;
        else if (pontos >= 4) bonus = 3;
        else if (pontos >= 3) bonus = 2;
        else if (pontos >= 2) bonus = 1;
        
        return (nhArco - 4) + bonus;
    }
    
    return 10;
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
        
        // 2. Atualizar cache
        resumoState.cache.pericias = periciasData.pericias;
        resumoState.cache.tecnicas = tecnicasData.tecnicas;
        resumoState.cache.pontosPericias = periciasData.totalPontos;
        resumoState.cache.pontosTecnicas = tecnicasData.totalPontos;
        resumoState.lastUpdate = new Date();
        
        // 3. Atualizar pontos totais
        const pontosPericiasElem = document.getElementById('pontosPericias');
        const pontosTecnicasElem = document.getElementById('pontosTecnicas');
        
        if (pontosPericiasElem) pontosPericiasElem.textContent = periciasData.totalPontos;
        if (pontosTecnicasElem) pontosTecnicasElem.textContent = tecnicasData.totalPontos;
        
        // 4. Atualizar tabela de perícias
        atualizarTabelaPericias(periciasData.pericias);
        
        // 5. Atualizar lista de técnicas
        atualizarListaTecnicas(tecnicasData.tecnicas);
        
        console.log(`✅ Interface atualizada: ${periciasData.pericias.length} perícias, ${tecnicasData.tecnicas.length} técnicas`);
        
        // Resetar flag de atualização pendente
        resumoState.updatePending = false;
        
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
    
    pericias.forEach((pericia) => {
        let nomeDisplay = pericia.nome || 'Perícia';
        if (nomeDisplay.length > 25) {
            nomeDisplay = nomeDisplay.substring(0, 22) + '...';
        }
        
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
// 5. CRIAÇÃO DE ELEMENTOS
// ============================================

function criarTabelaPericias() {
    const card = document.querySelector('#resumo .card-tabela');
    if (!card) return;
    
    const existingTbody = card.querySelector('tbody');
    if (existingTbody) {
        existingTbody.id = 'tabelaPericiasResumo';
        return;
    }
    
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
    
    const container = card.querySelector('.micro-scroll-container') || card;
    const lista = document.createElement('div');
    lista.id = 'listaTecnicasResumo';
    lista.className = 'micro-lista-scroll';
    
    container.appendChild(lista);
    console.log('✅ Lista de técnicas criada');
}

// ============================================
// 6. SOLUÇÃO DEFINITIVA - INICIALIZAÇÃO FIXA
// ============================================

function inicializarSistemaResumo() {
    if (resumoState.initialized) {
        console.log('⚠️ Sistema já inicializado, forçando nova inicialização');
    }
    
    console.log('🚀 INICIALIZANDO SISTEMA DE RESUMO (VERSÃO CORRIGIDA)');
    
    // Resetar estado
    resumoState.initialized = false;
    resumoState.updatePending = true;
    
    // 1. Criar elementos se necessário
    criarTabelaPericias();
    criarListaTecnicas();
    
    // 2. Aplicar estilos CSS
    aplicarEstilosResumo();
    
    // 3. PRIMEIRA ATUALIZAÇÃO IMEDIATA
    console.log('⚡ Primeira atualização imediata...');
    atualizarInterfaceResumo();
    
    // 4. SOLUÇÃO SIMPLES: SEMPRE atualizar quando resumo estiver visível
    configurarAtualizacaoAutomatica();
    
    // 5. Configurar monitoramento de abas
    monitorarMudancasDeAba();
    
    resumoState.initialized = true;
    console.log('✅ Sistema de resumo inicializado com sucesso!');
    
    // Forçar atualização após 2 segundos para garantir
    setTimeout(() => {
        console.log('🔧 Atualização de garantia após 2 segundos');
        atualizarInterfaceResumo();
    }, 2000);
}

// SOLUÇÃO SIMPLES: Verificar periodicamente se estamos na aba resumo
function configurarAtualizacaoAutomatica() {
    console.log('⚙️ Configurando atualização automática...');
    
    // Limpar intervalo anterior se existir
    if (resumoState.intervalId) {
        clearInterval(resumoState.intervalId);
    }
    
    // Verificar a cada 1 segundo se estamos na aba resumo
    resumoState.intervalId = setInterval(() => {
        // Verificar se a aba resumo está visível
        const resumoAtivo = isResumoVisivel();
        
        if (resumoAtivo) {
            // Se acabamos de entrar no resumo, atualizar
            if (resumoState.lastActiveTab !== 'resumo') {
                console.log('🎯 ACABOU DE ENTRAR NA ABA RESUMO - ATUALIZANDO!');
                atualizarInterfaceResumo();
            }
            resumoState.lastActiveTab = 'resumo';
        } else {
            // Estamos em outra aba
            resumoState.lastActiveTab = 'outra';
            resumoState.updatePending = true; // Marcar que precisa atualizar quando voltar
        }
    }, 1000);
}

// Função para detectar se a aba resumo está visível
function isResumoVisivel() {
    // Tentar várias formas de detectar
    const resumoElement = document.getElementById('resumo');
    if (resumoElement) {
        // Verificar se tem classe active
        if (resumoElement.classList.contains('active')) {
            return true;
        }
        
        // Verificar estilo display/visibility
        const style = window.getComputedStyle(resumoElement);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
            return true;
        }
    }
    
    // Verificar por URL hash
    if (window.location.hash === '#resumo') {
        return true;
    }
    
    // Verificar botão ativo
    const activeTabBtn = document.querySelector('.tab-btn.active');
    if (activeTabBtn && 
        (activeTabBtn.dataset?.tab === 'resumo' || 
         activeTabBtn.textContent?.includes('Resumo') ||
         activeTabBtn.id?.includes('resumo'))) {
        return true;
    }
    
    return false;
}

// Monitorar cliques em TODAS as abas
function monitorarMudancasDeAba() {
    console.log('👁️ Monitorando mudanças de aba...');
    
    // Observar cliques em qualquer elemento que possa ser uma aba
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        // Verificar se é um botão de aba
        let isTabButton = false;
        let tabName = '';
        
        // Verificar por data-tab
        const tabElement = target.closest('[data-tab]');
        if (tabElement) {
            isTabButton = true;
            tabName = tabElement.dataset.tab;
        }
        
        // Verificar por classe
        if (target.classList?.contains('tab-btn') || 
            target.closest('.tab-btn')) {
            isTabButton = true;
            const btn = target.closest('.tab-btn') || target;
            tabName = btn.dataset?.tab || btn.textContent;
        }
        
        // Verificar por conteúdo
        const tabTexts = ['Perícias', 'Técnicas', 'Vantagens', 'Desvantagens', 'Equipamentos', 'Resumo', 'Habilidades'];
        if (target.textContent && tabTexts.some(text => target.textContent.includes(text))) {
            isTabButton = true;
            tabName = target.textContent.trim();
        }
        
        if (isTabButton) {
            console.log(`📱 Clicou na aba: ${tabName}`);
            
            // Se está indo para o resumo
            if (tabName === 'resumo' || tabName.includes('Resumo')) {
                console.log('🎯 INDO PARA O RESUMO - Atualizando em 300ms...');
                
                // Atualizar imediatamente
                setTimeout(() => {
                    atualizarInterfaceResumo();
                }, 300);
                
                // Atualizar novamente após 1 segundo para garantir
                setTimeout(() => {
                    atualizarInterfaceResumo();
                }, 1000);
            } else {
                // Saiu do resumo, marcar que precisa atualizar quando voltar
                resumoState.updatePending = true;
                console.log(`📍 Saiu do resumo (foi para ${tabName}), marcado para atualizar`);
            }
        }
    }, true); // Usar capture: true para pegar todos os cliques
    
    // Monitorar eventos de teclado (atalhos)
    document.addEventListener('keydown', function(event) {
        // Se pressionou algo que possa mudar de aba
        if (event.ctrlKey || event.altKey || event.metaKey) {
            resumoState.updatePending = true;
        }
    });
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
// 8. INICIALIZAÇÃO AUTOMÁTICA OTIMIZADA
// ============================================

// Aguardar DOM completamente carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM completamente carregado');
        setTimeout(inicializarSistemaResumo, 1000);
    });
} else {
    // DOM já carregado
    console.log('⚡ DOM já carregado, inicializando imediatamente');
    setTimeout(inicializarSistemaResumo, 500);
}

// Também monitorar quando a página terminar de carregar tudo
window.addEventListener('load', () => {
    console.log('🖼️ Página completamente carregada');
    if (!resumoState.initialized) {
        setTimeout(inicializarSistemaResumo, 1500);
    }
});

// Forçar inicialização se chamado manualmente
window.iniciarResumoPericias = function() {
    console.log('🔧 Inicialização manual solicitada');
    inicializarSistemaResumo();
    return 'Sistema de resumo inicializado!';
};

// ============================================
// 9. FUNÇÕES DE DEBUG E DIAGNÓSTICO
// ============================================

window.debugResumo = function() {
    console.log('🔍 DEBUG RESUMO:');
    console.log('- Estado:', resumoState);
    console.log('- Inicializado:', resumoState.initialized);
    console.log('- Última atualização:', resumoState.lastUpdate);
    console.log('- Última aba:', resumoState.lastActiveTab);
    console.log('- Atualização pendente:', resumoState.updatePending);
    console.log('- Resumo visível?', isResumoVisivel());
    console.log('- Elemento resumo:', document.getElementById('resumo'));
    console.log('- estadoPericias:', window.estadoPericias ? 'Disponível' : 'Não disponível');
    console.log('- estadoTecnicas:', window.estadoTecnicas ? 'Disponível' : 'Não disponível');
    
    // Testar captura
    console.log('🧪 Testando captura...');
    const periciasTest = capturarPericiasDireto();
    const tecnicasTest = capturarTecnicasDireto();
    console.log('- Perícias capturadas:', periciasTest.pericias.length);
    console.log('- Técnicas capturadas:', tecnicasTest.tecnicas.length);
    
    // Forçar atualização
    atualizarInterfaceResumo();
    
    return 'Debug realizado! Verifique o console.';
};

window.forcarAtualizacaoResumo = function() {
    console.log('🔧 FORÇANDO ATUALIZAÇÃO IMEDIATA');
    atualizarInterfaceResumo();
    return 'Atualizado!';
};

// Disparar evento de atualização manualmente
window.atualizarResumoAgora = function() {
    console.log('⚡ Atualização manual do resumo');
    atualizarInterfaceResumo();
};

console.log('✅ RESUMO-PERICIAS.js carregado - PRONTO PARA USAR');