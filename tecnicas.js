// ===== SISTEMA DE TÉCNICAS - VERSÃO CORRIGIDA =====
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

// ===== FUNÇÕES BÁSICAS =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima <= 0) return 0;
    
    if (dificuldade === 'Difícil') {
        if (niveisAcima === 1) return 2;
        if (niveisAcima === 2) return 3;
        if (niveisAcima === 3) return 4;
        if (niveisAcima === 4) return 5;
        return 5 + (niveisAcima - 4);
    }
    
    if (dificuldade === 'Média') {
        return niveisAcima;
    }
    
    return 0;
}

function obterValorAtributo(atributo) {
    if (window.obterValorAtributo && typeof window.obterValorAtributo === 'function') {
        return window.obterValorAtributo(atributo);
    }
    
    if (window.obterDadosAtributos && typeof window.obterDadosAtributos === 'function') {
        const dados = window.obterDadosAtributos();
        const map = {
            'DX': dados.destreza || 10,
            'IQ': dados.inteligencia || 10,
            'HT': dados.saude || 10,
            'PERC': dados.percepcao || 10
        };
        return map[atributo] || 10;
    }
    
    return 10;
}

function obterNHPericiaPorId(idPericia) {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        console.log("Sistema de perícias não encontrado");
        return null;
    }
    
    const periciasAprendidas = window.estadoPericias.periciasAprendidas;
    
    // 1. Busca direta pelo ID
    let pericia = periciasAprendidas.find(p => p.id === idPericia);
    
    // 2. Se não encontrou, busca case-insensitive
    if (!pericia) {
        pericia = periciasAprendidas.find(p => 
            p.id.toLowerCase() === idPericia.toLowerCase()
        );
    }
    
    // 3. Se ainda não encontrou, tenta buscar pelo nome
    if (!pericia) {
        // Primeiro, tenta encontrar no catálogo
        if (window.buscarPericiaPorId) {
            const periciaCatalogo = window.buscarPericiaPorId(idPericia);
            if (periciaCatalogo) {
                pericia = periciasAprendidas.find(p => 
                    p.nome === periciaCatalogo.nome ||
                    p.nome.toLowerCase().includes(periciaCatalogo.nome.toLowerCase())
                );
            }
        }
    }
    
    // 4. Última tentativa: busca por similaridade
    if (!pericia) {
        pericia = periciasAprendidas.find(p => 
            p.nome.toLowerCase().includes(idPericia.toLowerCase()) ||
            idPericia.toLowerCase().includes(p.nome.toLowerCase())
        );
    }
    
    if (!pericia) {
        console.log(`Perícia não encontrada: ${idPericia}`);
        return null;
    }
    
    const valorAtributo = obterValorAtributo(pericia.atributo);
    const nivelPericia = pericia.nivel || 0;
    const nh = valorAtributo + nivelPericia;
    
    console.log(`NH de ${pericia.nome} (${idPericia}): ${valorAtributo} + ${nivelPericia} = ${nh}`);
    return nh;
}

function verificarPreRequisitosTecnica(tecnica) {
    if (!tecnica || !tecnica.preRequisitos || tecnica.preRequisitos.length === 0) {
        return { passou: true, motivo: '' };
    }
    
    if (!window.estadoPericias || !Array.isArray(window.estadoPericias.periciasAprendidas)) {
        console.warn("Nenhuma perícia aprendida encontrada");
        return { passou: false, motivo: 'Nenhuma perícia aprendida' };
    }
    
    const periciasAprendidas = window.estadoPericias.periciasAprendidas;
    console.log(`Verificando pré-requisitos para ${tecnica.nome}:`, tecnica.preRequisitos);
    console.log(`Perícias aprendidas:`, periciasAprendidas.map(p => `${p.id}: ${p.nome}`));
    
    for (const prereq of tecnica.preRequisitos) {
        // CASO ESPECIAL 1: Verificar Cavalgar (qualquer especialização)
        if (prereq.verificarCavalgar === true || 
            (prereq.nomePericia && prereq.nomePericia.toLowerCase().includes('cavalgar'))) {
            
            const temCavalgar = periciasAprendidas.some(p => {
                // Verifica por ID
                if (p.id.startsWith('cavalgar-')) return true;
                
                // Verifica por nome
                if (p.nome.toLowerCase().includes('cavalgar')) return true;
                
                // Verifica por grupo de especialização
                if (p.tipo === 'grupo-especializacao' && 
                    p.grupo && p.grupo.toLowerCase() === 'cavalgar') return true;
                    
                return false;
            });
            
            if (!temCavalgar) {
                console.log(`Falta: Cavalgar (qualquer animal)`);
                return { passou: false, motivo: 'Falta: Cavalgar (qualquer animal)' };
            }
            
            console.log(`✓ Cavalgar encontrado`);
            continue;
        }
        
        // CASO ESPECIAL 2: IDs de Cavalgar em array
        if (prereq.idsCavalgar && Array.isArray(prereq.idsCavalgar)) {
            let encontrouCavalgar = false;
            
            for (const idCavalgar of prereq.idsCavalgar) {
                const periciaCavalgar = periciasAprendidas.find(p => 
                    p.id === idCavalgar || 
                    p.nome.toLowerCase().includes('cavalgar')
                );
                
                if (periciaCavalgar) {
                    encontrouCavalgar = true;
                    break;
                }
            }
            
            if (!encontrouCavalgar) {
                return { passou: false, motivo: 'Falta: Cavalgar (qualquer animal)' };
            }
            continue;
        }
        
        // CASO NORMAL: Perícia específica
        let periciaEncontrada = null;
        const idProcurado = prereq.idPericia || prereq.nomePericia;
        
        if (!idProcurado) {
            console.warn("Pré-requisito sem ID ou nome:", prereq);
            continue;
        }
        
        console.log(`Procurando perícia: ${idProcurado}`);
        
        // Busca 1: Por ID exato
        periciaEncontrada = periciasAprendidas.find(p => p.id === idProcurado);
        
        // Busca 2: Por ID case-insensitive
        if (!periciaEncontrada) {
            periciaEncontrada = periciasAprendidas.find(p => 
                p.id.toLowerCase() === idProcurado.toLowerCase()
            );
        }
        
        // Busca 3: Por nome exato
        if (!periciaEncontrada) {
            periciaEncontrada = periciasAprendidas.find(p => 
                p.nome.toLowerCase() === idProcurado.toLowerCase()
            );
        }
        
        // Busca 4: Por similaridade no nome
        if (!periciaEncontrada) {
            periciaEncontrada = periciasAprendidas.find(p => 
                p.nome.toLowerCase().includes(idProcurado.toLowerCase()) ||
                idProcurado.toLowerCase().includes(p.nome.toLowerCase())
            );
        }
        
        // Busca 5: No catálogo
        if (!periciaEncontrada && window.buscarPericiaPorId) {
            const periciaCatalogo = window.buscarPericiaPorId(idProcurado);
            if (periciaCatalogo) {
                console.log(`Encontrada no catálogo: ${periciaCatalogo.nome}`);
                periciaEncontrada = periciasAprendidas.find(p => 
                    p.nome === periciaCatalogo.nome ||
                    (periciaCatalogo.nome && p.nome.toLowerCase().includes(periciaCatalogo.nome.toLowerCase()))
                );
            }
        }
        
        if (!periciaEncontrada) {
            console.log(`❌ Perícia não encontrada: ${idProcurado}`);
            console.log(`Perícias disponíveis:`, periciasAprendidas.map(p => p.id));
            return { passou: false, motivo: `Falta: ${prereq.nomePericia || prereq.idPericia || idProcurado}` };
        }
        
        console.log(`✓ Perícia encontrada: ${periciaEncontrada.nome} (${periciaEncontrada.id})`);
        
        // Verificar nível mínimo se necessário
        if (prereq.nivelMinimo > 0) {
            const nh = obterNHPericiaPorId(periciaEncontrada.id);
            console.log(`Nível necessário: ${prereq.nivelMinimo}, Nível atual: ${nh}`);
            
            if (nh === null || nh < prereq.nivelMinimo) {
                return { 
                    passou: false, 
                    motivo: `${periciaEncontrada.nome} precisa NH ${prereq.nivelMinimo} (tem ${nh || 0})` 
                };
            }
        }
    }
    
    console.log(`✓ Todos os pré-requisitos atendidos para ${tecnica.nome}`);
    return { passou: true, motivo: '' };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    console.log("Atualizando técnicas disponíveis...");
    
    if (!window.catalogoTecnicas || typeof window.catalogoTecnicas.obterTodasTecnicas !== 'function') {
        console.error("Catálogo de técnicas não carregado!");
        const container = document.getElementById('lista-tecnicas');
        if (container) {
            container.innerHTML = `
                <div class="nenhuma-pericia">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>Catálogo de técnicas não carregado</div>
                </div>
            `;
        }
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    console.log(`Total de técnicas no catálogo: ${todasTecnicas.length}`);
    
    const disponiveis = [];
    
    todasTecnicas.forEach(tecnica => {
        console.log(`Processando técnica: ${tecnica.nome} (${tecnica.id})`);
        
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        let nhAtual = 0;
        let custoMostrar = 0;
        
        // Calcular NH atual
        if (tecnica.baseCalculo && tecnica.baseCalculo.tipo === "pericia") {
            console.log(`Calculando NH base para ${tecnica.nome}:`);
            console.log(`- Perícia base: ${tecnica.baseCalculo.idPericia}`);
            console.log(`- Redutor: ${tecnica.baseCalculo.redutor}`);
            
            const nhPericia = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
            console.log(`- NH da perícia base: ${nhPericia}`);
            
            if (nhPericia !== null) {
                nhAtual = nhPericia + (tecnica.baseCalculo.redutor || 0);
                
                // Se já aprendida, adicionar níveis extras
                if (jaAprendida && jaAprendida.niveisAcimaBase) {
                    nhAtual += jaAprendida.niveisAcimaBase;
                }
            }
            
            console.log(`- NH final: ${nhAtual}`);
        }
        
        // Custo atual
        custoMostrar = jaAprendida ? (jaAprendida.custoPago || 0) : 0;
        
        disponiveis.push({
            ...tecnica,
            disponivel: verificacao.passou,
            nhAtual: nhAtual,
            custoAtual: custoMostrar,
            jaAprendida: !!jaAprendida,
            motivoIndisponivel: verificacao.motivo
        });
        
        console.log(`Resultado para ${tecnica.nome}:`);
        console.log(`- Disponível: ${verificacao.passou}`);
        console.log(`- Motivo: ${verificacao.motivo}`);
        console.log(`- NH Atual: ${nhAtual}`);
        console.log(`- Já aprendida: ${!!jaAprendida}`);
        console.log('---');
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    console.log(`Técnicas disponíveis: ${disponiveis.filter(t => t.disponivel).length}/${disponiveis.length}`);
    renderizarCatalogoTecnicas();
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("Container #lista-tecnicas não encontrado!");
        return;
    }
    
    let tecnicasFiltradas = [...estadoTecnicas.tecnicasDisponiveis];
    
    // Aplicar filtro de dificuldade
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
            (t.descricao && t.descricao.toLowerCase().includes(termo)) ||
            (t.motivoIndisponivel && t.motivoIndisponivel.toLowerCase().includes(termo))
        );
    }
    
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
                
                ${tecnica.baseCalculo ? `
                <div class="tecnica-base-info" style="margin: 5px 0; font-size: 0.85em; color: #3498db;">
                    <small>
                        <i class="fas fa-calculator"></i> 
                        Base: ${tecnica.baseCalculo.idPericia} 
                        ${tecnica.baseCalculo.redutor < 0 ? `${tecnica.baseCalculo.redutor}` : ''}
                    </small>
                </div>
                ` : ''}
                
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
                            `${p.nomePericia || p.idPericia}${p.nivelMinimo > 0 ? ` NH${p.nivelMinimo}+` : ''}`
                        ).join(', ')}
                    </small>
                </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adicionar event listeners
    document.querySelectorAll('.pericia-item[data-tipo="tecnica"]').forEach(item => {
        const tecnicaId = item.dataset.id;
        const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === tecnicaId);
        
        if (tecnica && tecnica.disponivel) {
            item.addEventListener('click', function() {
                console.log(`Clicou na técnica: ${tecnica.nome}`);
                abrirModalTecnica(tecnica);
            });
            
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(5px)';
                this.style.borderColor = '#ff8c00';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0)';
                this.style.borderColor = 'rgba(255, 140, 0, 0.3)';
            });
        } else if (tecnica && !tecnica.disponivel) {
            item.addEventListener('click', function() {
                console.log(`Técnica ${tecnica.nome} não disponível: ${tecnica.motivoIndisponivel}`);
            });
        }
    });
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
    
    // Event listeners para remover técnicas
    document.querySelectorAll('.btn-remover-pericia').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            const tecnica = estadoTecnicas.tecnicasAprendidas.find(t => t.id === id);
            
            if (tecnica && confirm(`Remover a técnica "${tecnica.nome}"?\n\nOs ${tecnica.custoPago || 0} pontos gastos serão perdidos.`)) {
                estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
                salvarTecnicas();
                renderizarStatusTecnicas();
                renderizarTecnicasAprendidas();
                atualizarTecnicasDisponiveis();
            }
        });
    });
    
    // Event listeners para editar técnicas
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

// CONTINUA NO PRÓXIMO COMENTÁRIO...
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

// ===== MODAL DE TÉCNICA =====
function abrirModalTecnica(tecnica) {
    if (!tecnica) {
        console.error("Técnica não fornecida para o modal");
        return;
    }
    
    console.log(`Abrindo modal para técnica: ${tecnica.nome}`);
    
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
    
    if (!tecnicaCatalogo) {
        console.error(`Técnica ${tecnica.id} não encontrada no catálogo`);
        return;
    }
    
    // Calcular NH base
    let baseAtual = 0;
    if (tecnicaCatalogo.baseCalculo) {
        if (tecnicaCatalogo.baseCalculo.tipo === "pericia") {
            const nhPericia = obterNHPericiaPorId(tecnicaCatalogo.baseCalculo.idPericia);
            console.log(`NH da perícia base: ${nhPericia}`);
            
            if (nhPericia !== null) {
                baseAtual = nhPericia + (tecnicaCatalogo.baseCalculo.redutor || 0);
            }
        }
    }
    
    // Calcular limite máximo
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
        console.error("Elementos do modal não encontrados!");
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
                ${tecnicaCatalogo.baseCalculo?.redutor < 0 ? `${tecnicaCatalogo.baseCalculo.redutor}` : ''}
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
            
            ${tecnicaCatalogo.preRequisitos && tecnicaCatalogo.preRequisitos.length > 0 ? `
            <div class="prerequisitos-tecnica" style="margin: 15px 0; padding: 10px; background: rgba(52, 152, 219, 0.1); border-radius: 6px;">
                <h5 style="color: #3498db; margin-bottom: 5px;"><i class="fas fa-key"></i> Pré-requisitos:</h5>
                <ul style="color: #ccc; padding-left: 20px; margin: 0;">
                    ${tecnicaCatalogo.preRequisitos.map(prereq => 
                        `<li>${prereq.nomePericia || prereq.idPericia}${prereq.nivelMinimo > 0 ? ` NH${prereq.nivelMinimo}+` : ''}</li>`
                    ).join('')}
                </ul>
            </div>
            ` : ''}
            
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
        if (!select || !custoDisplay || !btnTexto || !btnConfirmar) return;
        
        const selectedOption = select.options[select.selectedIndex];
        const custo = parseInt(selectedOption.dataset.custo);
        const niveis = parseInt(selectedOption.dataset.niveis);
        
        custoDisplay.textContent = `${custo} pontos`;
        
        if (jaAprendida) {
            const custoAtual = jaAprendida.custoPago || 0;
            
            if (niveis === jaAprendida.niveisAcimaBase) {
                btnTexto.textContent = `Manter (0 pontos)`;
                btnConfirmar.disabled = true;
                btnConfirmar.style.opacity = '0.5';
            } else {
                const diferenca = custo - custoAtual;
                if (diferenca > 0) {
                    btnTexto.textContent = `Melhorar (+${diferenca} pontos)`;
                } else {
                    btnTexto.textContent = `Reduzir (${diferenca} pontos)`;
                }
                btnConfirmar.disabled = !verificacao.passou;
                btnConfirmar.style.opacity = verificacao.passou ? '1' : '0.5';
            }
        } else {
            btnTexto.textContent = `Aprender (${custo} pontos)`;
            btnConfirmar.disabled = !verificacao.passou || custo === 0;
            btnConfirmar.style.opacity = (verificacao.passou && custo > 0) ? '1' : '0.5';
        }
    }
    
    if (select) {
        select.addEventListener('change', atualizarCusto);
        atualizarCusto();
    }
    
    modalOverlay.style.display = 'block';
    
    // Armazenar dados para uso posterior
    window.tecnicaModalData = {
        tecnica: tecnica,
        jaAprendida: jaAprendida,
        tecnicaCatalogo: tecnicaCatalogo
    };
    
    console.log("Modal aberto com sucesso");
}

function confirmarTecnica() {
    if (!window.tecnicaModalData) {
        console.error("Dados do modal não encontrados!");
        return;
    }
    
    const { tecnica, jaAprendida } = window.tecnicaModalData;
    const select = document.getElementById('seletor-nh-tecnica');
    
    if (!select) {
        console.error("Seletor não encontrado!");
        return;
    }
    
    const nhEscolhido = parseInt(select.value);
    const selectedOption = select.options[select.selectedIndex];
    const niveisAcima = parseInt(selectedOption.dataset.niveis);
    const custo = parseInt(selectedOption.dataset.custo);
    
    console.log(`Confirmando técnica ${tecnica.nome}:`);
    console.log(`- NH escolhido: ${nhEscolhido}`);
    console.log(`- Níveis acima da base: ${niveisAcima}`);
    console.log(`- Custo: ${custo} pontos`);
    
    // Se já aprendida e não houve alteração, apenas fechar
    if (jaAprendida && niveisAcima === jaAprendida.niveisAcimaBase) {
        console.log("Nenhuma alteração, fechando modal");
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
        console.log(`Técnica ${tecnica.nome} atualizada`);
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
            dataAprendizado: new Date().toISOString()
        };
        
        estadoTecnicas.tecnicasAprendidas.push(novaTecnica);
        console.log(`Técnica ${tecnica.nome} aprendida`);
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
    
    // Notificar sistema de perícias sobre alteração
    if (window.atualizarTecnicasAoAprenderPericia) {
        window.atualizarTecnicasAoAprenderPericia(tecnica.id);
    }
}

function fecharModalTecnica() {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    window.tecnicaModalData = null;
    console.log("Modal fechado");
}

// CONTINUA NO PRÓXIMO COMENTÁRIO...
// ===== FUNÇÕES DE PERSISTÊNCIA =====
function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
        console.log("Técnicas salvas no localStorage");
    } catch (e) {
        console.error("Erro ao salvar técnicas:", e);
    }
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
            console.log(`Carregadas ${estadoTecnicas.tecnicasAprendidas.length} técnicas do localStorage`);
        } else {
            estadoTecnicas.tecnicasAprendidas = [];
            console.log("Nenhuma técnica salva encontrada, iniciando vazio");
        }
    } catch (e) {
        console.error("Erro ao carregar técnicas:", e);
        estadoTecnicas.tecnicasAprendidas = [];
    }
}

// ===== CONFIGURAÇÃO DOS EVENT LISTENERS =====
function configurarEventListeners() {
    console.log("Configurando event listeners para técnicas...");
    
    // Filtros
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const novoFiltro = this.dataset.filtro;
            if (novoFiltro !== estadoTecnicas.filtroAtivo) {
                estadoTecnicas.filtroAtivo = novoFiltro;
                renderizarFiltros();
                renderizarCatalogoTecnicas();
                console.log(`Filtro alterado para: ${novoFiltro}`);
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
                renderizarCatalogoTecnicas();
                console.log(`Busca: "${this.value}"`);
            }, 300);
        });
        
        // Limpar busca
        const btnLimparBusca = buscaInput.parentElement.querySelector('.limpar-busca');
        if (btnLimparBusca) {
            btnLimparBusca.addEventListener('click', function() {
                buscaInput.value = '';
                estadoTecnicas.buscaAtiva = '';
                renderizarCatalogoTecnicas();
            });
        }
    }
    
    // Modal overlay
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalTecnica();
            }
        });
    }
    
    // Tecla ESC para fechar modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modalOverlay = document.querySelector('.modal-tecnica-overlay');
            if (modalOverlay && modalOverlay.style.display === 'block') {
                fecharModalTecnica();
            }
        }
    });
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
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // 1. Carregar dados salvos
    carregarTecnicas();
    
    // 2. Configurar eventos
    configurarEventListeners();
    
    // 3. Verificar se catálogo está carregado
    if (!window.catalogoTecnicas) {
        console.error("❌ Catálogo de técnicas não encontrado!");
        
        // Tentar carregar o catálogo manualmente
        if (typeof catalogoTecnicas !== 'undefined') {
            window.catalogoTecnicas = {
                obterTodasTecnicas: function() {
                    return Object.values(catalogoTecnicas || {}).map(tecnica => ({
                        id: tecnica.id,
                        nome: tecnica.nome,
                        descricao: tecnica.descricao,
                        dificuldade: tecnica.dificuldade,
                        baseCalculo: {
                            tipo: "pericia",
                            idPericia: tecnica.basePericia,
                            redutor: tecnica.redutor || 0
                        },
                        limiteMaximo: tecnica.limitePericia ? {
                            tipo: "pericia",
                            idPericia: tecnica.limitePericia
                        } : null,
                        preRequisitos: tecnica.preRequisitos ? tecnica.preRequisitos.map(prereq => {
                            if (prereq.tipo === "cavalgar") {
                                return {
                                    verificarCavalgar: true,
                                    nomePericia: "Cavalgar",
                                    nivelMinimo: 0
                                };
                            } else {
                                return {
                                    idPericia: prereq.pericia,
                                    nomePericia: prereq.pericia,
                                    nivelMinimo: prereq.nivelMin || 0
                                };
                            }
                        }) : []
                    }));
                },
                buscarTecnicaPorId: function(id) {
                    const tecnica = catalogoTecnicas[id];
                    if (!tecnica) return null;
                    
                    return {
                        id: tecnica.id,
                        nome: tecnica.nome,
                        descricao: tecnica.descricao,
                        dificuldade: tecnica.dificuldade,
                        baseCalculo: {
                            tipo: "pericia",
                            idPericia: tecnica.basePericia,
                            redutor: tecnica.redutor || 0
                        },
                        limiteMaximo: tecnica.limitePericia ? {
                            tipo: "pericia",
                            idPericia: tecnica.limitePericia
                        } : null,
                        preRequisitos: tecnica.preRequisitos ? tecnica.preRequisitos.map(prereq => {
                            if (prereq.tipo === "cavalgar") {
                                return {
                                    verificarCavalgar: true,
                                    nomePericia: "Cavalgar",
                                    nivelMinimo: 0
                                };
                            } else {
                                return {
                                    idPericia: prereq.pericia,
                                    nomePericia: prereq.pericia,
                                    nivelMinimo: prereq.nivelMin || 0
                                };
                            }
                        }) : []
                    };
                }
            };
            console.log("✅ Catálogo de técnicas carregado localmente");
        } else {
            console.error("❌ Não foi possível carregar o catálogo de técnicas");
            return;
        }
    }
    
    // 4. Verificar se sistema de perícias está carregado
    if (!window.estadoPericias) {
        console.warn("⚠️ Sistema de perícias não carregado ainda");
        
        // Tentar inicializar novamente depois de um tempo
        setTimeout(() => {
            if (!window.estadoPericias) {
                console.warn("⚠️ Sistema de perícias ainda não carregado");
            }
            atualizarTecnicasDisponiveis();
        }, 1000);
    }
    
    // 5. Atualizar tudo
    renderizarFiltros();
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    
    console.log("✅ Sistema de técnicas inicializado com sucesso!");
}

// ===== FUNÇÕES AUXILIARES PARA INTEGRAÇÃO =====
window.atualizarTecnicasAoAprenderPericia = function(idPericia) {
    console.log(`Atualizando técnicas devido à alteração na perícia: ${idPericia}`);
    setTimeout(atualizarTecnicasDisponiveis, 100);
};

window.removerTecnicasAoRemoverPericia = function(idPericia) {
    console.log(`Verificando técnicas para remover devido à remoção da perícia: ${idPericia}`);
    
    const tecnicasParaRemover = [];
    
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
        if (tecnicaCatalogo) {
            let depende = false;
            
            // Verificar pré-requisitos
            if (tecnicaCatalogo.preRequisitos) {
                for (const prereq of tecnicaCatalogo.preRequisitos) {
                    if (prereq.idPericia === idPericia || 
                        (prereq.idsCavalgar && prereq.idsCavalgar.includes(idPericia))) {
                        depende = true;
                        break;
                    }
                }
            }
            
            // Verificar base de cálculo
            if (tecnicaCatalogo.baseCalculo && tecnicaCatalogo.baseCalculo.idPericia === idPericia) {
                depende = true;
            }
            
            // Verificar limite máximo
            if (tecnicaCatalogo.limiteMaximo && tecnicaCatalogo.limiteMaximo.idPericia === idPericia) {
                depende = true;
            }
            
            if (depende) {
                tecnicasParaRemover.push(tecnica.id);
                console.log(`Técnica ${tecnica.nome} depende da perícia ${idPericia} - marcada para remoção`);
            }
        }
    });
    
    if (tecnicasParaRemover.length > 0) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(
            t => !tecnicasParaRemover.includes(t.id)
        );
        salvarTecnicas();
        renderizarStatusTecnicas();
        renderizarTecnicasAprendidas();
        atualizarTecnicasDisponiveis();
        
        console.log(`${tecnicasParaRemover.length} técnicas removidas devido à dependência da perícia ${idPericia}`);
    }
};

// ===== EXPORT DE FUNÇÕES PARA USO EXTERNO =====
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.atualizarTecnicasDisponiveis = atualizarTecnicasDisponiveis;
window.renderizarTecnicasAprendidas = renderizarTecnicasAprendidas;

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado, aguardando inicialização do sistema de técnicas...");
    
    // Aguardar um pouco para garantir que tudo esteja carregado
    setTimeout(() => {
        const abaTecnicas = document.getElementById('tecnicas') || document.querySelector('[data-aba="tecnicas"]');
        const abaPericias = document.getElementById('pericias');
        
        // Se encontrar uma aba específica para técnicas
        if (abaTecnicas) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const estaVisivel = window.getComputedStyle(abaTecnicas).display !== 'none';
                        
                        if (estaVisivel && !window.tecnicasIniciadas) {
                            console.log("👁️ Aba de técnicas tornou-se visível, iniciando sistema...");
                            window.tecnicasIniciadas = true;
                            inicializarSistemaTecnicas();
                            observer.disconnect(); // Parar de observar
                        }
                    }
                });
            });
            
            observer.observe(abaTecnicas, { 
                attributes: true, 
                attributeFilter: ['style'] 
            });
            
            // Verificar se já está visível
            if (window.getComputedStyle(abaTecnicas).display !== 'none') {
                window.tecnicasIniciadas = true;
                inicializarSistemaTecnicas();
            }
        } 
        // Se não tiver aba específica, inicializar quando a aba de perícias for mostrada
        else if (abaPericias) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const estaVisivel = window.getComputedStyle(abaPericias).display !== 'none';
                        
                        if (estaVisivel && !window.tecnicasIniciadas) {
                            console.log("👁️ Aba de perícias visível, iniciando sistema de técnicas...");
                            window.tecnicasIniciadas = true;
                            inicializarSistemaTecnicas();
                            observer.disconnect();
                        }
                    }
                });
            });
            
            observer.observe(abaPericias, { 
                attributes: true, 
                attributeFilter: ['style'] 
            });
            
            if (window.getComputedStyle(abaPericias).display !== 'none') {
                window.tecnicasIniciadas = true;
                inicializarSistemaTecnicas();
            }
        }
        // Se não encontrar nenhuma aba específica, inicializar após 2 segundos
        else {
            console.log("ℹ️ Nenhuma aba específica encontrada, inicializando sistema de técnicas após delay...");
            setTimeout(() => {
                if (!window.tecnicasIniciadas) {
                    window.tecnicasIniciadas = true;
                    inicializarSistemaTecnicas();
                }
            }, 2000);
        }
    }, 500);
    
    // Fallback: inicializar após 3 segundos se não tiver iniciado
    setTimeout(() => {
        if (!window.tecnicasIniciadas) {
            console.log("⏰ Timeout: inicializando sistema de técnicas...");
            window.tecnicasIniciadas = true;
            inicializarSistemaTecnicas();
        }
    }, 3000);
});

// ===== ESTILOS DINÂMICOS =====
function adicionarEstilosTecnicas() {
    if (!document.getElementById('estilos-tecnicas')) {
        const estilo = document.createElement('style');
        estilo.id = 'estilos-tecnicas';
        estilo.textContent = `
            .dificuldade-dificil-tecnica {
                background: rgba(231, 76, 60, 0.9) !important;
                border-color: rgba(231, 76, 60, 0.3) !important;
                color: white !important;
                padding: 2px 6px !important;
                border-radius: 3px !important;
                font-size: 0.8em !important;
                font-weight: bold !important;
            }
            
            .dificuldade-medio-tecnica {
                background: rgba(241, 196, 15, 0.9) !important;
                border-color: rgba(241, 196, 15, 0.3) !important;
                color: #333 !important;
                padding: 2px 6px !important;
                border-radius: 3px !important;
                font-size: 0.8em !important;
                font-weight: bold !important;
            }
            
            .select-nivel-tecnica {
                width: 100%;
                padding: 12px;
                border: 2px solid rgba(255, 140, 0, 0.3);
                border-radius: 8px;
                background: rgba(40, 40, 50, 0.9);
                color: #ffd700;
                font-size: 1em;
                cursor: pointer;
            }
            
            .select-nivel-tecnica option {
                background: rgba(30, 30, 40, 0.95);
                color: #ffd700;
                padding: 10px;
            }
            
            .select-nivel-tecnica option:hover {
                background: rgba(255, 140, 0, 0.2);
            }
            
            .pericia-item[style*="cursor: not-allowed"]:hover {
                background: rgba(231, 76, 60, 0.05) !important;
                border-color: rgba(231, 76, 60, 0.3) !important;
                transform: none !important;
                cursor: not-allowed !important;
            }
            
            .pericia-item[style*="cursor: pointer"]:hover {
                background: rgba(255, 140, 0, 0.1) !important;
                transform: translateX(5px);
                transition: all 0.2s ease;
            }
            
            .tecnica-indisponivel {
                font-size: 0.9em;
                margin-top: 8px;
                padding: 8px;
                background: rgba(231, 76, 60, 0.1);
                border-radius: 4px;
                border-left: 3px solid #e74c3c;
            }
            
            .tecnica-base-info {
                margin: 5px 0;
                font-size: 0.85em;
                color: #3498db;
            }
            
            .btn-modal {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-size: 1em;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-modal.btn-cancelar {
                background: rgba(231, 76, 60, 0.2);
                color: #e74c3c;
            }
            
            .btn-modal.btn-cancelar:hover {
                background: rgba(231, 76, 60, 0.4);
            }
            
            .btn-modal.btn-confirmar {
                background: rgba(39, 174, 96, 0.2);
                color: #27ae60;
            }
            
            .btn-modal.btn-confirmar:hover {
                background: rgba(39, 174, 96, 0.4);
            }
            
            .btn-modal.btn-confirmar:disabled {
                background: rgba(149, 165, 166, 0.2);
                color: #95a5a6;
                cursor: not-allowed;
            }
            
            .modal-tecnica-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 1000;
                justify-content: center;
                align-items: center;
            }
            
            .modal-tecnica {
                background: rgba(20, 20, 30, 0.95);
                border: 2px solid rgba(255, 140, 0, 0.3);
                border-radius: 10px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                padding: 20px;
                box-shadow: 0 0 30px rgba(255, 140, 0, 0.2);
            }
            
            .modal-close {
                position: absolute;
                top: 15px;
                right: 15px;
                font-size: 1.5em;
                color: #e74c3c;
                cursor: pointer;
                background: rgba(231, 76, 60, 0.1);
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-close:hover {
                background: rgba(231, 76, 60, 0.3);
            }
        `;
        document.head.appendChild(estilo);
        console.log("✅ Estilos das técnicas adicionados");
    }
}

// Adicionar estilos imediatamente
adicionarEstilosTecnicas();

// ===== LOG INICIAL =====
console.log("📚 Sistema de técnicas carregado e pronto para uso!");