// ===== SISTEMA DE TÉCNICAS - VERSÃO COMPLETA E FUNCIONAL =====

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

// ===== FUNÇÕES BÁSICAS =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima <= 0) return 0;
    
    if (dificuldade === 'Difícil') {
        if (niveisAcima === 1) return 2;
        if (niveisAcima === 2) return 3;
        if (niveisAcima === 3) return 4;
        if (niveisAcima === 4) return 5;
        if (niveisAcima === 5) return 6;
        if (niveisAcima === 6) return 7;
        if (niveisAcima === 7) return 8;
        if (niveisAcima === 8) return 9;
        if (niveisAcima === 9) return 10;
        if (niveisAcima === 10) return 11;
        return niveisAcima + 1;
    }
    
    if (dificuldade === 'Média') {
        return niveisAcima;
    }
    
    return 0;
}

// ===== OBTER DX DO SISTEMA =====
function obterDXAtual() {
    // Usar função do sistema se existir
    if (window.obterAtributoAtual && typeof window.obterAtributoAtual === 'function') {
        try {
            const dx = window.obterAtributoAtual('DX');
            if (dx !== undefined && dx !== null) return dx;
        } catch (e) {}
    }
    
    // Procurar elemento do DX
    const elementos = [
        document.getElementById('DX'),
        document.querySelector('input[name="DX"]'),
        document.querySelector('[data-atributo="DX"]'),
        document.querySelector('.atributo-DX input')
    ];
    
    for (const elemento of elementos) {
        if (elemento && elemento.value) {
            const valor = parseInt(elemento.value);
            if (!isNaN(valor)) return valor;
        }
    }
    
    return 10; // Valor padrão
}

// ===== OBTER NÍVEL DE ARCO =====
function obterNivelArco() {
    // Método 1: Sistema de perícias
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const arco = window.estadoPericias.periciasAprendidas.find(p => 
            p.id === 'arco' || p.nome === 'Arco' || (p.nome && p.nome.includes('Arco'))
        );
        if (arco && arco.nivel !== undefined) {
            return arco.nivel;
        }
    }
    
    // Método 2: LocalStorage
    try {
        const salvo = localStorage.getItem('periciasAprendidas');
        if (salvo) {
            const pericias = JSON.parse(salvo);
            const arco = pericias.find(p => 
                p.id === 'arco' || p.nome === 'Arco' || (p.nome && p.nome.includes('Arco'))
            );
            if (arco && arco.nivel !== undefined) {
                return arco.nivel;
            }
        }
    } catch (e) {}
    
    return 0; // Se não encontrou, assume nível 0
}

// ===== CALCULAR NH DA TÉCNICA =====
function calcularNHTecnica() {
    const dx = obterDXAtual();
    const nivelArco = obterNivelArco();
    const nhArco = dx + nivelArco;
    const nhBase = nhArco - 4;
    
    return {
        dx: dx,
        nivelArco: nivelArco,
        nhArco: nhArco,
        nhBase: nhBase
    };
}

// ===== VERIFICAR PRÉ-REQUISITOS =====
function verificarPreRequisitos(tecnica) {
    if (!tecnica.preRequisitos) return { passou: true, motivo: '' };
    
    // Verificar Arco-4
    const reqArco = tecnica.preRequisitos.find(req => req.idPericia === 'arco');
    if (reqArco) {
        const nivelArco = obterNivelArco();
        if (nivelArco < reqArco.nivelMinimo) {
            return {
                passou: false,
                motivo: `Precisa de Arco nível ${reqArco.nivelMinimo} (você tem ${nivelArco})`
            };
        }
    }
    
    return { passou: true, motivo: '' };
}

// ===== CARREGAR TÉCNICAS SALVAS =====
function carregarTecnicasSalvas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
        }
    } catch (e) {}
}

// ===== SALVAR TÉCNICAS =====
function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    } catch (e) {}
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    // Verificar se catálogo existe
    if (!window.catalogoTecnicas || !window.catalogoTecnicas.obterTodasTecnicas) {
        // Criar técnica padrão se não existir
        if (!window.catalogoTecnicas) {
            window.catalogoTecnicas = {
                obterTodasTecnicas: function() {
                    return [{
                        id: "arquearia-montada",
                        nome: "Arquearia Montada",
                        descricao: "Permite usar arco enquanto cavalga. NH base = Arco-4. Não pode exceder NH em Arco.",
                        dificuldade: "Difícil",
                        baseCalculo: { idPericia: "arco", redutor: -4 },
                        preRequisitos: [{ idPericia: "arco", nivelMinimo: 4 }]
                    }];
                }
            };
        }
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    const calculo = calcularNHTecnica();
    
    estadoTecnicas.tecnicasDisponiveis = todasTecnicas.map(tecnica => {
        const verificacao = verificarPreRequisitos(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        let nhAtual = calculo.nhBase;
        if (jaAprendida && jaAprendida.niveisComprados) {
            nhAtual = calculo.nhBase + jaAprendida.niveisComprados;
        }
        
        return {
            ...tecnica,
            disponivel: verificacao.passou,
            nhAtual: nhAtual,
            motivoIndisponivel: verificacao.motivo,
            jaAprendida: !!jaAprendida,
            calculo: calculo
        };
    });
    
    renderizarCatalogoTecnicas();
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    const tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis.filter(tecnica => {
        // Aplicar filtro
        if (estadoTecnicas.filtroAtivo === 'medio-tecnicas' && tecnica.dificuldade !== 'Média') return false;
        if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas' && tecnica.dificuldade !== 'Difícil') return false;
        
        // Aplicar busca
        if (estadoTecnicas.buscaAtiva) {
            const busca = estadoTecnicas.buscaAtiva.toLowerCase();
            if (!tecnica.nome.toLowerCase().includes(busca) && 
                !tecnica.descricao.toLowerCase().includes(busca)) {
                return false;
            }
        }
        
        return true;
    });
    
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia">
                <i class="fas fa-info-circle"></i>
                <div>Nenhuma técnica encontrada</div>
                <small>${estadoTecnicas.buscaAtiva ? 'Tente outro termo de busca' : 'Verifique os pré-requisitos'}</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    tecnicasFiltradas.forEach(tecnica => {
        const calculo = tecnica.calculo || calcularNHTecnica();
        
        html += `
            <div class="pericia-item ${tecnica.disponivel ? '' : 'item-indisponivel'}" 
                onclick="${tecnica.disponivel ? `abrirModalTecnicaCompleta('${tecnica.id}')` : ''}"
                style="background: ${tecnica.jaAprendida ? 'rgba(39, 174, 96, 0.15)' : 'rgba(50, 50, 65, 0.9)'};
                       border: 1px solid ${tecnica.jaAprendida ? 'rgba(39, 174, 96, 0.4)' : 'rgba(255, 140, 0, 0.3)'};
                       cursor: ${tecnica.disponivel ? 'pointer' : 'not-allowed'};
                       opacity: ${tecnica.disponivel ? '1' : '0.6'};">
                
                <div class="pericia-header">
                    <h4 class="pericia-nome">
                        ${tecnica.nome}
                        ${tecnica.jaAprendida ? '<span style="color: #27ae60;">✓</span>' : ''}
                    </h4>
                    <div class="pericia-info">
                        <span class="pericia-dificuldade ${tecnica.dificuldade === 'Difícil' ? 'dificuldade-dificil' : 'dificuldade-medio'}">
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-custo">NH ${tecnica.nhAtual}</span>
                    </div>
                </div>
                
                <p class="pericia-descricao">${tecnica.descricao}</p>
                
                ${tecnica.disponivel ? `
                    <div style="font-size: 12px; color: #95a5a6; margin-top: 10px;">
                        <i class="fas fa-bullseye"></i> Clique para ${tecnica.jaAprendida ? 'melhorar' : 'aprender'}
                    </div>
                ` : `
                    <div class="tecnica-indisponivel-badge">
                        <i class="fas fa-lock"></i> ${tecnica.motivoIndisponivel}
                    </div>
                `}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>As técnicas que você aprender aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    const calculo = calcularNHTecnica();
    
    let html = '';
    
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const nhBase = calculo.nhBase;
        const nhAtual = nhBase + (tecnica.niveisComprados || 0);
        const excedeLimite = nhAtual > calculo.nhArco;
        
        html += `
            <div class="pericia-aprendida-item" style="border-color: ${excedeLimite ? '#e74c3c' : 'rgba(155, 89, 182, 0.4)'};">
                <div class="pericia-aprendida-header">
                    <h4 class="pericia-aprendida-nome">
                        ${tecnica.nome}
                        ${excedeLimite ? '<span style="color: #e74c3c; font-size: 0.8em;">⚠️</span>' : ''}
                    </h4>
                    <div class="pericia-aprendida-info">
                        <span class="pericia-aprendida-nivel">NH ${nhAtual}</span>
                        <span class="pericia-aprendida-custo">${tecnica.custoTotal || 0} pts</span>
                    </div>
                </div>
                
                <div style="font-size: 13px; color: #95a5a6; margin-top: 5px;">
                    <div><strong>Níveis comprados:</strong> ${tecnica.niveisComprados || 0}</div>
                    <div><strong>Cálculo:</strong> ${calculo.dx} (DX) + ${calculo.nivelArco} (Arco) = ${calculo.nhArco} → ${calculo.nhArco} - 4 + ${tecnica.niveisComprados || 0} = ${nhAtual}</div>
                </div>
                
                <button onclick="removerTecnica('${tecnica.id}')" class="btn-remover-pericia">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== REMOVER TÉCNICA =====
function removerTecnica(id) {
    if (confirm('Tem certeza que deseja remover esta técnica? Os pontos serão perdidos.')) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
        salvarTecnicas();
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
    }
}

// ===== MODAL COMPLETO =====
function abrirModalTecnicaCompleta(id) {
    const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
    if (!tecnica) return;
    
    estadoTecnicas.tecnicaSelecionada = tecnica;
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === id);
    
    const calculo = calcularNHTecnica();
    const nhBase = calculo.nhBase;
    const nhMaximo = calculo.nhArco;
    
    let nhAtual = nhBase;
    let niveisComprados = 0;
    let custoTotal = 0;
    
    if (jaAprendida) {
        niveisComprados = jaAprendida.niveisComprados || 0;
        custoTotal = jaAprendida.custoTotal || 0;
        nhAtual = nhBase + niveisComprados;
    }
    
    // Criar opções de NH
    let opcoesHTML = '';
    const niveisPossiveis = Math.max(0, nhMaximo - nhBase);
    
    for (let i = 0; i <= niveisPossiveis; i++) {
        const nhOpcao = nhBase + i;
        const custo = calcularCustoTecnica(i, tecnica.dificuldade);
        const selected = i === niveisComprados ? 'selected' : '';
        
        opcoesHTML += `
            <option value="${i}" ${selected}>
                NH ${nhOpcao} (${custo} pontos)
            </option>
        `;
    }
    
    // Criar modal
    const modalHTML = `
        <div class="modal-tecnica-conteudo">
            <!-- Cabeçalho -->
            <div class="modal-tecnica-cabecalho">
                <h3>${tecnica.nome}</h3>
                <div>${tecnica.dificuldade} • Técnica Especial</div>
                <span class="modal-tecnica-fechar" onclick="fecharModalTecnicaCompleta()">×</span>
            </div>
            
            <!-- Corpo -->
            <div class="modal-tecnica-corpo">
                <!-- Cálculo -->
                <div class="modal-tecnica-calculo">
                    <h4><i class="fas fa-calculator"></i> Cálculo do NH</h4>
                    <div class="calculo-passos">
                        <div><strong>1. Seu DX:</strong> ${calculo.dx}</div>
                        <div><strong>2. Seu nível em Arco:</strong> ${calculo.nivelArco >= 0 ? '+' : ''}${calculo.nivelArco}</div>
                        <div><strong>3. NH em Arco:</strong> ${calculo.dx} + ${calculo.nivelArco} = <span class="destaque-azul">${calculo.nhArco}</span></div>
                        <div><strong>4. NH base da técnica:</strong> ${calculo.nhArco} - 4 = <span class="destaque-verde">${nhBase}</span></div>
                    </div>
                </div>
                
                <!-- Estatísticas -->
                <div class="modal-tecnica-estatisticas">
                    <div class="estatistica-item">
                        <div class="estatistica-titulo">Base (Arco-4)</div>
                        <div class="estatistica-valor" style="color: #3498db;">${nhBase}</div>
                    </div>
                    <div class="estatistica-item">
                        <div class="estatistica-titulo">Máximo (NH Arco)</div>
                        <div class="estatistica-valor" style="color: #e74c3c;">${nhMaximo}</div>
                    </div>
                    <div class="estatistica-item">
                        <div class="estatistica-titulo">Atual</div>
                        <div class="estatistica-valor" style="color: #f39c12;">${nhAtual}</div>
                    </div>
                </div>
                
                <!-- Seleção de nível -->
                <div class="modal-tecnica-selecao">
                    <label>Níveis acima da base (${nhBase}):</label>
                    <select id="select-niveis-tecnica-modal">
                        ${opcoesHTML}
                    </select>
                    <div class="selecao-info">Cada nível aumenta seu NH em +1</div>
                </div>
                
                <!-- Custo -->
                <div class="modal-tecnica-custo">
                    <div class="custo-titulo">Custo Total</div>
                    <div id="custo-modal-display" class="custo-valor">${custoTotal} pontos</div>
                    <div class="custo-info">Técnica ${tecnica.dificuldade} • ~${tecnica.dificuldade === 'Difícil' ? '1.5' : '1'} ponto por nível</div>
                </div>
                
                <!-- Descrição -->
                <div class="modal-tecnica-descricao">
                    <h4><i class="fas fa-book"></i> Descrição</h4>
                    <p>${tecnica.descricao}</p>
                </div>
                
                <!-- Regras -->
                <div class="modal-tecnica-regras">
                    <h4><i class="fas fa-info-circle"></i> Regras Importantes</h4>
                    <ul>
                        <li>NH base = NH em Arco - 4 (pré-definido)</li>
                        <li>Pode comprar níveis adicionais acima da base</li>
                        <li>NUNCA pode exceder seu NH em Arco (${calculo.nhArco})</li>
                        <li>Penalidades para disparar montado não reduzem abaixo do NH nesta técnica</li>
                    </ul>
                </div>
            </div>
            
            <!-- Rodapé -->
            <div class="modal-tecnica-rodape">
                <button class="btn-modal-cancelar" onclick="fecharModalTecnicaCompleta()">Cancelar</button>
                <button class="btn-modal-confirmar" id="btn-confirmar-tecnica" onclick="comprarTecnicaCompleta()">
                    ${jaAprendida ? 'Atualizar' : 'Comprar'}
                </button>
            </div>
        </div>
    `;
    
    // Adicionar CSS se não existir
    if (!document.getElementById('estilo-modal-tecnicas')) {
        const estilo = document.createElement('style');
        estilo.id = 'estilo-modal-tecnicas';
        estilo.textContent = `
            .modal-tecnica-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.85);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                padding: 20px;
            }
            
            .modal-tecnica-conteudo {
                background: linear-gradient(135deg, #1e1e28 0%, #2c3e50 100%);
                border-radius: 12px;
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                border: 3px solid #ff8c00;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }
            
            .modal-tecnica-cabecalho {
                background: rgba(0,0,0,0.3);
                padding: 25px;
                border-radius: 12px 12px 0 0;
                position: relative;
            }
            
            .modal-tecnica-cabecalho h3 {
                margin: 0;
                color: #ffd700;
                font-size: 24px;
            }
            
            .modal-tecnica-cabecalho div {
                color: #95a5a6;
                margin-top: 8px;
                font-size: 14px;
            }
            
            .modal-tecnica-fechar {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(0,0,0,0.3);
                color: #ffd700;
                font-size: 28px;
                cursor: pointer;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            
            .modal-tecnica-corpo {
                padding: 25px;
            }
            
            .modal-tecnica-calculo {
                background: rgba(41, 128, 185, 0.15);
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                border-left: 4px solid #2980b9;
            }
            
            .modal-tecnica-calculo h4 {
                color: #3498db;
                margin-top: 0;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .calculo-passos {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                font-size: 14px;
            }
            
            .calculo-passos div {
                color: #ccc;
                padding: 5px 0;
            }
            
            .destaque-azul {
                color: #3498db;
                font-weight: bold;
            }
            
            .destaque-verde {
                color: #27ae60;
                font-weight: bold;
            }
            
            .modal-tecnica-estatisticas {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-bottom: 25px;
            }
            
            .estatistica-item {
                text-align: center;
                padding: 15px;
                background: rgba(0,0,0,0.3);
                border-radius: 8px;
            }
            
            .estatistica-titulo {
                font-size: 11px;
                color: #95a5a6;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 5px;
            }
            
            .estatistica-valor {
                font-size: 32px;
                font-weight: bold;
                margin: 5px 0;
            }
            
            .modal-tecnica-selecao {
                margin-bottom: 25px;
            }
            
            .modal-tecnica-selecao label {
                display: block;
                color: #ffd700;
                margin-bottom: 12px;
                font-size: 16px;
                font-weight: bold;
            }
            
            #select-niveis-tecnica-modal {
                width: 100%;
                padding: 15px;
                background: rgba(0,0,0,0.3);
                color: #fff;
                border: 2px solid #555;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
            }
            
            .selecao-info {
                font-size: 12px;
                color: #95a5a6;
                margin-top: 8px;
            }
            
            .modal-tecnica-custo {
                background: rgba(39, 174, 96, 0.1);
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 25px;
                border-left: 4px solid #27ae60;
            }
            
            .custo-titulo {
                font-size: 12px;
                color: #95a5a6;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .custo-valor {
                font-size: 36px;
                font-weight: bold;
                color: #27ae60;
                margin: 5px 0;
            }
            
            .custo-info {
                font-size: 12px;
                color: #95a5a6;
            }
            
            .modal-tecnica-descricao {
                margin-bottom: 20px;
            }
            
            .modal-tecnica-descricao h4 {
                color: #ffd700;
                margin-bottom: 12px;
                font-size: 16px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .modal-tecnica-descricao p {
                color: #ccc;
                line-height: 1.6;
                font-size: 14px;
            }
            
            .modal-tecnica-regras {
                background: rgba(155, 89, 182, 0.1);
                padding: 15px;
                border-radius: 5px;
                border-left: 4px solid #9b59b6;
            }
            
            .modal-tecnica-regras h4 {
                color: #9b59b6;
                margin-top: 0;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .modal-tecnica-regras ul {
                margin: 0;
                padding-left: 20px;
                color: #ccc;
                font-size: 14px;
            }
            
            .modal-tecnica-regras li {
                margin-bottom: 5px;
            }
            
            .modal-tecnica-rodape {
                padding: 20px 25px;
                background: rgba(0,0,0,0.3);
                border-radius: 0 0 12px 12px;
                display: flex;
                gap: 15px;
                justify-content: flex-end;
            }
            
            .btn-modal-cancelar {
                padding: 12px 24px;
                background: #7f8c8d;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
            }
            
            .btn-modal-confirmar {
                padding: 12px 24px;
                background: linear-gradient(45deg, #ff8c00, #ffd700);
                color: #1e1e28;
                border: none;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                font-size: 14px;
            }
            
            .btn-modal-confirmar:disabled {
                background: #95a5a6;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(estilo);
    }
    
    // Criar ou atualizar modal
    let overlay = document.querySelector('.modal-tecnica-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'modal-tecnica-overlay';
        document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = modalHTML;
    overlay.style.display = 'flex';
    estadoTecnicas.modalAberto = true;
    
    // Configurar eventos do modal
    const select = document.getElementById('select-niveis-tecnica-modal');
    const custoDisplay = document.getElementById('custo-modal-display');
    const btnConfirmar = document.getElementById('btn-confirmar-tecnica');
    
    function atualizarCustoModal() {
        if (!select || !custoDisplay) return;
        
        const niveisSelecionados = parseInt(select.value);
        const custo = calcularCustoTecnica(niveisSelecionados, tecnica.dificuldade);
        
        custoDisplay.textContent = `${custo} pontos`;
        
        if (btnConfirmar) {
            if (jaAprendida && niveisSelecionados === niveisComprados) {
                btnConfirmar.textContent = 'Manter';
                btnConfirmar.disabled = true;
                btnConfirmar.style.background = '#95a5a6';
            } else {
                btnConfirmar.textContent = jaAprendida ? 'Atualizar' : 'Comprar';
                btnConfirmar.disabled = false;
                btnConfirmar.style.background = 'linear-gradient(45deg, #ff8c00, #ffd700)';
            }
        }
    }
    
    if (select) {
        select.addEventListener('change', atualizarCustoModal);
        atualizarCustoModal();
    }
}

// ===== FECHAR MODAL =====
function fecharModalTecnicaCompleta() {
    const overlay = document.querySelector('.modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    estadoTecnicas.modalAberto = false;
    estadoTecnicas.tecnicaSelecionada = null;
}

// ===== COMPRAR TÉCNICA =====
function comprarTecnicaCompleta() {
    if (!estadoTecnicas.tecnicaSelecionada) return;
    
    const select = document.getElementById('select-niveis-tecnica-modal');
    if (!select) return;
    
    const niveisComprados = parseInt(select.value);
    const custo = calcularCustoTecnica(niveisComprados, estadoTecnicas.tecnicaSelecionada.dificuldade);
    
    const tecnicaId = estadoTecnicas.tecnicaSelecionada.id;
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnicaId);
    
    if (index >= 0) {
        // Atualizar técnica existente
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisComprados: niveisComprados,
            custoTotal: custo,
            dataAtualizacao: new Date().toISOString()
        };
    } else {
        // Nova técnica
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnicaId,
            nome: estadoTecnicas.tecnicaSelecionada.nome,
            dificuldade: estadoTecnicas.tecnicaSelecionada.dificuldade,
            niveisComprados: niveisComprados,
            custoTotal: custo,
            dataAquisicao: new Date().toISOString(),
            baseCalculo: estadoTecnicas.tecnicaSelecionada.baseCalculo
        });
    }
    
    // Salvar
    salvarTecnicas();
    
    // Atualizar tudo
    atualizarTecnicasDisponiveis();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
    
    // Fechar modal
    fecharModalTecnicaCompleta();
    
    // Mostrar mensagem
    const calculo = calcularNHTecnica();
    const nhFinal = calculo.nhBase + niveisComprados;
    alert(`✅ ${estadoTecnicas.tecnicaSelecionada.nome} ${index >= 0 ? 'atualizada' : 'aprendida'}!\n\nNH Final: ${nhFinal}\nCusto: ${custo} pontos`);
}

// ===== ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticasTecnicas() {
    // Zerar contadores
    estadoTecnicas.pontosTecnicasTotal = 0;
    estadoTecnicas.pontosMedio = 0;
    estadoTecnicas.pontosDificil = 0;
    estadoTecnicas.qtdMedio = 0;
    estadoTecnicas.qtdDificil = 0;
    
    // Calcular
    estadoTecnicas.tecnicasAprendidas.forEach(t => {
        const custo = t.custoTotal || 0;
        estadoTecnicas.pontosTecnicasTotal += custo;
        
        if (t.dificuldade === 'Média') {
            estadoTecnicas.qtdMedio++;
            estadoTecnicas.pontosMedio += custo;
        } else if (t.dificuldade === 'Difícil') {
            estadoTecnicas.qtdDificil++;
            estadoTecnicas.pontosDificil += custo;
        }
    });
    
    estadoTecnicas.qtdTotal = estadoTecnicas.qtdMedio + estadoTecnicas.qtdDificil;
    
    // Atualizar HTML
    const elementos = {
        'qtd-tecnicas-medio': estadoTecnicas.qtdMedio,
        'pts-tecnicas-medio': `(${estadoTecnicas.pontosMedio} pts)`,
        'qtd-tecnicas-dificil': estadoTecnicas.qtdDificil,
        'pts-tecnicas-dificil': `(${estadoTecnicas.pontosDificil} pts)`,
        'qtd-tecnicas-total': estadoTecnicas.qtdTotal,
        'pts-tecnicas-total': `(${estadoTecnicas.pontosTecnicasTotal} pts)`
    };
    
    for (const [id, valor] of Object.entries(elementos)) {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    }
}

// ===== CONFIGURAR EVENTOS =====
function configurarEventListeners() {
    // Filtros
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const filtro = this.getAttribute('data-filtro');
            estadoTecnicas.filtroAtivo = filtro;
            
            // Atualizar botões ativos
            document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            renderizarCatalogoTecnicas();
        });
    });
    
    // Busca
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoTecnicas.buscaAtiva = this.value;
            renderizarCatalogoTecnicas();
        });
    }
    
    // Fechar modal ao clicar fora
    document.addEventListener('click', function(e) {
        const overlay = document.querySelector('.modal-tecnica-overlay');
        if (overlay && e.target === overlay && estadoTecnicas.modalAberto) {
            fecharModalTecnicaCompleta();
        }
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && estadoTecnicas.modalAberto) {
            fecharModalTecnicaCompleta();
        }
    });
}

// ===== INICIALIZAR SISTEMA =====
function inicializarSistemaTecnicas() {
    // Carregar dados salvos
    carregarTecnicasSalvas();
    
    // Configurar eventos
    configurarEventListeners();
    
    // Inicializar
    setTimeout(() => {
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
    }, 100);
}

// ===== INICIAR QUANDO A ABA CARREGAR =====
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na aba de técnicas
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'style' || mutation.attributeName === 'class') {
                const tecnicasTab = document.getElementById('tecnicas');
                if (tecnicasTab && 
                    (tecnicasTab.style.display !== 'none' || 
                     tecnicasTab.classList.contains('active'))) {
                    
                    if (!window.sistemaTecnicasInicializado) {
                        setTimeout(() => {
                            inicializarSistemaTecnicas();
                            window.sistemaTecnicasInicializado = true;
                        }, 300);
                    }
                }
            }
        });
    });
    
    // Observar a aba de técnicas
    const tecnicasTab = document.getElementById('tecnicas');
    if (tecnicasTab) {
        observer.observe(tecnicasTab, { 
            attributes: true, 
            attributeFilter: ['style', 'class'] 
        });
        
        // Inicializar imediatamente se já estiver ativa
        if (tecnicasTab.style.display !== 'none' || tecnicasTab.classList.contains('active')) {
            setTimeout(() => {
                if (!window.sistemaTecnicasInicializado) {
                    inicializarSistemaTecnicas();
                    window.sistemaTecnicasInicializado = true;
                }
            }, 300);
        }
    }
});

// ===== EXPORTAR FUNÇÕES =====
window.abrirModalTecnicaCompleta = abrirModalTecnicaCompleta;
window.fecharModalTecnicaCompleta = fecharModalTecnicaCompleta;
window.comprarTecnicaCompleta = comprarTecnicaCompleta;
window.removerTecnica = removerTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;