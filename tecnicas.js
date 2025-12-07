let estadoTecnicas = {
  tecnicasAprendidas: [],
  filtroAtivo: 'todas-tecnicas',
  buscaAtiva: ''
};

// === APOIO ===
function getNH(id) {
  const p = window.estadoPericias?.periciasAprendidas?.find(x => x.id === id);
  if (!p) return null;
  const attr = p.atributo;
  let base = 10;
  if (window.obterDadosAtributos) {
    const d = window.obterDadosAtributos();
    base = d[attr] || 10;
  }
  return base + (p.nivel || 0);
}

function verificarPreReqs(t) {
  for (const r of t.preRequisitos) {
    if (r.idPericia) {
      const nh = getNH(r.idPericia);
      if (nh === null || nh < r.nivelMinimo) return false;
    }
    if (r.idsCavalgar) {
      const found = r.idsCavalgar.some(id => getNH(id) !== null);
      if (!found) return false;
    }
  }
  return true;
}

// === RENDER ===
function renderizarTecnicas() {
  const todas = window.catalogoTecnicas.obterTodasTecnicas();
  const filtradas = todas.filter(t => {
    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas' && t.dificuldade !== 'Média') return false;
    if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas' && t.dificuldade !== 'Difícil') return false;
    if (estadoTecnicas.buscaAtiva) {
      const term = estadoTecnicas.buscaAtiva.toLowerCase();
      if (!t.nome.toLowerCase().includes(term)) return false;
    }
    return true;
  });

  const container = document.getElementById('lista-tecnicas');
  if (!container) return;

  if (filtradas.length === 0) {
    container.innerHTML = '<div class="nenhuma">Nenhuma técnica disponível</div>';
    return;
  }

  let html = '';
  for (const t of filtradas) {
    const disponivel = verificarPreReqs(t);
    const ja = estadoTecnicas.tecnicasAprendidas.some(x => x.id === t.id);
    const nhBase = getNH(t.baseCalculo?.idPericia) || 0;
    const nh = nhBase + (t.baseCalculo?.redutor || 0);

    html += `
      <div class="pericia-item" style="cursor:${disponivel ? 'pointer' : 'not-allowed'}" data-id="${t.id}">
        <div class="pericia-header">
          <h4 class="pericia-nome">${t.nome} ${ja ? '✓' : ''}</h4>
          <div class="pericia-info">
            <span class="pericia-dificuldade">${t.dificuldade}</span>
            ${disponivel ? `<span class="pericia-custo">NH ${nh}</span>` : ''}
          </div>
        </div>
        <p class="pericia-descricao">${t.descricao}</p>
        ${!disponivel ? `<div style="color:#e74c3c;margin-top:6px;">🔒 Pré-requisitos não atendidos</div>` : ''}
      </div>
    `;
  }
  container.innerHTML = html;

  container.querySelectorAll('.pericia-item').forEach(el => {
    if (el.style.cursor === 'pointer') {
      el.onclick = () => comprarTecnica(window.catalogoTecnicas.buscarTecnicaPorId(el.dataset.id));
    }
  });
}

function renderizarAprendidas() {
  const container = document.getElementById('tecnicas-aprendidas');
  if (!container) return;
  if (estadoTecnicas.tecnicasAprendidas.length === 0) {
    container.innerHTML = '<div class="nenhuma">Nenhuma técnica aprendida</div>';
    return;
  }
  let html = '';
  for (const t of estadoTecnicas.tecnicasAprendidas) {
    const cat = window.catalogoTecnicas.buscarTecnicaPorId(t.id);
    const nhBase = getNH(cat.baseCalculo.idPericia) || 0;
    const nh = nhBase + (cat.baseCalculo.redutor || 0) + (t.niveisAcima || 0);
    html += `
      <div class="pericia-item">
        <div class="pericia-header">
          <h4 class="pericia-nome">${t.nome}</h4>
          <div class="pericia-info">
            <span class="pericia-dificuldade">${t.dificuldade}</span>
            <span class="pericia-custo">${t.custo} pts</span>
          </div>
        </div>
        <p>NH ${nh}</p>
      </div>
    `;
  }
  container.innerHTML = html;
}

// === COMPRA ===
function comprarTecnica(tecnica) {
  const modal = document.getElementById('modal-tecnica');
  const overlay = document.getElementById('modal-tecnica-overlay');
  const baseNh = getNH(tecnica.baseCalculo.idPericia) || 10;
  const base = baseNh + (tecnica.baseCalculo.redutor || 0);
  const max = getNH(tecnica.limiteMaximo.idPericia) || base + 5;
  let html = `
    <span class="modal-close" onclick="fecharModalTecnica()">×</span>
    <h3>${tecnica.nome}</h3>
    <p>${tecnica.descricao}</p>
    <label>Escolha o NH (base: ${base}, máx: ${max})</label>
    <select id="sel-nh">
  `;
  for (let nh = base; nh <= max; nh++) {
    const niveis = nh - base;
    const custo = niveis <= 0 ? 0 : niveis <= 4 ? niveis + 1 : 5 + (niveis - 4);
    html += `<option value="${nh}" data-custo="${custo}" data-niveis="${niveis}">NH ${nh} (${custo} pts)</option>`;
  }
  html += `
    </select>
    <button class="btn-modal btn-cancelar" onclick="fecharModalTecnica()">Cancelar</button>
    <button class="btn-modal btn-confirmar" onclick="confirmarCompraTecnica('${tecnica.id}')">Comprar</button>
  `;
  modal.innerHTML = html;
  overlay.style.display = 'block';
}

function confirmarCompraTecnica(id) {
  const sel = document.getElementById('sel-nh');
  const opt = sel.selectedOptions[0];
  const custo = parseInt(opt.dataset.custo);
  const niveis = parseInt(opt.dataset.niveis);
  const tecnica = window.catalogoTecnicas.buscarTecnicaPorId(id);
  estadoTecnicas.tecnicasAprendidas.push({
    id: id,
    nome: tecnica.nome,
    dificuldade: tecnica.dificuldade,
    custo: custo,
    niveisAcima: niveis
  });
  salvarTecnicas();
  fecharModalTecnica();
  renderizarAprendidas();
  renderizarTecnicas();
}

function fecharModalTecnica() {
  document.getElementById('modal-tecnica-overlay').style.display = 'none';
}

// === SALVAR ===
function salvarTecnicas() {
  localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
}
function carregarTecnicas() {
  const salvo = localStorage.getItem('tecnicasAprendidas');
  if (salvo) estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
}

// === INICIAR ===
function inicializarTecnicas() {
  carregarTecnicas();
  renderizarAprendidas();
  renderizarTecnicas();

  // Eventos de filtro/busca
  document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      estadoTecnicas.filtroAtivo = btn.dataset.filtro;
      renderizarTecnicas();
    };
  });
  document.getElementById('busca-tecnicas')?.addEventListener('input', e => {
    estadoTecnicas.buscaAtiva = e.target.value;
    renderizarTecnicas();
  });

  // Atualizar quando perícias mudarem
  let ult = '';
  setInterval(() => {
    const atual = JSON.stringify(window.estadoPericias?.periciasAprendidas || []);
    if (atual !== ult) {
      ult = atual;
      renderizarTecnicas();
    }
  }, 1000);
}

// === INICIALIZAÇÃO SEGURA ===
document.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver(() => {
    const aba = document.getElementById('pericias');
    if (aba && aba.classList.contains('active')) {
      const check = setInterval(() => {
        if (window.estadoPericias && window.catalogoTecnicas) {
          inicializarTecnicas();
          clearInterval(check);
        }
      }, 500);
    }
  });
  document.querySelectorAll('.tab-content').forEach(tab => {
    observer.observe(tab, { attributes: true, attributeFilter: ['class'] });
  });
});

// Export
window.fecharModalTecnica = fecharModalTecnica;