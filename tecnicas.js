// ===== SISTEMA DE TÉCNICAS =====
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
    tecnicasDisponiveis: []
};

// ===== FUNÇÕES BÁSICAS CORRIGIDAS =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima <= 0) return 0;
    
    if (dificuldade === 'Difícil') {
        if (niveisAcima === 1) return 2;
        if (niveisAcima === 2) return 3;
        if (niveisAcima === 3) return 4;
        if (niveisAcima === 4) return 5;
        return 5 + (niveisAcima - 4);
    }
    
    // Para Médias
    if (dificuldade === 'Média') {
        return niveisAcima;
    }
    
    return 0;
}

function obterNHPericiaPorId(idPericia) {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        console.warn('❌ estadoPericias não disponível ou sem perícias aprendidas');
        return null;
    }
    
    const pericia = window.estadoPericias.periciasAprendidas.find(p => p.id === idPericia);
    if (!pericia) {
        console.warn(`❌ Perícia com ID "${idPericia}" não encontrada nas aprendidas`);
        return null;
    }
    
    console.log(`📊 Calculando NH para: ${pericia.nome} (${pericia.atributo})`);
    
    // Obter valor REAL do atributo
    let valorAtributo = 10; // Valor padrão
    
    if (window.obterValorAtributo && typeof window.obterValorAtributo === 'function') {
        valorAtributo = window.obterValorAtributo(pericia.atributo);
    } else if (window.obterDadosAtributos && typeof window.obterDadosAtributos === 'function') {
        const atributos = window.obterDadosAtributos();
        const attrMap = {
            'DX': atributos.destreza || 10,
            'IQ': atributos.inteligencia || 10,
            'HT': atributos.saude || 10,
            'PERC': atributos.percepcao || 10
        };
        
        valorAtributo = attrMap[pericia.atributo] || 10;
    } else {
        console.warn('⚠️ Função obterDadosAtributos não encontrada, usando valor padrão 10');
    }
    
    const nivelPericia = pericia.nivel || 0;
    const nh = valorAtributo + nivelPericia;
    
    console.log(`✅ NH calculado: ${valorAtributo} (atributo) + ${nivelPericia} (nível) = ${nh}`);
    return nh;
}

function verificarPreRequisitosTecnica(tecnica) {
    console.log(`🔍 Verificando pré-requisitos para: ${tecnica?.nome || 'Técnica desconhecida'}`);
    
    if (!tecnica || !tecnica.preRequisitos || tecnica.preRequisitos.length === 0) {
        console.log('✅ Sem pré-requisitos');
        return { passou: true, motivo: '' };
    }
    
    // Verificar se existem perícias aprendidas
    if (!window.estadoPericias || !Array.isArray(window.estadoPericias.periciasAprendidas)) {
        console.warn('⚠️ Não há perícias aprendidas disponíveis');
        return { passou: false, motivo: 'Nenhuma perícia aprendida' };
    }
    
    console.log(`📋 Perícias aprendidas disponíveis:`, 
        window.estadoPericias.periciasAprendidas.map(p => ({ id: p.id, nome: p.nome, nivel: p.nivel })));
    
    for (const prereq of tecnica.preRequisitos) {
        console.log(`   └─ Verificando: ${JSON.stringify(prereq)}`);
        
        let periciaEncontrada = null;
        
        // Buscar por ID específico
        if (prereq.idPericia) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => p.id === prereq.idPericia);
            console.log(`      Buscando "${prereq.idPericia}":`, periciaEncontrada ? `✅ Encontrada (${periciaEncontrada.nome})` : '❌ Não encontrada');
        }
        
        // Se não encontrou, buscar no array de IDs (para Cavalgar)
        if (!periciaEncontrada && prereq.idsCavalgar && Array.isArray(prereq.idsCavalgar)) {
            for (const idCavalgar of prereq.idsCavalgar) {
                periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => p.id === idCavalgar);
                if (periciaEncontrada) {
                    console.log(`      Buscando IDs Cavalgar "${idCavalgar}": ✅ Encontrada (${periciaEncontrada.nome})`);
                    break;
                }
            }
            if (!periciaEncontrada) {
                console.log(`      Buscando IDs Cavalgar: ❌ Nenhuma encontrada`);
            }
        }
        
        // Se ainda não encontrou, verificar por nome (fallback)
        if (!periciaEncontrada && prereq.nomePericia) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => 
                p.nome.toLowerCase().includes(prereq.nomePericia.toLowerCase())
            );
            console.log(`      Buscando por nome "${prereq.nomePericia}":`, 
                periciaEncontrada ? `✅ Encontrada (${periciaEncontrada.nome})` : '❌ Não encontrada');
        }
        
        if (!periciaEncontrada) {
            const motivo = `Falta: ${prereq.nomePericia || prereq.idPericia || 'Pré-requisito'}`;
            console.log(`❌ ${motivo}`);
            return { passou: false, motivo };
        }
        
        // Verificar nível mínimo se necessário
        if (prereq.nivelMinimo > 0) {
            const nh = obterNHPericiaPorId(periciaEncontrada.id);
            console.log(`      NH calculado: ${nh}, necessário: ${prereq.nivelMinimo}`);
            
            if (nh === null) {
                const motivo = `Não foi possível calcular NH de ${periciaEncontrada.nome}`;
                console.log(`❌ ${motivo}`);
                return { passou: false, motivo };
            }
            
            if (nh < prereq.nivelMinimo) {
                const motivo = `${periciaEncontrada.nome} precisa NH ${prereq.nivelMinimo} (tem ${nh})`;
                console.log(`❌ ${motivo}`);
                return { passou: false, motivo };
            }
        }
        
        console.log(`      ✅ Pré-requisito "${prereq.nomePericia || prereq.idPericia}" atendido`);
    }
    
    console.log(`✅ Todos pré-requisitos atendidos para "${tecnica.nome}"`);
    return { passou: true, motivo: '' };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    console.log('🔄 Atualizando técnicas disponíveis...');
    
    if (!window.catalogoTecnicas || typeof window.catalogoTecnicas.obterTodasTecnicas !== 'function') {
        console.error('❌ Catálogo de técnicas não disponível');
        const container = document.getElementById('lista-tecnicas');
        if (container) {
            container.innerHTML = `
                <div class="nenhuma-pericia">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>Catálogo de técnicas não carregado</div>
                    <small>Recarregue a página</small>
                </div>
            `;
        }
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    console.log(`📚 Total de técnicas no catálogo: ${todasTecnicas.length}`);
    
    if (todasTecnicas.length === 0) {
        console.warn('⚠️ Catálogo de técnicas está vazio');
    }
    
    const disponiveis = [];
    
    todasTecnicas.forEach(tecnica => {
        console.log(`\n--- Processando: ${tecnica.nome} ---`);
        
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        let nhAtual = 0;
        let custoMostrar = 0;
        
        if (jaAprendida) {
            const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
            if (tecnicaCatalogo && tecnicaCatalogo.baseCalculo) {
                if (tecnicaCatalogo.baseCalculo.tipo === "pericia") {
                    const nhPericia = obterNHPericiaPorId(tecnicaCatalogo.baseCalculo.idPericia);
                    if (nhPericia !== null) {
                        nhAtual = nhPericia + (tecnicaCatalogo.baseCalculo.redutor || 0) + (jaAprendida.niveisAcimaBase || 0);
                    }
                }
            }
            custoMostrar = jaAprendida.custoPago || 0;
            console.log(`   Já aprendida - NH: ${nhAtual}, Custo: ${custoMostrar} pts`);
        } else {
            const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
            if (tecnicaCatalogo && tecnicaCatalogo.baseCalculo) {
                if (tecnicaCatalogo.baseCalculo.tipo === "pericia") {
                    const nhPericia = obterNHPericiaPorId(tecnicaCatalogo.baseCalculo.idPericia);
                    if (nhPericia !== null) {
                        nhAtual = nhPericia + (tecnicaCatalogo.baseCalculo.redutor || 0);
                    }
                }
            }
            custoMostrar = 0;
            console.log(`   Disponível - NH base: ${nhAtual}, Status: ${verificacao.passou ? '✅' : '❌'}`);
        }
        
        disponiveis.push({
            ...tecnica,
            disponivel: verificacao.passou,
            nhAtual: nhAtual,
            custoAtual: custoMostrar,
            jaAprendida: !!jaAprendida,
            motivoIndisponivel: verificacao.motivo
        });
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    console.log(`✅ Técnicas disponíveis processadas: ${disponiveis.length}`);
    
    renderizarCatalogoTecnicas();
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error('❌ Container #lista-tecnicas não encontrado!');
        return;
    }
    
    console.log(`🎨 Renderizando catálogo com filtro: ${estadoTecnicas.filtroAtivo}`);
    
    let tecnicasFiltradas = [...estadoTecnicas.tecnicasDisponiveis];
    
    // Aplicar filtro por dificuldade
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
    
    console.log(`   Técnicas após filtro: ${tecnicasFiltradas.length}`);
    
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia">
                <i class="fas fa-info-circle"></i>
                <div>Nenhuma técnica encontrada</div>
                <small>${estadoTecnicas.buscaAtiva ? 'Tente outra busca' : 'Aprenda as perícias necessárias primeiro'}</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    tecnicasFiltradas.forEach(tecnica => {
        const disponivel = tecnica.disponivel;
        const jaAprendida = tecnica.jaAprendida;
        
        // Cor da dificuldade
        const dificuldadeClass = tecnica.dificuldade === 'Difícil' ? 'dificuldade-dificil-tecnica' : 'dificuldade-medio-tecnica';
        
        html += `
            <div class="pericia-item" data-id="${tecnica.id}" data-tipo="tecnica" 
                 style="cursor: ${disponivel ? 'pointer' : 'not-allowed'}; opacity: ${disponivel ? '1' : '0.7'}">
                <div class="pericia-header">
                    <h4 class="pericia-nome">
                        ${tecnica.nome} 
                        ${jaAprendida ? '<span style="color: #27ae60; margin-left: 5px;">✓</span>' : ''}
                    </h4>
                    <div class="pericia-info">
                        <span class="pericia-dificuldade ${dificuldadeClass}">
                            <i class="fas ${tecnica.dificuldade === 'Difícil' ? 'fa-star' : 'fa-star-half-alt'}"></i>
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-custo">NH ${tecnica.nhAtual}</span>
                        ${tecnica.custoAtual > 0 ? `<span class="pericia-custo">${tecnica.custoAtual} pts</span>` : ''}
                    </div>
                </div>
                <p class="pericia-descricao">${tecnica.descricao || 'Sem descrição disponível.'}</p>
                
                ${!disponivel ? `
                <div class="tecnica-indisponivel" style="margin-top: 8px; padding: 8px; background: rgba(231, 76, 60, 0.1); border-radius: 4px; border-left: 3px solid #e74c3c;">
                    <i class="fas fa-lock" style="color: #e74c3c;"></i> 
                    <span style="color: #e74c3c; font-size: 0.9em;">${tecnica.motivoIndisponivel || 'Pré-requisitos não atendidos'}</span>
                </div>
                ` : ''}
                
                ${tecnica.preRequisitos && tecnica.preRequisitos.length > 0 ? `
                <div class="pericia-requisitos" style="margin-top: 8px;">
                    <small style="color: #95a5a6;">
                        <strong><i class="fas fa-key"></i> Requer:</strong> 
                        ${tecnica.preRequisitos.map(p => 
                            `${p.nomePericia || p.idPericia}${p.nivelMinimo > 0 ? ` ${p.nivelMinimo}+` : ''}`
                        ).join(', ')}
                    </small>
                </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log(`✅ Catálogo renderizado com ${tecnicasFiltradas.length} técnicas`);
    
    // Adicionar event listeners
    document.querySelectorAll('.pericia-item[data-tipo="tecnica"]').forEach(item => {
        const tecnicaId = item.dataset.id;
        const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === tecnicaId);
        
        if (tecnica && tecnica.disponivel) {
            item.addEventListener('click', function() {
                abrirModalTecnica(tecnica);
            });
            
            // Efeito hover apenas para disponíveis
            item.addEventListener('mouseenter', function() {
                if (tecnica.disponivel) {
                    this.style.transform = 'translateX(5px)';
                    this.style.borderColor = '#ff8c00';
                }
            });
            
            item.addEventListener('mouseleave', function() {
                if (tecnica.disponivel) {
                    this.style.transform = 'translateX(0)';
                    this.style.borderColor = 'rgba(255, 140, 0, 0.3)';
                }
            });
        }
    });
}

// ===== RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) {
        console.error('❌ Container #tecnicas-aprendidas não encontrado!');
        return;
    }
    
    console.log(`📚 Renderizando ${estadoTecnicas.tecnicasAprendidas.length} técnicas aprendidas`);
    
    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>Clique em uma técnica disponível para aprender</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
        let nhFinal = 0;
        let nhMaximo = Infinity;
        
        if (tecnicaCatalogo && tecnicaCatalogo.baseCalculo) {
            if (tecnicaCatalogo.baseCalculo.tipo === "pericia") {
                const nhPericia = obterNHPericiaPorId(tecnicaCatalogo.baseCalculo.idPericia);
                if (nhPericia !== null) {
                    nhFinal = nhPericia + (tecnicaCatalogo.baseCalculo.redutor || 0) + (tecnica.niveisAcimaBase || 0);
                    
                    if (tecnicaCatalogo.limiteMaximo) {
                        if (tecnicaCatalogo.limiteMaximo.tipo === "pericia") {
                            nhMaximo = obterNHPericiaPorId(tecnicaCatalogo.limiteMaximo.idPericia) || nhFinal;
                        }
                    }
                }
            }
        }
        
        const dificuldadeClass = tecnica.dificuldade === 'Difícil' ? 'dificuldade-dificil-tecnica' : 'dificuldade-medio-tecnica';
        
        html += `
            <div class="pericia-aprendida-item" data-tipo="tecnica" data-id="${tecnica.id}">
                <div class="pericia-aprendida-header">
                    <h4 class="pericia-aprendida-nome">${tecnica.nome}</h4>
                    <div class="pericia-aprendida-info">
                        <span class="pericia-aprendida-nivel">
                            <i class="fas fa-bullseye"></i> NH ${nhFinal}
                        </span>
                        <span class="pericia-dificuldade ${dificuldadeClass}">
                            <i class="fas ${tecnica.dificuldade === 'Difícil' ? 'fa-star' : 'fa-star-half-alt'}"></i>
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-aprendida-custo">
                            <i class="fas fa-coins"></i> ${tecnica.custoPago || 0} pts
                        </span>
                    </div>
                </div>
                
                ${tecnicaCatalogo && tecnicaCatalogo.baseCalculo ? `
                <div class="tecnica-base-info" style="margin: 8px 0; font-size: 0.9em; color: #ccc;">
                    <small>
                        <i class="fas fa-calculator"></i> 
                        Base: ${tecnicaCatalogo.baseCalculo.idPericia || 'Perícia'} 
                        ${tecnicaCatalogo.baseCalculo.redutor < 0 ? ` ${tecnicaCatalogo.baseCalculo.redutor}` : ''}
                        + ${tecnica.niveisAcimaBase || 0} níveis
                    </small>
                </div>
                ` : ''}
                
                <div class="pericia-requisitos" style="margin-top: 5px;">
                    <small style="color: #3498db;">
                        <i class="fas fa-chart-line"></i> 
                        <strong>Máximo:</strong> NH ${nhMaximo === Infinity ? '∞' : nhMaximo}
                    </small>
                </div>
                
                <button class="btn-remover-pericia" data-id="${tecnica.id}" title="Remover técnica">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Event listeners para botões de remover
    document.querySelectorAll('.btn-remover-pericia').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            const tecnica = estadoTecnicas.tecnicasAprendidas.find(t => t.id === id);
            
            if (tecnica && confirm(`Tem certeza que deseja remover a técnica "${tecnica.nome}"?\n\nOs ${tecnica.custoPago || 0} pontos gastos serão perdidos.`)) {
                console.log(`🗑️ Removendo técnica: ${tecnica.nome}`);
                estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
                salvarTecnicas();
                renderizarStatusTecnicas();
                renderizarTecnicasAprendidas();
                atualizarTecnicasDisponiveis();
            }
        });
    });
    
    // Event listeners para editar
    document.querySelectorAll('.pericia-aprendida-item[data-tipo="tecnica"]').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.btn-remover-pericia')) return;
            
            const id = this.dataset.id;
            const tecnica = estadoTecnicas.tecnicasAprendidas.find(t => t.id === id);
            const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(id);
            
            if (tecnica && tecnicaCatalogo) {
                const tecnicaCompleta = {
                    ...tecnicaCatalogo,
                    jaAprendida: true,
                    nhAtual: tecnica.nhAtual,
                    custoAtual: tecnica.custoPago
                };
                
                abrirModalTecnica(tecnicaCompleta);
            }
        });
    });
}

// ===== RENDERIZAR STATUS =====
function renderizarStatusTecnicas() {
    estadoTecnicas.pontosTecnicasTotal = 0;
    estadoTecnicas.pontosMedio = 0;
    estadoTecnicas.pontosDificil = 0;
    estadoTecnicas.qtdMedio = 0;
    estadoTecnicas.qtdDificil = 0;
    
    estadoTecnicas.tecnicasAprendidas.forEach(t => {
        const custo = t.custoPago || 0;
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
    
    console.log(`📊 Status Técnicas: ${estadoTecnicas.qtdTotal} técnicas, ${estadoTecnicas.pontosTecnicasTotal} pts`);
    
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

// ===== MODAL =====
function abrirModalTecnica(tecnica) {
    console.log(`📋 Abrindo modal para: ${tecnica.nome}`);
    
    if (!tecnica) {
        console.error('❌ Técnica não fornecida para o modal');
        return;
    }
    
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
    
    if (!tecnicaCatalogo) {
        console.error('❌ Técnica não encontrada no catálogo:', tecnica.id);
        return;
    }
    
    // Calcular base
    let baseAtual = 0;
    if (tecnicaCatalogo.baseCalculo) {
        if (tecnicaCatalogo.baseCalculo.tipo === "pericia") {
            const nhPericia = obterNHPericiaPorId(tecnicaCatalogo.baseCalculo.idPericia);
            if (nhPericia !== null) {
                baseAtual = nhPericia + (tecnicaCatalogo.baseCalculo.redutor || 0);
            }
        }
    }
    
    // Calcular limite
    let nhMaximo = Infinity;
    if (tecnicaCatalogo.limiteMaximo) {
        if (tecnicaCatalogo.limiteMaximo.tipo === "pericia") {
            nhMaximo = obterNHPericiaPorId(tecnicaCatalogo.limiteMaximo.idPericia) || Infinity;
        }
    }
    
    const niveisAcima = jaAprendida ? jaAprendida.niveisAcimaBase || 0 : 0;
    const nhAtual = baseAtual + niveisAcima;
    
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    const modalContent = document.querySelector('.modal-tecnica');
    
    if (!modalOverlay || !modalContent) {
        console.error('❌ Elementos do modal não encontrados');
        return;
    }
    
    // Gerar opções do seletor
    let optionsHtml = '';
    const max = nhMaximo === Infinity ? baseAtual + 10 : nhMaximo;
    
    for (let nh = baseAtual; nh <= max; nh++) {
        const niveisAcimaOpt = nh - baseAtual;
        const custo = calcularCustoTecnica(niveisAcimaOpt, tecnica.dificuldade);
        const selected = nh === nhAtual ? 'selected' : '';
        
        let textoOpcao = `NH ${nh}`;
        if (niveisAcimaOpt === 0) {
            textoOpcao += ' (Base - 0 pts)';
        } else {
            textoOpcao += ` (${custo} pontos)`;
        }
        
        optionsHtml += `<option value="${nh}" data-niveis="${niveisAcimaOpt}" data-custo="${custo}" ${selected}>
            ${textoOpcao}
        </option>`;
    }
    
    modalContent.innerHTML = `
        <div class="modal-header-pericia">
            <span class="modal-close" onclick="fecharModalTecnica()">&times;</span>
            <h3>
                <i class="fas ${tecnica.dificuldade === 'Difícil' ? 'fa-star' : 'fa-star-half-alt'}"></i>
                ${tecnica.nome} 
                ${jaAprendida ? '<span style="color: #27ae60; font-size: 0.8em;">(APRENDIDA)</span>' : ''}
            </h3>
            <div class="modal-subtitulo">
                ${tecnica.dificuldade} • Base: ${tecnicaCatalogo.baseCalculo?.idPericia || 'Perícia'} 
                ${tecnicaCatalogo.baseCalculo?.redutor < 0 ? ` ${tecnicaCatalogo.baseCalculo.redutor}` : ''}
            </div>
        </div>
        
        <div class="modal-body-pericia">
            <div class="nivel-info-tecnica" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div class="info-item-tecnica" style="background: rgba(40, 40, 50, 0.8); padding: 12px; border-radius: 8px; text-align: center;">
                    <label style="display: block; color: #95a5a6; font-size: 0.85em; margin-bottom: 5px;">Nível Base</label>
                    <div style="color: #3498db; font-size: 1.8em; font-weight: 700;">${baseAtual}</div>
                </div>
                <div class="info-item-tecnica" style="background: rgba(40, 40, 50, 0.8); padding: 12px; border-radius: 8px; text-align: center;">
                    <label style="display: block; color: #95a5a6; font-size: 0.85em; margin-bottom: 5px;">Nível Máximo</label>
                    <div style="color: ${nhMaximo === Infinity ? '#e74c3c' : '#2ecc71'}; font-size: 1.8em; font-weight: 700;">
                        ${nhMaximo === Infinity ? '∞' : nhMaximo}
                    </div>
                </div>
                <div class="info-item-tecnica" style="background: rgba(40, 40, 50, 0.8); padding: 12px; border-radius: 8px; text-align: center;">
                    <label style="display: block; color: #95a5a6; font-size: 0.85em; margin-bottom: 5px;">Nível Atual</label>
                    <div style="color: #ffd700; font-size: 1.8em; font-weight: 700;">${nhAtual}</div>
                </div>
            </div>
            
            <div class="seletor-nivel-tecnica" style="margin: 20px 0;">
                <label style="display: block; color: #ffd700; margin-bottom: 10px; font-weight: 600;">
                    <i class="fas fa-sliders-h"></i> Selecione o nível desejado:
                </label>
                <select id="seletor-nh-tecnica" class="select-nivel-tecnica" 
                        style="width: 100%; padding: 12px; border: 2px solid rgba(255, 140, 0, 0.3); 
                               border-radius: 8px; background: rgba(40, 40, 50, 0.9); color: #ffd700;
                               font-size: 1em; cursor: pointer;">
                    ${optionsHtml}
                </select>
            </div>
            
            <div class="custo-tecnica-box" style="background: rgba(39, 174, 96, 0.1); border: 2px solid rgba(39, 174, 96, 0.3); 
                    border-radius: 10px; padding: 20px; text-align: center; margin: 25px 0;">
                <div style="color: #95a5a6; font-size: 0.9em; margin-bottom: 8px;">Custo Total</div>
                <div id="custo-tecnica-valor" style="color: #27ae60; font-size: 2.2em; font-weight: 700;">0 pontos</div>
            </div>
            
            <div class="detalhes-pericia-descricao" style="margin: 20px 0;">
                <h4 style="color: #ffd700; margin-bottom: 10px; border-bottom: 1px solid rgba(255, 140, 0, 0.3); padding-bottom: 5px;">
                    <i class="fas fa-book-open"></i> Descrição
                </h4>
                <p style="color: #ccc; line-height: 1.5;">${tecnica.descricao || 'Sem descrição disponível.'}</p>
            </div>
            
            <div class="regras-especiais-tecnica" style="background: rgba(52, 152, 219, 0.1); border-left: 4px solid #3498db; 
                    padding: 15px; border-radius: 4px; margin-top: 20px;">
                <h4 style="color: #3498db; margin-bottom: 10px;">
                    <i class="fas fa-info-circle"></i> Regra Especial
                </h4>
                <p style="color: #ccc; line-height: 1.5; margin: 0;">
                    ${tecnicaCatalogo.limiteMaximo ? 
                        `Não pode exceder o NH da perícia ${tecnicaCatalogo.limiteMaximo.idPericia}. ` : ''}
                    ${tecnica.descricao || ''}
                </p>
            </div>
            
            ${!verificacao.passou ? `
            <div class="tecnica-indisponivel" style="margin-top: 20px; padding: 15px; background: rgba(231, 76, 60, 0.1); 
                    border-radius: 6px; border-left: 4px solid #e74c3c;">
                <div style="color: #e74c3c; font-weight: 600; margin-bottom: 5px;">
                    <i class="fas fa-exclamation-triangle"></i> Pré-requisitos não atendidos
                </div>
                <div style="color: #e67e22; font-size: 0.95em;">
                    ${verificacao.motivo}
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="modal-actions-pericia">
            <button class="btn-modal btn-cancelar" onclick="fecharModalTecnica()">
                <i class="fas fa-times"></i> Cancelar
            </button>
            <button class="btn-modal btn-confirmar" id="btn-confirmar-tecnica" onclick="confirmarTecnica()" 
                ${!verificacao.passou ? 'disabled' : ''}>
                ${jaAprendida ? '<i class="fas fa-sync-alt"></i> ' : '<i class="fas fa-plus-circle"></i> '}
                <span id="btn-texto-tecnica">${jaAprendida ? 'Atualizar' : 'Aprender'}</span>
            </button>
        </div>
    `;
    
    const select = document.getElementById('seletor-nh-tecnica');
    const custoDisplay = document.getElementById('custo-tecnica-valor');
    const btnConfirmar = document.getElementById('btn-confirmar-tecnica');
    const btnTexto = document.getElementById('btn-texto-tecnica');
    
    function atualizarCusto() {
        const selectedOption = select.options[select.selectedIndex];
        const custo = parseInt(selectedOption.dataset.custo);
        const niveis = parseInt(selectedOption.dataset.niveis);
        
        custoDisplay.textContent = `${custo} pontos`;
        
        if (jaAprendida) {
            const custoAtual = jaAprendida.custoPago || 0;
            
            if (niveis === jaAprendida.niveisAcimaBase) {
                btnTexto.textContent = `Manter (0 pontos)`;
                btnConfirmar.disabled = true;
            } else {
                const diferenca = custo - custoAtual;
                if (diferenca > 0) {
                    btnTexto.textContent = `Melhorar (+${diferenca} pontos)`;
                } else {
                    btnTexto.textContent = `Reduzir (${diferenca} pontos)`;
                }
                btnConfirmar.disabled = !verificacao.passou;
            }
        } else {
            btnTexto.textContent = `Aprender (${custo} pontos)`;
            btnConfirmar.disabled = !verificacao.passou || custo === 0;
        }
    }
    
    select.addEventListener('change', atualizarCusto);
    atualizarCusto();
    
    modalOverlay.style.display = 'block';
    
    window.tecnicaModalData = {
        tecnica: tecnica,
        jaAprendida: jaAprendida,
        tecnicaCatalogo: tecnicaCatalogo
    };
    
    console.log('✅ Modal aberto com sucesso');
}

function confirmarTecnica() {
    if (!window.tecnicaModalData) {
        console.error('❌ Dados do modal não disponíveis');
        return;
    }
    
    const { tecnica, jaAprendida, tecnicaCatalogo } = window.tecnicaModalData;
    const select = document.getElementById('seletor-nh-tecnica');
    
    if (!select) {
        console.error('❌ Seletor de nível não encontrado');
        return;
    }
    
    const nhEscolhido = parseInt(select.value);
    const selectedOption = select.options[select.selectedIndex];
    const niveisAcima = parseInt(selectedOption.dataset.niveis);
    const custo = parseInt(selectedOption.dataset.custo);
    
    console.log(`✅ Confirmando técnica: ${tecnica.nome}, NH: ${nhEscolhido}, Custo: ${custo} pts`);
    
    if (jaAprendida && niveisAcima === jaAprendida.niveisAcimaBase) {
        console.log('ℹ️ Nenhuma alteração necessária');
        fecharModalTecnica();
        return;
    }
    
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnica.id);
    
    if (index >= 0) {
        // Atualizar técnica existente
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisAcimaBase: niveisAcima,
            custoPago: custo,
            dataAtualizacao: new Date().toISOString()
        };
        console.log(`🔄 Técnica atualizada: ${tecnica.nome}`);
    } else {
        // Adicionar nova técnica
        const novaTecnica = {
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
            preRequisitos: tecnica.preRequisitos,
            niveisAcimaBase: niveisAcima,
            custoPago: custo,
            dataAprendizado: new Date().toISOString(),
            baseCalculo: tecnicaCatalogo.baseCalculo,
            limiteMaximo: tecnicaCatalogo.limiteMaximo
        };
        
        estadoTecnicas.tecnicasAprendidas.push(novaTecnica);
        console.log(`✨ Nova técnica aprendida: ${tecnica.nome}`);
    }
    
    fecharModalTecnica();
    salvarTecnicas();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    atualizarTecnicasDisponiveis();
    
    // Atualizar pontos totais se a função existir
    if (window.atualizarPontosTotais && typeof window.atualizarPontosTotais === 'function') {
        window.atualizarPontosTotais();
    }
    
    // Feedback visual
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px;
        background: rgba(39, 174, 96, 0.9); color: white; border-radius: 8px;
        z-index: 10000; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    feedback.innerHTML = `<i class="fas fa-check-circle"></i> Técnica ${jaAprendida ? 'atualizada' : 'aprendida'} com sucesso!`;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => feedback.remove(), 300);
    }, 3000);
}

function fecharModalTecnica() {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    window.tecnicaModalData = null;
    console.log('📪 Modal fechado');
}

// ===== FUNÇÕES DE PERSISTÊNCIA =====
function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
        console.log('💾 Técnicas salvas no localStorage');
    } catch (e) {
        console.error('❌ Erro ao salvar técnicas:', e);
    }
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
            console.log(`📂 ${estadoTecnicas.tecnicasAprendidas.length} técnicas carregadas do localStorage`);
        } else {
            console.log('📂 Nenhuma técnica salva encontrada');
            estadoTecnicas.tecnicasAprendidas = [];
        }
    } catch (e) {
        console.error('❌ Erro ao carregar técnicas:', e);
        estadoTecnicas.tecnicasAprendidas = [];
    }
}

// ===== CONFIGURAÇÃO DE EVENTOS =====
function configurarEventListeners() {
    console.log('🔧 Configurando event listeners para técnicas...');
    
    // Filtros
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const novoFiltro = this.dataset.filtro;
            if (novoFiltro !== estadoTecnicas.filtroAtivo) {
                estadoTecnicas.filtroAtivo = novoFiltro;
                console.log(`🔍 Alterando filtro para: ${novoFiltro}`);
                renderizarFiltros();
                renderizarCatalogoTecnicas();
            }
        });
    });
    
    // Busca
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        let timeoutBusca;
        buscaInput.addEventListener('input', function() {
            clearTimeout(timeoutBusca);
            timeoutBusca = setTimeout(() => {
                estadoTecnicas.buscaAtiva = this.value;
                console.log(`🔍 Buscando por: "${this.value}"`);
                renderizarCatalogoTecnicas();
            }, 300);
        });
    }
    
    // Fechar modal ao clicar fora
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalTecnica();
            }
        });
    }
    
    // ESC para fechar modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.style.display === 'block') {
            fecharModalTecnica();
        }
    });
    
    console.log('✅ Event listeners configurados');
}

function renderizarFiltros() {
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filtro === estadoTecnicas.filtroAtivo) {
            btn.classList.add('active');
        }
    });
}

// ===== INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    console.log('🚀 Inicializando sistema de técnicas...');
    
    // Verificar dependências
    if (!window.catalogoTecnicas) {
        console.error('❌ Catálogo de técnicas não carregado');
        return;
    }
    
    if (!window.estadoPericias) {
        console.warn('⚠️ Sistema de perícias não carregado ainda');
    }
    
    // 1. Carregar dados salvos
    carregarTecnicas();
    
    // 2. Configurar eventos
    configurarEventListeners();
    
    // 3. Renderizar tudo
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarFiltros();
    renderizarTecnicasAprendidas();
    
    console.log('✅ Sistema de técnicas inicializado com sucesso!');
}

// ===== FUNÇÕES AUXILIARES PARA O SISTEMA DE PERÍCIAS =====
window.atualizarTecnicasAoAprenderPericia = function(idPericia) {
    console.log(`🔄 Atualizando técnicas após aprender/atualizar perícia: ${idPericia}`);
    setTimeout(atualizarTecnicasDisponiveis, 100);
};

window.removerTecnicasAoRemoverPericia = function(idPericia) {
    // Remover técnicas que dependiam da perícia removida
    const tecnicasParaRemover = [];
    
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
        if (tecnicaCatalogo) {
            // Verificar se a técnica depende da perícia removida
            const depende = tecnicaCatalogo.preRequisitos?.some(prereq => 
                prereq.idPericia === idPericia || 
                (prereq.idsCavalgar && prereq.idsCavalgar.includes(idPericia))
            ) || tecnicaCatalogo.baseCalculo?.idPericia === idPericia;
            
            if (depende) {
                tecnicasParaRemover.push(tecnica.id);
            }
        }
    });
    
    if (tecnicasParaRemover.length > 0) {
        console.log(`🗑️ Removendo ${tecnicasParaRemover.length} técnicas que dependiam da perícia ${idPericia}`);
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(
            t => !tecnicasParaRemover.includes(t.id)
        );
        salvarTecnicas();
        renderizarStatusTecnicas();
        renderizarTecnicasAprendidas();
        atualizarTecnicasDisponiveis();
    }
};

// ===== EXPORT DE FUNÇÕES =====
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.atualizarTecnicasDisponiveis = atualizarTecnicasDisponiveis;

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, preparando inicialização de técnicas...');
    
    // Aguardar um pouco para garantir que tudo esteja carregado
    setTimeout(() => {
        const abaPericias = document.getElementById('pericias');
        
        if (abaPericias) {
            // Observar quando a aba de perícias se tornar visível
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const estaVisivel = window.getComputedStyle(abaPericias).display !== 'none';
                        console.log(`👀 Aba perícias visível: ${estaVisivel}`);
                        
                        if (estaVisivel && !window.tecnicasIniciadas) {
                            // Tentar inicializar após um pequeno delay
                            setTimeout(() => {
                                if (!window.tecnicasIniciadas) {
                                    console.log('🎯 Inicializando técnicas (via observer)...');
                                    window.tecnicasIniciadas = true;
                                    inicializarSistemaTecnicas();
                                }
                            }, 300);
                        }
                    }
                });
            });
            
            observer.observe(abaPericias, { 
                attributes: true, 
                attributeFilter: ['style'] 
            });
            
            // Inicializar imediatamente se já estiver visível
            if (window.getComputedStyle(abaPericias).display !== 'none') {
                console.log('🎯 Aba já visível, inicializando...');
                setTimeout(() => {
                    if (!window.tecnicasIniciadas) {
                        window.tecnicasIniciadas = true;
                        inicializarSistemaTecnicas();
                    }
                }, 500);
            }
        } else {
            console.error('❌ Aba de perícias não encontrada');
        }
    }, 1000);
    
    // Inicialização de segurança caso o observer falhe
    setTimeout(() => {
        if (!window.tecnicasIniciadas) {
            const abaPericias = document.getElementById('pericias');
            if (abaPericias && window.getComputedStyle(abaPericias).display !== 'none') {
                console.log('🔄 Inicialização de segurança ativada');
                window.tecnicasIniciadas = true;
                inicializarSistemaTecnicas();
            }
        }
    }, 3000);
});

// ===== ESTILOS DINÂMICOS PARA TÉCNICAS =====
function adicionarEstilosTecnicas() {
    const estilo = document.createElement('style');
    estilo.textContent = `
        /* Dificuldades */
        .dificuldade-dificil-tecnica {
            background: rgba(231, 76, 60, 0.9) !important;
            border-color: rgba(231, 76, 60, 0.3) !important;
        }
        
        .dificuldade-medio-tecnica {
            background: rgba(241, 196, 15, 0.9) !important;
            border-color: rgba(241, 196, 15, 0.3) !important;
        }
        
        /* Animações */
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        /* Select personalizado */
        .select-nivel-tecnica option {
            background: rgba(30, 30, 40, 0.95);
            color: #ffd700;
            padding: 10px;
        }
        
        .select-nivel-tecnica option:hover {
            background: rgba(255, 140, 0, 0.2);
        }
        
        /* Item de técnica indisponível */
        .pericia-item[style*="cursor: not-allowed"]:hover {
            background: rgba(231, 76, 60, 0.05) !important;
            border-color: rgba(231, 76, 60, 0.3) !important;
            transform: none !important;
        }
    `;
    document.head.appendChild(estilo);
}

// Adicionar estilos quando o script carregar
adicionarEstilosTecnicas();

console.log('📦 tecnicas.js carregado com sucesso!');