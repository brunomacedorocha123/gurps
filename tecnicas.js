// ===== SISTEMA DE TÉCNICAS - VERSÃO CORRIGIDA (NH REAL) =====
console.log(" INICIANDO SISTEMA DE TÉCNICAS - NH REAL");

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
  // Difícil: 2,3,4,5,6... (média ~1 ponto por nível)
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
  return niveisAcima + 1; // Padrão: n+1
 }

 if (dificuldade === 'Média') {
  // Média: 1,2,3,4,5... (1 ponto por nível)
  return niveisAcima;
 }

 return 0;
}

// ===== FUNÇÃO CRÍTICA: OBTER NH REAL DA PERÍCIA =====
function obterNHPericiaPorId(idPericia) {
 console.log(" Buscando NH real para:", idPericia);
 
 // Se não existir o sistema de perícias, usar fallback
 if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
  console.warn("⚠️ Sistema de perícias não carregado, usando fallback");
  return 10; // Fallback
 }
 
 // Buscar a perícia de Arco
 if (idPericia === 'arco') {
  const periciaArco = window.estadoPericias.periciasAprendidas.find(p => p.id === 'arco');
  
  if (periciaArco) {
   // Obter DX ATUAL
   const atributoBase = window.obterAtributoAtual ? window.obterAtributoAtual('DX') : 10;
   
   // Calcular NH REAL = DX + Nível
   const nh = atributoBase + periciaArco.nivel;
   console.log(`✅ NH Arco encontrado: DX(${atributoBase}) + Nível(${periciaArco.nivel}) = ${nh}`);
   return nh;
  } else {
   // Arco não aprendido ainda
   const atributoBase = window.obterAtributoAtual ? window.obterAtributoAtual('DX') : 10;
   console.log("⚠️ Arco não aprendido, usando apenas DX:", atributoBase);
   return atributoBase;
  }
 }
 
 // Se for cavalgar
 if (idPericia.includes('cavalgar')) {
  // Procurar qualquer perícia de cavalgar
  const cavalgar = window.estadoPericias.periciasAprendidas.find(p =>
   p.id.includes('cavalgar') || p.nome.includes('Cavalgar')
  );
   
  if (cavalgar) {
   const atributoBase = window.obterAtributoAtual ? window.obterAtributoAtual('DX') : 10;
   const nh = atributoBase + cavalgar.nivel;
   console.log("✅ Cavalgar encontrado:", cavalgar.nome, "NH:", nh);
   return nh;
  }
  
  const atributoBase = window.obterAtributoAtual ? window.obterAtributoAtual('DX') : 10;
  console.log("⚠️ Cavalgar não encontrado, usando DX:", atributoBase);
  return atributoBase;
 }
 
 // Fallback geral
 console.log("❌ Perícia não reconhecida, usando fallback 10");
 return 10;
}

// ===== VERIFICAR SE TEM PRÉ-REQUISITOS =====
function verificarPreRequisitosTecnica(tecnica) {
 console.log(" Verificando pré-requisitos para:", tecnica.nome);

 if (!tecnica.preRequisitos || !window.estadoPericias) {
  console.log("✅ Sem pré-requisitos específicos");
  return { passou: true, motivo: '' };
 }

 // Verificar Arco-4
 const reqArco = tecnica.preRequisitos.find(req => req.idPericia === 'arco');
 if (reqArco) {
  const periciaArco = window.estadoPericias.periciasAprendidas.find(p => p.id === 'arco');
  if (!periciaArco) {
   return {
    passou: false,
    motivo: `❌ Precisa da perícia Arco (nível ${reqArco.nivelMinimo})`
   };
  }
  
  if (periciaArco.nivel < reqArco.nivelMinimo) {
   return {
    passou: false,
    motivo: `❌ Arco precisa ter nível ${reqArco.nivelMinimo} (atual: ${periciaArco.nivel})`
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

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS (CÁLCULO CORRETO) =====
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
  
  // CORREÇÃO 1: Calcular NH base usando NH REAL de Arco
  let nhBase = 0;
  let nhMaximo = 0;
  
  if (tecnica.baseCalculo && tecnica.baseCalculo.idPericia) {
   // Obter NH REAL da perícia (DX + Nível)
   const nhPericia = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
   
   // Calcular NH base da técnica: NH_Pericia + Redutor
   // Exemplo: NH_Arco = 9, Redutor = -4, NH_base = 5
   nhBase = nhPericia + (tecnica.baseCalculo.redutor || 0);
   
   // CORREÇÃO 2: NH máximo é o NH da perícia base
   if (tecnica.limiteMaximo && tecnica.limiteMaximo.idPericia) {
    nhMaximo = obterNHPericiaPorId(tecnica.limiteMaximo.idPericia);
   } else {
    nhMaximo = nhPericia; // Por padrão, não pode exceder o NH da perícia base
   }
   
   // Se já aprendida, adicionar níveis comprados
   if (jaAprendida && jaAprendida.niveisComprados) {
    nhBase += jaAprendida.niveisComprados;
   }
  }
  
  return {
   ...tecnica,
   disponivel: verificacao.passou,
   nhAtual: nhBase,
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
  
  // Obter NH Arco para mostrar informação
  const nhArco = obterNHPericiaPorId('arco');
  const nhBaseCalculado = nhArco - 4;
  
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
     <i class="fas fa-calculator"></i> NH Base: ${nhArco} (Arco) - 4 = ${nhBaseCalculado}
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

// ===== ABRIR MODAL DE COMPRA (CÁLCULO CORRETO) =====
function abrirModalTecnica(tecnica) {
 console.log(" Abrindo modal para:", tecnica.nome);

 estadoTecnicas.tecnicaSelecionada = tecnica;
 const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);

 // CORREÇÃO 3: Obter NH REAL de Arco (DX + Nível)
 const nhArco = obterNHPericiaPorId('arco');
 console.log(`📊 NH Arco usado: ${nhArco}`);
 
 // Calcular NH base da técnica: NH_Arco - 4
 const nhBase = nhArco - 4;
 
 // NH máximo é o NH em Arco (não pode exceder)
 const nhMaximo = nhArco;
 console.log(`📊 NH base técnica: ${nhArco} - 4 = ${nhBase}`);
 console.log(`📊 NH máximo: ${nhMaximo}`);

 // Calcular NH atual (base + níveis comprados)
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
   <!-- Informações da Técnica -->
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
   
   <!-- CÁLCULO DO NH -->
   <div style="background: rgba(41, 128, 185, 0.1); padding: 10px; border-radius: 5px; margin-bottom: 15px; border-left: 3px solid #2980b9;">
    <div style="font-size: 12px; color: #3498db; font-weight: bold;">
     <i class="fas fa-calculator"></i> CÁLCULO DO NH:
    </div>
    <div style="font-size: 13px; margin-top: 3px;">
     NH Base = NH Arco (${nhArco}) - 4 = ${nhBase}
    </div>
   </div>
   
   <!-- Seleção de Nível -->
   <div style="margin-bottom: 20px;">
    <label style="display: block; margin-bottom: 8px; color: #ffd700; font-weight: bold;">
     Níveis acima da base:
    </label>
    <select id="select-niveis-tecnica"
      style="width: 100%; padding: 12px; border-radius: 5px; border: 2px solid #ff8c00;
        background: #2c3e50; color: #ffd700; font-size: 16px; cursor: pointer;">
     ${opcoesHTML}
    </select>
    <div style="font-size: 12px; color: #95a5a6; margin-top: 5px;">
     Cada nível custa aproximadamente 1 ponto (média)
    </div>
   </div>
   
   <!-- Custo -->
   <div style="background: rgba(39, 174, 96, 0.1); padding: 15px; border-radius: 5px;
      border-left: 4px solid #27ae60; margin-bottom: 20px;">
    <div style="font-size: 12px; color: #95a5a6;">Custo Total</div>
    <div id="custo-display" style="font-size: 28px; font-weight: bold; color: #27ae60;">
     ${custoTotal} pontos
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
     <i class="fas fa-info-circle"></i> Regras Importantes
    </h5>
    <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px;">
     <li>NH base = NH em Arco - 4 (pré-definido)</li>
     <li>Pode comprar níveis adicionais acima da base</li>
     <li>O NH nesta técnica NUNCA pode exceder o NH em Arco</li>
     <li>Penalidades para disparar montado não reduzem abaixo do NH nesta técnica</li>
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

 if (index >= 0) {
  // Atualizar técnica existente
  estadoTecnicas.tecnicasAprendidas[index] = {
   ...estadoTecnicas.tecnicasAprendidas[index],
   niveisComprados: niveisComprados,
   custoTotal: custo,
   dataAtualizacao: new Date().toISOString()
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
   nhArcoReferencia: obterNHPericiaPorId('arco') // Salvar referência do NH Arco atual
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
 alert(`✅ ${estadoTecnicas.tecnicaSelecionada.nome} ${index >= 0 ? 'atualizada' : 'aprendida'} com sucesso!`);
}

// ===== RENDERIZAR TÉCNICAS APRENDIDAS (CÁLCULO CORRETO) =====
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
  // CORREÇÃO 4: Calcular NH atual usando NH REAL de Arco
  const nhArco = obterNHPericiaPorId('arco');
  const nhBase = nhArco - 4; // Sempre Arco-4
  const nhAtual = nhBase + (tecnica.niveisComprados || 0);
  
  // Verificar se excede o limite máximo
  const excedeLimite = nhAtual > nhArco;
  
  html += `
   <div class="pericia-aprendida-item" style="background: rgba(155, 89, 182, 0.15); border-color: rgba(155, 89, 182, 0.4); ${excedeLimite ? 'border-color: #e74c3c !important;' : ''}">
    <div class="pericia-aprendida-header">
     <h4 class="pericia-aprendida-nome">
      ${tecnica.nome}
      ${excedeLimite ? '<span style="color: #e74c3c; margin-left: 5px; font-size: 0.8em;">⚠️ EXCEDE LIMITE!</span>' : ''}
     </h4>
     <div class="pericia-aprendida-info">
      <span class="pericia-aprendida-nivel">NH ${nhAtual}</span>
      <span class="pericia-aprendida-custo">${tecnica.custoTotal || 0} pts</span>
     </div>
    </div>
    
    <div style="font-size: 13px; color: #95a5a6; margin-top: 5px;">
     <div><strong>Níveis comprados:</strong> ${tecnica.niveisComprados || 0}</div>
     <div><strong>Cálculo:</strong> ${nhArco} (NH Arco) - 4 + ${tecnica.niveisComprados || 0} = ${nhAtual}</div>
     <div><strong>Limite máximo (NH Arco):</strong> ${nhArco}</div>
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

// ===== OBSERVAR MUDANÇAS NAS PERÍCIAS =====
function observarMudancasPericias() {
 // Atualizar técnicas sempre que as perícias mudarem
 if (window.estadoPericias) {
  const observer = new MutationObserver(function() {
   console.log(" Perícias alteradas, atualizando técnicas...");
   atualizarTecnicasDisponiveis();
   renderizarTecnicasAprendidas();
  });
  
  // Observar mudanças no estado das perícias
  const verificarMudancas = () => {
   if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
    atualizarTecnicasDisponiveis();
   }
  };
  
  setInterval(verificarMudancas, 1000);
 }
}

// ===== INICIALIZAR =====
function inicializarSistemaTecnicas() {
 console.log(" INICIALIZANDO SISTEMA DE TÉCNICAS - NH REAL");

 // 1. Carregar técnicas salvas
 carregarTecnicas();

 // 2. Configurar eventos
 configurarEventListenersTecnicas();

 // 3. Observar mudanças nas perícias
 observarMudancasPericias();

 // 4. Inicializar
 setTimeout(() => {
  atualizarTecnicasDisponiveis();
  renderizarTecnicasAprendidas();
  atualizarEstatisticasTecnicas();
  console.log("✅ SISTEMA DE TÉCNICAS INICIALIZADO COM CÁLCULOS CORRETOS!");
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

// ===== EXPORTAR FUNÇÕES =====
window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

console.log(" Módulo de técnicas carregado e pronto com cálculos corrigidos!");