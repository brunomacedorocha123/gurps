// ============================================
// RESUMO-PERICIAS-DIRETO.js
// Sistema que captura perícias DIRETO da fonte
// ============================================

console.log('🎯 RESUMO-PERICIAS-DIRETO - CARREGANDO');

// ============================================
// 1. ESTADO DO SISTEMA
// ============================================

const resumoDireto = {
  initialized: false,
  dadosCapturados: false,
  tentativas: 0,
  maxTentativas: 20,
  intervalId: null,
  
  // Cache de dados
  cache: {
    pericias: [],
    tecnicas: [],
    lastUpdate: null
  }
};

// ============================================
// 2. BUSCADOR INTELIGENTE DE DADOS
// ============================================

function encontrarDadosPericias() {
  console.log('🔍 BUSCANDO DADOS DE PERÍCIAS...');
  
  const fontes = [];
  
  // FONTE 1: estadoPericias (variável global)
  if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
    console.log('📦 Fonte 1: estadoPericias encontrado');
    fontes.push({
      tipo: 'estadoPericias',
      dados: window.estadoPericias.periciasAprendidas
    });
  }
  
  // FONTE 2: personagemData (outra variável possível)
  if (window.personagemData && window.personagemData.pericias) {
    console.log('📦 Fonte 2: personagemData encontrado');
    fontes.push({
      tipo: 'personagemData',
      dados: window.personagemData.pericias
    });
  }
  
  // FONTE 3: sessionStorage/localStorage
  const storedPericias = sessionStorage.getItem('pericias') || localStorage.getItem('pericias');
  if (storedPericias) {
    try {
      const parsed = JSON.parse(storedPericias);
      console.log('📦 Fonte 3: Dados salvos encontrados');
      fontes.push({
        tipo: 'storage',
        dados: parsed
      });
    } catch (e) {}
  }
  
  // FONTE 4: Buscar em TODAS as variáveis globais
  console.log('🔎 Verificando todas variáveis globais...');
  const variaveisGlobais = Object.keys(window);
  
  for (let varName of variaveisGlobais) {
    try {
      const valor = window[varName];
      
      // Verificar se é um array com dados de perícias
      if (Array.isArray(valor) && valor.length > 0 && valor[0] && valor[0].nome) {
        // Verificar se parece ser uma lista de perícias
        const primeira = valor[0];
        if (primeira.nome && (primeira.nivel !== undefined || primeira.pontos !== undefined)) {
          console.log(`📦 Fonte 4: Variável global "${varName}" parece ter perícias`);
          fontes.push({
            tipo: 'varGlobal',
            nome: varName,
            dados: valor
          });
        }
      }
      
      // Verificar se é objeto com propriedade 'pericias'
      else if (valor && typeof valor === 'object' && valor.pericias && Array.isArray(valor.pericias)) {
        console.log(`📦 Fonte 5: Objeto "${varName}.pericias" encontrado`);
        fontes.push({
          tipo: 'objetoPericias',
          nome: varName,
          dados: valor.pericias
        });
      }
    } catch (e) {}
  }
  
  console.log(`✅ ${fontes.length} fontes de dados encontradas`);
  return fontes;
}

// ============================================
// 3. EXTRATOR DE PERÍCIAS DA FONTE PRINCIPAL
// ============================================

function extrairPericiasDaFontePrincipal() {
  console.log('🔄 EXTRAINDO PERÍCIAS DA FONTE PRINCIPAL...');
  
  const pericias = [];
  let totalPontos = 0;
  
  // PASSO 1: Encontrar todas as fontes possíveis
  const fontes = encontrarDadosPericias();
  
  if (fontes.length === 0) {
    console.log('⚠️ Nenhuma fonte de dados encontrada');
    return { pericias: [], totalPontos: 0, fonte: 'nenhuma' };
  }
  
  // PASSO 2: Usar a primeira fonte válida
  const fonte = fontes[0];
  console.log(`📊 Usando fonte: ${fonte.tipo} ${fonte.nome ? `(${fonte.nome})` : ''}`);
  
  fonte.dados.forEach(item => {
    if (!item || !item.nome) return;
    
    // Extrair dados da perícia
    const nome = item.nome || 'Perícia';
    const nivel = item.nivel || 0;
    const pontos = item.pontos || item.custo || item.investimento || 0;
    const atributo = item.atributo || 'IQ';
    
    // Calcular NH
    let nh = 0;
    if (item.nh) {
      nh = item.nh;
    } else {
      // Calcular NH baseado no atributo
      const valorAtributo = obterValorAtributo(atributo);
      nh = valorAtributo + nivel;
    }
    
    pericias.push({
      nome: nome,
      pontos: pontos,
      nh: nh,
      nivel: nivel,
      atributo: atributo,
      fonte: fonte.tipo
    });
    
    totalPontos += pontos;
  });
  
  console.log(`✅ Extraídas ${pericias.length} perícias da fonte principal`);
  return { pericias, totalPontos, fonte: fonte.tipo };
}

// ============================================
// 4. FORÇAR CARREGAMENTO DOS DADOS
// ============================================

function forcarCarregamentoDados() {
  console.log('⚡ FORÇANDO CARREGAMENTO DE DADOS...');
  
  // Método 1: Tentar acionar o carregamento do sistema de perícias
  if (typeof window.carregarPericias === 'function') {
    console.log('🎯 Chamando carregarPericias()...');
    window.carregarPericias();
  }
  
  // Método 2: Simular clique na aba de perícias (invisivelmente)
  const abaPericias = document.querySelector('[data-tab="pericias"], #tab-pericias, .pericias-tab');
  if (abaPericias) {
    console.log('🎯 Acionando sistema de perícias...');
    
    // Disparar evento sem mudar visualmente
    abaPericias.dispatchEvent(new MouseEvent('mouseover', {
      view: window,
      bubbles: true,
      cancelable: true
    }));
    
    // Pequeno delay para carregar
    setTimeout(() => {
      abaPericias.dispatchEvent(new MouseEvent('mousedown', {
        view: window,
        bubbles: true,
        cancelable: true
      }));
    }, 100);
  }
  
  // Método 3: Buscar dados via AJAX/HTTP se disponível
  if (typeof window.buscarDadosPersonagem === 'function') {
    console.log('🎯 Buscando dados do personagem...');
    window.buscarDadosPersonagem();
  }
  
  return 'Carregamento forçado iniciado';
}

// ============================================
// 5. AGUARDADOR INTELIGENTE
// ============================================

function aguardarDadosECapturar() {
  console.log(`⏳ Aguardando dados... (tentativa ${resumoDireto.tentativas + 1}/${resumoDireto.maxTentativas})`);
  
  // Tentar capturar dados
  const resultado = extrairPericiasDaFontePrincipal();
  
  if (resultado.pericias.length > 0) {
    console.log(`✅ DADOS CAPTURADOS COM SUCESSO! ${resultado.pericias.length} perícias`);
    resumoDireto.dadosCapturados = true;
    resumoDireto.cache.pericias = resultado.pericias;
    resumoDireto.cache.lastUpdate = new Date();
    
    // Atualizar interface imediatamente
    atualizarResumoComDados(resultado.pericias, resultado.totalPontos);
    
    // Parar de tentar
    if (resumoDireto.intervalId) {
      clearInterval(resumoDireto.intervalId);
      resumoDireto.intervalId = null;
    }
    
    return true;
  }
  
  // Se não encontrou dados, tentar forçar carregamento na 3ª tentativa
  if (resumoDireto.tentativas === 2) {
    forcarCarregamentoDados();
  }
  
  // Se atingiu limite de tentativas
  if (resumoDireto.tentativas >= resumoDireto.maxTentativas) {
    console.log('⚠️ Limite de tentativas atingido. Dados não encontrados.');
    mostrarMensagemErro();
    return false;
  }
  
  resumoDireto.tentativas++;
  return false;
}

// ============================================
// 6. ATUALIZADOR DO RESUMO
// ============================================

function atualizarResumoComDados(pericias, pontosTotais) {
  console.log('🎨 ATUALIZANDO RESUMO COM DADOS REAIS...');
  
  // Atualizar contador de pontos
  const pontosElem = document.getElementById('pontosPericias');
  if (pontosElem) {
    pontosElem.textContent = pontosTotais;
    pontosElem.style.color = '#2ecc71';
    pontosElem.style.fontWeight = 'bold';
  }
  
  // Atualizar tabela
  const tbody = document.getElementById('tabelaPericiasResumo');
  if (tbody) {
    if (pericias.length === 0) {
      tbody.innerHTML = `
        <tr class="vazio">
          <td colspan="3">Nenhuma perícia aprendida</td>
        </tr>
      `;
    } else {
      let html = '';
      
      pericias.forEach(pericia => {
        const nomeDisplay = pericia.nome.length > 25 ? 
          pericia.nome.substring(0, 22) + '...' : pericia.nome;
        
        html += `
          <tr class="pericia-real">
            <td class="td-nome" title="${pericia.nome}">
              <i class="fas fa-check-circle" style="color: #2ecc71; margin-right: 5px;"></i>
              ${nomeDisplay}
            </td>
            <td class="td-pontos">
              ${pericia.pontos}
            </td>
            <td class="td-nh">
              ${pericia.nh}
            </td>
          </tr>
        `;
      });
      
      tbody.innerHTML = html;
    }
  }
  
  // Adicionar indicador visual de sucesso
  const card = document.querySelector('#resumo .card-tabela');
  if (card) {
    card.style.borderLeft = '4px solid #2ecc71';
    card.style.background = 'linear-gradient(135deg, rgba(46, 204, 113, 0.05) 0%, rgba(46, 204, 113, 0.02) 100%)';
  }
  
  console.log('✅ RESUMO ATUALIZADO COM DADOS REAIS!');
}

function mostrarMensagemErro() {
  const tbody = document.getElementById('tabelaPericiasResumo');
  if (tbody) {
    tbody.innerHTML = `
      <tr class="erro">
        <td colspan="3">
          <div style="text-align: center; padding: 10px; color: #e74c3c;">
            <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>
            Dados não carregados
            <br>
            <small style="font-size: 0.8em; color: #95a5a6;">
              Clique na aba "Perícias" primeiro
            </small>
            <br>
            <button onclick="iniciarCapturaAutomatica()" 
                    style="margin-top: 8px; padding: 4px 12px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Tentar novamente
            </button>
          </div>
        </td>
      </tr>
    `;
  }
}

// ============================================
// 7. FUNÇÕES AUXILIARES
// ============================================

function obterValorAtributo(atributo) {
  // Valores padrão
  const defaults = { 
    'DX': 10, 'AGI': 10, 'DESTREZA': 10,
    'IQ': 10, 'INT': 10, 'INTELIGENCIA': 10,
    'HT': 10, 'VIG': 10, 'VIGOR': 10,
    'PERC': 10, 'PER': 10, 'PERCEPCAO': 10
  };
  
  // Tentar pegar do resumo
  const elem = document.getElementById(`resumo${atributo}`) || 
               document.getElementById(`atributo-${atributo}`) ||
               document.querySelector(`[data-atributo="${atributo}"]`);
  
  if (elem) {
    const valor = parseInt(elem.textContent || '10');
    return isNaN(valor) ? defaults[atributo] || 10 : valor;
  }
  
  return defaults[atributo.toUpperCase()] || 10;
}

// ============================================
// 8. INICIALIZAÇÃO AUTOMÁTICA
// ============================================

function iniciarSistemaResumoDireto() {
  if (resumoDireto.initialized) {
    console.log('⚠️ Sistema já inicializado');
    return;
  }
  
  console.log('🚀 INICIANDO SISTEMA DIRETO DE RESUMO');
  
  // Criar elementos se necessário
  criarElementosResumo();
  
  // Aplicar estilos
  aplicarEstilosResumoDireto();
  
  // Iniciar processo de captura
  resumoDireto.initialized = true;
  
  // Tentar capturar imediatamente
  setTimeout(() => {
    const sucesso = aguardarDadosECapturar();
    
    // Se não conseguiu, iniciar polling
    if (!sucesso) {
      resumoDireto.intervalId = setInterval(aguardarDadosECapturar, 2000);
    }
  }, 1500);
  
  // Configurar eventos
  configurarEventosResumo();
  
  console.log('✅ Sistema direto inicializado');
}

function criarElementosResumo() {
  // Garantir que os elementos do resumo existem
  const resumoSection = document.getElementById('resumo');
  if (!resumoSection) return;
  
  // Procurar ou criar tabela de perícias
  let tabelaContainer = resumoSection.querySelector('.card-tabela, .tabela-pericias');
  if (!tabelaContainer) {
    tabelaContainer = document.createElement('div');
    tabelaContainer.className = 'card-tabela';
    tabelaContainer.innerHTML = `
      <h3><i class="fas fa-graduation-cap"></i> Perícias</h3>
      <div class="tabela-micro-container">
        <table class="tabela-micro">
          <thead>
            <tr>
              <th>PERÍCIA</th>
              <th class="th-nivel">PONTOS</th>
              <th class="th-pontos">NH</th>
            </tr>
          </thead>
          <tbody id="tabelaPericiasResumo">
            <tr class="carregando">
              <td colspan="3">
                <div class="loading-spinner">
                  <i class="fas fa-spinner fa-spin"></i> Carregando perícias...
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer">
        <small>Total: <span id="pontosPericias">0</span> pontos</small>
      </div>
    `;
    resumoSection.appendChild(tabelaContainer);
  }
}

function aplicarEstilosResumoDireto() {
  const styleId = 'resumo-diretos-estilos';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .pericia-real {
      animation: fadeIn 0.5s ease-in;
    }
    
    .pericia-real:hover {
      background: linear-gradient(90deg, rgba(46, 204, 113, 0.1) 0%, rgba(46, 204, 113, 0.05) 100%);
      transform: translateX(2px);
    }
    
    .pericia-real .td-nome {
      color: #2c3e50;
      font-weight: 500;
    }
    
    .pericia-real .td-pontos {
      background: linear-gradient(135deg, #f1c40f, #f39c12);
      color: white;
      font-weight: bold;
    }
    
    .pericia-real .td-nh {
      background: linear-gradient(135deg, #2ecc71, #27ae60);
      color: white;
      font-weight: bold;
    }
    
    .carregando {
      text-align: center;
      padding: 20px;
      color: #7f8c8d;
    }
    
    .loading-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    
    .fa-spinner {
      color: #3498db;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  
  document.head.appendChild(style);
}

function configurarEventosResumo() {
  // Quando o usuário clicar em qualquer lugar do sistema
  document.addEventListener('click', function(e) {
    // Se clicar em algo relacionado a perícias
    if (e.target.closest('.pericia, [class*="skill"], [data-pericia]')) {
      setTimeout(() => {
        aguardarDadosECapturar();
      }, 500);
    }
  });
  
  // Observar mudanças no DOM
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        // Verificar se foram adicionados dados de perícias
        const hasPericiaData = Array.from(mutation.addedNodes).some(node => {
          if (node.nodeType === 1) {
            const text = node.textContent || '';
            return text.includes('pericia') || text.includes('Perícia') || 
                   (node.className && node.className.includes('pericia'));
          }
          return false;
        });
        
        if (hasPericiaData) {
          console.log('🔍 Detectada mudança no DOM relacionada a perícias');
          setTimeout(aguardarDadosECapturar, 300);
        }
      }
    });
  });
  
  // Observar a seção de perícias se existir
  const periciasSection = document.getElementById('pericias-aprendidas') || 
                         document.querySelector('[data-tab="pericias"]');
  if (periciasSection) {
    observer.observe(periciasSection, { childList: true, subtree: true });
  }
}

// ============================================
// 9. FUNÇÕES GLOBAIS PARA CONTROLE
// ============================================

window.iniciarCapturaAutomatica = function() {
  console.log('🔄 INICIANDO CAPTURA AUTOMÁTICA');
  resumoDireto.tentativas = 0;
  resumoDireto.dadosCapturados = false;
  
  // Parar intervalo anterior se existir
  if (resumoDireto.intervalId) {
    clearInterval(resumoDireto.intervalId);
  }
  
  // Iniciar novo processo
  resumoDireto.intervalId = setInterval(aguardarDadosECapturar, 1500);
  aguardarDadosECapturar();
  
  return 'Captura automática iniciada';
};

window.verificarFontesDeDados = function() {
  console.log('🔍 VERIFICANDO TODAS AS FONTES DE DADOS');
  const fontes = encontrarDadosPericias();
  
  console.log(`\n📊 RESULTADO: ${fontes.length} fontes encontradas`);
  fontes.forEach((fonte, i) => {
    console.log(`\n${i + 1}. ${fonte.tipo} ${fonte.nome ? `(${fonte.nome})` : ''}:`);
    console.log(`   Quantidade: ${fonte.dados.length} itens`);
    if (fonte.dados.length > 0) {
      console.log(`   Primeiro item:`, fonte.dados[0]);
    }
  });
  
  if (fontes.length > 0) {
    console.log('\n🎯 TENTANDO EXTRAIR DADOS DA PRIMEIRA FONTE...');
    const resultado = extrairPericiasDaFontePrincipal();
    console.log(`✅ Extraído: ${resultado.pericias.length} perícias`);
    return resultado;
  }
  
  return null;
};

window.forcarAtualizacaoResumoDireto = function() {
  console.log('💥 FORÇANDO ATUALIZAÇÃO DO RESUMO DIRETO');
  forcarCarregamentoDados();
  setTimeout(() => {
    const resultado = extrairPericiasDaFontePrincipal();
    if (resultado.pericias.length > 0) {
      atualizarResumoComDados(resultado.pericias, resultado.totalPontos);
      return `✅ Atualizado com ${resultado.pericias.length} perícias`;
    } else {
      mostrarMensagemErro();
      return '❌ Nenhuma perícia encontrada';
    }
  }, 1000);
};

// ============================================
// 10. INICIALIZAÇÃO
// ============================================

// Iniciar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarSistemaResumoDireto);
} else {
  setTimeout(iniciarSistemaResumoDireto, 1000);
}

// Iniciar também quando a página terminar de carregar
window.addEventListener('load', function() {
  setTimeout(() => {
    if (!resumoDireto.initialized) {
      iniciarSistemaResumoDireto();
    }
  }, 2000);
});

console.log('✅ RESUMO-PERICIAS-DIRETO - PRONTO PARA USAR');