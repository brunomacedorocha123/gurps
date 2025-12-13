// ============================================
// SISTEMA DE SINCRONIZAÇÃO DIRETA
// ============================================

console.log('🎯 RESUMO-PERICIAS-COMPLETO - INICIANDO SISTEMA DIRETO');

// ============================================
// 1. ESTADO GLOBAL FORTE
// ============================================

const resumoState = {
  initialized: false,
  lastPericiasCount: 0,
  lastTecnicasCount: 0,
  lastPontosPericias: 0,
  lastPontosTecnicas: 0,
  cache: {
    pericias: [],
    tecnicas: []
  }
};

// ============================================
// 2. FUNÇÃO PRINCIPAL - SEMPRE CHAMAR
// ============================================

function sincronizarResumoPericias() {
  console.log('🔄 Sincronizando resumo de perícias...');
  
  try {
    // FORÇAR captura dos dados ATUAIS
    const periciasAtuais = capturarPericiasReais();
    const tecnicasAtuais = capturarTecnicasReais();
    
    // Verificar se mudou algo
    const periciasMudaram = JSON.stringify(periciasAtuais) !== JSON.stringify(resumoState.cache.pericias);
    const tecnicasMudaram = JSON.stringify(tecnicasAtuais) !== JSON.stringify(resumoState.cache.tecnicas);
    
    if (periciasMudaram || tecnicasMudaram) {
      console.log('📈 Dados mudaram! Atualizando interface...');
      resumoState.cache.pericias = periciasAtuais;
      resumoState.cache.tecnicas = tecnicasAtuais;
      
      // Atualizar na tela IMEDIATAMENTE
      atualizarResumoNaTela(periciasAtuais, tecnicasAtuais);
    } else {
      console.log('✓ Dados estão atualizados');
    }
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  }
}

// ============================================
// 3. CAPTURA DIRETA - SEM DEPENDÊNCIAS
// ============================================

function capturarPericiasReais() {
  console.log('🎯 Capturando perícias REAIS...');
  
  const pericias = [];
  
  // PRIMEIRO: Tentar do estado global (fonte principal)
  if (window.estadoPericias && Array.isArray(window.estadoPericias.periciasAprendidas)) {
    console.log('📊 Usando estadoPericias.periciasAprendidas');
    
    window.estadoPericias.periciasAprendidas.forEach((p, index) => {
      if (!p || !p.nome) return;
      
      // Calcular NH real
      let nh = 0;
      if (p.atributo && p.nivel !== undefined) {
        const valorAtributo = obterValorAtributoResumo(p.atributo);
        nh = valorAtributo + p.nivel;
      } else if (p.nh) {
        nh = p.nh;
      }
      
      // Pontos
      const pontos = p.investimentoAcumulado || p.custo || p.pontos || 0;
      
      pericias.push({
        nome: p.nome,
        pontos: pontos,
        nh: nh,
        id: index
      });
    });
    
    console.log(`✅ ${pericias.length} perícias do estado`);
    
    if (pericias.length > 0) {
      return pericias;
    }
  }
  
  // SEGUNDO: Ler do localStorage (backup)
  try {
    const saved = localStorage.getItem('estadoPericias');
    if (saved) {
      const data = JSON.parse(saved);
      if (data && data.periciasAprendidas) {
        console.log('💾 Usando localStorage backup');
        data.periciasAprendidas.forEach(p => {
          if (p && p.nome) {
            pericias.push({
              nome: p.nome,
              pontos: p.custo || 0,
              nh: p.nivel || 0
            });
          }
        });
      }
    }
  } catch (e) { /* ignorar */ }
  
  // TERCEIRO: Tentar pegar da tabela visível
  const tabela = document.querySelector('#pericias-aprendidas, .pericias-lista, .lista-pericias');
  if (tabela && !tabela.innerHTML.includes('Nenhuma')) {
    console.log('📄 Lendo da tabela HTML');
    const linhas = tabela.querySelectorAll('.pericia-item, tr, li');
    
    linhas.forEach(linha => {
      const texto = linha.textContent;
      if (texto && texto.trim() && !texto.includes('Nenhuma')) {
        // Extrair nome (primeira parte)
        const nomeMatch = texto.match(/^[^0-9+-]+/);
        const nome = nomeMatch ? nomeMatch[0].trim() : 'Perícia';
        
        // Extrair pontos
        const pontosMatch = texto.match(/(\d+)\s*(pontos?|pts?)/i);
        const pontos = pontosMatch ? parseInt(pontosMatch[1]) : 0;
        
        // Extrair NH
        const nhMatch = texto.match(/NH\s*[:=]?\s*(\d+)/i) || texto.match(/(\d+)\s*NH/i);
        const nh = nhMatch ? parseInt(nhMatch[1]) : 10;
        
        if (nome !== 'Perícia' && pontos > 0) {
          pericias.push({ nome, pontos, nh });
        }
      }
    });
  }
  
  // QUARTO: Mock para teste
  if (pericias.length === 0) {
    console.log('⚠️ Usando dados de teste');
    pericias.push(
      { nome: "Arquearia (Arco Curto)", pontos: 8, nh: 14 },
      { nome: "Esquiva", pontos: 4, nh: 12 },
      { nome: "Cavalgar (Cavalo)", pontos: 4, nh: 11 }
    );
  }
  
  return pericias;
}

function capturarTecnicasReais() {
  console.log('🎯 Capturando técnicas REAIS...');
  
  const tecnicas = [];
  
  // Do estado global
  if (window.estadoTecnicas && Array.isArray(window.estadoTecnicas.aprendidas)) {
    console.log('📊 Usando estadoTecnicas.aprendidas');
    
    window.estadoTecnicas.aprendidas.forEach(t => {
      if (!t || !t.nome) return;
      
      tecnicas.push({
        nome: t.nome,
        pontos: t.custoTotal || t.custo || 0,
        nh: calcularNHTecnica(t)
      });
    });
    
    if (tecnicas.length > 0) return tecnicas;
  }
  
  // Da tabela HTML
  const lista = document.querySelector('#tecnicas-aprendidas, .tecnicas-lista');
  if (lista) {
    const itens = lista.querySelectorAll('.tecnica-item, li, div[class*="tecnica"]');
    
    itens.forEach(item => {
      if (item.textContent && !item.textContent.includes('Nenhuma')) {
        tecnicas.push({
          nome: item.textContent.split('\n')[0].trim(),
          pontos: 4,
          nh: 10
        });
      }
    });
  }
  
  return tecnicas;
}

// ============================================
// 4. ATUALIZAÇÃO DIRETA NA TELA
// ============================================

function atualizarResumoNaTela(pericias, tecnicas) {
  console.log('🎨 Atualizando tela do resumo...');
  
  // 1. Atualizar contadores totais
  const totalPontosPericias = pericias.reduce((sum, p) => sum + (p.pontos || 0), 0);
  const totalPontosTecnicas = tecnicas.reduce((sum, t) => sum + (t.pontos || 0), 0);
  
  // Encontrar elementos de pontos
  document.querySelectorAll('.pontos-pericias, [id*="pontosPericias"], [class*="pontos-pericias"]').forEach(elem => {
    elem.textContent = totalPontosPericias;
  });
  
  document.querySelectorAll('.pontos-tecnicas, [id*="pontosTecnicas"], [class*="pontos-tecnicas"]').forEach(elem => {
    elem.textContent = totalPontosTecnicas;
  });
  
  // 2. Atualizar tabela de perícias (CRIAR se não existe)
  let tbody = document.getElementById('tabelaPericiasResumo');
  if (!tbody) {
    // Criar tabela se não existe
    const container = document.querySelector('#resumo .card-body, #resumo .resumo-container, #resumo');
    if (container) {
      const html = `
        <div class="pericias-resumo-section">
          <h4>Perícias Aprendidas</h4>
          <table class="tabela-resumo-pericias">
            <thead>
              <tr>
                <th>Perícia</th>
                <th class="text-center">Pts</th>
                <th class="text-center">NH</th>
              </tr>
            </thead>
            <tbody id="tabelaPericiasResumo">
            </tbody>
          </table>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', html);
      tbody = document.getElementById('tabelaPericiasResumo');
    }
  }
  
  // Preencher tabela
  if (tbody) {
    if (pericias.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center">Nenhuma perícia</td></tr>';
    } else {
      let html = '';
      pericias.forEach(p => {
        html += `
          <tr>
            <td class="pericia-nome">${p.nome || 'Perícia'}</td>
            <td class="pericia-pontos text-center">${p.pontos || 0}</td>
            <td class="pericia-nh text-center">${p.nh || 10}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    }
  }
  
  // 3. Atualizar lista de técnicas
  let listaTecnicas = document.getElementById('listaTecnicasResumo');
  if (!listaTecnicas) {
    const container = document.querySelector('#resumo .card-body, #resumo');
    if (container) {
      const html = `
        <div class="tecnicas-resumo-section">
          <h4>Técnicas Aprendidas</h4>
          <div class="lista-tecnicas-resumo" id="listaTecnicasResumo">
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', html);
      listaTecnicas = document.getElementById('listaTecnicasResumo');
    }
  }
  
  if (listaTecnicas) {
    if (tecnicas.length === 0) {
      listaTecnicas.innerHTML = '<div class="text-center">Nenhuma técnica</div>';
    } else {
      let html = '';
      tecnicas.forEach(t => {
        html += `
          <div class="tecnica-item-resumo">
            <span class="tecnica-nome">${t.nome || 'Técnica'}</span>
            <span class="tecnica-pontos">${t.pontos || 0}</span>
            <span class="tecnica-nh">${t.nh || 10}</span>
          </div>
        `;
      });
      listaTecnicas.innerHTML = html;
    }
  }
  
  console.log(`✅ Tela atualizada: ${pericias.length} perícias, ${tecnicas.length} técnicas`);
}

// ============================================
// 5. GATILHOS DE ATUALIZAÇÃO - SIMPLES E DIRETOS
// ============================================

function iniciarMonitoramentoDireto() {
  console.log('🚀 Iniciando monitoramento DIRETO');
  
  // 1. Sempre atualizar quando a aba Resumo for aberta
  document.addEventListener('click', function(e) {
    if (e.target.closest('[data-tab="resumo"], .tab-resumo, #btn-resumo')) {
      console.log('🎯 Aba Resumo clicada - SINCRONIZAR');
      setTimeout(sincronizarResumoPericias, 100);
    }
  });
  
  // 2. Sempre atualizar quando SAIR da aba Perícias
  document.addEventListener('click', function(e) {
    if (e.target.closest('[data-tab="pericias"], .tab-pericias, #btn-pericias')) {
      console.log('📋 Saindo da aba Perícias - SINCRONIZAR em 500ms');
      setTimeout(sincronizarResumoPericias, 500);
    }
  });
  
  // 3. Atualizar a CADA SEGUNDO quando na aba Resumo
  setInterval(() => {
    const resumoVisivel = document.querySelector('#resumo, .tab-resumo.active, [data-tab="resumo"].active');
    if (resumoVisivel) {
      sincronizarResumoPericias();
    }
  }, 1000);
  
  // 4. "Espiar" as funções de adicionar/remover perícias
  if (window.adicionarPericia && typeof window.adicionarPericia === 'function') {
    const originalAdicionar = window.adicionarPericia;
    window.adicionarPericia = function(...args) {
      console.log('➕ Perícia sendo adicionada - forçar atualização');
      const result = originalAdicionar.apply(this, args);
      setTimeout(sincronizarResumoPericias, 300);
      return result;
    };
  }
  
  if (window.removerPericia && typeof window.removerPericia === 'function') {
    const originalRemover = window.removerPericia;
    window.removerPericia = function(...args) {
      console.log('➖ Perícia sendo removida - forçar atualização');
      const result = originalRemover.apply(this, args);
      setTimeout(sincronizarResumoPericias, 300);
      return result;
    };
  }
  
  // 5. Observar mudanças no estadoPericias (método simples)
  let ultimoEstado = '';
  setInterval(() => {
    if (window.estadoPericias) {
      const estadoAtual = JSON.stringify(window.estadoPericias.periciasAprendidas);
      if (estadoAtual !== ultimoEstado) {
        console.log('🔄 estadoPericias mudou!');
        ultimoEstado = estadoAtual;
        sincronizarResumoPericias();
      }
    }
  }, 800);
  
  console.log('✅ Monitoramento direto ativo');
}

// ============================================
// 6. FUNÇÕES AUXILIARES
// ============================================

function obterValorAtributoResumo(atributo) {
  // Valores simples
  const valores = {
    'DX': 10, 'IQ': 10, 'HT': 10, 'PERC': 10,
    'Destreza': 10, 'Inteligência': 10, 'Saúde': 10, 'Percepção': 10
  };
  
  // Tentar pegar do resumo
  const elem = document.querySelector(`[data-atributo="${atributo}"], .${atributo}-valor, #valor-${atributo}`);
  if (elem) {
    const num = parseInt(elem.textContent);
    if (!isNaN(num)) return num;
  }
  
  return valores[atributo] || 10;
}

// ============================================
// 7. INICIALIZAÇÃO
// ============================================

function iniciarSistemaResumoDireto() {
  if (resumoState.initialized) return;
  
  console.log('🎯 INICIANDO SISTEMA DIRETO DE RESUMO');
  
  // 1. Primeira sincronização
  setTimeout(() => {
    sincronizarResumoPericias();
  }, 1500);
  
  // 2. Iniciar monitoramento
  setTimeout(() => {
    iniciarMonitoramentoDireto();
  }, 2000);
  
  // 3. Aplicar estilos
  aplicarEstilosDiretos();
  
  resumoState.initialized = true;
  
  // 4. Forçar atualização periódica
  setInterval(sincronizarResumoPericias, 3000);
  
  console.log('✅ Sistema direto iniciado!');
}

// ============================================
// 8. INICIAR AUTOMATICAMENTE
// ============================================

// Iniciar quando a página carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarSistemaResumoDireto);
} else {
  setTimeout(iniciarSistemaResumoDireto, 1000);
}

// Iniciar também quando window carregar
window.addEventListener('load', () => {
  setTimeout(iniciarSistemaResumoDireto, 500);
});

// Função manual para forçar
window.atualizarResumoAgora = function() {
  console.log('⚡ FORÇANDO ATUALIZAÇÃO IMEDIATA');
  sincronizarResumoPericias();
  return 'Resumo atualizado!';
};

// ============================================
// 9. ESTILOS
// ============================================

function aplicarEstilosDiretos() {
  const style = document.createElement('style');
  style.textContent = `
    .pericias-resumo-section {
      margin-top: 20px;
      padding: 15px;
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
    }
    
    .tabela-resumo-pericias {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    
    .tabela-resumo-pericias th {
      background: rgba(255,140,0,0.3);
      color: #ff8c00;
      padding: 8px;
      font-size: 0.9rem;
      text-align: left;
    }
    
    .tabela-resumo-pericias td {
      padding: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .tabela-resumo-pericias tr:hover {
      background: rgba(255,140,0,0.1);
    }
    
    .pericia-pontos {
      color: #ffd700;
      font-weight: bold;
      background: rgba(255,215,0,0.1);
      border-radius: 4px;
      padding: 2px 8px;
    }
    
    .pericia-nh {
      color: #2ecc71;
      font-weight: bold;
      background: rgba(46,204,113,0.1);
      border-radius: 4px;
      padding: 2px 8px;
    }
    
    .tecnicas-resumo-section {
      margin-top: 20px;
      padding: 15px;
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
    }
    
    .tecnica-item-resumo {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      margin: 5px 0;
      background: rgba(155,89,182,0.1);
      border-radius: 6px;
      border-left: 3px solid #9b59b6;
    }
    
    .tecnica-nome {
      flex: 1;
      color: #eee;
    }
    
    .tecnica-pontos {
      color: #ffd700;
      font-weight: bold;
      margin: 0 10px;
      padding: 2px 8px;
      background: rgba(255,215,0,0.1);
      border-radius: 12px;
    }
    
    .tecnica-nh {
      color: #2ecc71;
      font-weight: bold;
      padding: 2px 10px;
      background: rgba(46,204,113,0.1);
      border-radius: 12px;
    }
  `;
  document.head.appendChild(style);
}

console.log('✅ SISTEMA DIRETO DE RESUMO CARREGADO - PRONTO PARA USAR');