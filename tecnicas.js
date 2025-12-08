let estadoTecnicas = { pontosTecnicasTotal: 0, pontosMedio: 0, pontosDificil: 0, qtdMedio: 0, qtdDificil: 0, qtdTotal: 0, tecnicasAprendidas: [], filtroAtivo: 'todas-tecnicas', buscaAtiva: '', tecnicasDisponiveis: [], modalAberto: false, tecnicaSelecionada: null };

function calcularCustoTecnica(niveis, dificuldade) {
  if (niveis <= 0) return 0;
  return dificuldade === 'Difícil' ? (niveis <= 10 ? niveis + 1 : niveis + 1) : niveis;
}

function obterDificuldadePericia(id) {
  return window.buscarPericiaPorId?.(id)?.dificuldade || 'Média';
}

function calcularNivelPericia(pontos, dificuldade) {
  if (dificuldade === 'Média') return pontos === 1 ? -1 : pontos === 2 ? 0 : pontos >= 4 ? Math.floor((pontos - 2) / 2) : -10;
  if (dificuldade === 'Fácil') return pontos >= 1 ? -1 + (pontos - 1) : -10;
  return pontos === 1 ? -2 : pontos === 2 ? -1 : pontos === 4 ? 0 : pontos >= 6 ? Math.floor((pontos - 4) / 2) : -10;
}

function obterNHPericia(id) {
  const pericias = window.estadoPericias?.periciasAprendidas;
  if (!pericias) return null;
  const pericia = pericias.find(p => p.id === id);
  if (!pericia) return null;
  const dx = window.obterAtributoAtual?.('DX') || 10;
  if (typeof pericia.nivel === 'number') return dx + pericia.nivel;
  if (typeof pericia.pontos === 'number') {
    const dif = obterDificuldadePericia(id);
    return dx + calcularNivelPericia(pericia.pontos, dif);
  }
  return dx + (obterDificuldadePericia(id) === 'Média' ? -1 : 0);
}

function obterNivelRelativoPericia(id) {
  const nh = obterNHPericia(id);
  return nh === null ? 0 : nh - (window.obterAtributoAtual?.('DX') || 10);
}

function calcularNHTecnica(tecnica, niveisComprados = 0) {
  if (!tecnica.baseCalculo?.idPericia) return 0;
  const nhBase = obterNHPericia(tecnica.baseCalculo.idPericia);
  return nhBase === null ? 0 : nhBase + (tecnica.baseCalculo.redutor || 0) + niveisComprados;
}

function verificarPreRequisitosTecnica(tecnica) {
  if (!tecnica.preRequisitos || !window.estadoPericias) return { passou: true, motivo: '' };
  const reqArco = tecnica.preRequisitos.find(r => r.idPericia === 'arco');
  if (reqArco) {
    const nhArco = obterNHPericia('arco');
    if (nhArco === null) return { passou: false, motivo: '❌ Precisa da perícia Arco' };
    if (nhArco < reqArco.nivelMinimo) return { passou: false, motivo: `❌ Arco precisa ter NH ${reqArco.nivelMinimo} (atual: ${nhArco})` };
  }
  const reqCavalgar = tecnica.preRequisitos.find(r => r.idsCavalgar);
  if (reqCavalgar) {
    const tem = window.estadoPericias.periciasAprendidas.some(p => reqCavalgar.idsCavalgar.includes(p.id));
    if (!tem) return { passou: false, motivo: '❌ Precisa de alguma perícia de Cavalgar' };
  }
  return { passou: true, motivo: '' };
}

function atualizarTecnicasDisponiveis() {
  if (!window.catalogoTecnicas) return;
  const todas = window.catalogoTecnicas.obterTodasTecnicas();
  estadoTecnicas.tecnicasDisponiveis = todas.map(t => {
    const verif = verificarPreRequisitosTecnica(t);
    const ja = estadoTecnicas.tecnicasAprendidas.find(x => x.id === t.id);
    const niveis = ja ? (ja.niveisComprados || 0) : 0;
    return { ...t, disponivel: verif.passou, nhAtual: calcularNHTecnica(t, niveis), motivoIndisponivel: verif.motivo, jaAprendida: !!ja };
  });
  renderizarCatalogoTecnicas();
}

function renderizarCatalogoTecnicas() {
  const container = document.getElementById('lista-tecnicas');
  if (!container) return;
  const filtradas = estadoTecnicas.tecnicasDisponiveis.filter(t => {
    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas' && t.dificuldade !== 'Média') return false;
    if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas' && t.dificuldade !== 'Difícil') return false;
    if (estadoTecnicas.buscaAtiva) {
      const busca = estadoTecnicas.buscaAtiva.toLowerCase();
      return t.nome.toLowerCase().includes(busca) || t.descricao.toLowerCase().includes(busca);
    }
    return true;
  });
  if (filtradas.length === 0) {
    container.innerHTML = `<div class="nenhuma-pericia"><i class="fas fa-info-circle"></i><div>Nenhuma técnica disponível</div><small>Verifique pré-requisitos</small></div>`;
    return;
  }
  container.innerHTML = filtradas.map(t => `
    <div class="pericia-item ${!t.disponivel ? 'item-indisponivel' : ''}" data-id="${t.id}" style="cursor:${t.disponivel?'pointer':'not-allowed'};opacity:${t.disponivel?1:0.6};background:${t.jaAprendida?'rgba(39,174,96,0.15)':'rgba(50,50,65,0.9)'};border:1px solid ${t.jaAprendida?'rgba(39,174,96,0.4)':'rgba(255,140,0,0.3)'};">
      <div class="pericia-header"><h4 class="pericia-nome">${t.nome}${t.jaAprendida?'<span style="color:#27ae60;margin-left:5px;">✓</span>':''}</h4><div class="pericia-info"><span class="pericia-dificuldade ${t.dificuldade==='Difícil'?'dificuldade-dificil':'dificuldade-medio'}">${t.dificuldade}</span><span class="pericia-custo">NH ${t.nhAtual}</span></div></div>
      <p class="pericia-descricao">${t.descricao}</p>
      ${!t.disponivel ? `<div class="tecnica-indisponivel-badge"><i class="fas fa-lock"></i> ${t.motivoIndisponivel}</div>` : ''}
      ${t.disponivel ? `<div style="margin-top:10px;font-size:12px;color:#95a5a6;"><i class="fas fa-bullseye"></i> Clique para ${t.jaAprendida?'melhorar':'aprender'}</div>` : ''}
    </div>
  `).join('');
  container.querySelectorAll('.pericia-item:not(.item-indisponivel)').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
      if (tecnica && tecnica.disponivel) abrirModalTecnica(tecnica);
    });
  });
}

function abrirModalTecnica(tecnica) {
  estadoTecnicas.tecnicaSelecionada = tecnica;
  const ja = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
  const nhArco = obterNHPericia('arco');
  if (nhArco === null) { alert("Erro: Perícia Arco não encontrada!"); return; }
  const nhBase = nhArco - 4, nhMax = nhArco, niveis = ja ? (ja.niveisComprados || 0) : 0, nhAtual = nhBase + niveis, custoTotal = ja ? (ja.custoTotal || 0) : 0;
  const nivelRel = obterNivelRelativoPericia('arco');
  let opcoes = '';
  for (let i = 0; i <= 4; i++) {
    const custo = calcularCustoTecnica(i, tecnica.dificuldade);
    opcoes += `<option value="${i}" ${i === niveis ? 'selected' : ''}>NH ${nhBase + i} (nível ${(nivelRel - 4 + i) >= 0 ? '+' : ''}${nivelRel - 4 + i}) - ${custo} pts</option>`;
  }
  const modal = document.querySelector('.modal-tecnica');
  if (!modal) return;
  modal.innerHTML = `
    <div style="background:#2c3e50;color:white;padding:20px;border-radius:8px 8px 0 0;position:relative;">
      <span onclick="fecharModalTecnica()" style="position:absolute;right:20px;top:20px;font-size:24px;cursor:pointer;color:#ffd700;">×</span>
      <h3 style="margin:0;color:#ffd700;">${tecnica.nome}</h3>
      <div style="color:#95a5a6;margin-top:5px;">${tecnica.dificuldade} • Técnica Especial</div>
    </div>
    <div style="padding:20px;background:#1e1e28;color:#ccc;max-height:60vh;overflow-y:auto;">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:20px;">
        <div style="text-align:center;padding:10px;background:rgba(52,152,219,0.1);border-radius:8px;"><div style="font-size:12px;color:#95a5a6;">Base (Arco-4)</div><div style="font-size:24px;font-weight:bold;color:#3498db;">NH ${nhBase}</div><div style="font-size:11px;color:#95a5a6;">nível ${(nivelRel - 4) >= 0 ? '+' : ''}${nivelRel - 4}</div></div>
        <div style="text-align:center;padding:10px;background:rgba(39,174,96,0.1);border-radius:8px;"><div style="font-size:12px;color:#95a5a6;">Máximo</div><div style="font-size:24px;font-weight:bold;color:#27ae60;">NH ${nhMax}</div><div style="font-size:11px;color:#95a5a6;">nível ${nivelRel >= 0 ? '+' : ''}${nivelRel}</div></div>
        <div style="text-align:center;padding:10px;background:rgba(243,156,18,0.1);border-radius:8px;"><div style="font-size:12px;color:#95a5a6;">Atual</div><div style="font-size:24px;font-weight:bold;color:#f39c12;">NH ${nhAtual}</div><div style="font-size:11px;color:#95a5a6;">nível ${(nivelRel - 4 + niveis) >= 0 ? '+' : ''}${nivelRel - 4 + niveis}</div></div>
      </div>
      <div style="background:rgba(52,152,219,0.1);padding:15px;border-radius:5px;margin-bottom:20px;border-left:4px solid #3498db;"><div style="font-size:12px;color:#95a5a6;">Perícia Base (Arco)</div><div style="font-size:16px;font-weight:bold;color:#3498db;">NH ${nhArco} (nível ${nivelRel >= 0 ? '+' : ''}${nivelRel})</div></div>
      <div style="margin-bottom:20px;"><label style="display:block;margin-bottom:8px;color:#ffd700;font-weight:bold;">Níveis acima da base (Arco-4):</label><select id="select-niveis-tecnica" style="width:100%;padding:12px;border-radius:5px;border:2px solid #ff8c00;background:#2c3e50;color:#ffd700;font-size:16px;">${opcoes}</select></div>
      <div style="background:rgba(39,174,96,0.1);padding:15px;border-radius:5px;border-left:4px solid #27ae60;margin-bottom:20px;"><div style="font-size:12px;color:#95a5a6;">Custo Total</div><div id="custo-display" style="font-size:28px;font-weight:bold;color:#27ae60;">${custoTotal} pontos</div></div>
      <div style="margin-bottom:15px;"><h4 style="color:#ffd700;margin-bottom:10px;">Descrição</h4><p style="line-height:1.5;">${tecnica.descricao}</p></div>
      <div style="background:rgba(155,89,182,0.1);padding:15px;border-radius:5px;border-left:4px solid #9b59b6;"><h5 style="color:#9b59b6;margin:0 0 10px;"><i class="fas fa-info-circle"></i> Regras</h5><ul style="margin:0;padding-left:20px;color:#ccc;font-size:14px;"><li><strong>NH base = NH(Arco) – 4</strong></li><li>Nunca ultrapassa NH de Arco</li></ul></div>
    </div>
    <div style="padding:20px;background:#2c3e50;border-radius:0 0 8px 8px;display:flex;gap:10px;justify-content:flex-end;">
      <button onclick="fecharModalTecnica()" style="padding:12px 24px;background:#7f8c8d;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:600;">Cancelar</button>
      <button onclick="comprarTecnica()" id="btn-comprar-tecnica" style="padding:12px 24px;background:linear-gradient(45deg,#ff8c00,#ffd700);color:#1e1e28;border:none;border-radius:5px;font-weight:bold;cursor:pointer;">${ja ? 'Atualizar' : 'Comprar'}</button>
    </div>
  `;
  document.querySelector('.modal-tecnica-overlay').style.display = 'flex';
  estadoTecnicas.modalAberto = true;
  document.getElementById('select-niveis-tecnica')?.addEventListener('change', function() {
    const n = parseInt(this.value), c = calcularCustoTecnica(n, tecnica.dificuldade);
    document.getElementById('custo-display').textContent = `${c} pontos`;
    const btn = document.getElementById('btn-comprar-tecnica');
    if (btn) {
      const same = ja && n === niveis;
      btn.disabled = same;
      btn.textContent = same ? 'Manter' : (ja ? 'Atualizar' : 'Comprar');
      btn.style.background = same ? '#95a5a6' : 'linear-gradient(45deg,#ff8c00,#ffd700)';
    }
  });
}

function comprarTecnica() {
  if (!estadoTecnicas.tecnicaSelecionada) return alert("Nenhuma técnica selecionada!");
  const select = document.getElementById('select-niveis-tecnica');
  if (!select) return alert("Seletor não encontrado!");
  const niveis = parseInt(select.value), custo = calcularCustoTecnica(niveis, estadoTecnicas.tecnicaSelecionada.dificuldade);
  const id = estadoTecnicas.tecnicaSelecionada.id, idx = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === id);
  const nhArco = obterNHPericia('arco'), nhFinal = (nhArco - 4) + niveis, nivelRel = obterNivelRelativoPericia('arco');
  const dados = {
    id, nome: estadoTecnicas.tecnicaSelecionada.nome, dificuldade: estadoTecnicas.tecnicaSelecionada.dificuldade,
    niveisComprados: niveis, custoTotal: custo, nivelBase: nivelRel - 4, nivelFinal: nivelRel - 4 + niveis, nhFinal, dataAquisicao: new Date().toISOString()
  };
  if (idx >= 0) estadoTecnicas.tecnicasAprendidas[idx] = dados;
  else estadoTecnicas.tecnicasAprendidas.push(dados);
  salvarTecnicas(); atualizarTecnicasDisponiveis(); renderizarTecnicasAprendidas(); atualizarEstatisticasTecnicas(); fecharModalTecnica();
  alert(`✅ ${dados.nome} ${idx >= 0 ? 'atualizada' : 'aprendida'}!\n• NH: ${nhFinal}\n• Custo: ${custo} pts`);
}

function renderizarTecnicasAprendidas() {
  const container = document.getElementById('tecnicas-aprendidas');
  if (!container) return;
  if (estadoTecnicas.tecnicasAprendidas.length === 0) {
    container.innerHTML = `<div class="nenhuma-pericia-aprendida"><i class="fas fa-tools"></i><div>Nenhuma técnica aprendida</div><small>As técnicas que você aprender aparecerão aqui</small></div>`;
    return;
  }
  container.innerHTML = estadoTecnicas.tecnicasAprendidas.map(t => {
    const nhArco = obterNHPericia('arco') || 0, nhAtual = (nhArco - 4) + (t.niveisComprados || 0), nivelRel = obterNivelRelativoPericia('arco');
    return `
      <div class="pericia-aprendida-item" style="background:rgba(155,89,182,0.15);border-color:rgba(155,89,182,0.4);">
        <div class="pericia-aprendida-header">
          <h4 class="pericia-aprendida-nome">${t.nome} <span style="color:#e67e22;font-size:0.9em;font-style:italic;">(Arco-4 + ${t.niveisComprados || 0})</span></h4>
          <div class="pericia-aprendida-info"><span class="pericia-aprendida-nivel">NH ${nhAtual}</span><span class="pericia-aprendida-custo">${t.custoTotal || 0} pts</span></div>
        </div>
        <div style="font-size:13px;color:#95a5a6;margin-top:5px;">
          <div><strong>Nível:</strong> ${t.nivelFinal >= 0 ? '+' : ''}${t.nivelFinal}</div>
          <div><strong>Base (Arco-4):</strong> ${t.nivelBase >= 0 ? '+' : ''}${t.nivelBase}</div>
          <div><strong>NH Arco:</strong> ${nhArco}</div>
        </div>
        <button onclick="removerTecnica('${t.id}')" class="btn-remover-pericia"><i class="fas fa-times"></i></button>
      </div>
    `;
  }).join('');
}

function removerTecnica(id) {
  if (confirm('Remover técnica? Os pontos serão perdidos.')) {
    estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
    salvarTecnicas(); atualizarTecnicasDisponiveis(); renderizarTecnicasAprendidas(); atualizarEstatisticasTecnicas();
  }
}

function atualizarEstatisticasTecnicas() {
  estadoTecnicas.pontosTecnicasTotal = 0; estadoTecnicas.pontosMedio = 0; estadoTecnicas.pontosDificil = 0;
  estadoTecnicas.qtdMedio = 0; estadoTecnicas.qtdDificil = 0;
  estadoTecnicas.tecnicasAprendidas.forEach(t => {
    const c = t.custoTotal || 0;
    estadoTecnicas.pontosTecnicasTotal += c;
    if (t.dificuldade === 'Média') { estadoTecnicas.qtdMedio++; estadoTecnicas.pontosMedio += c; }
    else if (t.dificuldade === 'Difícil') { estadoTecnicas.qtdDificil++; estadoTecnicas.pontosDificil += c; }
  });
  estadoTecnicas.qtdTotal = estadoTecnicas.qtdMedio + estadoTecnicas.qtdDificil;
  const map = { 'qtd-tecnicas-medio': estadoTecnicas.qtdMedio, 'pts-tecnicas-medio': `(${estadoTecnicas.pontosMedio} pts)`, 'qtd-tecnicas-dificil': estadoTecnicas.qtdDificil, 'pts-tecnicas-dificil': `(${estadoTecnicas.pontosDificil} pts)`, 'qtd-tecnicas-total': estadoTecnicas.qtdTotal, 'pts-tecnicas-total': `(${estadoTecnicas.pontosTecnicasTotal} pts)` };
  for (const [id, val] of Object.entries(map)) { const el = document.getElementById(id); if (el) el.textContent = val; }
  const badge = document.getElementById('pontos-tecnicas-total'); if (badge) badge.textContent = `[${estadoTecnicas.pontosTecnicasTotal} pts]`;
}

function salvarTecnicas() { try { localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas)); } catch (e) { console.error("Erro ao salvar técnicas:", e); } }
function carregarTecnicas() { try { const s = localStorage.getItem('tecnicasAprendidas'); if (s) estadoTecnicas.tecnicasAprendidas = JSON.parse(s); } catch (e) { console.error("Erro ao carregar técnicas:", e); } }
function fecharModalTecnica() { const m = document.querySelector('.modal-tecnica-overlay'); if (m) m.style.display = 'none'; estadoTecnicas.modalAberto = false; estadoTecnicas.tecnicaSelecionada = null; }

function configurarEventListenersTecnicas() {
  document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => b.addEventListener('click', function() {
    estadoTecnicas.filtroAtivo = this.dataset.filtro;
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(x => x.classList.remove('active'));
    this.classList.add('active'); renderizarCatalogoTecnicas();
  }));
  const busca = document.getElementById('busca-tecnicas'); if (busca) busca.addEventListener('input', () => { estadoTecnicas.buscaAtiva = busca.value; renderizarCatalogoTecnicas(); });
  document.addEventListener('click', e => { if (estadoTecnicas.modalAberto && e.target.classList.contains('modal-tecnica-overlay')) fecharModalTecnica(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && estadoTecnicas.modalAberto) fecharModalTecnica(); });
}

function observarMudancasPericias() { if (window.estadoPericias) setInterval(atualizarTecnicasDisponiveis, 1000); }

function inicializarSistemaTecnicas() {
  carregarTecnicas(); configurarEventListenersTecnicas(); observarMudancasPericias();
  setTimeout(() => { atualizarTecnicasDisponiveis(); renderizarTecnicasAprendidas(); atualizarEstatisticasTecnicas(); }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
  const check = setInterval(() => {
    const aba = document.getElementById('pericias');
    if (aba && aba.style.display !== 'none') {
      clearInterval(check);
      if (!window.sistemaTecnicasInicializado) {
        setTimeout(() => { inicializarSistemaTecnicas(); window.sistemaTecnicasInicializado = true; }, 1000);
      }
    }
  }, 500);
  const observer = new MutationObserver(() => {
    const aba = document.getElementById('pericias');
    if (aba && aba.style.display !== 'none') {
      if (!window.sistemaTecnicasInicializado) {
        setTimeout(() => { inicializarSistemaTecnicas(); window.sistemaTecnicasInicializado = true; }, 500);
      } else {
        atualizarTecnicasDisponiveis();
      }
    }
  });
  const aba = document.getElementById('pericias');
  if (aba) observer.observe(aba, { attributes: true, attributeFilter: ['style'] });
});

window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;