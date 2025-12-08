// ===== SISTEMA COMPLETO DE TÉCNICAS =====
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
    ultimaAtualizacao: 0
};

// ===== TABELA DE CUSTO DETALHADA PARA TÉCNICAS =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima <= 0) return 0;
    
    if (dificuldade === 'Difícil') {
        switch(niveisAcima) {
            case 1: return 2;
            case 2: return 3;
            case 3: return 4;
            case 4: return 5;
            case 5: return 6;
            case 6: return 7;
            case 7: return 8;
            case 8: return 9;
            case 9: return 10;
            case 10: return 11;
            default: return 11 + (niveisAcima - 10);
        }
    }
    
    if (dificuldade === 'Média') {
        if (niveisAcima <= 4) return niveisAcima;
        if (niveisAcima <= 8) return 4 + (niveisAcima - 4) * 1.5;
        return 10 + (niveisAcima - 8);
    }
    
    return 0;
}

// ===== FUNÇÃO PARA OBTER ATRIBUTO ATUAL COM FALLBACKS =====
function obterAtributoAtual(atributo) {
    if (!window.obterDadosAtributos) {
        return 10;
    }
    
    const dadosAtributos = window.obterDadosAtributos();
    if (!dadosAtributos) {
        return 10;
    }
    
    switch(atributo) {
        case 'DX':
            return dadosAtributos.DX || 10;
        case 'IQ':
            return dadosAtributos.IQ || 10;
        case 'HT':
            return dadosAtributos.HT || 10;
        case 'PERC':
            const iqBase = dadosAtributos.IQ || 10;
            const bonusPercepcao = dadosAtributos.Bonus ? (dadosAtributos.Bonus.Percepcao || 0) : 0;
            return iqBase + bonusPercepcao;
        case 'FOR':
            return dadosAtributos.FOR || 10;
        default:
            return 10;
    }
}

// ===== FUNÇÃO PARA OBTER NH DA PERÍCIA POR ID COM VALIDAÇÃO =====
function obterNHPericiaPorId(idPericia) {
    if (!window.estadoPericias || !Array.isArray(window.estadoPericias.periciasAprendidas)) {
        return null;
    }
    
    const pericia = window.estadoPericias.periciasAprendidas.find(p => p && p.id === idPericia);
    if (!pericia) {
        return null;
    }
    
    const atributoBase = obterAtributoAtual(pericia.atributo);
    const nivelPericia = parseInt(pericia.nivel) || 0;
    const bonusPericia = parseInt(pericia.bonus) || 0;
    
    return atributoBase + nivelPericia + bonusPericia;
}

// ===== FUNÇÃO PARA OBTER NH DA PERÍCIA POR NOME (FALLBACK) =====
function obterNHPericiaPorNome(nomePericia) {
    if (!window.estadoPericias || !Array.isArray(window.estadoPericias.periciasAprendidas)) {
        return null;
    }
    
    const nomeBusca = nomePericia.toLowerCase().trim();
    
    const pericia = window.estadoPericias.periciasAprendidas.find(p => {
        if (!p || !p.nome) return false;
        return p.nome.toLowerCase().includes(nomeBusca);
    });
    
    if (!pericia) {
        return null;
    }
    
    return obterNHPericiaPorId(pericia.id);
}

// ===== FUNÇÃO PARA VERIFICAR SE PERÍCIA EXISTE =====
function periciaExiste(idOuNome) {
    if (!window.estadoPericias || !Array.isArray(window.estadoPericias.periciasAprendidas)) {
        return false;
    }
    
    return window.estadoPericias.periciasAprendidas.some(p => {
        if (!p) return false;
        return p.id === idOuNome || p.nome.toLowerCase().includes(idOuNome.toLowerCase());
    });
}

// ===== FUNÇÃO PARA OBTER PERÍCIA POR ID OU NOME =====
function obterPericiaPorIdOuNome(idOuNome) {
    if (!window.estadoPericias || !Array.isArray(window.estadoPericias.periciasAprendidas)) {
        return null;
    }
    
    const pericia = window.estadoPericias.periciasAprendidas.find(p => {
        if (!p) return false;
        return p.id === idOuNome || (p.nome && p.nome.toLowerCase().includes(idOuNome.toLowerCase()));
    });
    
    return pericia || null;
}

// ===== FUNÇÃO PARA CALCULAR NH ATUAL DA TÉCNICA COM TODAS AS VALIDAÇÕES =====
function calcularNHAtualDaTecnica(tecnicaAprendida) {
    if (!tecnicaAprendida || !tecnicaAprendida.id) {
        return 0;
    }
    
    if (!window.catalogoTecnicas || !window.catalogoTecnicas.buscarTecnicaPorId) {
        return 0;
    }
    
    const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnicaAprendida.id);
    if (!tecnicaCatalogo || !tecnicaCatalogo.baseCalculo) {
        return 0;
    }

    const baseCalc = tecnicaCatalogo.baseCalculo;
    let baseTecnica = 0;

    if (baseCalc.tipo === "pericia") {
        const nhPericia = obterNHPericiaPorId(baseCalc.idPericia);
        if (nhPericia === null) {
            const periciaFallback = obterPericiaPorIdOuNome(baseCalc.idPericia);
            if (periciaFallback) {
                const atributoBase = obterAtributoAtual(periciaFallback.atributo);
                baseTecnica = atributoBase + (periciaFallback.nivel || 0);
            }
        } else {
            baseTecnica = nhPericia + (baseCalc.redutor || 0);
        }
    } else if (baseCalc.tipo === "atributo") {
        const valorAtributo = obterAtributoAtual(baseCalc.atributo);
        baseTecnica = valorAtributo + (baseCalc.bonus || 0);
    }

    const niveisAcima = parseInt(tecnicaAprendida.niveisAcimaBase) || 0;
    let nhTecnica = baseTecnica + niveisAcima;

    if (tecnicaCatalogo.limiteMaximo) {
        const limite = tecnicaCatalogo.limiteMaximo;
        let nhMaximo = Infinity;
        
        if (limite.tipo === "pericia") {
            const nhLimite = obterNHPericiaPorId(limite.idPericia);
            if (nhLimite !== null) {
                nhMaximo = nhLimite;
            }
        } else if (limite.tipo === "fixo") {
            nhMaximo = parseInt(limite.valor) || Infinity;
        }
        
        nhTecnica = Math.min(nhTecnica, nhMaximo);
    }

    return Math.max(0, Math.floor(nhTecnica));
}

// ===== VERIFICAR PRÉ-REQUISITOS DA TÉCNICA =====
function verificarPreRequisitosTecnica(tecnica) {
    if (!tecnica || !tecnica.preRequisitos || !Array.isArray(tecnica.preRequisitos)) {
        return { passou: false, motivo: "Técnica inválida ou sem pré-requisitos definidos" };
    }
    
    if (!window.estadoPericias || !Array.isArray(window.estadoPericias.periciasAprendidas)) {
        return { passou: false, motivo: "Sistema de perícias não inicializado" };
    }
    
    for (const prereq of tecnica.preRequisitos) {
        if (!prereq) continue;
        
        let periciaEncontrada = null;
        
        if (prereq.idPericia) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => p && p.id === prereq.idPericia);
        }
        
        if (!periciaEncontrada && prereq.idsCavalgar && Array.isArray(prereq.idsCavalgar)) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => 
                p && prereq.idsCavalgar.includes(p.id)
            );
        }
        
        if (!periciaEncontrada && prereq.nomePericia) {
            const nomeBusca = prereq.nomePericia.toLowerCase();
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => 
                p && p.nome && p.nome.toLowerCase().includes(nomeBusca)
            );
        }
        
        if (!periciaEncontrada) {
            return { 
                passou: false, 
                motivo: `Falta perícia: ${prereq.nomePericia || prereq.idPericia || "Não especificada"}` 
            };
        }
        
        if (prereq.nivelMinimo && prereq.nivelMinimo > 0) {
            const nh = obterNHPericiaPorId(periciaEncontrada.id);
            if (nh === null || nh < prereq.nivelMinimo) {
                return { 
                    passou: false, 
                    motivo: `${prereq.nomePericia || periciaEncontrada.nome} precisa NH ${prereq.nivelMinimo} (tem ${nh || 0})` 
                };
            }
        }
    }
    
    return { passou: true, motivo: '' };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    if (!window.catalogoTecnicas || typeof window.catalogoTecnicas.obterTodasTecnicas !== 'function') {
        estadoTecnicas.tecnicasDisponiveis = [];
        renderizarCatalogoTecnicas();
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    if (!Array.isArray(todasTecnicas)) {
        estadoTecnicas.tecnicasDisponiveis = [];
        renderizarCatalogoTecnicas();
        return;
    }
    
    const disponiveis = [];
    const agora = Date.now();
    
    if (agora - estadoTecnicas.ultimaAtualizacao < 500) {
        return;
    }
    
    estadoTecnicas.ultimaAtualizacao = agora;
    
    todasTecnicas.forEach(tecnica => {
        if (!tecnica || !tecnica.id) return;
        
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t && t.id === tecnica.id);
        
        let nhAtual = 0;
        let custoMostrar = 0;
        let niveisAcimaBase = 0;
        
        if (jaAprendida) {
            nhAtual = calcularNHAtualDaTecnica(jaAprendida);
            custoMostrar = parseInt(jaAprendida.custoPago) || 0;
            niveisAcimaBase = parseInt(jaAprendida.niveisAcimaBase) || 0;
        } else {
            const tecnicaBase = { 
                id: tecnica.id, 
                niveisAcimaBase: 0 
            };
            nhAtual = calcularNHAtualDaTecnica(tecnicaBase);
        }
        
        disponiveis.push({
            id: tecnica.id,
            nome: tecnica.nome || "Técnica sem nome",
            descricao: tecnica.descricao || "",
            dificuldade: tecnica.dificuldade || "Média",
            baseCalculo: tecnica.baseCalculo,
            limiteMaximo: tecnica.limiteMaximo,
            preRequisitos: tecnica.preRequisitos || [],
            disponivel: verificacao.passou,
            nhAtual: nhAtual,
            custoAtual: custoMostrar,
            jaAprendida: !!jaAprendida,
            niveisAcimaBase: niveisAcimaBase,
            motivoIndisponivel: verificacao.motivo
        });
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    renderizarCatalogoTecnicas();
}

// ===== MONITORAMENTO EM TEMPO REAL =====
function configurarMonitoramento() {
    let ultimosDados = {
        pericias: JSON.stringify(window.estadoPericias?.periciasAprendidas || []),
        atributos: JSON.stringify(window.obterDadosAtributos ? window.obterDadosAtributos() : {})
    };
    
    const verificarMudancas = () => {
        const dadosAtuais = {
            pericias: JSON.stringify(window.estadoPericias?.periciasAprendidas || []),
            atributos: JSON.stringify(window.obterDadosAtributos ? window.obterDadosAtributos() : {})
        };
        
        if (dadosAtuais.pericias !== ultimosDados.pericias || 
            dadosAtuais.atributos !== ultimosDados.atributos) {
            
            ultimosDados = dadosAtuais;
            
            atualizarTecnicasDisponiveis();
            renderizarStatusTecnicas();
            renderizarTecnicasAprendidas();
            
            if (estadoTecnicas.modalAberto && estadoTecnicas.tecnicaSelecionada) {
                const tecnicaAtual = estadoTecnicas.tecnicasDisponiveis.find(
                    t => t.id === estadoTecnicas.tecnicaSelecionada.id
                );
                if (tecnicaAtual) {
                    estadoTecnicas.tecnicaSelecionada = tecnicaAtual;
                    if (document.querySelector('.modal-tecnica-overlay[style*="display: block"]')) {
                        abrirModalTecnica(tecnicaAtual);
                    }
                }
            }
        }
    };
    
    setInterval(verificarMudancas, 1000);
    
    document.addEventListener('atributosAlterados', verificarMudancas);
    document.addEventListener('periciasAlteradas', verificarMudancas);
}

// ===== RENDERIZAR STATUS DAS TÉCNICAS =====
function renderizarStatusTecnicas() {
    estadoTecnicas.pontosTecnicasTotal = 0;
    estadoTecnicas.pontosMedio = 0;
    estadoTecnicas.pontosDificil = 0;
    estadoTecnicas.qtdMedio = 0;
    estadoTecnicas.qtdDificil = 0;
    
    estadoTecnicas.tecnicasAprendidas.forEach(t => {
        if (!t) return;
        
        const custo = parseInt(t.custoPago) || 0;
        const dificuldade = t.dificuldade || 'Média';
        
        if (dificuldade === 'Média') {
            estadoTecnicas.qtdMedio++;
            estadoTecnicas.pontosMedio += custo;
        } else if (dificuldade === 'Difícil') {
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
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }
    
    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) {
        badge.textContent = `[${estadoTecnicas.pontosTecnicasTotal} pts]`;
    }
}

// ===== RENDERIZAR CATÁLOGO DE TÉCNICAS =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        return;
    }
    
    let tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis.filter(t => t);
    
    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Média');
    } else if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Difícil');
    } else if (estadoTecnicas.filtroAtivo === 'pericia-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.sort((a, b) => {
            const nomeA = a.nome || '';
            const nomeB = b.nome || '';
            return nomeA.localeCompare(nomeB);
        });
    }
    
    if (estadoTecnicas.buscaAtiva.trim() !== '') {
        const termo = estadoTecnicas.buscaAtiva.toLowerCase().trim();
        tecnicasFiltradas = tecnicasFiltradas.filter(t => 
            (t.nome && t.nome.toLowerCase().includes(termo)) ||
            (t.descricao && t.descricao.toLowerCase().includes(termo)) ||
            (t.motivoIndisponivel && t.motivoIndisponivel.toLowerCase().includes(termo))
        );
    }
    
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia">
                <i class="fas fa-info-circle"></i>
                <div>${estadoTecnicas.tecnicasDisponiveis.length === 0 ? 'Carregando técnicas...' : 'Nenhuma técnica encontrada'}</div>
                <small>${estadoTecnicas.buscaAtiva ? 'Tente buscar com outros termos' : 'Aprenda as perícias necessárias primeiro'}</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    tecnicasFiltradas.forEach(tecnica => {
        const disponivel = tecnica.disponivel;
        const jaAprendida = tecnica.jaAprendida;
        const dificuldadeClasse = tecnica.dificuldade ? `dificuldade-${tecnica.dificuldade.toLowerCase()}` : 'dificuldade-media';
        const corDificuldade = tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12';
        
        html += `
            <div class="pericia-item" 
                 data-id="${tecnica.id}" 
                 data-disponivel="${disponivel}"
                 style="cursor: ${disponivel ? 'pointer' : 'not-allowed'}; 
                        opacity: ${disponivel ? '1' : '0.7'};
                        border-left: 4px solid ${corDificuldade};">
                <div class="pericia-header">
                    <h4 class="pericia-nome">
                        ${tecnica.nome} 
                        ${jaAprendida ? '<span style="color: #27ae60; margin-left: 8px;">✓</span>' : ''}
                    </h4>
                    <div class="pericia-info">
                        <span class="pericia-dificuldade ${dificuldadeClasse}" style="border-color: ${corDificuldade};">
                            ${tecnica.dificuldade}
                        </span>
                        ${disponivel ? `<span class="pericia-custo">NH ${tecnica.nhAtual}</span>` : ''}
                    </div>
                </div>
                <p class="pericia-descricao">${tecnica.descricao}</p>
                
                ${!disponivel ? `
                <div class="tecnica-indisponivel-badge" style="background: rgba(231, 76, 60, 0.1);">
                    <i class="fas fa-lock" style="color: #e74c3c;"></i> 
                    ${tecnica.motivoIndisponivel || 'Indisponível'}
                </div>
                ` : `
                <div class="pericia-requisitos" style="background: rgba(52, 152, 219, 0.1);">
                    <small>
                        <strong>${jaAprendida ? 'Nível Atual' : 'Base'}:</strong> NH ${tecnica.nhAtual}
                        ${tecnica.baseCalculo ? ` (${tecnica.baseCalculo.idPericia} ${tecnica.baseCalculo.redutor >= 0 ? '+' : ''}${tecnica.baseCalculo.redutor})` : ''}
                    </small>
                </div>
                `}
                
                ${tecnica.preRequisitos && tecnica.preRequisitos.length > 0 ? `
                <div class="pericia-requisitos" style="margin-top: 8px; background: rgba(155, 89, 182, 0.1);">
                    <small>
                        <strong>Pré-requisitos:</strong> 
                        ${tecnica.preRequisitos.map(p => `${p.nomePericia || p.idPericia} ${p.nivelMinimo > 0 ? p.nivelMinimo+'+' : ''}`).join(', ')}
                    </small>
                </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    const itensTecnicas = container.querySelectorAll('.pericia-item[data-disponivel="true"]');
    itensTecnicas.forEach(item => {
        item.addEventListener('click', function(event) {
            event.stopPropagation();
            const id = this.getAttribute('data-id');
            const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
            if (tecnica && tecnica.disponivel) {
                abrirModalTecnica(tecnica);
            }
        });
    });
}

// ===== RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) {
        return;
    }
    
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
    
    let html = '';
    
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        if (!tecnica) return;
        
        const nhFinal = calcularNHAtualDaTecnica(tecnica);
        const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
        let nhMaximo = nhFinal;
        
        if (tecnicaCatalogo && tecnicaCatalogo.limiteMaximo && tecnicaCatalogo.limiteMaximo.tipo === "pericia") {
            nhMaximo = obterNHPericiaPorId(tecnicaCatalogo.limiteMaximo.idPericia) || nhFinal;
        }
        
        const dificuldade = tecnica.dificuldade || 'Média';
        const corDificuldade = dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12';
        
        html += `
            <div class="pericia-aprendida-item" 
                 style="border-left: 4px solid ${corDificuldade};
                        background: rgba(155, 89, 182, 0.05);
                        position: relative;
                        padding-right: 50px;">
                <div class="pericia-aprendida-header">
                    <h4 class="pericia-aprendida-nome">${tecnica.nome || 'Técnica sem nome'}</h4>
                    <div class="pericia-aprendida-info">
                        <span class="pericia-aprendida-nivel" style="background: rgba(52, 152, 219, 0.9);">NH ${nhFinal}</span>
                        <span class="pericia-dificuldade dificuldade-${dificuldade.toLowerCase()}" 
                              style="border-color: ${corDificuldade};">
                            ${dificuldade}
                        </span>
                        <span class="pericia-aprendida-custo" style="background: rgba(39, 174, 96, 0.9);">
                            ${tecnica.custoPago || 0} pts
                        </span>
                    </div>
                </div>
                <div class="pericia-requisitos" style="margin-top: 8px;">
                    <small>
                        <strong>Base:</strong> 
                        ${tecnicaCatalogo && tecnicaCatalogo.baseCalculo ? 
                          `${tecnicaCatalogo.baseCalculo.idPericia} ${tecnicaCatalogo.baseCalculo.redutor >= 0 ? '+' : ''}${tecnicaCatalogo.baseCalculo.redutor}` : 
                          'Perícia base'} 
                        + ${tecnica.niveisAcimaBase || 0} níveis
                    </small>
                    <br>
                    <small>
                        <strong>Máximo:</strong> NH ${nhMaximo}
                    </small>
                </div>
                <button class="btn-remover-pericia" 
                        data-id="${tecnica.id}"
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
    
    const botoesRemover = container.querySelectorAll('.btn-remover-pericia');
    botoesRemover.forEach(botao => {
        botao.addEventListener('click', function(event) {
            event.stopPropagation();
            const id = this.getAttribute('data-id');
            if (confirm('Tem certeza que deseja remover esta técnica? Os pontos gastos serão perdidos.')) {
                estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
                salvarTecnicas();
                renderizarStatusTecnicas();
                renderizarTecnicasAprendidas();
                atualizarTecnicasDisponiveis();
                
                if (typeof window.atualizarPontosTotais === 'function') {
                    window.atualizarPontosTotais();
                }
            }
        });
    });
}

// ===== ABRIR MODAL DA TÉCNICA =====
function abrirModalTecnica(tecnica) {
    if (!tecnica || estadoTecnicas.modalAberto) {
        return;
    }
    
    estadoTecnicas.modalAberto = true;
    estadoTecnicas.tecnicaSelecionada = tecnica;
    
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    let baseAtual = 0;
    if (tecnica.baseCalculo && tecnica.baseCalculo.tipo === "pericia") {
        const nhPericia = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
        if (nhPericia !== null) {
            baseAtual = nhPericia + (tecnica.baseCalculo.redutor || 0);
        }
    }
    
    const niveisAcima = jaAprendida ? parseInt(jaAprendida.niveisAcimaBase) || 0 : 0;
    const nhAtual = baseAtual + niveisAcima;
    
    let nhMaximo = Infinity;
    if (tecnica.limiteMaximo) {
        if (tecnica.limiteMaximo.tipo === "pericia") {
            nhMaximo = obterNHPericiaPorId(tecnica.limiteMaximo.idPericia) || Infinity;
        } else if (tecnica.limiteMaximo.tipo === "fixo") {
            nhMaximo = parseInt(tecnica.limiteMaximo.valor) || Infinity;
        }
    }
    
    nhMaximo = Math.max(nhMaximo, baseAtual);
    nhMaximo = Math.min(nhMaximo, baseAtual + 20);
    
    const opcoesNH = [];
    for (let nh = baseAtual; nh <= nhMaximo; nh++) {
        const niveisAcimaOpt = nh - baseAtual;
        const custo = calcularCustoTecnica(niveisAcimaOpt, tecnica.dificuldade);
        const selecionado = nh === nhAtual;
        opcoesNH.push({ nh, niveisAcima: niveisAcimaOpt, custo, selecionado });
    }
    
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    const modal = document.querySelector('.modal-tecnica');
    
    if (!modalOverlay || !modal) {
        estadoTecnicas.modalAberto = false;
        return;
    }
    
    modal.innerHTML = `
        <div class="modal-header-pericia">
            <span class="modal-close" onclick="fecharModalTecnica()">&times;</span>
            <h3>${tecnica.nome} ${jaAprendida ? '<span style="color: #27ae60;">(Aprendida)</span>' : ''}</h3>
            <div class="modal-subtitulo">
                ${tecnica.dificuldade} • Base: ${tecnica.baseCalculo?.idPericia || 'Perícia'} 
                ${tecnica.baseCalculo?.redutor >= 0 ? '+' : ''}${tecnica.baseCalculo?.redutor || 0}
            </div>
        </div>
        
        <div class="modal-body-pericia">
            <div class="nivel-selecao-container">
                <div class="nivel-info-box">
                    <div class="nivel-info-item">
                        <label>Nível Base:</label>
                        <div class="nivel-valor-grande">${baseAtual}</div>
                        <small>${tecnica.baseCalculo?.idPericia || 'Perícia'} ${tecnica.baseCalculo?.redutor >= 0 ? '+' : ''}${tecnica.baseCalculo?.redutor || 0}</small>
                    </div>
                    <div class="nivel-info-item">
                        <label>Nível Máximo:</label>
                        <div class="nivel-valor-grande">${nhMaximo}</div>
                        <small>${tecnica.limiteMaximo ? `Limite: ${tecnica.limiteMaximo.idPericia || 'fixo'}` : 'Sem limite'}</small>
                    </div>
                    <div class="nivel-info-item">
                        <label>Nível Atual:</label>
                        <div class="nivel-valor-grande">${nhAtual}</div>
                        <small>Base + ${niveisAcima} níveis</small>
                    </div>
                </div>
                
                <div class="seletor-nivel-tecnica" style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 10px; font-weight: bold; color: #ffd700;">
                        Selecione o NH desejado (${baseAtual} a ${nhMaximo}):
                    </label>
                    <select id="seletor-nh-tecnica" 
                            style="width: 100%; padding: 12px; border-radius: 8px; 
                                   border: 2px solid rgba(255, 140, 0, 0.5); 
                                   background: rgba(40, 40, 50, 0.9); 
                                   color: #ffd700; font-size: 16px; cursor: pointer;">
                        ${opcoesNH.map(opcao => `
                            <option value="${opcao.nh}" 
                                    data-niveis-acima="${opcao.niveisAcima}" 
                                    data-custo="${opcao.custo}"
                                    ${opcao.selecionado ? 'selected' : ''}>
                                NH ${opcao.nh} (${opcao.custo} pontos)
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="custo-final-box" style="background: rgba(39, 174, 96, 0.1); 
                                                    padding: 15px; border-radius: 8px; 
                                                    border-left: 4px solid #27ae60;">
                    <div class="custo-final-label" style="font-size: 14px; color: #95a5a6;">Custo Total:</div>
                    <div class="custo-final-valor" id="custo-final-tecnica" 
                         style="font-size: 28px; font-weight: bold; color: #27ae60;">
                        ${jaAprendida ? (jaAprendida.custoPago || 0) : 0} pontos
                    </div>
                    ${jaAprendida ? `
                    <div style="font-size: 12px; color: #95a5a6; margin-top: 5px;">
                        Já investido: ${jaAprendida.custoPago || 0} pontos
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="detalhes-pericia-descricao" style="margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255, 140, 0, 0.2);">
                <h4 style="color: #ffd700; margin-bottom: 10px;">Descrição</h4>
                <p style="line-height: 1.6; color: #ccc;">${tecnica.descricao}</p>
            </div>
            
            <div class="detalhes-pericia-default" style="margin-top: 15px; background: rgba(255, 140, 0, 0.1);">
                <strong>Pré-requisitos:</strong> 
                ${tecnica.preRequisitos.map(p => 
                    `${p.nomePericia || p.idPericia} ${p.nivelMinimo > 0 ? p.nivelMinimo+'+' : ''}`
                ).join(', ')}
            </div>
            
            ${tecnica.limiteMaximo ? `
            <div class="detalhes-pericia-default" style="margin-top: 10px; background: rgba(155, 89, 182, 0.1);">
                <strong>Limite Máximo:</strong> 
                ${tecnica.limiteMaximo.tipo === "pericia" ? 
                  `Não pode exceder o NH em ${tecnica.limiteMaximo.idPericia}` : 
                  `NH ${tecnica.limiteMaximo.valor}`}
            </div>
            ` : ''}
            
            ${!verificacao.passou ? `
            <div class="detalhes-pericia-default" style="margin-top: 15px; background: rgba(231, 76, 60, 0.1); border-left-color: #e74c3c;">
                <strong><i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i> Não pode aprender:</strong><br>
                ${verificacao.motivo}
            </div>
            ` : ''}
        </div>
        
        <div class="modal-actions-pericia">
            <button class="btn-modal btn-cancelar" onclick="fecharModalTecnica()" 
                    style="background: rgba(255, 255, 255, 0.1); color: #ffd700; border: 1px solid rgba(255, 140, 0, 0.3);">
                Cancelar
            </button>
            <button class="btn-modal btn-confirmar" id="btn-confirmar-tecnica" onclick="confirmarTecnica()" 
                    ${!verificacao.passou ? 'disabled' : ''}
                    style="${!verificacao.passou ? 'background: rgba(255, 255, 255, 0.1); color: #95a5a6; cursor: not-allowed;' : 
                           'background: linear-gradient(45deg, #ff8c00, #ffd700); color: #1e1e28;'}">
                ${jaAprendida ? 'Atualizar' : 'Aprender'}
            </button>
        </div>
    `;
    
    modalOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    const selectNH = document.getElementById('seletor-nh-tecnica');
    const custoDisplay = document.getElementById('custo-final-tecnica');
    const btnConfirmar = document.getElementById('btn-confirmar-tecnica');
    
    function atualizarCusto() {
        const opcaoSelecionada = selectNH.options[selectNH.selectedIndex];
        const custo = parseInt(opcaoSelecionada.getAttribute('data-custo'));
        const niveisAcima = parseInt(opcaoSelecionada.getAttribute('data-niveis-acima'));
        
        custoDisplay.textContent = `${custo} pontos`;
        
        if (jaAprendida) {
            const custoAtual = parseInt(jaAprendida.custoPago) || 0;
            if (niveisAcima === (parseInt(jaAprendida.niveisAcimaBase) || 0)) {
                btnConfirmar.textContent = `Manter (0 pontos)`;
                btnConfirmar.disabled = true;
                btnConfirmar.style.background = 'rgba(255, 255, 255, 0.1)';
                btnConfirmar.style.color = '#95a5a6';
                btnConfirmar.style.cursor = 'not-allowed';
            } else {
                const diferenca = custo - custoAtual;
                if (diferenca > 0) {
                    btnConfirmar.textContent = `Melhorar (+${diferenca} pontos)`;
                } else if (diferenca < 0) {
                    btnConfirmar.textContent = `Reduzir (${diferenca} pontos)`;
                } else {
                    btnConfirmar.textContent = `Atualizar (0 pontos)`;
                }
                btnConfirmar.disabled = false;
                btnConfirmar.style.background = 'linear-gradient(45deg, #ff8c00, #ffd700)';
                btnConfirmar.style.color = '#1e1e28';
                btnConfirmar.style.cursor = 'pointer';
            }
        } else {
            btnConfirmar.textContent = `Aprender (${custo} pontos)`;
            btnConfirmar.disabled = !verificacao.passou;
            if (verificacao.passou) {
                btnConfirmar.style.background = 'linear-gradient(45deg, #ff8c00, #ffd700)';
                btnConfirmar.style.color = '#1e1e28';
                btnConfirmar.style.cursor = 'pointer';
            }
        }
    }
    
    selectNH.addEventListener('change', atualizarCusto);
    atualizarCusto();
    
    window.tecnicaModalAtual = {
        tecnica: tecnica,
        jaAprendida: jaAprendida,
        baseAtual: baseAtual,
        nhMaximo: nhMaximo,
        verificacao: verificacao
    };
}

// ===== CONFIRMAR COMPRA/ATUALIZAÇÃO DA TÉCNICA =====
function confirmarTecnica() {
    if (!window.tecnicaModalAtual) {
        fecharModalTecnica();
        return;
    }
    
    const { tecnica, jaAprendida } = window.tecnicaModalAtual;
    const select = document.getElementById('seletor-nh-tecnica');
    
    if (!select) {
        fecharModalTecnica();
        return;
    }
    
    const opcaoSelecionada = select.options[select.selectedIndex];
    const nhEscolhido = parseInt(select.value);
    const niveisAcima = parseInt(opcaoSelecionada.getAttribute('data-niveis-acima'));
    const custo = parseInt(opcaoSelecionada.getAttribute('data-custo'));
    
    if (jaAprendida && niveisAcima === (parseInt(jaAprendida.niveisAcimaBase) || 0)) {
        fecharModalTecnica();
        return;
    }
    
    const tecnicaAtualizada = {
        id: tecnica.id,
        nome: tecnica.nome,
        descricao: tecnica.descricao,
        dificuldade: tecnica.dificuldade,
        preRequisitos: tecnica.preRequisitos || [],
        niveisAcimaBase: niveisAcima,
        custoPago: custo
    };
    
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnica.id);
    
    if (index >= 0) {
        estadoTecnicas.tecnicasAprendidas[index] = tecnicaAtualizada;
    } else {
        estadoTecnicas.tecnicasAprendidas.push(tecnicaAtualizada);
    }
    
    salvarTecnicas();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    atualizarTecnicasDisponiveis();
    
    if (typeof window.atualizarPontosTotais === 'function') {
        window.atualizarPontosTotais();
    }
    
    fecharModalTecnica();
    
    const mensagem = jaAprendida ? 
        `Técnica "${tecnica.nome}" atualizada para NH ${nhEscolhido} (${niveisAcima > 0 ? '+' : ''}${custo - (jaAprendida.custoPago || 0)} pontos)` :
        `Técnica "${tecnica.nome}" aprendida com NH ${nhEscolhido} (${custo} pontos)`;
    
    console.log(mensagem);
}

// ===== FECHAR MODAL =====
function fecharModalTecnica() {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    
    document.body.style.overflow = '';
    estadoTecnicas.modalAberto = false;
    estadoTecnicas.tecnicaSelecionada = null;
    delete window.tecnicaModalAtual;
}

// ===== SALVAR TÉCNICAS NO LOCALSTORAGE =====
function salvarTecnicas() {
    try {
        const dadosParaSalvar = {
            tecnicasAprendidas: estadoTecnicas.tecnicasAprendidas,
            dataSalvamento: new Date().toISOString()
        };
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(dadosParaSalvar));
        return true;
    } catch (erro) {
        console.error('Erro ao salvar técnicas:', erro);
        return false;
    }
}

// ===== CARREGAR TÉCNICAS DO LOCALSTORAGE =====
function carregarTecnicas() {
    try {
        const dadosSalvos = localStorage.getItem('tecnicasAprendidas');
        if (dadosSalvos) {
            const parsed = JSON.parse(dadosSalvos);
            if (parsed.tecnicasAprendidas && Array.isArray(parsed.tecnicasAprendidas)) {
                estadoTecnicas.tecnicasAprendidas = parsed.tecnicasAprendidas;
                return true;
            }
        }
    } catch (erro) {
        console.error('Erro ao carregar técnicas:', erro);
    }
    return false;
}

// ===== CONFIGURAR EVENT LISTENERS =====
function configurarEventListenersTecnicas() {
    const filtroButtons = document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]');
    filtroButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                const filtro = this.getAttribute('data-filtro');
                if (filtro && filtro !== estadoTecnicas.filtroAtivo) {
                    estadoTecnicas.filtroAtivo = filtro;
                    renderizarFiltrosTecnicas();
                    renderizarCatalogoTecnicas();
                }
            });
        }
    });
    
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoTecnicas.buscaAtiva = this.value;
            renderizarCatalogoTecnicas();
        });
        
        buscaInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                renderizarCatalogoTecnicas();
            }
        });
    }
    
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(event) {
            if (event.target === this) {
                fecharModalTecnica();
            }
        });
    }
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && estadoTecnicas.modalAberto) {
            fecharModalTecnica();
        }
    });
}

// ===== RENDERIZAR FILTROS ATIVOS =====
function renderizarFiltrosTecnicas() {
    const filtroButtons = document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]');
    filtroButtons.forEach(btn => {
        if (btn) {
            const filtro = btn.getAttribute('data-filtro');
            if (filtro === estadoTecnicas.filtroAtivo) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
}

// ===== INICIALIZAR SISTEMA DE TÉCNICAS =====
function inicializarSistemaTecnicas() {
    console.log('🔄 Inicializando sistema de técnicas...');
    
    const checkDependencies = () => {
        const dependencias = {
            catalogoTecnicas: !!window.catalogoTecnicas,
            estadoPericias: !!window.estadoPericias,
            obterDadosAtributos: typeof window.obterDadosAtributos === 'function'
        };
        
        const todasOk = Object.values(dependencias).every(v => v);
        
        if (todasOk) {
            console.log('✅ Todas dependências carregadas');
            executarInicializacao();
        } else {
            console.log('⏳ Aguardando dependências:', dependencias);
            setTimeout(checkDependencies, 500);
        }
    };
    
    const executarInicializacao = () => {
        carregarTecnicas();
        configurarEventListenersTecnicas();
        configurarMonitoramento();
        
        atualizarTecnicasDisponiveis();
        renderizarStatusTecnicas();
        renderizarFiltrosTecnicas();
        renderizarTecnicasAprendidas();
        
        console.log('✅ Sistema de técnicas inicializado com sucesso!');
        console.log(`📊 ${estadoTecnicas.tecnicasAprendidas.length} técnicas carregadas`);
        
        document.dispatchEvent(new CustomEvent('tecnicasInicializadas'));
    };
    
    checkDependencies();
}

// ===== INICIALIZAÇÃO AUTOMÁTICA QUANDO A ABA É ABERTA =====
function observarAbaPericias() {
    const abaPericias = document.getElementById('pericias');
    if (!abaPericias) {
        setTimeout(observarAbaPericias, 1000);
        return;
    }
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const isVisible = abaPericias.style.display !== 'none';
                if (isVisible) {
                    setTimeout(inicializarSistemaTecnicas, 300);
                } else {
                    estadoTecnicas.modalAberto = false;
                    fecharModalTecnica();
                }
            }
        });
    });
    
    observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
    
    if (abaPericias.style.display !== 'none') {
        setTimeout(inicializarSistemaTecnicas, 500);
    }
}

// ===== INICIALIZAÇÃO NO CARREGAMENTO DO DOM =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(observarAbaPericias, 1000);
});

// ===== EXPORTAR FUNÇÕES PARA USO GLOBAL =====
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

// ===== FUNÇÕES DE UTILIDADE ADICIONAIS =====
window.obterTecnicasAprendidas = function() {
    return [...estadoTecnicas.tecnicasAprendidas];
};

window.obterPontosTecnicas = function() {
    return estadoTecnicas.pontosTecnicasTotal;
};

window.reiniciarTecnicas = function() {
    if (confirm('Tem certeza que deseja reiniciar todas as técnicas? Esta ação não pode ser desfeita.')) {
        estadoTecnicas.tecnicasAprendidas = [];
        estadoTecnicas.tecnicasDisponiveis = [];
        salvarTecnicas();
        renderizarStatusTecnicas();
        renderizarTecnicasAprendidas();
        atualizarTecnicasDisponiveis();
        
        if (typeof window.atualizarPontosTotais === 'function') {
            window.atualizarPontosTotais();
        }
        
        alert('Técnicas reiniciadas com sucesso!');
    }
};

console.log('📚 Módulo de técnicas carregado e pronto para inicialização');