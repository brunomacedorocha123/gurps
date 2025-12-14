// ============================================
// SISTEMA COMPLETO DE PERÍCIAS NO RESUMO
// Versão: 1.0 - Completa e Funcional
// ============================================

console.log('🎯 SISTEMA COMPLETO DE PERÍCIAS - INICIANDO');

// ============================================
// 1. CONFIGURAÇÃO E ESTADO
// ============================================

const sistemaPericias = {
  // Estado do sistema
  estado: {
    inicializado: false,
    carregando: false,
    ultimaAtualizacao: null,
    intervaloAtualizacao: null,
    
    // Cache de dados
    cachePericias: [],
    cacheTecnicas: [],
    cachePontosPericias: 0,
    cachePontosTecnicas: 0,
    
    // Configurações
    atualizarAutomaticamente: true,
    intervaloAuto: 30000, // 30 segundos
    debugMode: true
  },
  
  // Elementos DOM
  elementos: {
    tabelaPericias: null,
    listaTecnicas: null,
    containerResumo: null,
    pontosPericiasElem: null,
    pontosTecnicasElem: null
  },
  
  // Estatísticas
  stats: {
    atualizacoes: 0,
    erros: 0,
    periciasCapturadas: 0,
    tecnicasCapturadas: 0
  }
};

// ============================================
// 2. INICIALIZAÇÃO COMPLETA
// ============================================

function inicializarSistemaCompleto() {
  if (sistemaPericias.estado.inicializado) {
    console.log('⚠️ Sistema já inicializado');
    return;
  }
  
  console.log('🚀 INICIALIZANDO SISTEMA COMPLETO...');
  
  try {
    // 1. Localizar todos os elementos necessários
    localizarElementosDOM();
    
    // 2. Criar elementos se não existirem
    criarElementosSeNecessario();
    
    // 3. Aplicar estilos CSS
    aplicarEstilosCompletos();
    
    // 4. Primeira captura de dados
    realizarCapturaCompleta();
    
    // 5. Configurar eventos
    configurarEventosCompletos();
    
    // 6. Iniciar monitoramento controlado
    iniciarMonitoramentoControlado();
    
    sistemaPericias.estado.inicializado = true;
    sistemaPericias.stats.atualizacoes++;
    
    console.log('✅ SISTEMA COMPLETO INICIALIZADO COM SUCESSO!');
    console.log(`📊 Status: ${sistemaPericias.stats.periciasCapturadas} perícias, ${sistemaPericias.stats.tecnicasCapturadas} técnicas`);
    
  } catch (error) {
    console.error('❌ ERRO NA INICIALIZAÇÃO:', error);
    sistemaPericias.stats.erros++;
  }
}

// ============================================
// 3. LOCALIZAR ELEMENTOS DOM
// ============================================

function localizarElementosDOM() {
  console.log('🔍 Localizando elementos DOM...');
  
  // Elementos do resumo
  sistemaPericias.elementos.containerResumo = document.querySelector('#resumo, [data-tab="resumo"], .resumo-tab');
  
  // Elementos de pontos
  sistemaPericias.elementos.pontosPericiasElem = document.querySelector('#pontosPericias, .pontos-pericias, [data-pontos-pericias]');
  sistemaPericias.elementos.pontosTecnicasElem = document.querySelector('#pontosTecnicas, .pontos-tecnicas, [data-pontos-tecnicas]');
  
  // Tabela de perícias (existente ou criar)
  sistemaPericias.elementos.tabelaPericias = document.getElementById('tabelaPericiasResumoCompleta');
  
  // Lista de técnicas (existente ou criar)
  sistemaPericias.elementos.listaTecnicas = document.getElementById('listaTecnicasResumoCompleta');
  
  console.log('✅ Elementos localizados');
}

// ============================================
// 4. CRIAR ELEMENTOS SE NECESSÁRIO
// ============================================

function criarElementosSeNecessario() {
  console.log('🏗️ Criando elementos se necessário...');
  
  const container = sistemaPericias.elementos.containerResumo;
  if (!container) {
    console.error('❌ Container do resumo não encontrado');
    return;
  }
  
  // Criar seção de perícias se não existir
  if (!sistemaPericias.elementos.tabelaPericias) {
    console.log('📝 Criando tabela de perícias...');
    
    const htmlPericias = `
      <div class="resumo-pericias-card" id="resumoPericiasCard">
        <div class="resumo-card-header">
          <h4 class="resumo-card-title">
            <i class="resumo-icon">🎯</i>
            Perícias Aprendidas
            <span class="resumo-badge" id="contadorPericias">0</span>
          </h4>
          <div class="resumo-card-actions">
            <button class="resumo-btn-refresh" onclick="sistemaPericias.atualizar(true)" title="Atualizar">
              <i>🔄</i>
            </button>
            <button class="resumo-btn-toggle" onclick="sistemaPericias.toggleAutoUpdate()" title="Auto-atualização">
              <i id="autoUpdateIcon">⏸️</i>
            </button>
          </div>
        </div>
        <div class="resumo-card-body">
          <div class="resumo-table-container">
            <table class="resumo-table pericias-table">
              <thead>
                <tr>
                  <th class="th-nome">Perícia</th>
                  <th class="th-pontos">Pontos</th>
                  <th class="th-nh">NH</th>
                  <th class="th-acoes">Ações</th>
                </tr>
              </thead>
              <tbody id="tabelaPericiasResumoCompleta">
                <tr class="loading-row">
                  <td colspan="4" class="loading-cell">
                    <div class="loading-spinner"></div>
                    Carregando perícias...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="resumo-footer">
            <div class="resumo-total">
              <span class="total-label">Total de pontos:</span>
              <span class="total-value" id="totalPontosPericias">0</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', htmlPericias);
    sistemaPericias.elementos.tabelaPericias = document.getElementById('tabelaPericiasResumoCompleta');
  }
  
  // Criar seção de técnicas se não existir
  if (!sistemaPericias.elementos.listaTecnicas) {
    console.log('📝 Criando lista de técnicas...');
    
    const htmlTecnicas = `
      <div class="resumo-tecnicas-card" id="resumoTecnicasCard">
        <div class="resumo-card-header">
          <h4 class="resumo-card-title">
            <i class="resumo-icon">⚔️</i>
            Técnicas Aprendidas
            <span class="resumo-badge" id="contadorTecnicas">0</span>
          </h4>
        </div>
        <div class="resumo-card-body">
          <div class="tecnicas-list-container" id="listaTecnicasResumoCompleta">
            <div class="loading-tecnica">
              <div class="loading-spinner small"></div>
              Carregando técnicas...
            </div>
          </div>
          <div class="resumo-footer">
            <div class="resumo-total">
              <span class="total-label">Total de pontos:</span>
              <span class="total-value" id="totalPontosTecnicas">0</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', htmlTecnicas);
    sistemaPericias.elementos.listaTecnicas = document.getElementById('listaTecnicasResumoCompleta');
  }
  
  console.log('✅ Elementos criados/verificados');
}

// ============================================
// 5. CAPTURA DE DADOS COMPLETA
// ============================================

function realizarCapturaCompleta() {
  if (sistemaPericias.estado.carregando) {
    console.log('⏳ Captura já em andamento...');
    return;
  }
  
  sistemaPericias.estado.carregando = true;
  console.log('📊 INICIANDO CAPTURA COMPLETA DE DADOS...');
  
  try {
    // Mostrar estado de carregamento
    mostrarEstadoCarregamento(true);
    
    // Capturar dados
    const dadosPericias = capturarPericiasCompletas();
    const dadosTecnicas = capturarTecnicasCompletas();
    
    // Atualizar cache
    sistemaPericias.estado.cachePericias = dadosPericias.pericias;
    sistemaPericias.estado.cacheTecnicas = dadosTecnicas.tecnicas;
    sistemaPericias.estado.cachePontosPericias = dadosPericias.totalPontos;
    sistemaPericias.estado.cachePontosTecnicas = dadosTecnicas.totalPontos;
    
    // Atualizar estatísticas
    sistemaPericias.stats.periciasCapturadas = dadosPericias.pericias.length;
    sistemaPericias.stats.tecnicasCapturadas = dadosTecnicas.tecnicas.length;
    sistemaPericias.stats.atualizacoes++;
    
    // Atualizar interface
    atualizarInterfaceCompleta(dadosPericias, dadosTecnicas);
    
    // Atualizar timestamp
    sistemaPericias.estado.ultimaAtualizacao = new Date();
    
    console.log(`✅ CAPTURA CONCLUÍDA: ${dadosPericias.pericias.length} perícias, ${dadosTecnicas.tecnicas.length} técnicas`);
    
  } catch (error) {
    console.error('❌ ERRO NA CAPTURA:', error);
    sistemaPericias.stats.erros++;
    mostrarErroNaInterface(error);
  } finally {
    sistemaPericias.estado.carregando = false;
    mostrarEstadoCarregamento(false);
  }
}

// ============================================
// 6. CAPTURAR PERÍCIAS COMPLETAS
// ============================================

function capturarPericiasCompletas() {
  console.log('🎯 Capturando perícias...');
  
  const pericias = [];
  let totalPontos = 0;
  
  // MÉTODO 1: Estado global (prioritário)
  if (window.estadoPericias && Array.isArray(window.estadoPericias.periciasAprendidas)) {
    console.log('📦 Usando estadoPericias.periciasAprendidas');
    
    window.estadoPericias.periciasAprendidas.forEach((pericia, index) => {
      if (!pericia || !pericia.nome) return;
      
      // Verificar se é realmente uma perícia (não atributo derivado)
      const nomeLower = pericia.nome.toLowerCase();
      const atributosDerivados = ['esquiva', 'movimento', 'carga', 'pv', 'pe', 'defesa', 'bloqueio', 'dano', 'ataque'];
      
      if (atributosDerivados.some(atributo => nomeLower.includes(atributo))) {
        console.log(`⚠️ Ignorando atributo derivado: ${pericia.nome}`);
        return;
      }
      
      // Calcular NH
      let nh = 10; // Default
      if (pericia.atributo && pericia.nivel !== undefined) {
        const valorAtributo = obterValorAtributo(pericia.atributo);
        nh = valorAtributo + pericia.nivel;
      }
      
      // Calcular pontos
      const pontos = pericia.investimentoAcumulado || pericia.custo || pericia.pontos || 0;
      
      pericias.push({
        id: index,
        nome: pericia.nome,
        pontos: pontos,
        nh: nh,
        atributo: pericia.atributo,
        nivel: pericia.nivel || 0,
        especializacao: pericia.especializacao || null,
        tipo: pericia.tipo || 'geral'
      });
      
      totalPontos += pontos;
    });
    
    if (pericias.length > 0) {
      console.log(`✅ ${pericias.length} perícias do estado global`);
      return { pericias, totalPontos };
    }
  }
  
  // MÉTODO 2: Tabela HTML da aba de perícias
  console.log('🌐 Procurando tabela HTML de perícias...');
  
  // Primeiro, tentar encontrar a aba de perícias (mesmo se não estiver ativa)
  let tabelaPericias = null;
  
  // Procurar em todas as abas
  const todasAbas = document.querySelectorAll('.tab-pane, [data-tab-content]');
  todasAbas.forEach(aba => {
    if (aba.innerHTML && aba.innerHTML.includes('perícia')) {
      const tabelas = aba.querySelectorAll('table');
      tabelas.forEach(t => {
        if (t.textContent.toLowerCase().includes('perícia') || t.textContent.includes('NH')) {
          tabelaPericias = t;
        }
      });
    }
  });
  
  if (tabelaPericias) {
    console.log('📋 Tabela de perícias encontrada');
    
    const linhas = tabelaPericias.querySelectorAll('tr');
    linhas.forEach((linha, index) => {
      const cols = linha.querySelectorAll('td');
      if (cols.length >= 3) {
        const nome = cols[0].textContent.trim();
        
        // Filtrar "Esquiva" e linhas inválidas
        if (nome && nome.length > 2 && !nome.toLowerCase().includes('esquiva')) {
          const pontos = parseInt(cols[1].textContent) || 0;
          const nh = parseInt(cols[2].textContent) || 10;
          
          pericias.push({
            id: index,
            nome: nome,
            pontos: pontos,
            nh: nh,
            atributo: determinarAtributoPeloNome(nome)
          });
          
          totalPontos += pontos;
        }
      }
    });
    
    if (pericias.length > 0) {
      console.log(`✅ ${pericias.length} perícias da tabela HTML`);
      return { pericias, totalPontos };
    }
  }
  
  // MÉTODO 3: localStorage como backup
  console.log('💾 Verificando localStorage...');
  try {
    const saved = localStorage.getItem('periciasPersonagem');
    if (saved) {
      const data = JSON.parse(saved);
      if (Array.isArray(data) && data.length > 0) {
        console.log(`📁 ${data.length} perícias no localStorage`);
        
        data.forEach((item, index) => {
          if (item && item.nome) {
            pericias.push({
              id: index,
              nome: item.nome,
              pontos: item.pontos || 0,
              nh: item.nh || 10,
              atributo: item.atributo || 'IQ'
            });
            
            totalPontos += item.pontos || 0;
          }
        });
        
        return { pericias, totalPontos };
      }
    }
  } catch (e) {
    console.log('⚠️ Erro ao ler localStorage:', e.message);
  }
  
  // MÉTODO 4: Fallback - mostrar mensagem
  console.log('⚠️ Nenhuma perícia encontrada nos métodos principais');
  
  return { pericias: [], totalPontos: 0 };
}

// ============================================
// 7. CAPTURAR TÉCNICAS COMPLETAS
// ============================================

function capturarTecnicasCompletas() {
  console.log('⚔️ Capturando técnicas...');
  
  const tecnicas = [];
  let totalPontos = 0;
  
  // Métodos similares às perícias
  if (window.estadoTecnicas && Array.isArray(window.estadoTecnicas.aprendidas)) {
    window.estadoTecnicas.aprendidas.forEach((tecnica, index) => {
      if (!tecnica || !tecnica.nome) return;
      
      tecnicas.push({
        id: index,
        nome: tecnica.nome,
        pontos: tecnica.custoTotal || tecnica.custo || 0,
        nh: calcularNHTecnica(tecnica)
      });
      
      totalPontos += tecnica.custoTotal || tecnica.custo || 0;
    });
    
    if (tecnicas.length > 0) {
      console.log(`✅ ${tecnicas.length} técnicas do estado global`);
      return { tecnicas, totalPontos };
    }
  }
  
  // Outros métodos de captura...
  
  return { tecnicas: [], totalPontos: 0 };
}

// ============================================
// 8. ATUALIZAR INTERFACE COMPLETA
// ============================================

function atualizarInterfaceCompleta(dadosPericias, dadosTecnicas) {
  console.log('🎨 Atualizando interface completa...');
  
  try {
    // 1. Atualizar tabela de perícias
    if (sistemaPericias.elementos.tabelaPericias) {
      atualizarTabelaPericiasCompleta(dadosPericias.pericias);
    }
    
    // 2. Atualizar lista de técnicas
    if (sistemaPericias.elementos.listaTecnicas) {
      atualizarListaTecnicasCompleta(dadosTecnicas.tecnicas);
    }
    
    // 3. Atualizar totais
    atualizarTotaisCompletos(dadosPericias.totalPontos, dadosTecnicas.totalPontos);
    
    // 4. Atualizar contadores
    document.getElementById('contadorPericias').textContent = dadosPericias.pericias.length;
    document.getElementById('contadorTecnicas').textContent = dadosTecnicas.tecnicas.length;
    
    // 5. Atualizar timestamp
    atualizarTimestamp();
    
    console.log('✅ Interface atualizada com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar interface:', error);
  }
}

function atualizarTabelaPericiasCompleta(pericias) {
  const tbody = sistemaPericias.elementos.tabelaPericias;
  if (!tbody) return;
  
  if (!pericias || pericias.length === 0) {
    tbody.innerHTML = `
      <tr class="vazio-row">
        <td colspan="4" class="vazio-cell">
          <div class="vazio-message">
            <i>📭</i>
            <div>Nenhuma perícia aprendida</div>
            <small>Vá para a aba de Perícias para adicionar</small>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  let html = '';
  
  pericias.forEach((pericia, index) => {
    const isPar = index % 2 === 0;
    
    html += `
      <tr class="pericia-row ${isPar ? 'row-par' : 'row-impar'}" data-pericia-id="${pericia.id}">
        <td class="td-nome" title="${pericia.nome}">
          <div class="pericia-nome-container">
            <span class="pericia-nome-text">${pericia.nome}</span>
            ${pericia.especializacao ? `<span class="pericia-especializacao">${pericia.especializacao}</span>` : ''}
          </div>
          ${pericia.atributo ? `<small class="pericia-atributo">${pericia.atributo}</small>` : ''}
        </td>
        <td class="td-pontos">
          <span class="pontos-badge">${pericia.pontos}</span>
        </td>
        <td class="td-nh">
          <span class="nh-badge">${pericia.nh}</span>
        </td>
        <td class="td-acoes">
          <button class="btn-acao" onclick="sistemaPericias.detalhesPericia(${pericia.id})" title="Detalhes">
            <i>🔍</i>
          </button>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
}

function atualizarListaTecnicasCompleta(tecnicas) {
  const container = sistemaPericias.elementos.listaTecnicas;
  if (!container) return;
  
  if (!tecnicas || tecnicas.length === 0) {
    container.innerHTML = `
      <div class="vazio-tecnica">
        <i>⚔️</i>
        <div>Nenhuma técnica aprendida</div>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  tecnicas.forEach((tecnica, index) => {
    html += `
      <div class="tecnica-item" data-tecnica-id="${tecnica.id}">
        <div class="tecnica-info">
          <div class="tecnica-nome">${tecnica.nome}</div>
        </div>
        <div class="tecnica-stats">
          <span class="tecnica-pontos">${tecnica.pontos}</span>
          <span class="tecnica-nh">NH ${tecnica.nh}</span>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function atualizarTotaisCompletos(pontosPericias, pontosTecnicas) {
  // Atualizar totais nos cards
  document.getElementById('totalPontosPericias').textContent = pontosPericias;
  document.getElementById('totalPontosTecnicas').textContent = pontosTecnicas;
  
  // Atualizar elementos de pontos gerais
  if (sistemaPericias.elementos.pontosPericiasElem) {
    sistemaPericias.elementos.pontosPericiasElem.textContent = pontosPericias;
  }
  
  if (sistemaPericias.elementos.pontosTecnicasElem) {
    sistemaPericias.elementos.pontosTecnicasElem.textContent = pontosTecnicas;
  }
}

function atualizarTimestamp() {
  const agora = new Date();
  const formatado = agora.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  const timestampElem = document.getElementById('ultimaAtualizacao');
  if (!timestampElem) {
    // Criar elemento se não existir
    const footer = document.querySelector('.resumo-pericias-card .resumo-footer');
    if (footer) {
      footer.insertAdjacentHTML('beforeend', `
        <div class="resumo-timestamp">
          <small>Atualizado: <span id="ultimaAtualizacao">${formatado}</span></small>
        </div>
      `);
    }
  } else {
    timestampElem.textContent = formatado;
  }
}

// ============================================
// 9. FUNÇÕES AUXILIARES COMPLETAS
// ============================================

function obterValorAtributo(atributo) {
  // Valores padrão
  const defaults = { 
    DX: 10, IQ: 10, HT: 10, PERC: 10,
    Destreza: 10, Inteligência: 10, Saúde: 10, Percepção: 10
  };
  
  // Procurar no resumo
  const elementos = [
    document.getElementById('resumo' + atributo),
    document.querySelector(`[data-atributo="${atributo}"]`),
    document.querySelector(`.atributo-${atributo.toLowerCase()}`),
    document.querySelector(`.${atributo}-valor`)
  ];
  
  for (const elem of elementos) {
    if (elem) {
      const valor = parseInt(elem.textContent);
      if (!isNaN(valor)) return valor;
    }
  }
  
  return defaults[atributo] || 10;
}

function determinarAtributoPeloNome(nomePericia) {
  const nome = nomePericia.toLowerCase();
  
  if (nome.includes('arco') || nome.includes('esquiva') || nome.includes('cavalgar')) {
    return 'DX';
  } else if (nome.includes('conhecimento') || nome.includes('observar')) {
    return 'IQ';
  } else if (nome.includes('nadar') || nome.includes('correr')) {
    return 'HT';
  } else if (nome.includes('percepção') || nome.includes('intuir')) {
    return 'PERC';
  }
  
  return 'IQ'; // Padrão
}

function calcularNHTecnica(tecnica) {
  // Lógica específica para cada técnica
  if (tecnica.nome && tecnica.nome.includes('Arquearia Montada')) {
    return 12; // Exemplo
  }
  
  return 10; // Default
}

// ============================================
// 10. EVENTOS E MONITORAMENTO
// ============================================

function configurarEventosCompletos() {
  console.log('🎮 Configurando eventos...');
  
  // Evento de clique nas abas
  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.tab-btn, [data-tab]');
    if (tabBtn) {
      const tabId = tabBtn.dataset.tab || tabBtn.id;
      
      if (tabId === 'resumo') {
        // Quando clicar na aba resumo
        console.log('🎯 Aba resumo clicada');
        setTimeout(() => {
          if (sistemaPericias.estado.atualizarAutomaticamente) {
            realizarCapturaCompleta();
          }
        }, 500);
      } else if (tabId === 'pericias') {
        // Quando clicar na aba perícias (ou sair dela)
        console.log('📋 Aba perícias clicada - atualizando em 2 segundos');
        setTimeout(() => {
          realizarCapturaCompleta();
        }, 2000);
      }
    }
  });
  
  // Observar mudanças no DOM da aba de perícias
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Verificar se a mudança foi na aba de perícias
        const target = mutation.target;
        if (target.id === 'pericias' || 
            target.classList.contains('pericias-container') ||
            target.querySelector('.pericia-item')) {
          
          console.log('🔄 Mudança detectada na aba de perícias');
          
          // Esperar um pouco e atualizar
          setTimeout(() => {
            if (sistemaPericias.estado.atualizarAutomaticamente) {
              realizarCapturaCompleta();
            }
          }, 1000);
        }
      }
    });
  });
  
  // Iniciar observação
  const periciasContainer = document.getElementById('pericias');
  if (periciasContainer) {
    observer.observe(periciasContainer, {
      childList: true,
      subtree: true
    });
    console.log('👁️ Observador de mudanças configurado');
  }
  
  // Eventos personalizados
  document.addEventListener('periciasAlteradas', () => {
    console.log('📢 Evento periciasAlteradas recebido');
    realizarCapturaCompleta();
  });
}

function iniciarMonitoramentoControlado() {
  console.log('⏱️ Iniciando monitoramento controlado...');
  
  // Limpar intervalo anterior se existir
  if (sistemaPericias.estado.intervaloAtualizacao) {
    clearInterval(sistemaPericias.estado.intervaloAtualizacao);
  }
  
  // Configurar novo intervalo (apenas quando na aba resumo)
  sistemaPericias.estado.intervaloAtualizacao = setInterval(() => {
    const estaNoResumo = document.querySelector('#resumo.active, [data-tab="resumo"].active');
    
    if (estaNoResumo && sistemaPericias.estado.atualizarAutomaticamente) {
      const agora = Date.now();
      const ultima = sistemaPericias.estado.ultimaAtualizacao ? 
        sistemaPericias.estado.ultimaAtualizacao.getTime() : 0;
      
      // Atualizar apenas se passou mais de 30 segundos
      if (agora - ultima > sistemaPericias.estado.intervaloAuto) {
        console.log('⏰ Atualização periódica no resumo');
        realizarCapturaCompleta();
      }
    }
  }, 10000); // Verificar a cada 10 segundos
}

// ============================================
// 11. FUNÇÕES DE CONTROLE
// ============================================

sistemaPericias.atualizar = function(forcar = false) {
  console.log('🔄 Solicitando atualização...');
  
  if (forcar) {
    sistemaPericias.estado.ultimaAtualizacao = null;
  }
  
  realizarCapturaCompleta();
  return 'Atualização solicitada';
};

sistemaPericias.toggleAutoUpdate = function() {
  sistemaPericias.estado.atualizarAutomaticamente = !sistemaPericias.estado.atualizarAutomaticamente;
  
  const icon = document.getElementById('autoUpdateIcon');
  if (icon) {
    icon.textContent = sistemaPericias.estado.atualizarAutomaticamente ? '▶️' : '⏸️';
  }
  
  console.log(`Auto-atualização: ${sistemaPericias.estado.atualizarAutomaticamente ? 'LIGADA' : 'DESLIGADA'}`);
  return sistemaPericias.estado.atualizarAutomaticamente;
};

sistemaPericias.detalhesPericia = function(id) {
  const pericia = sistemaPericias.estado.cachePericias.find(p => p.id === id);
  if (pericia) {
    console.log('🔍 Detalhes da perícia:', pericia);
    alert(`Perícia: ${pericia.nome}\nPontos: ${pericia.pontos}\nNH: ${pericia.nh}\nAtributo: ${pericia.atributo}`);
  }
};

sistemaPericias.estatisticas = function() {
  console.log('📊 ESTATÍSTICAS DO SISTEMA:');
  console.log('- Atualizações:', sistemaPericias.stats.atualizacoes);
  console.log('- Erros:', sistemaPericias.stats.erros);
  console.log('- Perícias capturadas:', sistemaPericias.stats.periciasCapturadas);
  console.log('- Técnicas capturadas:', sistemaPericias.stats.tecnicasCapturadas);
  console.log('- Última atualização:', sistemaPericias.estado.ultimaAtualizacao);
  console.log('- Auto-atualização:', sistemaPericias.estado.atualizarAutomaticamente);
  
  return sistemaPericias.stats;
};

// ============================================
// 12. FUNÇÕES DE UI
// ============================================

function mostrarEstadoCarregamento(carregando) {
  const loadingRows = document.querySelectorAll('.loading-row, .loading-tecnica');
  loadingRows.forEach(row => {
    row.style.display = carregando ? 'table-row' : 'none';
  });
  
  const refreshBtn = document.querySelector('.resumo-btn-refresh');
  if (refreshBtn) {
    refreshBtn.disabled = carregando;
    refreshBtn.innerHTML = carregando ? 
      '<div class="mini-spinner"></div>' : 
      '<i>🔄</i>';
  }
}

function mostrarErroNaInterface(error) {
  const errorHtml = `
    <tr class="error-row">
      <td colspan="4" class="error-cell">
        <div class="error-message">
          <i>❌</i>
          <div>Erro ao carregar perícias</div>
          <small>${error.message || 'Erro desconhecido'}</small>
          <button onclick="sistemaPericias.atualizar(true)" class="btn-try-again">
            Tentar novamente
          </button>
        </div>
      </td>
    </tr>
  `;
  
  if (sistemaPericias.elementos.tabelaPericias) {
    sistemaPericias.elementos.tabelaPericias.innerHTML = errorHtml;
  }
}

// ============================================
// 13. ESTILOS CSS COMPLETOS
// ============================================

function aplicarEstilosCompletos() {
  const styleId = 'resumo-pericias-estilos-completos';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* ===== CARD DE RESUMO ===== */
    .resumo-pericias-card, .resumo-tecnicas-card {
      background: linear-gradient(135deg, rgba(30, 30, 40, 0.9), rgba(20, 20, 30, 0.95));
      border-radius: 12px;
      border: 1px solid rgba(255, 140, 0, 0.3);
      margin: 15px 0;
      padding: 0;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    
    .resumo-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 15px;
      background: rgba(255, 140, 0, 0.15);
      border-bottom: 1px solid rgba(255, 140, 0, 0.2);
    }
    
    .resumo-card-title {
      margin: 0;
      font-size: 1rem;
      color: #ff8c00;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .resumo-icon {
      font-size: 1.1rem;
    }
    
    .resumo-badge {
      background: rgba(255, 140, 0, 0.3);
      color: #ffd700;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: bold;
    }
    
    .resumo-card-actions {
      display: flex;
      gap: 5px;
    }
    
    .resumo-btn-refresh, .resumo-btn-toggle {
      background: rgba(255, 140, 0, 0.2);
      border: 1px solid rgba(255, 140, 0, 0.4);
      color: #ff8c00;
      border-radius: 6px;
      padding: 5px 10px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    
    .resumo-btn-refresh:hover, .resumo-btn-toggle:hover {
      background: rgba(255, 140, 0, 0.4);
      transform: translateY(-1px);
    }
    
    .resumo-btn-refresh:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* ===== TABELA ===== */
    .resumo-table-container {
      max-height: 300px;
      overflow-y: auto;
      overflow-x: hidden;
    }
    
    .resumo-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .resumo-table thead {
      position: sticky;
      top: 0;
      background: rgba(40, 40, 50, 0.95);
      z-index: 10;
    }
    
    .resumo-table th {
      padding: 10px 12px;
      text-align: left;
      font-size: 0.85rem;
      color: #aaa;
      font-weight: 600;
      border-bottom: 2px solid rgba(255, 140, 0, 0.3);
    }
    
    .resumo-table th.th-nome { width: 50%; }
    .resumo-table th.th-pontos { width: 15%; text-align: center; }
    .resumo-table th.th-nh { width: 15%; text-align: center; }
    .resumo-table th.th-acoes { width: 10%; text-align: center; }
    
    .resumo-table tbody tr {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.2s;
    }
    
    .resumo-table tbody tr:hover {
      background: rgba(255, 140, 0, 0.1);
    }
    
    .resumo-table tbody tr.row-par {
      background: rgba(255, 255, 255, 0.02);
    }
    
    .resumo-table tbody tr.row-impar {
      background: rgba(255, 255, 255, 0.01);
    }
    
    .resumo-table td {
      padding: 10px 12px;
      vertical-align: middle;
    }
    
    .pericia-nome-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .pericia-nome-text {
      color: #eee;
      font-size: 0.9rem;
      font-weight: 500;
      line-height: 1.3;
    }
    
    .pericia-especializacao {
      background: rgba(155, 89, 182, 0.2);
      color: #9b59b6;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
      align-self: flex-start;
    }
    
    .pericia-atributo {
      color: #888;
      font-size: 0.75rem;
    }
    
    .pontos-badge {
      display: inline-block;
      background: rgba(255, 215, 0, 0.15);
      color: #ffd700;
      padding: 4px 10px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 0.9rem;
      min-width: 40px;
      text-align: center;
    }
    
    .nh-badge {
      display: inline-block;
      background: rgba(46, 204, 113, 0.15);
      color: #2ecc71;
      padding: 4px 10px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 0.9rem;
      min-width: 40px;
      text-align: center;
    }
    
    .btn-acao {
      background: rgba(52, 152, 219, 0.15);
      border: 1px solid rgba(52, 152, 219, 0.3);
      color: #3498db;
      border-radius: 6px;
      padding: 5px 10px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    
    .btn-acao:hover {
      background: rgba(52, 152, 219, 0.3);
      transform: scale(1.05);
    }
    
    /* ===== LISTA DE TÉCNICAS ===== */
    .tecnicas-list-container {
      padding: 10px;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .tecnica-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      margin-bottom: 8px;
      background: rgba(155, 89, 182, 0.1);
      border-radius: 8px;
      border-left: 3px solid #9b59b6;
      transition: all 0.2s;
    }
    
    .tecnica-item:hover {
      background: rgba(155, 89, 182, 0.2);
      transform: translateX(3px);
    }
    
    .tecnica-info {
      flex: 1;
    }
    
    .tecnica-nome {
      color: #eee;
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .tecnica-stats {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    
    .tecnica-pontos {
      color: #ffd700;
      font-weight: bold;
      padding: 4px 10px;
      background: rgba(255, 215, 0, 0.15);
      border-radius: 12px;
      min-width: 40px;
      text-align: center;
    }
    
    .tecnica-nh {
      color: #2ecc71;
      font-weight: bold;
      padding: 4px 10px;
      background: rgba(46, 204, 113, 0.15);
      border-radius: 12px;
      min-width: 50px;
      text-align: center;
    }
    
    /* ===== ESTADOS ===== */
    .loading-row, .loading-cell {
      text-align: center;
      padding: 30px !important;
    }
    
    .loading-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 140, 0, 0.3);
      border-radius: 50%;
      border-top-color: #ff8c00;
      animation: spin 1s linear infinite;
      margin-right: 10px;
    }
    
    .mini-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s linear infinite;
    }
    
    .loading-cell {
      color: #aaa;
      font-size: 0.9rem;
    }
    
    .vazio-row, .vazio-cell {
      text-align: center;
      padding: 40px 20px !important;
    }
    
    .vazio-message, .vazio-tecnica {
      color: #888;
      font-size: 0.9rem;
    }
    
    .vazio-message i, .vazio-tecnica i {
      font-size: 2rem;
      display: block;
      margin-bottom: 10px;
      opacity: 0.5;
    }
    
    .error-row, .error-cell {
      text-align: center;
      padding: 30px 20px !important;
    }
    
    .error-message {
      color: #e74c3c;
      font-size: 0.9rem;
    }
    
    .error-message i {
      font-size: 2rem;
      display: block;
      margin-bottom: 10px;
    }
    
    .btn-try-again {
      background: rgba(231, 76, 60, 0.2);
      border: 1px solid rgba(231, 76, 60, 0.4);
      color: #e74c3c;
      border-radius: 6px;
      padding: 6px 12px;
      margin-top: 10px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    
    .btn-try-again:hover {
      background: rgba(231, 76, 60, 0.3);
    }
    
    /* ===== FOOTER ===== */
    .resumo-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 15px;
      background: rgba(0, 0, 0, 0.2);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .resumo-total {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .total-label {
      color: #aaa;
      font-size: 0.85rem;
    }
    
    .total-value {
      color: #ffd700;
      font-weight: bold;
      font-size: 1.1rem;
    }
    
    .resumo-timestamp {
      color: #666;
      font-size: 0.75rem;
    }
    
    /* ===== ANIMAÇÕES ===== */
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* ===== SCROLLBAR ===== */
    .resumo-table-container::-webkit-scrollbar,
    .tecnicas-list-container::-webkit-scrollbar {
      width: 6px;
    }
    
    .resumo-table-container::-webkit-scrollbar-track,
    .tecnicas-list-container::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 3px;
    }
    
    .resumo-table-container::-webkit-scrollbar-thumb,
    .tecnicas-list-container::-webkit-scrollbar-thumb {
      background: rgba(255, 140, 0, 0.3);
      border-radius: 3px;
    }
    
    .resumo-table-container::-webkit-scrollbar-thumb:hover,
    .tecnicas-list-container::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 140, 0, 0.5);
    }
  `;
  
  document.head.appendChild(style);
  console.log('🎨 Estilos CSS aplicados');
}

// ============================================
// 14. INICIALIZAÇÃO AUTOMÁTICA
// ============================================

// Aguardar DOM carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(inicializarSistemaCompleto, 1500);
  });
} else {
  setTimeout(inicializarSistemaCompleto, 1500);
}

// Inicialização por evento de load
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!sistemaPericias.estado.inicializado) {
      inicializarSistemaCompleto();
    }
  }, 2000);
});

// Exportar para uso global
window.sistemaPericias = sistemaPericias;

console.log('✅ SISTEMA COMPLETO CARREGADO E PRONTO');
console.log('💡 Use window.sistemaPericias.atualizar() para forçar atualização');
console.log('💡 Use window.sistemaPericias.estatisticas() para ver status');