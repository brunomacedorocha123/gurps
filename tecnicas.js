// ===== SISTEMA DE TÉCNICAS - VERSÃO ROBUSTA =====
console.log(" INICIANDO SISTEMA DE TÉCNICAS - COM FALLBACKS");

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

// ===== FUNÇÃO ROBUSTA: OBTER DX ATUAL =====
function obterDXAtual() {
 // Tentar método do sistema de atributos
 if (window.obterAtributoAtual && typeof window.obterAtributoAtual === 'function') {
  try {
   return window.obterAtributoAtual('DX') || 10;
  } catch (e) {
   console.warn("Erro ao obter DX do sistema:", e);
  }
 }
 
 // Fallback 1: Elemento HTML
 const dxElement = document.getElementById('DX');
 if (dxElement && dxElement.value) {
  return parseInt(dxElement.value) || 10;
 }
 
 // Fallback 2: Input genérico
 const inputDX = document.querySelector('input[name="DX"], input[data-atributo="DX"]');
 if (inputDX && inputDX.value) {
  return parseInt(inputDX.value) || 10;
 }
 
 // Fallback final
 console.warn("DX não encontrado, usando 10 como padrão");
 return 10;
}

// ===== FUNÇÃO ROBUSTA: VERIFICAR SE PERÍCIAS ESTÃO CARREGADAS =====
function sistemaPericiasDisponivel() {
 return window.estadoPericias && 
        window.estadoPericias.periciasAprendidas &&
        Array.isArray(window.estadoPericias.periciasAprendidas);
}

// ===== FUNÇÃO ROBUSTA: OBTER NÍVEL DA PERÍCIA =====
function obterNivelPericiaPorId(idPericia) {
 // Se sistema de perícias não está disponível
 if (!sistemaPericiasDisponivel()) {
  console.log(`⚠️ Sistema de perícias não disponível para ${idPericia}, usando 0`);
  return 0;
 }
 
 try {
  let periciaEncontrada = null;
  
  if (idPericia === 'arco') {
   periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => 
    p.id === 'arco' || p.nome === 'Arco'
   );
  } else if (idPericia.includes('cavalgar')) {
   periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p =>
    p.id && p.id.includes('cavalgar') || 
    p.nome && p.nome.includes('Cavalgar')
   );
  }
  
  if (!periciaEncontrada) {
   console.log(`ℹ️ Perícia ${idPericia} não encontrada, usando nível 0`);
   return 0;
  }
  
  // O nível pode estar em diferentes propriedades
  const nivel = periciaEncontrada.nivel || periciaEncontrada.nivelPericia || 0;
  console.log(`✅ Nível de ${idPericia}: ${nivel}`);
  return nivel;
  
 } catch (error) {
  console.error(`❌ Erro ao buscar nível de ${idPericia}:`, error);
  return 0;
 }
}

// ===== FUNÇÃO ROBUSTA: OBTER NH DA PERÍCIA =====
function obterNHPericiaPorId(idPericia) {
 const dxAtual = obterDXAtual();
 const nivelPericia = obterNivelPericiaPorId(idPericia);
 const nh = dxAtual + nivelPericia;
 
 console.log(`📊 NH ${idPericia}: ${dxAtual} + ${nivelPericia} = ${nh}`);
 return nh;
}

// ===== VERIFICAR PRÉ-REQUISITOS COM FALLBACK =====
function verificarPreRequisitosTecnica(tecnica) {
 if (!tecnica.preRequisitos) {
  return { passou: true, motivo: '' };
 }
 
 // Se não tem sistema de perícias, não podemos verificar
 if (!sistemaPericiasDisponivel()) {
  console.warn("⚠️ Sistema de perícias não carregado, pulando verificação de pré-requisitos");
  return { passou: true, motivo: 'Sistema de perícias não carregado - verificação temporariamente desativada' };
 }

 // Verificar Arco
 const reqArco = tecnica.preRequisitos.find(req => req.idPericia === 'arco');
 if (reqArco) {
  const nivelArco = obterNivelPericiaPorId('arco');
  if (nivelArco < reqArco.nivelMinimo) {
   return {
    passou: false,
    motivo: `❌ Precisa de Arco nível ${reqArco.nivelMinimo} (atual: ${nivelArco})`
   };
  }
 }

 // Verificar Cavalgar
 const reqCavalgar = tecnica.preRequisitos.find(req => req.idsCavalgar);
 if (reqCavalgar) {
  const temCavalgar = window.estadoPericias.periciasAprendidas.some(p =>
   (p.id && reqCavalgar.idsCavalgar.includes(p.id)) ||
   (p.nome && p.nome.includes('Cavalgar'))
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

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS COM FALLBACK =====
function atualizarTecnicasDisponiveis() {
 console.log(" Atualizando técnicas...");

 if (!window.catalogoTecnicas) {
  console.error("❌ Catálogo de técnicas não encontrado!");
  
  // Mostrar mensagem amigável
  const container = document.getElementById('lista-tecnicas');
  if (container) {
   container.innerHTML = `
    <div class="nenhuma-pericia">
     <i class="fas fa-exclamation-triangle" style="color: #f39c12;"></i>
     <div>Catálogo de técnicas não carregado</div>
     <small>Recarregue a página ou verifique o console</small>
    </div>
   `;
  }
  return;
 }

 try {
  const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
  
  const disponiveis = todasTecnicas.map(tecnica => {
   const verificacao = verificarPreRequisitosTecnica(tecnica);
   const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
   
   // Cálculo do NH (com fallback)
   let nhAtual = 0;
   
   if (tecnica.baseCalculo && tecnica.baseCalculo.idPericia) {
    const nhPericia = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
    const nhBase = nhPericia + (tecnica.baseCalculo.redutor || 0);
    nhAtual = nhBase;
    
    if (jaAprendida && jaAprendida.niveisComprados) {
     nhAtual = nhBase + jaAprendida.niveisComprados;
    }
   }
   
   return {
    ...tecnica,
    disponivel: verificacao.passou,
    nhAtual: nhAtual,
    motivoIndisponivel: verificacao.motivo,
    jaAprendida: !!jaAprendida
   };
  });

  estadoTecnicas.tecnicasDisponiveis = disponiveis;
  renderizarCatalogoTecnicas();
  
 } catch (error) {
  console.error("❌ Erro ao atualizar técnicas:", error);
  
  const container = document.getElementById('lista-tecnicas');
  if (container) {
   container.innerHTML = `
    <div class="nenhuma-pericia">
     <i class="fas fa-bug" style="color: #e74c3c;"></i>
     <div>Erro ao carregar técnicas</div>
     <small>${error.message}</small>
    </div>
   `;
  }
 }
}

// ===== RENDERIZAR CATÁLOGO COM FALLBACK =====
function renderizarCatalogoTecnicas() {
 const container = document.getElementById('lista-tecnicas');
 if (!container) {
  console.error("❌ Container não encontrado!");
  return;
 }

 // Se não tem técnicas disponíveis
 if (!estadoTecnicas.tecnicasDisponiveis || estadoTecnicas.tecnicasDisponiveis.length === 0) {
  container.innerHTML = `
   <div class="nenhuma-pericia">
    <i class="fas fa-info-circle"></i>
    <div>Carregando técnicas...</div>
    <small>Aguarde um momento</small>
   </div>
  `;
  return;
 }

 const tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis.filter(tecnica => {
  if (estadoTecnicas.filtroAtivo === 'medio-tecnicas' && tecnica.dificuldade !== 'Média') return false;
  if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas' && tecnica.dificuldade !== 'Difícil') return false;
  
  if (estadoTecnicas.buscaAtiva) {
   const busca = estadoTecnicas.buscaAtiva.toLowerCase();
   return (tecnica.nome && tecnica.nome.toLowerCase().includes(busca)) ||
     (tecnica.descricao && tecnica.descricao.toLowerCase().includes(busca));
  }
  
  return true;
 });

 if (tecnicasFiltradas.length === 0) {
  container.innerHTML = `
   <div class="nenhuma-pericia">
    <i class="fas fa-search"></i>
    <div>Nenhuma técnica encontrada</div>
    <small>Tente outro filtro ou termo de busca</small>
   </div>
  `;
  return;
 }

 let html = '';

 tecnicasFiltradas.forEach(tecnica => {
  const jaAprendida = tecnica.jaAprendida || false;
  const disponivel = tecnica.disponivel !== false;
  
  // Informações para display (com fallback)
  const dxAtual = obterDXAtual();
  const nivelArco = obterNivelPericiaPorId('arco');
  const nhArco = dxAtual + nivelArco;
  
  html += `
   <div class="pericia-item ${!disponivel ? 'item-indisponivel' : ''}"
     data-id="${tecnica.id || ''}"
     style="cursor: ${disponivel ? 'pointer' : 'not-allowed'};
      opacity: ${disponivel ? '1' : '0.6'};
      background: ${jaAprendida ? 'rgba(39, 174, 96, 0.15)' : 'rgba(50, 50, 65, 0.9)'};
      border: 1px solid ${jaAprendida ? 'rgba(39, 174, 96, 0.4)' : 'rgba(255, 140, 0, 0.3)'};">
    
    <div class="pericia-header">
     <h4 class="pericia-nome">
      ${tecnica.nome || 'Técnica sem nome'}
      ${jaAprendida ? '<span style="color: #27ae60; margin-left: 5px;">✓</span>' : ''}
     </h4>
     <div class="pericia-info">
      <span class="pericia-dificuldade ${tecnica.dificuldade === 'Difícil' ? 'dificuldade-dificil' : 'dificuldade-medio'}">
       ${tecnica.dificuldade || 'Média'}
      </span>
      <span class="pericia-custo">NH ${tecnica.nhAtual || 0}</span>
     </div>
    </div>
    
    ${tecnica.descricao ? `<p class="pericia-descricao">${tecnica.descricao}</p>` : ''}
    
    <!-- Status do sistema -->
    <div style="font-size: 11px; color: #95a5a6; margin-top: 5px; padding: 3px 6px; background: rgba(0,0,0,0.2); border-radius: 3px;">
     <i class="fas fa-${sistemaPericiasDisponivel() ? 'check-circle' : 'exclamation-triangle'}"></i>
     ${sistemaPericiasDisponivel() ? 
       `Cálculo: ${dxAtual} (DX) + ${nivelArco} (Arco) = ${nhArco}` :
       'Sistema de perícias não carregado'}
    </div>
    
    ${!disponivel && tecnica.motivoIndisponivel ? `
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

 // Adicionar eventos (se disponível)
 const itens = container.querySelectorAll('.pericia-item');
 itens.forEach(item => {
  if (item.classList.contains('item-indisponivel')) return;
  
  item.addEventListener('click', function() {
   const id = this.getAttribute('data-id');
   if (!id) return;
   
   const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
   if (tecnica && tecnica.disponivel !== false) {
    abrirModalTecnica(tecnica);
   }
  });
 });
}

// ===== MODAL SIMPLIFICADO (FUNCIONAL) =====
function abrirModalTecnica(tecnica) {
 if (!tecnica) return;
 
 estadoTecnicas.tecnicaSelecionada = tecnica;
 const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);

 // Cálculos básicos
 const dxAtual = obterDXAtual();
 const nivelArco = obterNivelPericiaPorId('arco');
 const nhArco = dxAtual + nivelArco;
 const nhBase = nhArco - 4;
 
 // Valores atuais
 let nhAtual = nhBase;
 let niveisComprados = 0;
 let custoTotal = 0;

 if (jaAprendida) {
  niveisComprados = jaAprendida.niveisComprados || 0;
  custoTotal = jaAprendida.custoTotal || 0;
  nhAtual = nhBase + niveisComprados;
 }

 // Opções
 let opcoesHTML = '';
 const niveisPossiveis = Math.max(0, nhArco - nhBase);
 
 for (let i = 0; i <= niveisPossiveis; i++) {
  const nhOpcao = nhBase + i;
  const custo = calcularCustoTecnica(i, tecnica.dificuldade || 'Difícil');
  const selected = nhOpcao === nhAtual ? 'selected' : '';
  
  opcoesHTML += `
   <option value="${i}" ${selected}>
    NH ${nhOpcao} (${custo} pontos)
   </option>
  `;
 }

 // Modal SIMPLES mas funcional
 const modalHTML = `
  <div style="background: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0; position: relative;">
   <span onclick="fecharModalTecnica()" style="position: absolute; right: 20px; top: 20px; font-size: 24px; cursor: pointer; color: #ffd700;">×</span>
   <h3 style="margin: 0; color: #ffd700;">${tecnica.nome || 'Técnica'}</h3>
  </div>
  
  <div style="padding: 20px; background: #1e1e28; color: #ccc; max-height: 60vh; overflow-y: auto;">
   <!-- Status do sistema -->
   <div style="background: ${sistemaPericiasDisponivel() ? 'rgba(39, 174, 96, 0.1)' : 'rgba(243, 156, 18, 0.1)'}; 
        padding: 10px; border-radius: 5px; margin-bottom: 15px; border-left: 3px solid ${sistemaPericiasDisponivel() ? '#27ae60' : '#f39c12'};">
    ${sistemaPericiasDisponivel() ? 
      `<i class="fas fa-check-circle"></i> Sistema de perícias carregado` :
      `<i class="fas fa-exclamation-triangle"></i> Sistema de perícias não carregado - usando valores padrão`}
   </div>
   
   <!-- Cálculo -->
   <div style="margin-bottom: 15px;">
    <div style="font-size: 14px; margin-bottom: 5px;"><strong>Cálculo do NH:</strong></div>
    <div style="font-size: 13px; color: #95a5a6;">
     ${dxAtual} (DX) + ${nivelArco} (Arco) = ${nhArco} → ${nhArco} - 4 = ${nhBase}
    </div>
   </div>
   
   <!-- Seleção -->
   <div style="margin-bottom: 20px;">
    <label style="display: block; margin-bottom: 8px; color: #ffd700;">Níveis acima da base:</label>
    <select id="select-niveis-tecnica" style="width: 100%; padding: 10px; background: #2c3e50; color: white; border: 1px solid #555; border-radius: 4px;">
     ${opcoesHTML}
    </select>
   </div>
   
   <!-- Custo -->
   <div style="background: rgba(52, 152, 219, 0.1); padding: 10px; border-radius: 5px; margin-bottom: 15px;">
    <div style="font-size: 12px; color: #95a5a6;">Custo total:</div>
    <div id="custo-display" style="font-size: 20px; font-weight: bold; color: #3498db;">
     ${custoTotal} pontos
    </div>
   </div>
   
   <!-- Descrição -->
   ${tecnica.descricao ? `
   <div style="margin-bottom: 15px;">
    <div style="font-size: 14px; color: #ffd700; margin-bottom: 5px;">Descrição:</div>
    <div style="font-size: 13px;">${tecnica.descricao}</div>
   </div>
   ` : ''}
  </div>
  
  <div style="padding: 15px; background: #2c3e50; border-radius: 0 0 8px 8px; display: flex; gap: 10px; justify-content: flex-end;">
   <button onclick="fecharModalTecnica()"
     style="padding: 10px 20px; background: #7f8c8d; color: white; border: none; border-radius: 4px; cursor: pointer;">
    Cancelar
   </button>
   <button onclick="comprarTecnica()"
     id="btn-comprar-tecnica"
     style="padding: 10px 20px; background: #ff8c00; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
    ${jaAprendida ? 'Atualizar' : 'Comprar'}
   </button>
  </div>
 `;

 // Inserir modal
 const modal = document.querySelector('.modal-tecnica');
 if (modal) {
  modal.innerHTML = modalHTML;
  document.querySelector('.modal-tecnica-overlay').style.display = 'flex';
  estadoTecnicas.modalAberto = true;
  
  // Atualizar custo quando mudar seleção
  const select = document.getElementById('select-niveis-tecnica');
  const custoDisplay = document.getElementById('custo-display');
  
  if (select && custoDisplay) {
   select.addEventListener('change', function() {
    const niveis = parseInt(this.value);
    const custo = calcularCustoTecnica(niveis, tecnica.dificuldade || 'Difícil');
    custoDisplay.textContent = `${custo} pontos`;
   });
  }
 }
}

// ===== FUNÇÕES RESTANTES (SIMPLIFICADAS) =====
function comprarTecnica() {
 if (!estadoTecnicas.tecnicaSelecionada) {
  alert("Erro: Técnica não selecionada");
  return;
 }

 const select = document.getElementById('select-niveis-tecnica');
 if (!select) return;

 const niveisComprados = parseInt(select.value);
 const custo = calcularCustoTecnica(niveisComprados, estadoTecnicas.tecnicaSelecionada.dificuldade || 'Difícil');

 const tecnicaId = estadoTecnicas.tecnicaSelecionada.id;
 const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnicaId);

 if (index >= 0) {
  estadoTecnicas.tecnicasAprendidas[index] = {
   ...estadoTecnicas.tecnicasAprendidas[index],
   niveisComprados: niveisComprados,
   custoTotal: custo
  };
 } else {
  estadoTecnicas.tecnicasAprendidas.push({
   id: tecnicaId,
   nome: estadoTecnicas.tecnicaSelecionada.nome,
   dificuldade: estadoTecnicas.tecnicaSelecionada.dificuldade || 'Difícil',
   niveisComprados: niveisComprados,
   custoTotal: custo
  });
 }

 // Salvar e atualizar
 salvarTecnicas();
 atualizarTecnicasDisponiveis();
 renderizarTecnicasAprendidas();
 atualizarEstatisticasTecnicas();
 fecharModalTecnica();
 
 alert(`${estadoTecnicas.tecnicaSelecionada.nome} salva!`);
}

function renderizarTecnicasAprendidas() {
 const container = document.getElementById('tecnicas-aprendidas');
 if (!container) return;

 if (estadoTecnicas.tecnicasAprendidas.length === 0) {
  container.innerHTML = `
   <div style="text-align: center; padding: 30px; color: #95a5a6;">
    <i class="fas fa-tools" style="font-size: 24px; margin-bottom: 10px;"></i>
    <div>Nenhuma técnica aprendida</div>
   </div>
  `;
  return;
 }

 let html = '';
 estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
  const dxAtual = obterDXAtual();
  const nivelArco = obterNivelPericiaPorId('arco');
  const nhArco = dxAtual + nivelArco;
  const nhBase = nhArco - 4;
  const nhAtual = nhBase + (tecnica.niveisComprados || 0);
  
  html += `
   <div style="background: rgba(50, 50, 65, 0.9); border: 1px solid #555; border-radius: 5px; padding: 15px; margin-bottom: 10px; position: relative;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
     <h4 style="margin: 0; color: #ffd700;">${tecnica.nome || 'Técnica'}</h4>
     <span style="color: #3498db; font-weight: bold;">NH ${nhAtual}</span>
    </div>
    <div style="font-size: 12px; color: #95a5a6; margin-top: 5px;">
     Níveis: ${tecnica.niveisComprados || 0} | Custo: ${tecnica.custoTotal || 0} pontos
    </div>
    <button onclick="removerTecnica('${tecnica.id}')" 
      style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: #e74c3c; cursor: pointer;">
     <i class="fas fa-times"></i>
    </button>
   </div>
  `;
 });

 container.innerHTML = html;
}

function removerTecnica(id) {
 if (confirm('Remover esta técnica?')) {
  estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
  salvarTecnicas();
  atualizarTecnicasDisponiveis();
  renderizarTecnicasAprendidas();
  atualizarEstatisticasTecnicas();
 }
}

function atualizarEstatisticasTecnicas() {
 estadoTecnicas.pontosTecnicasTotal = 0;
 estadoTecnicas.qtdTotal = estadoTecnicas.tecnicasAprendidas.length;
 
 estadoTecnicas.tecnicasAprendidas.forEach(t => {
  estadoTecnicas.pontosTecnicasTotal += t.custoTotal || 0;
 });
 
 // Atualizar display se existir
 const totalElement = document.getElementById('qtd-tecnicas-total');
 if (totalElement) totalElement.textContent = estadoTecnicas.qtdTotal;
 
 const pontosElement = document.getElementById('pts-tecnicas-total');
 if (pontosElement) pontosElement.textContent = `(${estadoTecnicas.pontosTecnicasTotal} pts)`;
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
  console.error("Erro ao salvar:", e);
 }
}

function carregarTecnicas() {
 try {
  const salvo = localStorage.getItem('tecnicasAprendidas');
  if (salvo) estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
 } catch (e) {
  console.error("Erro ao carregar:", e);
 }
}

// ===== INICIALIZAÇÃO ROBUSTA =====
function inicializarSistemaTecnicas() {
 console.log("🔧 Inicializando sistema de técnicas...");
 
 // 1. Carregar dados salvos
 carregarTecnicas();
 
 // 2. Configurar eventos básicos
 const filtros = document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]');
 filtros.forEach(btn => {
  btn.addEventListener('click', function() {
   const filtro = this.getAttribute('data-filtro');
   estadoTecnicas.filtroAtivo = filtro;
   renderizarCatalogoTecnicas();
  });
 });
 
 // 3. Inicializar display
 setTimeout(() => {
  atualizarTecnicasDisponiveis();
  renderizarTecnicasAprendidas();
  atualizarEstatisticasTecnicas();
  console.log("✅ Sistema de técnicas inicializado");
 }, 1000);
 
 // 4. Verificar periódicamente se o sistema de perícias carregou
 let tentativas = 0;
 const verificarPericias = setInterval(() => {
  tentativas++;
  
  if (sistemaPericiasDisponivel()) {
   console.log("✅ Sistema de perícias detectado!");
   clearInterval(verificarPericias);
   atualizarTecnicasDisponiveis();
  } else if (tentativas > 10) {
   console.warn("⚠️ Sistema de perícias não carregado após 10 tentativas");
   clearInterval(verificarPericias);
  }
 }, 1000);
}

// ===== INICIALIZAR QUANDO A ABA ESTIVER PRONTA =====
document.addEventListener('DOMContentLoaded', function() {
 // Aguardar a aba de técnicas ficar visível
 const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
   if (mutation.attributeName === 'style') {
    const tecnicasTab = document.getElementById('tecnicas');
    if (tecnicasTab && tecnicasTab.style.display !== 'none') {
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
 
 // Observar a aba de técnicas
 const tecnicasTab = document.getElementById('tecnicas');
 if (tecnicasTab) {
  observer.observe(tecnicasTab, { attributes: true });
 }
 
 // Inicializar imediatamente se já visível
 if (tecnicasTab && tecnicasTab.style.display !== 'none') {
  setTimeout(() => {
   if (!window.sistemaTecnicasInicializado) {
    inicializarSistemaTecnicas();
    window.sistemaTecnicasInicializado = true;
   }
  }, 1000);
 }
});

// ===== EXPORTAR =====
window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;

console.log("📦 Módulo de técnicas carregado");