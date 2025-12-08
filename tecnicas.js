// ===== SISTEMA DE TÉCNICAS - VERSÃO PROFISSIONAL =====

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

// ===== TABELA DE CUSTO - VERIFICADA =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
  if (niveisAcima <= 0) return 0;
  
  if (dificuldade === 'Difícil') {
    return Math.min(niveisAcima + 1, 11); // 2,3,4,5,6,7,8,9,10,11
  }
  
  if (dificuldade === 'Média') {
    return niveisAcima; // 1,2,3,4,5...
  }
  
  return 0;
}

// ===== FUNÇÃO PRINCIPAL: OBTER NH CORRETO DA PERÍCIA =====
function obterNHPericiaParaTecnica(idPericia) {
  // 1. Verificar se o sistema de perícias está disponível
  if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
    console.warn('Sistema de perícias não disponível');
    return 0;
  }
  
  // 2. Buscar a perícia específica
  let periciaEncontrada = null;
  
  if (idPericia === 'arco') {
    periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => p.id === 'arco');
  } 
  else if (idPericia.includes('cavalgar')) {
    periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p =>
      p.id.includes('cavalgar') || p.nome.includes('Cavalgar')
    );
  }
  
  // 3. Se não encontrou, retorna 0
  if (!periciaEncontrada) {
    return 0;
  }
  
  // 4. OBTER ATRIBUTO CORRETO
  let atributoValor = 10; // Fallback padrão
  
  if (window.obterAtributoAtual && typeof window.obterAtributoAtual === 'function') {
    // Para Arco e Cavalgar, ambos usam DX
    if (idPericia === 'arco' || idPericia.includes('cavalgar')) {
      atributoValor = window.obterAtributoAtual('DX');
    }
  }
  
  // 5. OBTER NÍVEL DA PERÍCIA (pode ser negativo!)
  const nivelPericia = periciaEncontrada.nivel || 0;
  
  // 6. CALCULAR NH: Atributo + Nível
  const nhCalculado = atributoValor + nivelPericia;
  
  return nhCalculado;
}

// ===== CALCULAR NH DA TÉCNICA (CARD E MODAL) =====
function calcularNHTecnica(tecnica, niveisComprados = 0) {
  // 1. Verificar se a técnica tem base de cálculo
  if (!tecnica.baseCalculo || !tecnica.baseCalculo.idPericia) {
    return 0;
  }
  
  // 2. Obter NH da perícia base
  const nhPericiaBase = obterNHPericiaParaTecnica(tecnica.baseCalculo.idPericia);
  
  // 3. Aplicar redutor (Arco-4 = redutor -4)
  const redutor = tecnica.baseCalculo.redutor || 0;
  const nhBaseTecnica = nhPericiaBase + redutor;
  
  // 4. Adicionar níveis comprados (se tiver)
  const nhFinal = nhBaseTecnica + niveisComprados;
  
  return nhFinal;
}

// ===== VERIFICAR PRÉ-REQUISITOS =====
function verificarPreRequisitosTecnica(tecnica) {
  if (!tecnica.preRequisitos || !window.estadoPericias) {
    return { passou: true, motivo: '' };
  }
  
  // Verificar Arco
  const reqArco = tecnica.preRequisitos.find(req => req.idPericia === 'arco');
  if (reqArco) {
    const nhArco = obterNHPericiaParaTecnica('arco');
    if (nhArco < reqArco.nivelMinimo) {
      return {
        passou: false,
        motivo: `❌ Arco precisa ter NH ${reqArco.nivelMinimo} (atual: ${nhArco})`
      };
    }
  }
  
  // Verificar Cavalgar
  const reqCavalgar = tecnica.preRequisitos.find(req => req.idsCavalgar);
  if (reqCavalgar) {
    const temCavalgar = window.estadoPericias.periciasAprendidas.some(p =>
      reqCavalgar.idsCavalgar.some(id => p.id.includes(id))
    );
    
    if (!temCavalgar) {
      return {
        passou: false,
        motivo: '❌ Precisa de alguma perícia de Cavalgar'
      };
    }
  }
  
  return { passou: true, motivo: '' };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS (VERSÃO ROBUSTA) =====
function atualizarTecnicasDisponiveis() {
  try {
    if (!window.catalogoTecnicas) {
      console.error('Catálogo de técnicas não disponível');
      return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    
    const disponiveis = todasTecnicas.map(tecnica => {
      try {
        // 1. Verificar pré-requisitos
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        
        // 2. Verificar se já aprendeu
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        const niveisComprados = jaAprendida ? (jaAprendida.niveisComprados || 0) : 0;
        
        // 3. CALCULAR NH PARA O CARD (isso é o importante!)
        const nhCard = calcularNHTecnica(tecnica, niveisComprados);
        
        return {
          ...tecnica,
          disponivel: verificacao.passou,
          nhAtual: nhCard,
          motivoIndisponivel: verificacao.motivo,
          jaAprendida: !!jaAprendida,
          _niveisComprados: niveisComprados // Para debug
        };
      } catch (error) {
        console.error(`Erro ao processar técnica ${tecnica.nome}:`, error);
        return {
          ...tecnica,
          disponivel: false,
          nhAtual: 0,
          motivoIndisponivel: 'Erro no processamento',
          jaAprendida: false
        };
      }
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    renderizarCatalogoTecnicas();
    
  } catch (error) {
    console.error('Erro crítico em atualizarTecnicasDisponiveis:', error);
  }
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
  const container = document.getElementById('lista-tecnicas');
  if (!container) {
    console.error('Container lista-tecnicas não encontrado');
    return;
  }
  
  try {
    const tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis.filter(tecnica => {
      // Filtro por dificuldade
      if (estadoTecnicas.filtroAtivo === 'medio-tecnicas' && tecnica.dificuldade !== 'Média') return false;
      if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas' && tecnica.dificuldade !== 'Difícil') return false;
      
      // Busca
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
          <small>${estadoTecnicas.buscaAtiva ? 'Tente outro termo de busca' : 'Verifique os pré-requisitos'}</small>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    tecnicasFiltradas.forEach(tecnica => {
      const jaAprendida = tecnica.jaAprendida;
      const disponivel = tecnica.disponivel;
      
      // Destacar o NH calculado
      const nhDisplay = tecnica.nhAtual || 0;
      const nhColor = nhDisplay <= 0 ? '#e74c3c' : (nhDisplay < 10 ? '#f39c12' : '#2ecc71');
      
      html += `
        <div class="pericia-item ${!disponivel ? 'item-indisponivel' : ''}"
           data-id="${tecnica.id}"
           data-nh="${nhDisplay}"
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
              <span class="pericia-custo" style="color: ${nhColor}; font-weight: bold;">
                NH ${nhDisplay}
              </span>
            </div>
          </div>
          
          <p class="pericia-descricao">${tecnica.descricao}</p>
          
          ${!disponivel ? `
            <div class="tecnica-indisponivel-badge">
              <i class="fas fa-lock"></i> ${tecnica.motivoIndisponivel}
            </div>
          ` : ''}
          
          ${disponivel && tecnica.baseCalculo ? `
            <div style="margin-top: 8px; font-size: 11px; color: #7f8c8d; background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 3px;">
              <i class="fas fa-calculator"></i> 
              Base: ${tecnica.baseCalculo.idPericia}${tecnica.baseCalculo.redutor || 0}
              ${jaAprendida ? ` + ${tecnica._niveisComprados || 0} níveis` : ''}
            </div>
          ` : ''}
        </div>
      `;
    });
    
    container.innerHTML = html;
    
    // Adicionar eventos de clique
    container.querySelectorAll('.pericia-item:not(.item-indisponivel)').forEach(item => {
      item.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
        if (tecnica && tecnica.disponivel) {
          abrirModalTecnica(tecnica);
        }
      });
    });
    
  } catch (error) {
    console.error('Erro ao renderizar catálogo:', error);
    container.innerHTML = `
      <div class="nenhuma-pericia" style="color: #e74c3c;">
        <i class="fas fa-exclamation-triangle"></i>
        <div>Erro ao carregar técnicas</div>
        <small>Verifique o console para detalhes</small>
      </div>
    `;
  }
}

// ===== ABRIR MODAL DE COMPRA (VERSÃO COMPLETA) =====
function abrirModalTecnica(tecnica) {
  try {
    estadoTecnicas.tecnicaSelecionada = tecnica;
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    // CÁLCULOS PRINCIPAIS
    const nhArco = obterNHPericiaParaTecnica('arco');
    const nhBaseTecnica = nhArco - 4; // Arco-4
    const nhMaximo = nhArco; // Não pode exceder o NH em Arco
    
    // Informações atuais
    let niveisComprados = 0;
    let custoTotal = 0;
    let nhAtual = nhBaseTecnica;
    
    if (jaAprendida) {
      niveisComprados = jaAprendida.niveisComprados || 0;
      custoTotal = jaAprendida.custoTotal || 0;
      nhAtual = nhBaseTecnica + niveisComprados;
    }
    
    // Verificar NH máximo permitido
    if (nhAtual > nhMaximo) {
      nhAtual = nhMaximo;
      if (jaAprendida) {
        niveisComprados = nhMaximo - nhBaseTecnica;
      }
    }
    
    // Criar opções
    let opcoesHTML = '';
    const niveisPossiveis = Math.max(0, nhMaximo - nhBaseTecnica);
    
    for (let i = 0; i <= niveisPossiveis; i++) {
      const nhOpcao = nhBaseTecnica + i;
      const custo = calcularCustoTecnica(i, tecnica.dificuldade);
      const selected = i === niveisComprados ? 'selected' : '';
      const disabled = nhOpcao > nhMaximo ? 'disabled' : '';
      
      opcoesHTML += `
        <option value="${i}" ${selected} ${disabled} data-custo="${custo}">
          NH ${nhOpcao} - ${custo} ponto${custo !== 1 ? 's' : ''}
          ${i === 0 ? ' (base)' : ''}
          ${disabled ? ' (máximo)' : ''}
        </option>
      `;
    }
    
    // Montar modal
    const modalHTML = `
      <div class="modal-tecnica-content">
        <div class="modal-tecnica-header">
          <button class="modal-close" onclick="fecharModalTecnica()">&times;</button>
          <h3>${tecnica.nome}</h3>
          <div class="modal-subtitle">
            <span class="dificuldade-badge ${tecnica.dificuldade === 'Difícil' ? 'dificil' : 'medio'}">
              ${tecnica.dificuldade}
            </span>
            <span class="tipo-badge">Técnica Especial</span>
          </div>
        </div>
        
        <div class="modal-tecnica-body">
          <!-- Resumo de cálculos -->
          <div class="calculo-resumo">
            <div class="calc-item">
              <div class="calc-label">NH em Arco</div>
              <div class="calc-value">${nhArco}</div>
            </div>
            <div class="calc-item">
              <div class="calc-label">Redutor (Arco-4)</div>
              <div class="calc-value">-4</div>
            </div>
            <div class="calc-item">
              <div class="calc-label">NH base</div>
              <div class="calc-value">${nhBaseTecnica}</div>
            </div>
          </div>
          
          <!-- Estatísticas -->
          <div class="estatisticas-grid">
            <div class="estatistica-card">
              <div class="estatistica-label">Base</div>
              <div class="estatistica-valor">${nhBaseTecnica}</div>
              <div class="estatistica-desc">Arco-4</div>
            </div>
            <div class="estatistica-card">
              <div class="estatistica-label">Máximo</div>
              <div class="estatistica-valor">${nhMaximo}</div>
              <div class="estatistica-desc">NH Arco</div>
            </div>
            <div class="estatistica-card">
              <div class="estatistica-label">Atual</div>
              <div class="estatistica-valor">${nhAtual}</div>
              <div class="estatistica-desc">${niveisComprados > 0 ? `+${niveisComprados} níveis` : 'base'}</div>
            </div>
          </div>
          
          <!-- Seleção de nível -->
          <div class="selecao-nivel">
            <label>Níveis acima da base (Arco-4):</label>
            <select id="select-niveis-tecnica" class="nivel-select">
              ${opcoesHTML}
            </select>
            <div class="select-info">
              Cada nível custa aproximadamente 1 ponto (média)
            </div>
          </div>
          
          <!-- Custo -->
          <div class="custo-container">
            <div class="custo-label">Custo Total</div>
            <div id="custo-display" class="custo-valor">${custoTotal} pontos</div>
          </div>
          
          <!-- Descrição -->
          <div class="descricao-container">
            <h4>Descrição</h4>
            <p>${tecnica.descricao}</p>
          </div>
          
          <!-- Regras -->
          <div class="regras-container">
            <h4><i class="fas fa-info-circle"></i> Regras</h4>
            <ul>
              <li>NH base = NH em Arco - 4 (pré-definido)</li>
              <li>O NH nesta técnica não pode exceder seu NH em Arco</li>
              <li>Você pode comprar níveis adicionais acima da base</li>
              <li>Penalidades para disparar montado não reduzem abaixo do NH nesta técnica</li>
            </ul>
          </div>
        </div>
        
        <div class="modal-tecnica-footer">
          <button class="btn btn-cancelar" onclick="fecharModalTecnica()">Cancelar</button>
          <button class="btn btn-confirmar" id="btn-comprar-tecnica" onclick="comprarTecnica()">
            ${jaAprendida ? 'Atualizar' : 'Comprar'}
          </button>
        </div>
      </div>
    `;
    
    // Aplicar CSS inline para garantir funcionamento
    const styles = `
      <style>
      .modal-tecnica-content {
        background: #1e1e28;
        color: #fff;
        border-radius: 10px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .modal-tecnica-header {
        background: #2c3e50;
        padding: 20px;
        position: relative;
        border-bottom: 2px solid #ff8c00;
      }
      .modal-tecnica-header h3 {
        margin: 0 0 5px 0;
        color: #ffd700;
      }
      .modal-subtitle {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .dificuldade-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
      }
      .dificuldade-badge.dificil {
        background: #c0392b;
        color: white;
      }
      .dificuldade-badge.medio {
        background: #e67e22;
        color: white;
      }
      .tipo-badge {
        background: #3498db;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
      }
      .modal-close {
        position: absolute;
        right: 20px;
        top: 20px;
        background: none;
        border: none;
        color: #ffd700;
        font-size: 28px;
        cursor: pointer;
        line-height: 1;
      }
      .modal-tecnica-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }
      .calculo-resumo {
        display: flex;
        justify-content: space-between;
        background: rgba(52, 152, 219, 0.1);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        border-left: 4px solid #3498db;
      }
      .calc-item {
        text-align: center;
      }
      .calc-label {
        font-size: 12px;
        color: #95a5a6;
        margin-bottom: 5px;
      }
      .calc-value {
        font-size: 24px;
        font-weight: bold;
        color: #3498db;
      }
      .estatisticas-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        margin-bottom: 25px;
      }
      .estatistica-card {
        background: rgba(50, 50, 65, 0.9);
        border-radius: 8px;
        padding: 15px;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .estatistica-label {
        font-size: 12px;
        color: #95a5a6;
        margin-bottom: 8px;
      }
      .estatistica-valor {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      .estatistica-card:nth-child(1) .estatistica-valor { color: #3498db; }
      .estatistica-card:nth-child(2) .estatistica-valor { color: #27ae60; }
      .estatistica-card:nth-child(3) .estatistica-valor { color: #f39c12; }
      .estatistica-desc {
        font-size: 11px;
        color: #7f8c8d;
      }
      .selecao-nivel {
        margin-bottom: 25px;
      }
      .selecao-nivel label {
        display: block;
        margin-bottom: 10px;
        color: #ffd700;
        font-weight: bold;
      }
      .nivel-select {
        width: 100%;
        padding: 12px;
        border-radius: 6px;
        border: 2px solid #ff8c00;
        background: #2c3e50;
        color: #ffd700;
        font-size: 16px;
        cursor: pointer;
      }
      .select-info {
        font-size: 12px;
        color: #95a5a6;
        margin-top: 8px;
      }
      .custo-container {
        background: rgba(39, 174, 96, 0.1);
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 25px;
        border-left: 4px solid #27ae60;
      }
      .custo-label {
        font-size: 14px;
        color: #95a5a6;
        margin-bottom: 5px;
      }
      .custo-valor {
        font-size: 36px;
        font-weight: bold;
        color: #27ae60;
      }
      .descricao-container {
        margin-bottom: 20px;
      }
      .descricao-container h4 {
        color: #ffd700;
        margin-bottom: 10px;
      }
      .descricao-container p {
        line-height: 1.5;
        color: #ccc;
      }
      .regras-container {
        background: rgba(155, 89, 182, 0.1);
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #9b59b6;
      }
      .regras-container h4 {
        color: #9b59b6;
        margin-top: 0;
        margin-bottom: 15px;
      }
      .regras-container ul {
        margin: 0;
        padding-left: 20px;
        color: #ccc;
      }
      .regras-container li {
        margin-bottom: 8px;
        line-height: 1.4;
      }
      .modal-tecnica-footer {
        background: #2c3e50;
        padding: 20px;
        display: flex;
        justify-content: flex-end;
        gap: 15px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
      .btn {
        padding: 12px 24px;
        border-radius: 6px;
        border: none;
        font-weight: bold;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.3s;
      }
      .btn-cancelar {
        background: #7f8c8d;
        color: white;
      }
      .btn-confirmar {
        background: linear-gradient(45deg, #ff8c00, #ffd700);
        color: #1e1e28;
      }
      .btn-confirmar:disabled {
        background: #95a5a6;
        color: #7f8c8d;
        cursor: not-allowed;
      }
      </style>
    `;
    
    const modal = document.querySelector('.modal-tecnica');
    if (!modal) {
      console.error('Modal não encontrado');
      return;
    }
    
    modal.innerHTML = styles + modalHTML;
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
        const mesmoNivel = jaAprendida && niveisSelecionados === niveisComprados;
        btnComprar.disabled = mesmoNivel;
        btnComprar.textContent = mesmoNivel ? 'Manter' : (jaAprendida ? 'Atualizar' : 'Comprar');
      }
    }
    
    if (select) {
      select.addEventListener('change', atualizarCusto);
      atualizarCusto();
    }
    
  } catch (error) {
    console.error('Erro ao abrir modal de técnica:', error);
    alert('Erro ao carregar detalhes da técnica');
  }
}

// ===== FUNÇÕES RESTANTES (mantidas simples mas funcionais) =====

function comprarTecnica() {
  try {
    if (!estadoTecnicas.tecnicaSelecionada) {
      alert("Erro: Técnica não selecionada");
      return;
    }
    
    const select = document.getElementById('select-niveis-tecnica');
    if (!select) {
      alert("Erro: Seletor não encontrado");
      return;
    }
    
    const niveisComprados = parseInt(select.value);
    const custo = calcularCustoTecnica(niveisComprados, estadoTecnicas.tecnicaSelecionada.dificuldade);
    const tecnica = estadoTecnicas.tecnicaSelecionada;
    
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnica.id);
    
    if (index >= 0) {
      estadoTecnicas.tecnicasAprendidas[index] = {
        ...estadoTecnicas.tecnicasAprendidas[index],
        niveisComprados: niveisComprados,
        custoTotal: custo,
        ultimaAtualizacao: new Date().toISOString()
      };
    } else {
      estadoTecnicas.tecnicasAprendidas.push({
        id: tecnica.id,
        nome: tecnica.nome,
        dificuldade: tecnica.dificuldade,
        niveisComprados: niveisComprados,
        custoTotal: custo,
        dataAquisicao: new Date().toISOString(),
        baseCalculo: tecnica.baseCalculo
      });
    }
    
    salvarTecnicas();
    atualizarTecnicasDisponiveis();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
    fecharModalTecnica();
    
    alert(`✅ ${tecnica.nome} ${index >= 0 ? 'atualizada' : 'aprendida'}! (${custo} pontos)`);
    
  } catch (error) {
    console.error('Erro ao comprar técnica:', error);
    alert('Erro ao processar compra da técnica');
  }
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
    const nhArco = obterNHPericiaParaTecnica('arco');
    const nhBase = nhArco - 4;
    const nhAtual = nhBase + (tecnica.niveisComprados || 0);
    
    html += `
      <div class="pericia-aprendida-item">
        <div class="pericia-aprendida-header">
          <h4 class="pericia-aprendida-nome">
            ${tecnica.nome}
            <span class="tecnica-detalhes">(Arco-4 + ${tecnica.niveisComprados || 0})</span>
          </h4>
          <div class="pericia-aprendida-info">
            <span class="pericia-aprendida-nivel">NH ${nhAtual}</span>
            <span class="pericia-aprendida-custo">${tecnica.custoTotal || 0} pts</span>
          </div>
        </div>
        <div class="tecnica-info-extra">
          <span>Base: ${nhBase} | Arco: ${nhArco} | Níveis: ${tecnica.niveisComprados || 0}</span>
        </div>
        <button class="btn-remover-pericia" onclick="removerTecnica('${tecnica.id}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function removerTecnica(id) {
  if (confirm('Remover esta técnica? Os pontos gastos serão perdidos.')) {
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
  if (badge) badge.textContent = `[${estadoTecnicas.pontosTecnicasTotal} pts]`;
}

function fecharModalTecnica() {
  const modal = document.querySelector('.modal-tecnica-overlay');
  if (modal) modal.style.display = 'none';
  estadoTecnicas.modalAberto = false;
  estadoTecnicas.tecnicaSelecionada = null;
}

function salvarTecnicas() {
  try {
    localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
  } catch (e) {
    console.error('Erro ao salvar técnicas:', e);
  }
}

function carregarTecnicas() {
  try {
    const salvo = localStorage.getItem('tecnicasAprendidas');
    if (salvo) estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
  } catch (e) {
    console.error('Erro ao carregar técnicas:', e);
  }
}

function configurarEventListenersTecnicas() {
  document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const filtro = this.dataset.filtro;
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
    if (e.key === 'Escape' && estadoTecnicas.modalAberto) fecharModalTecnica();
  });
}

function observarMudancasPericias() {
  if (window.estadoPericias) {
    setInterval(() => {
      atualizarTecnicasDisponiveis();
    }, 1000);
  }
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

// ===== INICIALIZAÇÃO =====
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
          } else {
            atualizarTecnicasDisponiveis();
          }
        }
      }
    });
  });
  
  const abaPericias = document.getElementById('pericias');
  if (abaPericias) observer.observe(abaPericias, { attributes: true });
});

// ===== EXPORTAR =====
window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;