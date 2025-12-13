// ============================================
// RESUMO-PERICIAS.JS - VERSÃO FINAL CORRIGIDA
// Perícias: Nome | Pontos | NH
// Técnicas: Nome | Pontos | NH
// Sem ícones nos itens - Formato limpo
// ============================================

// ============================================
// 1. CONFIGURAÇÃO INICIAL RÁPIDA
// ============================================

console.log('🚀 RESUMO-PERICIAS.JS - Iniciando...');

// Estado para monitoramento
let estadoResumo = {
    carregado: false,
    ultimaAtualizacao: null,
    intervalos: {}
};

// ============================================
// 2. FUNÇÕES PRINCIPAIS - PERÍCIAS
// ============================================

function capturarPericiasParaResumo() {
    try {
        const pericias = [];
        let totalPontos = 0;
        
        console.log('[Resumo] 🔍 Buscando perícias...');
        
        // MÉTODO 1: Sistema principal (melhor)
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            const aprendidas = window.estadoPericias.periciasAprendidas;
            console.log(`[Resumo] 📊 ${aprendidas.length} perícias no sistema`);
            
            aprendidas.forEach(p => {
                if (!p || !p.id) return;
                
                // Calcular NH
                const atributoBase = obterAtributoBase(p.atributo);
                const nivel = p.nivel || 0;
                const nh = atributoBase + nivel;
                
                // Pontos gastos
                const pontos = p.investimentoAcumulado || p.custo || 0;
                
                pericias.push({
                    id: p.id,
                    nome: p.nome || 'Perícia',
                    pontos: pontos,
                    nh: nh,
                    especializacao: p.especializacao || null
                });
                
                totalPontos += pontos;
            });
        }
        
        // MÉTODO 2: Tentar pegar da tabela visível
        if (pericias.length === 0) {
            const itens = document.querySelectorAll('#pericias-aprendidas .pericia-aprendida-item');
            
            itens.forEach(item => {
                try {
                    // Extrair nome
                    const nomeElem = item.querySelector('.pericia-aprendida-nome');
                    let nome = nomeElem ? nomeElem.textContent.trim() : 'Perícia';
                    
                    // Limpar HTML do nome
                    nome = nome.replace(/<[^>]*>/g, '').trim();
                    
                    // Extrair pontos
                    const pontosElem = item.querySelector('.pericia-aprendida-custo');
                    let pontos = 0;
                    if (pontosElem) {
                        const match = pontosElem.textContent.match(/(\d+)/);
                        pontos = match ? parseInt(match[1]) : 0;
                    }
                    
                    // Extrair NH (se disponível)
                    const nhElem = item.querySelector('.pericia-aprendida-nh');
                    let nh = 0;
                    if (nhElem) {
                        const match = nhElem.textContent.match(/(\d+)/);
                        nh = match ? parseInt(match[1]) : 0;
                    }
                    
                    if (nome && nome !== 'Perícia') {
                        pericias.push({
                            id: 'pericia-' + Date.now() + Math.random(),
                            nome: nome,
                            pontos: pontos,
                            nh: nh || 10 // Default se não encontrou
                        });
                        totalPontos += pontos;
                    }
                } catch (e) {
                    console.warn('[Resumo] Erro ao extrair perícia:', e);
                }
            });
        }
        
        console.log(`[Resumo] ✅ ${pericias.length} perícias capturadas`);
        return { pericias, totalPontos };
        
    } catch (error) {
        console.error('[Resumo] ❌ Erro capturar perícias:', error);
        return { pericias: [], totalPontos: 0 };
    }
}

// ============================================
// 3. FUNÇÕES PRINCIPAIS - TÉCNICAS
// ============================================

function capturarTecnicasParaResumo() {
    try {
        const tecnicas = [];
        let totalPontos = 0;
        
        console.log('[Resumo] 🔧 Buscando técnicas...');
        
        // MÉTODO 1: Sistema de técnicas
        if (window.estadoTecnicas && window.estadoTecnicas.aprendidas) {
            const aprendidas = window.estadoTecnicas.aprendidas;
            console.log(`[Resumo] 🔧 ${aprendidas.length} técnicas no sistema`);
            
            aprendidas.forEach(t => {
                if (!t || !t.id) return;
                
                // Para "Arquearia Montada", calcular NH especial
                let nh = 0;
                if (t.id === 'arquearia-montada') {
                    nh = calcularNHArqueariaMontada();
                } else {
                    // Para outras técnicas, tentar calcular
                    nh = calcularNHTecnicaGenerica(t);
                }
                
                const pontos = t.custoTotal || 0;
                
                tecnicas.push({
                    id: t.id,
                    nome: t.nome || 'Técnica',
                    pontos: pontos,
                    nh: nh
                });
                
                totalPontos += pontos;
            });
        }
        
        // MÉTODO 2: Tentar pegar da lista visível
        if (tecnicas.length === 0) {
            const itens = document.querySelectorAll('#tecnicas-aprendidas .pericia-item');
            
            itens.forEach(item => {
                try {
                    // Extrair nome
                    const nomeElem = item.querySelector('h3, h4');
                    let nome = nomeElem ? nomeElem.textContent.trim() : 'Técnica';
                    
                    // Limpar ícones/emoji do nome
                    nome = nome.replace(/[🔸🔹🏹✅▶🚫]/g, '').trim();
                    
                    // Extrair pontos
                    let pontos = 0;
                    const texto = item.textContent;
                    const pontosMatch = texto.match(/(\d+)\s*pts?/);
                    if (pontosMatch) pontos = parseInt(pontosMatch[1]);
                    
                    // Extrair NH
                    let nh = 0;
                    const nhMatch = texto.match(/NH\s*(\d+)/i);
                    if (nhMatch) nh = parseInt(nhMatch[1]);
                    
                    if (nome && nome !== 'Técnica') {
                        tecnicas.push({
                            id: 'tecnica-' + Date.now() + Math.random(),
                            nome: nome,
                            pontos: pontos,
                            nh: nh || 10
                        });
                        totalPontos += pontos;
                    }
                } catch (e) {
                    console.warn('[Resumo] Erro ao extrair técnica:', e);
                }
            });
        }
        
        console.log(`[Resumo] ✅ ${tecnicas.length} técnicas capturadas`);
        return { tecnicas, totalPontos };
        
    } catch (error) {
        console.error('[Resumo] ❌ Erro capturar técnicas:', error);
        return { tecnicas: [], totalPontos: 0 };
    }
}

// ============================================
// 4. CÁLCULO DE NH PARA TÉCNICAS
// ============================================

function calcularNHArqueariaMontada() {
    try {
        console.log('[Resumo] 🏹 Calculando NH Arquearia Montada...');
        
        // 1. Obter NH do Arco
        let nhArco = 10;
        
        // Procurar perícia Arco aprendida
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            const arco = window.estadoPericias.periciasAprendidas.find(
                p => p.nome && p.nome.toLowerCase().includes('arco')
            );
            
            if (arco) {
                const atributoBase = obterAtributoBase(arco.atributo);
                nhArco = atributoBase + (arco.nivel || 0);
                console.log(`[Resumo] 🎯 NH Arco encontrado: ${nhArco}`);
            }
        }
        
        // 2. Obter pontos da técnica
        let pontosTecnica = 0;
        if (window.estadoTecnicas && window.estadoTecnicas.aprendidas) {
            const tecnica = window.estadoTecnicas.aprendidas.find(
                t => t.id === 'arquearia-montada'
            );
            pontosTecnica = tecnica ? (tecnica.custoTotal || 0) : 0;
        }
        
        // 3. Calcular NH final (Arco-4 + bônus por pontos)
        const base = nhArco - 4; // Penalidade base para montado
        
        // Converter pontos para níveis (regra técnica difícil)
        let niveisBonus = 0;
        if (pontosTecnica >= 5) niveisBonus = 4;
        else if (pontosTecnica >= 4) niveisBonus = 3;
        else if (pontosTecnica >= 3) niveisBonus = 2;
        else if (pontosTecnica >= 2) niveisBonus = 1;
        
        const nhFinal = base + niveisBonus;
        
        console.log(`[Resumo] 🏹 Arquearia Montada: Arco ${nhArco}, Base ${base}, +${niveisBonus} níveis = NH ${nhFinal}`);
        return nhFinal;
        
    } catch (error) {
        console.error('[Resumo] ❌ Erro cálculo NH Arquearia:', error);
        return 10; // Default
    }
}

function calcularNHTecnicaGenerica(tecnica) {
    // Para técnicas genéricas, usar valor padrão ou tentar extrair
    if (tecnica.nh) return tecnica.nh;
    
    // Tentar calcular baseado em perícia relacionada
    const nome = (tecnica.nome || '').toLowerCase();
    
    if (nome.includes('arco') || nome.includes('montad')) {
        return calcularNHArqueariaMontada();
    }
    
    // Default
    return 10;
}

// ============================================
// 5. ATUALIZAR DISPLAY NO RESUMO
// ============================================

function atualizarPericiasNoResumo() {
    try {
        console.log('[Resumo] 📋 Atualizando tabela de perícias...');
        
        const tabelaBody = document.getElementById('tabelaPericiasResumo');
        if (!tabelaBody) {
            console.log('[Resumo] ⚠️ Tabela não encontrada, criando...');
            criarTabelaSeNecessario();
            return;
        }
        
        const dados = capturarPericiasParaResumo();
        
        // Atualizar contador de pontos
        const pontosElement = document.getElementById('pontosPericias');
        if (pontosElement) {
            pontosElement.textContent = dados.totalPontos;
        }
        
        // Renderizar tabela
        renderizarTabelaPericias(tabelaBody, dados.pericias);
        
        estadoResumo.ultimaAtualizacao = new Date();
        console.log(`[Resumo] ✅ Perícias atualizadas: ${dados.pericias.length} itens`);
        
    } catch (error) {
        console.error('[Resumo] ❌ Erro atualizar perícias:', error);
    }
}

function atualizarTecnicasNoResumo() {
    try {
        console.log('[Resumo] 🛠️ Atualizando lista de técnicas...');
        
        const listaContainer = document.getElementById('listaTecnicasResumo');
        if (!listaContainer) {
            console.log('[Resumo] ⚠️ Lista técnicas não encontrada');
            return;
        }
        
        const dados = capturarTecnicasParaResumo();
        
        // Atualizar contador de pontos
        const pontosElement = document.getElementById('pontosTecnicas');
        if (pontosElement) {
            pontosElement.textContent = dados.totalPontos;
        }
        
        // Renderizar lista
        renderizarListaTecnicas(listaContainer, dados.tecnicas);
        
        console.log(`[Resumo] ✅ Técnicas atualizadas: ${dados.tecnicas.length} itens`);
        
    } catch (error) {
        console.error('[Resumo] ❌ Erro atualizar técnicas:', error);
    }
}

// ============================================
// 6. RENDERIZAÇÃO - FORMATO LIMPO
// ============================================

function renderizarTabelaPericias(container, pericias) {
    if (!pericias || pericias.length === 0) {
        container.innerHTML = `
            <tr class="vazio">
                <td colspan="3">Nenhuma perícia aprendida</td>
            </tr>
        `;
        return;
    }
    
    // Ordenar por nome
    pericias.sort((a, b) => a.nome.localeCompare(b.nome));
    
    // Limitar a 20 itens
    const displayPericias = pericias.slice(0, 20);
    
    let html = '';
    
    displayPericias.forEach((pericia, index) => {
        // Formatar nome (limitar e remover tags)
        let nomeDisplay = pericia.nome;
        nomeDisplay = nomeDisplay.replace(/<[^>]*>/g, '').trim();
        
        if (nomeDisplay.length > 25) {
            nomeDisplay = nomeDisplay.substring(0, 22) + '...';
        }
        
        // Adicionar especialização se houver
        if (pericia.especializacao) {
            const espec = pericia.especializacao.substring(0, 10);
            nomeDisplay += ` (${espec}${pericia.especializacao.length > 10 ? '...' : ''})`;
        }
        
        html += `
            <tr>
                <td class="td-nome" title="${pericia.nome}${pericia.especializacao ? ` (${pericia.especializacao})` : ''}">
                    ${nomeDisplay}
                </td>
                <td class="td-pontos">
                    ${pericia.pontos}
                </td>
                <td class="td-nh">
                    ${pericia.nh}
                </td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
}

function renderizarListaTecnicas(container, tecnicas) {
    if (!tecnicas || tecnicas.length === 0) {
        container.innerHTML = '<div class="vazio">Nenhuma técnica aprendida</div>';
        return;
    }
    
    // Limitar a 10 itens
    const displayTecnicas = tecnicas.slice(0, 10);
    
    let html = '';
    
    displayTecnicas.forEach(tecnica => {
        // Formatar nome (limpar e limitar)
        let nomeDisplay = tecnica.nome;
        nomeDisplay = nomeDisplay.replace(/<[^>]*>/g, '').trim();
        nomeDisplay = nomeDisplay.replace(/[🔸🔹🏹✅▶🚫]/g, '').trim();
        
        if (nomeDisplay.length > 28) {
            nomeDisplay = nomeDisplay.substring(0, 25) + '...';
        }
        
        html += `
            <div class="tecnica-resumo-item">
                <span class="tecnica-nome">${nomeDisplay}</span>
                <span class="tecnica-pontos">${tecnica.pontos}</span>
                <span class="tecnica-nh">${tecnica.nh}</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ============================================
// 7. FUNÇÕES AUXILIARES
// ============================================

function obterAtributoBase(atributo) {
    try {
        // Valores padrão do sistema
        const defaults = {
            'DX': 10, 'IQ': 10, 'HT': 10, 'PERC': 10
        };
        
        if (!atributo) return 10;
        
        // Tentar pegar do resumo
        const elemId = 'resumo' + atributo;
        const elem = document.getElementById(elemId);
        
        if (elem) {
            const valor = parseInt(elem.textContent || elem.value || '10');
            return isNaN(valor) ? defaults[atributo] || 10 : valor;
        }
        
        return defaults[atributo] || 10;
        
    } catch (e) {
        return 10;
    }
}

function criarTabelaSeNecessario() {
    // Verificar se a tabela existe no HTML
    const resumoPericias = document.querySelector('#resumo .card-tabela');
    
    if (resumoPericias && !document.getElementById('tabelaPericiasResumo')) {
        const tbody = resumoPericias.querySelector('tbody');
        if (tbody) {
            tbody.id = 'tabelaPericiasResumo';
            console.log('[Resumo] ✅ Tabela configurada');
        }
    }
}

// ============================================
// 8. SISTEMA DE ATUALIZAÇÃO AUTOMÁTICA
// ============================================

function iniciarAtualizacaoAutomatica() {
    if (estadoResumo.carregado) return;
    
    console.log('[Resumo] 🔄 Iniciando atualização automática...');
    
    // Atualizar imediatamente
    atualizarTudoNoResumo();
    
    // Configurar intervalo para atualizar quando na aba resumo
    estadoResumo.intervalos.principal = setInterval(() => {
        const resumoAtivo = document.getElementById('resumo')?.classList.contains('active');
        if (resumoAtivo) {
            atualizarTudoNoResumo();
        }
    }, 3000); // Atualiza a cada 3 segundos quando na aba
    
    // Observar mudanças nas abas
    document.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.tab-btn');
        if (tabBtn && tabBtn.dataset.tab === 'resumo') {
            // Forçar atualização ao clicar na aba
            setTimeout(atualizarTudoNoResumo, 100);
        }
    });
    
    // Observar mudanças nas perícias (evento personalizado)
    document.addEventListener('periciasAlteradas', atualizarTudoNoResumo);
    
    estadoResumo.carregado = true;
    console.log('[Resumo] ✅ Sistema ativo');
}

function atualizarTudoNoResumo() {
    atualizarPericiasNoResumo();
    atualizarTecnicasNoResumo();
}

// ============================================
// 9. INICIALIZAÇÃO RÁPIDA
// ============================================

function inicializarResumoPericias() {
    console.log('[Resumo] 🚀 Inicializando...');
    
    // Aguardar um pouco para sistemas carregarem
    setTimeout(() => {
        // Verificar se containers existem
        const tabelaExiste = document.getElementById('tabelaPericiasResumo');
        const listaExiste = document.getElementById('listaTecnicasResumo');
        
        if (tabelaExiste || listaExiste) {
            iniciarAtualizacaoAutomatica();
        } else {
            console.log('[Resumo] ⏳ Aguardando containers...');
            // Tentar novamente em 2 segundos
            setTimeout(inicializarResumoPericias, 2000);
        }
    }, 1000);
}

// ============================================
// 10. CSS DINÂMICO PARA FORMATAÇÃO
// ============================================

function aplicarEstilosResumo() {
    const styleId = 'resumo-estilos-dinamicos';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* TABELA PERÍCIAS - FORMATO LIMPO */
        #tabelaPericiasResumo {
            width: 100%;
        }
        
        #tabelaPericiasResumo .td-nome {
            color: #ddd;
            text-align: left;
            padding: 4px 8px;
            font-size: 0.8rem;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        #tabelaPericiasResumo .td-pontos {
            color: #ffd700;
            font-weight: 600;
            text-align: center;
            padding: 4px 6px;
            font-size: 0.85rem;
            background: rgba(255, 215, 0, 0.1);
            border-radius: 3px;
            min-width: 40px;
        }
        
        #tabelaPericiasResumo .td-nh {
            color: #2ecc71;
            font-weight: 700;
            text-align: center;
            padding: 4px 6px;
            font-size: 0.9rem;
            background: rgba(46, 204, 113, 0.1);
            border-radius: 3px;
            min-width: 40px;
        }
        
        #tabelaPericiasResumo tr:hover {
            background: rgba(255, 140, 0, 0.08);
        }
        
        /* LISTA TÉCNICAS - FORMATO LIMPO */
        .tecnica-resumo-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 8px;
            margin-bottom: 4px;
            background: rgba(155, 89, 182, 0.08);
            border-radius: 4px;
            border-left: 2px solid #9b59b6;
            font-size: 0.8rem;
        }
        
        .tecnica-resumo-item:hover {
            background: rgba(155, 89, 182, 0.12);
        }
        
        .tecnica-resumo-item .tecnica-nome {
            flex: 1;
            color: #ddd;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding-right: 8px;
        }
        
        .tecnica-resumo-item .tecnica-pontos {
            color: #ffd700;
            font-weight: 600;
            padding: 2px 6px;
            background: rgba(255, 215, 0, 0.1);
            border-radius: 10px;
            font-size: 0.75rem;
            margin-right: 6px;
            min-width: 30px;
            text-align: center;
        }
        
        .tecnica-resumo-item .tecnica-nh {
            color: #2ecc71;
            font-weight: 700;
            padding: 2px 8px;
            background: rgba(46, 204, 113, 0.1);
            border-radius: 10px;
            font-size: 0.8rem;
            min-width: 35px;
            text-align: center;
        }
        
        /* CABEÇALHO DA TABELA */
        #tabelaPericiasResumo + thead th {
            font-size: 0.75rem;
            color: #aaa;
            padding: 6px 8px;
        }
        
        #tabelaPericiasResumo + thead .th-nivel {
            text-align: center;
            width: 50px;
        }
        
        #tabelaPericiasResumo + thead .th-pontos {
            text-align: center;
            width: 50px;
        }
    `;
    
    document.head.appendChild(style);
    console.log('[Resumo] 🎨 Estilos aplicados');
}

// ============================================
// 11. CARREGAMENTO
// ============================================

// Iniciar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Resumo] 📄 DOM pronto');
    
    // Aplicar estilos
    aplicarEstilosResumo();
    
    // Iniciar sistema
    setTimeout(inicializarResumoPericias, 500);
});

// Backup: iniciar se ainda não iniciou
window.addEventListener('load', function() {
    setTimeout(() => {
        if (!estadoResumo.carregado) {
            console.log('[Resumo] 🔧 Iniciando via window.load');
            inicializarResumoPericias();
        }
    }, 1500);
});

// ============================================
// 12. FUNÇÕES GLOBAIS PARA TESTE
// ============================================

window.atualizarResumoManual = function() {
    console.log('[Resumo] 🔄 Atualização manual solicitada');
    atualizarTudoNoResumo();
    return 'Resumo atualizado!';
};

window.verificarStatusResumo = function() {
    return {
        carregado: estadoResumo.carregado,
        ultimaAtualizacao: estadoResumo.ultimaAtualizacao,
        tabelaExiste: !!document.getElementById('tabelaPericiasResumo'),
        listaExiste: !!document.getElementById('listaTecnicasResumo')
    };
};

console.log('[Resumo] ✅ Script carregado - Aguardando inicialização...');