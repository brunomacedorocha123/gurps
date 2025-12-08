// ===== SISTEMA DE TÉCNICAS - VERSÃO DEFINITIVA =====
console.log("🎯 SISTEMA DE TÉCNICAS - INICIADO");

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

// ===== TABELA DE CUSTO =====
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

// ===== OBTER NH DA PERÍCIA - VERSÃO FINAL =====
function obterNHPericiaPorId(idPericia) {
    console.log(`🔍 Buscando NH para: ${idPericia}`);
    
    if (idPericia === 'arco') {
        // 1. VERIFICAR SISTEMA DE PERÍCIAS
        if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
            console.log("❌ Sistema de perícias não disponível");
            return null;
        }
        
        // 2. BUSCAR PERÍCIA ARCO
        const periciaArco = window.estadoPericias.periciasAprendidas.find(p => p.id === 'arco');
        
        if (!periciaArco) {
            console.log("❌ Perícia Arco não encontrada");
            return null;
        }
        
        console.log("✅ Perícia Arco encontrada:", periciaArco);
        
        // 3. DETECTAR O NH
        // Verificar todas as propriedades possíveis onde pode estar o NH
        if (periciaArco.nh !== undefined) {
            console.log(`✅ NH encontrado em .nh: ${periciaArco.nh}`);
            return periciaArco.nh;
        }
        if (periciaArco.NH !== undefined) {
            console.log(`✅ NH encontrado em .NH: ${periciaArco.NH}`);
            return periciaArco.NH;
        }
        if (periciaArco.valor !== undefined) {
            console.log(`✅ NH encontrado em .valor: ${periciaArco.valor}`);
            return periciaArco.valor;
        }
        if (periciaArco.nivel !== undefined) {
            // Se tem nível, buscar DX atual para calcular
            let dxAtual = obterDXAtual();
            const nhCalculado = dxAtual + periciaArco.nivel;
            console.log(`📊 NH calculado: DX ${dxAtual} + nível ${periciaArco.nivel} = ${nhCalculado}`);
            return nhCalculado;
        }
        
        console.log("❌ Não foi possível determinar o NH da perícia Arco");
        return null;
    }
    
    if (idPericia.includes('cavalgar')) {
        // Para Cavalgar, só precisa verificar se existe
        const temCavalgar = window.estadoPericias.periciasAprendidas.some(p => 
            p.id.includes('cavalgar') || p.nome.includes('Cavalgar')
        );
        return temCavalgar ? 10 : null;
    }
    
    return null;
}

// ===== OBTER DX ATUAL (apenas se necessário) =====
function obterDXAtual() {
    if (window.obterAtributoAtual) {
        return window.obterAtributoAtual('DX');
    }
    
    // Fallback: buscar input
    const dxInput = document.getElementById('DX');
    if (dxInput && dxInput.value) {
        return parseInt(dxInput.value) || 10;
    }
    
    return 10;
}

// ===== VERIFICAR PRÉ-REQUISITOS =====
function verificarPreRequisitosTecnica(tecnica) {
    if (!tecnica.preRequisitos || !window.estadoPericias) {
        return { passou: true, motivo: '' };
    }
    
    // Verificar Arco-4
    const reqArco = tecnica.preRequisitos.find(req => req.idPericia === 'arco');
    if (reqArco) {
        const periciaArco = window.estadoPericias.periciasAprendidas.find(p => p.id === 'arco');
        if (!periciaArco) {
            return { passou: false, motivo: '❌ Precisa da perícia Arco' };
        }
        if (periciaArco.nivel < reqArco.nivelMinimo) {
            return { passou: false, motivo: `❌ Arco precisa ter nível ${reqArco.nivelMinimo}` };
        }
    }
    
    // Verificar Cavalgar
    const reqCavalgar = tecnica.preRequisitos.find(req => req.idsCavalgar);
    if (reqCavalgar) {
        const temCavalgar = window.estadoPericias.periciasAprendidas.some(p => 
            reqCavalgar.idsCavalgar.includes(p.id) || p.id.includes('cavalgar')
        );
        if (!temCavalgar) {
            return { passou: false, motivo: '❌ Precisa de alguma perícia de Cavalgar' };
        }
    }
    
    return { passou: true, motivo: '' };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    if (!window.catalogoTecnicas) return;
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    
    const disponiveis = todasTecnicas.map(tecnica => {
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        // Calcular NH base
        let nhBase = 0;
        let motivoNH = '';
        
        if (tecnica.baseCalculo && tecnica.baseCalculo.idPericia) {
            const nhPericia = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
            
            if (nhPericia === null) {
                motivoNH = '❌ Não foi possível obter o NH da perícia base';
                nhBase = 0;
            } else {
                nhBase = nhPericia + (tecnica.baseCalculo.redutor || 0);
                
                // Adicionar níveis comprados
                if (jaAprendida && jaAprendida.niveisComprados) {
                    nhBase += jaAprendida.niveisComprados;
                }
                
                // Verificar se não excede máximo
                const nhMaximo = obterNHPericiaPorId(tecnica.limiteMaximo.idPericia);
                if (nhMaximo !== null && nhBase > nhMaximo) {
                    nhBase = nhMaximo;
                }
            }
        }
        
        return {
            ...tecnica,
            disponivel: verificacao.passou && motivoNH === '',
            nhAtual: nhBase,
            motivoIndisponivel: !verificacao.passou ? verificacao.motivo : motivoNH,
            jaAprendida: !!jaAprendida
        };
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    renderizarCatalogoTecnicas();
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
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
            <div class="nenhuma-pericia">
                <i class="fas fa-info-circle"></i>
                <div>Nenhuma técnica disponível</div>
                <small>Verifique se você tem os pré-requisitos necessários</small>
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
                        border: 1px solid ${jaAprendida ? 'rgba(39, 174, 96, 0.4)' : 'rgba(255, 140, 0, 0.3)'};">
                
                <div class="pericia-header">
                    <h4 class="pericia-nome">
                        ${tecnica.nome}
                        ${jaAprendida ? '<span style="color: #27ae60; margin-left: 5px;">✓</span>' : ''}
                    </h4>
                    <div class="pericia-info">
                        <span class="pericia-dificuldade ${tecnica.dificuldade === 'Difícil' ? 'dificuldade-dificil' : 'dificuldade-medio'}">
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-custo">NH ${tecnica.nhAtual || 0}</span>
                    </div>
                </div>
                
                <p class="pericia-descricao">${tecnica.descricao}</p>
                
                ${!disponivel ? `
                    <div class="tecnica-indisponivel-badge">
                        <i class="fas fa-lock"></i> ${tecnica.motivoIndisponivel}
                    </div>
                ` : ''}
                
                ${disponivel ? `
                    <div style="margin-top: 10px; font-size: 12px; color: #95a5a6;">
                        <i class="fas fa-bullseye"></i>
                        Clique para ${jaAprendida ? 'melhorar' : 'aprender'} esta técnica
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adicionar eventos
    const itens = container.querySelectorAll('.pericia-item:not(.item-indisponivel)');
    itens.forEach(item => {
        item.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
            if (tecnica) {
                abrirModalTecnica(tecnica);
            }
        });
    });
}

// ===== ABRIR MODAL =====
function abrirModalTecnica(tecnica) {
    estadoTecnicas.tecnicaSelecionada = tecnica;
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    // Obter valores atuais
    const nhArco = obterNHPericiaPorId('arco');
    if (nhArco === null) {
        alert("Não foi possível obter o NH da perícia Arco");
        return;
    }
    
    const nhBase = nhArco - 4;
    const nhMaximo = nhArco;
    
    let nhAtual = nhBase;
    let niveisComprados = 0;
    let custoTotal = 0;
    
    if (jaAprendida) {
        niveisComprados = jaAprendida.niveisComprados || 0;
        custoTotal = jaAprendida.custoTotal || 0;
        nhAtual = nhBase + niveisComprados;
    }
    
    // Criar opções
    let opcoesHTML = '';
    const niveisPossiveis = Math.max(0, nhMaximo - nhBase);
    
    for (let i = 0; i <= niveisPossiveis; i++) {
        const nhOpcao = nhBase + i;
        const custo = calcularCustoTecnica(i, tecnica.dificuldade);
        const selected = nhOpcao === nhAtual ? 'selected' : '';
        
        opcoesHTML += `
            <option value="${i}" data-custo="${custo}" ${selected}>
                NH ${nhOpcao} (${custo} pontos)
            </option>
        `;
    }
    
    // Criar modal
    const modalHTML = `
        <div style="background: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0; position: relative;">
            <span onclick="fecharModalTecnica()" style="position: absolute; right: 20px; top: 20px; font-size: 24px; cursor: pointer; color: #ffd700;">×</span>
            <h3 style="margin: 0; color: #ffd700;">${tecnica.nome}</h3>
            <div style="color: #95a5a6; margin-top: 5px;">${tecnica.dificuldade} • Técnica Especial</div>
        </div>
        
        <div style="padding: 20px; background: #1e1e28; color: #ccc; max-height: 60vh; overflow-y: auto;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 10px; background: rgba(52, 152, 219, 0.1); border-radius: 8px;">
                    <div style="font-size: 12px; color: #95a5a6;">Base (Arco-4)</div>
                    <div style="font-size: 24px; font-weight: bold; color: #3498db;">${nhBase}</div>
                </div>
                <div style="text-align: center; padding: 10px; background: rgba(39, 174, 96, 0.1); border-radius: 8px;">
                    <div style="font-size: 12px; color: #95a5a6;">Máximo (NH Arco)</div>
                    <div style="font-size: 24px; font-weight: bold; color: #27ae60;">${nhMaximo}</div>
                </div>
                <div style="text-align: center; padding: 10px; background: rgba(243, 156, 18, 0.1); border-radius: 8px;">
                    <div style="font-size: 12px; color: #95a5a6;">Atual</div>
                    <div style="font-size: 24px; font-weight: bold; color: #f39c12;">${nhAtual}</div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #ffd700; font-weight: bold;">
                    Níveis acima da base:
                </label>
                <select id="select-niveis-tecnica" 
                        style="width: 100%; padding: 12px; border-radius: 5px; border: 2px solid #ff8c00; 
                               background: #2c3e50; color: #ffd700; font-size: 16px; cursor: pointer;">
                    ${opcoesHTML}
                </select>
            </div>
            
            <div style="background: rgba(39, 174, 96, 0.1); padding: 15px; border-radius: 5px; 
                        border-left: 4px solid #27ae60; margin-bottom: 20px;">
                <div style="font-size: 12px; color: #95a5a6;">Custo Total</div>
                <div id="custo-display" style="font-size: 28px; font-weight: bold; color: #27ae60;">
                    ${custoTotal} pontos
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="color: #ffd700; margin-bottom: 10px;">Descrição</h4>
                <p style="line-height: 1.5;">${tecnica.descricao}</p>
            </div>
        </div>
        
        <div style="padding: 20px; background: #2c3e50; border-radius: 0 0 8px 8px; display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="fecharModalTecnica()" 
                    style="padding: 12px 24px; background: #7f8c8d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                Cancelar
            </button>
            <button onclick="comprarTecnica()" 
                    id="btn-comprar-tecnica"
                    style="padding: 12px 24px; background: linear-gradient(45deg, #ff8c00, #ffd700); 
                           color: #1e1e28; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">
                ${jaAprendida ? 'Atualizar' : 'Comprar'}
            </button>
        </div>
    `;
    
    const modal = document.querySelector('.modal-tecnica');
    if (!modal) return;
    
    modal.innerHTML = modalHTML;
    document.querySelector('.modal-tecnica-overlay').style.display = 'flex';
    estadoTecnicas.modalAberto = true;
    
    // Configurar eventos
    const select = document.getElementById('select-niveis-tecnica');
    const custoDisplay = document.getElementById('custo-display');
    const btnComprar = document.getElementById('btn-comprar-tecnica');
    
    function atualizarCusto() {
        if (!select || !custoDisplay) return;
        
        const niveisSelecionados = parseInt(select.value);
        const custo = calcularCustoTecnica(niveisSelecionados, tecnica.dificuldade);
        
        custoDisplay.textContent = `${custo} pontos`;
        
        if (btnComprar) {
            if (jaAprendida && niveisSelecionados === niveisComprados) {
                btnComprar.textContent = 'Manter';
                btnComprar.style.background = '#95a5a6';
                btnComprar.disabled = true;
            } else {
                btnComprar.textContent = jaAprendida ? 'Atualizar' : 'Comprar';
                btnComprar.style.background = 'linear-gradient(45deg, #ff8c00, #ffd700)';
                btnComprar.disabled = false;
            }
        }
    }
    
    if (select) {
        select.addEventListener('change', atualizarCusto);
        atualizarCusto();
    }
}

// ===== COMPRAR TÉCNICA =====
function comprarTecnica() {
    if (!estadoTecnicas.tecnicaSelecionada) return;
    
    const select = document.getElementById('select-niveis-tecnica');
    if (!select) return;
    
    const niveisComprados = parseInt(select.value);
    const custo = calcularCustoTecnica(niveisComprados, estadoTecnicas.tecnicaSelecionada.dificuldade);
    
    const tecnicaId = estadoTecnicas.tecnicaSelecionada.id;
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnicaId);
    
    if (index >= 0) {
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisComprados: niveisComprados,
            custoTotal: custo,
            dataAtualizacao: new Date().toISOString()
        };
    } else {
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
    
    salvarTecnicas();
    atualizarTecnicasDisponiveis();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
    fecharModalTecnica();
    
    alert(`✅ ${estadoTecnicas.tecnicaSelecionada.nome} ${index >= 0 ? 'atualizada' : 'aprendida'}!`);
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
    
    let html = '';
    
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const nhArco = obterNHPericiaPorId('arco') || 10;
        const nhBase = nhArco - 4;
        const nhAtual = nhBase + (tecnica.niveisComprados || 0);
        
        html += `
            <div class="pericia-aprendida-item" style="background: rgba(155, 89, 182, 0.15); border-color: rgba(155, 89, 182, 0.4);">
                <div class="pericia-aprendida-header">
                    <h4 class="pericia-aprendida-nome">
                        ${tecnica.nome}
                        <span style="color: #e67e22; font-size: 0.9em; font-style: italic; margin-left: 5px;">
                            (Arco-4 + ${tecnica.niveisComprados || 0})
                        </span>
                    </h4>
                    <div class="pericia-aprendida-info">
                        <span class="pericia-aprendida-nivel">NH ${nhAtual}</span>
                        <span class="pericia-aprendida-custo">${tecnica.custoTotal || 0} pts</span>
                    </div>
                </div>
                
                <div style="font-size: 13px; color: #95a5a6; margin-top: 5px;">
                    <div><strong>Base (Arco-4):</strong> ${nhBase}</div>
                    <div><strong>Níveis comprados:</strong> ${tecnica.niveisComprados || 0}</div>
                </div>
                
                <button onclick="removerTecnica('${tecnica.id}')" 
                        class="btn-remover-pericia">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== REMOVER TÉCNICA =====
function removerTecnica(id) {
    if (confirm('Remover esta técnica?')) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
        salvarTecnicas();
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
    }
}

// ===== ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticasTecnicas() {
    estadoTecnicas.pontosTecnicasTotal = 0;
    estadoTecnicas.pontosMedio = 0;
    estadoTecnicas.pontosDificil = 0;
    estadoTecnicas.qtdMedio = 0;
    estadoTecnicas.qtdDificil = 0;
    
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
    document.getElementById('qtd-tecnicas-medio')?.textContent = estadoTecnicas.qtdMedio;
    document.getElementById('pts-tecnicas-medio')?.textContent = `(${estadoTecnicas.pontosMedio} pts)`;
    document.getElementById('qtd-tecnicas-dificil')?.textContent = estadoTecnicas.qtdDificil;
    document.getElementById('pts-tecnicas-dificil')?.textContent = `(${estadoTecnicas.pontosDificil} pts)`;
    document.getElementById('qtd-tecnicas-total')?.textContent = estadoTecnicas.qtdTotal;
    document.getElementById('pts-tecnicas-total')?.textContent = `(${estadoTecnicas.pontosTecnicasTotal} pts)`;
    
    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) badge.textContent = `[${estadoTecnicas.pontosTecnicasTotal} pts]`;
}

// ===== FECHAR MODAL =====
function fecharModalTecnica() {
    const modal = document.querySelector('.modal-tecnica-overlay');
    if (modal) modal.style.display = 'none';
    estadoTecnicas.modalAberto = false;
    estadoTecnicas.tecnicaSelecionada = null;
}

// ===== SALVAR/CARREGAR =====
function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    } catch (e) {
        console.error("Erro ao salvar:", e);
    }
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
        }
    } catch (e) {
        console.error("Erro ao carregar:", e);
    }
}

// ===== CONFIGURAR EVENTOS =====
function configurarEventListenersTecnicas() {
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
    
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoTecnicas.buscaAtiva = this.value;
            renderizarCatalogoTecnicas();
        });
    }
    
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

// ===== OBSERVAR MUDANÇAS =====
function observarMudancas() {
    document.addEventListener('atributosAlterados', function() {
        setTimeout(() => {
            atualizarTecnicasDisponiveis();
        }, 100);
    });
}

// ===== INICIALIZAR =====
function inicializarSistemaTecnicas() {
    carregarTecnicas();
    configurarEventListenersTecnicas();
    observarMudancas();
    
    setTimeout(() => {
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
    }, 500);
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    const verificarAba = setInterval(() => {
        const abaPericias = document.getElementById('pericias');
        if (abaPericias && abaPericias.style.display !== 'none') {
            clearInterval(verificarAba);
            
            setTimeout(() => {
                if (!window.sistemaTecnicasInicializado) {
                    inicializarSistemaTecnicas();
                    window.sistemaTecnicasInicializado = true;
                }
            }, 1000);
        }
    }, 500);
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const abaPericias = document.getElementById('pericias');
                if (abaPericias && abaPericias.style.display !== 'none') {
                    if (!window.sistemaTecnicasInicializado) {
                        setTimeout(() => {
                            inicializarSistemaTecnicas();
                            window.sistemaTecnicasInicializado = true;
                        }, 500);
                    }
                }
            }
        });
    });
    
    const abaPericias = document.getElementById('pericias');
    if (abaPericias) {
        observer.observe(abaPericias, { attributes: true });
    }
});

// ===== EXPORTAR =====
window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

console.log("✅ Sistema de Técnicas carregado!");