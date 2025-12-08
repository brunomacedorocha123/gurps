// ===== SISTEMA DE TÉCNICAS - VERSÃO 1.2 =====
// Usando o catálogo de perícias existente

console.log("🏹 SISTEMA DE TÉCNICAS - INICIALIZANDO (USANDO CATÁLOGO)");

// ===== ESTADO DO SISTEMA =====
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
    tecnicaSelecionada: null,
    niveisCompradosSelecionados: 0
};

// ===== CONSTANTES DO SISTEMA =====
const TABELA_CUSTO = {
    'Difícil': [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    'Média':   [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
};

// ===== FUNÇÕES PRINCIPAIS - VERSÃO CORRIGIDA =====

// 1. FUNÇÃO MELHORADA: BUSCAR PERÍCIA NO SISTEMA
function buscarPericiaNoSistema(idPericia) {
    console.log(`🔍 Buscando perícia: ${idPericia}`);
    
    // PRIMEIRO: Tentar no estado atual (perícias aprendidas)
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        // Buscar por ID exato
        const periciaNoEstado = window.estadoPericias.periciasAprendidas.find(p => 
            p.id === idPericia || 
            (p.id && p.id.includes(idPericia))
        );
        
        if (periciaNoEstado) {
            console.log(`✅ Perícia encontrada no estado: ${periciaNoEstado.nome} (nível ${periciaNoEstado.nivel})`);
            return periciaNoEstado;
        }
        
        // Buscar por nome
        const periciaPorNome = window.estadoPericias.periciasAprendidas.find(p => 
            p.nome && p.nome.toLowerCase().includes(idPericia.toLowerCase())
        );
        
        if (periciaPorNome) {
            console.log(`✅ Perícia encontrada por nome: ${periciaPorNome.nome}`);
            return periciaPorNome;
        }
    }
    
    // SEGUNDO: Tentar no catálogo (se não aprendida ainda)
    if (window.buscarPericiaPorId) {
        const periciaCatalogo = window.buscarPericiaPorId(idPericia);
        if (periciaCatalogo) {
            console.log(`ℹ️ Perícia no catálogo: ${periciaCatalogo.nome} (não aprendida ainda)`);
            // Retornamos null porque não está aprendida
            return null;
        }
    }
    
    // TERCEIRO: Buscar em grupos (para Cavalgar)
    if (window.catalogoPericias) {
        // Procurar em todos os grupos
        for (const categoria in window.catalogoPericias) {
            for (const grupo in window.catalogoPericias[categoria]) {
                const dadosGrupo = window.catalogoPericias[categoria][grupo];
                
                if (dadosGrupo.pericias && Array.isArray(dadosGrupo.pericias)) {
                    const periciaNoGrupo = dadosGrupo.pericias.find(p => 
                        p.id === idPericia || 
                        p.nome.toLowerCase().includes(idPericia.toLowerCase())
                    );
                    
                    if (periciaNoGrupo) {
                        console.log(`ℹ️ Perícia no grupo ${grupo}: ${periciaNoGrupo.nome}`);
                        // Verificar se está aprendida
                        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
                            const aprendida = window.estadoPericias.periciasAprendidas.find(p => 
                                p.id === periciaNoGrupo.id
                            );
                            return aprendida || null;
                        }
                    }
                }
            }
        }
    }
    
    console.warn(`⚠️ Perícia "${idPericia}" não encontrada em nenhum lugar`);
    return null;
}

// 2. VERIFICAR SE TEM ARCO NÍVEL 4
function verificarArcoNivel4() {
    const periciaArco = buscarPericiaNoSistema('arco');
    
    if (!periciaArco) {
        return { tem: false, nivel: 0, motivo: "Não possui a perícia Arco" };
    }
    
    // Calcular nível atual do Arco
    const atributoBase = periciaArco.atributo === 'DX' ? 
        (parseInt(document.getElementById('DX').value) || 10) : 10;
    const nivelAtualArco = periciaArco.nivel || 0;
    
    // NH atual = atributo + nível
    const nhAtual = atributoBase + nivelAtualArco;
    // Nível mínimo necessário para Arquearia Montada
    const nivelNecessario = 4; // Arco-4 significa nível 4 em Arco
    
    console.log(`🎯 Arco: NH ${nhAtual} (DX ${atributoBase} + nível ${nivelAtualArco})`);
    
    if (nivelAtualArco >= nivelNecessario) {
        return { 
            tem: true, 
            nivel: nivelAtualArco,
            nh: nhAtual,
            motivo: `✅ Arco nível ${nivelAtualArco} (mínimo: ${nivelNecessario})`
        };
    } else {
        return { 
            tem: false, 
            nivel: nivelAtualArco,
            motivo: `❌ Arco precisa nível ${nivelNecessario} (atual: ${nivelAtualArco})`
        };
    }
}

// 3. VERIFICAR SE TEM CAVALGAR (qualquer especialização)
function verificarCavalgar() {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        return { tem: false, especializacoes: [], motivo: "Sistema de perícias não carregado" };
    }
    
    // Buscar TODAS as perícias aprendidas que são Cavalgar
    const cavalgars = window.estadoPericias.periciasAprendidas.filter(p => 
        p.id.includes('cavalgar') || 
        p.nome.toLowerCase().includes('cavalgar') ||
        (p.grupo && p.grupo.toLowerCase() === 'cavalgar')
    );
    
    if (cavalgars.length > 0) {
        const especializacoes = cavalgars.map(c => c.nome || c.id);
        return { 
            tem: true, 
            especializacoes: especializacoes,
            motivo: `✅ Cavalgar: ${especializacoes.join(', ')}`
        };
    } else {
        return { 
            tem: false, 
            especializacoes: [],
            motivo: "❌ Precisa de alguma perícia de Cavalgar"
        };
    }
}

// 4. VERIFICAR PRÉ-REQUISITOS CORRETAMENTE
function verificarPreRequisitosTecnica(tecnica) {
    console.log(`📋 Verificando pré-requisitos para: ${tecnica.nome}`);
    
    const resultados = {
        passou: true,
        motivos: []
    };
    
    // VERIFICAR ARCO
    if (tecnica.basePericia === 'arco') {
        const arco = verificarArcoNivel4();
        resultados.passou = resultados.passou && arco.tem;
        resultados.motivos.push(arco.motivo);
        
        if (!arco.tem) {
            console.log(`❌ Falta: ${arco.motivo}`);
        } else {
            console.log(`✅ ${arco.motivo}`);
        }
    }
    
    // VERIFICAR CAVALGAR
    const cavalgar = verificarCavalgar();
    resultados.passou = resultados.passou && cavalgar.tem;
    resultados.motivos.push(cavalgar.motivo);
    
    if (!cavalgar.tem) {
        console.log(`❌ Falta: ${cavalgar.motivo}`);
    } else {
        console.log(`✅ ${cavalgar.motivo}`);
    }
    
    console.log(`📊 Resultado: ${resultados.passou ? '✅ PRÉ-REQUISITOS OK' : '❌ FALTAM PRÉ-REQUISITOS'}`);
    return resultados;
}

// 5. CALCULAR NH DA PERÍCIA BASE CORRETAMENTE
function calcularNHPericiaBase(idPericia) {
    console.log(`🧮 Calculando NH para: ${idPericia}`);
    
    const pericia = buscarPericiaNoSistema(idPericia);
    
    if (!pericia) {
        // Se não tem a perícia, usar valor do atributo
        let atributoBase = 10;
        if (idPericia === 'arco') {
            atributoBase = parseInt(document.getElementById('DX').value) || 10;
        }
        console.log(`⚠️ ${idPericia} não aprendido, usando atributo base: ${atributoBase}`);
        return atributoBase;
    }
    
    // Obter atributo base
    let atributoBase;
    switch(pericia.atributo) {
        case 'DX': atributoBase = parseInt(document.getElementById('DX').value) || 10; break;
        case 'IQ': atributoBase = parseInt(document.getElementById('IQ').value) || 10; break;
        case 'HT': atributoBase = parseInt(document.getElementById('HT').value) || 10; break;
        case 'PERC': atributoBase = parseInt(document.getElementById('PERC').value) || 10; break;
        default: atributoBase = 10;
    }
    
    const nivel = pericia.nivel || 0;
    const nh = atributoBase + nivel;
    
    console.log(`✅ NH ${pericia.nome || idPericia}: ${nh} (${pericia.atributo} ${atributoBase} + nível ${nivel})`);
    return nh;
}

// 6. FUNÇÃO DE LOG PARA DEBUG
function debugPericias() {
    console.log("=== DEBUG DE PERÍCIAS ===");
    
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        console.log("📚 Perícias aprendidas:");
        window.estadoPericias.periciasAprendidas.forEach((p, i) => {
            console.log(`  ${i+1}. ${p.id} - "${p.nome}" (nível ${p.nivel})`);
        });
    } else {
        console.log("❌ estadoPericias não disponível");
    }
    
    // Testar busca de Arco
    const arco = buscarPericiaNoSistema('arco');
    console.log(`🔍 Busca por 'arco':`, arco ? `Encontrado: ${arco.nome}` : "Não encontrado");
    
    // Testar Cavalgar
    const cavalgar = verificarCavalgar();
    console.log(`🐎 Tem Cavalgar?`, cavalgar);
}

// 7. ATUALIZAR TÉCNICAS DISPONÍVEIS (CORRIGIDA)
function atualizarTecnicasDisponiveis() {
    console.log("🔄 Atualizando técnicas disponíveis...");
    debugPericias(); // DEBUG
    
    if (!window.catalogoTecnicas || !window.catalogoTecnicas.obterTodasTecnicas) {
        console.error("❌ Catálogo de técnicas não carregado!");
        estadoTecnicas.tecnicasDisponiveis = [];
        renderizarCatalogoTecnicas();
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    console.log(`📋 Técnicas no catálogo: ${todasTecnicas.length}`);
    
    estadoTecnicas.tecnicasDisponiveis = todasTecnicas.map(tecnica => {
        console.log(`\n🔍 Processando: ${tecnica.nome}`);
        
        // Verificar pré-requisitos
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        
        // Verificar se já aprendeu
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        // Calcular NH base
        let nhBase = 0;
        let nhPericiaBase = 0;
        
        if (tecnica.basePericia) {
            nhPericiaBase = calcularNHPericiaBase(tecnica.basePericia);
            nhBase = nhPericiaBase + tecnica.modificadorBase;
            
            // Adicionar níveis comprados se já aprendida
            if (jaAprendida && jaAprendida.niveisComprados) {
                nhBase += jaAprendida.niveisComprados;
            }
            
            // Limitar ao máximo
            if (tecnica.limiteMaximo) {
                const nhLimite = calcularNHPericiaBase(tecnica.limiteMaximo);
                nhBase = Math.min(nhBase, nhLimite);
            }
        }
        
        const resultado = {
            ...tecnica,
            disponivel: verificacao.passou,
            nhAtual: nhBase,
            nhPericiaBase: nhPericiaBase,
            motivoIndisponivel: verificacao.motivos.join(' | '),
            jaAprendida: !!jaAprendida,
            niveisComprados: jaAprendida ? jaAprendida.niveisComprados || 0 : 0,
            custoTotal: jaAprendida ? jaAprendida.custoTotal || 0 : 0
        };
        
        console.log(`📊 Resultado: ${resultado.disponivel ? '✅ Disponível' : '❌ Indisponível'}`);
        console.log(`   Motivo: ${resultado.motivoIndisponivel}`);
        
        return resultado;
    });
    
    renderizarCatalogoTecnicas();
}

// ===== RESTANTE DO CÓDIGO PERMANECE IGUAL =====
// [Manter todas as outras funções do código anterior, apenas substituir as funções acima]

// 8. Calcular custo da técnica (mantém igual)
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima < 0) return 0;
    
    const tabela = TABELA_CUSTO[dificuldade];
    if (!tabela) return 0;
    
    return tabela[Math.min(niveisAcima, tabela.length - 1)] || 0;
}

// 9. Renderizar catálogo (mantém igual)
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container #lista-tecnicas não encontrado!");
        return;
    }
    
    // [MESMO CÓDIGO DE RENDERIZAÇÃO ANTERIOR]
    // ... (copiar do código anterior)
}

// 10. Abrir modal (mantém igual)
function abrirModalTecnica(tecnica) {
    // [MESMO CÓDIGO ANTERIOR]
    // ... (copiar do código anterior)
}

// 11. Comprar técnica (mantém igual)
function comprarTecnica() {
    // [MESMO CÓDIGO ANTERIOR]
    // ... (copiar do código anterior)
}

// ===== INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    console.log("🚀 INICIALIZANDO SISTEMA DE TÉCNICAS (VERSÃO CORRIGIDA)...");
    
    // Carregar técnicas salvas
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
            console.log(`📂 Carregadas ${estadoTecnicas.tecnicasAprendidas.length} técnicas salvas`);
        }
    } catch (e) {
        console.error("❌ Erro ao carregar técnicas:", e);
    }
    
    // Configurar eventos
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoTecnicas.buscaAtiva = this.value;
            renderizarCatalogoTecnicas();
        });
    }
    
    // Filtros
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const filtro = this.getAttribute('data-filtro');
            estadoTecnicas.filtroAtivo = filtro;
            
            document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            renderizarCatalogoTecnicas();
        });
    });
    
    // Observar mudanças nas perícias
    let ultimoEstadoPericias = '';
    setInterval(() => {
        if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) return;
        
        const estadoAtual = JSON.stringify(window.estadoPericias.periciasAprendidas);
        if (estadoAtual !== ultimoEstadoPericias) {
            console.log("🔄 Perícias alteradas, atualizando técnicas...");
            ultimoEstadoPericias = estadoAtual;
            atualizarTecnicasDisponiveis();
            atualizarEstatisticasTecnicas();
        }
    }, 1000);
    
    // Inicializar
    setTimeout(() => {
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
        console.log("✅ SISTEMA DE TÉCNICAS INICIALIZADO!");
    }, 1500);
}

// ===== FUNÇÕES AUXILIARES (copiar do código anterior) =====

function renderizarTecnicasAprendidas() {
    // [Copiar função do código anterior]
}

function atualizarEstatisticasTecnicas() {
    // [Copiar função do código anterior]
}

function fecharModalTecnica() {
    // [Copiar função do código anterior]
}

function removerTecnica(id) {
    // [Copiar função do código anterior]
}

function salvarTecnicas() {
    // [Copiar função do código anterior]
}

// ===== EXPORTAR FUNÇÕES =====
window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;
window.atualizarTecnicasDisponiveis = atualizarTecnicasDisponiveis;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.debugPericias = debugPericias; // Para debug

console.log("🎯 MÓDULO DE TÉCNICAS CORRIGIDO CARREGADO!");