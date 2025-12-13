// ============================================
// RESUMO-MAGIAS-COMPLETO.js
// Sistema COMPLETO para magias no resumo
// ============================================

console.log('🔮 RESUMO-MAGIAS-COMPLETO - INICIANDO');

// ============================================
// 1. ESTADO GLOBAL
// ============================================

const resumoMagiasState = {
    initialized: false,
    intervalId: null,
    lastUpdate: null,
    cache: {
        magias: [],
        pontosMagias: 0,
        manaAtual: 0,
        manaMaxima: 0,
        aptidaoMagica: 0
    }
};

// ============================================
// 2. FUNÇÕES DE CAPTURA
// ============================================

function capturarMagiasDireto() {
    try {
        const magias = [];
        let totalPontos = 0;
        
        console.log('🔮 Capturando magias do sistema...');
        
        // Método 1: Usar sistemaMagia se disponível
        if (window.sistemaMagia && window.sistemaMagia.magiasAprendidas) {
            console.log('📊 Capturando magias do sistemaMagia');
            window.sistemaMagia.magiasAprendidas.forEach(m => {
                if (!m) return;
                
                magias.push({
                    id: m.id || Date.now(),
                    nome: m.nome || 'Magia',
                    pontos: m.pontos || 0,
                    nivel: m.nivel || 10,
                    escola: m.escola || 'Comum',
                    classe: m.classe || 'Comum',
                    custoMana: m.custoMana || 0,
                    dificuldade: m.dificuldade || 'Média'
                });
                
                totalPontos += m.pontos || 0;
            });
            
            if (magias.length > 0) {
                console.log(`✅ ${magias.length} magias capturadas do sistemaMagia`);
                return { magias, totalPontos };
            }
        }
        
        // Método 2: Extrair da lista HTML
        console.log('🔍 Extraindo magias da lista HTML');
        const listaContainer = document.getElementById('magias-aprendidas');
        
        if (listaContainer && !listaContainer.innerHTML.includes('Nenhuma magia')) {
            const itens = listaContainer.querySelectorAll('.magia-aprendida-item, .magia-item');
            
            itens.forEach(item => {
                // Extrair nome
                const nomeElem = item.querySelector('.magia-aprendida-nome, .magia-nome, h4');
                let nome = nomeElem ? nomeElem.textContent.trim() : '';
                
                if (nome && !nome.includes('Nenhuma')) {
                    // Limpar HTML
                    nome = nome.replace(/<[^>]*>/g, '').trim();
                    
                    // Extrair pontos
                    let pontos = 0;
                    const texto = item.textContent;
                    const pontosMatch = texto.match(/(\d+)\s*pts?/);
                    if (pontosMatch) pontos = parseInt(pontosMatch[1]);
                    
                    // Extrair NH/Nível
                    let nivel = 0;
                    const nivelMatch = texto.match(/NH\s*(\d+)/i);
                    if (nivelMatch) {
                        nivel = parseInt(nivelMatch[1]);
                    } else {
                        // Tentar extrair nível de outra forma
                        const nivelMatch2 = texto.match(/Nível\s*(\d+)/i);
                        if (nivelMatch2) nivel = parseInt(nivelMatch2[1]);
                    }
                    
                    // Extrair escola e classe
                    let escola = 'Comum';
                    let classe = 'Comum';
                    let custoMana = 0;
                    
                    // Detectar escola
                    if (texto.includes('Água') || texto.includes('água')) escola = 'Água';
                    else if (texto.includes('Ar') || texto.includes('ar')) escola = 'Ar';
                    else if (texto.includes('Fogo') || texto.includes('fogo')) escola = 'Fogo';
                    else if (texto.includes('Terra') || texto.includes('terra')) escola = 'Terra';
                    else if (texto.includes('Cura') || texto.includes('cura')) escola = 'Cura';
                    else if (texto.includes('Necromancia') || texto.includes('necromancia')) escola = 'Necromancia';
                    
                    // Detectar custo de mana
                    const manaMatch = texto.match(/(\d+)\s*mana/i);
                    if (manaMatch) custoMana = parseInt(manaMatch[1]);
                    
                    magias.push({
                        id: 'magia-' + Date.now() + Math.random(),
                        nome: nome,
                        pontos: pontos,
                        nivel: nivel || 10,
                        escola: escola,
                        classe: classe,
                        custoMana: custoMana
                    });
                    
                    totalPontos += pontos;
                }
            });
        }
        
        // Método 3: Tentar localStorage
        if (magias.length === 0) {
            try {
                const salvo = localStorage.getItem('sistemaMagia');
                if (salvo) {
                    const dados = JSON.parse(salvo);
                    if (dados.magiasAprendidas && Array.isArray(dados.magiasAprendidas)) {
                        dados.magiasAprendidas.forEach(m => {
                            magias.push({
                                nome: m.nome || 'Magia',
                                pontos: m.pontos || 0,
                                nivel: m.nivel || 10,
                                escola: m.escola || 'Comum'
                            });
                            totalPontos += m.pontos || 0;
                        });
                    }
                }
            } catch (e) {
                console.log('⚠️ Não foi possível carregar do localStorage');
            }
        }
        
        // Método 4: Mock data para teste
        if (magias.length === 0) {
            console.log('⚠️ Nenhuma magia encontrada, usando dados de teste');
            magias.push(
                { nome: "Bola de Fogo", pontos: 12, nivel: 14, escola: "Fogo", custoMana: 3 },
                { nome: "Curar Ferimentos", pontos: 8, nivel: 12, escola: "Cura", custoMana: 2 },
                { nome: "Bola de Fogo Maior", pontos: 16, nivel: 16, escola: "Fogo", custoMana: 5 }
            );
            totalPontos = 36;
        }
        
        console.log(`✅ Total: ${magias.length} magias, ${totalPontos} pontos`);
        return { magias, totalPontos };
        
    } catch (error) {
        console.error('❌ Erro capturar magias:', error);
        return { magias: [], totalPontos: 0 };
    }
}

function capturarStatusMagico() {
    try {
        let manaAtual = 0;
        let manaMaxima = 0;
        let aptidaoMagica = 0;
        let iqMagico = 0;
        
        // Capturar Mana
        const manaAtualElem = document.getElementById('mana-atual');
        const manaBaseElem = document.getElementById('mana-base');
        const manaBonusElem = document.getElementById('bonus-mana');
        
        if (manaAtualElem) manaAtual = parseInt(manaAtualElem.value) || 0;
        if (manaBaseElem) manaMaxima = parseInt(manaBaseElem.textContent) || 0;
        
        // Ajustar mana máxima com bônus
        if (manaBonusElem) {
            const bonus = parseInt(manaBonusElem.value) || 0;
            manaMaxima += bonus;
        }
        
        // Capturar Aptidão Mágica
        const aptidaoElem = document.getElementById('aptidao-magica');
        if (aptidaoElem) aptidaoMagica = parseInt(aptidaoElem.value) || 0;
        
        // Capturar IQ Mágico
        const iqMagicoElem = document.getElementById('iq-magico');
        if (iqMagicoElem) iqMagico = parseInt(iqMagicoElem.textContent) || 0;
        
        return {
            manaAtual,
            manaMaxima,
            aptidaoMagica,
            iqMagico
        };
        
    } catch (error) {
        console.error('❌ Erro capturar status mágico:', error);
        return {
            manaAtual: 0,
            manaMaxima: 0,
            aptidaoMagica: 0,
            iqMagico: 0
        };
    }
}

// ============================================
// 3. ATUALIZAR INTERFACE DO RESUMO
// ============================================

function atualizarMagiasNoResumo() {
    try {
        console.log('🔄 Atualizando magias no resumo...');
        
        // 1. Capturar dados
        const magiasData = capturarMagiasDireto();
        const statusMagico = capturarStatusMagico();
        
        // Guardar no cache
        resumoMagiasState.cache.magias = magiasData.magias;
        resumoMagiasState.cache.pontosMagias = magiasData.totalPontos;
        resumoMagiasState.cache.manaAtual = statusMagico.manaAtual;
        resumoMagiasState.cache.manaMaxima = statusMagico.manaMaxima;
        resumoMagiasState.cache.aptidaoMagica = statusMagico.aptidaoMagica;
        resumoMagiasState.lastUpdate = new Date();
        
        // 2. Atualizar pontos totais
        const pontosMagiasElem = document.getElementById('pontosMagias');
        if (pontosMagiasElem) {
            pontosMagiasElem.textContent = magiasData.totalPontos;
        }
        
        // 3. Atualizar status mágico no resumo
        atualizarStatusMagicoResumo(statusMagico);
        
        // 4. Atualizar lista de magias no resumo
        atualizarListaMagiasResumo(magiasData.magias);
        
        console.log(`✅ Magias atualizadas: ${magiasData.magias.length} itens`);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar magias no resumo:', error);
    }
}

function atualizarStatusMagicoResumo(status) {
    try {
        // Atualizar aptidão mágica
        const aptidaoElem = document.getElementById('resumoAptidao');
        if (aptidaoElem) {
            aptidaoElem.textContent = status.aptidaoMagica;
        }
        
        // Atualizar mana no formato "atual/máximo"
        const manaElem = document.getElementById('resumoMana');
        if (manaElem) {
            const manaDisplay = status.manaAtual === 0 && status.manaMaxima === 0 
                ? '0/0' 
                : `${status.manaAtual}/${status.manaMaxima}`;
            manaElem.textContent = manaDisplay;
        }
        
    } catch (error) {
        console.error('❌ Erro atualizar status mágico:', error);
    }
}

function atualizarListaMagiasResumo(magias) {
    const container = document.getElementById('listaMagiasResumo');
    if (!container) {
        console.error('❌ Lista de magias não encontrada no resumo!');
        criarListaMagiasResumo();
        return;
    }
    
    if (!magias || magias.length === 0) {
        container.innerHTML = '<div class="vazio">Nenhuma magia aprendida</div>';
        return;
    }
    
    // Ordenar por escola e nome
    magias.sort((a, b) => {
        if (a.escola !== b.escola) return a.escola.localeCompare(b.escola);
        return a.nome.localeCompare(b.nome);
    });
    
    // Limitar a 15 itens
    const magiasLimitadas = magias.slice(0, 15);
    
    let html = '';
    
    magiasLimitadas.forEach(magia => {
        // Formatar nome (limpar e limitar)
        let nomeDisplay = magia.nome || 'Magia';
        nomeDisplay = nomeDisplay.replace(/<[^>]*>/g, '').trim();
        
        if (nomeDisplay.length > 25) {
            nomeDisplay = nomeDisplay.substring(0, 22) + '...';
        }
        
        // Formatar escola abreviada
        let escolaDisplay = magia.escola || 'Comum';
        escolaDisplay = escolaDisplay.substring(0, 10);
        
        // Cor baseada na escola
        const coresEscola = {
            'Água': '#3498db',
            'Ar': '#95a5a6',
            'Fogo': '#e74c3c',
            'Terra': '#d35400',
            'Cura': '#2ecc71',
            'Necromancia': '#9b59b6',
            'Comum': '#f1c40f'
        };
        
        const corEscola = coresEscola[magia.escola] || '#f1c40f';
        
        html += `
            <div class="magia-resumo-item" style="border-left-color: ${corEscola};">
                <div class="magia-resumo-info">
                    <span class="magia-resumo-nome" title="${magia.nome} (${magia.escola})">
                        ${nomeDisplay}
                    </span>
                    <span class="magia-resumo-escola" style="color: ${corEscola};">
                        ${escolaDisplay}
                    </span>
                </div>
                <div class="magia-resumo-valores">
                    <span class="magia-resumo-pontos" title="Pontos gastos">
                        ${magia.pontos || 0}
                    </span>
                    <span class="magia-resumo-nivel" title="NH da magia">
                        ${magia.nivel || 10}
                    </span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ============================================
// 4. CRIAÇÃO DE ELEMENTOS
// ============================================

function criarListaMagiasResumo() {
    const card = document.querySelector('#resumo .card-lista-micro');
    if (!card) {
        console.error('❌ Card de magias não encontrado no resumo');
        return;
    }
    
    // Verificar se já existe a lista
    const existingList = card.querySelector('.micro-lista-scroll');
    if (existingList) {
        existingList.id = 'listaMagiasResumo';
        return;
    }
    
    // Criar container de scroll
    const scrollContainer = card.querySelector('.micro-scroll-container');
    if (!scrollContainer) return;
    
    // Criar lista
    const lista = document.createElement('div');
    lista.id = 'listaMagiasResumo';
    lista.className = 'micro-lista-scroll';
    
    scrollContainer.appendChild(lista);
    console.log('✅ Lista de magias criada no resumo');
}

// ============================================
// 5. INICIALIZAÇÃO E MONITORAMENTO
// ============================================

function inicializarResumoMagias() {
    if (resumoMagiasState.initialized) return;
    
    console.log('🚀 Inicializando sistema de magias no resumo...');
    
    // 1. Criar elementos se necessário
    criarListaMagiasResumo();
    
    // 2. Aplicar estilos CSS
    aplicarEstilosMagiasResumo();
    
    // 3. Primeira atualização
    atualizarMagiasNoResumo();
    
    // 4. Configurar monitoramento
    configurarMonitoramentoMagias();
    
    resumoMagiasState.initialized = true;
    console.log('✅ Sistema de magias no resumo inicializado!');
}

function configurarMonitoramentoMagias() {
    // Atualizar quando a aba Resumo for aberta
    document.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.tab-btn');
        if (tabBtn && tabBtn.dataset.tab === 'resumo') {
            console.log('📱 Aba Resumo clicada, atualizando magias...');
            setTimeout(atualizarMagiasNoResumo, 300);
        }
    });
    
    // Atualizar quando mudar para/da aba Magias
    const tabMagias = document.querySelector('[data-tab="magia"]');
    if (tabMagias) {
        tabMagias.addEventListener('click', () => {
            setTimeout(atualizarMagiasNoResumo, 1000);
        });
    }
    
    // Monitorar mudanças nos atributos mágicos
    const atributosMagicos = ['IQ', 'HT', 'aptidao-magica', 'mana-atual', 'bonus-mana'];
    
    atributosMagicos.forEach(atributoId => {
        const elemento = document.getElementById(atributoId);
        if (elemento) {
            elemento.addEventListener('change', () => {
                const resumoAtivo = document.getElementById('resumo')?.classList.contains('active');
                if (resumoAtivo) {
                    setTimeout(atualizarMagiasNoResumo, 500);
                }
            });
            
            elemento.addEventListener('input', () => {
                clearTimeout(resumoMagiasState[atributoId + 'Timeout']);
                resumoMagiasState[atributoId + 'Timeout'] = setTimeout(() => {
                    const resumoAtivo = document.getElementById('resumo')?.classList.contains('active');
                    if (resumoAtivo) {
                        atualizarMagiasNoResumo();
                    }
                }, 500);
            });
        }
    });
    
    // Atualizar periodicamente quando na aba Resumo
    resumoMagiasState.intervalId = setInterval(() => {
        const resumoAtivo = document.getElementById('resumo')?.classList.contains('active');
        if (resumoAtivo) {
            atualizarMagiasNoResumo();
        }
    }, 4000); // 4 segundos
    
    // Observar eventos do sistema de magias
    document.addEventListener('magiasAlteradas', atualizarMagiasNoResumo);
    
    // Criar evento personalizado se não existir
    if (typeof window.sistemaMagia === 'object' && window.sistemaMagia.magiasAprendidas) {
        // Monitorar o array de magias aprendidas
        const originalPush = Array.prototype.push;
        const magiasArray = window.sistemaMagia.magiasAprendidas;
        
        Array.prototype.push = function(...args) {
            const result = originalPush.apply(this, args);
            if (this === magiasArray) {
                setTimeout(atualizarMagiasNoResumo, 100);
            }
            return result;
        };
    }
}

// ============================================
// 6. ESTILOS CSS PARA MAGIAS
// ============================================

function aplicarEstilosMagiasResumo() {
    const styleId = 'resumo-magias-estilos-custom';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Lista de Magias no Resumo */
        .magia-resumo-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 10px;
            margin-bottom: 6px;
            background: rgba(30, 30, 40, 0.8);
            border-radius: 6px;
            border-left: 4px solid #f1c40f;
            transition: all 0.2s ease;
        }
        
        .magia-resumo-item:hover {
            background: rgba(40, 40, 50, 0.9);
            transform: translateX(2px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .magia-resumo-info {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 3px;
        }
        
        .magia-resumo-nome {
            color: #eee;
            font-size: 0.85rem;
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .magia-resumo-escola {
            font-size: 0.7rem;
            font-weight: 600;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .magia-resumo-valores {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        .magia-resumo-pontos {
            color: #ffd700;
            font-weight: 700;
            font-size: 0.9rem;
            padding: 4px 8px;
            background: rgba(255, 215, 0, 0.15);
            border-radius: 12px;
            min-width: 40px;
            text-align: center;
        }
        
        .magia-resumo-nivel {
            color: #2ecc71;
            font-weight: 800;
            font-size: 0.95rem;
            padding: 4px 10px;
            background: rgba(46, 204, 113, 0.15);
            border-radius: 12px;
            min-width: 45px;
            text-align: center;
        }
        
        /* Status Mágico no Header */
        .magia-status-micro {
            display: flex;
            justify-content: space-around;
            padding: 6px 8px;
            background: rgba(155, 89, 182, 0.1);
            border-radius: 4px;
            margin: 4px 0;
        }
        
        .magia-stat {
            font-size: 0.8rem;
            color: #aaa;
        }
        
        .magia-stat strong {
            color: #9b59b6;
            font-size: 0.9rem;
            margin-left: 4px;
        }
        
        /* Tooltips */
        .magia-resumo-item [title]:hover:after {
            content: attr(title);
            position: absolute;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 0.75rem;
            z-index: 1000;
            white-space: nowrap;
            margin-top: 5px;
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
            .magia-resumo-valores {
                flex-direction: column;
                gap: 4px;
            }
            
            .magia-resumo-pontos,
            .magia-resumo-nivel {
                min-width: 35px;
                font-size: 0.8rem;
                padding: 3px 6px;
            }
        }
        
        /* Animações */
        @keyframes magiaPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        
        .magia-resumo-item.updated {
            animation: magiaPulse 0.5s ease;
        }
    `;
    
    document.head.appendChild(style);
    console.log('🎨 Estilos de magias aplicados');
}

// ============================================
// 7. INICIALIZAÇÃO AUTOMÁTICA
// ============================================

// Iniciar quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado, iniciando magias em 1.5s...');
    setTimeout(inicializarResumoMagias, 1500);
});

// Iniciar se ainda não iniciou
window.addEventListener('load', () => {
    setTimeout(() => {
        if (!resumoMagiasState.initialized) {
            console.log('⚡ Iniciando magias via window.load');
            inicializarResumoMagias();
        }
    }, 2500);
});

// Forçar inicialização se chamado manualmente
window.iniciarResumoMagias = inicializarResumoMagias;

// ============================================
// 8. FUNÇÕES DE DEBUG E UTILITÁRIAS
// ============================================

window.debugResumoMagias = function() {
    console.log('🔍 DEBUG RESUMO MAGIAS:');
    console.log('- Estado:', resumoMagiasState);
    console.log('- Cache:', resumoMagiasState.cache);
    console.log('- Lista existe:', !!document.getElementById('listaMagiasResumo'));
    console.log('- sistemaMagia:', window.sistemaMagia ? 'Disponível' : 'Não disponível');
    console.log('- Magias aprendidas:', window.sistemaMagia ? window.sistemaMagia.magiasAprendidas?.length || 0 : 0);
    
    // Forçar atualização
    atualizarMagiasNoResumo();
    
    return 'Debug de magias realizado!';
};

window.forcarAtualizacaoMagias = function() {
    console.log('🔮 FORÇANDO ATUALIZAÇÃO DE MAGIAS');
    atualizarMagiasNoResumo();
    return 'Magias atualizadas!';
};

window.obterStatusMagico = function() {
    return {
        ...resumoMagiasState.cache,
        lastUpdate: resumoMagiasState.lastUpdate,
        initialized: resumoMagiasState.initialized
    };
};

// ============================================
// 9. INTEGRAÇÃO COM SISTEMA DE RESUMO EXISTENTE
// ============================================

// Função para ser chamada pelo sistema-resumo.js principal
window.atualizarResumoMagias = function() {
    atualizarMagiasNoResumo();
    return true;
};

// Verificar se há integração com sistema principal
window.addEventListener('resumoAtualizado', () => {
    atualizarMagiasNoResumo();
});

console.log('✅ RESUMO-MAGIAS-COMPLETO carregado e pronto!');