// ===== SISTEMA DE TÉCNICAS - VERSÃO 100% FUNCIONAL E CORRIGIDA =====

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
  return niveisAcima;
}

// Função robusta para obter NH de qualquer perícia
function obterNHPericia(idPericia) {
  const pericias = window.estadoPericias?.periciasAprendidas;
  if (!pericias) return null;

  const pericia = pericias.find(p => p.id === idPericia);
  if (!pericia) return null;

  const dx = (typeof window.obterAtributoAtual === 'function') ? window.obterAtributoAtual('DX') : 10;

  // Caso 1: perícia já tem 'nh' calculado (ideal)
  if (typeof pericia.nh === 'number') {
    return pericia.nh;
  }

  // Caso 2: perícia tem 'nivel' (bônus relativo)
  if (typeof pericia.nivel === 'number') {
    return dx + pericia.nivel;
  }

  // Caso 3: perícia tem 'pontos' e precisamos inferir o nível
  if (typeof pericia.pontos === 'number') {
    let nivel = -10;
    const dificuldade = window.buscarPericiaPorId?.(idPericia)?.dificuldade || 'Média';

    if (dificuldade === 'Fácil') {
      if (pericia.pontos >= 1) nivel = pericia.pontos - 2;
    } else if (dificuldade === 'Média') {
      if (pericia.pontos === 1) nivel = -1;
      else if (pericia.pontos === 2) nivel = 0;
      else if (pericia.pontos >= 4) nivel = Math.floor((pericia.pontos - 2) / 2);
    } else if (dificuldade === 'Difícil') {
      if (pericia.pontos === 1) nivel = -2;
      else if (pericia.pontos === 2) nivel = -1;
      else if (pericia.pontos === 4) nivel = 0;
      else if (pericia.pontos >= 6) nivel = Math.floor((pericia.pontos - 4) / 2);
    }

    return dx + nivel;
  }

  // Caso 4: fallback absoluto (perícia existe, mas sem dados — assume 1 ponto em Média)
  return dx + (window.buscarPericiaPorId?.(idPericia)?.dificuldade === 'Média' ? -1 : 0);
}

function verificarPreRequisitosTecnica(tecnica) {
  if (!window.estadoPericias) {
    return { passou: false, motivo: '❌ Sistema de perícias não carregado' };
  }

  // Verifica Arco (NH mínimo)
  const reqArco = tecnica.preRequisitos?.find(r => r.idPericia === 'arco');
  if (reqArco) {
    const nhArco = obterNHPericia('arco');
    if (nhArco === null) {
      return { passou: false, motivo: '❌ Precisa da perícia Arco' };
    }
    if (nhArco < reqArco.nivelMinimo) {
      return {
        passou: false,
        motivo: `❌ Arco precisa ter NH ${reqArco.nivelMinimo} (atual: ${nhArco})`
      };
    }
  }

  // Verifica Cavalgar (qualquer uma)
  const reqCavalgar = tecnica.preRequisitos?.find(r => r.idsCavalgar);
  if (reqCavalgar) {
    const periciasIds = window.estadoPericias.periciasAprendidas.map(p => p.id);
    const temCavalgar = reqCavalgar.idsCavalgar.some(id => periciasIds.includes(id));
    if (!temCavalgar) {
      return { passou: false, motivo: '❌ Precisa de alguma perícia de Cavalgar' };
    }
  }

  return { passou: true, motivo: '' };
}

function calcularNHTecnica(tecnica, niveisComprados = 0) {
  const nhArco = obterNHPericia('arco');
  if (nhArco === null) return 0;
  return (nhArco - 4) + niveisComprados;
}

function atualizarTecnicasDisponiveis() {
  if (!window.catalogoTecnicas) return;

  const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
  estadoTecnicas.tecnicasDisponiveis = todasTecnicas.map(tecnica => {
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    const niveisComprados = jaAprendida ? (jaAprendida.niveisComprados || 0) : 0;
    const nhAtual = calcularNHTecnica(tecnica, niveisComprados);

    return {
      ...tecnica,
      disponivel: verificacao.passou,
      nhAtual: nhAtual,
      motivoIndisponivel: verificacao.motivo,
      jaAprendida: !!jaAprendida
    };
  });

  renderizarCatalogoTecnicas();
}

function renderizarCatalogoTecnicas() {
  const container = document.getElementById('lista-tecnicas');
  if (!container) return;

  const tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis.filter(tecnica => {
    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas' && tecnica.dificuldade !== 'Média') return false;
    if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas' && tecnica.dificuldade !== 'Difícil') return false;
    if (estadoTecnicas.buscaAtiva) {
      const busca = estadoTecnicas.buscaAtiva.toLowerCase();
      return tecnica.nome.toLowerCase().includes(busca) || tecnica.descricao.toLowerCase().includes(busca);
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
            <span class="pericia-custo">NH ${tecnica.nhAtual}</span>
          </div>
        </div>
        <p class="pericia-descricao">${tecnica.descricao}</p>
        ${!disponivel ? `<div class="tecnica-indisponivel-badge"><i class="fas fa-lock"></i> ${tecnica.motivoIndisponivel}</div>` : ''}
        ${disponivel ? `<div style="margin-top: 10px; font-size: 12px; color: #95a5a6;"><i class="fas fa-bullseye"></i> Clique para ${jaAprendida ? 'melhorar' : 'aprender'} esta técnica</div>` : ''}
      </div>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.pericia-item:not(.item-indisponivel)').forEach(item => {
    item.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
      if (tecnica && tecnica.disponivel) {
        abrirModalTecnica(tecnica);
      }
    });
  });
}

function abrirModalTecnica(tecnica) {
  estadoTecnicas.tecnicaSelecionada = tecnica;
  const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);

  const nhArco = obterNHPericia('arco');
  if (nhArco === null) {
    alert("Erro: Perícia 'Arco' não encontrada ou não adquirida.");
    return;
  }

  const nhBase = nhArco - 4;
  const nhMax = nhArco;
  const niveisComprados = jaAprendida ? (jaAprendida.niveisComprados || 0) : 0;
  const nhAtual = nhBase + niveisComprados;
  const custoTotal = jaAprendida ? (jaAprendida.custoTotal || 0) : 0;
  const nivelRelativoArco = nhArco - (window.obterAtributoAtual ? window.obterAtributoAtual('DX') : 10);

  let opcoesHTML = '';
  for (let i = 0; i <= 4; i++) {
    const custo = calcularCustoTecnica(i, tecnica.dificuldade);
    const nivelTecnica = (nivelRelativoArco - 4) + i;
    opcoesHTML += `
      <option value="${i}" data-custo="${custo}" ${i === niveisComprados ? 'selected' : ''}>
        NH ${nhBase + i} (nível ${nivelTecnica >= 0 ? '+' : ''}${nivelTecnica}) - ${custo} pontos
      </option>
    `;
  }

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
          <div style="font-size: 24px; font-weight: bold; color: #3498db;">NH ${nhBase}</div>
          <div style="font-size: 11px; color: #95a5a6;">nível ${nivelRelativoArco - 4 >= 0 ? '+' : ''}${nivelRelativoArco - 4}</div>
        </div>
        <div style="text-align: center; padding: 10px; background: rgba(39, 174, 96, 0.1); border-radius: 8px;">
          <div style="font-size: 12px; color: #95a5a6;">Máximo</div>
          <div style="font-size: 24px; font-weight: bold; color: #27ae60;">NH ${nhMax}</div>
          <div style="font-size: 11px; color: #95a5a6;">nível ${nivelRelativoArco >= 0 ? '+' : ''}${nivelRelativoArco}</div>
        </div>
        <div style="text-align: center; padding: 10px; background: rgba(243, 156, 18, 0.1); border-radius: 8px;">
          <div style="font-size: 12px; color: #95a5a6;">Atual</div>
          <div style="font-size: 24px; font-weight: bold; color: #f39c12;">NH ${nhAtual}</div>
          <div style="font-size: 11px; color: #95a5a6;">nível ${(nivelRelativoArco - 4 + niveisComprados) >= 0 ? '+' : ''}${nivelRelativoArco - 4 + niveisComprados}</div>
        </div>
      </div>
      
      <div style="background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #3498db;">
        <div style="font-size: 12px; color: #95a5a6;">Perícia Base (Arco)</div>
        <div style="font-size: 16px; font-weight: bold; color: #3498db;">NH ${nhArco} (nível ${nivelRelativoArco >= 0 ? '+' : ''}${nivelRelativoArco})</div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; color: #ffd700; font-weight: bold;">
          Níveis acima da base (Arco-4):
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
      
      <div style="background: rgba(155, 89, 182, 0.1); padding: 15px; border-radius: 5px;
            border-left: 4px solid #9b59b6;">
        <h5 style="color: #9b59b6; margin-top: 0; margin-bottom: 10px;">
          <i class="fas fa-info-circle"></i> Regras
        </h5>
        <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px;">
          <li><strong>NH base = NH(Arco) - 4</strong></li>
          <li>O NH da técnica NUNCA pode exceder o NH em Arco</li>
        </ul>
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

  const select = document.getElementById('select-niveis-tecnica');
  const custoDisplay = document.getElementById('custo-display');

  if (select) {
    select.addEventListener('change', function() {
      const niveis = parseInt(this.value);
      const custo = calcularCustoTecnica(niveis, tecnica.dificuldade);
      custoDisplay.textContent = `${custo} pontos`;
      
      const btn = document.getElementById('btn-comprar-tecnica');
      if (btn) {
        const mesmoNivel = jaAprendida && niveis === niveisComprados;
        btn.disabled = mesmoNivel;
        btn.textContent = mesmoNivel ? 'Manter' : (jaAprendida ? 'Atualizar' : 'Comprar');
        btn.style.background = mesmoNivel ? '#95a5a6' : 'linear-gradient(45deg, #ff8c00, #ffd700)';
      }
    });
  }
}

function comprarTecnica() {
  if (!estadoTecnicas.tecnicaSelecionada) {
    alert("Erro: Nenhuma técnica selecionada!");
    return;
  }

  const select = document.getElementById('select-niveis-tecnica');
  if (!select) {
    alert("Erro: Seletor de níveis não encontrado!");
    return;
  }

  const niveisComprados = parseInt(select.value);
  const custo = calcularCustoTecnica(niveisComprados, estadoTecnicas.tecnicaSelecionada.dificuldade);
  const tecnicaId = estadoTecnicas.tecnicaSelecionada.id;
  const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnicaId);

  const nhArco = obterNHPericia('arco');
  const nhFinal = (nhArco - 4) + niveisComprados;
  const dx = window.obterAtributoAtual ? window.obterAtributoAtual('DX') : 10;
  const nivelRelativoArco = nhArco - dx;
  const nivelFinalTecnica = (nivelRelativoArco - 4) + niveisComprados;

  const dadosTecnica = {
    id: tecnicaId,
    nome: estadoTecnicas.tecnicaSelecionada.nome,
    dificuldade: estadoTecnicas.tecnicaSelecionada.dificuldade,
    niveisComprados: niveisComprados,
    custoTotal: custo,
    nivelBase: nivelRelativoArco - 4,
    nivelFinal: nivelFinalTecnica,
    nhFinal: nhFinal,
    dataAquisicao: new Date().toISOString()
  };

  if (index >= 0) {
    estadoTecnicas.tecnicasAprendidas[index] = dadosTecnica;
  } else {
    estadoTecnicas.tecnicasAprendidas.push(dadosTecnica);
  }

  salvarTecnicas();
  atualizarTecnicasDisponiveis();
  renderizarTecnicasAprendidas();
  atualizarEstatisticasTecnicas();
  fecharModalTecnica();

  alert(`✅ ${dadosTecnica.nome} ${index >= 0 ? 'atualizada' : 'aprendida'} com sucesso!\n• NH: ${nhFinal}\n• Custo: ${custo} pontos`);
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
    const nhArco = obterNHPericia('arco') || 0;
    const nhAtual = (nhArco - 4) + (tecnica.niveisComprados || 0);
    const dx = window.obterAtributoAtual ? window.obterAtributoAtual('DX') : 10;
    const nivelRelativoArco = nhArco - dx;
    const nivelBase = nivelRelativoArco - 4;
    const nivelFinal = nivelBase + (tecnica.niveisComprados || 0);

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
          <div><strong>Nível:</strong> ${nivelFinal >= 0 ? '+' : ''}${nivelFinal}</div>
          <div><strong>Base (Arco-4):</strong> ${nivelBase >= 0 ? '+' : ''}${nivelBase}</div>
          <div><strong>NH Arco:</strong> ${nhArco}</div>
        </div>
        <button onclick="removerTecnica('${tecnica.id}')" class="btn-remover-pericia">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
}

function removerTecnica(id) {
  if (confirm('Tem certeza que deseja remover esta técnica? Os pontos serão perdidos.')) {
    estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
    salvarTecnicas();
    atualizarTecnicasDisponiveis();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
  }
}

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
  if (badge) {
    badge.textContent = `[${estadoTecnicas.pontosTecnicasTotal} pts]`;
  }
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

function fecharModalTecnica() {
  const modal = document.querySelector('.modal-tecnica-overlay');
  if (modal) {
    modal.style.display = 'none';
  }
  estadoTecnicas.modalAberto = false;
  estadoTecnicas.tecnicaSelecionada = null;
}

function configurarEventListenersTecnicas() {
  document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const filtro = this.getAttribute('data-filtro');
      estadoTecnicas.filtroAtivo = filtro;
      document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => b.classList.remove('active'));
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

function observarMudancasPericias() {
  let tentativas = 0;
  const maxTentativas = 20;
  const intervalo = setInterval(() => {
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
      atualizarTecnicasDisponiveis();
      clearInterval(intervalo);
    } else {
      tentativas++;
      if (tentativas > maxTentativas) {
        clearInterval(intervalo);
      }
    }
  }, 500);

  // Atualiza periodicamente enquanto estiver aberto
  setInterval(() => {
    if (window.estadoPericias) {
      atualizarTecnicasDisponiveis();
    }
  }, 2000);
}

function inicializarSistemaTecnicas() {
  carregarTecnicas();
  configurarEventListenersTecnicas();
  observarMudancasPericias();
  setTimeout(() => {
    atualizarTecnicasDisponiveis();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
  }, 500);
}

document.addEventListener('DOMContentLoaded', function() {
  const verificarAba = setInterval(() => {
    const abaPericias = document.getElementById('pericias');
    if (abaPericias && abaPericias.style.display !== 'none') {
      clearInterval(verificarAba);
      if (!window.sistemaTecnicasInicializado) {
        setTimeout(() => {
          inicializarSistemaTecnicas();
          window.sistemaTecnicasInicializado = true;
        }, 1000);
      }
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

window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;