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
        if (niveisAcima <= 4) return niveisAcima;
        return 4 + (niveisAcima - 4);
    }
    
    return 0;
}

function obterAtributoAtual(atributo) {
    const dadosAtributos = window.obterDadosAtributos ? window.obterDadosAtributos() : null;
    if (dadosAtributos) {
        switch(atributo) {
            case 'DX': return dadosAtributos.DX || 10;
            case 'IQ': return dadosAtributos.IQ || 10;
            case 'HT': return dadosAtributos.HT || 10;
            case 'PERC': 
                const iq = dadosAtributos.IQ || 10;
                const bonusPercepcao = dadosAtributos.Bonus ? dadosAtributos.Bonus.Percepcao || 0 : 0;
                return iq + bonusPercepcao;
            default: return 10;
        }
    }
    return 10;
}

function obterNHPericiaPorId(idPericia) {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) return null;
    
    const pericia = window.estadoPericias.periciasAprendidas.find(p => p.id === idPericia);
    if (!pericia) return null;
    
    const atributoBase = obterAtributoAtual(pericia.atributo);
    return atributoBase + (pericia.nivel || 0);
}

function verificarPreRequisitosTecnica(tecnica) {
    if (!tecnica || !tecnica.preRequisitos) {
        return { passou: true, motivo: '' };
    }
    
    for (const prereq of tecnica.preRequisitos) {
        let periciaEncontrada = null;
        
        if (prereq.idPericia) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => p.id === prereq.idPericia);
        }
        
        if (!periciaEncontrada && prereq.idsCavalgar) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => 
                prereq.idsCavalgar.includes(p.id)
            );
        }
        
        if (!periciaEncontrada) {
            return { passou: false, motivo: `Falta: ${prereq.nomePericia}` };
        }
        
        if (prereq.nivelMinimo > 0) {
            const nh = obterNHPericiaPorId(periciaEncontrada.id);
            if (nh === null || nh < prereq.nivelMinimo) {
                return { passou: false, motivo: `${prereq.nomePericia} precisa NH ${prereq.nivelMinimo} (tem ${nh || 0})` };
            }
        }
    }
    
    return { passou: true, motivo: '' };
}

function atualizarTecnicasDisponiveis() {
    if (!window.catalogoTecnicas || typeof window.catalogoTecnicas.obterTodasTecnicas !== 'function') {
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    const disponiveis = [];
    
    todasTecnicas.forEach(tecnica => {
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
    renderizarCatalogoTecnicas();
}

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

function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    let tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis;
    
    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Média');
    } else if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Difícil');
    }
    
    if (estadoTecnicas.buscaAtiva.trim() !== '') {
        const termo = estadoTecnicas.buscaAtiva.toLowerCase();
        tecnicasFiltradas = tecnicasFiltradas.filter(t => 
            t.nome.toLowerCase().includes(termo) ||
            (t.descricao && t.descricao.toLowerCase().includes(termo))
        );
    }
    
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia">
                <i class="fas fa-info-circle"></i>
                <div>${estadoTecnicas.tecnicasDisponiveis.length === 0 ? 'Aprenda perícias primeiro' : 'Nenhuma técnica encontrada'}</div>
                <small>${estadoTecnicas.tecnicasDisponiveis.length === 0 ? 'As técnicas aparecerão aqui quando você tiver as perícias necessárias' : 'Tente outro filtro ou busca'}</small>
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
                 style="cursor: ${disponivel ? 'pointer' : 'not-allowed'};">
                <div class="pericia-header">
                    <h4 class="pericia-nome">${tecnica.nome} ${jaAprendida ? '✓' : ''}</h4>
                    <div class="pericia-info">
                        <span class="pericia-dificuldade ${tecnica.dificuldade === 'Difícil' ? 'dificuldade-dificil' : 'dificuldade-medio'}">
                            ${tecnica.dificuldade}
                        </span>
                        ${disponivel ? `<span class="pericia-custo">NH ${tecnica.nhAtual}</span>` : ''}
                    </div>
                </div>
                <p class="pericia-descricao">${tecnica.descricao || ''}</p>
                
                ${!disponivel ? `
                <div class="tecnica-indisponivel-badge">
                    <i class="fas fa-lock"></i> ${tecnica.motivoIndisponivel}
                </div>
                ` : `
                <div class="pericia-requisitos">
                    <small>
                        <strong>${jaAprendida ? 'Nível Atual' : 'Base'}</strong>: NH ${tecnica.nhAtual}
                        ${tecnica.preRequisitos && tecnica.preRequisitos.length > 0 ? 
                          `<br>Requer: ${tecnica.preRequisitos.map(p => `${p.nomePericia} ${p.nivelMinimo > 0 ? p.nivelMinimo+'+' : ''}`).join(', ')}` : ''}
                    </small>
                </div>
                `}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    document.querySelectorAll('.pericia-item[data-id]').forEach(item => {
        if (!item.classList.contains('item-indisponivel') && item.style.cursor === 'pointer') {
            item.addEventListener('click', function() {
                const id = this.dataset.id;
                const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
                if (tecnica && tecnica.disponivel) {
                    abrirModalTecnica(tecnica);
                }
            });
        }
    });
}

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
                        } else if (tecnicaCatalogo.limiteMaximo.tipo === "fixo") {
                            nhMaximo = tecnicaCatalogo.limiteMaximo.valor || Infinity;
                        }
                    }
                }
            }
        }
        
        html += `
            <div class="pericia-aprendida-item" data-tipo="tecnica">
                <div class="pericia-aprendida-header">
                    <h4 class="pericia-aprendida-nome">${tecnica.nome}</h4>
                    <div class="pericia-aprendida-info">
                        <span class="pericia-aprendida-nivel">NH ${nhFinal}</span>
                        <span class="pericia-dificuldade ${tecnica.dificuldade === 'Difícil' ? 'dificuldade-dificil' : 'dificuldade-medio'}">
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-aprendida-custo">${tecnica.custoPago || 0} pts</span>
                    </div>
                </div>
                <div class="pericia-requisitos">
                    <small>
                        <strong>Máximo:</strong> NH ${nhMaximo}
                    </small>
                </div>
                <button class="btn-remover-pericia" data-id="${tecnica.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    document.querySelectorAll('.btn-remover-pericia').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            if (confirm('Remover esta técnica? Os pontos serão perdidos.')) {
                estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
                salvarTecnicas();
                renderizarStatusTecnicas();
                renderizarTecnicasAprendidas();
                atualizarTecnicasDisponiveis();
            }
        });
    });
}

function abrirModalTecnica(tecnica) {
    if (!tecnica) return;
    
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
    
    let baseAtual = 0;
    if (tecnicaCatalogo && tecnicaCatalogo.baseCalculo) {
        if (tecnicaCatalogo.baseCalculo.tipo === "pericia") {
            const nhPericia = obterNHPericiaPorId(tecnicaCatalogo.baseCalculo.idPericia);
            if (nhPericia !== null) {
                baseAtual = nhPericia + (tecnicaCatalogo.baseCalculo.redutor || 0);
            }
        }
    }
    
    let nhMaximo = Infinity;
    if (tecnicaCatalogo && tecnicaCatalogo.limiteMaximo) {
        if (tecnicaCatalogo.limiteMaximo.tipo === "pericia") {
            nhMaximo = obterNHPericiaPorId(tecnicaCatalogo.limiteMaximo.idPericia) || Infinity;
        } else if (tecnicaCatalogo.limiteMaximo.tipo === "fixo") {
            nhMaximo = tecnicaCatalogo.limiteMaximo.valor || Infinity;
        }
    }
    
    const niveisAcima = jaAprendida ? jaAprendida.niveisAcimaBase || 0 : 0;
    const nhAtual = baseAtual + niveisAcima;
    
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    const modalContent = document.querySelector('.modal-tecnica');
    
    if (!modalOverlay || !modalContent) return;
    
    modalContent.innerHTML = `
        <div class="modal-header-pericia">
            <span class="modal-close" onclick="fecharModalTecnica()">&times;</span>
            <h3>${tecnica.nome} ${jaAprendida ? '(Aprendida)' : ''}</h3>
            <div class="modal-subtitulo">
                ${tecnica.dificuldade} • Base: ${tecnicaCatalogo?.baseCalculo?.redutor || 0 >= 0 ? '+' : ''}${tecnicaCatalogo?.baseCalculo?.redutor || 0}
            </div>
        </div>
        
        <div class="modal-body-pericia">
            <div class="nivel-selecao-container">
                <div class="nivel-info-box">
                    <div class="nivel-info-item">
                        <label>Nível Base:</label>
                        <div class="nivel-valor-grande">${baseAtual}</div>
                    </div>
                    <div class="nivel-info-item">
                        <label>Nível Máximo:</label>
                        <div class="nivel-valor-grande">${nhMaximo === Infinity ? '∞' : nhMaximo}</div>
                    </div>
                    <div class="nivel-info-item">
                        <label>Nível Atual:</label>
                        <div class="nivel-valor-grande">${nhAtual}</div>
                    </div>
                </div>
                
                <div class="seletor-nivel-tecnica">
                    <label>Selecione o NH desejado (${baseAtual} a ${nhMaximo === Infinity ? '∞' : nhMaximo}):</label>
                    <select id="seletor-nh-tecnica" class="select-nivel">
                        ${(() => {
                            let options = '';
                            const max = nhMaximo === Infinity ? baseAtual + 10 : nhMaximo;
                            for (let nh = baseAtual; nh <= max; nh++) {
                                const niveisAcimaOpt = nh - baseAtual;
                                const custo = calcularCustoTecnica(niveisAcimaOpt, tecnica.dificuldade);
                                const selected = nh === nhAtual ? 'selected' : '';
                                options += `<option value="${nh}" data-niveis-acima="${niveisAcimaOpt}" data-custo="${custo}" ${selected}>
                                    NH ${nh} (${custo} pontos)
                                </option>`;
                            }
                            return options;
                        })()}
                    </select>
                </div>
                
                <div class="custo-final-box">
                    <div class="custo-final-label">Custo Total:</div>
                    <div class="custo-final-valor" id="custo-final-tecnica">0 pontos</div>
                </div>
            </div>
            
            <div class="detalhes-pericia-descricao">
                <h4>Descrição</h4>
                <p>${tecnica.descricao || ''}</p>
            </div>
            
            ${tecnica.preRequisitos && tecnica.preRequisitos.length > 0 ? `
            <div class="detalhes-pericia-default">
                <strong>Pré-requisitos:</strong> 
                ${tecnica.preRequisitos.map(p => `${p.nomePericia}${p.nivelMinimo > 0 ? ' NH' + p.nivelMinimo + '+' : ''}`).join(', ')}
            </div>
            ` : ''}
            
            ${!verificacao.passou ? `
            <div class="detalhes-pericia-default" style="background: rgba(231, 76, 60, 0.1); border-left-color: #e74c3c;">
                <strong><i class="fas fa-exclamation-triangle"></i> Não pode aprender:</strong><br>
                ${verificacao.motivo}
            </div>
            ` : ''}
        </div>
        
        <div class="modal-actions-pericia">
            <button class="btn-modal btn-cancelar" onclick="fecharModalTecnica()">Cancelar</button>
            <button class="btn-modal btn-confirmar" id="btn-confirmar-tecnica" onclick="confirmarTecnica()" 
                ${!verificacao.passou ? 'disabled' : ''}>
                ${jaAprendida ? 'Atualizar' : 'Aprender'}
            </button>
        </div>
    `;
    
    const select = document.getElementById('seletor-nh-tecnica');
    const custoDisplay = document.getElementById('custo-final-tecnica');
    const btnConfirmar = document.getElementById('btn-confirmar-tecnica');
    
    function atualizarCustoDisplay() {
        const selectedOption = select.options[select.selectedIndex];
        const custo = parseInt(selectedOption.dataset.custo);
        const niveisAcimaOpt = parseInt(selectedOption.dataset.niveisAcima);
        custoDisplay.textContent = `${custo} pontos`;
        
        if (jaAprendida) {
            const custoAtual = jaAprendida.custoPago || 0;
            if (niveisAcimaOpt === jaAprendida.niveisAcimaBase) {
                btnConfirmar.textContent = `Manter (0 pontos)`;
                btnConfirmar.disabled = true;
            } else {
                const diferenca = custo - custoAtual;
                if (diferenca > 0) {
                    btnConfirmar.textContent = `Melhorar (+${diferenca} pontos)`;
                } else {
                    btnConfirmar.textContent = `Reduzir (${diferenca} pontos)`;
                }
                btnConfirmar.disabled = false;
            }
        } else {
            btnConfirmar.textContent = `Aprender (${custo} pontos)`;
        }
    }
    
    select.addEventListener('change', atualizarCustoDisplay);
    atualizarCustoDisplay();
    
    modalOverlay.style.display = 'block';
    
    window.tecnicaModalData = {
        tecnica: tecnica,
        jaAprendida: jaAprendida,
        tecnicaCatalogo: tecnicaCatalogo
    };
}

function confirmarTecnica() {
    if (!window.tecnicaModalData) return;
    
    const { tecnica, jaAprendida, tecnicaCatalogo } = window.tecnicaModalData;
    const select = document.getElementById('seletor-nh-tecnica');
    
    if (!select) return;
    
    const nhEscolhido = parseInt(select.value);
    const selectedOption = select.options[select.selectedIndex];
    const niveisAcima = parseInt(selectedOption.dataset.niveisAcima);
    const custo = parseInt(selectedOption.dataset.custo);
    
    if (jaAprendida && niveisAcima === jaAprendida.niveisAcimaBase) {
        fecharModalTecnica();
        return;
    }
    
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnica.id);
    
    if (index >= 0) {
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisAcimaBase: niveisAcima,
            custoPago: custo
        };
    } else {
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
            preRequisitos: tecnica.preRequisitos,
            niveisAcimaBase: niveisAcima,
            custoPago: custo,
            dataAprendizado: new Date().toISOString()
        });
    }
    
    fecharModalTecnica();
    salvarTecnicas();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    atualizarTecnicasDisponiveis();
    
    if (window.atualizarPontosTotais) {
        window.atualizarPontosTotais();
    }
}

function fecharModalTecnica() {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    window.tecnicaModalData = null;
}

function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    } catch (e) {}
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
        }
    } catch (e) {
        estadoTecnicas.tecnicasAprendidas = [];
    }
}

function configurarEventListenersTecnicas() {
    const filtroButtons = document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]');
    filtroButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            estadoTecnicas.filtroAtivo = this.dataset.filtro;
            renderizarFiltrosTecnicas();
            renderizarCatalogoTecnicas();
        });
    });
    
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoTecnicas.buscaAtiva = this.value;
            renderizarCatalogoTecnicas();
        });
    }
    
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalTecnica();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharModalTecnica();
        }
    });
}

function renderizarFiltrosTecnicas() {
    const filtroButtons = document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]');
    filtroButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filtro === estadoTecnicas.filtroAtivo) {
            btn.classList.add('active');
        }
    });
}

function configurarMonitoramento() {
    if (window.addEventListener) {
        window.addEventListener('atributosAlterados', function() {
            atualizarTecnicasDisponiveis();
            renderizarStatusTecnicas();
            renderizarTecnicasAprendidas();
        });
    }
    
    if (window.estadoPericias) {
        let ultimasPericias = JSON.stringify(window.estadoPericias.periciasAprendidas || []);
        
        setInterval(() => {
            if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) return;
            
            const periciasAtuais = JSON.stringify(window.estadoPericias.periciasAprendidas);
            if (periciasAtuais !== ultimasPericias) {
                ultimasPericias = periciasAtuais;
                atualizarTecnicasDisponiveis();
                renderizarStatusTecnicas();
                renderizarTecnicasAprendidas();
            }
        }, 1000);
    }
}

function inicializarSistemaTecnicas() {
    carregarTecnicas();
    configurarEventListenersTecnicas();
    configurarMonitoramento();
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarFiltrosTecnicas();
    renderizarTecnicasAprendidas();
}

window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const abaPericias = document.getElementById('pericias');
        
        if (abaPericias) {
            if (abaPericias.style.display !== 'none') {
                inicializarSistemaTecnicas();
            }
            
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (abaPericias.style.display !== 'none') {
                            setTimeout(inicializarSistemaTecnicas, 100);
                        }
                    }
                });
            });
            
            observer.observe(abaPericias, { 
                attributes: true, 
                attributeFilter: ['style'] 
            });
        }
    }, 500);
});

const cssTecnicas = `
<style id="css-tecnicas-modal">
.nivel-info-box {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
    background: rgba(40, 40, 50, 0.8);
    border: 1px solid rgba(255, 140, 0, 0.2);
    border-radius: 8px;
    padding: 20px;
}

.nivel-info-item {
    text-align: center;
}

.nivel-info-item label {
    display: block;
    color: #95a5a6;
    font-size: 0.9em;
    margin-bottom: 5px;
}

.nivel-valor-grande {
    color: #ffd700;
    font-size: 2em;
    font-weight: 700;
    line-height: 1;
}

.seletor-nivel-tecnica {
    margin: 20px 0;
}

.seletor-nivel-tecnica label {
    display: block;
    color: #95a5a6;
    font-size: 0.95em;
    margin-bottom: 10px;
    font-weight: 500;
}

.select-nivel {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid rgba(255, 140, 0, 0.3);
    border-radius: 8px;
    background: rgba(40, 40, 50, 0.95);
    color: #ffd700;
    font-size: 1em;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23ffd700' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 15px center;
    background-size: 16px;
    padding-right: 45px;
}

.select-nivel:hover {
    border-color: #ff8c00;
    background-color: rgba(50, 50, 65, 0.95);
}

.select-nivel:focus {
    outline: none;
    border-color: #ff8c00;
    box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.2);
}

.custo-final-box {
    background: rgba(39, 174, 96, 0.1);
    border: 2px solid rgba(39, 174, 96, 0.3);
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    margin-top: 20px;
}

.custo-final-label {
    color: #95a5a6;
    font-size: 1em;
    margin-bottom: 5px;
}

.custo-final-valor {
    color: #27ae60;
    font-size: 2.2em;
    font-weight: 700;
}

@media (max-width: 768px) {
    .nivel-info-box {
        grid-template-columns: 1fr;
        gap: 15px;
        padding: 15px;
    }
    
    .nivel-valor-grande {
        font-size: 1.8em;
    }
    
    .custo-final-valor {
        font-size: 1.8em;
    }
    
    .select-nivel {
        font-size: 0.95em;
        padding: 10px 14px;
    }
}
</style>
`;

if (!document.getElementById('css-tecnicas-modal')) {
    document.head.insertAdjacentHTML('beforeend', cssTecnicas);
}