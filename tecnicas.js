// ===== SISTEMA DE TÉCNICAS — VERSÃO ESTÁVEL E COMPATÍVEL =====
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

// ===== FUNÇÕES DE APOIO =====
function obterAtributoAtual(atributo) {
    if (window.obterDadosAtributos) {
        const dados = window.obterDadosAtributos();
        if (dados) {
            switch (atributo) {
                case 'DX': return dados.DX || 10;
                case 'IQ': return dados.IQ || 10;
                case 'HT': return dados.HT || 10;
                case 'PERC': return (dados.IQ || 10) + (dados.Bonus?.Percepcao || 0);
                default: return 10;
            }
        }
    }
    return 10;
}

function obterNHPericiaPorId(id) {
    const pericia = window.estadoPericias?.periciasAprendidas?.find(p => p.id === id);
    if (!pericia) return null;
    return obterAtributoAtual(pericia.atributo) + (pericia.nivel || 0);
}

function verificarPreRequisitosTecnica(tecnica) {
    if (!tecnica?.preRequisitos) return { passou: true };
    
    for (const prereq of tecnica.preRequisitos) {
        let pericia = null;
        if (prereq.idPericia) {
            pericia = window.estadoPericias?.periciasAprendidas?.find(p => p.id === prereq.idPericia);
        }
        if (!pericia && prereq.idsCavalgar) {
            pericia = window.estadoPericias?.periciasAprendidas?.find(p => prereq.idsCavalgar.includes(p.id));
        }
        if (!pericia) {
            return { passou: false, motivo: `Falta: ${prereq.nomePericia}` };
        }
        if (prereq.nivelMinimo > 0) {
            const nh = obterNHPericiaPorId(pericia.id);
            if (!nh || nh < prereq.nivelMinimo) {
                return { passou: false, motivo: `${prereq.nomePericia} precisa NH ${prereq.nivelMinimo} (tem ${nh})` };
            }
        }
    }
    return { passou: true };
}

// ===== CUSTO E NH =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima <= 0) return 0;
    if (dificuldade === 'Difícil') {
        if (niveisAcima <= 4) return niveisAcima + 1;
        return 5 + (niveisAcima - 4);
    }
    if (dificuldade === 'Média') {
        if (niveisAcima <= 4) return niveisAcima;
        return 4 + (niveisAcima - 4);
    }
    return 0;
}

// ===== ATUALIZAÇÃO E RENDERIZAÇÃO =====
function atualizarTecnicasDisponiveis() {
    if (!window.catalogoTecnicas?.obterTodasTecnicas) return;
    
    const todas = window.catalogoTecnicas.obterTodasTecnicas();
    estadoTecnicas.tecnicasDisponiveis = todas.map(tecnica => {
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        let nhAtual = 0;
        if (tecnica.baseCalculo?.tipo === "pericia") {
            const nhBase = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
            if (nhBase !== null) {
                nhAtual = nhBase + (tecnica.baseCalculo.redutor || 0);
                if (jaAprendida) nhAtual += (jaAprendida.niveisAcimaBase || 0);
            }
        }
        
        return { ...tecnica, disponivel: verificacao.passou, nhAtual, jaAprendida: !!jaAprendida, motivoIndisponivel: verificacao.motivo || '' };
    });
    
    renderizarCatalogoTecnicas();
}

function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    let tecnicas = estadoTecnicas.tecnicasDisponiveis;
    
    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas') {
        tecnicas = tecnicas.filter(t => t.dificuldade === 'Média');
    } else if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas') {
        tecnicas = tecnicas.filter(t => t.dificuldade === 'Difícil');
    }
    
    if (estadoTecnicas.buscaAtiva) {
        const termo = estadoTecnicas.buscaAtiva.toLowerCase();
        tecnicas = tecnicas.filter(t => t.nome.toLowerCase().includes(termo) || (t.descricao && t.descricao.toLowerCase().includes(termo)));
    }
    
    if (tecnicas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia">
                <i class="fas fa-info-circle"></i>
                <div>Aprenda perícias primeiro</div>
                <small>As técnicas aparecerão aqui quando você tiver as perícias necessárias</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tecnicas.map(t => `
        <div class="pericia-item ${!t.disponivel ? 'item-indisponivel' : ''}" 
             data-id="${t.id}" 
             style="cursor: ${t.disponivel ? 'pointer' : 'not-allowed'};">
            <div class="pericia-header">
                <h4 class="pericia-nome">${t.nome} ${t.jaAprendida ? '✓' : ''}</h4>
                <div class="pericia-info">
                    <span class="pericia-dificuldade ${t.dificuldade === 'Difícil' ? 'dificuldade-dificil' : 'dificuldade-medio'}">
                        ${t.dificuldade}
                    </span>
                    ${t.disponivel ? `<span class="pericia-custo">NH ${t.nhAtual}</span>` : ''}
                </div>
            </div>
            <p class="pericia-descricao">${t.descricao || ''}</p>
            ${!t.disponivel ? `
                <div class="tecnica-indisponivel-badge">
                    <i class="fas fa-lock"></i> ${t.motivoIndisponivel}
                </div>
            ` : `
                <div class="pericia-requisitos">
                    <small><strong>Base:</strong> NH ${t.nhAtual}</small>
                </div>
            `}
        </div>
    `).join('');
    
    container.querySelectorAll('.pericia-item[data-id]').forEach(item => {
        if (item.style.cursor === 'pointer') {
            item.onclick = () => abrirModalTecnica(
                estadoTecnicas.tecnicasDisponiveis.find(t => t.id === item.dataset.id)
            );
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
    
    container.innerHTML = estadoTecnicas.tecnicasAprendidas.map(t => {
        const cat = window.catalogoTecnicas?.buscarTecnicaPorId(t.id);
        let nh = 0, nhMax = '∞';
        if (cat?.baseCalculo?.tipo === "pericia") {
            const nhBase = obterNHPericiaPorId(cat.baseCalculo.idPericia);
            if (nhBase !== null) {
                nh = nhBase + (cat.baseCalculo.redutor || 0) + (t.niveisAcimaBase || 0);
                if (cat.limiteMaximo?.tipo === "pericia") {
                    nhMax = obterNHPericiaPorId(cat.limiteMaximo.idPericia) || '∞';
                }
            }
        }
        return `
            <div class="pericia-aprendida-item" data-tipo="tecnica">
                <div class="pericia-aprendida-header">
                    <h4 class="pericia-aprendida-nome">${t.nome}</h4>
                    <div class="pericia-aprendida-info">
                        <span class="pericia-aprendida-nivel">NH ${nh}</span>
                        <span class="pericia-dificuldade ${t.dificuldade === 'Difícil' ? 'dificuldade-dificil' : 'dificuldade-medio'}">
                            ${t.dificuldade}
                        </span>
                        <span class="pericia-aprendida-custo">${t.custoPago} pts</span>
                    </div>
                </div>
                <div class="pericia-requisitos">
                    <small><strong>Máximo:</strong> NH ${nhMax}</small>
                </div>
                <button class="btn-remover-pericia" data-id="${t.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');
    
    container.querySelectorAll('.btn-remover-pericia').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (confirm('Remover esta técnica?')) {
                estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
                salvarTecnicas();
                renderizarStatusTecnicas();
                renderizarTecnicasAprendidas();
                atualizarTecnicasDisponiveis();
            }
        };
    });
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
    
    const ids = ['qtd-tecnicas-medio', 'pts-tecnicas-medio', 'qtd-tecnicas-dificil', 'pts-tecnicas-dificil', 'qtd-tecnicas-total', 'pts-tecnicas-total', 'pontos-tecnicas-total'];
    const valores = [
        estadoTecnicas.qtdMedio,
        `(${estadoTecnicas.pontosMedio} pts)`,
        estadoTecnicas.qtdDificil,
        `(${estadoTecnicas.pontosDificil} pts)`,
        estadoTecnicas.qtdTotal,
        `(${estadoTecnicas.pontosTecnicasTotal} pts)`,
        `[${estadoTecnicas.pontosTecnicasTotal} pts]`
    ];
    
    ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.textContent = valores[i];
    });
}

// ===== MODAL =====
function abrirModalTecnica(tecnica) {
    if (!tecnica) return;
    
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    const cat = window.catalogoTecnicas?.buscarTecnicaPorId(tecnica.id);
    const base = (cat?.baseCalculo?.tipo === "pericia") 
        ? (obterNHPericiaPorId(cat.baseCalculo.idPericia) || 0) + (cat.baseCalculo.redutor || 0)
        : 0;
    const niveisAcima = jaAprendida?.niveisAcimaBase || 0;
    const nhAtual = base + niveisAcima;
    
    let nhMax = Infinity;
    if (cat?.limiteMaximo?.tipo === "pericia") {
        nhMax = obterNHPericiaPorId(cat.limiteMaximo.idPericia) || Infinity;
    }
    
    const maxDisplay = nhMax === Infinity ? base + 10 : nhMax;
    
    const modal = document.querySelector('.modal-tecnica');
    if (!modal) return;
    
    modal.innerHTML = `
        <div class="modal-header-pericia">
            <span class="modal-close" onclick="fecharModalTecnica()">&times;</span>
            <h3>${tecnica.nome} ${jaAprendida ? '(Aprendida)' : ''}</h3>
            <div class="modal-subtitulo">${tecnica.dificuldade} • Base: ${cat?.baseCalculo?.redutor || 0 >= 0 ? '+' : ''}${cat?.baseCalculo?.redutor || 0}</div>
        </div>
        <div class="modal-body-pericia">
            <div style="margin: 15px 0;">
                <label>Selecione o NH desejado (${base} a ${nhMax === Infinity ? '∞' : nhMax}):</label>
                <select id="seletor-nh" style="width:100%; padding:10px; margin:10px 0; border:1px solid #ff8c00; background:#282832; color:#ffd700; border-radius:5px;">
                    ${Array.from({length: Math.max(1, maxDisplay - base + 1)}, (_, i) => {
                        const nh = base + i;
                        const niveis = nh - base;
                        const custo = calcularCustoTecnica(niveis, tecnica.dificuldade);
                        const selected = nh === nhAtual ? 'selected' : '';
                        return `<option value="${nh}" data-niveis="${niveis}" data-custo="${custo}" ${selected}>NH ${nh} (${custo} pts)</option>`;
                    }).join('')}
                </select>
                <div style="text-align:center; margin-top:15px; padding:10px; background:rgba(39,174,96,0.1); border:1px solid rgba(39,174,96,0.3); border-radius:5px;">
                    <div>Custo Total: <span id="custo-display">0</span> pts</div>
                </div>
            </div>
            <div class="detalhes-pericia-descricao">
                <h4>Descrição</h4>
                <p>${tecnica.descricao || ''}</p>
            </div>
            ${tecnica.preRequisitos?.length ? `
                <div class="detalhes-pericia-default">
                    <strong>Pré-requisitos:</strong> ${tecnica.preRequisitos.map(p => `${p.nomePericia}${p.nivelMinimo ? ' NH'+p.nivelMinimo+'+' : ''}`).join(', ')}
                </div>
            ` : ''}
        </div>
        <div class="modal-actions-pericia">
            <button class="btn-modal btn-cancelar" onclick="fecharModalTecnica()">Cancelar</button>
            <button class="btn-modal btn-confirmar" id="btn-confirmar-tecnica" onclick="confirmarTecnica()" ${!verificarPreRequisitosTecnica(tecnica).passou ? 'disabled' : ''}>
                ${jaAprendida ? 'Atualizar' : 'Aprender'}
            </button>
        </div>
    `;
    
    const select = document.getElementById('seletor-nh');
    const custoDisplay = document.getElementById('custo-display');
    const btnConfirmar = document.getElementById('btn-confirmar-tecnica');
    
    function atualizarCusto() {
        const option = select.selectedOptions[0];
        if (!option) return;
        const custo = option.dataset.custo;
        const niveis = option.dataset.niveis;
        custoDisplay.textContent = custo;
        
        if (jaAprendida && niveis == jaAprendida.niveisAcimaBase) {
            btnConfirmar.textContent = 'Manter (0 pts)';
            btnConfirmar.disabled = true;
        } else if (jaAprendida) {
            const diff = custo - jaAprendida.custoPago;
            btnConfirmar.textContent = diff > 0 ? `Melhorar (+${diff} pts)` : `Reduzir (${diff} pts)`;
            btnConfirmar.disabled = false;
        } else {
            btnConfirmar.textContent = `Aprender (${custo} pts)`;
        }
    }
    
    select.onchange = atualizarCusto;
    atualizarCusto();
    window.tecnicaModalData = { tecnica, jaAprendida };
    document.querySelector('.modal-tecnica-overlay').style.display = 'block';
}

function confirmarTecnica() {
    const { tecnica, jaAprendida } = window.tecnicaModalData || {};
    if (!tecnica) return;
    
    const select = document.getElementById('seletor-nh');
    const nh = parseInt(select.value);
    const niveis = parseInt(select.selectedOptions[0]?.dataset.niveis);
    const custo = parseInt(select.selectedOptions[0]?.dataset.custo);
    
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnica.id);
    if (index >= 0) {
        estadoTecnicas.tecnicasAprendidas[index] = { ...estadoTecnicas.tecnicasAprendidas[index], niveisAcimaBase: niveis, custoPago: custo };
    } else {
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
            preRequisitos: tecnica.preRequisitos,
            niveisAcimaBase: niveis,
            custoPago: custo
        });
    }
    
    fecharModalTecnica();
    salvarTecnicas();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    atualizarTecnicasDisponiveis();
}

// ===== AUXILIARES =====
function fecharModalTecnica() {
    document.querySelector('.modal-tecnica-overlay').style.display = 'none';
    window.tecnicaModalData = null;
}

function salvarTecnicas() {
    try { localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas)); } catch (e) {}
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
    } catch (e) {}
}

function configurarEventListenersTecnicas() {
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.onclick = () => {
            estadoTecnicas.filtroAtivo = btn.dataset.filtro;
            document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderizarCatalogoTecnicas();
        };
    });
    
    const busca = document.getElementById('busca-tecnicas');
    if (busca) busca.oninput = (e) => {
        estadoTecnicas.buscaAtiva = e.target.value;
        renderizarCatalogoTecnicas();
    };
    
    const overlay = document.querySelector('.modal-tecnica-overlay');
    if (overlay) overlay.onclick = (e) => { if (e.target === overlay) fecharModalTecnica(); };
    
    document.onkeydown = (e) => { if (e.key === 'Escape') fecharModalTecnica(); };
}

// ===== MONITORAMENTO =====
function configurarMonitoramento() {
    document.addEventListener('atributosAlterados', () => {
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        renderizarStatusTecnicas();
    });
    
    let ultimas = '';
    setInterval(() => {
        if (!window.estadoPericias?.periciasAprendidas) return;
        const atual = JSON.stringify(window.estadoPericias.periciasAprendidas);
        if (atual !== ultimas) {
            ultimas = atual;
            atualizarTecnicasDisponiveis();
            renderizarTecnicasAprendidas();
            renderizarStatusTecnicas();
        }
    }, 1000);
}

// ===== INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    if (window.sistemaTecnicasInicializado) return;
    window.sistemaTecnicasInicializado = true;
    
    carregarTecnicas();
    configurarEventListenersTecnicas();
    configurarMonitoramento();
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
}

// ===== INICIALIZAÇÃO AUTOMÁTICA SEGURA =====
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
        const aba = document.getElementById('pericias');
        if (aba && aba.classList.contains('active')) {
            // Espera perícias carregarem
            const check = setInterval(() => {
                if (window.estadoPericias && window.catalogoTecnicas) {
                    inicializarSistemaTecnicas();
                    clearInterval(check);
                }
            }, 500);
        }
    });
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true, attributeFilter: ['class'] });
    });
});

// ===== EXPORT =====
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

// ===== CSS PARA SCROLL NAS LISTAS DE CATÁLOGO =====
const cssScroll = `
  <style id="css-scroll-tecnicas">
    .catalog-list-pericias {
      max-height: 500px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .catalog-list-pericias::-webkit-scrollbar {
      width: 8px;
    }
    .catalog-list-pericias::-webkit-scrollbar-thumb {
      background: rgba(255, 140, 0, 0.5);
      border-radius: 4px;
    }
    .catalog-list-pericias::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 140, 0, 0.7);
    }
  </style>
`;
if (!document.getElementById('css-scroll-tecnicas')) {
    document.head.insertAdjacentHTML('beforeend', cssScroll);
}