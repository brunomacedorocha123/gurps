// ===== SISTEMA DE TÉCNICAS - VERSÃO SEM CONFLITO =====
console.log("⚙️ SISTEMA DE TÉCNICAS INICIANDO...");

// ===== 1. ESTADO DO SISTEMA =====
const estadoTecnicasSistema = {
    aprendidas: [],
    disponiveis: [],
    pontosTotal: 0
};

// ===== 2. FUNÇÕES PRINCIPAIS =====

// 2.1 Obter NH do Arco REAL
function obterNHArcoReal() {
    console.log("🎯 Calculando NH do Arco...");
    
    let dx = 10;
    let nivelArco = 0;
    
    // A. Pegar DX
    if (window.obterAtributoAtual) {
        try {
            dx = window.obterAtributoAtual('DX') || 10;
        } catch (e) {
            console.warn("Erro ao pegar DX:", e);
        }
    }
    
    // B. Buscar Arco
    if (window.estadoPericias?.periciasAprendidas) {
        const arco = window.estadoPericias.periciasAprendidas.find(p => p.id === 'arco');
        if (arco) nivelArco = arco.nivel || 0;
    }
    
    // C. Backup localStorage
    if (nivelArco === 0) {
        try {
            const salvo = localStorage.getItem('periciasAprendidas');
            if (salvo) {
                const pericias = JSON.parse(salvo);
                const arco = pericias.find(p => p.id === 'arco');
                if (arco) nivelArco = arco.nivel || 0;
            }
        } catch (e) {}
    }
    
    const nh = dx + nivelArco;
    console.log(`NH Arco: ${nh} (DX ${dx} + nível ${nivelArco})`);
    return nh;
}

// 2.2 Verificar se tem Cavalgar
function verificarTemCavalgar() {
    if (window.estadoPericias?.periciasAprendidas) {
        const tem = window.estadoPericias.periciasAprendidas.some(p => 
            p.id.includes('cavalgar') || p.nome.includes('Cavalgar')
        );
        if (tem) return true;
    }
    
    try {
        const salvo = localStorage.getItem('periciasAprendidas');
        if (salvo) {
            const pericias = JSON.parse(salvo);
            return pericias.some(p => 
                p.id.includes('cavalgar') || p.nome.includes('Cavalgar')
            );
        }
    } catch (e) {}
    
    return false;
}

// 2.3 Verificar pré-requisitos
function verificarPreRequisitosTecnica() {
    const nhArco = obterNHArcoReal();
    const dx = 10;
    const nivelArco = nhArco - dx;
    
    const temArco4 = nivelArco >= 4;
    const temCavalgar = verificarTemCavalgar();
    
    return {
        pode: temArco4 && temCavalgar,
        motivo: !temArco4 ? `Arco nível ${nivelArco} < 4` : 
                !temCavalgar ? 'Falta Cavalgar' : 'OK',
        nhArco: nhArco,
        nivelArco: nivelArco
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
            const listas = secaoTecnicas.querySelectorAll('.catalog-list-pericias, .lista');
            container = listas[0] || secaoTecnicas;
        }
    }
    
    if (!container) {
        console.error("❌ Não encontrei onde colocar!");
        return;
    }
    
    console.log("✅ Container:", container.id || container.className);
    
    // B. Pegar técnica do catálogo
    let tecnica = null;
    if (window.catalogoTecnicas) {
        tecnica = window.catalogoTecnicas.buscarTecnicaPorId('arquearia-montada');
    }
    
    if (!tecnica) {
        console.error("❌ Técnica não encontrada no catálogo!");
        return;
    }
    
    // C. Verificar se pode aprender
    const prereq = verificarPreRequisitosTecnica();
    const nhBase = prereq.nhArco - 4;
    
    // D. Criar HTML
    const html = `
        <div class="pericia-item ${!prereq.pode ? 'item-indisponivel' : ''}"
             style="background: rgba(50, 50, 65, 0.95);
                    border: 2px solid ${prereq.pode ? '#9b59b6' : '#e74c3c'};
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 15px;
                    cursor: ${prereq.pode ? 'pointer' : 'not-allowed'};
                    transition: all 0.3s ease;"
             onclick="${prereq.pode ? 'comprarTecnicaModal()' : ''}">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="color: ${prereq.pode ? '#ffd700' : '#95a5a6'}; margin: 0; font-size: 18px;">
                    ${tecnica.nome}
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
                    NH: ${nhBase} (Arco-4)
                </span>
                <span style="background: #2ecc71; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px;">
                    ${prereq.pode ? '✅ Disponível' : '🔒 Bloqueada'}
                </span>
            </div>
            
            ${!prereq.pode ? `
                <div style="background: rgba(231, 76, 60, 0.1); padding: 10px; border-radius: 5px; margin-top: 10px;">
                    <span style="color: #e74c3c; font-size: 13px;">
                        <i class="fas fa-lock"></i> ${prereq.motivo}
                    </span>
                </div>
            ` : `
                <div style="color: #27ae60; font-size: 13px; margin-top: 10px;">
                    <i class="fas fa-shopping-cart"></i> Clique para comprar
                </div>
            `}
        </div>
    `;
    
    // E. Adicionar
    container.innerHTML = html;
    console.log("✅ Técnica adicionada na tela!");
}

// ===== 4. INICIALIZAR =====
function inicializarSistema() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Carregar técnicas aprendidas salvas
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicasSistema.aprendidas = JSON.parse(salvo);
            console.log(`📂 Carregadas ${estadoTecnicasSistema.aprendidas.length} técnicas`);
        }
    } catch (e) {}
    
    // Esperar página carregar
    setTimeout(() => {
        adicionarTecnicaNaTela();
        console.log("✅ Sistema de técnicas pronto!");
    }, 1500);
}

// ===== 5. CARREGAR AUTOMATICAMENTE =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado, iniciando técnicas...");
    
    // Esperar aba de perícias
    const check = setInterval(() => {
        const abaPericias = document.getElementById('pericias');
        if (abaPericias && abaPericias.style.display !== 'none') {
            clearInterval(check);
            inicializarSistema();
        }
    }, 500);
    
    // Timeout segurança
    setTimeout(() => {
        inicializarSistema();
    }, 5000);
});

// ===== 6. FUNÇÕES PARA TESTE =====
window.testarSistemaTecnicas = function() {
    console.log("🧪 TESTE DO SISTEMA");
    console.log("===================");
    console.log("1. NH Arco:", obterNHArcoReal());
    console.log("2. Tem Cavalgar?", verificarTemCavalgar());
    console.log("3. Pré-requisitos:", verificarPreRequisitosTecnica());
    console.log("4. Técnicas aprendidas:", estadoTecnicasSistema.aprendidas.length);
    console.log("===================");
};

// Exportar
window.inicializarSistemaTecnicas = inicializarSistema;
window.adicionarTecnicaNaTela = adicionarTecnicaNaTela;

console.log("✅ tecnicas.js carregado!");