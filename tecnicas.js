// ===== SISTEMA COMPLETO DE TÉCNICAS =====
const estadoTecnicas = {
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
    monitoramentoAtivo: false,
    cacheNHPericias: new Map()
};

// ===== TABELA DE CUSTO COMPLETA =====
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
        return 11 + (niveisAcima - 10);
    }
    
    if (dificuldade === 'Média') {
        if (niveisAcima <= 4) return niveisAcima;
        if (niveisAcima === 5) return 6;
        if (niveisAcima === 6) return 7;
        if (niveisAcima === 7) return 8;
        if (niveisAcima === 8) return 9;
        if (niveisAcima === 9) return 10;
        if (niveisAcima === 10) return 11;
        return 11 + (niveisAcima - 10);
    }
    
    return 0;
}

// ===== FUNÇÃO PARA OBTER DADOS DOS ATRIBUTOS =====
function obterDadosAtributosCompleto() {
    // Tenta usar função global primeiro
    if (typeof window.obterDadosAtributos === 'function') {
        try {
            return window.obterDadosAtributos();
        } catch (e) {
            console.warn('Função obterDadosAtributos falhou:', e);
        }
    }
    
    // Fallback: tenta pegar dos elementos HTML
    try {
        const elementos = {
            DX: document.querySelector('[data-atributo="DX"]') || document.getElementById('valor-dx'),
            IQ: document.querySelector('[data-atributo="IQ"]') || document.getElementById('valor-iq'),
            HT: document.querySelector('[data-atributo="HT"]') || document.getElementById('valor-ht'),
            FOR: document.querySelector('[data-atributo="FOR"]') || document.getElementById('valor-for'),
            PERC: null // Calculado
        };
        
        const dados = { DX: 10, IQ: 10, HT: 10, FOR: 10, Bonus: {} };
        
        // Tenta obter valores
        for (const [atributo, elemento] of Object.entries(elementos)) {
            if (elemento) {
                let valor = 10;
                if (elemento.textContent) {
                    const match = elemento.textContent.match(/\d+/);
                    if (match) valor = parseInt(match[0]);
                } else if (elemento.value) {
                    valor = parseInt(elemento.value) || 10;
                }
                dados[atributo] = valor;
            }
        }
        
        // Calcular PERC (IQ + bônus de Percepção)
        const bonusPercepcao = dados.Bonus?.Percepcao || 0;
        dados.PERC = dados.IQ + bonusPercepcao;
        
        return dados;
    } catch (e) {
        console.warn('Não foi possível obter atributos:', e);
        return { DX: 10, IQ: 10, HT: 10, FOR: 10, PERC: 10, Bonus: {} };
    }
}

// ===== FUNÇÃO PARA OBTER NH DE PERÍCIA (COMPLETA) =====
function obterNHPericiaCompleto(idPericia, usarCache = true) {
    // Verificar cache primeiro
    if (usarCache && estadoTecnicas.cacheNHPericias.has(idPericia)) {
        return estadoTecnicas.cacheNHPericias.get(idPericia);
    }
    
    let nh = 10; // Valor padrão
    
    // 1. Verificar se perícia existe no sistema
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const pericia = window.estadoPericias.periciasAprendidas.find(p => p.id === idPericia);
        
        if (pericia) {
            // Obter valor do atributo
            const dadosAtributos = obterDadosAtributosCompleto();
            let valorAtributo = 10;
            
            switch(pericia.atributo) {
                case 'DX': valorAtributo = dadosAtributos.DX; break;
                case 'IQ': valorAtributo = dadosAtributos.IQ; break;
                case 'HT': valorAtributo = dadosAtributos.HT; break;
                case 'PERC': valorAtributo = dadosAtributos.PERC; break;
                case 'FOR': valorAtributo = dadosAtributos.FOR; break;
                default: valorAtributo = 10;
            }
            
            // Calcular NH
            const nivelPericia = parseInt(pericia.nivel) || 0;
            nh = valorAtributo + nivelPericia;
            
            console.log(`📊 NH de ${pericia.nome || idPericia}: ${valorAtributo} (${pericia.atributo}) + ${nivelPericia} = ${nh}`);
        } else {
            console.warn(`Perícia ${idPericia} não encontrada no estadoPericias`);
        }
    } else {
        console.warn('Sistema de perícias não disponível');
    }
    
    // Atualizar cache
    estadoTecnicas.cacheNHPericias.set(idPericia, nh);
    
    return nh;
}

// ===== VERIFICAR PRÉ-REQUISITOS (COMPLETA) =====
function verificarPreRequisitosTecnicaCompleto(tecnica) {
    if (!tecnica || !tecnica.preRequisitos) {
        return { passou: false, motivo: "Técnica inválida" };
    }
    
    // Verificar cada pré-requisito
    for (const prereq of tecnica.preRequisitos) {
        if (prereq.idPericia) {
            // Verificar perícia específica
            const nhPericia = obterNHPericiaCompleto(prereq.idPericia);
            
            if (prereq.nivelMinimo && nhPericia < prereq.nivelMinimo) {
                return { 
                    passou: false, 
                    motivo: `${prereq.nomePericia || prereq.idPericia} precisa NH ${prereq.nivelMinimo} (tem ${nhPericia})` 
                };
            }
        }
        
        if (prereq.idsCavalgar) {
            // Verificar se tem alguma perícia de cavalgar
            let temCavalgar = false;
            for (const idCavalgar of prereq.idsCavalgar) {
                if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
                    const cavalgar = window.estadoPericias.periciasAprendidas.find(p => p.id === idCavalgar);
                    if (cavalgar) {
                        temCavalgar = true;
                        break;
                    }
                }
            }
            
            if (!temCavalgar) {
                return { passou: false, motivo: "Falta perícia de Cavalgar" };
            }
        }
    }
    
    return { passou: true, motivo: '' };
}

// ===== CALCULAR NH ATUAL DA TÉCNICA (COMPLETA) =====
function calcularNHAtualTecnicaCompleto(tecnicaAprendida) {
    if (!tecnicaAprendida) return 0;
    
    // Buscar dados da técnica no catálogo
    const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnicaAprendida.id);
    if (!tecnicaCatalogo) return 0;
    
    // Calcular base (NH da perícia + redutor)
    let base = 0;
    if (tecnicaCatalogo.baseCalculo && tecnicaCatalogo.baseCalculo.tipo === "pericia") {
        const nhPericia = obterNHPericiaCompleto(tecnicaCatalogo.baseCalculo.idPericia);
        base = nhPericia + (tecnicaCatalogo.baseCalculo.redutor || 0);
    }
    
    // Adicionar níveis acima da base
    const niveisAcima = parseInt(tecnicaAprendida.niveisAcimaBase) || 0;
    let nhFinal = base + niveisAcima;
    
    // Aplicar limite máximo
    if (tecnicaCatalogo.limiteMaximo) {
        if (tecnicaCatalogo.limiteMaximo.tipo === "pericia") {
            const limite = obterNHPericiaCompleto(tecnicaCatalogo.limiteMaximo.idPericia);
            nhFinal = Math.min(nhFinal, limite);
        } else if (tecnicaCatalogo.limiteMaximo.tipo === "fixo") {
            nhFinal = Math.min(nhFinal, parseInt(tecnicaCatalogo.limiteMaximo.valor) || Infinity);
        }
    }
    
    return Math.max(0, nhFinal);
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS (COMPLETA) =====
function atualizarTecnicasDisponiveisCompleto() {
    console.log('🔄 Atualizando técnicas disponíveis...');
    
    // Limpar cache
    estadoTecnicas.cacheNHPericias.clear();
    
    // Verificar catálogo
    if (!window.catalogoTecnicas || typeof window.catalogoTecnicas.obterTodasTecnicas !== 'function') {
        console.error('❌ Catálogo de técnicas não disponível');
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    if (!todasTecnicas || todasTecnicas.length === 0) {
        estadoTecnicas.tecnicasDisponiveis = [];
        renderizarCatalogoTecnicasCompleto();
        return;
    }
    
    const disponiveis = [];
    
    // Processar cada técnica
    todasTecnicas.forEach(tecnica => {
        try {
            // Verificar pré-requisitos
            const verificacao = verificarPreRequisitosTecnicaCompleto(tecnica);
            
            // Verificar se já foi aprendida
            const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
            
            // Calcular NH atual
            let nhAtual = 0;
            if (tecnica.baseCalculo && tecnica.baseCalculo.tipo === "pericia") {
                const nhPericia = obterNHPericiaCompleto(tecnica.baseCalculo.idPericia);
                nhAtual = nhPericia + (tecnica.baseCalculo.redutor || 0);
                
                // Adicionar níveis se já aprendida
                if (jaAprendida) {
                    nhAtual += (parseInt(jaAprendida.niveisAcimaBase) || 0);
                }
            }
            
            // Calcular limite máximo
            let limiteMaximo = Infinity;
            if (tecnica.limiteMaximo) {
                if (tecnica.limiteMaximo.tipo === "pericia") {
                    limiteMaximo = obterNHPericiaCompleto(tecnica.limiteMaximo.idPericia);
                }
            }
            
            disponiveis.push({
                ...tecnica,
                disponivel: verificacao.passou,
                nhAtual: nhAtual,
                limiteMaximo: limiteMaximo,
                custoAtual: jaAprendida ? (parseInt(jaAprendida.custoPago) || 0) : 0,
                jaAprendida: !!jaAprendida,
                motivoIndisponivel: verificacao.motivo,
                dadosJaAprendida: jaAprendida || null
            });
            
        } catch (error) {
            console.error(`Erro processando técnica ${tecnica.id}:`, error);
        }
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    console.log(`✅ ${disponiveis.length} técnicas processadas`);
    
    // Renderizar
    renderizarCatalogoTecnicasCompleto();
}

// ===== RENDERIZAR CATÁLOGO DE TÉCNICAS (COMPLETA) =====
function renderizarCatalogoTecnicasCompleto() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error('❌ Container lista-tecnicas não encontrado');
        return;
    }
    
    let tecnicasFiltradas = [...estadoTecnicas.tecnicasDisponiveis];
    
    // Aplicar filtros
    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Média');
    } else if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Difícil');
    }
    
    // Aplicar busca
    if (estadoTecnicas.buscaAtiva.trim() !== '') {
        const termo = estadoTecnicas.buscaAtiva.toLowerCase();
        tecnicasFiltradas = tecnicasFiltradas.filter(t => 
            t.nome.toLowerCase().includes(termo) ||
            (t.descricao && t.descricao.toLowerCase().includes(termo))
        );
    }
    
    // Renderizar
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #95a5a6;">
                <i class="fas fa-search" style="font-size: 2em; margin-bottom: 15px; color: #ff8c00;"></i>
                <div>Nenhuma técnica encontrada</div>
                <small>${estadoTecnicas.buscaAtiva ? 'Tente com outros termos' : 'Aprenda as perícias necessárias'}</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    tecnicasFiltradas.forEach(tecnica => {
        const disponivel = tecnica.disponivel;
        const jaAprendida = tecnica.jaAprendida;
        const dificuldadeCor = tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12';
        
        // Calcular NH base (sem níveis adicionais)
        let nhBase = 0;
        if (tecnica.baseCalculo && tecnica.baseCalculo.tipo === "pericia") {
            const nhPericia = obterNHPericiaCompleto(tecnica.baseCalculo.idPericia);
            nhBase = nhPericia + (tecnica.baseCalculo.redutor || 0);
        }
        
        html += `
            <div class="pericia-item" 
                 data-id="${tecnica.id}"
                 data-disponivel="${disponivel}"
                 style="cursor: ${disponivel ? 'pointer' : 'not-allowed'};
                        opacity: ${disponivel ? '1' : '0.7'};
                        border-left: 4px solid ${dificuldadeCor};
                        background: ${jaAprendida ? 'rgba(39, 174, 96, 0.1)' : 'rgba(50, 50, 65, 0.9)'};
                        border: 1px solid ${jaAprendida ? 'rgba(39, 174, 96, 0.3)' : 'rgba(255, 140, 0, 0.3)'};
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 12px;
                        transition: all 0.3s ease;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div>
                        <h4 style="margin: 0; color: #ffd700; font-size: 16px;">
                            ${tecnica.nome}
                            ${jaAprendida ? '<span style="color: #27ae60; margin-left: 8px;">✓</span>' : ''}
                        </h4>
                        <div style="font-size: 12px; color: #95a5a6; margin-top: 3px;">
                            Base: ${tecnica.baseCalculo?.idPericia || 'Perícia'} 
                            ${tecnica.baseCalculo?.redutor >= 0 ? '+' : ''}${tecnica.baseCalculo?.redutor || 0}
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span style="background: ${dificuldadeCor}; 
                              color: white; padding: 4px 10px; border-radius: 12px; 
                              font-size: 12px; font-weight: 600;">
                            ${tecnica.dificuldade}
                        </span>
                        <span style="background: #3498db; color: white; padding: 4px 10px; 
                              border-radius: 12px; font-size: 12px; font-weight: 600;">
                            NH ${tecnica.nhAtual}
                        </span>
                    </div>
                </div>
                
                <p style="color: #ccc; font-size: 13px; line-height: 1.4; margin: 8px 0;">
                    ${tecnica.descricao}
                </p>
                
                ${!disponivel ? `
                <div style="background: rgba(231, 76, 60, 0.1); padding: 8px; border-radius: 5px;
                          margin-top: 8px; border-left: 3px solid #e74c3c;">
                    <i class="fas fa-lock" style="color: #e74c3c; margin-right: 5px;"></i>
                    <span style="color: #e74c3c; font-size: 12px;">${tecnica.motivoIndisponivel}</span>
                </div>
                ` : `
                <div style="display: flex; justify-content: space-between; align-items: center; 
                          margin-top: 10px; font-size: 12px; color: #95a5a6;">
                    <div>
                        <i class="fas fa-bullseye" style="margin-right: 5px;"></i>
                        ${jaAprendida ? 'Clique para editar' : 'Clique para aprender'}
                    </div>
                    <div>
                        ${tecnica.limiteMaximo !== Infinity ? 
                          `<i class="fas fa-chart-line" style="margin-right: 5px;"></i>
                           Máx: NH ${tecnica.limiteMaximo}` : ''}
                    </div>
                </div>
                `}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adicionar eventos
    container.querySelectorAll('.pericia-item[data-disponivel="true"]').forEach(item => {
        item.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
            if (tecnica) {
                abrirModalTecnicaCompleto(tecnica);
            }
        });
        
        // Efeitos hover
        item.addEventListener('mouseenter', function() {
            if (this.getAttribute('data-disponivel') === 'true') {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
}

// ===== RENDERIZAR TÉCNICAS APRENDIDAS (COMPLETA) =====
function renderizarTecnicasAprendidasCompleto() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #95a5a6; font-style: italic;">
                <i class="fas fa-tools" style="font-size: 2em; margin-bottom: 15px; color: #ff8c00;"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>As técnicas que você aprender aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
        if (!tecnicaCatalogo) return;
        
        // Calcular NH atual
        const nhAtual = calcularNHAtualTecnicaCompleto(tecnica);
        
        // Calcular limite máximo
        let limiteMaximo = nhAtual;
        if (tecnicaCatalogo.limiteMaximo) {
            if (tecnicaCatalogo.limiteMaximo.tipo === "pericia") {
                limiteMaximo = obterNHPericiaCompleto(tecnicaCatalogo.limiteMaximo.idPericia);
            }
        }
        
        // Calcular NH base
        let nhBase = 0;
        if (tecnicaCatalogo.baseCalculo && tecnicaCatalogo.baseCalculo.tipo === "pericia") {
            const nhPericia = obterNHPericiaCompleto(tecnicaCatalogo.baseCalculo.idPericia);
            nhBase = nhPericia + (tecnicaCatalogo.baseCalculo.redutor || 0);
        }
        
        const dificuldadeCor = tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12';
        const niveisAcima = parseInt(tecnica.niveisAcimaBase) || 0;
        
        html += `
            <div style="background: rgba(155, 89, 182, 0.05); 
                        border-left: 4px solid ${dificuldadeCor};
                        border: 1px solid rgba(155, 89, 182, 0.3);
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 12px;
                        position: relative;
                        transition: all 0.3s ease;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; 
                          margin-bottom: 10px; padding-right: 40px;">
                    <div>
                        <h4 style="margin: 0; color: #ffd700; font-size: 16px;">${tecnica.nome}</h4>
                        <div style="font-size: 12px; color: #95a5a6; margin-top: 3px;">
                            ${tecnicaCatalogo.baseCalculo?.idPericia || 'Base'} 
                            ${tecnicaCatalogo.baseCalculo?.redutor >= 0 ? '+' : ''}${tecnicaCatalogo.baseCalculo?.redutor || 0}
                            + ${niveisAcima} níveis
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span style="background: #3498db; color: white; padding: 4px 10px; 
                              border-radius: 12px; font-size: 12px; font-weight: 600;">
                            NH ${nhAtual}
                        </span>
                        <span style="background: ${dificuldadeCor}; color: white; padding: 4px 10px; 
                              border-radius: 12px; font-size: 12px; font-weight: 600;">
                            ${tecnica.dificuldade}
                        </span>
                        <span style="background: #27ae60; color: white; padding: 4px 10px; 
                              border-radius: 12px; font-size: 12px; font-weight: 600;">
                            ${tecnica.custoPago} pts
                        </span>
                    </div>
                </div>
                
                <div style="font-size: 12px; color: #95a5a6; margin-top: 8px;">
                    <div><strong>Base:</strong> NH ${nhBase} | <strong>Níveis acima:</strong> ${niveisAcima}</div>
                    <div><strong>Máximo possível:</strong> NH ${limiteMaximo}</div>
                </div>
                
                <button onclick="removerTecnicaCompleto('${tecnica.id}')" 
                        style="position: absolute; top: 15px; right: 15px; 
                               background: #e74c3c; color: white; border: none;
                               border-radius: 50%; width: 30px; height: 30px;
                               cursor: pointer; display: flex; align-items: center;
                               justify-content: center; font-size: 14px;"
                        title="Remover técnica">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== ABRIR MODAL DE TÉCNICA (COMPLETA) =====
function abrirModalTecnicaCompleto(tecnica) {
    if (estadoTecnicas.modalAberto) return;
    
    estadoTecnicas.modalAberto = true;
    
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    const modal = document.querySelector('.modal-tecnica');
    
    if (!modalOverlay || !modal) {
        console.error('Modal não encontrado');
        estadoTecnicas.modalAberto = false;
        return;
    }
    
    const jaAprendida = tecnica.dadosJaAprendida || estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    // Calcular valores
    let nhBase = 0;
    if (tecnica.baseCalculo && tecnica.baseCalculo.tipo === "pericia") {
        const nhPericia = obterNHPericiaCompleto(tecnica.baseCalculo.idPericia, false); // Sem cache para valor atual
        nhBase = nhPericia + (tecnica.baseCalculo.redutor || 0);
    }
    
    const niveisAtuais = jaAprendida ? (parseInt(jaAprendida.niveisAcimaBase) || 0) : 0;
    const nhAtual = nhBase + niveisAtuais;
    
    let nhMaximo = Infinity;
    if (tecnica.limiteMaximo) {
        if (tecnica.limiteMaximo.tipo === "pericia") {
            nhMaximo = obterNHPericiaCompleto(tecnica.limiteMaximo.idPericia, false);
        }
    }
    
    // Garantir que nhMaximo seja pelo menos nhBase
    nhMaximo = Math.max(nhMaximo, nhBase);
    
    // Criar opções de nível
    let opcoesNH = '';
    for (let nh = nhBase; nh <= nhMaximo; nh++) {
        const niveisAcima = nh - nhBase;
        const custo = calcularCustoTecnica(niveisAcima, tecnica.dificuldade);
        const selecionado = nh === nhAtual ? 'selected' : '';
        
        opcoesNH += `
            <option value="${nh}" data-niveis="${niveisAcima}" data-custo="${custo}" ${selecionado}>
                NH ${nh} (${custo} pontos)${nh === nhBase ? ' - Base' : ''}
            </option>
        `;
    }
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #2c3e50, #4a235a); 
                    color: white; padding: 20px; border-radius: 8px 8px 0 0; position: relative;">
            <span onclick="fecharModalTecnicaCompleto()" 
                  style="position: absolute; right: 20px; top: 20px; font-size: 28px; 
                         cursor: pointer; color: #ffd700; font-weight: bold;">
                &times;
            </span>
            <h3 style="margin: 0; color: #ffd700; padding-right: 30px;">${tecnica.nome}</h3>
            <div style="color: #95a5a6; margin-top: 5px;">
                ${tecnica.dificuldade} • Base: ${tecnica.baseCalculo?.idPericia || 'Perícia'} 
                ${tecnica.baseCalculo?.redutor >= 0 ? '+' : ''}${tecnica.baseCalculo?.redutor || 0}
            </div>
        </div>
        
        <div style="padding: 20px; background: #1e1e28; color: #ccc; max-height: 60vh; overflow-y: auto;">
            <!-- Estatísticas -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px;">
                <div style="text-align: center; padding: 15px; background: rgba(52, 152, 219, 0.1); 
                          border-radius: 8px; border: 1px solid rgba(52, 152, 219, 0.3);">
                    <div style="font-size: 11px; color: #95a5a6; margin-bottom: 5px;">NÍVEL BASE</div>
                    <div style="font-size: 28px; font-weight: bold; color: #3498db;">${nhBase}</div>
                    <div style="font-size: 11px; color: #95a5a6; margin-top: 5px;">
                        ${tecnica.baseCalculo?.idPericia || ''} 
                        ${tecnica.baseCalculo?.redutor >= 0 ? '+' : ''}${tecnica.baseCalculo?.redutor || 0}
                    </div>
                </div>
                
                <div style="text-align: center; padding: 15px; background: rgba(39, 174, 96, 0.1); 
                          border-radius: 8px; border: 1px solid rgba(39, 174, 96, 0.3);">
                    <div style="font-size: 11px; color: #95a5a6; margin-bottom: 5px;">MÁXIMO</div>
                    <div style="font-size: 28px; font-weight: bold; color: #27ae60;">${nhMaximo}</div>
                    <div style="font-size: 11px; color: #95a5a6; margin-top: 5px;">
                        ${tecnica.limiteMaximo ? `Limite: ${tecnica.limiteMaximo.idPericia || 'fixo'}` : 'Sem limite'}
                    </div>
                </div>
                
                <div style="text-align: center; padding: 15px; background: rgba(243, 156, 18, 0.1); 
                          border-radius: 8px; border: 1px solid rgba(243, 156, 18, 0.3);">
                    <div style="font-size: 11px; color: #95a5a6; margin-bottom: 5px;">NÍVEL ATUAL</div>
                    <div style="font-size: 28px; font-weight: bold; color: #f39c12;">${nhAtual}</div>
                    <div style="font-size: 11px; color: #95a5a6; margin-top: 5px;">
                        Base + ${niveisAtuais} níveis
                    </div>
                </div>
            </div>
            
            <!-- Seletor de Nível -->
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 10px; color: #ffd700; font-weight: bold; font-size: 14px;">
                    <i class="fas fa-sliders-h" style="margin-right: 8px;"></i>
                    Selecione o NH desejado:
                </label>
                <select id="select-nh-tecnica-modal" 
                        style="width: 100%; padding: 14px; border-radius: 8px; border: 2px solid #ff8c00;
                               background: #2c3e50; color: #ffd700; font-size: 16px; cursor: pointer;
                               font-weight: 600;">
                    ${opcoesNH}
                </select>
                <div style="font-size: 12px; color: #95a5a6; margin-top: 8px; text-align: center;">
                    Escolha entre NH ${nhBase} (base) e NH ${nhMaximo} (máximo)
                </div>
            </div>
            
            <!-- Custo -->
            <div style="background: rgba(39, 174, 96, 0.1); padding: 20px; border-radius: 8px; 
                      border-left: 4px solid #27ae60; margin-bottom: 25px;">
                <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">CUSTO TOTAL</div>
                <div id="custo-tecnica-modal" style="font-size: 32px; font-weight: bold; color: #27ae60;">
                    ${jaAprendida ? jaAprendida.custoPago || 0 : 0} pontos
                </div>
                ${jaAprendida ? `
                <div style="font-size: 11px; color: #95a5a6; margin-top: 5px;">
                    Já investido: ${jaAprendida.custoPago || 0} pontos
                </div>
                ` : ''}
            </div>
            
            <!-- Descrição -->
            <div style="margin-bottom: 20px;">
                <h4 style="color: #ffd700; margin-bottom: 10px; font-size: 16px;">
                    <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
                    Descrição
                </h4>
                <p style="line-height: 1.6; color: #ccc; font-size: 14px;">${tecnica.descricao}</p>
            </div>
            
            <!-- Pré-requisitos -->
            <div style="background: rgba(255, 140, 0, 0.1); padding: 15px; border-radius: 8px; 
                      border-left: 4px solid #ff8c00; margin-bottom: 15px;">
                <h4 style="color: #ffd700; margin: 0 0 8px 0; font-size: 14px;">
                    <i class="fas fa-list-check" style="margin-right: 8px;"></i>
                    Pré-requisitos
                </h4>
                <div style="color: #ccc; font-size: 13px;">
                    ${tecnica.preRequisitos.map(p => 
                        `<div style="margin-bottom: 4px;">
                            • ${p.nomePericia || p.idPericia} ${p.nivelMinimo > 0 ? `(NH ${p.nivelMinimo}+)` : ''}
                         </div>`
                    ).join('')}
                </div>
            </div>
            
            <!-- Regras Especiais -->
            <div style="background: rgba(155, 89, 182, 0.1); padding: 15px; border-radius: 8px; 
                      border-left: 4px solid #9b59b6;">
                <h4 style="color: #9b59b6; margin: 0 0 8px 0; font-size: 14px;">
                    <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>
                    Regras Especiais
                </h4>
                <div style="color: #ccc; font-size: 13px;">
                    • Base: NH em ${tecnica.baseCalculo?.idPericia || 'Perícia'} ${tecnica.baseCalculo?.redutor >= 0 ? '+' : ''}${tecnica.baseCalculo?.redutor || 0}<br>
                    ${tecnica.limiteMaximo ? 
                      `• Não pode exceder o NH em ${tecnica.limiteMaximo.idPericia || 'valor fixo'}` : 
                      '• Sem limite máximo'}
                </div>
            </div>
        </div>
        
        <!-- Ações -->
        <div style="padding: 20px; background: #2c3e50; border-radius: 0 0 8px 8px; 
                  display: flex; gap: 12px; justify-content: flex-end;">
            <button onclick="fecharModalTecnicaCompleto()" 
                    style="padding: 12px 24px; background: rgba(255, 255, 255, 0.1); 
                           color: #ffd700; border: 1px solid rgba(255, 140, 0, 0.3);
                           border-radius: 6px; cursor: pointer; font-weight: 600;
                           transition: all 0.3s ease;">
                Cancelar
            </button>
            <button onclick="confirmarTecnicaCompleto('${tecnica.id}')" 
                    id="btn-confirmar-tecnica-modal"
                    style="padding: 12px 24px; background: linear-gradient(45deg, #ff8c00, #ffd700); 
                           color: #1e1e28; border: none; border-radius: 6px; font-weight: bold; 
                           cursor: pointer; transition: all 0.3s ease;">
                ${jaAprendida ? 'Atualizar' : 'Aprender'}
            </button>
        </div>
    `;
    
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Configurar eventos do select
    const selectNH = document.getElementById('select-nh-tecnica-modal');
    const custoDisplay = document.getElementById('custo-tecnica-modal');
    const btnConfirmar = document.getElementById('btn-confirmar-tecnica-modal');
    
    function atualizarDisplayCusto() {
        if (!selectNH || !custoDisplay || !btnConfirmar) return;
        
        const opcao = selectNH.options[selectNH.selectedIndex];
        const custo = parseInt(opcao.getAttribute('data-custo'));
        const niveis = parseInt(opcao.getAttribute('data-niveis'));
        
        custoDisplay.textContent = `${custo} pontos`;
        
        if (jaAprendida && niveis === niveisAtuais) {
            btnConfirmar.textContent = 'Manter (0 pontos)';
            btnConfirmar.style.background = 'rgba(255, 255, 255, 0.1)';
            btnConfirmar.style.color = '#95a5a6';
            btnConfirmar.style.cursor = 'not-allowed';
            btnConfirmar.disabled = true;
        } else {
            const diferenca = custo - (jaAprendida?.custoPago || 0);
            if (jaAprendida) {
                if (diferenca > 0) {
                    btnConfirmar.textContent = `Melhorar (+${diferenca} pts)`;
                } else if (diferenca < 0) {
                    btnConfirmar.textContent = `Reduzir (${diferenca} pts)`;
                } else {
                    btnConfirmar.textContent = 'Atualizar';
                }
            } else {
                btnConfirmar.textContent = `Aprender (${custo} pts)`;
            }
            
            btnConfirmar.style.background = 'linear-gradient(45deg, #ff8c00, #ffd700)';
            btnConfirmar.style.color = '#1e1e28';
            btnConfirmar.style.cursor = 'pointer';
            btnConfirmar.disabled = false;
        }
    }
    
    if (selectNH) {
        selectNH.addEventListener('change', atualizarDisplayCusto);
        atualizarDisplayCusto();
    }
    
    // Salvar dados do modal
    window.tecnicaModalAtual = {
        tecnica: tecnica,
        jaAprendida: jaAprendida,
        nhBase: nhBase,
        nhMaximo: nhMaximo
    };
}

// ===== CONFIRMAR TÉCNICA (COMPLETA) =====
function confirmarTecnicaCompleto(id) {
    if (!window.tecnicaModalAtual) return;
    
    const { tecnica, jaAprendida } = window.tecnicaModalAtual;
    const select = document.getElementById('select-nh-tecnica-modal');
    
    if (!select) return;
    
    const opcao = select.options[select.selectedIndex];
    const nhEscolhido = parseInt(select.value);
    const niveisAcima = parseInt(opcao.getAttribute('data-niveis'));
    const custo = parseInt(opcao.getAttribute('data-custo'));
    
    // Verificar se houve alteração
    if (jaAprendida && niveisAcima === (parseInt(jaAprendida.niveisAcimaBase) || 0)) {
        fecharModalTecnicaCompleto();
        return;
    }
    
    const tecnicaAtualizada = {
        id: tecnica.id,
        nome: tecnica.nome,
        descricao: tecnica.descricao,
        dificuldade: tecnica.dificuldade,
        baseCalculo: tecnica.baseCalculo,
        limiteMaximo: tecnica.limiteMaximo,
        preRequisitos: tecnica.preRequisitos,
        niveisAcimaBase: niveisAcima,
        custoPago: custo,
        dataAquisicao: new Date().toISOString()
    };
    
    // Adicionar ou atualizar
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === id);
    if (index >= 0) {
        estadoTecnicas.tecnicasAprendidas[index] = tecnicaAtualizada;
    } else {
        estadoTecnicas.tecnicasAprendidas.push(tecnicaAtualizada);
    }
    
    // Salvar
    salvarTecnicasCompleto();
    
    // Atualizar interface
    renderizarStatusTecnicasCompleto();
    renderizarTecnicasAprendidasCompleto();
    atualizarTecnicasDisponiveisCompleto();
    
    // Atualizar pontos totais se existir função
    if (typeof window.atualizarPontosTotais === 'function') {
        window.atualizarPontosTotais();
    }
    
    // Fechar modal
    fecharModalTecnicaCompleto();
    
    // Feedback
    const mensagem = jaAprendida ? 
        `✅ Técnica "${tecnica.nome}" atualizada para NH ${nhEscolhido}` :
        `✅ Técnica "${tecnica.nome}" aprendida com NH ${nhEscolhido}`;
    
    console.log(mensagem);
}

// ===== REMOVER TÉCNICA (COMPLETA) =====
function removerTecnicaCompleto(id) {
    if (!confirm('Tem certeza que deseja remover esta técnica?\n\nOs pontos gastos serão perdidos e não poderão ser recuperados.')) {
        return;
    }
    
    estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
    
    salvarTecnicasCompleto();
    renderizarStatusTecnicasCompleto();
    renderizarTecnicasAprendidasCompleto();
    atualizarTecnicasDisponiveisCompleto();
    
    if (typeof window.atualizarPontosTotais === 'function') {
        window.atualizarPontosTotais();
    }
    
    console.log(`🗑️ Técnica ${id} removida`);
}

// ===== FECHAR MODAL (COMPLETA) =====
function fecharModalTecnicaCompleto() {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    
    document.body.style.overflow = '';
    estadoTecnicas.modalAberto = false;
    delete window.tecnicaModalAtual;
}

// ===== RENDERIZAR STATUS (COMPLETA) =====
function renderizarStatusTecnicasCompleto() {
    // Resetar contadores
    estadoTecnicas.pontosTecnicasTotal = 0;
    estadoTecnicas.pontosMedio = 0;
    estadoTecnicas.pontosDificil = 0;
    estadoTecnicas.qtdMedio = 0;
    estadoTecnicas.qtdDificil = 0;
    
    // Calcular
    estadoTecnicas.tecnicasAprendidas.forEach(t => {
        const custo = parseInt(t.custoPago) || 0;
        
        if (t.dificuldade === 'Média') {
            estadoTecnicas.qtdMedio++;
            estadoTecnicas.pontosMedio += custo;
        } else if (t.dificuldade === 'Difícil') {
            estadoTecnicas.qtdDificil++;
            estadoTecnicas.pontosDificil += custo;
        }
        
        estadoTecnicas.pontosTecnicasTotal += custo;
    });
    
    estadoTecnicas.qtdTotal = estadoTecnicas.qtdMedio + estadoTecnicas.qtdDificil;
    
    // Atualizar elementos HTML
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
    
    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) badge.textContent = `[${estadoTecnicas.pontosTecnicasTotal} pts]`;
}

// ===== SALVAR TÉCNICAS (COMPLETA) =====
function salvarTecnicasCompleto() {
    try {
        const dadosParaSalvar = {
            tecnicasAprendidas: estadoTecnicas.tecnicasAprendidas,
            dataSalvamento: new Date().toISOString(),
            versao: '1.0'
        };
        
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(dadosParaSalvar));
        console.log('💾 Técnicas salvas com sucesso');
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar técnicas:', error);
        return false;
    }
}

// ===== CARREGAR TÉCNICAS (COMPLETA) =====
function carregarTecnicasCompleto() {
    try {
        const dadosSalvos = localStorage.getItem('tecnicasAprendidas');
        if (dadosSalvos) {
            const parsed = JSON.parse(dadosSalvos);
            if (parsed.tecnicasAprendidas && Array.isArray(parsed.tecnicasAprendidas)) {
                estadoTecnicas.tecnicasAprendidas = parsed.tecnicasAprendidas;
                console.log(`📂 ${estadoTecnicas.tecnicasAprendidas.length} técnicas carregadas`);
                return true;
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar técnicas:', error);
    }
    
    console.log('📂 Nenhuma técnica salva encontrada');
    return false;
}

// ===== MONITORAMENTO EM TEMPO REAL (COMPLETA) =====
function iniciarMonitoramentoCompleto() {
    if (estadoTecnicas.monitoramentoAtivo) return;
    
    estadoTecnicas.monitoramentoAtivo = true;
    
    let ultimoEstado = {
        pericias: '',
        atributos: '',
        tecnicas: ''
    };
    
    const verificarMudancas = () => {
        const estadoAtual = {
            pericias: JSON.stringify(window.estadoPericias?.periciasAprendidas || []),
            atributos: JSON.stringify(obterDadosAtributosCompleto()),
            tecnicas: JSON.stringify(estadoTecnicas.tecnicasAprendidas)
        };
        
        const houveMudanca = 
            estadoAtual.pericias !== ultimoEstado.pericias ||
            estadoAtual.atributos !== ultimoEstado.atributos ||
            estadoAtual.tecnicas !== ultimoEstado.tecnicas;
        
        if (houveMudanca) {
            ultimoEstado = estadoAtual;
            
            // Limpar cache
            estadoTecnicas.cacheNHPericias.clear();
            
            // Atualizar tudo
            atualizarTecnicasDisponiveisCompleto();
            renderizarStatusTecnicasCompleto();
            renderizarTecnicasAprendidasCompleto();
            
            // Se modal aberto, atualizar também
            if (estadoTecnicas.modalAberto && window.tecnicaModalAtual) {
                const tecnicaAtual = estadoTecnicas.tecnicasDisponiveis.find(
                    t => t.id === window.tecnicaModalAtual.tecnica.id
                );
                if (tecnicaAtual) {
                    abrirModalTecnicaCompleto(tecnicaAtual);
                }
            }
        }
    };
    
    // Verificar a cada segundo
    setInterval(verificarMudancas, 1000);
    
    // Também monitorar eventos personalizados
    document.addEventListener('atributosAlterados', verificarMudancas);
    document.addEventListener('periciasAlteradas', verificarMudancas);
    
    console.log('👁️ Monitoramento iniciado');
}

// ===== CONFIGURAR EVENTOS (COMPLETA) =====
function configurarEventosTecnicasCompleto() {
    console.log('🔗 Configurando eventos de técnicas...');
    
    // Filtros
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const filtro = this.getAttribute('data-filtro');
            estadoTecnicas.filtroAtivo = filtro;
            
            // Atualizar classes ativas
            document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            renderizarCatalogoTecnicasCompleto();
        });
    });
    
    // Busca
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoTecnicas.buscaAtiva = this.value;
            renderizarCatalogoTecnicasCompleto();
        });
        
        buscaInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                renderizarCatalogoTecnicasCompleto();
            }
        });
    }
    
    // Fechar modal ao clicar fora
    document.querySelector('.modal-tecnica-overlay')?.addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalTecnicaCompleto();
        }
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && estadoTecnicas.modalAberto) {
            fecharModalTecnicaCompleto();
        }
    });
}

// ===== INICIALIZAR SISTEMA (COMPLETA) =====
function inicializarSistemaTecnicasCompleto() {
    console.log('🚀 INICIALIZANDO SISTEMA COMPLETO DE TÉCNICAS');
    
    // 1. Carregar dados salvos
    carregarTecnicasCompleto();
    
    // 2. Configurar eventos
    configurarEventosTecnicasCompleto();
    
    // 3. Iniciar monitoramento
    iniciarMonitoramentoCompleto();
    
    // 4. Renderizar tudo
    atualizarTecnicasDisponiveisCompleto();
    renderizarStatusTecnicasCompleto();
    renderizarTecnicasAprendidasCompleto();
    
    console.log('✅ SISTEMA DE TÉCNICAS INICIALIZADO COM SUCESSO');
    console.log(`📊 ${estadoTecnicas.tecnicasAprendidas.length} técnicas aprendidas`);
    console.log(`📋 ${estadoTecnicas.tecnicasDisponiveis.length} técnicas disponíveis`);
}

// ===== INICIALIZAÇÃO AUTOMÁTICA (COMPLETA) =====
function observarAbaPericiasCompleto() {
    const abaPericias = document.getElementById('pericias');
    if (!abaPericias) {
        setTimeout(observarAbaPericiasCompleto, 1000);
        return;
    }
    
    // Inicializar se já visível
    if (abaPericias.style.display !== 'none') {
        setTimeout(inicializarSistemaTecnicasCompleto, 500);
    }
    
    // Observar mudanças
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                if (abaPericias.style.display !== 'none') {
                    setTimeout(inicializarSistemaTecnicasCompleto, 300);
                } else {
                    fecharModalTecnicaCompleto();
                }
            }
        });
    });
    
    observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
}

// ===== EXPORTAR FUNÇÕES (COMPLETA) =====
window.fecharModalTecnicaCompleto = fecharModalTecnicaCompleto;
window.confirmarTecnicaCompleto = confirmarTecnicaCompleto;
window.removerTecnicaCompleto = removerTecnicaCompleto;
window.inicializarSistemaTecnicasCompleto = inicializarSistemaTecnicasCompleto;

// ===== INICIALIZAÇÃO NO CARREGAMENTO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - preparando sistema de técnicas');
    setTimeout(observarAbaPericiasCompleto, 1000);
});

// ===== FUNÇÕES ADICIONAIS ÚTEIS =====
window.obterTecnicasAprendidas = function() {
    return [...estadoTecnicas.tecnicasAprendidas];
};

window.obterPontosTecnicas = function() {
    return estadoTecnicas.pontosTecnicasTotal;
};

window.reiniciarTecnicas = function() {
    if (confirm('⚠️ TEM CERTEZA?\n\nIsso removerá TODAS as técnicas aprendidas e os pontos NÃO serão recuperados.\n\nEsta ação NÃO pode ser desfeita.')) {
        estadoTecnicas.tecnicasAprendidas = [];
        salvarTecnicasCompleto();
        renderizarStatusTecnicasCompleto();
        renderizarTecnicasAprendidasCompleto();
        atualizarTecnicasDisponiveisCompleto();
        
        if (typeof window.atualizarPontosTotais === 'function') {
            window.atualizarPontosTotais();
        }
        
        alert('✅ Todas as técnicas foram reiniciadas!');
    }
};

console.log('🎮 MÓDULO DE TÉCNICAS CARREGADO - 100% COMPLETO');