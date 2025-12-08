// ===== SISTEMA DE TÉCNICAS - VERSÃO COMPLETA =====
// Sistema completo e funcional para técnicas GURPS

console.log("🎯 SISTEMA DE TÉCNICAS - CARREGANDO SISTEMA COMPLETO");

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

// ===== CONSTANTES =====
const TABELA_CUSTO = {
    'Difícil': [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    'Média': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
};

// ===== FUNÇÕES DE BUSCA DE PERÍCIAS =====

function obterValorAtributo(atributoId) {
    const elemento = document.getElementById(atributoId);
    return elemento ? parseInt(elemento.value) || 10 : 10;
}

function buscarPericiaNoSistema(idPericia) {
    console.log(`🔍 Buscando perícia: "${idPericia}"`);
    
    // Primeiro verificar no estado de perícias aprendidas
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const aprendidas = window.estadoPericias.periciasAprendidas;
        
        // Procurar por ID exato
        let pericia = aprendidas.find(p => p.id === idPericia);
        if (pericia) {
            console.log(`✅ Encontrada no estado: ${pericia.nome} (nível ${pericia.nivel})`);
            return pericia;
        }
        
        // Procurar por nome contendo
        pericia = aprendidas.find(p => 
            p.nome && p.nome.toLowerCase().includes(idPericia.toLowerCase())
        );
        if (pericia) {
            console.log(`✅ Encontrada por nome: ${pericia.nome}`);
            return pericia;
        }
        
        // Procurar por grupo
        pericia = aprendidas.find(p => 
            p.grupo && p.grupo.toLowerCase() === idPericia.toLowerCase()
        );
        if (pericia) {
            console.log(`✅ Encontrada por grupo: ${pericia.nome}`);
            return pericia;
        }
        
        // Para Cavalgar: procurar qualquer especialização
        if (idPericia.toLowerCase().includes('cavalgar')) {
            const cavalgar = aprendidas.find(p => 
                p.id.includes('cavalgar') || 
                p.nome.toLowerCase().includes('cavalgar')
            );
            if (cavalgar) {
                console.log(`✅ Encontrada Cavalgar: ${cavalgar.nome}`);
                return cavalgar;
            }
        }
    }
    
    console.log(`⚠️ Perícia "${idPericia}" não encontrada nas perícias aprendidas`);
    return null;
}

function calcularNHPericiaBase(idPericia) {
    console.log(`🧮 Calculando NH para: ${idPericia}`);
    
    const pericia = buscarPericiaNoSistema(idPericia);
    
    if (!pericia) {
        // Se não encontrou, usar apenas o atributo base
        let atributoBase = 10;
        if (idPericia === 'arco') {
            atributoBase = obterValorAtributo('DX');
        }
        console.log(`⚠️ ${idPericia} não aprendido, usando DX base: ${atributoBase}`);
        return atributoBase;
    }
    
    // Obter atributo base correto
    let atributoBase;
    switch(pericia.atributo) {
        case 'DX': atributoBase = obterValorAtributo('DX'); break;
        case 'IQ': atributoBase = obterValorAtributo('IQ'); break;
        case 'HT': atributoBase = obterValorAtributo('HT'); break;
        case 'PERC': atributoBase = obterValorAtributo('PERC'); break;
        default: atributoBase = 10;
    }
    
    const nivel = pericia.nivel || 0;
    const nh = atributoBase + nivel;
    
    console.log(`✅ NH ${pericia.nome}: ${nh} (${pericia.atributo} ${atributoBase} + nível ${nivel})`);
    return nh;
}

function verificarArcoNivel4() {
    const periciaArco = buscarPericiaNoSistema('arco');
    
    if (!periciaArco) {
        return { tem: false, nivel: 0, motivo: "❌ Não possui a perícia Arco" };
    }
    
    // Verificar nível do Arco
    const nivelAtual = periciaArco.nivel || 0;
    const nivelRequerido = 4;
    
    if (nivelAtual >= nivelRequerido) {
        return { 
            tem: true, 
            nivel: nivelAtual,
            motivo: `✅ Arco nível ${nivelAtual} (mínimo: ${nivelRequerido})`
        };
    } else {
        return { 
            tem: false, 
            nivel: nivelAtual,
            motivo: `❌ Arco precisa nível ${nivelRequerido} (atual: ${nivelAtual})`
        };
    }
}

function verificarCavalgar() {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        return { tem: false, motivo: "Sistema de perícias não carregado" };
    }
    
    const aprendidas = window.estadoPericias.periciasAprendidas;
    const cavalgar = aprendidas.find(p => 
        p.id.includes('cavalgar') || 
        p.nome.toLowerCase().includes('cavalgar')
    );
    
    if (cavalgar) {
        return { 
            tem: true, 
            motivo: `✅ ${cavalgar.nome}`
        };
    } else {
        return { 
            tem: false, 
            motivo: "❌ Precisa de alguma perícia de Cavalgar"
        };
    }
}

function verificarPreRequisitosTecnica(tecnica) {
    console.log(`📋 Verificando pré-requisitos para: ${tecnica.nome}`);
    
    const resultados = {
        passou: true,
        motivos: []
    };
    
    // Verificar Arco
    if (tecnica.basePericia === 'arco') {
        const arco = verificarArcoNivel4();
        resultados.passou = resultados.passou && arco.tem;
        resultados.motivos.push(arco.motivo);
    }
    
    // Verificar Cavalgar
    const cavalgar = verificarCavalgar();
    resultados.passou = resultados.passou && cavalgar.tem;
    resultados.motivos.push(cavalgar.motivo);
    
    console.log(`📊 Resultado: ${resultados.passou ? '✅ OK' : '❌ FALTA'}`);
    console.log(`   Motivos: ${resultados.motivos.join(' | ')}`);
    
    return resultados;
}

function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima < 0) return 0;
    
    const tabela = TABELA_CUSTO[dificuldade];
    if (!tabela) return 0;
    
    return tabela[Math.min(niveisAcima, tabela.length - 1)] || 0;
}

// ===== FUNÇÕES DE INTERFACE =====

function atualizarTecnicasDisponiveis() {
    console.log("🔄 Atualizando técnicas disponíveis...");
    
    // Verificar se temos o catálogo
    if (!window.catalogoTecnicas || !window.catalogoTecnicas.obterTodasTecnicas) {
        console.error("❌ Catálogo de técnicas não carregado!");
        
        const container = document.getElementById('lista-tecnicas');
        if (container) {
            container.innerHTML = `
                <div class="nenhuma-pericia" style="text-align: center; padding: 40px; color: #95a5a6;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 15px; color: #e74c3c;"></i>
                    <div style="font-size: 18px; margin-bottom: 10px;">Erro no catálogo de técnicas</div>
                    <small>Verifique se o arquivo tecnicas-catalogo.js foi carregado</small>
                </div>
            `;
        }
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    console.log(`📚 Técnicas no catálogo: ${todasTecnicas.length}`);
    
    estadoTecnicas.tecnicasDisponiveis = todasTecnicas.map(tecnica => {
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        // Calcular NH
        let nhBase = 0;
        let nhPericiaBase = 0;
        
        if (tecnica.basePericia) {
            nhPericiaBase = calcularNHPericiaBase(tecnica.basePericia);
            nhBase = nhPericiaBase + tecnica.modificadorBase;
            
            if (jaAprendida && jaAprendida.niveisComprados) {
                nhBase += jaAprendida.niveisComprados;
            }
            
            // Limitar ao máximo
            if (tecnica.limiteMaximo) {
                const nhLimite = calcularNHPericiaBase(tecnica.limiteMaximo);
                nhBase = Math.min(nhBase, nhLimite);
            }
        }
        
        return {
            ...tecnica,
            disponivel: verificacao.passou,
            nhAtual: nhBase,
            nhPericiaBase: nhPericiaBase,
            motivoIndisponivel: verificacao.motivos.join(' | '),
            jaAprendida: !!jaAprendida,
            niveisComprados: jaAprendida ? jaAprendida.niveisComprados || 0 : 0,
            custoTotal: jaAprendida ? jaAprendida.custoTotal || 0 : 0
        };
    });
    
    renderizarCatalogoTecnicas();
}

function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container #lista-tecnicas não encontrado!");
        return;
    }
    
    // Aplicar filtros
    const tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis.filter(tecnica => {
        // Filtro por dificuldade
        if (estadoTecnicas.filtroAtivo === 'medio-tecnicas' && tecnica.dificuldade !== 'Média') return false;
        if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas' && tecnica.dificuldade !== 'Difícil') return false;
        
        // Filtro por busca
        if (estadoTecnicas.buscaAtiva) {
            const busca = estadoTecnicas.buscaAtiva.toLowerCase();
            return tecnica.nome.toLowerCase().includes(busca) ||
                   tecnica.descricao.toLowerCase().includes(busca);
        }
        
        return true;
    });
    
    // Se não houver técnicas
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia" style="text-align: center; padding: 40px; color: #95a5a6;">
                <i class="fas fa-tools" style="font-size: 48px; margin-bottom: 15px;"></i>
                <div style="font-size: 18px; margin-bottom: 10px;">Nenhuma técnica encontrada</div>
                <small>Verifique os filtros ou pré-requisitos</small>
            </div>
        `;
        return;
    }
    
    // Renderizar técnicas
    let html = '';
    
    tecnicasFiltradas.forEach(tecnica => {
        const jaAprendida = tecnica.jaAprendida;
        const disponivel = tecnica.disponivel;
        const baseCalculo = tecnica.basePericia ? `${tecnica.basePericia}${tecnica.modificadorBase}` : '';
        
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
                
                <!-- Cabeçalho -->
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
                
                <!-- Descrição -->
                <p style="margin: 10px 0; color: #ccc; font-size: 14px; line-height: 1.4;">${tecnica.descricao}</p>
                
                <!-- Base de cálculo -->
                <div style="font-size: 12px; color: #95a5a6; margin-bottom: 8px;">
                    <i class="fas fa-calculator"></i> Base: ${baseCalculo}
                </div>
                
                <!-- Motivo indisponível -->
                ${!disponivel ? `
                    <div style="background: rgba(231, 76, 60, 0.1); border-left: 3px solid #e74c3c; 
                         padding: 8px 12px; margin-top: 10px; border-radius: 4px;">
                        <i class="fas fa-lock" style="color: #e74c3c;"></i> 
                        <span style="color: #e74c3c; margin-left: 5px; font-size: 12px;">${tecnica.motivoIndisponivel}</span>
                    </div>
                ` : ''}
                
                <!-- Info para clique -->
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

function abrirModalTecnica(tecnica) {
    console.log(`📖 Abrindo modal para: ${tecnica.nome}`);
    
    estadoTecnicas.tecnicaSelecionada = tecnica;
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    // Calcular valores
    const nhPericiaBase = calcularNHPericiaBase(tecnica.basePericia);
    const nhBase = nhPericiaBase + tecnica.modificadorBase;
    const limiteMaximo = nhPericiaBase;
    
    // Valores atuais
    let nhAtual = nhBase;
    let niveisCompradosAtuais = 0;
    let custoTotalAtual = 0;
    
    if (jaAprendida) {
        niveisCompradosAtuais = jaAprendida.niveisComprados || 0;
        custoTotalAtual = jaAprendida.custoTotal || 0;
        nhAtual = nhBase + niveisCompradosAtuais;
        
        // Limitar
        if (nhAtual > limiteMaximo) {
            nhAtual = limiteMaximo;
            niveisCompradosAtuais = limiteMaximo - nhBase;
        }
    }
    
    // Níveis possíveis
    const niveisPossiveis = Math.max(0, limiteMaximo - nhBase);
    
    // Gerar opções
    let opcoesHTML = '';
    for (let i = 0; i <= niveisPossiveis; i++) {
        const nhOpcao = nhBase + i;
        const custo = calcularCustoTecnica(i, tecnica.dificuldade);
        const selected = i === niveisCompradosAtuais ? 'selected' : '';
        const textoNivel = i === 0 ? 'Base' : `+${i} nível${i > 1 ? 's' : ''}`;
        
        opcoesHTML += `
            <option value="${i}" data-custo="${custo}" ${selected}>
                NH ${nhOpcao} - ${textoNivel} (${custo} pontos)
            </option>
        `;
    }
    
    // HTML do Modal
    const modalHTML = `
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; 
             padding: 20px; border-radius: 8px 8px 0 0; position: relative; border-bottom: 2px solid #9b59b6;">
            <span onclick="fecharModalTecnica()" 
                  style="position: absolute; right: 20px; top: 20px; font-size: 24px; 
                         cursor: pointer; color: #ffd700; font-weight: bold;">×</span>
            <h3 style="margin: 0; color: #ffd700; font-size: 20px;">${tecnica.nome}</h3>
            <div style="color: #95a5a6; margin-top: 5px; font-size: 14px;">
                <span style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; 
                      padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                    ${tecnica.dificuldade}
                </span>
                • ${tecnica.basePericia}${tecnica.modificadorBase}
            </div>
        </div>
        
        <!-- Corpo -->
        <div style="padding: 20px; background: #1e1e28; color: #ccc; max-height: 60vh; overflow-y: auto;">
            
            <!-- Pré-requisitos -->
            <div style="background: rgba(155, 89, 182, 0.1); padding: 15px; border-radius: 8px; 
                 border-left: 4px solid #9b59b6; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <i class="fas fa-check-circle" style="color: #9b59b6; font-size: 18px;"></i>
                    <h4 style="margin: 0; color: #9b59b6;">Pré-requisitos</h4>
                </div>
                <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px;">
                    <li>${verificarArcoNivel4().motivo}</li>
                    <li>${verificarCavalgar().motivo}</li>
                </ul>
            </div>
            
            <!-- Estatísticas -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 15px; background: rgba(52, 152, 219, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(52, 152, 219, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Base</div>
                    <div style="font-size: 28px; font-weight: bold; color: #3498db;">${nhBase}</div>
                    <div style="font-size: 11px; color: #7f8c8d; margin-top: 5px;">${tecnica.basePericia}${tecnica.modificadorBase}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(39, 174, 96, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(39, 174, 96, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Máximo</div>
                    <div style="font-size: 28px; font-weight: bold; color: #27ae60;">${limiteMaximo}</div>
                    <div style="font-size: 11px; color: #7f8c8d; margin-top: 5px;">NH ${tecnica.basePericia}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(243, 156, 18, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(243, 156, 18, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Atual</div>
                    <div style="font-size: 28px; font-weight: bold; color: #f39c12;">${nhAtual}</div>
                    <div style="font-size: 11px; color: #7f8c8d; margin-top: 5px;">${niveisCompradosAtuais} nível(s)</div>
                </div>
            </div>
            
            <!-- Seleção -->
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 10px; color: #ffd700; font-weight: bold; font-size: 16px;">
                    <i class="fas fa-chart-line" style="margin-right: 8px;"></i>
                    Níveis acima da base:
                </label>
                <select id="select-niveis-tecnica"
                    style="width: 100%; padding: 14px; border-radius: 8px; border: 2px solid #9b59b6;
                           background: #2c3e50; color: #ffd700; font-size: 16px; 
                           cursor: pointer; transition: all 0.3s ease;">
                    ${opcoesHTML}
                </select>
                <div style="font-size: 13px; color: #95a5a6; margin-top: 8px;">
                    ${tecnica.dificuldade === 'Difícil' ? 
                        'Custo: 2 pontos para +1 nível, 3 para +2, 4 para +3...' : 
                        'Custo: 1 ponto por nível acima da base'}
                </div>
            </div>
            
            <!-- Custo -->
            <div style="background: rgba(39, 174, 96, 0.1); padding: 20px; border-radius: 8px;
                 border-left: 4px solid #27ae60; margin-bottom: 25px; text-align: center;">
                <div style="font-size: 14px; color: #95a5a6; margin-bottom: 8px;">
                    <i class="fas fa-coins"></i> Custo Total
                </div>
                <div id="custo-display" style="font-size: 36px; font-weight: bold; color: #27ae60;">
                    ${custoTotalAtual} pontos
                </div>
                <div id="info-custo-detalhe" style="font-size: 13px; color: #7f8c8d; margin-top: 5px;">
                    ${jaAprendida ? 'Técnica já aprendida' : 'Nova técnica'}
                </div>
            </div>
            
            <!-- Descrição -->
            <div style="margin-bottom: 20px;">
                <h4 style="color: #ffd700; margin-bottom: 12px; font-size: 18px;">
                    <i class="fas fa-scroll" style="margin-right: 8px;"></i>
                    Descrição
                </h4>
                <p style="line-height: 1.6; font-size: 14px; color: #ccc;">${tecnica.descricao}</p>
            </div>
        </div>
        
        <!-- Ações -->
        <div style="padding: 20px; background: #2c3e50; border-radius: 0 0 8px 8px; 
             display: flex; gap: 15px; justify-content: flex-end; border-top: 2px solid #34495e;">
            <button onclick="fecharModalTecnica()"
                style="padding: 12px 30px; background: #7f8c8d; color: white; border: none; 
                       border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;
                       transition: all 0.3s ease; min-width: 120px;">
                <i class="fas fa-times" style="margin-right: 8px;"></i>Cancelar
            </button>
            <button onclick="comprarTecnica()"
                id="btn-comprar-tecnica"
                style="padding: 12px 30px; background: linear-gradient(45deg, #9b59b6, #8e44ad);
                       color: white; border: none; border-radius: 6px; font-weight: bold; 
                       cursor: pointer; font-size: 14px; transition: all 0.3s ease; min-width: 120px;">
                <i class="fas fa-shopping-cart" style="margin-right: 8px;"></i>
                ${jaAprendida ? 'Atualizar' : 'Comprar'}
            </button>
        </div>
    `;
    
    // Inserir modal
    const modal = document.querySelector('.modal-tecnica');
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    
    if (!modal || !modalOverlay) {
        console.error("❌ Modal não encontrado!");
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
    
    function atualizarCustoDisplay() {
        if (!select || !custoDisplay) return;
        
        const niveisSelecionados = parseInt(select.value);
        const custo = calcularCustoTecnica(niveisSelecionados, tecnica.dificuldade);
        
        custoDisplay.textContent = `${custo} pontos`;
        
        if (infoDetalhe) {
            if (jaAprendida && niveisSelecionados === niveisCompradosAtuais) {
                infoDetalhe.textContent = 'Sem alterações';
                infoDetalhe.style.color = '#95a5a6';
            } else if (jaAprendida) {
                const diferenca = Math.abs(niveisSelecionados - niveisCompradosAtuais);
                infoDetalhe.textContent = niveisSelecionados > niveisCompradosAtuais ? 
                    `+${diferenca} nível(s)` : 
                    `-${diferenca} nível(s)`;
                infoDetalhe.style.color = niveisSelecionados > niveisCompradosAtuais ? '#f39c12' : '#e74c3c';
            } else {
                infoDetalhe.textContent = niveisSelecionados === 0 ? 
                    'Apenas base' : 
                    `${niveisSelecionados} nível(s) extra`;
                infoDetalhe.style.color = '#95a5a6';
            }
        }
        
        if (btnComprar) {
            if (jaAprendida && niveisSelecionados === niveisCompradosAtuais) {
                btnComprar.innerHTML = '<i class="fas fa-check" style="margin-right: 8px;"></i> Sem alterações';
                btnComprar.style.background = '#95a5a6';
                btnComprar.disabled = true;
            } else {
                btnComprar.innerHTML = `<i class="fas fa-shopping-cart" style="margin-right: 8px;"></i>${jaAprendida ? 'Atualizar' : 'Comprar'} por ${custo} pontos`;
                btnComprar.style.background = 'linear-gradient(45deg, #9b59b6, #8e44ad)';
                btnComprar.disabled = false;
            }
        }
    }
    
    if (select) {
        select.addEventListener('change', atualizarCustoDisplay);
        setTimeout(atualizarCustoDisplay, 100);
    }
}

function comprarTecnica() {
    if (!estadoTecnicas.tecnicaSelecionada) {
        alert("❌ Erro: Nenhuma técnica selecionada!");
        return;
    }
    
    const select = document.getElementById('select-niveis-tecnica');
    if (!select) {
        alert("❌ Erro no sistema!");
        return;
    }
    
    const niveisComprados = parseInt(select.value);
    const custo = calcularCustoTecnica(niveisComprados, estadoTecnicas.tecnicaSelecionada.dificuldade);
    
    const tecnicaId = estadoTecnicas.tecnicaSelecionada.id;
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnicaId);
    
    if (index >= 0) {
        // Atualizar
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisComprados: niveisComprados,
            custoTotal: custo,
            dataAtualizacao: new Date().toISOString()
        };
    } else {
        // Nova
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnicaId,
            nome: estadoTecnicas.tecnicaSelecionada.nome,
            dificuldade: estadoTecnicas.tecnicaSelecionada.dificuldade,
            basePericia: estadoTecnicas.tecnicaSelecionada.basePericia,
            modificadorBase: estadoTecnicas.tecnicaSelecionada.modificadorBase,
            niveisComprados: niveisComprados,
            custoTotal: custo,
            dataAquisicao: new Date().toISOString()
        });
    }
    
    // Salvar
    salvarTecnicas();
    
    // Atualizar
    atualizarTecnicasDisponiveis();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
    
    // Fechar modal
    fecharModalTecnica();
    
    // Feedback
    alert(`✅ ${estadoTecnicas.tecnicaSelecionada.nome} ${index >= 0 ? 'atualizada' : 'aprendida'}!\nCusto: ${custo} pontos\nNíveis extras: ${niveisComprados}`);
}

function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida" style="text-align: center; padding: 40px; color: #95a5a6;">
                <i class="fas fa-tools" style="font-size: 48px; margin-bottom: 15px; color: #9b59b6;"></i>
                <div style="font-size: 18px; margin-bottom: 10px;">Nenhuma técnica aprendida</div>
                <small>Aprenda técnicas no catálogo</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const nhPericiaBase = calcularNHPericiaBase(tecnica.basePericia);
        const nhBase = nhPericiaBase + tecnica.modificadorBase;
        const nhAtual = nhBase + (tecnica.niveisComprados || 0);
        const nhFinal = Math.min(nhAtual, nhPericiaBase);
        
        html += `
            <div class="pericia-aprendida-item" style="background: rgba(155, 89, 182, 0.15); 
                 border: 1px solid rgba(155, 89, 182, 0.4); border-radius: 8px; padding: 15px; 
                 margin-bottom: 10px; position: relative;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: #ffd700; font-size: 16px;">
                        ${tecnica.nome}
                        <span style="color: #9b59b6; font-size: 0.9em; margin-left: 5px;">
                            (${tecnica.basePericia}${tecnica.modificadorBase} + ${tecnica.niveisComprados || 0})
                        </span>
                    </h4>
                    <div style="display: flex; gap: 10px;">
                        <span style="background: #9b59b6; color: white; padding: 3px 10px; border-radius: 4px; font-size: 14px;">
                            NH ${nhFinal}
                        </span>
                        <span style="background: #27ae60; color: white; padding: 3px 10px; border-radius: 4px; font-size: 14px;">
                            ${tecnica.custoTotal || 0} pts
                        </span>
                    </div>
                </div>
                
                <div style="font-size: 13px; color: #95a5a6; line-height: 1.5;">
                    <div><strong>Base:</strong> ${tecnica.basePericia}${tecnica.modificadorBase}</div>
                    <div><strong>Níveis comprados:</strong> ${tecnica.niveisComprados || 0}</div>
                    <div><strong>Máximo:</strong> NH ${nhPericiaBase} em ${tecnica.basePericia}</div>
                </div>
                
                <button onclick="removerTecnica('${tecnica.id}')"
                    style="position: absolute; top: 15px; right: 15px; background: rgba(231, 76, 60, 0.2); 
                           color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.4); border-radius: 4px; 
                           width: 30px; height: 30px; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function removerTecnica(id) {
    const tecnica = estadoTecnicas.tecnicasAprendidas.find(t => t.id === id);
    if (!tecnica) return;
    
    if (confirm(`Remover "${tecnica.nome}"?\nIsso removerá ${tecnica.custoTotal || 0} pontos.`)) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
        salvarTecnicas();
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
    }
}

function atualizarEstatisticasTecnicas() {
    // Zerar
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
}

function fecharModalTecnica() {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    estadoTecnicas.modalAberto = false;
    estadoTecnicas.tecnicaSelecionada = null;
}

function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    } catch (e) {
        console.error("Erro ao salvar técnicas:", e);
    }
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
        }
    } catch (e) {
        console.error("Erro ao carregar técnicas:", e);
    }
}

// ===== INICIALIZAÇÃO =====

function configurarEventListeners() {
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
    
    // Fechar modal
    document.addEventListener('click', function(e) {
        if (estadoTecnicas.modalAberto && e.target.classList.contains('modal-tecnica-overlay')) {
            fecharModalTecnica();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && estadoTecnicas.modalAberto) {
            fecharModalTecnica();
        }
    });
}

function observarMudancasPericias() {
    let ultimoEstado = '';
    
    setInterval(() => {
        if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) return;
        
        const estadoAtual = JSON.stringify(window.estadoPericias.periciasAprendidas);
        if (estadoAtual !== ultimoEstado) {
            console.log("🔄 Perícias alteradas, atualizando técnicas...");
            ultimoEstado = estadoAtual;
            atualizarTecnicasDisponiveis();
            atualizarEstatisticasTecnicas();
        }
    }, 1000);
}

function inicializarSistemaTecnicas() {
    console.log("🚀 INICIALIZANDO SISTEMA DE TÉCNICAS COMPLETO...");
    
    // Carregar dados
    carregarTecnicas();
    
    // Configurar eventos
    configurarEventListeners();
    
    // Observar mudanças
    observarMudancasPericias();
    
    // Inicializar
    setTimeout(() => {
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
        console.log("✅ SISTEMA DE TÉCNICAS PRONTO!");
    }, 1000);
}

// Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
    // Esperar aba de perícias
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
                        atualizarTecnicasDisponiveis();
                    }
                }
            }
        });
    });
    
    const abaPericias = document.getElementById('pericias');
    if (abaPericias) {
        observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
    }
});

// ===== EXPORTAR =====
window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;
window.atualizarTecnicasDisponiveis = atualizarTecnicasDisponiveis;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

console.log("🎯 SISTEMA DE TÉCNICAS COMPLETO CARREGADO!");