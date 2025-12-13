// ============================================
// RESUMO-PERICIAS-FORÇADO.js
// Sistema que FORÇA carregamento das perícias
// ============================================

console.log('🚀 RESUMO-PERICIAS-FORÇADO - INICIANDO');

// ============================================
// 1. ESTADO
// ============================================

const resumoState = {
  pericias: [],
  tecnicas: [],
  carregando: false,
  tentativas: 0
};

// ============================================
// 2. FORÇAR CARREGAMENTO DAS PERÍCIAS
// ============================================

function forcarCarregamentoPericias() {
  console.log('⚡ FORÇANDO carregamento de perícias...');
  
  if (resumoState.carregando) {
    console.log('⏳ Já está carregando...');
    return;
  }
  
  resumoState.carregando = true;
  resumoState.tentativas++;
  
  // Método 1: Simular clique na aba de perícias
  const tabPericias = document.querySelector('[data-tab="pericias"], #tab-pericias, .tab-pericias');
  
  if (tabPericias) {
    console.log('🎯 Encontrada aba de perícias, clicando...');
    
    // Salvar aba atual
    const abaAtual = document.querySelector('.tab.active, [data-tab].active');
    
    // Clicar na aba de perícias
    tabPericias.click();
    
    // Aguardar carregamento
    setTimeout(() => {
      console.log('⏱️ Perícias devem estar carregadas, capturando...');
      
      // Capturar perícias AGORA
      const pericias = capturarPericiasDaAbaAtiva();
      
      if (pericias.length > 0) {
        console.log(`✅ ${pericias.length} perícias capturadas!`);
        resumoState.pericias = pericias;
        atualizarResumoComPericias(pericias);
      } else {
        console.log('⚠️ Nenhuma perícia capturada, tentando método 2...');
        tentarOutrosMetodos();
      }
      
      // Voltar para a aba original se estava em outra
      if (abaAtual && !abaAtual.classList.contains('active')) {
        setTimeout(() => {
          console.log('↩️ Voltando para aba anterior...');
          abaAtual.click();
        }, 500);
      }
      
      resumoState.carregando = false;
      
    }, 800); // Tempo para carregar as perícias
  } else {
    console.log('❌ Aba de perícias não encontrada');
    tentarOutrosMetodos();
  }
}

// ============================================
// 3. CAPTURAR PERÍCIAS DA ABA ATIVA
// ============================================

function capturarPericiasDaAbaAtiva() {
  console.log('📋 Capturando perícias da aba ativa...');
  
  const pericias = [];
  
  // Procurar na aba ATIVA (perícias)
  const abaAtiva = document.querySelector('.tab-content .active, [data-tab-content].active');
  
  if (abaAtiva) {
    console.log('🎯 Aba ativa encontrada:', abaAtiva.id || abaAtiva.className);
    
    // Método A: Tabela de perícias
    const tabelas = abaAtiva.querySelectorAll('table');
    tabelas.forEach((tabela, i) => {
      console.log(`📊 Verificando tabela ${i + 1}...`);
      
      const linhas = tabela.querySelectorAll('tr');
      linhas.forEach(linha => {
        const texto = linha.textContent.trim();
        if (texto && texto.length > 5 && 
            !texto.includes('Nenhuma') && 
            !texto.toLowerCase().includes('esquiva')) {
          
          // Extrair dados
          const dados = extrairDadosDaTabela(linha);
          if (dados.nome) {
            pericias.push(dados);
            console.log(`✅ Perícia: ${dados.nome}`);
          }
        }
      });
    });
    
    // Método B: Lista de itens
    const itens = abaAtiva.querySelectorAll('.pericia-item, .pericia-aprendida-item, [data-pericia]');
    itens.forEach(item => {
      const texto = item.textContent.trim();
      if (texto && texto.length > 5) {
        const dados = extrairDadosDeItem(texto);
        if (dados.nome && !dados.nome.toLowerCase().includes('esquiva')) {
          pericias.push(dados);
        }
      }
    });
  }
  
  // Se ainda não encontrou, procurar em TODO o documento
  if (pericias.length === 0) {
    console.log('🔍 Procurando em todo o documento...');
    
    const todasTabelas = document.querySelectorAll('table');
    todasTabelas.forEach(tabela => {
      // Verificar se é tabela de perícias (pela estrutura)
      const ths = tabela.querySelectorAll('th');
      const textoThs = Array.from(ths).map(th => th.textContent.toLowerCase()).join('');
      
      if (textoThs.includes('perícia') || textoThs.includes('nh') || textoThs.includes('nível')) {
        console.log('📋 Tabela de perícias identificada');
        
        const linhas = tabela.querySelectorAll('tr');
        linhas.forEach(linha => {
          const cols = linha.querySelectorAll('td');
          if (cols.length >= 3) {
            const nome = cols[0].textContent.trim();
            const pontos = cols[1].textContent.trim();
            const nh = cols[2].textContent.trim();
            
            if (nome && nome.length > 2 && !nome.toLowerCase().includes('esquiva')) {
              pericias.push({
                nome: nome,
                pontos: parseInt(pontos) || 0,
                nh: parseInt(nh) || 10
              });
            }
          }
        });
      }
    });
  }
  
  return pericias;
}

// ============================================
// 4. FUNÇÕES DE EXTRAÇÃO
// ============================================

function extrairDadosDaTabela(linha) {
  const cols = linha.querySelectorAll('td');
  
  if (cols.length >= 3) {
    return {
      nome: cols[0].textContent.trim(),
      pontos: parseInt(cols[1].textContent) || 0,
      nh: parseInt(cols[2].textContent) || 10
    };
  } else {
    // Tentar extrair do texto
    const texto = linha.textContent;
    return extrairDadosDeItem(texto);
  }
}

function extrairDadosDeItem(texto) {
  // Padrão: "Nome da Perícia 8 14" ou "Nome (Especialização) 8 NH 14"
  const partes = texto.split(/\s+/).filter(p => p.trim());
  
  if (partes.length >= 3) {
    // Últimos dois são provavelmente pontos e NH
    const pontos = parseInt(partes[partes.length - 2]) || 0;
    const nh = parseInt(partes[partes.length - 1]) || 10;
    
    // O resto é o nome
    const nomePartes = partes.slice(0, partes.length - 2);
    const nome = nomePartes.join(' ').trim();
    
    // Remover "NH" se estiver no nome
    const nomeLimpo = nome.replace(/\s+NH$/i, '');
    
    return {
      nome: nomeLimpo,
      pontos: pontos,
      nh: nh
    };
  }
  
  return { nome: '', pontos: 0, nh: 10 };
}

// ============================================
// 5. ATUALIZAR RESUMO
// ============================================

function atualizarResumoComPericias(pericias) {
  console.log('🎨 Atualizando resumo com', pericias.length, 'perícias');
  
  // Encontrar ou criar tabela no resumo
  let tabelaResumo = document.getElementById('tabelaPericiasResumo');
  
  if (!tabelaResumo) {
    console.log('📝 Criando tabela no resumo...');
    
    // Procurar onde colocar a tabela
    const resumoContainer = document.querySelector('#resumo, .resumo-container, [data-tab="resumo"].active');
    
    if (resumoContainer) {
      // Criar estrutura
      const html = `
        <div class="pericias-resumo-card" style="margin: 15px 0; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
          <h4 style="margin-bottom: 10px; color: #ff8c00;">Perícias Aprendidas</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 8px; background: rgba(255,140,0,0.3);">Perícia</th>
                <th style="text-align: center; padding: 8px; background: rgba(255,140,0,0.3);">Pontos</th>
                <th style="text-align: center; padding: 8px; background: rgba(255,140,0,0.3);">NH</th>
              </tr>
            </thead>
            <tbody id="tabelaPericiasResumo">
            </tbody>
          </table>
        </div>
      `;
      
      resumoContainer.insertAdjacentHTML('beforeend', html);
      tabelaResumo = document.getElementById('tabelaPericiasResumo');
    }
  }
  
  // Atualizar tabela
  if (tabelaResumo) {
    let html = '';
    
    pericias.forEach(p => {
      html += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
          <td style="padding: 8px; color: #ddd;">${p.nome}</td>
          <td style="padding: 8px; text-align: center; color: #ffd700; font-weight: bold;">${p.pontos}</td>
          <td style="padding: 8px; text-align: center; color: #2ecc71; font-weight: bold;">${p.nh}</td>
        </tr>
      `;
    });
    
    tabelaResumo.innerHTML = html;
    
    // Atualizar contador de pontos
    const totalPontos = pericias.reduce((sum, p) => sum + p.pontos, 0);
    document.querySelectorAll('.pontos-pericias, [id*="pontosPericias"]').forEach(elem => {
      elem.textContent = totalPontos;
    });
    
    console.log(`✅ Resumo atualizado com ${pericias.length} perícias (${totalPontos} pontos)`);
  }
}

// ============================================
// 6. TENTAR OUTROS MÉTODOS
// ============================================

function tentarOutrosMetodos() {
  console.log('🔄 Tentando métodos alternativos...');
  
  // Método 1: Buscar em localStorage
  try {
    const saved = localStorage.getItem('periciasSalvas');
    if (saved) {
      const data = JSON.parse(saved);
      if (Array.isArray(data) && data.length > 0) {
        console.log(`📦 ${data.length} perícias no localStorage`);
        resumoState.pericias = data;
        atualizarResumoComPericias(data);
        return;
      }
    }
  } catch (e) {}
  
  // Método 2: Tentar forçar função de carregamento do sistema
  if (window.carregarPericias && typeof window.carregarPericias === 'function') {
    console.log('🎛️ Executando carregarPericias() do sistema...');
    window.carregarPericias();
    setTimeout(() => {
      const pericias = capturarPericiasDaAbaAtiva();
      if (pericias.length > 0) {
        atualizarResumoComPericias(pericias);
      }
    }, 1000);
  }
  
  // Método 3: Verificar se há eventos que disparam carregamento
  const eventos = ['carregarPericias', 'loadPericias', 'loadSkills'];
  eventos.forEach(evento => {
    if (window[evento]) {
      console.log(`⚡ Disparando evento ${evento}...`);
      if (typeof window[evento] === 'function') {
        window[evento]();
      } else if (window[evento].dispatchEvent) {
        window[evento].dispatchEvent(new Event('load'));
      }
    }
  });
}

// ============================================
// 7. INICIALIZAÇÃO INTELIGENTE
// ============================================

function inicializarResumoPericias() {
  console.log('🎯 Inicializando sistema de resumo...');
  
  // 1. Primeiro, tentar capturar sem forçar
  setTimeout(() => {
    const pericias = capturarPericiasDaAbaAtiva();
    
    if (pericias.length > 0) {
      console.log(`✅ ${pericias.length} perícias capturadas na inicialização`);
      atualizarResumoComPericias(pericias);
    } else {
      console.log('⚠️ Nenhuma perícia capturada, forçando carregamento...');
      
      // Esperar um pouco e forçar
      setTimeout(() => {
        forcarCarregamentoPericias();
      }, 1500);
    }
  }, 1000);
  
  // 2. Configurar monitoramento
  configurarMonitoramentoInteligente();
}

// ============================================
// 8. MONITORAMENTO INTELIGENTE
// ============================================

function configurarMonitoramentoInteligente() {
  console.log('👁️ Configurando monitoramento inteligente...');
  
  // Sempre que clicar na aba resumo, atualizar
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab="resumo"], #btn-resumo, .tab-resumo');
    if (btn) {
      console.log('🎯 Aba resumo clicada - atualizando...');
      setTimeout(() => {
        forcarCarregamentoPericias();
      }, 300);
    }
  });
  
  // Sempre que SAIR da aba perícias, atualizar
  let estavaEmPericias = false;
  
  setInterval(() => {
    const emPericias = document.querySelector('[data-tab="pericias"].active, .tab-pericias.active');
    
    if (estavaEmPericias && !emPericias) {
      console.log('🚪 Saiu da aba perícias - atualizando resumo...');
      setTimeout(forcarCarregamentoPericias, 200);
    }
    
    estavaEmPericias = !!emPericias;
  }, 500);
  
  // Atualizar a cada 2 segundos quando na aba resumo
  setInterval(() => {
    const noResumo = document.querySelector('[data-tab="resumo"].active, #resumo.active');
    if (noResumo) {
      // Verificar se precisa atualizar
      if (resumoState.tentativas < 3) { // Limitar tentativas
        forcarCarregamentoPericias();
      }
    }
  }, 2000);
}

// ============================================
// 9. INICIAR
// ============================================

// Iniciar quando a página carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(inicializarResumoPericias, 2000);
  });
} else {
  setTimeout(inicializarResumoPericias, 2000);
}

// Função para forçar manualmente
window.forcarAtualizacaoPericias = function() {
  console.clear();
  console.log('⚡ FORÇANDO ATUALIZAÇÃO MANUAL');
  forcarCarregamentoPericias();
  return 'Forçando atualização...';
};

// Verificar estado atual
window.verificarPericias = function() {
  console.log('🔍 ESTADO ATUAL:');
  console.log('- Perícias capturadas:', resumoState.pericias.length);
  console.log('- Tentativas:', resumoState.tentativas);
  console.log('- Carregando:', resumoState.carregando);
  console.log('- Perícias:', resumoState.pericias);
  
  return resumoState.pericias;
};

console.log('✅ Sistema carregado. Use window.forcarAtualizacaoPericias() para testar');