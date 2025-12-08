// ===== SISTEMA DE TÉCNICAS - VERSÃO COMPLETA 100% =====
// ===== TUDO EM UM SÓ ARQUIVO - NÃO PRECISA DE OUTROS =====

console.log("🚀 CARREGANDO SISTEMA DE TÉCNICAS 100% FUNCIONAL");

// ===== CATÁLOGO DE TÉCNICAS (INTERNO) =====
const CATALOGO_TECNICAS = {
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Permite usar arco enquanto cavalga. NH base = Arco-4. Penalidades para disparar montado não reduzem abaixo do NH nesta técnica. Não pode exceder NH em Arco.",
        dificuldade: "Difícil",
        tipo: "Técnica Especial",
        preRequisitos: [
            { tipo: "pericia", id: "arco", nivelMinimo: 4, desc: "Arco nível 4+" },
            { tipo: "pericia", id: "cavalgar", nivelMinimo: 0, desc: "Qualquer Cavalgar" }
        ],
        baseCalculo: { 
            tipo: "pericia-base", 
            pericia: "arco", 
            modificador: -4,
            formula: "NH Arco - 4"
        },
        limite: { 
            tipo: "nao-exceder-pericia", 
            pericia: "arco",
            regra: "Não pode ter NH maior que Arco"
        }
    }
};

// ===== ESTADO GLOBAL DO SISTEMA =====
let ESTADO_TECNICAS = {
    // Contadores
    pontosTotal: 0,
    pontosMedio: 0,
    pontosDificil: 0,
    qtdMedio: 0,
    qtdDificil: 0,
    qtdTotal: 0,
    
    // Técnicas
    tecnicasAprendidas: [],
    tecnicasDisponiveis: [],
    
    // Perícias RASTREADAS (nosso próprio sistema)
    pericias: {
        arco: { 
            id: "arco",
            nome: "Arco", 
            nivel: 0, 
            aprendida: false, 
            atributo: "DX", 
            nh: 10,
            ultimaVerificacao: null
        },
        cavalgar: { 
            id: "cavalgar",
            nome: "Cavalgar", 
            nivel: 0, 
            aprendida: false, 
            atributo: "DX", 
            nh: 10,
            ultimaVerificacao: null
        }
    },
    
    // Atributos RASTREADOS
    atributos: { 
        DX: 10, 
        IQ: 10, 
        HT: 10, 
        PERC: 10 
    },
    
    // UI State
    modalAberto: false,
    tecnicaSelecionada: null,
    filtroAtivo: "todas-tecnicas",
    buscaAtiva: ""
};

// ===== FUNÇÕES DE RASTREAMENTO DIRETO =====

function RASTREAR_ATRIBUTOS() {
    // Método AGGRESSIVO: Procurar em TODA a página
    const elementos = document.querySelectorAll('*');
    
    elementos.forEach(el => {
        if (el.textContent && el.textContent.length < 100) { // Evitar textos muito longos
            const texto = el.textContent;
            
            // Buscar DX
            if (texto.includes('DX') && texto.match(/\d+/)) {
                const match = texto.match(/DX[:\s]*(\d+)/i);
                if (match) {
                    ESTADO_TECNICAS.atributos.DX = parseInt(match[1]);
                    console.log(`📊 DX encontrado: ${match[1]}`);
                }
            }
            
            // Buscar outras formas de atributo
            if (texto.includes('Destreza') || texto.includes('destreza')) {
                const match = texto.match(/(\d+)/);
                if (match && parseInt(match[1]) >= 8 && parseInt(match[1]) <= 20) {
                    ESTADO_TECNICAS.atributos.DX = parseInt(match[1]);
                    console.log(`📊 DX via Destreza: ${match[1]}`);
                }
            }
        }
    });
    
    // Se não encontrou, usar valores padrão razoáveis
    if (ESTADO_TECNICAS.atributos.DX < 8) ESTADO_TECNICAS.atributos.DX = 10;
}

function RASTREAR_PERICIAS() {
    console.log("🔍 RASTREANDO PERÍCIAS DIRETAMENTE...");
    
    // Método 1: Procurar na aba de perícias
    const containerPericias = document.getElementById('pericias-aprendidas');
    if (containerPericias) {
        PROCURAR_PERICIAS_NO_CONTAINER(containerPericias);
    }
    
    // Método 2: Procurar em toda a página
    PROCURAR_PERICIAS_NA_PAGINA();
    
    // Método 3: Verificar localStorage do sistema de perícias
    VERIFICAR_LOCALSTORAGE_PERICIAS();
    
    // Atualizar NH baseado nos atributos
    ATUALIZAR_NH_PERICIAS();
}

function PROCURAR_PERICIAS_NO_CONTAINER(container) {
    // Extrair texto completo
    const texto = container.textContent.toLowerCase();
    
    // Procurar Arco
    if (texto.includes('arco')) {
        // Extrair nível
        const regexArco = /arco[^(]*\(([+-]?\d+)\)/i;
        const match = texto.match(regexArco);
        
        if (match) {
            ESTADO_TECNICAS.pericias.arco.nivel = parseInt(match[1]);
            ESTADO_TECNICAS.pericias.arco.aprendida = true;
            ESTADO_TECNICAS.pericias.arco.ultimaVerificacao = new Date();
            console.log(`✅ ARCO encontrado no container: nível ${match[1]}`);
        } else {
            // Tentar outro padrão: "NH X"
            const regexNH = /arco[^0-9]*(\d+)/i;
            const matchNH = texto.match(regexNH);
            if (matchNH) {
                const nh = parseInt(matchNH[1]);
                ESTADO_TECNICAS.pericias.arco.nivel = nh - ESTADO_TECNICAS.atributos.DX;
                ESTADO_TECNICAS.pericias.arco.aprendida = true;
                ESTADO_TECNICAS.pericias.arco.ultimaVerificacao = new Date();
                console.log(`✅ ARCO encontrado (via NH): NH ${nh}, nível ${nh - ESTADO_TECNICAS.atributos.DX}`);
            }
        }
    }
    
    // Procurar Cavalgar
    if (texto.includes('cavalgar')) {
        const regexCavalgar = /cavalgar[^(]*\(([+-]?\d+)\)/i;
        const match = texto.match(regexCavalgar);
        
        if (match) {
            ESTADO_TECNICAS.pericias.cavalgar.nivel = parseInt(match[1]);
            ESTADO_TECNICAS.pericias.cavalgar.aprendida = true;
            ESTADO_TECNICAS.pericias.cavalgar.ultimaVerificacao = new Date();
            console.log(`✅ CAVALGAR encontrado no container: nível ${match[1]}`);
        }
    }
}

function PROCURAR_PERICIAS_NA_PAGINA() {
    // Buscar elementos que possam conter perícias
    const botoes = document.querySelectorAll('button, .pericia-item, .skill-item, [class*="pericia"], [class*="skill"]');
    
    botoes.forEach(el => {
        const texto = el.textContent.toLowerCase();
        
        if (texto.includes('arco') && !ESTADO_TECNICAS.pericias.arco.aprendida) {
            // Extrair número do texto
            const numeros = texto.match(/([+-]?\d+)/g);
            if (numeros && numeros.length > 0) {
                const nivel = parseInt(numeros[0]);
                if (!isNaN(nivel) && Math.abs(nivel) <= 20) {
                    ESTADO_TECNICAS.pericias.arco.nivel = nivel;
                    ESTADO_TECNICAS.pericias.arco.aprendida = true;
                    console.log(`🎯 ARCO encontrado em botão: nível ${nivel}`);
                }
            }
        }
        
        if ((texto.includes('cavalgar') || texto.includes('montaria')) && !ESTADO_TECNICAS.pericias.cavalgar.aprendida) {
            const numeros = texto.match(/([+-]?\d+)/g);
            if (numeros && numeros.length > 0) {
                const nivel = parseInt(numeros[0]);
                if (!isNaN(nivel) && Math.abs(nivel) <= 20) {
                    ESTADO_TECNICAS.pericias.cavalgar.nivel = nivel;
                    ESTADO_TECNICAS.pericias.cavalgar.aprendida = true;
                    console.log(`🎯 CAVALGAR encontrado em botão: nível ${nivel}`);
                }
            }
        }
    });
}

function VERIFICAR_LOCALSTORAGE_PERICIAS() {
    try {
        // Tentar encontrar perícias no localStorage
        const lsKeys = Object.keys(localStorage);
        
        for (const key of lsKeys) {
            if (key.includes('pericia') || key.includes('skill')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data && typeof data === 'object') {
                        // Verificar se é Arco
                        if (data.nome && data.nome.toLowerCase().includes('arco')) {
                            ESTADO_TECNICAS.pericias.arco.nivel = data.nivel || data.level || 0;
                            ESTADO_TECNICAS.pericias.arco.aprendida = true;
                            console.log(`💾 ARCO encontrado no localStorage: nível ${data.nivel}`);
                        }
                        
                        // Verificar se é Cavalgar
                        if (data.nome && data.nome.toLowerCase().includes('cavalgar')) {
                            ESTADO_TECNICAS.pericias.cavalgar.nivel = data.nivel || data.level || 0;
                            ESTADO_TECNICAS.pericias.cavalgar.aprendida = true;
                            console.log(`💾 CAVALGAR encontrado no localStorage: nível ${data.nivel}`);
                        }
                    }
                } catch (e) {
                    // Ignorar erros de parse
                }
            }
        }
    } catch (e) {
        console.log("ℹ️ Não foi possível verificar localStorage");
    }
}

function ATUALIZAR_NH_PERICIAS() {
    // Calcular NH baseado em atributo + nível
    ESTADO_TECNICAS.pericias.arco.nh = ESTADO_TECNICAS.atributos.DX + ESTADO_TECNICAS.pericias.arco.nivel;
    ESTADO_TECNICAS.pericias.cavalgar.nh = ESTADO_TECNICAS.atributos.DX + ESTADO_TECNICAS.pericias.cavalgar.nivel;
    
    console.log(`📊 NH Arco: ${ESTADO_TECNICAS.pericias.arco.nh} (DX ${ESTADO_TECNICAS.atributos.DX} + nível ${ESTADO_TECNICAS.pericias.arco.nivel})`);
    console.log(`📊 NH Cavalgar: ${ESTADO_TECNICAS.pericias.cavalgar.nh}`);
}

// ===== FUNÇÕES DO SISTEMA DE TÉCNICAS =====

function VERIFICAR_PRE_REQUISITOS(tecnicaId) {
    const tecnica = CATALOGO_TECNICAS[tecnicaId];
    const arco = ESTADO_TECNICAS.pericias.arco;
    const cavalgar = ESTADO_TECNICAS.pericias.cavalgar;
    
    // Verificar Arco nível 4
    if (!arco.aprendida || arco.nivel < 4) {
        return {
            passou: false,
            motivo: `❌ Precisa de <strong>Arco nível 4</strong> (atual: ${arco.aprendida ? `nível ${arco.nivel}` : 'não aprendido'})`,
            detalhes: `NH Arco atual: ${arco.nh} (DX ${ESTADO_TECNICAS.atributos.DX} + nível ${arco.nivel})`
        };
    }
    
    // Verificar Cavalgar
    if (!cavalgar.aprendida) {
        return {
            passou: false,
            motivo: '❌ Precisa de <strong>qualquer perícia de Cavalgar</strong>',
            detalhes: 'Aprenda Cavalgar (Cavalo), Cavalgar (Mula), ou outra montaria'
        };
    }
    
    return {
        passou: true,
        motivo: '✅ Pré-requisitos atendidos',
        detalhes: `Arco nível ${arco.nivel} ✓ | Cavalgar nível ${cavalgar.nivel} ✓`
    };
}

function CALCULAR_CUSTO_TECNICA(niveisAcimaBase, dificuldade) {
    if (niveisAcimaBase <= 0) return 0;
    
    if (dificuldade === 'Difícil') {
        // Tabela: +1 nível = 2pts, +2 = 3pts, +3 = 4pts, etc
        return niveisAcimaBase + 1;
    }
    
    if (dificuldade === 'Média') {
        return niveisAcimaBase; // 1 ponto por nível
    }
    
    return 0;
}

function CALCULAR_NH_TECNICA(tecnicaId, niveisComprados = 0) {
    const tecnica = CATALOGO_TECNICAS[tecnicaId];
    const arco = ESTADO_TECNICAS.pericias.arco;
    
    if (!tecnica || !arco.aprendida) return 0;
    
    // NH base = Arco - 4
    const nhBase = arco.nh - 4;
    
    // Aplicar níveis comprados
    const nhAtual = nhBase + niveisComprados;
    
    // Limite: não pode exceder NH Arco
    const nhLimite = arco.nh;
    
    return {
        base: nhBase,
        atual: Math.min(nhAtual, nhLimite),
        maximo: nhLimite,
        niveisPossiveis: Math.max(0, nhLimite - nhBase)
    };
}

// ===== FUNÇÕES DE UI/RENDER =====

function ATUALIZAR_TECNICAS_DISPONIVEIS() {
    console.log("🔄 Atualizando técnicas disponíveis...");
    
    // Atualizar rastreamento primeiro
    RASTREAR_ATRIBUTOS();
    RASTREAR_PERICIAS();
    
    // Processar cada técnica do catálogo
    ESTADO_TECNICAS.tecnicasDisponiveis = [];
    
    Object.values(CATALOGO_TECNICAS).forEach(tecnica => {
        const verificacao = VERIFICAR_PRE_REQUISITOS(tecnica.id);
        const jaAprendida = ESTADO_TECNICAS.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        // Calcular NH
        const nhData = CALCULAR_NH_TECNICA(tecnica.id, jaAprendida ? jaAprendida.niveisComprados : 0);
        
        // Adicionar à lista
        ESTADO_TECNICAS.tecnicasDisponiveis.push({
            ...tecnica,
            disponivel: verificacao.passou,
            motivoIndisponivel: verificacao.motivo,
            detalhesIndisponivel: verificacao.detalhes,
            jaAprendida: !!jaAprendida,
            niveisComprados: jaAprendida ? jaAprendida.niveisComprados : 0,
            nhBase: nhData.base,
            nhAtual: nhData.atual,
            nhMaximo: nhData.maximo,
            niveisPossiveis: nhData.niveisPossiveis,
            custoTotal: jaAprendida ? jaAprendida.custoTotal : 0
        });
    });
    
    RENDERIZAR_CATALOGO_TECNICAS();
}

function RENDERIZAR_CATALOGO_TECNICAS() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container #lista-tecnicas não encontrado!");
        return;
    }
    
    // Filtrar técnicas
    let tecnicasFiltradas = ESTADO_TECNICAS.tecnicasDisponiveis;
    
    if (ESTADO_TECNICAS.filtroAtivo === 'medio-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Média');
    } else if (ESTADO_TECNICAS.filtroAtivo === 'dificil-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Difícil');
    }
    
    if (ESTADO_TECNICAS.buscaAtiva) {
        const busca = ESTADO_TECNICAS.buscaAtiva.toLowerCase();
        tecnicasFiltradas = tecnicasFiltradas.filter(t => 
            t.nome.toLowerCase().includes(busca) ||
            t.descricao.toLowerCase().includes(busca)
        );
    }
    
    // Renderizar
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
                style="cursor: ${disponivel ? 'pointer' : 'not-allowed'};
                       opacity: ${disponivel ? '1' : '0.6'};
                       background: ${jaAprendida ? 'rgba(39, 174, 96, 0.15)' : 'rgba(50, 50, 65, 0.9)'};
                       border: 1px solid ${jaAprendida ? 'rgba(39, 174, 96, 0.4)' : 'rgba(255, 140, 0, 0.3)'};
                       border-radius: 8px;
                       padding: 15px;
                       margin-bottom: 10px;
                       transition: all 0.3s ease;"
                onclick="${disponivel ? `ABRIR_MODAL_TECNICA('${tecnica.id}')` : ''}">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: ${jaAprendida ? '#27ae60' : '#ffd700'}; font-size: 16px;">
                        ${tecnica.nome}
                        ${jaAprendida ? '<span style="color: #27ae60; margin-left: 5px;">✓</span>' : ''}
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
                
                ${!disponivel ? `
                    <div style="background: rgba(231, 76, 60, 0.1); border-left: 3px solid #e74c3c; 
                         padding: 8px 12px; margin-top: 10px; border-radius: 4px;">
                        <i class="fas fa-lock" style="color: #e74c3c;"></i> 
                        <span style="color: #e74c3c; margin-left: 5px;">${tecnica.motivoIndisponivel}</span>
                    </div>
                    <div style="font-size: 12px; color: #95a5a6; margin-top: 5px;">
                        ${tecnica.detalhesIndisponivel}
                    </div>
                ` : ''}
                
                ${disponivel ? `
                    <div style="margin-top: 10px; font-size: 12px; color: #95a5a6; display: flex; align-items: center;">
                        <i class="fas fa-bullseye" style="margin-right: 5px;"></i>
                        Clique para ${jaAprendida ? 'melhorar' : 'aprender'} esta técnica
                        ${tecnica.niveisComprados > 0 ? 
                            `<span style="margin-left: 10px; color: #f39c12;">(+${tecnica.niveisComprados} níveis comprados)</span>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function RENDERIZAR_TECNICAS_APRENDIDAS() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (ESTADO_TECNICAS.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida" style="text-align: center; padding: 40px; color: #95a5a6;">
                <i class="fas fa-tools" style="font-size: 48px; margin-bottom: 15px; color: #9b59b6;"></i>
                <div style="font-size: 18px; margin-bottom: 10px;">Nenhuma técnica aprendida</div>
                <small>As técnicas que você aprender aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    ESTADO_TECNICAS.tecnicasAprendidas.forEach(tecnicaAprendida => {
        const tecnica = CATALOGO_TECNICAS[tecnicaAprendida.id];
        if (!tecnica) return;
        
        const nhData = CALCULAR_NH_TECNICA(tecnicaAprendida.id, tecnicaAprendida.niveisComprados);
        
        html += `
            <div class="pericia-aprendida-item" style="background: rgba(155, 89, 182, 0.15); 
                 border: 1px solid rgba(155, 89, 182, 0.4); border-radius: 8px; padding: 15px; 
                 margin-bottom: 10px; position: relative;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: #e67e22; font-size: 16px;">
                        ${tecnica.nome}
                        <span style="color: #f39c12; font-size: 0.9em; font-style: italic; margin-left: 5px;">
                            (Arco-4 + ${tecnicaAprendida.niveisComprados})
                        </span>
                    </h4>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <span style="background: #2ecc71; color: white; padding: 3px 10px; 
                              border-radius: 4px; font-size: 14px; font-weight: bold;">
                            NH ${nhData.atual}
                        </span>
                        <span style="background: #3498db; color: white; padding: 3px 10px; 
                              border-radius: 4px; font-size: 14px;">
                            ${tecnicaAprendida.custoTotal || 0} pts
                        </span>
                    </div>
                </div>
                
                <div style="font-size: 13px; color: #95a5a6; margin-top: 8px; line-height: 1.5;">
                    <div><strong>Base (Arco-4):</strong> ${nhData.base}</div>
                    <div><strong>Níveis comprados:</strong> +${tecnicaAprendida.niveisComprados}</div>
                    <div><strong>Máximo possível (NH Arco):</strong> ${nhData.maximo}</div>
                    <div><strong>Data:</strong> ${new Date(tecnicaAprendida.dataAquisicao).toLocaleDateString()}</div>
                </div>
                
                <button onclick="REMOVER_TECNICA('${tecnicaAprendida.id}')"
                    style="position: absolute; top: 15px; right: 15px; background: rgba(231, 76, 60, 0.2); 
                           color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.4); border-radius: 4px; 
                           width: 30px; height: 30px; cursor: pointer;"
                    onmouseover="this.style.backgroundColor='rgba(231, 76, 60, 0.4)'"
                    onmouseout="this.style.backgroundColor='rgba(231, 76, 60, 0.2)'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== MODAL DE TÉCNICA =====

function ABRIR_MODAL_TECNICA(tecnicaId) {
    const tecnica = CATALOGO_TECNICAS[tecnicaId];
    const jaAprendida = ESTADO_TECNICAS.tecnicasAprendidas.find(t => t.id === tecnicaId);
    
    if (!tecnica) return;
    
    ESTADO_TECNICAS.tecnicaSelecionada = tecnica;
    
    // Calcular valores
    const nhData = CALCULAR_NH_TECNICA(tecnicaId, jaAprendida ? jaAprendida.niveisComprados : 0);
    const niveisComprados = jaAprendida ? jaAprendida.niveisComprados : 0;
    
    // Gerar opções de nível
    let opcoesHTML = '';
    for (let i = 0; i <= nhData.niveisPossiveis; i++) {
        const custo = CALCULAR_CUSTO_TECNICA(i, tecnica.dificuldade);
        const selected = i === niveisComprados ? 'selected' : '';
        const textoNivel = i === 0 ? 'Base (Arco-4)' : `+${i} nível acima da base`;
        
        opcoesHTML += `
            <option value="${i}" data-custo="${custo}" ${selected}>
                NH ${nhData.base + i} - ${textoNivel} (${custo} pontos)
            </option>
        `;
    }
    
    // Criar modal HTML
    const modalHTML = `
        <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; 
             padding: 20px; border-radius: 8px 8px 0 0; border-bottom: 2px solid #ff8c00;">
            <span onclick="FECHAR_MODAL_TECNICA()" 
                  style="position: absolute; right: 20px; top: 20px; font-size: 24px; 
                         cursor: pointer; color: #ffd700; font-weight: bold;">×</span>
            <h3 style="margin: 0; color: #ffd700; font-size: 20px;">${tecnica.nome}</h3>
            <div style="color: #95a5a6; margin-top: 5px; font-size: 14px;">
                <span style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; 
                      padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                    ${tecnica.dificuldade}
                </span>
                • Técnica Especial • NH Base: Arco-4
            </div>
        </div>
        
        <div style="padding: 20px; background: #1e1e28; color: #ccc; max-height: 60vh; overflow-y: auto;">
            <!-- Dados das Perícias -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(52, 152, 219, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">NH Arco Atual</div>
                    <div style="font-size: 28px; font-weight: bold; color: #3498db;">${ESTADO_TECNICAS.pericias.arco.nh}</div>
                    <div style="font-size: 12px; color: #7f8c8d;">DX ${ESTADO_TECNICAS.atributos.DX} + nível ${ESTADO_TECNICAS.pericias.arco.nivel}</div>
                </div>
                <div style="background: rgba(243, 156, 18, 0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(243, 156, 18, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">NH Cavalgar</div>
                    <div style="font-size: 28px; font-weight: bold; color: #f39c12;">${ESTADO_TECNICAS.pericias.cavalgar.nh}</div>
                    <div style="font-size: 12px; color: #7f8c8d;">${ESTADO_TECNICAS.pericias.cavalgar.aprendida ? 'Aprendido' : 'Não aprendido'}</div>
                </div>
            </div>
            
            <!-- Estatísticas da Técnica -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 15px; background: rgba(52, 152, 219, 0.1); border-radius: 8px; border: 1px solid rgba(52, 152, 219, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6;">Base (Arco-4)</div>
                    <div style="font-size: 28px; font-weight: bold; color: #3498db;">${nhData.base}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(39, 174, 96, 0.1); border-radius: 8px; border: 1px solid rgba(39, 174, 96, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6;">Máximo (NH Arco)</div>
                    <div style="font-size: 28px; font-weight: bold; color: #27ae60;">${nhData.maximo}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(243, 156, 18, 0.1); border-radius: 8px; border: 1px solid rgba(243, 156, 18, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6;">Atual</div>
                    <div style="font-size: 28px; font-weight: bold; color: #f39c12;">${nhData.atual}</div>
                </div>
            </div>
            
            <!-- Seleção de Nível -->
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 10px; color: #ffd700; font-weight: bold; font-size: 16px;">
                    <i class="fas fa-chart-line" style="margin-right: 8px;"></i>
                    Níveis acima da base (Arco-4):
                </label>
                <select id="select-niveis-tecnica"
                    style="width: 100%; padding: 14px; border-radius: 8px; border: 2px solid #ff8c00;
                           background: #2c3e50; color: #ffd700; font-size: 16px; 
                           cursor: pointer;"
                    onchange="ATUALIZAR_CUSTO_DISPLAY()">
                    ${opcoesHTML}
                </select>
                <div style="font-size: 13px; color: #95a5a6; margin-top: 8px;">
                    <i class="fas fa-coins" style="margin-right: 5px;"></i>
                    Custo progressivo: +1 nível = 2pts, +2 = 3pts, +3 = 4pts, etc.
                </div>
            </div>
            
            <!-- Custo Display -->
            <div style="background: rgba(39, 174, 96, 0.1); padding: 20px; border-radius: 8px;
                 border-left: 4px solid #27ae60; margin-bottom: 25px; text-align: center;">
                <div style="font-size: 14px; color: #95a5a6; margin-bottom: 8px;">
                    <i class="fas fa-money-bill-wave" style="margin-right: 5px;"></i>
                    Custo Total
                </div>
                <div id="custo-display" style="font-size: 36px; font-weight: bold; color: #27ae60;">
                    ${jaAprendida ? jaAprendida.custoTotal : 0} pontos
                </div>
                <div id="info-custo-detalhe" style="font-size: 13px; color: #7f8c8d; margin-top: 5px;">
                    ${jaAprendida ? `${niveisComprados} níveis já comprados` : 'Nova técnica'}
                </div>
            </div>
            
            <!-- Descrição -->
            <div style="margin-bottom: 20px;">
                <h4 style="color: #ffd700; margin-bottom: 12px; font-size: 18px; border-bottom: 1px solid #34495e; padding-bottom: 5px;">
                    <i class="fas fa-scroll" style="margin-right: 8px;"></i>
                    Descrição
                </h4>
                <p style="line-height: 1.6; font-size: 14px; color: #ccc;">${tecnica.descricao}</p>
            </div>
            
            <!-- Regras -->
            <div style="background: rgba(155, 89, 182, 0.1); padding: 18px; border-radius: 8px; border-left: 4px solid #9b59b6;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <i class="fas fa-gavel" style="color: #9b59b6; font-size: 18px;"></i>
                    <h5 style="color: #9b59b6; margin: 0; font-size: 16px;">Regras da Técnica</h5>
                </div>
                <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 13px; line-height: 1.5;">
                    <li><strong>Pré-requisitos:</strong> Arco nível 4 + qualquer Cavalgar</li>
                    <li><strong>NH base:</strong> Arco - 4 (pré-definido pelo sistema)</li>
                    <li><strong>Limite máximo:</strong> Nunca pode exceder seu NH em Arco</li>
                    <li><strong>Vantagem:</strong> Penalidades para disparar montado não reduzem abaixo do NH nesta técnica</li>
                    <li><strong>Custo:</strong> Progressivo (2pts para +1, 3pts para +2, 4pts para +3, etc.)</li>
                </ul>
            </div>
        </div>
        
        <div style="padding: 20px; background: #2c3e50; border-radius: 0 0 8px 8px; 
             display: flex; gap: 15px; justify-content: flex-end; border-top: 2px solid #34495e;">
            <button onclick="FECHAR_MODAL_TECNICA()"
                style="padding: 12px 30px; background: #7f8c8d; color: white; border: none; 
                       border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;
                       transition: all 0.3s ease; min-width: 120px;">
                <i class="fas fa-times" style="margin-right: 8px;"></i>Cancelar
            </button>
            <button onclick="COMPRAR_TECNICA()"
                id="btn-comprar-tecnica"
                style="padding: 12px 30px; background: linear-gradient(45deg, #ff8c00, #ffd700);
                       color: #1e1e28; border: none; border-radius: 6px; font-weight: bold; 
                       cursor: pointer; font-size: 14px; min-width: 120px;">
                <i class="fas fa-shopping-cart" style="margin-right: 8px;"></i>
                ${jaAprendida ? 'Atualizar' : 'Comprar'}
            </button>
        </div>
    `;

    // Inserir modal
    const modal = document.querySelector('.modal-tecnica');
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    
    if (modal && modalOverlay) {
        modal.innerHTML = modalHTML;
        modalOverlay.style.display = 'flex';
        ESTADO_TECNICAS.modalAberto = true;
        
        // Configurar evento inicial
        setTimeout(ATUALIZAR_CUSTO_DISPLAY, 100);
    }
}

function ATUALIZAR_CUSTO_DISPLAY() {
    const select = document.getElementById('select-niveis-tecnica');
    const custoDisplay = document.getElementById('custo-display');
    const infoDetalhe = document.getElementById('info-custo-detalhe');
    const btnComprar = document.getElementById('btn-comprar-tecnica');
    
    if (!select || !custoDisplay) return;
    
    const niveisSelecionados = parseInt(select.value);
    const custo = CALCULAR_CUSTO_TECNICA(niveisSelecionados, ESTADO_TECNICAS.tecnicaSelecionada.dificuldade);
    
    custoDisplay.textContent = `${custo} pontos`;
    
    if (infoDetalhe) {
        const jaAprendida = ESTADO_TECNICAS.tecnicasAprendidas.find(t => t.id === ESTADO_TECNICAS.tecnicaSelecionada.id);
        
        if (jaAprendida) {
            const niveisAtuais = jaAprendida.niveisComprados || 0;
            if (niveisSelecionados === niveisAtuais) {
                infoDetalhe.textContent = `${niveisAtuais} níveis já comprados (mantém custo)`;
            } else if (niveisSelecionados > niveisAtuais) {
                infoDetalhe.textContent = `+${niveisSelecionados - niveisAtuais} nível(s) adicional(is)`;
            } else {
                infoDetalhe.textContent = `Redução de ${niveisAtuais - niveisSelecionados} nível(s)`;
            }
        } else {
            infoDetalhe.textContent = niveisSelecionados > 0 ? 
                `${niveisSelecionados} nível(s) acima da base` : 
                'Base apenas (Arco-4)';
        }
    }
    
    if (btnComprar) {
        const jaAprendida = ESTADO_TECNICAS.tecnicasAprendidas.find(t => t.id === ESTADO_TECNICAS.tecnicaSelecionada.id);
        
        if (jaAprendida && niveisSelecionados === (jaAprendida.niveisComprados || 0)) {
            btnComprar.textContent = 'Manter';
            btnComprar.style.background = '#95a5a6';
            btnComprar.disabled = true;
        } else {
            btnComprar.textContent = jaAprendida ? 
                `Atualizar (${custo} pts)` : 
                `Comprar (${custo} pts)`;
            btnComprar.style.background = 'linear-gradient(45deg, #ff8c00, #ffd700)';
            btnComprar.disabled = false;
        }
    }
}

function COMPRAR_TECNICA() {
    if (!ESTADO_TECNICAS.tecnicaSelecionada) return;
    
    const select = document.getElementById('select-niveis-tecnica');
    if (!select) return;
    
    const niveisComprados = parseInt(select.value);
    const custo = CALCULAR_CUSTO_TECNICA(niveisComprados, ESTADO_TECNICAS.tecnicaSelecionada.dificuldade);
    
    const tecnicaId = ESTADO_TECNICAS.tecnicaSelecionada.id;
    const index = ESTADO_TECNICAS.tecnicasAprendidas.findIndex(t => t.id === tecnicaId);
    
    const dadosTecnica = {
        id: tecnicaId,
        nome: ESTADO_TECNICAS.tecnicaSelecionada.nome,
        dificuldade: ESTADO_TECNICAS.tecnicaSelecionada.dificuldade,
        niveisComprados: niveisComprados,
        custoTotal: custo,
        dataAquisicao: new Date().toISOString(),
        baseCalculo: ESTADO_TECNICAS.tecnicaSelecionada.baseCalculo,
        nhArcoNoMomento: ESTADO_TECNICAS.pericias.arco.nh
    };
    
    if (index >= 0) {
        // Atualizar
        ESTADO_TECNICAS.tecnicasAprendidas[index] = dadosTecnica;
    } else {
        // Nova
        ESTADO_TECNICAS.tecnicasAprendidas.push(dadosTecnica);
    }
    
    // Salvar
    SALVAR_TECNICAS();
    
    // Atualizar tudo
    ATUALIZAR_TECNICAS_DISPONIVEIS();
    RENDERIZAR_TECNICAS_APRENDIDAS();
    ATUALIZAR_ESTATISTICAS();
    
    // Fechar modal
    FECHAR_MODAL_TECNICA();
    
    // Mensagem
    setTimeout(() => {
        alert(`✅ ${ESTADO_TECNICAS.tecnicaSelecionada.nome} ${index >= 0 ? 'atualizada' : 'aprendida'}!\n\nNH: ${CALCULAR_NH_TECNICA(tecnicaId, niveisComprados).atual}\nCusto: ${custo} pontos\nNíveis: +${niveisComprados} acima da base`);
    }, 300);
}

function REMOVER_TECNICA(tecnicaId) {
    const tecnica = ESTADO_TECNICAS.tecnicasAprendidas.find(t => t.id === tecnicaId);
    if (!tecnica) return;
    
    if (confirm(`Remover "${tecnica.nome}"?\n\nIsso removerá ${tecnica.custoTotal} pontos investidos.`)) {
        ESTADO_TECNICAS.tecnicasAprendidas = ESTADO_TECNICAS.tecnicasAprendidas.filter(t => t.id !== tecnicaId);
        SALVAR_TECNICAS();
        ATUALIZAR_TECNICAS_DISPONIVEIS();
        RENDERIZAR_TECNICAS_APRENDIDAS();
        ATUALIZAR_ESTATISTICAS();
    }
}

function FECHAR_MODAL_TECNICA() {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    ESTADO_TECNICAS.modalAberto = false;
    ESTADO_TECNICAS.tecnicaSelecionada = null;
}

// ===== SALVAR/CARREGAR =====

function SALVAR_TECNICAS() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(ESTADO_TECNICAS.tecnicasAprendidas));
        localStorage.setItem('tecnicasPericiasRastreadas', JSON.stringify(ESTADO_TECNICAS.pericias));
        console.log("💾 Técnicas salvas no localStorage");
    } catch (e) {
        console.error("❌ Erro ao salvar técnicas:", e);
    }
}

function CARREGAR_TECNICAS() {
    try {
        // Carregar técnicas aprendidas
        const tecnicasSalvas = localStorage.getItem('tecnicasAprendidas');
        if (tecnicasSalvas) {
            ESTADO_TECNICAS.tecnicasAprendidas = JSON.parse(tecnicasSalvas);
            console.log(`📂 ${ESTADO_TECNICAS.tecnicasAprendidas.length} técnicas carregadas`);
        }
        
        // Carregar cache de perícias
        const periciasSalvas = localStorage.getItem('tecnicasPericiasRastreadas');
        if (periciasSalvas) {
            const cache = JSON.parse(periciasSalvas);
            if (cache.arco) ESTADO_TECNICAS.pericias.arco = { ...ESTADO_TECNICAS.pericias.arco, ...cache.arco };
            if (cache.cavalgar) ESTADO_TECNICAS.pericias.cavalgar = { ...ESTADO_TECNICAS.pericias.cavalgar, ...cache.cavalgar };
            console.log("📂 Cache de perícias carregado");
        }
    } catch (e) {
        console.error("❌ Erro ao carregar dados:", e);
    }
}

// ===== ESTATÍSTICAS =====

function ATUALIZAR_ESTATISTICAS() {
    // Zerar
    ESTADO_TECNICAS.pontosTotal = 0;
    ESTADO_TECNICAS.pontosMedio = 0;
    ESTADO_TECNICAS.pontosDificil = 0;
    ESTADO_TECNICAS.qtdMedio = 0;
    ESTADO_TECNICAS.qtdDificil = 0;
    
    // Calcular
    ESTADO_TECNICAS.tecnicasAprendidas.forEach(t => {
        const custo = t.custoTotal || 0;
        ESTADO_TECNICAS.pontosTotal += custo;
        
        if (t.dificuldade === 'Média') {
            ESTADO_TECNICAS.qtdMedio++;
            ESTADO_TECNICAS.pontosMedio += custo;
        } else if (t.dificuldade === 'Difícil') {
            ESTADO_TECNICAS.qtdDificil++;
            ESTADO_TECNICAS.pontosDificil += custo;
        }
    });
    
    ESTADO_TECNICAS.qtdTotal = ESTADO_TECNICAS.qtdMedio + ESTADO_TECNICAS.qtdDificil;
    
    // Atualizar HTML
    const elementos = {
        'qtd-tecnicas-medio': ESTADO_TECNICAS.qtdMedio,
        'pts-tecnicas-medio': `(${ESTADO_TECNICAS.pontosMedio} pts)`,
        'qtd-tecnicas-dificil': ESTADO_TECNICAS.qtdDificil,
        'pts-tecnicas-dificil': `(${ESTADO_TECNICAS.pontosDificil} pts)`,
        'qtd-tecnicas-total': ESTADO_TECNICAS.qtdTotal,
        'pts-tecnicas-total': `(${ESTADO_TECNICAS.pontosTotal} pts)`
    };
    
    for (const [id, valor] of Object.entries(elementos)) {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    }
    
    // Badge total
    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) {
        badge.textContent = `[${ESTADO_TECNICAS.pontosTotal} pts]`;
    }
}

// ===== EVENTOS =====

function CONFIGURAR_EVENTOS() {
    // Filtros
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const filtro = this.getAttribute('data-filtro');
            ESTADO_TECNICAS.filtroAtivo = filtro;
            
            document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            RENDERIZAR_CATALOGO_TECNICAS();
        });
    });
    
    // Busca
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            ESTADO_TECNICAS.buscaAtiva = this.value;
            RENDERIZAR_CATALOGO_TECNICAS();
        });
    }
    
    // Fechar modal ao clicar fora
    document.addEventListener('click', function(e) {
        if (ESTADO_TECNICAS.modalAberto && 
            e.target.classList.contains('modal-tecnica-overlay')) {
            FECHAR_MODAL_TECNICA();
        }
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && ESTADO_TECNICAS.modalAberto) {
            FECHAR_MODAL_TECNICA();
        }
    });
    
    // Observar mudanças na aba de perícias
    const observer = new MutationObserver(function() {
        // Quando algo mudar na página, atualizar nosso rastreamento
        RASTREAR_ATRIBUTOS();
        RASTREAR_PERICIAS();
        ATUALIZAR_TECNICAS_DISPONIVEIS();
    });
    
    // Observar a aba de perícias
    const abaPericias = document.getElementById('pericias');
    if (abaPericias) {
        observer.observe(abaPericias, { 
            childList: true, 
            subtree: true,
            characterData: true 
        });
    }
}

// ===== INICIALIZAÇÃO =====

function INICIALIZAR_SISTEMA_TECNICAS() {
    console.log("🚀 INICIALIZANDO SISTEMA COMPLETO DE TÉCNICAS...");
    
    // 1. Carregar dados
    CARREGAR_TECNICAS();
    
    // 2. Configurar eventos
    CONFIGURAR_EVENTOS();
    
    // 3. Iniciar rastreamento
    RASTREAR_ATRIBUTOS();
    RASTREAR_PERICIAS();
    
    // 4. Renderizar tudo
    setTimeout(() => {
        ATUALIZAR_TECNICAS_DISPONIVEIS();
        RENDERIZAR_TECNICAS_APRENDIDAS();
        ATUALIZAR_ESTATISTICAS();
        console.log("✅ SISTEMA DE TÉCNICAS 100% PRONTO!");
    }, 1000);
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====

document.addEventListener('DOMContentLoaded', function() {
    // Esperar um pouco para garantir que tudo carregou
    setTimeout(() => {
        INICIALIZAR_SISTEMA_TECNICAS();
        
        // Atualizar a cada 3 segundos (para capturar mudanças)
        setInterval(() => {
            RASTREAR_ATRIBUTOS();
            RASTREAR_PERICIAS();
            ATUALIZAR_TECNICAS_DISPONIVEIS();
        }, 3000);
    }, 1500);
});

// ===== EXPORTAR FUNÇÕES PARA O HTML =====

window.ABRIR_MODAL_TECNICA = ABRIR_MODAL_TECNICA;
window.ATUALIZAR_CUSTO_DISPLAY = ATUALIZAR_CUSTO_DISPLAY;
window.COMPRAR_TECNICA = COMPRAR_TECNICA;
window.REMOVER_TECNICA = REMOVER_TECNICA;
window.FECHAR_MODAL_TECNICA = FECHAR_MODAL_TECNICA;
window.INICIALIZAR_SISTEMA_TECNICAS = INICIALIZAR_SISTEMA_TECNICAS;

console.log("📦 Sistema de técnicas carregado. Use INICIALIZAR_SISTEMA_TECNICAS() para iniciar.");