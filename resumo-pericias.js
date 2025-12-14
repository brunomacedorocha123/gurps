// ============================================
// RESUMO-PERICIAS-COMPLETO-SILENCIOSO.js
// ============================================

const resumoState = {
  initialized: false,
  intervalId: null,
  lastUpdate: null,
  cache: { pericias: [], tecnicas: [], pontosPericias: 0, pontosTecnicas: 0 }
};

// Função principal de captura COMPLETA
function capturarPericiasDireto() {
  try {
    const pericias = [];
    let totalPontos = 0;
    
    // Método 1: estadoPericias
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
      window.estadoPericias.periciasAprendidas.forEach(p => {
        if (!p) return;
        
        const atributoBase = obterValorAtributo(p.atributo);
        const nh = atributoBase + (p.nivel || 0);
        const pontos = p.investimentoAcumulado || p.custo || 0;
        
        pericias.push({ nome: p.nome || 'Perícia', pontos: pontos, nh: nh });
        totalPontos += pontos;
      });
      
      if (pericias.length > 0) {
        return { pericias, totalPontos };
      }
    }
    
    // Método 2: Tabela HTML
    const tabelaContainer = document.getElementById('pericias-aprendidas');
    if (tabelaContainer && !tabelaContainer.innerHTML.includes('Nenhuma perícia')) {
      const itens = tabelaContainer.querySelectorAll('.pericia-aprendida-item');
      
      itens.forEach(item => {
        const nomeElem = item.querySelector('.pericia-aprendida-nome, h4');
        let nome = nomeElem ? nomeElem.textContent.trim() : '';
        
        if (nome) {
          nome = nome.replace(/<[^>]*>/g, '');
          
          let pontos = 0;
          const pontosElem = item.querySelector('.pericia-aprendida-custo');
          if (pontosElem) {
            const match = pontosElem.textContent.match(/(\d+)/);
            pontos = match ? parseInt(match[1]) : 0;
          }
          
          let nh = 0;
          const nhElem = item.querySelector('.pericia-aprendida-nh');
          if (nhElem) {
            const match = nhElem.textContent.match(/(\d+)/);
            nh = match ? parseInt(match[1]) : 0;
          } else {
            const atributo = extrairAtributo(item.textContent);
            nh = obterValorAtributo(atributo) + extrairNivel(item.textContent);
          }
          
          pericias.push({ nome, pontos, nh });
          totalPontos += pontos;
        }
      });
    }
    
    return { pericias, totalPontos };
    
  } catch (error) {
    return { pericias: [], totalPontos: 0 };
  }
}

function capturarTecnicasDireto() {
  try {
    const tecnicas = [];
    let totalPontos = 0;
    
    if (window.estadoTecnicas && window.estadoTecnicas.aprendidas) {
      window.estadoTecnicas.aprendidas.forEach(t => {
        if (!t) return;
        
        let nh = calcularNHTecnica(t);
        const pontos = t.custoTotal || 0;
        
        tecnicas.push({ nome: t.nome || 'Técnica', pontos: pontos, nh: nh });
        totalPontos += pontos;
      });
      
      if (tecnicas.length > 0) {
        return { tecnicas, totalPontos };
      }
    }
    
    const listaContainer = document.getElementById('tecnicas-aprendidas');
    if (listaContainer && !listaContainer.innerHTML.includes('Nenhuma técnica')) {
      const itens = listaContainer.querySelectorAll('.pericia-item, .tecnica-item');
      
      itens.forEach(item => {
        const nomeElem = item.querySelector('h3, h4');
        let nome = nomeElem ? nomeElem.textContent.trim() : '';
        
        if (nome && !nome.includes('Nenhuma')) {
          nome = nome.replace(/[✅▶]/g, '').trim();
          
          let pontos = 0;
          const texto = item.textContent;
          const pontosMatch = texto.match(/(\d+)\s*pts?/);
          if (pontosMatch) pontos = parseInt(pontosMatch[1]);
          
          let nh = 0;
          const nhMatch = texto.match(/NH\s*(\d+)/i);
          if (nhMatch) {
            nh = parseInt(nhMatch[1]);
          } else {
            nh = calcularNHTecnica({ nome: nome });
          }
          
          tecnicas.push({ nome, pontos, nh });
          totalPontos += pontos;
        }
      });
    }
    
    return { tecnicas, totalPontos };
    
  } catch (error) {
    return { tecnicas: [], totalPontos: 0 };
  }
}

// Funções auxiliares COMPLETAS
function obterValorAtributo(atributo) {
  const elem = document.getElementById('resumo' + atributo);
  if (elem) {
    const valor = parseInt(elem.textContent || '10');
    return isNaN(valor) ? 10 : valor;
  }
  return 10;
}

function extrairAtributo(texto) {
  if (texto.includes('DX')) return 'DX';
  if (texto.includes('IQ')) return 'IQ';
  if (texto.includes('HT')) return 'HT';
  if (texto.includes('PERC')) return 'PERC';
  return 'IQ';
}

function extrairNivel(texto) {
  const match = texto.match(/[+-]\s*(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function calcularNHTecnica(tecnica) {
  if (tecnica.nome && tecnica.nome.includes('Arquearia Montada')) {
    let nhArco = 10;
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
      const arco = window.estadoPericias.periciasAprendidas.find(
        p => p.nome && p.nome.includes('Arco')
      );
      if (arco) {
        nhArco = obterValorAtributo(arco.atributo) + (arco.nivel || 0);
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

// Sistema de atualização COMPLETO
function atualizarInterfaceResumo() {
  try {
    const periciasData = capturarPericiasDireto();
    const tecnicasData = capturarTecnicasDireto();
    
    resumoState.cache.pericias = periciasData.pericias;
    resumoState.cache.tecnicas = tecnicasData.tecnicas;
    resumoState.cache.pontosPericias = periciasData.totalPontos;
    resumoState.cache.pontosTecnicas = tecnicasData.totalPontos;
    resumoState.lastUpdate = new Date();
    
    const pontosPericiasElem = document.getElementById('pontosPericias');
    const pontosTecnicasElem = document.getElementById('pontosTecnicas');
    
    if (pontosPericiasElem) pontosPericiasElem.textContent = periciasData.totalPontos;
    if (pontosTecnicasElem) pontosTecnicasElem.textContent = tecnicasData.totalPontos;
    
    atualizarTabelaPericias(periciasData.pericias);
    atualizarListaTecnicas(tecnicasData.tecnicas);
    
  } catch (error) {
    // Silencioso
  }
}

function atualizarTabelaPericias(pericias) {
  const tbody = document.getElementById('tabelaPericiasResumo');
  if (!tbody) return;
  
  if (!pericias || pericias.length === 0) {
    tbody.innerHTML = `
      <tr class="vazio">
        <td colspan="3">Nenhuma perícia aprendida</td>
      </tr>
    `;
    return;
  }
  
  let html = '';
  pericias.forEach(pericia => {
    let nomeDisplay = pericia.nome || 'Perícia';
    if (nomeDisplay.length > 25) nomeDisplay = nomeDisplay.substring(0, 22) + '...';
    nomeDisplay = nomeDisplay.replace(/<[^>]*>/g, '');
    
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

// Sistema de inicialização COMPLETO
function inicializarSistemaResumo() {
  if (resumoState.initialized) return;
  
  criarTabelaPericias();
  criarListaTecnicas();
  aplicarEstilosResumo();
  
  atualizarInterfaceResumo();
  
  configurarMonitoramento();
  
  resumoState.initialized = true;
}

function criarTabelaPericias() {
  const card = document.querySelector('#resumo .card-tabela');
  if (!card) return;
  
  const existingTbody = card.querySelector('tbody');
  if (existingTbody) {
    existingTbody.id = 'tabelaPericiasResumo';
    return;
  }
  
  const table = card.querySelector('table') || document.createElement('table');
  table.className = 'tabela-micro';
  
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>PERÍCIA</th>
      <th class="th-nivel">PONTOS</th>
      <th class="th-pontos">NH</th>
    </tr>
  `;
  
  const tbody = document.createElement('tbody');
  tbody.id = 'tabelaPericiasResumo';
  
  table.appendChild(thead);
  table.appendChild(tbody);
  
  const container = card.querySelector('.tabela-micro-container');
  if (container) {
    container.appendChild(table);
  } else {
    card.appendChild(table);
  }
}

function criarListaTecnicas() {
  const card = document.querySelector('#resumo .card-lista-micro');
  if (!card) return;
  
  const existingList = card.querySelector('.micro-lista-scroll');
  if (existingList) {
    existingList.id = 'listaTecnicasResumo';
    return;
  }
  
  const container = card.querySelector('.micro-scroll-container') || card;
  const lista = document.createElement('div');
  lista.id = 'listaTecnicasResumo';
  lista.className = 'micro-lista-scroll';
  
  container.appendChild(lista);
}

function aplicarEstilosResumo() {
  const styleId = 'resumo-estilos-custom';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    #tabelaPericiasResumo tr { border-bottom: 1px solid rgba(255,255,255,0.05); }
    #tabelaPericiasResumo tr:hover { background: rgba(255, 140, 0, 0.1); }
    #tabelaPericiasResumo .td-nome {
      color: #ddd; font-size: 0.8rem; padding: 6px 8px; text-align: left;
      max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    #tabelaPericiasResumo .td-pontos {
      color: #ffd700; font-weight: 700; font-size: 0.85rem; text-align: center;
      padding: 6px 4px; background: rgba(255, 215, 0, 0.15); border-radius: 4px;
      min-width: 45px;
    }
    #tabelaPericiasResumo .td-nh {
      color: #2ecc71; font-weight: 800; font-size: 0.9rem; text-align: center;
      padding: 6px 4px; background: rgba(46, 204, 113, 0.15); border-radius: 4px;
      min-width: 45px;
    }
    .tecnica-resumo-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 10px; margin-bottom: 6px; background: rgba(155, 89, 182, 0.1);
      border-radius: 6px; border-left: 3px solid #9b59b6; transition: all 0.2s;
    }
    .tecnica-resumo-item:hover {
      background: rgba(155, 89, 182, 0.2); transform: translateX(2px);
    }
    .tecnica-resumo-item .tecnica-nome {
      flex: 1; color: #eee; font-size: 0.85rem; overflow: hidden;
      text-overflow: ellipsis; white-space: nowrap; padding-right: 10px;
    }
    .tecnica-resumo-item .tecnica-pontos {
      color: #ffd700; font-weight: 700; font-size: 0.85rem; padding: 4px 8px;
      background: rgba(255, 215, 0, 0.15); border-radius: 12px; min-width: 40px;
      text-align: center; margin-right: 8px;
    }
    .tecnica-resumo-item .tecnica-nh {
      color: #2ecc71; font-weight: 800; font-size: 0.9rem; padding: 4px 10px;
      background: rgba(46, 204, 113, 0.15); border-radius: 12px; min-width: 45px;
      text-align: center;
    }
  `;
  
  document.head.appendChild(style);
}

function configurarMonitoramento() {
  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.tab-btn');
    if (tabBtn && tabBtn.dataset.tab === 'resumo') {
      setTimeout(atualizarInterfaceResumo, 300);
    }
  });
  
  const tabPericias = document.querySelector('[data-tab="pericias"]');
  if (tabPericias) {
    tabPericias.addEventListener('click', () => {
      setTimeout(atualizarInterfaceResumo, 1000);
    });
  }
  
  resumoState.intervalId = setInterval(() => {
    const resumoAtivo = document.getElementById('resumo')?.classList.contains('active');
    if (resumoAtivo) {
      atualizarInterfaceResumo();
    }
  }, 3000);
  
  document.addEventListener('periciasAlteradas', atualizarInterfaceResumo);
  document.addEventListener('tecnicasAlteradas', atualizarInterfaceResumo);
}

// Inicialização automática
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(inicializarSistemaResumo, 1000);
});

window.addEventListener('load', () => {
  setTimeout(() => {
    if (!resumoState.initialized) {
      inicializarSistemaResumo();
    }
  }, 2000);
});

window.iniciarResumoPericias = inicializarSistemaResumo;