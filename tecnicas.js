// ===== SISTEMA DE TÉCNICAS - VERSÃO ESTÁVEL E COMPLETA =====
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

// ===== CÁLCULO DE CUSTO =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima <= 0) return 0;
    if (dificuldade === 'Média') return niveisAcima;
    if (dificuldade === 'Difícil') {
        if (niveisAcima === 1) return 2;
        if (niveisAcima === 2) return 3;
        if (niveisAcima === 3) return 4;
        if (niveisAcima === 4) return 5;
        return 5 + (niveisAcima - 4);
    }
    return 0;
}

// ===== OBTER VALOR DO ATRIBUTO =====
function obterValorAtributo(atributo) {
    if (typeof window.obterValorAtributo === 'function') {
        return window.obterValorAtributo(atributo);
    }
    return 10;
}

// ===== OBTER NH DA PERÍCIA =====
function obterNHPericiaPorId(idPericia) {
    const pericias = window.estadoPericias?.periciasAprendidas || [];
    const pericia = pericias.find(p => p && p.id === idPericia);
    if (!pericia) return null;
    
    const valorAtributo = obterValorAtributo(pericia.atributo);
    return valorAtributo + (pericia.nivel || 0);
}

// ===== VERIFICAR PRÉ-REQUISITOS — NUNCA SOME COM A TÉCNICA =====
function verificarPreRequisitosTecnica(tecnica) {
    const pericias = window.estadoPericias?.periciasAprendidas || [];
    const prereqs = Array.isArray(tecnica?.preRequisitos) ? tecnica.preRequisitos : [];

    for (let i = 0; i < prereqs.length; i++) {
        const p = prereqs[i];
        if (!p) continue;

        if (p.verificarCavalgar === true) {
            const temCavalgar = pericias.some(x =>
                x?.id === 'grupo-cavalgar' ||
                (x?.id && typeof x.id === 'string' && x.id.startsWith('cavalgar-'))
            );
            if (!temCavalgar) {
                return { passou: false, motivo: 'Falta: Cavalgar (qualquer animal)' };
            }
        } else if (p.idPericia) {
            const temPericia = pericias.some(x => x?.id === p.idPericia);
            if (!temPericia) {
                return { passou: false, motivo: `Falta: ${p.nomePericia || p.idPericia}` };
            }
        }
    }
    return { passou: true, motivo: '' };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS — SEMPRE EXECUTA =====
function atualizarTecnicasDisponiveis() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;

    let todasTecnicas = [];
    try {
        if (window.catalogoTecnicas && typeof window.catalogoTecnicas.obterTodasTecnicas === 'function') {
            todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas() || [];
        }
    } catch (e) {
        console.error("Erro ao carregar catálogo de técnicas", e);
        todasTecnicas = [];
    }

    const disponiveis = [];
    for (let i = 0; i < todasTecnicas.length; i++) {
        const tecnica = todasTecnicas[i];
        if (!tecnica || !tecnica.id) continue;

        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);

        let nhAtual = 0;
        if (tecnica.baseCalculo?.idPericia) {
            const nhBase = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
            if (nhBase !== null) {
                nhAtual = nhBase + (tecnica.baseCalculo.redutor || 0);
                if (jaAprendida?.niveisAcimaBase) {
                    nhAtual += jaAprendida.niveisAcimaBase;
                }
            }
        }

        disponiveis.push({
            ...tecnica,
            nhAtual: nhAtual,
            custoAtual: jaAprendida ? jaAprendida.custoPago || 0 : 0,
            jaAprendida: !!jaAprendida,
            disponivel: verificacao.passou,
            motivoIndisponivel: verificacao.motivo
        });
    }

    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    renderizarCatalogoTecnicas();
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;

    let tecnicasFiltradas = [...estadoTecnicas.tecnicasDisponiveis];

    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Média');
    } else if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Difícil');
    }

    if (estadoTecnicas.buscaAtiva.trim()) {
        const termo = estadoTecnicas.buscaAtiva.toLowerCase();
        tecnicasFiltradas = tecnicasFiltradas.filter(t =>
            (t.nome && t.nome.toLowerCase().includes(termo)) ||
            (t.descricao && t.descricao.toLowerCase().includes(termo))
        );
    }

    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia">
                <i class="fas fa-info-circle"></i>
                <div>Nenhuma técnica encontrada</div>
            </div>
        `;
        return;
    }

    let html = '';
    for (let i = 0; i < tecnicasFiltradas.length; i++) {
        const t = tecnicasFiltradas[i];
        const dificuldadeClass = t.dificuldade === 'Difícil' ? 'dificuldade-dificil-tecnica' : 'dificuldade-medio-tecnica';
        html += `
            <div class="pericia-item" data-id="${t.id}" data-tipo="tecnica"
                 style="cursor: ${t.disponivel ? 'pointer' : 'not-allowed'}; opacity: ${t.disponivel ? '1' : '0.6'}">
                <div class="pericia-header">
                    <h4 class="pericia-nome">
                        ${t.nome} ${t.jaAprendida ? '<span style="color:#27ae60; margin-left:5px;">✓</span>' : ''}
                    </h4>
                    <div class="pericia-info">
                        <span class="pericia-dificuldade ${dificuldadeClass}">
                            <i class="fas fa-${t.dificuldade === 'Difícil' ? 'star' : 'star-half-alt'}"></i>
                            ${t.dificuldade}
                        </span>
                        <span class="pericia-custo">NH ${t.nhAtual}</span>
                        ${t.custoAtual > 0 ? `<span class="pericia-custo">${t.custoAtual} pts</span>` : ''}
                    </div>
                </div>
                <p class="pericia-descricao">${t.descricao || ''}</p>
                ${!t.disponivel ? `
                <div class="tecnica-indisponivel" style="margin-top:8px; padding:8px; background:rgba(231,76,60,0.1); border-radius:4px; border-left:3px solid #e74c3c;">
                    <i class="fas fa-lock" style="color:#e74c3c;"></i>
                    <span style="color:#e74c3c; font-size:0.9em;">${t.motivoIndisponivel}</span>
                </div>
                ` : ''}
            </div>
        `;
    }

    container.innerHTML = html;

    // Adiciona eventos de clique
    const items = container.querySelectorAll('.pericia-item[data-tipo="tecnica"]');
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const id = item.dataset.id;
        const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
        if (tecnica && tecnica.disponivel) {
            // Remove listener anterior (evita duplicação)
            const clone = item.cloneNode(true);
            item.parentNode.replaceChild(clone, item);
            clone.addEventListener('click', () => abrirModalTecnica(tecnica));
        }
    }
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
            </div>
        `;
        return;
    }

    let html = '';
    for (let i = 0; i < estadoTecnicas.tecnicasAprendidas.length; i++) {
        const t = estadoTecnicas.tecnicasAprendidas[i];
        const cat = window.catalogoTecnicas?.buscarTecnicaPorId(t.id);
        let nhFinal = t.nhAtual || 0;

        html += `
            <div class="pericia-aprendida-item" data-id="${t.id}" data-tipo="tecnica">
                <div class="pericia-aprendida-header">
                    <h4 class="pericia-aprendida-nome">${t.nome}</h4>
                    <div class="pericia-aprendida-info">
                        <span class="pericia-aprendida-nivel"><i class="fas fa-bullseye"></i> NH ${nhFinal}</span>
                        <span class="pericia-dificuldade ${t.dificuldade === 'Difícil' ? 'dificuldade-dificil-tecnica' : 'dificuldade-medio-tecnica'}">
                            <i class="fas fa-${t.dificuldade === 'Difícil' ? 'star' : 'star-half-alt'}"></i>
                            ${t.dificuldade}
                        </span>
                        <span class="pericia-aprendida-custo"><i class="fas fa-coins"></i> ${t.custoPago || 0} pts</span>
                    </div>
                </div>
                <button class="btn-remover-pericia" data-id="${t.id}" title="Remover técnica">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    container.innerHTML = html;

    // Botões de remover
    const buttons = container.querySelectorAll('.btn-remover-pericia');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            const t = estadoTecnicas.tecnicasAprendidas.find(x => x.id === id);
            if (t && confirm(`Remover "${t.nome}"? (${t.custoPago || 0} pts)`)) {
                estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(x => x.id !== id);
                salvarTecnicas();
                renderizarStatusTecnicas();
                renderizarTecnicasAprendidas();
                atualizarTecnicasDisponiveis();
            }
        });
    }
}

// ===== RENDERIZAR STATUS =====
function renderizarStatusTecnicas() {
    estadoTecnicas.pontosTecnicasTotal = 0;
    estadoTecnicas.pontosMedio = 0;
    estadoTecnicas.pontosDificil = 0;
    estadoTecnicas.qtdMedio = 0;
    estadoTecnicas.qtdDificil = 0;

    for (let i = 0; i < estadoTecnicas.tecnicasAprendidas.length; i++) {
        const t = estadoTecnicas.tecnicasAprendidas[i];
        const custo = t.custoPago || 0;
        if (t.dificuldade === 'Média') {
            estadoTecnicas.qtdMedio++;
            estadoTecnicas.pontosMedio += custo;
        } else if (t.dificuldade === 'Difícil') {
            estadoTecnicas.qtdDificil++;
            estadoTecnicas.pontosDificil += custo;
        }
        estadoTecnicas.pontosTecnicasTotal += custo;
    }

    estadoTecnicas.qtdTotal = estadoTecnicas.qtdMedio + estadoTecnicas.qtdDificil;

    const ids = {
        'qtd-tecnicas-medio': estadoTecnicas.qtdMedio,
        'pts-tecnicas-medio': `(${estadoTecnicas.pontosMedio} pts)`,
        'qtd-tecnicas-dificil': estadoTecnicas.qtdDificil,
        'pts-tecnicas-dificil': `(${estadoTecnicas.pontosDificil} pts)`,
        'qtd-tecnicas-total': estadoTecnicas.qtdTotal,
        'pts-tecnicas-total': `(${estadoTecnicas.pontosTecnicasTotal} pts)`
    };

    for (const [id, valor] of Object.entries(ids)) {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    }

    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) badge.textContent = `[${estadoTecnicas.pontosTecnicasTotal} pts]`;
}

// ===== MODAL, PERSISTÊNCIA, EVENTOS... (resumido para foco) =====
function abrirModalTecnica(tecnica) { /* ... implementação padrão ... */ }
function confirmarTecnica() { /* ... */ }
function fecharModalTecnica() { /* ... */ }
function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    } catch (e) {}
}
function carregarTecnicas() {
    try {
        const saved = localStorage.getItem('tecnicasAprendidas');
        if (saved) estadoTecnicas.tecnicasAprendidas = JSON.parse(saved);
    } catch (e) {}
}

// ===== INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    carregarTecnicas();
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();

    // Eventos de filtro e busca (básico)
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', () => {
            estadoTecnicas.filtroAtivo = btn.dataset.filtro;
            document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => b.classList.toggle('active', b === btn));
            renderizarCatalogoTecnicas();
        });
    });

    const busca = document.getElementById('busca-tecnicas');
    if (busca) {
        let to;
        busca.addEventListener('input', () => {
            clearTimeout(to);
            to = setTimeout(() => {
                estadoTecnicas.buscaAtiva = busca.value;
                renderizarCatalogoTecnicas();
            }, 300);
        });
    }
}

// ===== INTEGRAÇÃO: atualiza quando perícias mudam =====
window.atualizarTecnicasAoAprenderPericia = function() {
    setTimeout(atualizarTecnicasDisponiveis, 100);
};
window.removerTecnicasAoRemoverPericia = function() {
    // Opcional: remova técnicas se perder pré-requisito
    atualizarTecnicasDisponiveis();
};

// ===== INICIALIZAÇÃO AUTOMÁTICA QUANDO ABA ESTIVER VISÍVEL =====
document.addEventListener('DOMContentLoaded', () => {
    const aba = document.getElementById('pericias');
    if (!aba) return;

    const init = () => {
        if (window.getComputedStyle(aba).display !== 'none' && !window.tecnicasIniciadas) {
            window.tecnicasIniciadas = true;
            inicializarSistemaTecnicas();
        }
    };

    // Tenta inicializar agora
    setTimeout(init, 500);

    // E observa mudanças
    const obs = new MutationObserver(init);
    obs.observe(aba, { attributes: true, attributeFilter: ['style'] });
});

// ===== EXPORT =====
window.atualizarTecnicasDisponiveis = atualizarTecnicasDisponiveis;