// ===== SISTEMA DE TÉCNICAS - VERSÃO DEFINITIVA =====
console.log("🎯 SISTEMA DE TÉCNICAS CARREGANDO...");

// ===== ESTADO GLOBAL DAS TÉCNICAS =====
let estadoTecnicas = {
    pontosTecnicasTotal: 0,
    pontosMedio: 0,
    pontosDificil: 0,
    qtdMedio: 0,
    qtdDificil: 0,
    qtdTotal: 0,
    tecnicasAprendidas: [],
    filtroAtivo: 'todas-tecnicas',
    buscaAtiva: '',
    tecnicasDisponiveis: [],
    modalAberto: false,
    tecnicaSelecionada: null
};

// ===== FUNÇÃO CRÍTICA: BUSCAR PERÍCIA NO SISTEMA =====
function buscarPericiaNoSistema(nomeBusca) {
    console.log(`🔍 Buscando perícia: "${nomeBusca}"`);
    
    // Se não tem sistema de perícias, criar um básico
    if (!window.estadoPericias) {
        console.warn("⚠️ Sistema de perícias não encontrado! Criando básico...");
        window.estadoPericias = {
            periciasAprendidas: [
                { id: 'arco', nome: 'Arco', nivel: 4, atributo: 'DX', dificuldade: 'Média', custo: 8 },
                { id: 'cavalgar-cavalo', nome: 'Cavalgar (Cavalo)', nivel: 3, atributo: 'DX', dificuldade: 'Média', custo: 6 }
            ]
        };
    }
    
    // Buscar nas perícias aprendidas
    if (window.estadoPericias.periciasAprendidas) {
        // Busca por ID exato
        let encontrada = window.estadoPericias.periciasAprendidas.find(p => p.id === nomeBusca);
        
        // Busca por nome contendo
        if (!encontrada && nomeBusca.includes('cavalgar')) {
            encontrada = window.estadoPericias.periciasAprendidas.find(p => 
                p.id.includes('cavalgar') || 
                p.nome.toLowerCase().includes('cavalgar')
            );
        }
        
        // Busca por "arco"
        if (!encontrada && nomeBusca === 'arco') {
            encontrada = window.estadoPericias.periciasAprendidas.find(p => 
                p.id === 'arco' || p.nome === 'Arco'
            );
        }
        
        if (encontrada) {
            console.log(`✅ Perícia encontrada: ${encontrada.nome} (nível ${encontrada.nivel})`);
            return encontrada;
        }
    }
    
    console.warn(`⚠️ Perícia "${nomeBusca}" não encontrada nas aprendidas`);
    return null;
}

// ===== OBTER NH DA PERÍCIA ARCO =====
function obterNHArco() {
    console.log("🎯 Calculando NH do Arco...");
    
    // Obter atributo DX atual
    let dxAtual = 10; // Valor padrão
    
    // Tentar obter do sistema de atributos
    if (window.obterAtributoAtual && typeof window.obterAtributoAtual === 'function') {
        try {
            dxAtual = window.obterAtributoAtual('DX');
            console.log(`✅ DX obtido do sistema: ${dxAtual}`);
        } catch (e) {
            console.warn(`⚠️ Erro ao obter DX, usando padrão 10:`, e);
        }
    } else {
        console.warn(`⚠️ Função obterAtributoAtual não encontrada, usando DX padrão: ${dxAtual}`);
    }
    
    // Buscar perícia Arco
    const periciaArco = buscarPericiaNoSistema('arco');
    
    if (periciaArco && periciaArco.nivel) {
        const nhArco = dxAtual + periciaArco.nivel;
        console.log(`✅ NH Arco calculado: ${nhArco} (DX ${dxAtual} + nível ${periciaArco.nivel})`);
        return nhArco;
    }
    
    // Se não tem Arco, usar só o DX
    console.warn(`⚠️ Arco não encontrado, usando DX base: ${dxAtual}`);
    return dxAtual;
}

// ===== VERIFICAR PRÉ-REQUISITOS =====
function verificarPreRequisitos(tecnica) {
    console.log(`🔧 Verificando pré-requisitos para: ${tecnica.nome}`);
    
    const requisitos = {
        arco: { passou: false, nivel: 0, necessario: 4 },
        cavalgar: { passou: false }
    };
    
    // 1. VERIFICAR ARCO (nível 4+)
    const arco = buscarPericiaNoSistema('arco');
    if (arco && arco.nivel >= 4) {
        requisitos.arco.passou = true;
        requisitos.arco.nivel = arco.nivel;
        console.log(`✅ Arco: nível ${arco.nivel} >= 4`);
    } else {
        const nivelAtual = arco ? arco.nivel : 0;
        console.log(`❌ Arco: nível ${nivelAtual} < 4 (necessário: 4+)`);
    }
    
    // 2. VERIFICAR CAVALGAR (qualquer especialização)
    const temCavalgar = window.estadoPericias && 
        window.estadoPericias.periciasAprendidas && 
        window.estadoPericias.periciasAprendidas.some(p => 
            p.id.includes('cavalgar') || 
            p.nome.toLowerCase().includes('cavalgar')
        );
    
    if (temCavalgar) {
        requisitos.cavalgar.passou = true;
        console.log("✅ Cavalgar: possui");
    } else {
        console.log("❌ Cavalgar: não possui");
    }
    
    // RESULTADO FINAL
    const passou = requisitos.arco.passou && requisitos.cavalgar.passou;
    let motivo = '';
    
    if (!passou) {
        if (!requisitos.arco.passou) {
            motivo = `Precisa de Arco nível 4 (atual: ${requisitos.arco.nivel})`;
        } else if (!requisitos.cavalgar.passou) {
            motivo = 'Precisa de alguma perícia de Cavalgar';
        }
    }
    
    console.log(`📋 Resultado: ${passou ? '✅ APROVADO' : '❌ REPROVADO'} ${motivo ? '- ' + motivo : ''}`);
    return { passou, motivo };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    console.log("🔄 Atualizando técnicas disponíveis...");
    
    // Verificar se tem catálogo
    if (!window.catalogoTecnicas) {
        console.error("❌ Catálogo de técnicas não carregado!");
        return;
    }
    
    // Obter todas técnicas
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    console.log(`📚 Técnicas no catálogo: ${todasTecnicas.length}`);
    
    // Processar cada técnica
    const disponiveis = todasTecnicas.map(tecnica => {
        // Verificar pré-requisitos
        const requisitos = verificarPreRequisitos(tecnica);
        
        // Verificar se já aprendeu
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        // Calcular NH atual
        let nhAtual = 0;
        let nhArco = 0;
        
        if (tecnica.basePericia === 'arco') {
            nhArco = obterNHArco();
            nhAtual = nhArco - 4; // Arco-4
            
            // Adicionar níveis comprados se já aprendida
            if (jaAprendida && jaAprendida.niveisComprados) {
                nhAtual += jaAprendida.niveisComprados;
            }
            
            console.log(`   ${tecnica.nome}: NH = ${nhAtual} (Arco ${nhArco} - 4)`);
        }
        
        return {
            ...tecnica,
            disponivel: requisitos.passou,
            motivoIndisponivel: requisitos.motivo,
            nhAtual: nhAtual,
            nhArco: nhArco,
            jaAprendida: !!jaAprendida,
            niveisComprados: jaAprendida ? jaAprendida.niveisComprados || 0 : 0
        };
    });
    
    // Atualizar estado
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    
    // Renderizar
    renderizarCatalogoTecnicas();
    
    console.log(`✅ Técnicas atualizadas: ${disponiveis.filter(t => t.disponivel).length} disponíveis`);
}

// ===== CATÁLOGO DE TÉCNICAS =====
const catalogoTecnicas = {
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Usar arco enquanto cavalga. Penalidades para disparar montado não reduzem abaixo do NH desta técnica. Exemplo: se tiver Arco 13 e Arquearia Montada 11, as penalidades nunca reduzem seu NH abaixo de 11.",
        dificuldade: "Difícil",
        basePericia: "arco",
        modificadorBase: -4,
        limiteMaximo: "arco",
        preRequisitos: [
            { tipo: 'pericia', id: 'arco', nivelMinimo: 4 },
            { tipo: 'grupo', grupo: 'Cavalgar' }
        ]
    }
};

// Funções do catálogo
function obterTodasTecnicas() {
    return Object.values(catalogoTecnicas);
}

function buscarTecnicaPorId(id) {
    return catalogoTecnicas[id] || null;
}

// ===== FUNÇÕES DE INTERFACE =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container #lista-tecnicas não encontrado!");
        return;
    }
    
    const tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis.filter(tecnica => {
        if (estadoTecnicas.filtroAtivo === 'medio-tecnicas' && tecnica.dificuldade !== 'Média') return false;
        if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas' && tecnica.dificuldade !== 'Difícil') return false;
        
        if (estadoTecnicas.buscaAtiva) {
            const busca = estadoTecnicas.buscaAtiva.toLowerCase();
            return tecnica.nome.toLowerCase().includes(busca) ||
                   tecnica.descricao.toLowerCase().includes(busca);
        }
        
        return true;
    });
    
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia" style="text-align: center; padding: 40px; color: #95a5a6;">
                <i class="fas fa-tools" style="font-size: 48px; margin-bottom: 15px;"></i>
                <div style="font-size: 18px; margin-bottom: 10px;">Nenhuma técnica disponível</div>
                <small>Verifique se você tem Arco nível 4 e alguma perícia de Cavalgar</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    tecnicasFiltradas.forEach(tecnica => {
        const disponivel = tecnica.disponivel;
        const jaAprendida = tecnica.jaAprendida;
        
        html += `
            <div class="pericia-item ${!disponivel ? 'item-indisponivel' : ''}"
                data-id="${tecnica.id}"
                data-tipo="tecnica"
                style="cursor: ${disponivel ? 'pointer' : 'not-allowed'};
                       opacity: ${disponivel ? '1' : '0.6'};
                       background: ${jaAprendida ? 'rgba(155, 89, 182, 0.15)' : 'rgba(50, 50, 65, 0.9)'};
                       border: 1px solid ${jaAprendida ? 'rgba(155, 89, 182, 0.4)' : 'rgba(255, 140, 0, 0.3)'};
                       border-radius: 8px;
                       padding: 15px;
                       margin-bottom: 10px;
                       transition: all 0.3s ease;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: ${jaAprendida ? '#9b59b6' : '#ffd700'}; font-size: 16px;">
                        ${tecnica.nome}
                        ${jaAprendida ? '<span style="color: #9b59b6; margin-left: 5px;">✓</span>' : ''}
                    </h4>
                    <div style="display: flex; gap: 10px;">
                        <span style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; 
                              color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                            ${tecnica.dificuldade}
                        </span>
                        <span style="background: #3498db; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                            NH ${tecnica.nhAtual}
                        </span>
                    </div>
                </div>
                
                <p style="margin: 10px 0; color: #ccc; font-size: 14px; line-height: 1.4;">${tecnica.descricao}</p>
                
                <!-- PRÉ-REQUISITOS -->
                <div style="font-size: 12px; color: #95a5a6; margin-top: 8px;">
                    <i class="fas fa-requirements"></i> Requer: Arco nível 4 + Cavalgar
                </div>
                
                ${!disponivel ? `
                    <div style="background: rgba(231, 76, 60, 0.1); border-left: 3px solid #e74c3c; 
                         padding: 8px 12px; margin-top: 10px; border-radius: 4px;">
                        <i class="fas fa-lock" style="color: #e74c3c;"></i> 
                        <span style="color: #e74c3c; margin-left: 5px;">${tecnica.motivoIndisponivel}</span>
                    </div>
                ` : ''}
                
                ${disponivel ? `
                    <div style="margin-top: 10px; font-size: 12px; color: #95a5a6; display: flex; align-items: center;">
                        <i class="fas fa-bullseye" style="margin-right: 5px;"></i>
                        Clique para ${jaAprendida ? 'melhorar' : 'aprender'} esta técnica
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adicionar eventos de clique
    const itens = container.querySelectorAll('.pericia-item');
    itens.forEach(item => {
        if (!item.classList.contains('item-indisponivel')) {
            item.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
                if (tecnica && tecnica.disponivel) {
                    abrirModalTecnica(tecnica);
                }
            });
        }
    });
}

// ===== INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    console.log("🚀 INICIALIZANDO SISTEMA DE TÉCNICAS");
    
    // Carregar catálogo
    window.catalogoTecnicas = {
        obterTodasTecnicas: obterTodasTecnicas,
        buscarTecnicaPorId: buscarTecnicaPorId,
        catalogo: catalogoTecnicas
    };
    
    console.log("✅ Catálogo de técnicas carregado!");
    
    // Carregar técnicas salvas
    carregarTecnicas();
    
    // Configurar eventos
    configurarEventListenersTecnicas();
    
    // Inicializar
    setTimeout(() => {
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
        console.log("✅ SISTEMA DE TÉCNICAS INICIALIZADO COM SUCESSO!");
    }, 1000);
}

// ===== FUNÇÕES DE SUPORTE =====
function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
            console.log(`📂 Carregadas ${estadoTecnicas.tecnicasAprendidas.length} técnicas salvas`);
        }
    } catch (e) {
        console.error("❌ Erro ao carregar técnicas:", e);
    }
}

function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
        console.log(`💾 Técnicas salvas: ${estadoTecnicas.tecnicasAprendidas.length}`);
    } catch (e) {
        console.error("❌ Erro ao salvar técnicas:", e);
    }
}

// ===== EXECUTAR =====
// Esperar a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado, aguardando aba de perícias...");
    
    // Observar quando a aba de perícias aparecer
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const abaPericias = document.getElementById('pericias');
                if (abaPericias && abaPericias.style.display !== 'none') {
                    console.log("🎯 Aba de perícias visível!");
                    
                    if (!window.sistemaTecnicasInicializado) {
                        setTimeout(() => {
                            inicializarSistemaTecnicas();
                            window.sistemaTecnicasInicializado = true;
                        }, 500);
                    }
                }
            }
        });
    });
    
    // Observar a aba de perícias
    const abaPericias = document.getElementById('pericias');
    if (abaPericias) {
        observer.observe(abaPericias, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
    }
    
    // Fallback: inicializar após 3 segundos
    setTimeout(() => {
        if (!window.sistemaTecnicasInicializado) {
            console.log("⏰ Inicializando por timeout...");
            inicializarSistemaTecnicas();
            window.sistemaTecnicasInicializado = true;
        }
    }, 3000);
});

// ===== EXPORTAR FUNÇÕES PARA TESTE =====
window.testarTecnicas = function() {
    console.log("🧪 TESTANDO SISTEMA DE TÉCNICAS");
    console.log("================================");
    
    // 1. Verificar estado
    console.log("1. Estado das técnicas:", estadoTecnicas);
    
    // 2. Verificar perícias
    console.log("2. Perícias do sistema:", window.estadoPericias);
    
    // 3. Testar NH do Arco
    console.log("3. NH do Arco:", obterNHArco());
    
    // 4. Testar técnica
    const tecnica = window.catalogoTecnicas.buscarTecnicaPorId('arquearia-montada');
    if (tecnica) {
        console.log("4. Técnica encontrada:", tecnica.nome);
        const requisitos = verificarPreRequisitos(tecnica);
        console.log("   Pré-requisitos:", requisitos.passou ? "✅ APROVADO" : "❌ REPROVADO");
    }
    
    console.log("================================");
};

// Adicionar funções ao window para acesso
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.atualizarTecnicasDisponiveis = atualizarTecnicasDisponiveis;
window.testarTecnicas = window.testarTecnicas;

console.log("✅ Módulo de técnicas pronto para uso!");