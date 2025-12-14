// ============================================
// RESUMO-PERICIAS-COMPLETO-600LINHAS.js
// CÓDIGO TOTALMENTE COMPLETO - NADA REMOVIDO
// ============================================

const resumoState = {
  initialized: false,
  intervalId: null,
  lastUpdate: null,
  cache: { pericias: [], tecnicas: [], pontosPericias: 0, pontosTecnicas: 0 },
  tentativas: 0,
  maxTentativas: 50,
  monitorId: null,
  aguardandoPericias: false,
  aguardandoTecnicas: false,
  dadosDisponiveis: false,
  abaPericiasVisitada: false,
  abaTecnicasVisitada: false,
  estadoPericiasDisponivel: false,
  estadoTecnicasDisponivel: false
};

// ============================================
// 1. SISTEMA DE DETECÇÃO COMPLETO
// ============================================

function verificarEstadoPericiasSistema() {
  const resultados = {
    estadoPericias: false,
    estadoTecnicas: false,
    tabelaHTML: false,
    localStorage: false,
    sessionStorage: false,
    variaveisGlobais: []
  };
  
  // Verificar estadoPericias
  if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
    if (Array.isArray(window.estadoPericias.periciasAprendidas)) {
      const periciasReais = window.estadoPericias.periciasAprendidas.filter(p => 
        p && p.nome && p.nome !== 'Nenhuma perícia' && p.nome.trim() !== ''
      );
      resultados.estadoPericias = periciasReais.length > 0;
      resumoState.estadoPericiasDisponivel = resultados.estadoPericias;
    }
  }
  
  // Verificar estadoTecnicas
  if (window.estadoTecnicas && window.estadoTecnicas.aprendidas) {
    if (Array.isArray(window.estadoTecnicas.aprendidas)) {
      const tecnicasReais = window.estadoTecnicas.aprendidas.filter(t => 
        t && t.nome && t.nome !== 'Nenhuma técnica' && t.nome.trim() !== ''
      );
      resultados.estadoTecnicas = tecnicasReais.length > 0;
      resumoState.estadoTecnicasDisponivel = resultados.estadoTecnicas;
    }
  }
  
  // Verificar tabela HTML
  const tabelaPericias = document.getElementById('pericias-aprendidas');
  if (tabelaPericias) {
    const html = tabelaPericias.innerHTML.toLowerCase();
    resultados.tabelaHTML = !html.includes('nenhuma perícia') && 
                           !html.includes('vazio') && 
                           !html.includes('carregando') &&
                           tabelaPericias.children.length > 0;
  }
  
  // Verificar storage
  try {
    const periciaStorage = localStorage.getItem('pericias') || sessionStorage.getItem('pericias');
    if (periciaStorage) {
      const parsed = JSON.parse(periciaStorage);
      resultados.localStorage = Array.isArray(parsed) && parsed.length > 0;
    }
  } catch (e) {}
  
  // Verificar variáveis globais
  const variaveis = Object.keys(window);
  for (let varName of variaveis) {
    try {
      const valor = window[varName];
      if (Array.isArray(valor) && valor.length > 0 && valor[0] && valor[0].nome) {
        if (valor[0].nome.includes('Perícia') || valor[0].nome.includes('Técnica')) {
          resultados.variaveisGlobais.push(varName);
        }
      }
    } catch (e) {}
  }
  
  return resultados;
}

// ============================================
// 2. CAPTURADOR COMPLETO DE PERÍCIAS
// ============================================

function capturarPericiasCompleto() {
  const pericias = [];
  let totalPontos = 0;
  let fonteUsada = 'nenhuma';
  
  // Tentativa 1: estadoPericias (fonte principal)
  if (resumoState.estadoPericiasDisponivel) {
    window.estadoPericias.periciasAprendidas.forEach(p => {
      if (!p || !p.nome) return;
      
      const atributoBase = obterValorAtributoCompleto(p.atributo);
      const nh = atributoBase + (p.nivel || 0);
      const pontos = p.investimentoAcumulado || p.custo || p.pontos || 0;
      
      pericias.push({
        nome: p.nome,
        pontos: pontos,
        nh: nh,
        nivel: p.nivel || 0,
        atributo: p.atributo || 'IQ',
        especializacao: p.especializacao || null,
        fonte: 'estadoPericias'
      });
      
      totalPontos += pontos;
    });
    
    if (pericias.length > 0) {
      fonteUsada = 'estadoPericias';
      return { pericias, totalPontos, fonte: fonteUsada };
    }
  }
  
  // Tentativa 2: Tabela HTML
  const tabelaContainer = document.getElementById('pericias-aprendidas');
  if (tabelaContainer) {
    const itens = tabelaContainer.querySelectorAll('.pericia-aprendida-item, .pericia-item, .item-pericia, [class*="pericia"]');
    
    if (itens.length > 0) {
      itens.forEach(item => {
        const textoCompleto = item.textContent || item.innerText || '';
        
        // Verificar se é um item real (não placeholder)
        if (textoCompleto.includes('Nenhuma') || textoCompleto.includes('Carregando') || textoCompleto.trim().length < 5) {
          return;
        }
        
        // Extrair nome
        let nome = '';
        const nomeElem = item.querySelector('.pericia-aprendida-nome, .nome-pericia, h4, h3, .nome');
        if (nomeElem) {
          nome = nomeElem.textContent.trim();
        } else {
          // Tentar extrair nome do texto
          const linhas = textoCompleto.split('\n');
          for (let linha of linhas) {
            const limpa = linha.trim();
            if (limpa.length > 2 && !limpa.match(/\d/) && !limpa.includes('NH') && !limpa.includes('Pontos')) {
              nome = limpa;
              break;
            }
          }
        }
        
        if (!nome || nome === '') return;
        
        // Extrair pontos
        let pontos = 0;
        const pontosMatch = textoCompleto.match(/pontos?\s*[:\-]?\s*(\d+)/i) || 
                           textoCompleto.match(/(\d+)\s*pontos?/i) ||
                           textoCompleto.match(/custo\s*[:\-]?\s*(\d+)/i) ||
                           textoCompleto.match(/investimento\s*[:\-]?\s*(\d+)/i);
        if (pontosMatch) pontos = parseInt(pontosMatch[1]);
        
        // Extrair NH
        let nh = 0;
        const nhMatch = textoCompleto.match(/nh\s*[:\-]?\s*(\d+)/i);
        if (nhMatch) {
          nh = parseInt(nhMatch[1]);
        } else {
          // Calcular NH
          const atributo = extrairAtributoCompleto(textoCompleto);
          const nivel = extrairNivelCompleto(textoCompleto);
          const valorAtributo = obterValorAtributoCompleto(atributo);
          nh = valorAtributo + nivel;
        }
        
        if (nome && (pontos > 0 || nh > 0)) {
          pericias.push({
            nome: nome,
            pontos: pontos,
            nh: nh,
            fonte: 'tabelaHTML'
          });
          totalPontos += pontos;
        }
      });
      
      if (pericias.length > 0) {
        fonteUsada = 'tabelaHTML';
      }
    }
  }
  
  // Tentativa 3: Cache anterior
  if (pericias.length === 0 && resumoState.cache.pericias.length > 0) {
    fonteUsada = 'cache';
    return {
      pericias: resumoState.cache.pericias,
      totalPontos: resumoState.cache.pontosPericias,
      fonte: fonteUsada
    };
  }
  
  return { pericias, totalPontos, fonte: fonteUsada };
}

// ============================================
// 3. CAPTURADOR COMPLETO DE TÉCNICAS
// ============================================

function capturarTecnicasCompleto() {
  const tecnicas = [];
  let totalPontos = 0;
  let fonteUsada = 'nenhuma';
  
  if (resumoState.estadoTecnicasDisponivel) {
    window.estadoTecnicas.aprendidas.forEach(t => {
      if (!t || !t.nome) return;
      
      let nh = calcularNHTecnicaCompleta(t);
      const pontos = t.custoTotal || t.pontos || 0;
      
      tecnicas.push({
        nome: t.nome,
        pontos: pontos,
        nh: nh,
        fonte: 'estadoTecnicas'
      });
      
      totalPontos += pontos;
    });
    
    if (tecnicas.length > 0) {
      fonteUsada = 'estadoTecnicas';
      return { tecnicas, totalPontos, fonte: fonteUsada };
    }
  }
  
  const listaContainer = document.getElementById('tecnicas-aprendidas');
  if (listaContainer) {
    const itens = listaContainer.querySelectorAll('.tecnica-item, .pericia-item, [class*="tecnica"]');
    
    if (itens.length > 0) {
      itens.forEach(item => {
        const texto = item.textContent || '';
        
        if (texto.includes('Nenhuma') || texto.includes('Carregando')) {
          return;
        }
        
        let nome = '';
        const nomeElem = item.querySelector('h3, h4, .tecnica-nome, .nome-tecnica');
        if (nomeElem) {
          nome = nomeElem.textContent.trim();
        }
        
        if (!nome || nome === '') return;
        
        let pontos = 0;
        const pontosMatch = texto.match(/(\d+)\s*pts?/) || texto.match(/pontos?\s*[:\-]?\s*(\d+)/i);
        if (pontosMatch) pontos = parseInt(pontosMatch[1]);
        
        let nh = 0;
        const nhMatch = texto.match(/nh\s*[:\-]?\s*(\d+)/i);
        if (nhMatch) {
          nh = parseInt(nhMatch[1]);
        } else {
          nh = calcularNHTecnicaCompleta({ nome: nome });
        }
        
        if (nome && (pontos > 0 || nh > 0)) {
          tecnicas.push({ nome, pontos, nh, fonte: 'listaHTML' });
          totalPontos += pontos;
        }
      });
      
      if (tecnicas.length > 0) {
        fonteUsada = 'listaHTML';
      }
    }
  }
  
  if (tecnicas.length === 0 && resumoState.cache.tecnicas.length > 0) {
    fonteUsada = 'cache';
    return {
      tecnicas: resumoState.cache.tecnicas,
      totalPontos: resumoState.cache.pontosTecnicas,
      fonte: fonteUsada
    };
  }
  
  return { tecnicas, totalPontos, fonte: fonteUsada };
}

// ============================================
// 4. FUNÇÕES AUXILIARES COMPLETAS
// ============================================

function obterValorAtributoCompleto(atributo) {
  if (!atributo) return 10;
  
  const mapeamento = {
    'DX': ['resumoDX', 'atributo-DX', 'attr-DX', 'dx-value'],
    'IQ': ['resumoIQ', 'atributo-IQ', 'attr-IQ', 'iq-value'],
    'HT': ['resumoHT', 'atributo-HT', 'attr-HT', 'ht-value'],
    'PERC': ['resumoPERC', 'atributo-PERC', 'attr-PERC', 'perc-value']
  };
  
  const ids = mapeamento[atributo] || [];
  for (let id of ids) {
    const elem = document.getElementById(id);
    if (elem) {
      const valor = parseInt(elem.textContent || '10');
      if (!isNaN(valor)) return valor;
    }
  }
  
  // Tentar por seletor CSS
  const seletor = `[data-atributo="${atributo}"], [data-attr="${atributo}"], .${atributo.toLowerCase()}-value`;
  const elemSeletor = document.querySelector(seletor);
  if (elemSeletor) {
    const valor = parseInt(elemSeletor.textContent || '10');
    if (!isNaN(valor)) return valor;
  }
  
  return 10;
}

function extrairAtributoCompleto(texto) {
  const textoUpper = texto.toUpperCase();
  if (textoUpper.includes('DX') || textoUpper.includes('DESTREZA')) return 'DX';
  if (textoUpper.includes('IQ') || textoUpper.includes('INTELIGÊNCIA') || textoUpper.includes('INTELIGENCIA')) return 'IQ';
  if (textoUpper.includes('HT') || textoUpper.includes('VIGOR') || textoUpper.includes('CONSTITUIÇÃO')) return 'HT';
  if (textoUpper.includes('PERC') || textoUpper.includes('PERCEPÇÃO') || textoUpper.includes('PERCEPCAO')) return 'PERC';
  return 'IQ';
}

function extrairNivelCompleto(texto) {
  const match1 = texto.match(/[+-]\s*(\d+)/);
  const match2 = texto.match(/n[íi]vel\s*[:\-]?\s*(\d+)/i);
  const match3 = texto.match(/lvl\s*[:\-]?\s*(\d+)/i);
  
  if (match1) return parseInt(match1[1]);
  if (match2) return parseInt(match2[1]);
  if (match3) return parseInt(match3[1]);
  
  return 0;
}

function calcularNHTecnicaCompleta(tecnica) {
  if (!tecnica || !tecnica.nome) return 10;
  
  const nome = tecnica.nome.toUpperCase();
  
  // Técnicas específicas
  if (nome.includes('ARQUEARIA MONTADA') || nome.includes('ARCO MONTADO')) {
    let nhArco = 10;
    
    // Buscar perícia de arco
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
      const arcoPericia = window.estadoPericias.periciasAprendidas.find(p => 
        p && p.nome && (p.nome.toUpperCase().includes('ARCO') || p.nome.toUpperCase().includes('ARQUEARIA'))
      );
      
      if (arcoPericia) {
        const atributoBase = obterValorAtributoCompleto(arcoPericia.atributo);
        nhArco = atributoBase + (arcoPericia.nivel || 0);
      }
    }
    
    const pontos = tecnica.pontos || tecnica.custoTotal || 0;
    let bonus = 0;
    if (pontos >= 5) bonus = 4;
    else if (pontos >= 4) bonus = 3;
    else if (pontos >= 3) bonus = 2;
    else if (pontos >= 2) bonus = 1;
    
    return Math.max(0, (nhArco - 4) + bonus);
  }
  
  // Outras técnicas
  if (nome.includes('ATAQUE')) return 10;
  if (nome.includes('DEFESA')) return 10;
  if (nome.includes('MONTARIA')) return 10;
  if (nome.includes('LANÇAMENTO') || nome.includes('LANCAMENTO')) return 10;
  
  return 10;
}

// ============================================
// 5. SISTEMA DE ATUALIZAÇÃO COMPLETO
// ============================================

function atualizarInterfaceResumoCompleta(forcar = false) {
  // Verificar se deve tentar
  if (!forcar && resumoState.tentativas >= resumoState.maxTentativas) {
    mostrarEstadoFinal();
    return;
  }
  
  // Verificar disponibilidade
  const estado = verificarEstadoPericiasSistema();
  const dadosDisponiveis = estado.estadoPericias || estado.estadoTecnicas || estado.tabelaHTML;
  
  if (!dadosDisponiveis && !forcar) {
    resumoState.tentativas++;
    
    // Mostrar estado de carregamento
    mostrarEstadoCarregamento();
    
    // Agendar próxima tentativa
    if (!resumoState.monitorId) {
      resumoState.monitorId = setTimeout(() => {
        resumoState.monitorId = null;
        atualizarInterfaceResumoCompleta(false);
      }, 2000);
    }
    
    return;
  }
  
  // Limpar monitor se existir
  if (resumoState.monitorId) {
    clearTimeout(resumoState.monitorId);
    resumoState.monitorId = null;
  }
  
  // Capturar dados
  const periciasData = capturarPericiasCompleto();
  const tecnicasData = capturarTecnicasCompleto();
  
  // Atualizar cache
  if (periciasData.pericias.length > 0) {
    resumoState.cache.pericias = periciasData.pericias;
    resumoState.cache.pontosPericias = periciasData.totalPontos;
    resumoState.aguardandoPericias = false;
    resumoState.dadosDisponiveis = true;
  }
  
  if (tecnicasData.tecnicas.length > 0) {
    resumoState.cache.tecnicas = tecnicasData.tecnicas;
    resumoState.cache.pontosTecnicas = tecnicasData.totalPontos;
    resumoState.aguardandoTecnicas = false;
  }
  
  // Atualizar interface
  const pontosPericiasElem = document.getElementById('pontosPericias');
  const pontosTecnicasElem = document.getElementById('pontosTecnicas');
  
  if (pontosPericiasElem) {
    pontosPericiasElem.textContent = periciasData.pericias.length > 0 ? periciasData.totalPontos : '0';
  }
  
  if (pontosTecnicasElem) {
    pontosTecnicasElem.textContent = tecnicasData.tecnicas.length > 0 ? tecnicasData.totalPontos : '0';
  }
  
  // Atualizar tabelas
  atualizarTabelaPericiasCompleta(periciasData.pericias);
  atualizarListaTecnicasCompleta(tecnicasData.tecnicas);
  
  resumoState.lastUpdate = new Date();
  resumoState.tentativas = 0;
}

function mostrarEstadoCarregamento() {
  const tbody = document.getElementById('tabelaPericiasResumo');
  if (!tbody) return;
  
  const dots = '.'.repeat((resumoState.tentativas % 3) + 1);
  tbody.innerHTML = `
    <tr class="carregando">
      <td colspan="3">
        <div style="text-align: center; padding: 15px; color: #f39c12;">
          <i class="fas fa-spinner fa-spin"></i>
          Aguardando dados${dots}
          <br>
          <small style="font-size: 0.8em; color: #95a5a6;">
            ${resumoState.tentativas}/${resumoState.maxTentativas} tentativas
          </small>
        </div>
      </td>
    </tr>
  `;
}

function mostrarEstadoFinal() {
  const tbody = document.getElementById('tabelaPericiasResumo');
  if (!tbody) return;
  
  tbody.innerHTML = `
    <tr class="sem-dados">
      <td colspan="3">
        <div style="text-align: center; padding: 15px; color: #e74c3c;">
          <i class="fas fa-exclamation-circle"></i>
          Dados não disponíveis
          <br>
          <small style="font-size: 0.8em; color: #95a5a6;">
            Clique na aba "Perícias" para carregar
          </small>
          <br>
          <button onclick="window.forcarAtualizacaoResumoCompleta()" 
                  style="margin-top: 8px; padding: 4px 12px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8em;">
            Tentar novamente
          </button>
        </div>
      </td>
    </tr>
  `;
}

function atualizarTabelaPericiasCompleta(pericias) {
  const tbody = document.getElementById('tabelaPericiasResumo');
  if (!tbody) return;
  
  if (!pericias || pericias.length === 0) {
    tbody.innerHTML = `
      <tr class="vazio">
        <td colspan="3" style="text-align: center; padding: 15px; color: #95a5a6;">
          <i class="fas fa-graduation-cap"></i>
          Nenhuma perícia aprendida
        </td>
      </tr>
    `;
    return;
  }
  
  let html = '';
  
  pericias.forEach((pericia, index) => {
    let nomeDisplay = pericia.nome || 'Perícia';
    nomeDisplay = nomeDisplay.replace(/<[^>]*>/g, '').trim();
    
    if (nomeDisplay.length > 25) {
      nomeDisplay = nomeDisplay.substring(0, 22) + '...';
    }
    
    const corFundo = index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.01)';
    
    html += `
      <tr style="background: ${corFundo};">
        <td class="td-nome" title="${pericia.nome}" style="padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">
          ${nomeDisplay}
        </td>
        <td class="td-pontos" style="padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center; font-weight: bold; color: #f1c40f;">
          ${pericia.pontos || 0}
        </td>
        <td class="td-nh" style="padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center; font-weight: bold; color: #2ecc71;">
          ${pericia.nh || 0}
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
}

function atualizarListaTecnicasCompleta(tecnicas) {
  const container = document.getElementById('listaTecnicasResumo');
  if (!container) return;
  
  if (!tecnicas || tecnicas.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 15px; color: #95a5a6;">
        <i class="fas fa-magic"></i>
        Nenhuma técnica aprendida
      </div>
    `;
    return;
  }
  
  let html = '';
  
  tecnicas.forEach((tecnica, index) => {
    let nomeDisplay = tecnica.nome || 'Técnica';
    nomeDisplay = nomeDisplay.replace(/<[^>]*>/g, '').trim();
    
    if (nomeDisplay.length > 28) {
      nomeDisplay = nomeDisplay.substring(0, 25) + '...';
    }
    
    const corFundo = index % 2 === 0 ? 'rgba(155, 89, 182, 0.05)' : 'rgba(155, 89, 182, 0.02)';
    
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; margin-bottom: 5px; background: ${corFundo}; border-radius: 4px; border-left: 3px solid #9b59b6;">
        <span style="flex: 1; color: #eee; font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 10px;">
          ${nomeDisplay}
        </span>
        <span style="color: #f1c40f; font-weight: bold; font-size: 0.85rem; padding: 4px 8px; background: rgba(241, 196, 15, 0.1); border-radius: 12px; min-width: 40px; text-align: center; margin-right: 8px;">
          ${tecnica.pontos || 0}
        </span>
        <span style="color: #2ecc71; font-weight: bold; font-size: 0.9rem; padding: 4px 10px; background: rgba(46, 204, 113, 0.1); border-radius: 12px; min-width: 45px; text-align: center;">
          ${tecnica.nh || 0}
        </span>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// ============================================
// 6. MONITORAMENTO DE ABAS COMPLETO
// ============================================

function detectarMudancaAba(aba) {
  if (aba === 'pericias') {
    resumoState.abaPericiasVisitada = true;
    setTimeout(() => {
      atualizarInterfaceResumoCompleta(true);
    }, 800);
  }
  
  if (aba === 'tecnicas') {
    resumoState.abaTecnicasVisitada = true;
    setTimeout(() => {
      atualizarInterfaceResumoCompleta(true);
    }, 800);
  }
  
  if (aba === 'resumo') {
    setTimeout(() => {
      atualizarInterfaceResumoCompleta(true);
    }, 500);
  }
}

function configurarMonitoramentoAbas() {
  // Detectar cliques em abas
  document.addEventListener('click', function(e) {
    const tabBtn = e.target.closest('.tab-btn, .tab-button, [data-tab], .tab');
    if (tabBtn) {
      const tabName = tabBtn.dataset.tab || tabBtn.getAttribute('data-tab') || tabBtn.id.replace('tab-', '');
      if (tabName) {
        detectarMudancaAba(tabName);
      }
    }
  });
  
  // Detectar mudanças via hash/URL
  window.addEventListener('hashchange', function() {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      detectarMudancaAba(hash);
    }
  });
  
  // Detectar eventos customizados do sistema
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('periciasCarregadas', function() {
      resumoState.estadoPericiasDisponivel = true;
      atualizarInterfaceResumoCompleta(true);
    });
    
    window.addEventListener('tecnicasCarregadas', function() {
      resumoState.estadoTecnicasDisponivel = true;
      atualizarInterfaceResumoCompleta(true);
    });
  }
  
  // Monitoramento periódico
  resumoState.intervalId = setInterval(function() {
    const resumoAtivo = document.getElementById('resumo')?.classList.contains('active') || 
                       document.querySelector('.tab-content.resumo.active') !== null;
    
    if (resumoAtivo) {
      atualizarInterfaceResumoCompleta();
    }
  }, 10000); // 10 segundos
}

// ============================================
// 7. INICIALIZAÇÃO COMPLETA
// ============================================

function inicializarSistemaResumoCompleto() {
  if (resumoState.initialized) return;
  
  // Criar elementos necessários
  const resumoSection = document.getElementById('resumo');
  if (resumoSection) {
    // Verificar se já existe tabela
    let tabelaExistente = resumoSection.querySelector('#tabelaPericiasResumo');
    if (!tabelaExistente) {
      // Criar estrutura completa
      const card = document.createElement('div');
      card.className = 'card-tabela';
      card.style.margin = '10px 0';
      card.style.padding = '15px';
      card.style.background = 'rgba(255, 255, 255, 0.03)';
      card.style.borderRadius = '8px';
      card.style.border = '1px solid rgba(255, 255, 255, 0.05)';
      
      card.innerHTML = `
        <h3 style="margin-top: 0; margin-bottom: 15px; color: #ddd; font-size: 1.1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
          <i class="fas fa-graduation-cap" style="margin-right: 8px;"></i>
          Perícias Aprendidas
        </h3>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 10px 8px; font-size: 0.9rem; color: #aaa; font-weight: 600; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">PERÍCIA</th>
                <th style="text-align: center; padding: 10px 8px; font-size: 0.9rem; color: #aaa; font-weight: 600; border-bottom: 1px solid rgba(255, 255, 255, 0.1); width: 80px;">PONTOS</th>
                <th style="text-align: center; padding: 10px 8px; font-size: 0.9rem; color: #aaa; font-weight: 600; border-bottom: 1px solid rgba(255, 255, 255, 0.1); width: 80px;">NH</th>
              </tr>
            </thead>
            <tbody id="tabelaPericiasResumo">
              <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: #7f8c8d;">
                  <i class="fas fa-spinner fa-spin"></i> Inicializando...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: right;">
          <small style="color: #aaa;">
            Total: <span id="pontosPericias" style="color: #f1c40f; font-weight: bold;">0</span> pontos
          </small>
        </div>
      `;
      
      resumoSection.appendChild(card);
    }
  }
  
  // Configurar monitoramento
  configurarMonitoramentoAbas();
  
  // Primeira atualização
  setTimeout(() => {
    atualizarInterfaceResumoCompleta(true);
  }, 2000);
  
  resumoState.initialized = true;
}

// ============================================
// 8. FUNÇÕES GLOBAIS
// ============================================

window.iniciarResumoPericias = inicializarSistemaResumoCompleto;
window.forcarAtualizacaoResumoCompleta = function() {
  resumoState.tentativas = 0;
  resumoState.dadosDisponiveis = false;
  atualizarInterfaceResumoCompleta(true);
  return 'Atualização forçada iniciada';
};

window.verificarEstadoSistema = function() {
  return {
    estado: resumoState,
    dadosDisponiveis: verificarEstadoPericiasSistema(),
    cache: {
      pericias: resumoState.cache.pericias.length,
      tecnicas: resumoState.cache.tecnicas.length
    }
  };
};

// ============================================
// 9. INICIALIZAÇÃO AUTOMÁTICA
// ============================================

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(inicializarSistemaResumoCompleto, 1500);
  });
} else {
  setTimeout(inicializarSistemaResumoCompleto, 1000);
}

// Inicializar quando página terminar de carregar
window.addEventListener('load', function() {
  setTimeout(function() {
    if (!resumoState.initialized) {
      inicializarSistemaResumoCompleto();
    }
  }, 3000);
});