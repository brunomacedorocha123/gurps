// ===== SISTEMA DE TÉCNICAS - VERSÃO INDEPENDENTE =====
console.log(" INICIANDO SISTEMA DE TÉCNICAS - INDEPENDENTE");

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

// ===== CUSTO =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
 if (niveisAcima <= 0) return 0;
 if (dificuldade === 'Difícil') return Math.min(niveisAcima + 1, 12);
 if (dificuldade === 'Média') return niveisAcima;
 return 0;
}

// ===== FUNÇÃO ULTRA SIMPLES PARA DX =====
function obterDXAtual() {
 // Método 1: Elemento direto
 const dxInput = document.querySelector('#DX, input[name="DX"], [data-atributo="DX"]');
 if (dxInput && dxInput.value) {
  const valor = parseInt(dxInput.value);
  if (!isNaN(valor)) return valor;
 }
 
 // Método 2: Sistema se existir
 if (window.obterAtributoAtual && typeof window.obterAtributoAtual === 'function') {
  try {
   const dx = window.obterAtributoAtual('DX');
   if (dx && !isNaN(dx)) return dx;
  } catch (e) {}
 }
 
 // Padrão
 return 10;
}

// ===== FUNÇÃO INDEPENDENTE: OBTER NÍVEL DE ARCO =====
function obterNivelArco() {
 console.log("🔍 Buscando nível de Arco...");
 
 // Método DIRETO: Procurar perícia Arco em qualquer lugar
 const buscarArcoNoDOM = () => {
  // 1. Procurar na lista de perícias aprendidas
  const periciasAprendidas = document.querySelectorAll('#pericias-aprendidas .pericia-aprendida-item');
  for (const pericia of periciasAprendidas) {
   const nomeElement = pericia.querySelector('.pericia-aprendida-nome');
   if (nomeElement && nomeElement.textContent.includes('Arco')) {
    // Tentar extrair nível
    const nivelElement = pericia.querySelector('.pericia-aprendida-nivel');
    if (nivelElement) {
     const texto = nivelElement.textContent;
     const match = texto.match(/[+-]?\d+/);
     if (match) {
      const nivel = parseInt(match[0]);
      console.log(`✅ Nível Arco encontrado no DOM: ${nivel}`);
      return nivel;
     }
    }
   }
  }
  
  // 2. Procurar em localStorage
  try {
   const periciasSalvas = localStorage.getItem('periciasAprendidas');
   if (periciasSalvas) {
    const pericias = JSON.parse(periciasSalvas);
    const arco = pericias.find(p => p.id === 'arco' || p.nome === 'Arco');
    if (arco && arco.nivel !== undefined) {
     console.log(`✅ Nível Arco no localStorage: ${arco.nivel}`);
     return arco.nivel;
    }
   }
  } catch (e) {}
  
  return 0; // Não encontrado
 };
 
 return buscarArcoNoDOM();
}

// ===== FUNÇÃO PRINCIPAL: CALCULAR NH TÉCNICA =====
function calcularNHTecnica() {
 const dx = obterDXAtual();
 const nivelArco = obterNivelArco();
 const nhArco = dx + nivelArco;
 const nhBase = nhArco - 4;
 
 console.log(`📊 Cálculo Técnica: ${dx} (DX) + ${nivelArco} (Arco) = ${nhArco} → ${nhArco} - 4 = ${nhBase}`);
 
 return {
  dx: dx,
  nivelArco: nivelArco,
  nhArco: nhArco,
  nhBase: nhBase
 };
}

// ===== ATUALIZAR DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
 console.log("🔄 Atualizando técnicas...");
 
 if (!window.catalogoTecnicas) {
  console.error("❌ Sem catálogo");
  return;
 }
 
 try {
  const todas = window.catalogoTecnicas.obterTodasTecnicas();
  const calculo = calcularNHTecnica();
  
  const disponiveis = todas.map(tecnica => {
   const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
   const nhBase = calculo.nhBase;
   let nhAtual = nhBase;
   
   if (jaAprendida && jaAprendida.niveisComprados) {
    nhAtual = nhBase + jaAprendida.niveisComprados;
   }
   
   // Verificar pré-requisito básico
   let disponivel = true;
   let motivo = '';
   
   if (tecnica.preRequisitos) {
    const reqArco = tecnica.preRequisitos.find(r => r.idPericia === 'arco');
    if (reqArco && calculo.nivelArco < reqArco.nivelMinimo) {
     disponivel = false;
     motivo = `Precisa Arco nível ${reqArco.nivelMinimo}`;
    }
   }
   
   return {
    ...tecnica,
    disponivel: disponivel,
    nhAtual: nhAtual,
    motivoIndisponivel: motivo,
    jaAprendida: !!jaAprendida,
    calculo: calculo // Adiciona cálculo para debug
   };
  });
  
  estadoTecnicas.tecnicasDisponiveis = disponiveis;
  renderizarCatalogoTecnicas();
  
 } catch (error) {
  console.error("Erro:", error);
 }
}

// ===== RENDERIZAR CATÁLOGO SIMPLES =====
function renderizarCatalogoTecnicas() {
 const container = document.getElementById('lista-tecnicas');
 if (!container) return;
 
 const calculo = calcularNHTecnica();
 
 let html = '';
 
 estadoTecnicas.tecnicasDisponiveis.forEach(tecnica => {
  const disponivel = tecnica.disponivel !== false;
  
  html += `
   <div class="pericia-item" 
     onclick="${disponivel ? `abrirModalTecnicaSimples('${tecnica.id}')` : ''}"
     style="cursor: ${disponivel ? 'pointer' : 'not-allowed'};
            opacity: ${disponivel ? '1' : '0.6'};
            background: rgba(50, 50, 65, 0.9);
            border: 1px solid rgba(255, 140, 0, 0.3);
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 5px;">
    
    <div style="display: flex; justify-content: space-between; align-items: center;">
     <h4 style="margin: 0; color: #ffd700;">${tecnica.nome}</h4>
     <span style="color: #3498db; font-weight: bold;">NH ${tecnica.nhAtual}</span>
    </div>
    
    <p style="color: #ccc; margin: 10px 0; font-size: 14px;">${tecnica.descricao}</p>
    
    <div style="font-size: 12px; color: #95a5a6;">
     <i class="fas fa-calculator"></i> Base: ${calculo.dx} + ${calculo.nivelArco} = ${calculo.nhArco} - 4 = ${calculo.nhBase}
    </div>
    
    ${!disponivel ? `
    <div style="color: #e74c3c; font-size: 12px; margin-top: 5px;">
     <i class="fas fa-lock"></i> ${tecnica.motivoIndisponivel}
    </div>
    ` : ''}
   </div>
  `;
 });
 
 container.innerHTML = html || '<div style="color: #95a5a6; text-align: center; padding: 20px;">Nenhuma técnica disponível</div>';
}

// ===== MODAL SIMPLES DIRETO =====
function abrirModalTecnicaSimples(id) {
 const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
 if (!tecnica) return;
 
 estadoTecnicas.tecnicaSelecionada = tecnica;
 const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === id);
 
 const calculo = calcularNHTecnica();
 const nhBase = calculo.nhBase;
 const nhMaximo = calculo.nhArco;
 
 let nhAtual = nhBase;
 let niveisComprados = 0;
 
 if (jaAprendida) {
  niveisComprados = jaAprendida.niveisComprados || 0;
  nhAtual = nhBase + niveisComprados;
 }
 
 // Criar opções
 let opcoesHTML = '';
 for (let i = 0; i <= (nhMaximo - nhBase); i++) {
  const custo = calcularCustoTecnica(i, tecnica.dificuldade);
  const selected = i === niveisComprados ? 'selected' : '';
  opcoesHTML += `<option value="${i}" ${selected}>NH ${nhBase + i} (${custo} pts)</option>`;
 }
 
 // Criar modal diretamente
 const modalOverlay = document.createElement('div');
 modalOverlay.id = 'modal-tecnica-overlay-custom';
 modalOverlay.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
 `;
 
 const modalContent = document.createElement('div');
 modalContent.style.cssText = `
  background: #1e1e28;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  border: 2px solid #ff8c00;
 `;
 
 modalContent.innerHTML = `
  <div style="background: #2c3e50; color: white; padding: 20px; border-radius: 6px 6px 0 0; position: relative;">
   <h3 style="margin: 0; color: #ffd700;">${tecnica.nome}</h3>
   <div style="color: #95a5a6; margin-top: 5px;">${tecnica.dificuldade}</div>
   <button onclick="document.getElementById('modal-tecnica-overlay-custom').remove()" 
     style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #ffd700; font-size: 24px; cursor: pointer;">×</button>
  </div>
  
  <div style="padding: 20px;">
   <!-- Cálculo -->
   <div style="background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius: 5px; margin-bottom: 15px;">
    <div style="font-size: 14px; color: #3498db; margin-bottom: 5px;"><strong>Cálculo do NH:</strong></div>
    <div style="font-size: 13px;">
     ${calculo.dx} (DX) + ${calculo.nivelArco} (Arco) = ${calculo.nhArco}<br>
     ${calculo.nhArco} - 4 = <strong>${nhBase}</strong> (base da técnica)
    </div>
   </div>
   
   <!-- Seleção -->
   <div style="margin-bottom: 15px;">
    <label style="display: block; color: #ffd700; margin-bottom: 8px;">Níveis acima da base:</label>
    <select id="niveis-tecnica-select" style="width: 100%; padding: 10px; background: #2c3e50; color: white; border: 1px solid #555; border-radius: 4px;">
     ${opcoesHTML}
    </select>
   </div>
   
   <!-- Custo -->
   <div id="custo-display-tech" style="background: rgba(39, 174, 96, 0.1); padding: 15px; border-radius: 5px; margin-bottom: 15px;">
    <div style="font-size: 12px; color: #95a5a6;">Custo total:</div>
    <div style="font-size: 24px; font-weight: bold; color: #27ae60;">${jaAprendida ? (jaAprendida.custoTotal || 0) : 0} pontos</div>
   </div>
   
   <!-- Descrição -->
   <div style="color: #ccc; font-size: 14px; line-height: 1.5;">${tecnica.descricao}</div>
  </div>
  
  <div style="padding: 15px; background: #2c3e50; border-radius: 0 0 6px 6px; display: flex; gap: 10px; justify-content: flex-end;">
   <button onclick="document.getElementById('modal-tecnica-overlay-custom').remove()" 
     style="padding: 10px 20px; background: #7f8c8d; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
   <button onclick="comprarTecnicaSimples()" 
     style="padding: 10px 20px; background: #ff8c00; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
    ${jaAprendida ? 'Atualizar' : 'Comprar'}
   </button>
  </div>
 `;
 
 modalOverlay.appendChild(modalContent);
 document.body.appendChild(modalOverlay);
 
 // Atualizar custo
 const select = document.getElementById('niveis-tecnica-select');
 const custoDisplay = document.getElementById('custo-display-tech');
 
 if (select && custoDisplay) {
  select.addEventListener('change', function() {
   const niveis = parseInt(this.value);
   const custo = calcularCustoTecnica(niveis, tecnica.dificuldade);
   custoDisplay.innerHTML = `
    <div style="font-size: 12px; color: #95a5a6;">Custo total:</div>
    <div style="font-size: 24px; font-weight: bold; color: #27ae60;">${custo} pontos</div>
   `;
  });
 }
}

// ===== COMPRAR TÉCNICA SIMPLES =====
function comprarTecnicaSimples() {
 const modal = document.getElementById('modal-tecnica-overlay-custom');
 if (!modal || !estadoTecnicas.tecnicaSelecionada) return;
 
 const select = document.getElementById('niveis-tecnica-select');
 if (!select) return;
 
 const niveisComprados = parseInt(select.value);
 const custo = calcularCustoTecnica(niveisComprados, estadoTecnicas.tecnicaSelecionada.dificuldade);
 
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
   dificuldade: estadoTecnicas.tecnicaSelecionada.dificuldade,
   niveisComprados: niveisComprados,
   custoTotal: custo,
   dataAquisicao: new Date().toISOString()
  });
 }
 
 // Salvar
 localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
 
 // Atualizar
 atualizarTecnicasDisponiveis();
 renderizarTecnicasAprendidasSimples();
 atualizarEstatisticasSimples();
 
 // Fechar
 modal.remove();
 
 alert(`✅ ${estadoTecnicas.tecnicaSelecionada.nome} salva!`);
}

// ===== RENDERIZAR APRENDIDAS SIMPLES =====
function renderizarTecnicasAprendidasSimples() {
 const container = document.getElementById('tecnicas-aprendidas');
 if (!container) return;
 
 if (estadoTecnicas.tecnicasAprendidas.length === 0) {
  container.innerHTML = `
   <div style="text-align: center; padding: 30px; color: #95a5a6;">
    <i class="fas fa-tools" style="font-size: 24px;"></i>
    <div style="margin-top: 10px;">Nenhuma técnica aprendida</div>
   </div>
  `;
  return;
 }
 
 const calculo = calcularNHTecnica();
 
 let html = '';
 estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
  const nhAtual = calculo.nhBase + (tecnica.niveisComprados || 0);
  
  html += `
   <div style="background: rgba(50, 50, 65, 0.9); border: 1px solid #9b59b6; border-radius: 5px; padding: 15px; margin-bottom: 10px; position: relative;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
     <h4 style="margin: 0; color: #ffd700;">${tecnica.nome}</h4>
     <span style="color: #3498db; font-weight: bold;">NH ${nhAtual}</span>
    </div>
    <div style="font-size: 12px; color: #95a5a6; margin-top: 5px;">
     Níveis: ${tecnica.niveisComprados || 0} | Custo: ${tecnica.custoTotal || 0} pts
    </div>
    <button onclick="removerTecnicaSimples('${tecnica.id}')" 
      style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 18px;">
     ×
    </button>
   </div>
  `;
 });
 
 container.innerHTML = html;
}

// ===== REMOVER SIMPLES =====
function removerTecnicaSimples(id) {
 if (!confirm('Remover esta técnica?')) return;
 
 estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
 localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
 
 atualizarTecnicasDisponiveis();
 renderizarTecnicasAprendidasSimples();
 atualizarEstatisticasSimples();
}

// ===== ESTATÍSTICAS SIMPLES =====
function atualizarEstatisticasSimples() {
 estadoTecnicas.pontosTecnicasTotal = estadoTecnicas.tecnicasAprendidas.reduce((total, t) => total + (t.custoTotal || 0), 0);
 estadoTecnicas.qtdTotal = estadoTecnicas.tecnicasAprendidas.length;
 
 // Atualizar display
 const totalEl = document.getElementById('qtd-tecnicas-total');
 const pontosEl = document.getElementById('pts-tecnicas-total');
 
 if (totalEl) totalEl.textContent = estadoTecnicas.qtdTotal;
 if (pontosEl) pontosEl.textContent = `(${estadoTecnicas.pontosTecnicasTotal} pts)`;
}

// ===== INICIALIZAÇÃO ULTRA SIMPLES =====
function iniciarTecnicas() {
 console.log("🚀 Iniciando sistema de técnicas...");
 
 // Carregar salvo
 try {
  const salvo = localStorage.getItem('tecnicasAprendidas');
  if (salvo) estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
 } catch (e) {}
 
 // Configurar filtros
 document.querySelectorAll('.filtro-btn').forEach(btn => {
  if (btn.getAttribute('data-filtro')?.includes('tecnicas')) {
   btn.addEventListener('click', function() {
    estadoTecnicas.filtroAtivo = this.getAttribute('data-filtro');
    renderizarCatalogoTecnicas();
   });
  }
 });
 
 // Busca
 const buscaInput = document.getElementById('busca-tecnicas');
 if (buscaInput) {
  buscaInput.addEventListener('input', function() {
   estadoTecnicas.buscaAtiva = this.value;
   renderizarCatalogoTecnicas();
  });
 }
 
 // Atualizar periodicamente
 setInterval(() => {
  if (document.getElementById('lista-tecnicas')) {
   atualizarTecnicasDisponiveis();
   renderizarTecnicasAprendidasSimples();
  }
 }, 2000);
 
 // Inicializar agora
 setTimeout(() => {
  if (window.catalogoTecnicas) {
   atualizarTecnicasDisponiveis();
   renderizarTecnicasAprendidasSimples();
   atualizarEstatisticasSimples();
   console.log("✅ Técnicas prontas!");
  }
 }, 1000);
}

// ===== INICIAR QUANDO A ABA APARECER =====
document.addEventListener('DOMContentLoaded', function() {
 // Verificar se estamos na aba de técnicas
 const verificarAba = () => {
  const tecnicasTab = document.getElementById('tecnicas');
  if (tecnicasTab && tecnicasTab.style.display !== 'none') {
   iniciarTecnicas();
   return true;
  }
  return false;
 };
 
 // Tentar agora
 if (!verificarAba()) {
  // Tentar a cada 500ms até encontrar
  const interval = setInterval(() => {
   if (verificarAba()) {
    clearInterval(interval);
   }
  }, 500);
 }
});

// ===== EXPORTAR =====
window.abrirModalTecnicaSimples = abrirModalTecnicaSimples;
window.comprarTecnicaSimples = comprarTecnicaSimples;
window.removerTecnicaSimples = removerTecnicaSimples;

console.log("🎯 Sistema de técnicas carregado - Versão Independente");