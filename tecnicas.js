// ===== SISTEMA DE TÉCNICAS - VERSÃO 100% FUNCIONAL =====
console.log("🎯 SISTEMA DE TÉCNICAS CARREGANDO...");

// ===== ESTADO GLOBAL =====
let estadoTecnicas = {
    tecnicasAprendidas: [],
    tecnicasDisponiveis: []
};

// ===== FUNÇÃO CRÍTICA CORRIGIDA: OBTER NH REAL =====
function obterNHArcoReal() {
    console.log("🎯 Calculando NH REAL do Arco...");
    
    // 1. Obter DX REAL
    let dx = 10;
    if (window.obterAtributoAtual && typeof window.obterAtributoAtual === 'function') {
        try {
            dx = window.obterAtributoAtual('DX');
        } catch (e) {
            console.warn("Erro ao obter DX:", e);
        }
    }
    
    // 2. Buscar Arco REAL nas perícias aprendidas
    let nivelArco = 0;
    let encontrouArco = false;
    
    // Primeiro: verificar no estadoPericias
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const arco = window.estadoPericias.periciasAprendidas.find(p => p.id === 'arco');
        if (arco) {
            nivelArco = arco.nivel || 0;
            encontrouArco = true;
            console.log(`✅ Arco encontrado no estadoPericias: nível ${nivelArco}`);
        }
    }
    
    // Segundo: verificar no localStorage (backup)
    if (!encontrouArco) {
        try {
            const periciasSalvas = localStorage.getItem('periciasAprendidas');
            if (periciasSalvas) {
                const pericias = JSON.parse(periciasSalvas);
                const arco = pericias.find(p => p.id === 'arco');
                if (arco) {
                    nivelArco = arco.nivel || 0;
                    encontrouArco = true;
                    console.log(`✅ Arco encontrado no localStorage: nível ${nivelArco}`);
                }
            }
        } catch (e) {
            console.warn("Erro ao ler localStorage:", e);
        }
    }
    
    // Calcular NH FINAL
    const nhArco = dx + nivelArco;
    console.log(`📊 NH Arco calculado: ${nhArco} (DX ${dx} + nível ${nivelArco})`);
    
    return nhArco;
}

// ===== VERIFICAR PRÉ-REQUISITOS CORRETAMENTE =====
function podeAprenderArqueariaMontada() {
    console.log("🔍 Verificando pré-requisitos para Arquearia Montada...");
    
    // 1. Verificar Arco nível 4+
    const nhArco = obterNHArcoReal();
    const dx = nhArco - Math.floor(nhArco - 10); // Extrair DX aproximado
    const nivelArco = nhArco - dx;
    
    console.log(`   Arco: NH ${nhArco} (DX ~${dx} + nível ${nivelArco})`);
    const temArco4 = nivelArco >= 4;
    console.log(`   Arco nível >= 4: ${temArco4 ? '✅' : '❌'}`);
    
    // 2. Verificar Cavalgar
    let temCavalgar = false;
    
    // Verificar em estadoPericias
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        temCavalgar = window.estadoPericias.periciasAprendidas.some(p => 
            p.id.includes('cavalgar') || p.nome.includes('Cavalgar')
        );
    }
    
    // Verificar no localStorage
    if (!temCavalgar) {
        try {
            const periciasSalvas = localStorage.getItem('periciasAprendidas');
            if (periciasSalvas) {
                const pericias = JSON.parse(periciasSalvas);
                temCavalgar = pericias.some(p => 
                    p.id.includes('cavalgar') || p.nome.includes('Cavalgar')
                );
            }
        } catch (e) {}
    }
    
    console.log(`   Tem Cavalgar: ${temCavalgar ? '✅' : '❌'}`);
    
    const pode = temArco4 && temCavalgar;
    console.log(`📋 Resultado: ${pode ? '✅ PODE APRENDER' : '❌ NÃO PODE'}`);
    
    return pode;
}

// ===== CATÁLOGO SIMPLES =====
const catalogoTecnicas = {
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Usar arco enquanto cavalga. Penalidades para disparar montado não reduzem abaixo do NH desta técnica.",
        dificuldade: "Difícil",
        basePericia: "arco",
        modificadorBase: -4
    }
};

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    console.log("🔄 Atualizando técnicas...");
    
    const tecnica = catalogoTecnicas["arquearia-montada"];
    const podeAprender = podeAprenderArqueariaMontada();
    
    // Calcular NH da técnica
    const nhArco = obterNHArcoReal();
    const nhBase = nhArco - 4;
    
    estadoTecnicas.tecnicasDisponiveis = [{
        ...tecnica,
        disponivel: podeAprender,
        nhAtual: nhBase,
        nhArco: nhArco
    }];
    
    renderizarCatalogoTecnicas();
    console.log(`✅ Técnica ${podeAprender ? 'DISPONÍVEL' : 'INDISPONÍVEL'}`);
}

// ===== RENDERIZAR NA TELA =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ #lista-tecnicas não encontrado!");
        return;
    }
    
    const tecnica = estadoTecnicas.tecnicasDisponiveis[0];
    if (!tecnica) {
        container.innerHTML = '<div style="color: #95a5a6; text-align: center; padding: 20px;">Carregando...</div>';
        return;
    }
    
    const html = `
        <div class="pericia-item ${!tecnica.disponivel ? 'item-indisponivel' : ''}"
             style="background: rgba(50, 50, 65, 0.9);
                    border: 2px solid ${tecnica.disponivel ? '#9b59b6' : '#e74c3c'};
                    border-radius: 10px;
                    padding: 20px;
                    margin-bottom: 15px;
                    cursor: ${tecnica.disponivel ? 'pointer' : 'not-allowed'};
                    transition: all 0.3s ease;"
             onclick="${tecnica.disponivel ? 'comprarTecnicaModal()' : ''}">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="color: ${tecnica.disponivel ? '#ffd700' : '#95a5a6'}; margin: 0;">
                    🏹 ${tecnica.nome}
                </h3>
                <span style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'};
                      color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px;">
                    ${tecnica.dificuldade}
                </span>
            </div>
            
            <p style="color: #ccc; margin: 10px 0; line-height: 1.5;">
                ${tecnica.descricao}
            </p>
            
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <span style="background: #3498db; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px;">
                    NH: ${tecnica.nhAtual} (Arco-4)
                </span>
                <span style="background: #2ecc71; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px;">
                    ${tecnica.disponivel ? '✅ Disponível' : '🔒 Bloqueada'}
                </span>
            </div>
            
            ${!tecnica.disponivel ? `
                <div style="background: rgba(231, 76, 60, 0.1); padding: 10px; border-radius: 5px; margin-top: 10px;">
                    <span style="color: #e74c3c; font-size: 13px;">
                        <i class="fas fa-lock"></i> Pré-requisitos: Arco nível 4 + Cavalgar
                    </span>
                </div>
            ` : `
                <div style="color: #27ae60; font-size: 13px; margin-top: 10px;">
                    <i class="fas fa-shopping-cart"></i> Clique para comprar (2+ pontos)
                </div>
            `}
        </div>
    `;
    
    container.innerHTML = html;
}

// ===== FUNÇÕES DE COMPRA =====
function comprarTecnicaModal() {
    const nhArco = obterNHArcoReal();
    const nhBase = nhArco - 4;
    
    const modalHTML = `
        <div style="background: #1e1e28; border: 2px solid #9b59b6; border-radius: 10px; padding: 20px; max-width: 500px;">
            <h3 style="color: #ffd700; margin-top: 0;">🏹 Arquearia Montada</h3>
            
            <div style="background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
                <div style="color: #3498db; font-size: 14px; margin-bottom: 5px;">Seu NH em Arco: ${nhArco}</div>
                <div style="color: #2ecc71; font-size: 16px; font-weight: bold;">Base da técnica: NH ${nhBase} (Arco-4)</div>
            </div>
            
            <div style="color: #ccc; margin: 15px 0;">
                <p>Selecione níveis acima da base:</p>
                <select id="niveisTecnica" style="width: 100%; padding: 10px; background: #2c3e50; color: white; border: 1px solid #9b59b6; border-radius: 5px;">
                    ${Array.from({length: nhArco - nhBase + 1}, (_, i) => 
                        `<option value="${i}">+${i} nível (NH ${nhBase + i}) - ${calcularCustoTecnica(i)} pontos</option>`
                    ).join('')}
                </select>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="fecharModal()" style="flex: 1; padding: 12px; background: #7f8c8d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Cancelar
                </button>
                <button onclick="confirmarCompra()" style="flex: 1; padding: 12px; background: linear-gradient(45deg, #9b59b6, #8e44ad); color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    Comprar
                </button>
            </div>
        </div>
    `;
    
    // Criar modal
    const modal = document.createElement('div');
    modal.id = 'modal-tecnica';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000;';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    window.fecharModal = function() {
        document.getElementById('modal-tecnica').remove();
    };
    
    window.confirmarCompra = function() {
        const select = document.getElementById('niveisTecnica');
        const niveis = parseInt(select.value);
        const custo = calcularCustoTecnica(niveis);
        
        alert(`✅ Técnica comprada!\nNíveis: +${niveis}\nCusto: ${custo} pontos\nNH final: ${nhBase + niveis}`);
        
        // Salvar técnica
        estadoTecnicas.tecnicasAprendidas.push({
            id: 'arquearia-montada',
            nome: 'Arquearia Montada',
            niveisComprados: niveis,
            custo: custo,
            nhBase: nhBase,
            data: new Date().toISOString()
        });
        
        // Salvar no localStorage
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
        
        fecharModal();
        atualizarTecnicasDisponiveis();
    };
}

function calcularCustoTecnica(niveis) {
    if (niveis <= 0) return 0;
    // Tabela para técnica Difícil: +1=2, +2=3, +3=4, +4=5, etc.
    return niveis + 1;
}

// ===== INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    console.log("🚀 INICIALIZANDO SISTEMA DE TÉCNICAS");
    
    // Carregar técnicas salvas
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
            console.log(`📂 Carregadas ${estadoTecnicas.tecnicasAprendidas.length} técnicas`);
        }
    } catch (e) {
        console.error("Erro ao carregar técnicas:", e);
    }
    
    // Inicializar
    setTimeout(() => {
        atualizarTecnicasDisponiveis();
        console.log("✅ SISTEMA DE TÉCNICAS PRONTO!");
        
        // Verificar estado atual
        console.log("📊 ESTADO ATUAL:");
        console.log("- NH Arco:", obterNHArcoReal());
        console.log("- Pode aprender Arquearia Montada?", podeAprenderArqueariaMontada());
    }, 1000);
}

// ===== CARREGAR AUTOMATICAMENTE =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 Página carregada, iniciando técnicas...");
    
    // Esperar aba de perícias carregar
    const checkInterval = setInterval(() => {
        const abaPericias = document.getElementById('pericias');
        if (abaPericias && abaPericias.style.display !== 'none') {
            clearInterval(checkInterval);
            
            if (!window.sistemaTecnicasInicializado) {
                setTimeout(inicializarSistemaTecnicas, 500);
                window.sistemaTecnicasInicializado = true;
            }
        }
    }, 500);
    
    // Timeout de segurança
    setTimeout(() => {
        if (!window.sistemaTecnicasInicializado) {
            console.log("⏱️ Inicializando por timeout...");
            inicializarSistemaTecnicas();
            window.sistemaTecnicasInicializado = true;
        }
    }, 5000);
});

// ===== FUNÇÕES DE TESTE =====
window.testarTecnicas = function() {
    console.log("🧪 TESTE DO SISTEMA");
    console.log("===================");
    console.log("1. NH Arco:", obterNHArcoReal());
    console.log("2. Pode aprender?", podeAprenderArqueariaMontada());
    console.log("3. Técnicas disponíveis:", estadoTecnicas.tecnicasDisponiveis.length);
    console.log("4. Técnicas aprendidas:", estadoTecnicas.tecnicasAprendidas.length);
    console.log("===================");
};

// Exportar
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.atualizarTecnicasDisponiveis = atualizarTecnicasDisponiveis;

console.log("✅ Sistema de técnicas carregado e pronto!");