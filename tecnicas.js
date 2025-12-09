// ===== SISTEMA DE TÉCNICAS - VERSÃO CORRIGIDA =====
console.log("🎯 SISTEMA DE TÉCNICAS - VERSÃO FINAL");

// ===== 1. ESTADO DO SISTEMA =====
const estadoTecnicas = {
    aprendidas: [],
    disponiveis: [],
    pontosTotal: 0
};

// ===== 2. FUNÇÕES PRINCIPAIS =====

// 2.1 Obter NH REAL do Arco (CORRIGIDO)
function obterNHArcoReal() {
    console.log("🎯 Calculando NH REAL do Arco...");
    
    // PRIMEIRO: Tentar pegar NH DIRETO da perícia
    if (window.estadoPericias?.periciasAprendidas) {
        const arco = window.estadoPericias.periciasAprendidas.find(p => p.id === 'arco');
        if (arco && arco.nh) {
            console.log(`✅ NH do Arco (direto): ${arco.nh}`);
            return arco.nh;
        }
    }
    
    // SEGUNDO: Tentar do localStorage
    try {
        const salvo = localStorage.getItem('periciasAprendidas');
        if (salvo) {
            const pericias = JSON.parse(salvo);
            const arco = pericias.find(p => p.id === 'arco');
            if (arco && arco.nh) {
                console.log(`✅ NH do Arco (localStorage): ${arco.nh}`);
                return arco.nh;
            }
        }
    } catch (e) {}
    
    // TERCEIRO: Calcular (fallback)
    let dx = 10;
    let nivelArco = 0;
    
    if (window.estadoPericias?.periciasAprendidas) {
        const arco = window.estadoPericias.periciasAprendidas.find(p => p.id === 'arco');
        if (arco) nivelArco = arco.nivel || 0;
    }
    
    const nh = dx + nivelArco;
    console.log(`📊 NH calculado: ${nh} (DX ${dx} + nível ${nivelArco})`);
    return nh;
}

// 2.2 Verificar se tem Cavalgar (CORRIGIDO)
function verificarTemCavalgar() {
    console.log("🐎 Verificando Cavalgar...");
    
    // 1. No estadoPericias
    if (window.estadoPericias?.periciasAprendidas) {
        const cavalgar = window.estadoPericias.periciasAprendidas.find(p => 
            p.id.includes('cavalgar') || p.nome.includes('Cavalgar')
        );
        if (cavalgar) {
            console.log(`✅ Cavalgar encontrado: ${cavalgar.nome}`);
            return true;
        }
    }
    
    // 2. No localStorage
    try {
        const salvo = localStorage.getItem('periciasAprendidas');
        if (salvo) {
            const pericias = JSON.parse(salvo);
            const cavalgar = pericias.find(p => 
                p.id.includes('cavalgar') || p.nome.includes('Cavalgar')
            );
            if (cavalgar) {
                console.log(`✅ Cavalgar (localStorage): ${cavalgar.nome}`);
                return true;
            }
        }
    } catch (e) {}
    
    console.log("❌ Cavalgar NÃO encontrado");
    return false;
}

// 2.3 Verificar pré-requisitos (VERSÃO CORRIGIDA - GURPS CORRETO)
function verificarPreRequisitosTecnica() {
    console.log("🔍 Verificando pré-requisitos (GURPS CORRETO)...");
    
    const nhArco = obterNHArcoReal();
    const dx = 10; // DX base
    const nivelArco = nhArco - dx;
    
    // ⭐⭐⭐ CORREÇÃO CRÍTICA ⭐⭐⭐
    // NO GURPS:
    // - Default do Arco: DX-5
    // - Se DX = 10, default = 5 (nível -5)
    // - Nível -1 significa: Default + 4 pontos!
    // - Para técnica: precisa ter pelo menos a perícia (nível > -5)
    const temArcoNecessario = nivelArco > -5; // -1 > -5 = VERDADEIRO!
    
    const temCavalgar = verificarTemCavalgar();
    
    const pode = temArcoNecessario && temCavalgar;
    
    // Mensagem detalhada
    let motivo = '';
    let mensagemDetalhada = '';
    
    if (!temArcoNecessario) {
        motivo = `Arco precisa ter pelo menos 1 ponto (nível > -5)`;
        mensagemDetalhada = `❌ Arco: nível ${nivelArco} (Default DX-5 = -5)`;
    } else if (!temCavalgar) {
        motivo = 'Falta perícia de Cavalgar';
        mensagemDetalhada = `❌ Falta Cavalgar`;
    } else {
        motivo = 'OK';
        mensagemDetalhada = `✅ Arco: nível ${nivelArco} (Default + ${nivelArco + 5} pontos)`;
    }
    
    console.log(mensagemDetalhada);
    console.log(`Cavalgar: ${temCavalgar ? '✅' : '❌'}`);
    console.log(`Pode aprender: ${pode ? '✅ SIM' : '❌ NÃO'}`);
    
    return {
        pode: pode,
        motivo: motivo,
        nhArco: nhArco,
        nivelArco: nivelArco,
        mensagem: mensagemDetalhada
    };
}

// ===== 3. ADICIONAR TÉCNICA NA TELA =====
function adicionarTecnicaNaTela() {
    console.log("🖥️ Adicionando técnica na tela...");
    
    // A. Encontrar onde colocar
    let container = document.getElementById('lista-tecnicas');
    
    if (!container) {
        console.log("🔍 Procurando container...");
        
        // Procurar na seção de técnicas
        const secaoTecnicas = document.querySelector('.tecnicas-section, [class*="tecnica"]');
        if (secaoTecnicas) {
            const listas = secaoTecnicas.querySelectorAll('.catalog-list-pericias, .lista, .catalog-list');
            container = listas[0] || secaoTecnicas.querySelector('div');
        }
    }
    
    if (!container) {
        console.error("❌ Não encontrei onde colocar!");
        return;
    }
    
    console.log("✅ Container encontrado!");
    
    // B. Pegar técnica do catálogo
    let tecnica = null;
    if (window.catalogoTecnicas) {
        tecnica = window.catalogoTecnicas.buscarTecnicaPorId('arquearia-montada');
    }
    
    if (!tecnica) {
        // Fallback: criar técnica básica
        tecnica = {
            id: 'arquearia-montada',
            nome: '🏹 Arquearia Montada',
            descricao: 'Usar arco enquanto cavalga. Penalidades para disparar montado não reduzem abaixo do NH desta técnica.',
            dificuldade: 'Difícil'
        };
    }
    
    // C. Verificar se pode aprender
    const prereq = verificarPreRequisitosTecnica();
    const nhBase = prereq.nhArco + (tecnica.modificadorBase || -4);
    
    // D. Criar HTML
    const html = `
        <div class="pericia-item ${!prereq.pode ? 'item-indisponivel' : ''}"
             style="background: rgba(50, 50, 65, 0.95);
                    border: 2px solid ${prereq.pode ? '#27ae60' : '#e74c3c'};
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 15px;
                    cursor: ${prereq.pode ? 'pointer' : 'not-allowed'};
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);"
             onclick="${prereq.pode ? 'comprarTecnicaModal()' : ''}">
            
            <!-- CABEÇALHO -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div>
                    <h3 style="color: ${prereq.pode ? '#ffd700' : '#95a5a6'}; margin: 0 0 5px 0; font-size: 18px;">
                        ${tecnica.nome}
                        ${prereq.pode ? '✅' : '🔒'}
                    </h3>
                    <div style="font-size: 12px; color: #95a5a6;">
                        ${tecnica.dificuldade === 'Difícil' ? '● Difícil' : '● Média'}
                    </div>
                </div>
                <div style="background: ${prereq.pode ? '#27ae60' : '#e74c3c'}; 
                      color: white; padding: 6px 12px; border-radius: 15px; font-size: 14px; font-weight: bold;">
                    NH ${nhBase}
                </div>
            </div>
            
            <!-- DESCRIÇÃO -->
            <p style="color: #ccc; margin: 10px 0; line-height: 1.5; font-size: 14px;">
                ${tecnica.descricao}
            </p>
            
            <!-- INFORMAÇÕES -->
            <div style="display: flex; gap: 8px; margin-top: 15px; flex-wrap: wrap;">
                <span style="background: #3498db; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    Arco-4
                </span>
                <span style="background: ${prereq.pode ? '#2ecc71' : '#e74c3c'}; 
                      color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${prereq.pode ? '✅ Disponível' : '🔒 Bloqueada'}
                </span>
            </div>
            
            <!-- MENSAGEM DE STATUS -->
            ${!prereq.pode ? `
                <div style="background: rgba(231, 76, 60, 0.1); padding: 10px; border-radius: 6px; margin-top: 12px; border-left: 3px solid #e74c3c;">
                    <div style="color: #e74c3c; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-info-circle"></i>
                        <span>${prereq.mensagem || prereq.motivo}</span>
                    </div>
                </div>
            ` : `
                <div style="background: rgba(39, 174, 96, 0.1); padding: 10px; border-radius: 6px; margin-top: 12px; border-left: 3px solid #27ae60;">
                    <div style="color: #27ae60; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-check-circle"></i>
                        <span>✅ Pré-requisitos atendidos! Clique para comprar.</span>
                    </div>
                </div>
            `}
        </div>
    `;
    
    // E. Adicionar
    container.innerHTML = html;
    console.log("✅ Técnica adicionada na tela!");
}

// ===== 4. FUNÇÕES DE COMPRA =====
function comprarTecnicaModal() {
    const nhArco = obterNHArcoReal();
    const nhBase = nhArco - 4;
    
    alert(`🏹 Arquearia Montada\n\n` +
          `Seu NH em Arco: ${nhArco}\n` +
          `Base da técnica: ${nhBase} (Arco-4)\n\n` +
          `Para comprar esta técnica:\n` +
          `- +1 nível: 2 pontos (NH ${nhBase + 1})\n` +
          `- +2 níveis: 3 pontos (NH ${nhBase + 2})\n` +
          `- +3 níveis: 4 pontos (NH ${nhBase + 3})\n` +
          `- Máximo: NH ${nhArco} (não pode exceder seu NH em Arco)`);
}

// ===== 5. INICIALIZAR SISTEMA =====
function inicializarSistemaTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Carregar técnicas aprendidas salvas
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.aprendidas = JSON.parse(salvo);
            console.log(`📂 Carregadas ${estadoTecnicas.aprendidas.length} técnicas`);
        }
    } catch (e) {
        console.warn("Não foi possível carregar técnicas salvas:", e);
    }
    
    // Esperar um pouco e adicionar na tela
    setTimeout(() => {
        adicionarTecnicaNaTela();
        console.log("✅ Sistema de técnicas inicializado!");
    }, 1000);
}

// ===== 6. CARREGAR AUTOMATICAMENTE =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado, preparando técnicas...");
    
    // Esperar aba de perícias aparecer
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const abaPericias = document.getElementById('pericias');
                if (abaPericias && abaPericias.style.display !== 'none') {
                    console.log("🎯 Aba de perícias visível!");
                    
                    if (!window.sistemaTecnicasInicializado) {
                        setTimeout(inicializarSistemaTecnicas, 800);
                        window.sistemaTecnicasInicializado = true;
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

// ===== 7. FUNÇÕES DE TESTE =====
window.testarSistemaTecnicas = function() {
    console.log("🧪 TESTE DO SISTEMA DE TÉCNICAS");
    console.log("=================================");
    
    // Testar pré-requisitos
    const prereq = verificarPreRequisitosTecnica();
    console.log("1. Pré-requisitos:", prereq);
    
    // Mostrar NH
    console.log("2. NH Arco:", obterNHArcoReal());
    
    // Verificar container
    const container = document.getElementById('lista-tecnicas');
    console.log("3. Container encontrado?", container ? "✅ SIM" : "❌ NÃO");
    
    console.log("=================================");
};

// Exportar funções
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.adicionarTecnicaNaTela = adicionarTecnicaNaTela;
window.comprarTecnicaModal = comprarTecnicaModal;

console.log("✅ tecnicas.js carregado e pronto!");