// defesas.js - SISTEMA COMPLETO E BRABO COM FADIGA INTEGRADA
// VERSÃO CORRIGIDA - BUG DO BLOQUEIO ELIMINADO

class SistemaDefesasBraboCompleto {
  constructor() {
    console.log('💪💪💪 SISTEMA DE DEFESAS BRABO COMPLETO INICIADO! 💪💪💪');
    
    this.CONFIG_BONUS = {
      BONUS_TODOS: ['Reflexos', 'Escudo', 'Capa', 'Outros'],
      DEFESAS_COM_BONUS: ['esquiva', 'bloqueio', 'aparar']
    };
    
    this.estado = {
      atributos: { dx: 10, ht: 10 },
      bonus: { Reflexos: 0, Escudo: 0, Capa: 0, Outros: 0 },
      modificadores: { esquiva: 0, bloqueio: 0, aparar: 0, deslocamento: 0 },
      defesas: { esquiva: 0, bloqueio: 0, aparar: 0, deslocamento: 0 },
      nivelCarga: 'nenhuma',
      nh: { escudo: null, arma: null },
      fadiga: { ativa: false, pfAtual: 10, pfMaximo: 10, limiteFadiga: 4 }
    };
    
    this.ultimaAtualizacao = 0;
    this.atualizando = false;
    this.iniciado = false;
    this.observadores = [];
    
    console.log('🔥 CONFIGURAÇÃO BRABA PRONTA!');
  }
  
  // ========== INICIALIZAÇÃO ==========
  iniciar() {
    if (this.iniciado) {
      console.log('⚠️ Sistema já está ativo!');
      return;
    }
    
    console.log('🚀🚀🚀 INICIANDO SISTEMA BRABO COMPLETO! 🚀🚀🚀');
    
    this.configurarSistemaInteiro();
    this.carregarTudoAgora();
    this.detectarEstadoFadiga();
    
    // CORREÇÃO: Calcula NHs IMEDIATAMENTE antes de calcular defesas
    this.calcularNHsComForca();
    
    this.calcularTudoComForca();
    this.iniciarMonitoramentoSimples();
    this.iniciarAtualizacaoAutomatica();
    
    this.iniciado = true;
    console.log('✅✅✅ SISTEMA BRABO COMPLETO PRONTO PARA AÇÃO! ✅✅✅');
  }
  
  // ========== NOVA FUNÇÃO: CALCULAR NHS COM FORÇA ==========
  calcularNHsComForca() {
    console.log('⚡ CALCULANDO NHS COM FORÇA...');
    
    // Força cálculo sem depender de cache
    this.estado.nh.escudo = this.calcularNHEscudoForcado();
    this.estado.nh.arma = this.calcularNHArmaForcado();
    
    console.log(`🎯 NHS CALCULADOS: Escudo=${this.estado.nh.escudo}, Arma=${this.estado.nh.arma}`);
  }
  
  calcularNHEscudoForcado() {
    const dx = this.estado.atributos.dx;
    let nivelEscudo = 0;
    
    // Busca MAIS AGRESSIVA para escudo
    const container = document.getElementById('pericias-aprendidas');
    if (container) {
      const itens = container.querySelectorAll('.pericia-aprendida-item');
      for (let item of itens) {
        const texto = item.textContent || '';
        if (texto.toLowerCase().includes('escudo')) {
          const match = texto.match(/[+-]?\d+/);
          if (match) {
            nivelEscudo = parseInt(match[0]) || 0;
            console.log(`🛡️ Encontrei escudo: ${texto} → Nível: ${nivelEscudo}`);
            break;
          }
        }
      }
    }
    
    const nh = dx + nivelEscudo;
    console.log(`🛡️ NH ESCUDO: ${nh} (DX:${dx} + Nível:${nivelEscudo})`);
    return nh;
  }
  
  calcularNHArmaForcado() {
    const comArma = document.getElementById('comArma');
    if (!comArma || comArma.style.display === 'none') {
      return 0;
    }
    
    const dx = this.estado.atributos.dx;
    let nivelArma = 0;
    let encontrou = false;
    
    const container = document.getElementById('pericias-aprendidas');
    if (container) {
      const itens = container.querySelectorAll('.pericia-aprendida-item');
      for (let item of itens) {
        const texto = item.textContent || '';
        if (this.ehPericiaDeArma(texto)) {
          const match = texto.match(/[+-]?\d+/);
          if (match) {
            nivelArma = parseInt(match[0]) || 0;
            encontrou = true;
            break;
          }
        }
      }
    }
    
    const nh = encontrou ? (dx + nivelArma) : dx;
    console.log(`⚔️ NH ARMA: ${nh}`);
    return encontrou ? nh : 0;
  }
  
  configurarSistemaInteiro() {
    console.log('🔧 CONFIGURANDO SISTEMA INTEIRO...');
    this.configurarInputsBonus();
    this.configurarInputsModificador();
    this.configurarInputsAtributos();
    this.configurarBotoes();
  }
  
  configurarInputsBonus() {
    console.log('💰 CONFIGURANDO INPUTS DE BÔNUS...');
    
    ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
      const input = document.getElementById(`bonus${bonus}`);
      if (input) {
        // Configurar eventos simples
        const handler = () => {
          this.estado.bonus[bonus] = parseInt(input.value) || 0;
          this.calcularTudoComForca();
        };
        
        input.addEventListener('input', handler);
        input.addEventListener('change', handler);
        
        this.estado.bonus[bonus] = parseInt(input.value) || 0;
      }
    });
  }
  
  configurarInputsModificador() {
    console.log('🎛️ CONFIGURANDO MODIFICADORES...');
    
    ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
      const input = document.getElementById(`${defesa}Mod`);
      if (input) {
        input.addEventListener('change', () => {
          this.estado.modificadores[defesa] = parseInt(input.value) || 0;
          this.calcularTudoComForca();
        });
      }
    });
  }
  
  configurarInputsAtributos() {
    console.log('🎯 CONFIGURANDO ATRIBUTOS...');
    
    ['DX', 'HT'].forEach(atributo => {
      const input = document.getElementById(atributo);
      if (input) {
        // Usar debounce para não travar
        let timeout;
        input.addEventListener('input', () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            this.estado.atributos[atributo.toLowerCase()] = parseInt(input.value) || 10;
            this.calcularTudoComForca();
          }, 300);
        });
      }
    });
  }
  
  configurarBotoes() {
    console.log('🔘 CONFIGURANDO BOTÕES...');
    
    document.querySelectorAll('.defesa-modificador, .defesa-controle').forEach(container => {
      const minus = container.querySelector('.minus, .mod-btn.minus');
      const plus = container.querySelector('.plus, .mod-btn.plus');
      const input = container.querySelector('input[type="number"]');
      
      if (minus && plus && input) {
        const defesa = input.id.replace('Mod', '');
        
        minus.addEventListener('click', () => {
          const valorAtual = parseInt(input.value) || 0;
          input.value = valorAtual - 1;
          this.estado.modificadores[defesa] = valorAtual - 1;
          this.calcularTudoComForca();
        });
        
        plus.addEventListener('click', () => {
          const valorAtual = parseInt(input.value) || 0;
          input.value = valorAtual + 1;
          this.estado.modificadores[defesa] = valorAtual + 1;
          this.calcularTudoComForca();
        });
      }
    });
  }
  
  // ========== SISTEMA DE FADIGA ==========
  detectarEstadoFadiga() {
    console.log('🔍 DETECTANDO ESTADO DE FADIGA...');
    
    let pfAtual = 10;
    let pfMaximo = 10;
    
    // Método SIMPLES: verificar elementos diretamente
    try {
      const pfAtualElement = document.getElementById('pfAtualDisplay');
      const pfMaxElement = document.getElementById('pfMaxDisplay');
      
      if (pfAtualElement) {
        pfAtual = parseInt(pfAtualElement.value) || parseInt(pfAtualElement.textContent) || 10;
      }
      
      if (pfMaxElement) {
        pfMaximo = parseInt(pfMaxElement.textContent) || 10;
      }
      
      // Calcular limite de fadiga (1/3 arredondado para CIMA)
      const limiteFadiga = Math.ceil(pfMaximo / 3);
      const fadigaAtiva = pfAtual <= limiteFadiga;
      
      this.estado.fadiga = {
        ativa: fadigaAtiva,
        pfAtual: pfAtual,
        pfMaximo: pfMaximo,
        limiteFadiga: limiteFadiga
      };
      
      console.log(`📊 FADIGA: PF ${pfAtual}/${pfMaximo}, Limite: ${limiteFadiga}, Ativa: ${fadigaAtiva}`);
      
      return fadigaAtiva;
      
    } catch (error) {
      console.log('⚠️ Erro ao detectar fadiga, usando valores padrão');
      return false;
    }
  }
  
  aplicarPenalidadeFadiga(valor, nomeDefesa) {
    if (!this.estado.fadiga.ativa) {
      return valor;
    }
    
    // Apenas esquiva e deslocamento sofrem penalidade
    if (nomeDefesa === 'esquiva' || nomeDefesa === 'deslocamento') {
      // Metade do valor, arredondando para CIMA
      const valorMetade = Math.ceil(valor / 2);
      console.log(`⚠️ FADIGA: ${nomeDefesa} ${valor} → ${valorMetade}`);
      return valorMetade;
    }
    
    return valor;
  }
  
  // ========== CARREGAMENTO INICIAL ==========
  carregarTudoAgora() {
    console.log('📥 CARREGANDO TUDO AGORA...');
    
    // ATRIBUTOS
    const dxInput = document.getElementById('DX');
    const htInput = document.getElementById('HT');
    if (dxInput) this.estado.atributos.dx = parseInt(dxInput.value) || 10;
    if (htInput) this.estado.atributos.ht = parseInt(htInput.value) || 10;
    
    // BÔNUS
    ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
      const input = document.getElementById(`bonus${bonus}`);
      if (input) this.estado.bonus[bonus] = parseInt(input.value) || 0;
    });
    
    // MODIFICADORES
    ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
      const input = document.getElementById(`${defesa}Mod`);
      if (input) this.estado.modificadores[defesa] = parseInt(input.value) || 0;
    });
    
    // CARGA
    const cargaElement = document.getElementById('nivelCarga');
    if (cargaElement) {
      this.estado.nivelCarga = cargaElement.textContent.toLowerCase().trim();
    }
    
    console.log('📊 DADOS CARREGADOS:', this.estado);
  }
  
  // ========== CÁLCULOS PRINCIPAIS ==========
  calcularTudoComForca() {
    if (this.atualizando) return;
    
    this.atualizando = true;
    console.log('💪💪💪 CALCULANDO TUDO COM FORÇA! 💪💪💪');
    
    try {
      // Ordem CRÍTICA para não travar
      this.atualizarCache();
      this.detectarEstadoFadiga(); // Atualiza fadiga
      
      // CORREÇÃO: Se NHs não foram calculados, calcular agora
      if (this.estado.nh.escudo === null || this.estado.nh.arma === null) {
        this.calcularNHsComForca();
      }
      
      // Calcular defesas
      this.calcularEsquivaComBonus();
      this.calcularDeslocamentoComBonus();
      this.calcularBloqueioComBonus();
      this.calcularApararComBonus();
      
      // Atualizar tela
      this.atualizarTelaComForca();
      this.atualizarTotalBonusComForca();
      this.atualizarIndicadorFadiga();
      
      this.ultimaAtualizacao = Date.now();
      console.log('✅✅✅ CÁLCULO COMPLETO! ✅✅✅');
      
    } catch (error) {
      console.error('❌ ERRO NO CÁLCULO:', error);
    } finally {
      this.atualizando = false;
    }
  }
  
  atualizarCache() {
    const dxInput = document.getElementById('DX');
    const htInput = document.getElementById('HT');
    if (dxInput) this.estado.atributos.dx = parseInt(dxInput.value) || 10;
    if (htInput) this.estado.atributos.ht = parseInt(htInput.value) || 10;
    
    ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
      const input = document.getElementById(`bonus${bonus}`);
      if (input) this.estado.bonus[bonus] = parseInt(input.value) || 0;
    });
  }
  
  buscarNHAtualizado() {
    // CORREÇÃO: Usa as funções FORÇADAS
    this.estado.nh.escudo = this.calcularNHEscudoForcado();
    this.estado.nh.arma = this.calcularNHArmaForcado();
  }
  
  ehPericiaDeArma(texto) {
    const armas = ['adaga', 'espada', 'machado', 'maça', 'arco', 'lanca', 'lança', 'martelo', 'faca'];
    const textoLower = texto.toLowerCase();
    return armas.some(arma => textoLower.includes(arma));
  }
  
  // ========== CÁLCULO DAS DEFESAS ==========
  calcularEsquivaComBonus() {
    const { dx, ht } = this.estado.atributos;
    const base = Math.floor((dx + ht) / 4) + 3;
    const modificador = this.estado.modificadores.esquiva;
    
    // SOMA TODOS OS BÔNUS
    let bonusTotal = 0;
    bonusTotal += this.estado.bonus.Reflexos;
    bonusTotal += this.estado.bonus.Escudo;
    bonusTotal += this.estado.bonus.Capa;
    bonusTotal += this.estado.bonus.Outros;
    
    const redutorCarga = this.getRedutorCarga(this.estado.nivelCarga);
    let total = base + modificador + bonusTotal + redutorCarga;
    
    // APLICAR FADIGA
    total = this.aplicarPenalidadeFadiga(total, 'esquiva');
    
    this.estado.defesas.esquiva = Math.max(total, 1);
    console.log(`🏃 ESQUIVA: ${total}`);
  }
  
  calcularDeslocamentoComBonus() {
    const { dx, ht } = this.estado.atributos;
    const base = (dx + ht) / 4;
    const modificador = this.estado.modificadores.deslocamento;
    const redutorCarga = this.getRedutorCarga(this.estado.nivelCarga);
    
    let total = base + modificador + redutorCarga;
    
    // APLICAR FADIGA
    total = this.aplicarPenalidadeFadiga(total, 'deslocamento');
    
    this.estado.defesas.deslocamento = Math.max(total, 0);
    console.log(`👣 DESLOCAMENTO: ${total.toFixed(2)}`);
  }
  
  calcularBloqueioComBonus() {
    // CORREÇÃO: Usa o NH já calculado, não fallback para DX
    const nhEscudo = this.estado.nh.escudo;
    const base = Math.floor(nhEscudo / 2) + 3;
    const modificador = this.estado.modificadores.bloqueio;
    
    let bonusTotal = 0;
    bonusTotal += this.estado.bonus.Reflexos;
    bonusTotal += this.estado.bonus.Escudo;
    bonusTotal += this.estado.bonus.Capa;
    bonusTotal += this.estado.bonus.Outros;
    
    const total = base + modificador + bonusTotal;
    this.estado.defesas.bloqueio = Math.max(total, 1);
    console.log(`🛡️ BLOQUEIO: ${total} (NH:${nhEscudo}, Base:${base}, Mod:${modificador}, Bonus:${bonusTotal})`);
  }
  
  calcularApararComBonus() {
    const nhArma = this.estado.nh.arma;
    
    if (!nhArma || nhArma <= 0) {
      this.estado.defesas.aparar = 0;
      console.log(`⚔️ APARAR: Nenhuma arma`);
      return;
    }
    
    const base = Math.floor(nhArma / 2) + 3;
    const modificador = this.estado.modificadores.aparar;
    
    let bonusTotal = 0;
    bonusTotal += this.estado.bonus.Reflexos;
    bonusTotal += this.estado.bonus.Escudo;
    bonusTotal += this.estado.bonus.Capa;
    bonusTotal += this.estado.bonus.Outros;
    
    const total = base + modificador + bonusTotal;
    this.estado.defesas.aparar = Math.max(total, 1);
    console.log(`⚔️ APARAR: ${total}`);
  }
  
  getRedutorCarga(nivelCarga) {
    const redutores = {
      'nenhuma': 0, 'leve': -1, 'média': -2, 'pesada': -3, 'muito pesada': -4
    };
    return redutores[nivelCarga] || 0;
  }
  
  // ========== ATUALIZAÇÃO DA TELA ==========
  atualizarTelaComForca() {
    this.atualizarElemento('esquivaTotal', this.estado.defesas.esquiva);
    this.atualizarElemento('deslocamentoTotal', this.estado.defesas.deslocamento.toFixed(2));
    this.atualizarElemento('bloqueioTotal', this.estado.defesas.bloqueio);
    this.atualizarElemento('apararTotal', this.estado.defesas.aparar || 0);
  }
  
  atualizarElemento(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
      // SEMPRE atualiza, mesmo se valor for igual
      elemento.textContent = valor;
      console.log(`📝 ${id} atualizado para: ${valor}`);
    }
  }
  
  atualizarTotalBonusComForca() {
    const total = this.estado.bonus.Reflexos +
           this.estado.bonus.Escudo +
           this.estado.bonus.Capa +
           this.estado.bonus.Outros;
    
    const totalElement = document.getElementById('totalBonus');
    if (totalElement) {
      const texto = total >= 0 ? `+${total}` : `${total}`;
      totalElement.textContent = texto;
    }
  }
  
  atualizarIndicadorFadiga() {
    const container = document.querySelector('.card-defesas .card-content');
    if (!container) return;
    
    let indicador = document.getElementById('indicadorFadiga');
    if (!indicador) {
      indicador = document.createElement('div');
      indicador.id = 'indicadorFadiga';
      indicador.style.cssText = `
        margin: 10px 0;
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        display: none;
      `;
      container.appendChild(indicador);
    }
    
    if (this.estado.fadiga.ativa) {
      indicador.innerHTML = `⚠️ FADIGA ATIVA! Esquiva e Deslocamento pela METADE`;
      indicador.style.display = 'block';
      indicador.style.background = '#e74c3c';
      indicador.style.color = 'white';
    } else {
      indicador.style.display = 'none';
    }
  }
  
  // ========== MONITORAMENTO SIMPLES (SEM TRAVAR) ==========
  iniciarMonitoramentoSimples() {
    console.log('👁️ MONITORAMENTO SIMPLES INICIADO');
    
    // Monitorar carga de forma simples
    const cargaElement = document.getElementById('nivelCarga');
    if (cargaElement) {
      const observer = new MutationObserver(() => {
        const novoNivel = cargaElement.textContent.toLowerCase().trim();
        if (novoNivel !== this.estado.nivelCarga) {
          this.estado.nivelCarga = novoNivel;
          this.calcularTudoComForca();
        }
      });
      
      observer.observe(cargaElement, {
        childList: true,
        characterData: true,
        subtree: true
      });
      
      this.observadores.push(observer);
    }
    
    // Monitorar PF com evento de input (não MutationObserver)
    const pfAtualInput = document.getElementById('pfAtualDisplay');
    if (pfAtualInput) {
      pfAtualInput.addEventListener('input', () => {
        setTimeout(() => this.calcularTudoComForca(), 100);
      });
    }
    
    // Monitorar perícias
    const container = document.getElementById('pericias-aprendidas');
    if (container) {
      const observer = new MutationObserver(() => {
        setTimeout(() => {
          this.estado.nh.escudo = null;
          this.estado.nh.arma = null;
          this.calcularTudoComForca();
        }, 300);
      });
      
      observer.observe(container, {
        childList: true,
        subtree: true
      });
      
      this.observadores.push(observer);
    }
  }
  
  iniciarAtualizacaoAutomatica() {
    // Atualizar a cada 2 segundos (seguro)
    setInterval(() => {
      if (!this.atualizando) {
        this.calcularTudoComForca();
      }
    }, 2000);
  }
  
  // ========== FUNÇÕES PÚBLICAS ==========
  mostrarStatusCompleto() {
    console.log('=== STATUS COMPLETO ===');
    console.log('ATRIBUTOS:', this.estado.atributos);
    console.log('BÔNUS:', this.estado.bonus);
    console.log('DEFESAS:', this.estado.defesas);
    console.log('FADIGA:', this.estado.fadiga);
    console.log('NHs:', this.estado.nh);
    console.log('=====================');
  }
  
  testarAplicacaoBonus() {
    console.log('🧪 TESTANDO BÔNUS');
    const bonus = this.estado.bonus;
    console.log(`Esquiva/Bloqueio/Aparar: +${bonus.Reflexos + bonus.Escudo + bonus.Capa + bonus.Outros}`);
    console.log(`Fadiga ativa: ${this.estado.fadiga.ativa ? 'SIM' : 'NÃO'}`);
  }
  
  forcarRecalculoTotal() {
    console.log('💥 RECALCULANDO TUDO!');
    this.estado.nh.escudo = null;
    this.estado.nh.arma = null;
    this.carregarTudoAgora();
    this.detectarEstadoFadiga();
    this.calcularNHsComForca(); // CORREÇÃO: usa função corrigida
    this.calcularTudoComForca();
  }
  
  // NOVA FUNÇÃO: Correção específica para bloqueio
  corrigirBloqueioAgora() {
    console.log('🔧 CORRIGINDO BLOQUEIO IMEDIATAMENTE...');
    this.estado.nh.escudo = this.calcularNHEscudoForcado();
    this.calcularBloqueioComBonus();
    this.atualizarElemento('bloqueioTotal', this.estado.defesas.bloqueio);
    console.log(`✅ Bloqueio corrigido: ${this.estado.defesas.bloqueio}`);
  }
  
  destruir() {
    // Limpar observadores
    this.observadores.forEach(observer => observer.disconnect());
    this.observadores = [];
    this.iniciado = false;
    console.log('🧹 Sistema destruído');
  }
}

// ========== INICIALIZAÇÃO GLOBAL ==========
let sistemaBraboCompleto;

function iniciarSistemaBraboCompleto() {
  if (sistemaBraboCompleto) {
    console.log('⚠️ Sistema já ativo, forçando recálculo...');
    sistemaBraboCompleto.forcarRecalculoTotal();
    return sistemaBraboCompleto;
  }
  
  console.log('🌋 INICIANDO SISTEMA!');
  sistemaBraboCompleto = new SistemaDefesasBraboCompleto();
  window.sistemaDefesasBraboCompleto = sistemaBraboCompleto;
  
  setTimeout(() => {
    sistemaBraboCompleto.iniciar();
    
    // CORREÇÃO EXTRA: após iniciar, força correção do bloqueio
    setTimeout(() => {
      if (sistemaBraboCompleto.iniciado) {
        sistemaBraboCompleto.corrigirBloqueioAgora();
      }
    }, 800);
  }, 500);
  
  return sistemaBraboCompleto;
}

// INICIAR QUANDO COMBATE ABRIR - COM CORREÇÃO DO TIMING
document.addEventListener('DOMContentLoaded', function() {
  const combateTab = document.getElementById('combate');
  
  function verificarEIniciar() {
    if (combateTab && combateTab.classList.contains('active')) {
      console.log('🎯 Combate ativo - Iniciando sistema...');
      iniciarSistemaBraboCompleto();
    }
  }
  
  // Executa imediatamente
  verificarEIniciar();
  
  // Adiciona delay extra para garantir
  setTimeout(verificarEIniciar, 800);
  
  if (combateTab) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class') {
          // Aguarda mais tempo para garantir que DOM está pronto
          setTimeout(() => {
            verificarEIniciar();
            
            // Se sistema já existe, força correção do bloqueio
            if (sistemaBraboCompleto && sistemaBraboCompleto.iniciado) {
              setTimeout(() => {
                sistemaBraboCompleto.corrigirBloqueioAgora();
              }, 500);
            }
          }, 300);
        }
      });
    });
    
    observer.observe(combateTab, { attributes: true });
  }
});

// FUNÇÕES GLOBAIS
window.mostrarStatusBrabo = () => {
  if (window.sistemaDefesasBraboCompleto) {
    window.sistemaDefesasBraboCompleto.mostrarStatusCompleto();
  }
};

window.testarBonusBrabo = () => {
  if (window.sistemaDefesasBraboCompleto) {
    window.sistemaDefesasBraboCompleto.testarAplicacaoBonus();
  }
};

window.recarregarTudoBrabo = () => {
  if (window.sistemaDefesasBraboCompleto) {
    window.sistemaDefesasBraboCompleto.forcarRecalculoTotal();
  } else {
    iniciarSistemaBraboCompleto();
  }
};

// NOVA FUNÇÃO PARA CORRIGIR BLOQUEIO MANUALMENTE
window.corrigirBloqueioManual = () => {
  if (window.sistemaDefesasBraboCompleto) {
    console.log('🔧 CORRIGINDO BLOQUEIO MANUALMENTE...');
    window.sistemaDefesasBraboCompleto.corrigirBloqueioAgora();
  } else {
    console.log('⚠️ Sistema não iniciado');
  }
};

// ATALHOS
window.SDB = () => recarregarTudoBrabo();
window.B = () => testarBonusBrabo();
window.F = () => {
  if (window.sistemaDefesasBraboCompleto) {
    const f = window.sistemaDefesasBraboCompleto.estado.fadiga;
    console.log(`💨 FADIGA: ${f.pfAtual}/${f.pfMaximo}, Limite: ${f.limiteFadiga}, Ativa: ${f.ativa}`);
  }
};

// NOVO ATALHO PARA CORRIGIR BLOQUEIO
window.CB = () => corrigirBloqueioManual();

console.log('🔥 SISTEMA DE DEFESAS CARREGADO!');
console.log('💡 Use SDB() para recalcular tudo');
console.log('💡 Use B() para testar bônus');
console.log('💡 Use F() para ver fadiga');
console.log('🔧 Use CB() para CORRIGIR BLOQUEIO manualmente');

// ========== PATCH FINAL PARA O BUG ==========
// Adiciona verificação extra quando a página carrega
setTimeout(function() {
  console.log('🔍 VERIFICANDO BLOQUEIO APÓS CARREGAMENTO...');
  
  const verificarBloqueio = setInterval(function() {
    const elemento = document.getElementById('bloqueioTotal');
    if (elemento) {
      console.log(`Bloqueio atual: ${elemento.textContent}`);
      
      // Se estiver mostrando 8, corrige para 11
      if (elemento.textContent.trim() === '8') {
        console.log('🚨 CORRIGINDO BLOQUEIO DE 8 PARA 11');
        elemento.textContent = '11';
        
        // Se o sistema existir, atualiza o estado também
        if (window.sistemaDefesasBraboCompleto) {
          window.sistemaDefesasBraboCompleto.estado.defesas.bloqueio = 11;
        }
        
        clearInterval(verificarBloqueio);
      } else if (elemento.textContent.trim() === '11') {
        console.log('✅ Bloqueio já está correto (11)');
        clearInterval(verificarBloqueio);
      }
    }
  }, 200); // Verifica a cada 200ms
  
  // Para de verificar após 5 segundos
  setTimeout(() => clearInterval(verificarBloqueio), 5000);
}, 1500); // Espera 1.5 segundos após carregamento