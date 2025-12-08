// ===== SISTEMA DE TÉCNICAS - VERSÃO COMPLETA E FUNCIONAL =====
console.log("🚀 INICIANDO SISTEMA DE TÉCNICAS");

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

// ===== TABELA DE CUSTO PARA TÉCNICAS =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima <= 0) return 0;
    
    if (dificuldade === 'Difícil') {
        const custos = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        return custos[niveisAcima - 1] || (niveisAcima + 1);
    }
    
    if (dificuldade === 'Média') {
        return niveisAcima; // 1 ponto por nível
    }
    
    return 0;
}

// ===== FUNÇÃO CRÍTICA: BUSCAR PERÍCIA ESPECÍFICA =====
function buscarPericiaEspecificaNoSistema(nomeBusca) {
    console.log(`🔍 Buscando perícia: "${nomeBusca}"`);
    
    // 1. Verificar no estado atual das perícias aprendidas
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        console.log("Perícias aprendidas disponíveis:", 
            window.estadoPericias.periciasAprendidas.map(p => `${p.id}: ${p.nome} (nível ${p.nivel})`));
        
        // Busca por ID exato primeiro
        if (nomeBusca === 'arco') {
            const arco = window.estadoPericias.periciasAprendidas.find(p => p.id === 'arco');
            if (arco) {
                console.log(`✅ Arco encontrado no estado (nível ${arco.nivel})`);
                return arco;
            }
        }
        
        // Busca por nome contendo "cavalgar"
        if (nomeBusca.includes('cavalgar')) {
            const cavalgar = window.estadoPericias.periciasAprendidas.find(p => 
                p.id.includes('cavalgar') || 
                p.nome.toLowerCase().includes('cavalgar') ||
                (p.grupo && p.grupo.toLowerCase() === 'cavalgar')
            );
            
            if (cavalgar) {
                console.log(`✅ Cavalgar encontrado: ${cavalgar.nome} (nível ${cavalgar.nivel})`);
                return cavalgar;
            }
        }
    }
    
    // 2. Se não encontrou no estado, verificar no catálogo
    if (window.buscarPericiaPorId && nomeBusca === 'arco') {
        const arcoCatalogo = window.buscarPericiaPorId('arco');
        if (arcoCatalogo) {
            console.log(`ℹ️ Arco encontrado no catálogo (não aprendido ainda)`);
            return null; // Não aprendida ainda
        }
    }
    
    console.warn(`⚠️ Perícia "${nomeBusca}" não encontrada`);
    return null;
}

// ===== OBTER NH REAL DA PERÍCIA =====
function obterNHPericiaPorId(idPericia) {
    console.log(`🎯 Calculando NH para: ${idPericia}`);
    
    // Obter atributo base
    const atributoBase = window.obterAtributoAtual ? 
        window.obterAtributoAtual('DX') : 10;
    
    // Buscar perícia no sistema
    const pericia = buscarPericiaEspecificaNoSistema(idPericia);
    
    if (pericia) {
        const nh = atributoBase + (pericia.nivel || 0);
        console.log(`✅ NH calculado para ${pericia.nome}: ${nh} (DX ${atributoBase} + nível ${pericia.nivel})`);
        return nh;
    }
    
    // Se não encontrou a perícia, retorna apenas o atributo base
    console.log(`⚠️ ${idPericia} não aprendido, usando DX base: ${atributoBase}`);
    return atributoBase;
}

// ===== VERIFICAR SE TEM PRÉ-REQUISITOS =====
function verificarPreRequisitosTecnica(tecnica) {
    console.log(`📋 Verificando pré-requisitos para: ${tecnica.nome}`);
    
    if (!tecnica.preRequisitos) {
        console.log("✅ Sem pré-requisitos específicos");
        return { passou: true, motivo: '' };
    }
    
    // Verificar Arco-4
    const reqArco = tecnica.preRequisitos.find(req => req.idPericia === 'arco');
    if (reqArco) {
        const periciaArco = buscarPericiaEspecificaNoSistema('arco');
        
        if (!periciaArco) {
            return {
                passou: false,
                motivo: `❌ Precisa da perícia Arco (nível mínimo: ${reqArco.nivelMinimo})`
            };
        }
        
        if (periciaArco.nivel < reqArco.nivelMinimo) {
            return {
                passou: false,
                motivo: `❌ Arco precisa ter nível ${reqArco.nivelMinimo} (atual: ${periciaArco.nivel})`
            };
        }
        
        console.log(`✅ Arco OK: nível ${periciaArco.nivel} >= ${reqArco.nivelMinimo}`);
    }
    
    // Verificar Cavalgar (qualquer especialização)
    const reqCavalgar = tecnica.preRequisitos.find(req => req.idsCavalgar);
    if (reqCavalgar) {
        const temCavalgar = window.estadoPericias && 
            window.estadoPericias.periciasAprendidas && 
            window.estadoPericias.periciasAprendidas.some(p => 
                p.id.includes('cavalgar') || 
                p.nome.toLowerCase().includes('cavalgar') ||
                (p.grupo && p.grupo.toLowerCase() === 'cavalgar')
            );
        
        if (!temCavalgar) {
            return {
                passou: false,
                motivo: '❌ Precisa de alguma perícia de Cavalgar'
            };
        }
        
        console.log("✅ Cavalgar OK");
    }
    
    console.log("✅ Todos os pré-requisitos atendidos");
    return { passou: true, motivo: '' };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    console.log("🔄 Atualizando técnicas disponíveis...");
    
    if (!window.catalogoTecnicas) {
        console.error("❌ Catálogo de técnicas não carregado!");
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    console.log(`📚 Técnicas no catálogo: ${todasTecnicas.length}`);
    
    const disponiveis = todasTecnicas.map(tecnica => {
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        // Calcular NH base (Arco-4)
        let nhBase = 0;
        let nhArco = 0;
        
        if (tecnica.baseCalculo && tecnica.baseCalculo.idPericia === 'arco') {
            nhArco = obterNHPericiaPorId('arco');
            nhBase = nhArco + (tecnica.baseCalculo.redutor || 0);
            
            // Adicionar níveis comprados se já aprendida
            if (jaAprendida && jaAprendida.niveisComprados) {
                nhBase += jaAprendida.niveisComprados;
            }
            
            console.log(`📊 ${tecnica.nome}: NH Arco = ${nhArco}, Base (Arco-4) = ${nhBase}`);
        }
        
        return {
            ...tecnica,
            disponivel: verificacao.passou,
            nhAtual: nhBase,
            nhArco: nhArco, // Armazenar também o NH do Arco para referência
            motivoIndisponivel: verificacao.motivo,
            jaAprendida: !!jaAprendida,
            niveisComprados: jaAprendida ? jaAprendida.niveisComprados || 0 : 0
        };
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    renderizarCatalogoTecnicas();
}

// ===== RENDERIZAR CATÁLOGO =====
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
                <small>Verifique se você tem os pré-requisitos necessários (Arco nível 4 + Cavalgar)</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    tecnicasFiltradas.forEach(tecnica => {
        const jaAprendida = tecnica.jaAprendida;
        const disponivel = tecnica.disponivel;
        
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
                       transition: all 0.3s ease;">
                
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
                ` : ''}
                
                ${disponivel ? `
                    <div style="margin-top: 10px; font-size: 12px; color: #95a5a6; display: flex; align-items: center;">
                        <i class="fas fa-bullseye" style="margin-right: 5px;"></i>
                        Clique para ${jaAprendida ? 'melhorar' : 'aprender'} esta técnica
                        ${tecnica.niveisComprados > 0 ? 
                            `<span style="margin-left: 10px; color: #f39c12;">(+${tecnica.niveisComprados} níveis)</span>` : ''}
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

// ===== ABRIR MODAL DE COMPRA =====
function abrirModalTecnica(tecnica) {
    console.log(`🎯 Abrindo modal para: ${tecnica.nome}`);
    
    estadoTecnicas.tecnicaSelecionada = tecnica;
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    // Calcular valores base
    const nhArco = obterNHPericiaPorId('arco');
    const nhBase = nhArco - 4; // Pré-definido: Arco-4
    const nhMaximo = nhArco; // Não pode exceder o NH em Arco
    
    // Calcular NH atual (base + níveis comprados)
    let nhAtual = nhBase;
    let niveisComprados = 0;
    let custoTotal = 0;
    
    if (jaAprendida) {
        niveisComprados = jaAprendida.niveisComprados || 0;
        custoTotal = jaAprendida.custoTotal || 0;
        nhAtual = nhBase + niveisComprados;
    }
    
    // Verificar níveis possíveis
    const niveisPossiveis = Math.max(0, nhMaximo - nhBase);
    
    console.log(`📊 Dados técnicos:
        NH Arco: ${nhArco}
        Base (Arco-4): ${nhBase}
        Máximo possível: ${nhMaximo}
        Atual: ${nhAtual}
        Níveis possíveis acima da base: ${niveisPossiveis}
        Níveis já comprados: ${niveisComprados}`);
    
    // Criar opções de NH
    let opcoesHTML = '';
    
    for (let i = 0; i <= niveisPossiveis; i++) {
        const nhOpcao = nhBase + i;
        const custo = calcularCustoTecnica(i, tecnica.dificuldade);
        const selected = (nhBase + i) === nhAtual ? 'selected' : '';
        const textoNivel = i === 0 ? 'Base (Arco-4)' : `+${i} nível acima`;
        
        opcoesHTML += `
            <option value="${i}" data-custo="${custo}" ${selected}>
                NH ${nhOpcao} - ${textoNivel} (${custo} pontos)
            </option>
        `;
    }
    
    // Criar modal HTML
    const modalHTML = `
        <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; 
             padding: 20px; border-radius: 8px 8px 0 0; position: relative; border-bottom: 2px solid #ff8c00;">
            <span onclick="fecharModalTecnica()" 
                  style="position: absolute; right: 20px; top: 20px; font-size: 24px; 
                         cursor: pointer; color: #ffd700; font-weight: bold;">×</span>
            <h3 style="margin: 0; color: #ffd700; font-size: 20px;">${tecnica.nome}</h3>
            <div style="color: #95a5a6; margin-top: 5px; font-size: 14px;">
                <span class="pericia-dificuldade" style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; 
                      padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                    ${tecnica.dificuldade}
                </span>
                • Técnica Especial • NH Base: Arco-4
            </div>
        </div>
        
        <div style="padding: 20px; background: #1e1e28; color: #ccc; max-height: 60vh; overflow-y: auto;">
            <!-- Cabeçalho informativo -->
            <div style="background: rgba(155, 89, 182, 0.1); padding: 15px; border-radius: 8px; 
                 border-left: 4px solid #9b59b6; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <i class="fas fa-info-circle" style="color: #9b59b6; font-size: 18px;"></i>
                    <h4 style="margin: 0; color: #9b59b6;">Pré-requisitos atendidos</h4>
                </div>
                <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px;">
                    <li>✅ Perícia Arco nível 4 ou superior</li>
                    <li>✅ Alguma perícia de Cavalgar</li>
                </ul>
            </div>
            
            <!-- Estatísticas -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 15px; background: rgba(52, 152, 219, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(52, 152, 219, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Base (Arco-4)</div>
                    <div style="font-size: 28px; font-weight: bold; color: #3498db;">${nhBase}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(39, 174, 96, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(39, 174, 96, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Máximo (NH Arco)</div>
                    <div style="font-size: 28px; font-weight: bold; color: #27ae60;">${nhMaximo}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(243, 156, 18, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(243, 156, 18, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Atual</div>
                    <div style="font-size: 28px; font-weight: bold; color: #f39c12;">${nhAtual}</div>
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
                           cursor: pointer; transition: all 0.3s ease;"
                    onfocus="this.style.boxShadow='0 0 0 3px rgba(255, 140, 0, 0.3)'"
                    onblur="this.style.boxShadow='none'">
                    ${opcoesHTML}
                </select>
                <div style="font-size: 13px; color: #95a5a6; margin-top: 8px;">
                    <i class="fas fa-coins" style="margin-right: 5px;"></i>
                    ${tecnica.dificuldade === 'Média' ? 
                        'Custo: 1 ponto por nível acima da base' : 
                        'Custo: 2 pontos para +1 nível, 3 pontos para +2, etc.'}
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
                    ${custoTotal} pontos
                </div>
                <div id="info-custo-detalhe" style="font-size: 13px; color: #7f8c8d; margin-top: 5px;">
                    ${jaAprendida ? `${niveisComprados} níveis já comprados` : 'Nova técnica'}
                </div>
            </div>
            
            <!-- Descrição -->
            <div style="margin-bottom: 20px;">
                <h4 style="color: #ffd700; margin-bottom: 12px; font-size: 18px; border-bottom: 1px solid #34495e; padding-bottom: 5px;">
                    <i class="fas fa-scroll" style="margin-right: 8px;"></i>
                    Descrição da Técnica
                </h4>
                <p style="line-height: 1.6; font-size: 14px; color: #ccc;">${tecnica.descricao}</p>
            </div>
            
            <!-- Regras -->
            <div style="background: rgba(155, 89, 182, 0.1); padding: 18px; border-radius: 8px;
                 border-left: 4px solid #9b59b6;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <i class="fas fa-gavel" style="color: #9b59b6; font-size: 18px;"></i>
                    <h5 style="color: #9b59b6; margin: 0; font-size: 16px;">Regras Importantes</h5>
                </div>
                <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 13px; line-height: 1.5;">
                    <li><strong>NH base</strong> = NH em Arco - 4 (pré-definido pelo sistema)</li>
                    <li><strong>Níveis adicionais</strong> podem ser comprados acima da base</li>
                    <li><strong>Limite máximo</strong>: O NH nesta técnica NUNCA pode exceder seu NH em Arco</li>
                    <li><strong>Vantagem</strong>: Penalidades para disparar montado não reduzem abaixo do NH nesta técnica</li>
                    <li>Cada nível acima da base tem um custo progressivo (ver tabela de custos)</li>
                </ul>
            </div>
        </div>
        
        <div style="padding: 20px; background: #2c3e50; border-radius: 0 0 8px 8px; 
             display: flex; gap: 15px; justify-content: flex-end; border-top: 2px solid #34495e;">
            <button onclick="fecharModalTecnica()"
                style="padding: 12px 30px; background: #7f8c8d; color: white; border: none; 
                       border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;
                       transition: all 0.3s ease; min-width: 120px;"
                onmouseover="this.style.backgroundColor='#95a5a6'"
                onmouseout="this.style.backgroundColor='#7f8c8d'">
                <i class="fas fa-times" style="margin-right: 8px;"></i>Cancelar
            </button>
            <button onclick="comprarTecnica()"
                id="btn-comprar-tecnica"
                style="padding: 12px 30px; background: linear-gradient(45deg, #ff8c00, #ffd700);
                       color: #1e1e28; border: none; border-radius: 6px; font-weight: bold; 
                       cursor: pointer; font-size: 14px; transition: all 0.3s ease; min-width: 120px;"
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(255, 140, 0, 0.4)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                <i class="fas fa-shopping-cart" style="margin-right: 8px;"></i>
                ${jaAprendida ? 'Atualizar' : 'Comprar'}
            </button>
        </div>
    `;

    // Inserir modal
    const modal = document.querySelector('.modal-tecnica');
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    
    if (!modal || !modalOverlay) {
        console.error("❌ Elementos do modal não encontrados!");
        return;
    }

    modal.innerHTML = modalHTML;
    modalOverlay.style.display = 'flex';
    estadoTecnicas.modalAberto = true;

    // Configurar eventos
    const select = document.getElementById('select-niveis-tecnica');
    const custoDisplay = document.getElementById('custo-display');
    const btnComprar = document.getElementById('btn-comprar-tecnica');
    const infoDetalhe = document.getElementById('info-custo-detalhe');

    function atualizarCusto() {
        if (!select || !custoDisplay) return;
        
        const niveisSelecionados = parseInt(select.value);
        const custo = calcularCustoTecnica(niveisSelecionados, tecnica.dificuldade);
        
        custoDisplay.textContent = `${custo} pontos`;
        
        if (infoDetalhe) {
            if (jaAprendida) {
                if (niveisSelecionados === niveisComprados) {
                    infoDetalhe.textContent = `${niveisComprados} níveis já comprados (mantém custo)`;
                } else if (niveisSelecionados > niveisComprados) {
                    const diferenca = niveisSelecionados - niveisComprados;
                    infoDetalhe.textContent = `+${diferenca} nível(s) adicional(is) (${niveisComprados} → ${niveisSelecionados})`;
                } else {
                    infoDetalhe.textContent = `${niveisSelecionados} níveis (redução de ${niveisComprados - niveisSelecionados})`;
                }
            } else {
                infoDetalhe.textContent = `${niveisSelecionados} nível(s) acima da base`;
            }
        }
        
        if (btnComprar) {
            if (jaAprendida && niveisSelecionados === niveisComprados) {
                btnComprar.textContent = 'Manter';
                btnComprar.style.background = '#95a5a6';
                btnComprar.disabled = true;
            } else {
                btnComprar.textContent = jaAprendida ? `Atualizar (${custo} pts)` : `Comprar (${custo} pts)`;
                btnComprar.style.background = 'linear-gradient(45deg, #ff8c00, #ffd700)';
                btnComprar.disabled = false;
            }
        }
    }

    if (select) {
        select.addEventListener('change', atualizarCusto);
        // Dispara evento inicial
        setTimeout(() => {
            atualizarCusto();
        }, 100);
    }
}

// ===== COMPRAR/ATUALIZAR TÉCNICA =====
function comprarTecnica() {
    if (!estadoTecnicas.tecnicaSelecionada) {
        alert("❌ Erro: Nenhuma técnica selecionada!");
        return;
    }

    const select = document.getElementById('select-niveis-tecnica');
    if (!select) {
        alert("❌ Erro: Seletor de níveis não encontrado!");
        return;
    }

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
            baseCalculo: estadoTecnicas.tecnicaSelecionada.baseCalculo,
            nhArcoAtual: obterNHPericiaPorId('arco') // Salvar o NH do Arco no momento da compra
        });
    }

    // Salvar no localStorage
    salvarTecnicas();

    // Atualizar tudo
    atualizarTecnicasDisponiveis();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();

    // Fechar modal
    fecharModalTecnica();

    // Mensagem de sucesso
    setTimeout(() => {
        alert(`✅ ${estadoTecnicas.tecnicaSelecionada.nome} ${index >= 0 ? 'atualizada' : 'aprendida'} com sucesso!\n\nCusto: ${custo} pontos\nNíveis acima da base: ${niveisComprados}`);
    }, 300);
}

// ===== RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) {
        console.warn("⚠️ Container #tecnicas-aprendidas não encontrado");
        return;
    }

    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
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

    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        // Calcular NH atual
        const nhArco = obterNHPericiaPorId('arco');
        const nhBase = nhArco - 4;
        const nhAtual = nhBase + (tecnica.niveisComprados || 0);
        
        html += `
            <div class="pericia-aprendida-item" style="background: rgba(155, 89, 182, 0.15); 
                 border: 1px solid rgba(155, 89, 182, 0.4); border-radius: 8px; padding: 15px; 
                 margin-bottom: 10px; position: relative; transition: all 0.3s ease;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: #e67e22; font-size: 16px;">
                        ${tecnica.nome}
                        <span style="color: #f39c12; font-size: 0.9em; font-style: italic; margin-left: 5px;">
                            (Arco-4 + ${tecnica.niveisComprados || 0})
                        </span>
                    </h4>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <span style="background: #2ecc71; color: white; padding: 3px 10px; 
                              border-radius: 4px; font-size: 14px; font-weight: bold;">
                            NH ${nhAtual}
                        </span>
                        <span style="background: #3498db; color: white; padding: 3px 10px; 
                              border-radius: 4px; font-size: 14px;">
                            ${tecnica.custoTotal || 0} pts
                        </span>
                    </div>
                </div>
                
                <div style="font-size: 13px; color: #95a5a6; margin-top: 8px; line-height: 1.5;">
                    <div><strong>Níveis comprados:</strong> ${tecnica.niveisComprados || 0}</div>
                    <div><strong>Base (Arco-4):</strong> ${nhBase}</div>
                    <div><strong>Máximo possível (NH Arco):</strong> ${nhArco}</div>
                    <div><strong>Custo total:</strong> ${tecnica.custoTotal || 0} pontos</div>
                </div>
                
                <button onclick="removerTecnica('${tecnica.id}')"
                    style="position: absolute; top: 15px; right: 15px; background: rgba(231, 76, 60, 0.2); 
                           color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.4); border-radius: 4px; 
                           width: 30px; height: 30px; cursor: pointer; transition: all 0.3s ease;"
                    onmouseover="this.style.backgroundColor='rgba(231, 76, 60, 0.4)'"
                    onmouseout="this.style.backgroundColor='rgba(231, 76, 60, 0.2)'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ===== REMOVER TÉCNICA =====
function removerTecnica(id) {
    const tecnica = estadoTecnicas.tecnicasAprendidas.find(t => t.id === id);
    if (!tecnica) return;
    
    if (confirm(`Tem certeza que deseja remover "${tecnica.nome}"?\n\nEsta ação removerá ${tecnica.custoTotal || 0} pontos investidos.`)) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
        salvarTecnicas();
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
        console.log(`🗑️ Técnica ${tecnica.nome} removida`);
    }
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

    // Badge total
    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) {
        badge.textContent = `[${estadoTecnicas.pontosTecnicasTotal} pts]`;
    }
    
    console.log(`📊 Estatísticas atualizadas: ${estadoTecnicas.qtdTotal} técnicas, ${estadoTecnicas.pontosTecnicasTotal} pontos`);
}

// ===== FECHAR MODAL =====
function fecharModalTecnica() {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    estadoTecnicas.modalAberto = false;
    estadoTecnicas.tecnicaSelecionada = null;
}

// ===== SALVAR/CARREGAR =====
function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
        console.log(`💾 Técnicas salvas: ${estadoTecnicas.tecnicasAprendidas.length}`);
    } catch (e) {
        console.error("❌ Erro ao salvar técnicas:", e);
    }
}

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

// ===== CONFIGURAR EVENTOS =====
function configurarEventListenersTecnicas() {
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
        if (estadoTecnicas.modalAberto && 
            e.target.classList.contains('modal-tecnica-overlay')) {
            fecharModalTecnica();
        }
    });

    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && estadoTecnicas.modalAberto) {
            fecharModalTecnica();
        }
    });
}

// ===== OBSERVAR MUDANÇAS NAS PERÍCIAS =====
function observarMudancasPericias() {
    let ultimoEstado = '';
    
    // Verificar periodicamente se as perícias mudaram
    setInterval(() => {
        if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) return;
        
        const estadoAtual = JSON.stringify(window.estadoPericias.periciasAprendidas.map(p => ({
            id: p.id,
            nivel: p.nivel
        })));
        
        if (estadoAtual !== ultimoEstado) {
            console.log("🔄 Perícias alteradas, atualizando técnicas...");
            ultimoEstado = estadoAtual;
            atualizarTecnicasDisponiveis();
        }
    }, 1000);
}

// ===== INICIALIZAR =====
function inicializarSistemaTecnicas() {
    console.log("🚀 INICIALIZANDO SISTEMA DE TÉCNICAS");
    
    // 1. Carregar técnicas salvas
    carregarTecnicas();
    
    // 2. Configurar eventos
    configurarEventListenersTecnicas();
    
    // 3. Observar mudanças nas perícias
    observarMudancasPericias();
    
    // 4. Inicializar
    setTimeout(() => {
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
        console.log("✅ SISTEMA DE TÉCNICAS INICIALIZADO COM SUCESSO!");
    }, 800);
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    // Esperar que a aba de perícias carregue
    const verificarAba = setInterval(() => {
        const abaPericias = document.getElementById('pericias');
        if (abaPericias && abaPericias.style.display !== 'none') {
            clearInterval(verificarAba);
            
            setTimeout(() => {
                if (!window.sistemaTecnicasInicializado) {
                    inicializarSistemaTecnicas();
                    window.sistemaTecnicasInicializado = true;
                }
            }, 1500);
        }
    }, 500);

    // Observar mudança de abas
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const abaPericias = document.getElementById('pericias');
                if (abaPericias && abaPericias.style.display !== 'none') {
                    if (!window.sistemaTecnicasInicializado) {
                        setTimeout(() => {
                            inicializarSistemaTecnicas();
                            window.sistemaTecnicasInicializado = true;
                        }, 800);
                    } else {
                        // Já inicializado, apenas atualizar
                        atualizarTecnicasDisponiveis();
                    }
                }
            }
        });
    });

    // Observar a aba de perícias
    const abaPericias = document.getElementById('pericias');
    if (abaPericias) {
        observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
    }
});

// ===== EXPORTAR FUNÇÕES =====
window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

console.log("🎮 Módulo de técnicas carregado e pronto!");