// ============================================
// RESUMO-PERICIAS-COMPLETO.js - VERSÃO DEFINITIVA
// Sistema COMPLETO para perícias e técnicas no resumo
// ============================================

console.log('🎯 RESUMO-PERICIAS-COMPLETO - VERSÃO DEFINITIVA - INICIANDO');

// ============================================
// 1. ESTADO GLOBAL MELHORADO
// ============================================

const resumoState = {
  initialized: false,
  intervalId: null,
  monitorId: null,
  lastUpdate: null,
  cache: {
    pericias: [],
    tecnicas: [],
    pontosPericias: 0,
    pontosTecnicas: 0
  },
  
  // Novos controles
  aguardandoPericias: false,
  aguardandoTecnicas: false,
  dadosDisponiveis: false,
  tentativas: 0,
  maxTentativas: 30, // 30 tentativas = ~30 segundos
  
  // Flags para saber quando cada aba foi carregada
  abaPericiasCarregada: false,
  abaTecnicasCarregada: false
};

// ============================================
// 2. FUNÇÕES DE CAPTURA OTIMIZADAS
// ============================================

function capturarPericiasDireto() {
  try {
    console.log('🔄 Tentando capturar perícias...');
    
    const pericias = [];
    let totalPontos = 0;
    let encontrouDadosReais = false;
    
    // ========== MÉTODO 1: estadoPericias (se disponível) ==========
    if (window.estadoPericias && 
        window.estadoPericias.periciasAprendidas && 
        Array.isArray(window.estadoPericias.periciasAprendidas)) {
      
      console.log('📊 Analisando estadoPericias...');
      
      window.estadoPericias.periciasAprendidas.forEach(p => {
        if (p && p.nome && p.nome !== 'Nenhuma perícia') {
          encontrouDadosReais = true;
          
          // Calcular NH
          const atributoBase = p.atributo ? obterValorAtributo(p.atributo) : 10;
          const nh = atributoBase + (p.nivel || 0);
          const pontos = p.investimentoAcumulado || p.custo || 0;
          
          pericias.push({
            nome: p.nome,
            pontos: pontos,
            nh: nh,
            especializacao: p.especializacao || null,
            origem: 'estadoPericias'
          });
          
          totalPontos += pontos;
        }
      });
      
      if (encontrouDadosReais) {
        console.log(`✅ ${pericias.length} perícias do estadoPericias`);
        return { pericias, totalPontos, fonte: 'estadoPericias' };
      }
    }
    
    // ========== MÉTODO 2: Tabela HTML (conteúdo real) ==========
    const tabelaContainer = document.getElementById('pericias-aprendidas');
    if (tabelaContainer) {
      const htmlContent = tabelaContainer.innerHTML.toLowerCase();
      
      // Verificar se tem conteúdo REAL (não apenas placeholder)
      const temConteudoReal = !htmlContent.includes('nenhuma perícia') &&
                              !htmlContent.includes('vazio') &&
                              !htmlContent.includes('placeholder') &&
                              tabelaContainer.children.length > 0;
      
      if (temConteudoReal) {
        console.log('📋 Extraindo da tabela HTML (conteúdo real)');
        
        const itens = tabelaContainer.querySelectorAll('.pericia-aprendida-item, .pericia-item, [class*="pericia"]');
        
        itens.forEach(item => {
          const texto = item.textContent.toLowerCase();
          
          // Pular itens vazios ou placeholders
          if (texto.includes('nenhuma') || texto.includes('vazio') || texto.trim() === '') {
            return;
          }
          
          // Extrair nome
          const nomeElem = item.querySelector('.pericia-aprendida-nome, h4, h3, .nome-pericia');
          let nome = nomeElem ? nomeElem.textContent.trim() : item.textContent.trim();
          
          if (nome && nome !== '' && nome !== 'Perícia') {
            encontrouDadosReais = true;
            
            // Limpar nome
            nome = nome.replace(/<[^>]*>/g, '').replace(/[\n\r]+/g, ' ').trim();
            
            // Extrair pontos
            let pontos = 0;
            const pontosText = item.textContent;
            const pontosMatch = pontosText.match(/pontos?\s*[:\-]?\s*(\d+)/i) || 
                               pontosText.match(/(\d+)\s*pontos?/i) ||
                               pontosText.match(/custo:\s*(\d+)/i);
            if (pontosMatch) pontos = parseInt(pontosMatch[1]);
            
            // Extrair ou calcular NH
            let nh = 0;
            const nhMatch = item.textContent.match(/nh\s*[:\-]?\s*(\d+)/i);
            if (nhMatch) {
              nh = parseInt(nhMatch[1]);
            } else {
              // Tentar calcular
              const atributo = extrairAtributo(item.textContent);
              const nivel = extrairNivel(item.textContent);
              nh = obterValorAtributo(atributo) + nivel;
            }
            
            if (pontos > 0 || nh > 10) { // Filtro para dados plausíveis
              pericias.push({ nome, pontos, nh, origem: 'tabelaHTML' });
              totalPontos += pontos;
            }
          }
        });
      }
    }
    
    // ========== MÉTODO 3: Verificar se há dados salvos ==========
    if (!encontrouDadosReais && resumoState.cache.pericias.length > 0) {
      console.log('💾 Usando dados do cache anterior');
      return {
        pericias: resumoState.cache.pericias,
        totalPontos: resumoState.cache.pontosPericias,
        fonte: 'cache'
      };
    }
    
    // ========== MÉTODO 4: ESPERAR se não encontrou nada ==========
    if (!encontrouDadosReais) {
      console.log('⏳ Nenhuma perícia real encontrada - aguardando...');
      resumoState.aguardandoPericias = true;
      
      // Se for a primeira tentativa, marcar que precisa aguardar
      if (resumoState.tentativas === 0) {
        setTimeout(() => {
          if (resumoState.aguardandoPericias) {
            console.log('⚠️ Ainda aguardando perícias...');
          }
        }, 3000);
      }
      
      return { pericias: [], totalPontos: 0, fonte: 'aguardando' };
    }
    
    console.log(`🎯 ${pericias.length} perícias capturadas`);
    return { pericias, totalPontos, fonte: 'sucesso' };
    
  } catch (error) {
    console.error('❌ Erro capturar perícias:', error);
    return { pericias: [], totalPontos: 0, fonte: 'erro' };
  }
}

function capturarTecnicasDireto() {
  try {
    console.log('🔄 Tentando capturar técnicas...');
    
    const tecnicas = [];
    let totalPontos = 0;
    let encontrouDadosReais = false;
    
    // ========== MÉTODO 1: estadoTecnicas ==========
    if (window.estadoTecnicas && 
        window.estadoTecnicas.aprendidas && 
        Array.isArray(window.estadoTecnicas.aprendidas)) {
      
      console.log('📊 Analisando estadoTecnicas...');
      
      window.estadoTecnicas.aprendidas.forEach(t => {
        if (t && t.nome && t.nome !== 'Nenhuma técnica') {
          encontrouDadosReais = true;
          
          let nh = calcularNHTecnica(t);
          const pontos = t.custoTotal || 0;
          
          tecnicas.push({
            nome: t.nome,
            pontos: pontos,
            nh: nh,
            origem: 'estadoTecnicas'
          });
          
          totalPontos += pontos;
        }
      });
      
      if (encontrouDadosReais) {
        console.log(`✅ ${tecnicas.length} técnicas do estadoTecnicas`);
        return { tecnicas, totalPontos, fonte: 'estadoTecnicas' };
      }
    }
    
    // ========== MÉTODO 2: Lista HTML ==========
    const listaContainer = document.getElementById('tecnicas-aprendidas');
    if (listaContainer) {
      const htmlContent = listaContainer.innerHTML.toLowerCase();
      
      const temConteudoReal = !htmlContent.includes('nenhuma técnica') &&
                              !htmlContent.includes('vazio') &&
                              !htmlContent.includes('placeholder') &&
                              listaContainer.children.length > 0;
      
      if (temConteudoReal) {
        console.log('📋 Extraindo da lista HTML');
        
        const itens = listaContainer.querySelectorAll('.tecnica-item, .pericia-item, [class*="tecnica"]');
        
        itens.forEach(item => {
          const texto = item.textContent.toLowerCase();
          
          if (texto.includes('nenhuma') || texto.includes('vazio') || texto.trim() === '') {
            return;
          }
          
          const nomeElem = item.querySelector('h3, h4, .tecnica-nome');
          let nome = nomeElem ? nomeElem.textContent.trim() : item.textContent.trim();
          
          if (nome && !nome.includes('Nenhuma')) {
            encontrouDadosReais = true;
            nome = nome.replace(/[✅▶]/g, '').trim();
            
            // Extrair pontos
            let pontos = 0;
            const pontosMatch = item.textContent.match(/(\d+)\s*pts?/) ||
                               item.textContent.match(/pontos?\s*[:\-]?\s*(\d+)/i);
            if (pontosMatch) pontos = parseInt(pontosMatch[1]);
            
            // Extrair NH
            let nh = 0;
            const nhMatch = item.textContent.match(/nh\s*[:\-]?\s*(\d+)/i);
            if (nhMatch) {
              nh = parseInt(nhMatch[1]);
            } else {
              nh = calcularNHTecnica({ nome: nome });
            }
            
            if (pontos > 0 || nh > 10) {
              tecnicas.push({ nome, pontos, nh, origem: 'listaHTML' });
              totalPontos += pontos;
            }
          }
        });
      }
    }
    
    // ========== MÉTODO 3: Usar cache ==========
    if (!encontrouDadosReais && resumoState.cache.tecnicas.length > 0) {
      console.log('💾 Usando técnicas do cache');
      return {
        tecnicas: resumoState.cache.tecnicas,
        totalPontos: resumoState.cache.pontosTecnicas,
        fonte: 'cache'
      };
    }
    
    // ========== MÉTODO 4: ESPERAR ==========
    if (!encontrouDadosReais) {
      console.log('⏳ Nenhuma técnica real encontrada - aguardando...');
      resumoState.aguardandoTecnicas = true;
      return { tecnicas: [], totalPontos: 0, fonte: 'aguardando' };
    }
    
    console.log(`🎯 ${tecnicas.length} técnicas capturadas`);
    return { tecnicas, totalPontos, fonte: 'sucesso' };
    
  } catch (error) {
    console.error('❌ Erro capturar técnicas:', error);
    return { tecnicas: [], totalPontos: 0, fonte: 'erro' };
  }
}

// ============================================
// 3. FUNÇÕES AUXILIARES
// ============================================

function obterValorAtributo(atributo) {
  if (!atributo) return 10;
  
  const atributos = {
    'DX': document.getElementById('resumoDX'),
    'IQ': document.getElementById('resumoIQ'),
    'HT': document.getElementById('resumoHT'),
    'PERC': document.getElementById('resumoPERC')
  };
  
  if (atributos[atributo]) {
    const valor = parseInt(atributos[atributo].textContent || '10');
    return isNaN(valor) ? 10 : valor;
  }
  
  return 10;
}

function extrairAtributo(texto) {
  texto = texto.toUpperCase();
  if (texto.includes('DX')) return 'DX';
  if (texto.includes('IQ')) return 'IQ';
  if (texto.includes('HT')) return 'HT';
  if (texto.includes('PERC')) return 'PERC';
  return 'IQ';
}

function extrairNivel(texto) {
  const match = texto.match(/[+-]\s*(\d+)/) || texto.match(/n[íi]vel\s*[:\-]?\s*(\d+)/i);
  return match ? parseInt(match[1]) : 0;
}

function calcularNHTecnica(tecnica) {
  if (tecnica.nome && tecnica.nome.includes('Arquearia Montada')) {
    let nhArco = 10;
    
    // Buscar perícia de Arco
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
      const arco = window.estadoPericias.periciasAprendidas.find(
        p => p.nome && (p.nome.includes('Arco') || p.nome.includes('Arquearia'))
      );
      if (arco) {
        const atributoBase = obterValorAtributo(arco.atributo);
        nhArco = atributoBase + (arco.nivel || 0);
      }
    }
    
    const pontos = tecnica.pontos || tecnica.custoTotal || 0;
    let bonus = 0;
    if (pontos >= 5) bonus = 4;
    else if (pontos >= 4) bonus = 3;
    else if (pontos >= 3) bonus = 2;
    else if (pontos >= 2) bonus = 1;
    
    return (nhArco - 4) + bonus;
  }
  
  return 10;
}

// ============================================
// 4. VERIFICADOR DE DISPONIBILIDADE
// ============================================

function verificarDisponibilidadeDados() {
  console.log(`🔍 Verificando disponibilidade (tentativa ${resumoState.tentativas + 1}/${resumoState.maxTentativas})`);
  
  // Verificar estadoPericias
  const estadoPericiasDisponivel = window.estadoPericias && 
                                   window.estadoPericias.periciasAprendidas &&
                                   Array.isArray(window.estadoPericias.periciasAprendidas) &&
                                   window.estadoPericias.periciasAprendidas.length > 0;
  
  // Verificar tabela HTML
  const tabelaPericias = document.getElementById('pericias-aprendidas');
  const tabelaDisponivel = tabelaPericias && 
                          !tabelaPericias.innerHTML.toLowerCase().includes('nenhuma perícia') &&
                          tabelaPericias.children.length > 0;
  
  // Verificar estadoTecnicas
  const estadoTecnicasDisponivel = window.estadoTecnicas && 
                                   window.estadoTecnicas.aprendidas &&
                                   Array.isArray(window.estadoTecnicas.aprendidas) &&
                                   window.estadoTecnicas.aprendidas.length > 0;
  
  // Verificar lista HTML de técnicas
  const listaTecnicas = document.getElementById('tecnicas-aprendidas');
  const listaDisponivel = listaTecnicas && 
                         !listaTecnicas.innerHTML.toLowerCase().includes('nenhuma técnica') &&
                         listaTecnicas.children.length > 0;
  
  const dadosDisponiveis = estadoPericiasDisponivel || tabelaDisponivel || 
                          estadoTecnicasDisponivel || listaDisponivel;
  
  console.log('📊 Status:', {
    estadoPericias: estadoPericiasDisponivel ? '✅' : '❌',
    tabelaPericias: tabelaDisponivel ? '✅' : '❌',
    estadoTecnicas: estadoTecnicasDisponivel ? '✅' : '❌',
    listaTecnicas: listaDisponivel ? '✅' : '❌',
    geral: dadosDisponiveis ? '✅ PRONTOS!' : '⏳ AGUARDANDO'
  });
  
  resumoState.tentativas++;
  
  return dadosDisponiveis;
}

// ============================================
// 5. ATUALIZAR INTERFACE - VERSÃO INTELIGENTE
// ============================================

function atualizarInterfaceResumo(forcar = false) {
  console.log('🎨 Atualizando interface do resumo...');
  
  // Se está aguardando dados e não for forçado, verificar disponibilidade
  if (!forcar && !verificarDisponibilidadeDados() && resumoState.tentativas < resumoState.maxTentativas) {
    console.log('⏳ Dados ainda não disponíveis, aguardando...');
    
    // Agendar próxima tentativa
    if (!resumoState.monitorId) {
      resumoState.monitorId = setInterval(() => {
        if (verificarDisponibilidadeDados()) {
          clearInterval(resumoState.monitorId);
          resumoState.monitorId = null;
          console.log('✅ Dados finalmente disponíveis! Atualizando...');
          atualizarInterfaceResumo(true);
        } else if (resumoState.tentativas >= resumoState.maxTentativas) {
          clearInterval(resumoState.monitorId);
          resumoState.monitorId = null;
          console.log('⚠️ Limite de tentativas atingido');
          usarDadosDeFallback();
        }
      }, 1000);
    }
    
    return;
  }
  
  try {
    // 1. Capturar dados
    const periciasData = capturarPericiasDireto();
    const tecnicasData = capturarTecnicasDireto();
    
    // 2. Verificar se capturou dados reais
    const capturouPericiasReais = periciasData.pericias.length > 0 && 
                                  periciasData.fonte !== 'aguardando';
    const capturouTecnicasReais = tecnicasData.tecnicas.length > 0 && 
                                  tecnicasData.fonte !== 'aguardando';
    
    // 3. Atualizar cache somente se capturou dados reais
    if (capturouPericiasReais) {
      resumoState.cache.pericias = periciasData.pericias;
      resumoState.cache.pontosPericias = periciasData.totalPontos;
      resumoState.aguardandoPericias = false;
    }
    
    if (capturouTecnicasReais) {
      resumoState.cache.tecnicas = tecnicasData.tecnicas;
      resumoState.cache.pontosTecnicas = tecnicasData.totalPontos;
      resumoState.aguardandoTecnicas = false;
    }
    
    // 4. Atualizar interface
    const pontosPericiasElem = document.getElementById('pontosPericias');
    const pontosTecnicasElem = document.getElementById('pontosTecnicas');
    
    if (pontosPericiasElem) {
      pontosPericiasElem.textContent = capturouPericiasReais ? 
        periciasData.totalPontos : '...';
    }
    
    if (pontosTecnicasElem) {
      pontosTecnicasElem.textContent = capturouTecnicasReais ? 
        tecnicasData.totalPontos : '...';
    }
    
    // 5. Atualizar tabelas
    if (capturouPericiasReais) {
      atualizarTabelaPericias(periciasData.pericias);
    } else {
      mostrarMensagemAguardando('pericias');
    }
    
    if (capturouTecnicasReais) {
      atualizarListaTecnicas(tecnicasData.tecnicas);
    } else {
      mostrarMensagemAguardando('tecnicas');
    }
    
    resumoState.lastUpdate = new Date();
    resumoState.dadosDisponiveis = capturouPericiasReais || capturouTecnicasReais;
    
    console.log(`✅ Interface atualizada: ${periciasData.pericias.length}P ${tecnicasData.tecnicas.length}T`);
    console.log(`📝 Fonte: P=${periciasData.fonte}, T=${tecnicasData.fonte}`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar interface:', error);
    usarDadosDeFallback();
  }
}

function usarDadosDeFallback() {
  console.log('🔄 Usando fallback...');
  
  // Limpar mensagens de aguardando
  const tbody = document.getElementById('tabelaPericiasResumo');
  const lista = document.getElementById('listaTecnicasResumo');
  
  if (tbody) {
    tbody.innerHTML = `
      <tr class="vazio">
        <td colspan="3">Carregando perícias...</td>
      </tr>
    `;
  }
  
  if (lista) {
    lista.innerHTML = '<div class="vazio">Carregando técnicas...</div>';
  }
}

function mostrarMensagemAguardando(tipo) {
  if (tipo === 'pericias') {
    const tbody = document.getElementById('tabelaPericiasResumo');
    if (tbody) {
      tbody.innerHTML = `
        <tr class="aguardando">
          <td colspan="3">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span>Carregando perícias...</span>
              <div class="spinner" style="width: 12px; height: 12px; border: 2px solid #f39c12; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
            </div>
          </td>
        </tr>
      `;
    }
  } else if (tipo === 'tecnicas') {
    const lista = document.getElementById('listaTecnicasResumo');
    if (lista) {
      lista.innerHTML = `
        <div class="aguardando" style="text-align: center; padding: 20px; color: #f39c12;">
          Carregando técnicas...
        </div>
      `;
    }
  }
}

// ============================================
// 6. FUNÇÕES DE ATUALIZAÇÃO DE INTERFACE
// ============================================

function atualizarTabelaPericias(pericias) {
  const tbody = document.getElementById('tabelaPericiasResumo');
  if (!tbody) {
    console.error('❌ Tabela de perícias não encontrada!');
    return;
  }
  
  if (!pericias || pericias.length === 0) {
    tbody.innerHTML = `
      <tr class="vazio">
        <td colspan="3">Nenhuma perícia aprendida</td>
      </tr>
    `;
    return;
  }
  
  let html = '';
  
  pericias.forEach((pericia, index) => {
    let nomeDisplay = pericia.nome || 'Perícia';
    nomeDisplay = nomeDisplay.replace(/<[^>]*>/g, '');
    
    if (nomeDisplay.length > 25) {
      nomeDisplay = nomeDisplay.substring(0, 22) + '...';
    }
    
    html += `
      <tr>
        <td class="td-nome" title="${pericia.nome}">
          ${nomeDisplay}
        </td>
        <td class="td-pontos">
          ${pericia.pontos || 0}
        </td>
        <td class="td-nh">
          ${pericia.nh || 0}
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
}

function atualizarListaTecnicas(tecnicas) {
  const container = document.getElementById('listaTecnicasResumo');
  if (!container) return;
  
  if (!tecnicas || tecnicas.length === 0) {
    container.innerHTML = '<div class="vazio">Nenhuma técnica aprendida</div>';
    return;
  }
  
  let html = '';
  
  tecnicas.forEach(tecnica => {
    let nomeDisplay = tecnica.nome || 'Técnica';
    nomeDisplay = nomeDisplay.replace(/<[^>]*>/g, '');
    
    if (nomeDisplay.length > 28) {
      nomeDisplay = nomeDisplay.substring(0, 25) + '...';
    }
    
    html += `
      <div class="tecnica-resumo-item">
        <span class="tecnica-nome">${nomeDisplay}</span>
        <span class="tecnica-pontos">${tecnica.pontos || 0}</span>
        <span class="tecnica-nh">${tecnica.nh || 0}</span>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// ============================================
// 7. DETECTOR DE MUDANÇAS NAS ABAS
// ============================================

function monitorarMudancaAba(aba) {
  console.log(`📝 Usuário acessou aba: ${aba}`);
  
  if (aba === 'pericias') {
    resumoState.abaPericiasCarregada = true;
    // Forçar atualização após sair da aba de perícias
    setTimeout(() => {
      console.log('🔄 Saindo da aba perícias, atualizando resumo...');
      atualizarInterfaceResumo(true);
    }, 500);
  }
  
  if (aba === 'tecnicas') {
    resumoState.abaTecnicasCarregada = true;
    setTimeout(() => {
      console.log('🔄 Saindo da aba técnicas, atualizando resumo...');
      atualizarInterfaceResumo(true);
    }, 500);
  }
  
  if (aba === 'resumo') {
    // Quando volta para o resumo, atualizar
    setTimeout(() => {
      console.log('🔄 Voltou para o resumo, verificando dados...');
      atualizarInterfaceResumo(true);
    }, 300);
  }
}

// ============================================
// 8. INICIALIZAÇÃO INTELIGENTE
// ============================================

function inicializarSistemaResumo() {
  if (resumoState.initialized) {
    console.log('⚠️ Sistema já inicializado');
    return;
  }
  
  console.log('🚀 INICIALIZANDO SISTEMA DE RESUMO...');
  
  // 1. Aguardar um pouco para garantir que o DOM está pronto
  setTimeout(() => {
    // 2. Criar elementos se necessário
    criarTabelaPericias();
    criarListaTecnicas();
    
    // 3. Aplicar estilos
    aplicarEstilosResumo();
    
    // 4. Configurar eventos
    configurarEventos();
    
    // 5. Primeira atualização (modo aguardando)
    console.log('⏳ Primeira atualização (modo aguardando)...');
    atualizarInterfaceResumo();
    
    resumoState.initialized = true;
    console.log('✅ Sistema de resumo inicializado!');
    
    // 6. Monitorar periodicamente
    resumoState.intervalId = setInterval(() => {
      const resumoAtivo = document.getElementById('resumo')?.classList.contains('active');
      if (resumoAtivo) {
        atualizarInterfaceResumo();
      }
    }, 5000);
    
  }, 1500); // Aguardar 1.5 segundos para tudo carregar
}

function configurarEventos() {
  // Monitorar cliques nas abas
  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.tab-btn');
    if (tabBtn && tabBtn.dataset.tab) {
      monitorarMudancaAba(tabBtn.dataset.tab);
    }
  });
  
  // Eventos customizados do sistema
  document.addEventListener('periciasAlteradas', () => {
    console.log('🎯 Evento: periciasAlteradas');
    atualizarInterfaceResumo(true);
  });
  
  document.addEventListener('tecnicasAlteradas', () => {
    console.log('🎯 Evento: tecnicasAlteradas');
    atualizarInterfaceResumo(true);
  });
  
  // Quando a página termina de carregar completamente
  window.addEventListener('load', () => {
    console.log('📄 Página completamente carregada');
    setTimeout(() => atualizarInterfaceResumo(true), 2000);
  });
}

// ============================================
// 9. FUNÇÕES AUXILIARES DE CRIAÇÃO
// ============================================

function criarTabelaPericias() {
  const card = document.querySelector('#resumo .card-tabela');
  if (!card) return;
  
  let table = card.querySelector('table');
  if (!table) {
    table = document.createElement('table');
    table.className = 'tabela-micro';
    card.appendChild(table);
  }
  
  let thead = table.querySelector('thead');
  if (!thead) {
    thead = document.createElement('thead');
    table.appendChild(thead);
  }
  thead.innerHTML = `
    <tr>
      <th>PERÍCIA</th>
      <th class="th-nivel">PONTOS</th>
      <th class="th-pontos">NH</th>
    </tr>
  `;
  
  let tbody = table.querySelector('tbody');
  if (!tbody) {
    tbody = document.createElement('tbody');
    table.appendChild(tbody);
  }
  tbody.id = 'tabelaPericiasResumo';
  
  console.log('✅ Tabela de perícias configurada');
}

function criarListaTecnicas() {
  const card = document.querySelector('#resumo .card-lista-micro');
  if (!card) return;
  
  let lista = card.querySelector('.micro-lista-scroll');
  if (!lista) {
    lista = document.createElement('div');
    lista.className = 'micro-lista-scroll';
    card.appendChild(lista);
  }
  lista.id = 'listaTecnicasResumo';
  
  console.log('✅ Lista de técnicas configurada');
}

// ============================================
// 10. ESTILOS CSS
// ============================================

function aplicarEstilosResumo() {
  const styleId = 'resumo-estilos-custom';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* Estilos existentes... */
    #tabelaPericiasResumo tr {
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    #tabelaPericiasResumo tr:hover {
      background: rgba(255, 140, 0, 0.1);
    }
    
    #tabelaPericiasResumo .td-nome {
      color: #ddd;
      font-size: 0.8rem;
      padding: 6px 8px;
      text-align: left;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    #tabelaPericiasResumo .td-pontos {
      color: #ffd700;
      font-weight: 700;
      font-size: 0.85rem;
      text-align: center;
      padding: 6px 4px;
      background: rgba(255, 215, 0, 0.15);
      border-radius: 4px;
      min-width: 45px;
    }
    
    #tabelaPericiasResumo .td-nh {
      color: #2ecc71;
      font-weight: 800;
      font-size: 0.9rem;
      text-align: center;
      padding: 6px 4px;
      background: rgba(46, 204, 113, 0.15);
      border-radius: 4px;
      min-width: 45px;
    }
    
    .tecnica-resumo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      margin-bottom: 6px;
      background: rgba(155, 89, 182, 0.1);
      border-radius: 6px;
      border-left: 3px solid #9b59b6;
      transition: all 0.2s;
    }
    
    .tecnica-resumo-item:hover {
      background: rgba(155, 89, 182, 0.2);
      transform: translateX(2px);
    }
    
    .tecnica-resumo-item .tecnica-nome {
      flex: 1;
      color: #eee;
      font-size: 0.85rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 10px;
    }
    
    .tecnica-resumo-item .tecnica-pontos {
      color: #ffd700;
      font-weight: 700;
      font-size: 0.85rem;
      padding: 4px 8px;
      background: rgba(255, 215, 0, 0.15);
      border-radius: 12px;
      min-width: 40px;
      text-align: center;
      margin-right: 8px;
    }
    
    .tecnica-resumo-item .tecnica-nh {
      color: #2ecc71;
      font-weight: 800;
      font-size: 0.9rem;
      padding: 4px 10px;
      background: rgba(46, 204, 113, 0.15);
      border-radius: 12px;
      min-width: 45px;
      text-align: center;
    }
    
    /* Estilos para estados de aguardando */
    .aguardando {
      color: #f39c12 !important;
      font-style: italic;
    }
    
    .spinner {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  
  document.head.appendChild(style);
  console.log('🎨 Estilos aplicados');
}

// ============================================
// 11. INICIALIZAÇÃO AUTOMÁTICA
// ============================================

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM carregado, iniciando sistema em 2s...');
  setTimeout(inicializarSistemaResumo, 2000);
});

// Inicializar se a página já estiver carregada
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('⚡ Página já carregada, iniciando...');
  setTimeout(inicializarSistemaResumo, 1000);
}

// ============================================
// 12. FUNÇÕES DE DEBUG E CONTROLE
// ============================================

window.debugResumo = function() {
  console.log('🐛 DEBUG RESUMO:');
  console.log('- Estado:', resumoState);
  console.log('- Cache:', resumoState.cache);
  console.log('- Tentativas:', resumoState.tentativas);
  console.log('- estadoPericias:', window.estadoPericias);
  console.log('- estadoTecnicas:', window.estadoTecnicas);
  console.log('- Aba resumo ativa:', document.getElementById('resumo')?.classList.contains('active'));
  
  // Verificar elementos HTML
  console.log('- Elementos:', {
    tabelaPericias: document.getElementById('tabelaPericiasResumo') ? '✅' : '❌',
    listaTecnicas: document.getElementById('listaTecnicasResumo') ? '✅' : '❌',
    periciasAprendidas: document.getElementById('pericias-aprendidas') ? '✅' : '❌',
    tecnicasAprendidas: document.getElementById('tecnicas-aprendidas') ? '✅' : '❌'
  });
  
  // Forçar atualização completa
  atualizarInterfaceResumo(true);
  
  return 'Debug realizado!';
};

window.forcarAtualizacaoResumo = function() {
  console.log('💥 FORÇANDO ATUALIZAÇÃO COMPLETA');
  resumoState.tentativas = 0;
  atualizarInterfaceResumo(true);
  return 'Atualização forçada!';
};

window.limparCacheResumo = function() {
  console.log('🧹 LIMPANDO CACHE DO RESUMO');
  resumoState.cache = {
    pericias: [],
    tecnicas: [],
    pontosPericias: 0,
    pontosTecnicas: 0
  };
  resumoState.tentativas = 0;
  sessionStorage.removeItem('periciasResumo');
  return 'Cache limpo!';
};

console.log('✅ RESUMO-PERICIAS-COMPLETO - VERSÃO DEFINITIVA - PRONTO');