// ===== SISTEMA DE TÉCNICAS - VERSÃO COMPLETA =====
console.log(" INICIANDO SISTEMA DE TÉCNICAS - NH CORRETO");

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

// ===== TABELA DE CUSTO PARA TÉCNICAS =====
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

// ===== FUNÇÃO CRÍTICA: OBTER DX ATUAL =====
function obterDXAtual() {
 console.log(" Obtendo DX atual...");
 
 // Tentar usar função do sistema de atributos
 if (window.obterAtributoAtual) {
  const dx = window.obterAtributoAtual('DX');
  console.log(`✅ DX do sistema: ${dx}`);
  return dx;
 }
 
 // Fallback: buscar elemento HTML
 const dxElement = document.getElementById('DX');
 if (dxElement) {
  const dx = parseInt(dxElement.value) || 10;
  console.log(`✅ DX do HTML: ${dx}`);
  return dx;
 }
 
 console.log("⚠️ DX não encontrado, usando 10");
 return 10;
}

// ===== FUNÇÃO CRÍTICA: OBTER NÍVEL REAL DA PERÍCIA =====
function obterNivelPericiaPorId(idPericia) {
 console.log(` Buscando nível real de: ${idPericia}`);
 
 // Verificar se o sistema de perícias existe
 if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
  console.warn("⚠️ Sistema de perícias não carregado");
  return 0;
 }
 
 // Buscar perícia específica
 let periciaEncontrada = null;
 
 if (idPericia === 'arco') {
  periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => p.id === 'arco');
 } else if (idPericia.includes('cavalgar')) {
  periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p =>
   p.id.includes('cavalgar') || p.nome.includes('Cavalgar')
  );
 }
 
 if (!periciaEncontrada) {
  console.log(`❌ Perícia ${idPericia} não encontrada nas aprendidas`);
  return 0;
 }
 
 // O nível está na propriedade 'nivel' (pode ser negativo!)
 const nivel = periciaEncontrada.nivel || 0;
 console.log(`✅ Nível encontrado para ${idPericia}: ${nivel} (tipo: ${typeof nivel})`);
 
 return nivel;
}

// ===== FUNÇÃO PARA OBTER NH REAL (100% CORRETA) =====
function obterNHPericiaPorId(idPericia) {
 console.log(` Calculando NH REAL para: ${idPericia}`);
 
 // 1. Obter DX atual
 const dxAtual = obterDXAtual();
 
 // 2. Obter nível da perícia
 const nivelPericia = obterNivelPericiaPorId(idPericia);
 
 // 3. Calcular NH REAL
 const nhReal = dxAtual + nivelPericia;
 
 console.log(`✅ NH REAL de ${idPericia}: ${dxAtual} (DX) + ${nivelPericia} (nível) = ${nhReal}`);
 
 return nhReal;
}

// ===== VERIFICAR PRÉ-REQUISITOS =====
function verificarPreRequisitosTecnica(tecnica) {
 console.log(` Verificando pré-requisitos para: ${tecnica.nome}`);

 if (!tecnica.preRequisitos) {
  console.log("✅ Sem pré-requisitos específicos");
  return { passou: true, motivo: '' };
 }
 
 // Verificar se sistema de perícias existe
 if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
  console.warn("⚠️ Sistema de perícias não disponível");
  return { passou: false, motivo: 'Sistema de perícias não carregado' };
 }

 // Verificar Arco-4
 const reqArco = tecnica.preRequisitos.find(req => req.idPericia === 'arco');
 if (reqArco) {
  const nivelArco = obterNivelPericiaPorId('arco');
  console.log(`📊 Nível em Arco: ${nivelArco}, Mínimo necessário: ${reqArco.nivelMinimo}`);
  
  if (nivelArco < reqArco.nivelMinimo) {
   return {
    passou: false,
    motivo: `❌ Arco precisa ter nível ${reqArco.nivelMinimo} (atual: ${nivelArco})`
   };
  }
 }

 // Verificar Cavalgar
 const reqCavalgar = tecnica.preRequisitos.find(req => req.idsCavalgar);
 if (reqCavalgar) {
  const temCavalgar = window.estadoPericias.periciasAprendidas.some(p =>
   reqCavalgar.idsCavalgar.includes(p.id) || p.id.includes('cavalgar')
  );
  
  if (!temCavalgar) {
   return {
    passou: false,
    motivo: '❌ Precisa de alguma perícia de Cavalgar'
   };
  }
 }

 console.log("✅ Todos os pré-requisitos atendidos");
 return { passou: true, motivo: '' };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
 console.log(" Atualizando técnicas disponíveis...");

 if (!window.catalogoTecnicas) {
  console.error("❌ Catálogo de técnicas não carregado!");
  return;
 }

 const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();

 const disponiveis = todasTecnicas.map(tecnica => {
  const verificacao = verificarPreRequisitosTecnica(tecnica);
  const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
  
  // CÁLCULO CORRETO DO NH
  let nhAtual = 0;
  let nhMaximo = 0;
  
  if (tecnica.baseCalculo && tecnica.baseCalculo.idPericia) {
   // Obter NH REAL da perícia base
   const nhPericia = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
   
   // Calcular NH base da técnica
   const nhBase = nhPericia + (tecnica.baseCalculo.redutor || 0);
   nhMaximo = nhPericia; // Não pode exceder NH da perícia
   nhAtual = nhBase; // NH inicial
   
   // Adicionar níveis comprados se já aprendida
   if (jaAprendida && jaAprendida.niveisComprados) {
    nhAtual = nhBase + jaAprendida.niveisComprados;
   }
  }
  
  return {
   ...tecnica,
   disponivel: verificacao.passou,
   nhAtual: nhAtual,
   nhMaximo: nhMaximo,
   motivoIndisponivel: verificacao.motivo,
   jaAprendida: !!jaAprendida
  };
 });

 estadoTecnicas.tecnicasDisponiveis = disponiveis;
 renderizarCatalogoTecnicas();
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
 const container = document.getElementById('lista-tecnicas');
 if (!container) {
  console.error("❌ Container não encontrado!");
  return;
 }

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
  
  // Informações para cálculo
  const dxAtual = obterDXAtual();
  const nivelArco = obterNivelPericiaPorId('arco');
  const nhArco = dxAtual + nivelArco;
  const nhBase = nhArco - 4;
  
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
    
    <!-- Mostrar cálculo do NH -->
    <div style="font-size: 11px; color: #95a5a6; margin-top: 5px; padding: 3px 6px; background: rgba(0,0,0,0.2); border-radius: 3px;">
     <i class="fas fa-calculator"></i> Cálculo: ${dxAtual} (DX) + ${nivelArco >= 0 ? '+' : ''}${nivelArco} (Arco) = ${nhArco} → ${nhArco} - 4 = ${nhBase}
    </div>
    
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

 // Adicionar eventos de clique
 const itens = container.querySelectorAll('.pericia-item');
 itens.forEach(item => {
  if (item.classList.contains('item-indisponivel')) return;
  
  item.addEventListener('click', function() {
   const id = this.getAttribute('data-id');
   const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
   if (tecnica && tecnica.disponivel) {
    abrirModalTecnica(tecnica);
   }
  });
 });
}

// ===== ABRIR MODAL DE COMPRA =====
function abrirModalTecnica(tecnica) {
 console.log(" Abrindo modal para:", tecnica.nome);

 estadoTecnicas.tecnicaSelecionada = tecnica;
 const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);

 // CÁLCULO COMPLETO E CORRETO
 const dxAtual = obterDXAtual();
 const nivelArco = obterNivelPericiaPorId('arco');
 const nhArco = dxAtual + nivelArco;
 const nhBase = nhArco - 4;
 const nhMaximo = nhArco;

 console.log(`📊 CÁLCULO COMPLETO DA TÉCNICA:`);
 console.log(`  DX Atual: ${dxAtual}`);
 console.log(`  Nível em Arco: ${nivelArco}`);
 console.log(`  NH Arco: ${dxAtual} + ${nivelArco} = ${nhArco}`);
 console.log(`  NH Técnica Base: ${nhArco} - 4 = ${nhBase}`);
 console.log(`  NH Máximo: ${nhMaximo}`);

 // Calcular NH atual
 let nhAtual = nhBase;
 let niveisComprados = 0;
 let custoTotal = 0;

 if (jaAprendida) {
  niveisComprados = jaAprendida.niveisComprados || 0;
  custoTotal = jaAprendida.custoTotal || 0;
  nhAtual = nhBase + niveisComprados;
 }

 // Criar opções de NH
 let opcoesHTML = '';
 const niveisPossiveis = nhMaximo - nhBase;

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
   <!-- CÁLCULO DETALHADO -->
   <div style="background: rgba(41, 128, 185, 0.15); padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #2980b9;">
    <h4 style="color: #3498db; margin-top: 0; margin-bottom: 10px;">
     <i class="fas fa-calculator"></i> CÁLCULO DO NH - PASSO A PASSO
    </h4>
    <div style="font-size: 14px; line-height: 1.8;">
     <div><strong>1. Seu DX atual:</strong> ${dxAtual}</div>
     <div><strong>2. Seu nível em Arco:</strong> ${nivelArco >= 0 ? '+' : ''}${nivelArco} (investido ${nivelArco === -1 ? '1 ponto' : `${Math.abs(nivelArco)} pontos`})</div>
     <div><strong>3. NH em Arco:</strong> ${dxAtual} + ${nivelArco} = <span style="color: #3498db; font-weight: bold;">${nhArco}</span></div>
     <div><strong>4. NH base da técnica:</strong> ${nhArco} - 4 = <span style="color: #27ae60; font-weight: bold;">${nhBase}</span></div>
     <div><strong>5. Máximo possível:</strong> Não pode exceder NH Arco = <span style="color: #e74c3c; font-weight: bold;">${nhMaximo}</span></div>
    </div>
   </div>
   
   <!-- Estatísticas -->
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
   
   <!-- Seleção de Nível -->
   <div style="margin-bottom: 20px;">
    <label style="display: block; margin-bottom: 8px; color: #ffd700; font-weight: bold;">
     Níveis acima da base (${nhBase}):
    </label>
    <select id="select-niveis-tecnica"
      style="width: 100%; padding: 12px; border-radius: 5px; border: 2px solid #ff8c00;
        background: #2c3e50; color: #ffd700; font-size: 16px; cursor: pointer;">
     ${opcoesHTML}
    </select>
    <div style="font-size: 12px; color: #95a5a6; margin-top: 5px;">
     Cada nível comprado aumenta seu NH na técnica em +1
    </div>
   </div>
   
   <!-- Custo -->
   <div style="background: rgba(39, 174, 96, 0.1); padding: 15px; border-radius: 5px;
      border-left: 4px solid #27ae60; margin-bottom: 20px;">
    <div style="font-size: 12px; color: #95a5a6;">Custo Total</div>
    <div id="custo-display" style="font-size: 28px; font-weight: bold; color: #27ae60;">
     ${custoTotal} pontos
    </div>
    <div style="font-size: 12px; color: #95a5a6; margin-top: 5px;">
     Custo para evoluir: ~1 ponto por nível (técnica ${tecnica.dificuldade})
    </div>
   </div>
   
   <!-- Descrição -->
   <div style="margin-bottom: 15px;">
    <h4 style="color: #ffd700; margin-bottom: 10px;">Descrição</h4>
    <p style="line-height: 1.5;">${tecnica.descricao}</p>
   </div>
   
   <!-- Regras -->
   <div style="background: rgba(155, 89, 182, 0.1); padding: 15px; border-radius: 5px;
      border-left: 4px solid #9b59b6;">
    <h5 style="color: #9b59b6; margin-top: 0; margin-bottom: 10px;">
     <i class="fas fa-info-circle"></i> Regras da Técnica
    </h5>
    <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px;">
     <li>Base: NH em Arco - 4</li>
     <li>Pode comprar níveis adicionais acima da base</li>
     <li>NUNCA pode exceder seu NH em Arco (${nhArco})</li>
     <li>Penalidades para disparar montado não reduzem abaixo do NH nesta técnica</li>
     <li>Se seu NH em Arco aumentar, o NH desta técnica também aumenta automaticamente</li>
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

 // Inserir modal
 const modal = document.querySelector('.modal-tecnica');
 if (!modal) {
  console.error("Modal não encontrado!");
  return;
 }

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

// ===== COMPRAR/ATUALIZAR TÉCNICA =====
function comprarTecnica() {
 if (!estadoTecnicas.tecnicaSelecionada) {
  alert("Erro: Nenhuma técnica selecionada!");
  return;
 }

 const select = document.getElementById('select-niveis-tecnica');
 if (!select) {
  alert("Erro: Seletor não encontrado!");
  return;
 }

 const niveisComprados = parseInt(select.value);
 const custo = calcularCustoTecnica(niveisComprados, estadoTecnicas.tecnicaSelecionada.dificuldade);

 const tecnicaId = estadoTecnicas.tecnicaSelecionada.id;
 const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnicaId);

 // Salvar valores atuais como referência
 const dxAtual = obterDXAtual();
 const nivelArco = obterNivelPericiaPorId('arco');
 const nhArcoReferencia = dxAtual + nivelArco;

 if (index >= 0) {
  // Atualizar técnica existente
  estadoTecnicas.tecnicasAprendidas[index] = {
   ...estadoTecnicas.tecnicasAprendidas[index],
   niveisComprados: niveisComprados,
   custoTotal: custo,
   dataAtualizacao: new Date().toISOString(),
   dxReferencia: dxAtual,
   nivelArcoReferencia: nivelArco,
   nhArcoReferencia: nhArcoReferencia
  };
 } else {
  // Nova técnica
  estadoTecnicas.tecnicasAprendidas.push({
   id: tecnicaId,
   nome: estadoTecnicas.tecnicaSelecionada.nome,
   dificuldade: estadoTecnicas.tecnicaSelecionada.dificuldade,
   niveisComprados: niveisComprados,
   custoTotal: custo,
   dataAquisicao: new Date().toISOString(),
   baseCalculo: estadoTecnicas.tecnicaSelecionada.baseCalculo,
   dxReferencia: dxAtual,
   nivelArcoReferencia: nivelArco,
   nhArcoReferencia: nhArcoReferencia
  });
 }

 // Salvar no localStorage
 salvarTecnicas();

 // Atualizar tudo
 atualizarTecnicasDisponiveis();
 renderizarTecnicasAprendidas();
 atualizarEstatisticasTecnicas();

 // Fechar modal
 fecharModalTecnica();

 // Mensagem
 alert(`✅ ${estadoTecnicas.tecnicaSelecionada.nome} ${index >= 0 ? 'atualizada' : 'aprendida'} com sucesso!\n\nNH: ${nhArcoReferencia} (Arco) - 4 + ${niveisComprados} = ${nhArcoReferencia - 4 + niveisComprados}`);
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
  // Calcular NH atual EM TEMPO REAL
  const dxAtual = obterDXAtual();
  const nivelArco = obterNivelPericiaPorId('arco');
  const nhArco = dxAtual + nivelArco;
  const nhBase = nhArco - 4;
  const nhAtual = nhBase + (tecnica.niveisComprados || 0);
  
  // Verificar se excede limite
  const excedeLimite = nhAtual > nhArco;
  
  // Calcular quanto da referência mudou
  const diferencaDX = dxAtual - (tecnica.dxReferencia || dxAtual);
  const diferencaNivelArco = nivelArco - (tecnica.nivelArcoReferencia || nivelArco);
  
  html += `
   <div class="pericia-aprendida-item" style="background: rgba(155, 89, 182, 0.15); border-color: ${excedeLimite ? '#e74c3c' : 'rgba(155, 89, 182, 0.4)'}; border-width: 2px;">
    <div class="pericia-aprendida-header">
     <h4 class="pericia-aprendida-nome">
      ${tecnica.nome}
      ${excedeLimite ? '<span style="color: #e74c3c; margin-left: 5px; font-size: 0.8em;">⚠️ EXCEDE LIMITE!</span>' : ''}
     </h4>
     <div class="pericia-aprendida-info">
      <span class="pericia-aprendida-nivel" style="color: ${excedeLimite ? '#e74c3c' : '#f39c12'};">NH ${nhAtual}</span>
      <span class="pericia-aprendida-custo">${tecnica.custoTotal || 0} pts</span>
     </div>
    </div>
    
    <div style="font-size: 13px; color: #95a5a6; margin-top: 5px;">
     <div><strong>Níveis comprados:</strong> ${tecnica.niveisComprados || 0}</div>
     <div><strong>Cálculo atual:</strong> ${dxAtual} (DX) + ${nivelArco >= 0 ? '+' : ''}${nivelArco} (Arco) = ${nhArco} → ${nhArco} - 4 + ${tecnica.niveisComprados || 0} = ${nhAtual}</div>
     <div><strong>Limite máximo:</strong> ${nhArco} (NH Arco)</div>
     ${diferencaDX !== 0 || diferencaNivelArco !== 0 ? `
     <div style="color: #f39c12; font-size: 12px;">
      <i class="fas fa-arrow-up"></i> Aumentou desde a compra: DX ${diferencaDX >= 0 ? '+' : ''}${diferencaDX}, Arco ${diferencaNivelArco >= 0 ? '+' : ''}${diferencaNivelArco}
     </div>
     ` : ''}
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
 if (confirm('Tem certeza que deseja remover esta técnica? Os pontos serão perdidos.')) {
  estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
  salvarTecnicas();
  atualizarTecnicasDisponiveis();
  renderizarTecnicasAprendidas();
  atualizarEstatisticasTecnicas();
 }
}

// ===== ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticasTecnicas() {
 // Zerar contadores
 estadoTecnicas.pontosTecnicasTotal = 0;
 estadoTecnicas.pontosMedio = 0;
 estadoTecnicas.pontosDificil = 0;
 estadoTecnicas.qtdMedio = 0;
 estadoTecnicas.qtdDificil = 0;

 // Calcular
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

 // Badge total
 const badge = document.getElementById('pontos-tecnicas-total');
 if (badge) {
  badge.textContent = `[${estadoTecnicas.pontosTecnicasTotal} pts]`;
 }
}

// ===== FECHAR MODAL =====
function fecharModalTecnica() {
 const modal = document.querySelector('.modal-tecnica-overlay');
 if (modal) {
  modal.style.display = 'none';
 }
 estadoTecnicas.modalAberto = false;
 estadoTecnicas.tecnicaSelecionada = null;
}

// ===== SALVAR/CARREGAR =====
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
   console.log(` Carregadas ${estadoTecnicas.tecnicasAprendidas.length} técnicas`);
  }
 } catch (e) {
  console.error("Erro ao carregar técnicas:", e);
 }
}

// ===== CONFIGURAR EVENTOS =====
function configurarEventListenersTecnicas() {
 // Filtros
 document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
  btn.addEventListener('click', function() {
   const filtro = this.getAttribute('data-filtro');
   estadoTecnicas.filtroAtivo = filtro;
   
   // Atualizar botões ativos
   document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => {
    b.classList.remove('active');
   });
   this.classList.add('active');
   
   renderizarCatalogoTecnicas();
  });
 });

 // Busca
 const buscaInput = document.getElementById('busca-tecnicas');
 if (buscaInput) {
  buscaInput.addEventListener('input', function() {
   estadoTecnicas.buscaAtiva = this.value;
   renderizarCatalogoTecnicas();
  });
 }

 // Fechar modal ao clicar fora
 document.addEventListener('click', function(e) {
  if (estadoTecnicas.modalAberto && e.target.classList.contains('modal-tecnica-overlay')) {
   fecharModalTecnica();
  }
 });

 // Fechar com ESC
 document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && estadoTecnicas.modalAberto) {
   fecharModalTecnica();
  }
 });
}

// ===== OBSERVAR MUDANÇAS =====
function observarMudancas() {
 // Atualizar quando perícias mudam
 if (window.estadoPericias) {
  // Observar mudanças no localStorage (simples)
  let ultimoEstado = JSON.stringify(window.estadoPericias.periciasAprendidas);
  
  setInterval(() => {
   if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
    const novoEstado = JSON.stringify(window.estadoPericias.periciasAprendidas);
    if (novoEstado !== ultimoEstado) {
     console.log(" Perícias alteradas, atualizando técnicas...");
     ultimoEstado = novoEstado;
     atualizarTecnicasDisponiveis();
     renderizarTecnicasAprendidas();
    }
   }
  }, 1000);
 }
 
 // Atualizar quando DX muda
 let ultimoDX = obterDXAtual();
 setInterval(() => {
  const dxAtual = obterDXAtual();
  if (dxAtual !== ultimoDX) {
   console.log(` DX alterado: ${ultimoDX} → ${dxAtual}, atualizando técnicas...`);
   ultimoDX = dxAtual;
   atualizarTecnicasDisponiveis();
   renderizarTecnicasAprendidas();
  }
 }, 1000);
}

// ===== INICIALIZAR =====
function inicializarSistemaTecnicas() {
 console.log(" INICIALIZANDO SISTEMA DE TÉCNICAS");

 // 1. Carregar técnicas salvas
 carregarTecnicas();

 // 2. Configurar eventos
 configurarEventListenersTecnicas();

 // 3. Observar mudanças
 observarMudancas();

 // 4. Inicializar
 setTimeout(() => {
  atualizarTecnicasDisponiveis();
  renderizarTecnicasAprendidas();
  atualizarEstatisticasTecnicas();
  console.log("✅ SISTEMA DE TÉCNICAS INICIALIZADO!");
 }, 500);
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
 // Esperar que a aba de perícias carregue
 const verificarAba = setInterval(() => {
  const abaPericias = document.getElementById('pericias');
  if (abaPericias && abaPericias.style.display !== 'none') {
   clearInterval(verificarAba);
   
   // Esperar um pouco mais para garantir que tudo carregou
   setTimeout(() => {
    if (!window.sistemaTecnicasInicializado) {
     inicializarSistemaTecnicas();
     window.sistemaTecnicasInicializado = true;
    }
   }, 1000);
  }
 }, 500);

 // Observar mudança de abas
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
      // Já inicializado, apenas atualizar
      atualizarTecnicasDisponiveis();
      renderizarTecnicasAprendidas();
     }
    }
   }
  });
 });

 // Observar a aba de perícias
 const abaPericias = document.getElementById('pericias');
 if (abaPericias) {
  observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
 }
});

// ===== EXPORTAR FUNÇÕES =====
window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

console.log(" Módulo de técnicas carregado e pronto!");