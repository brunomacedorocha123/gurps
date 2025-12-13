// resumo-equipamentos.js - CORREÇÃO DO DINHEIRO EM TEMPO REAL
// ✅ Agora monitora dinheiro em tempo real através do sistemaEquipamentos

class ResumoEquipamentos {
    constructor() {
        this.sistemaEquipamentos = window.sistemaEquipamentos;
        this.ultimaAtualizacao = null;
        this.observadorAtivo = false;
        this.init();
    }

    init() {
        console.log('🔧 Inicializando Resumo de Equipamentos Expandido...');
        
        // Aguarda o sistema de equipamentos estar pronto
        this.aguardarSistemaEquipamentos().then(() => {
            this.criarEstruturaResumo();
            this.configurarObservadores();
            this.atualizarResumoEquipamentos();
            console.log('✅ Resumo de Equipamentos Expandido inicializado');
        }).catch(error => {
            console.error('❌ Erro ao inicializar Resumo de Equipamentos:', error);
        });
    }

    aguardarSistemaEquipamentos() {
        return new Promise((resolve, reject) => {
            let tentativas = 0;
            const maxTentativas = 30;
            
            const verificarSistema = () => {
                tentativas++;
                
                if (window.sistemaEquipamentos && 
                    typeof window.sistemaEquipamentos === 'object' &&
                    window.sistemaEquipamentos.dinheiro !== undefined) {
                    resolve();
                } else if (tentativas < maxTentativas) {
                    setTimeout(verificarSistema, 100);
                } else {
                    reject(new Error('Sistema de equipamentos não disponível após 3 segundos'));
                }
            };
            
            verificarSistema();
        });
    }

    criarEstruturaResumo() {
        const statusLinha = document.querySelector('.resumo-status-linha');
        if (!statusLinha) return;
        
        // Remove o card antigo de equipamentos se existir
        const cardAntigo = document.querySelector('.card-status:has(h4 i.fa-backpack)');
        if (cardAntigo) {
            cardAntigo.remove();
        }
        
        // Cria novo card expandido
        const novoCard = document.createElement('div');
        novoCard.className = 'card-status resumo-equipamento-expandido';
        novoCard.innerHTML = `
            <div class="card-header">
                <h4><i class="fas fa-backpack"></i> EQUIPAMENTOS</h4>
            </div>
            <div class="status-content">
                <!-- ESTATÍSTICAS RÁPIDAS -->
                <div class="equipamento-stats-micro">
                    <div class="equipamento-stat-item">
                        <span class="equipamento-stat-label">
                            <i class="fas fa-coins"></i> Dinheiro:
                        </span>
                        <span class="equipamento-stat-valor dinheiro" id="resumoDinheiro">$0</span>
                    </div>
                    <div class="equipamento-stat-item">
                        <span class="equipamento-stat-label">
                            <i class="fas fa-weight-hanging"></i> Carga:
                        </span>
                        <span class="equipamento-stat-valor" id="resumoCarga">0/0 kg</span>
                    </div>
                    <div class="equipamento-stat-item">
                        <span class="equipamento-stat-label">
                            <i class="fas fa-box"></i> Itens:
                        </span>
                        <span class="equipamento-stat-valor" id="resumoTotalItens">0</span>
                    </div>
                    <div class="equipamento-stat-item">
                        <span class="equipamento-stat-label">
                            <i class="fas fa-tshirt"></i> Equipados:
                        </span>
                        <span class="equipamento-stat-valor" id="resumoEquipados">0</span>
                    </div>
                </div>
                
                <!-- MÃOS DISPONÍVEIS -->
                <div class="maos-container" id="resumoMaos">
                    <div class="mao-icon mao-livre">👐</div>
                    <div class="mao-icon mao-livre">👐</div>
                </div>
                
                <!-- LISTA DE EQUIPAMENTOS COM SCROLL -->
                <div class="equipamento-lista-container">
                    <div class="equipamento-lista-scroll" id="listaEquipamentosResumo">
                        <div class="equipamento-vazio">
                            <i class="fas fa-box-open"></i>
                            <span>Inventário vazio</span>
                            <small>Adicione equipamentos na aba de Equipamentos</small>
                        </div>
                    </div>
                </div>
                
                <!-- BOTÃO PARA VER MAIS -->
                <button class="btn-ver-equipamentos" onclick="window.sistemaEquipamentos && window.sistemaEquipamentos.alternarSubTab('inventario')">
                    <i class="fas fa-external-link-alt"></i> Ver todos os equipamentos
                </button>
            </div>
        `;
        
        // Adiciona o card na linha de status (primeira posição)
        statusLinha.insertBefore(novoCard, statusLinha.firstChild);
    }

    configurarObservadores() {
        if (this.observadorAtivo) return;
        
        // Observa mudanças no sistema de equipamentos
        document.addEventListener('equipamentosAtualizados', (e) => {
            if (e.detail) {
                this.atualizarResumoEquipamentos();
            }
        });
        
        // Observa mudanças de dinheiro específicas
        document.addEventListener('dinheiroAlterado', (e) => {
            this.atualizarDinheiro(e.detail);
        });
        
        // Observa mudanças diretas no dinheiro do sistema
        const intervalObservador = setInterval(() => {
            if (window.sistemaEquipamentos && window.sistemaEquipamentos.dinheiro !== undefined) {
                this.atualizarDinheiro(window.sistemaEquipamentos.dinheiro);
            }
        }, 500); // Verifica a cada 500ms
        
        // Observa quando a aba Resumo é ativada
        const abaResumoBtn = document.querySelector('[data-tab="resumo"]');
        if (abaResumoBtn) {
            abaResumoBtn.addEventListener('click', () => {
                setTimeout(() => this.atualizarResumoEquipamentos(), 100);
            });
        }
        
        this.observadorAtivo = true;
    }

    atualizarDinheiro(valorOuEvento) {
        const dinheiroElem = document.getElementById('resumoDinheiro');
        if (!dinheiroElem) return;
        
        let valorDinheiro;
        
        if (typeof valorOuEvento === 'object') {
            // É um evento com detalhes
            valorDinheiro = valorOuEvento.dinheiro || valorOuEvento.valor;
        } else {
            // É um valor direto
            valorDinheiro = valorOuEvento;
        }
        
        if (valorDinheiro !== undefined) {
            dinheiroElem.textContent = `$${valorDinheiro}`;
            
            // Muda a cor baseada no valor
            if (valorDinheiro <= 0) {
                dinheiroElem.style.color = '#e74c3c';
            } else if (valorDinheiro < 500) {
                dinheiroElem.style.color = '#f39c12';
            } else {
                dinheiroElem.style.color = '#ffd700';
            }
        }
    }

    atualizarResumoEquipamentos() {
        if (!this.sistemaEquipamentos || !window.sistemaEquipamentos) return;
        
        try {
            const dados = this.sistemaEquipamentos.exportarDados ? 
                this.sistemaEquipamentos.exportarDados() : 
                this.sistemaEquipamentos;
            
            // Atualiza dinheiro DIRETAMENTE da propriedade
            const dinheiroAtual = this.sistemaEquipamentos.dinheiro;
            if (dinheiroAtual !== undefined) {
                this.atualizarDinheiro(dinheiroAtual);
            }
            
            // Atualiza estatísticas rápidas
            this.atualizarEstatisticas(dados);
            
            // Atualiza mãos disponíveis
            this.atualizarMaos(dados);
            
            // Atualiza lista de equipamentos (mostra até 10 itens)
            this.atualizarListaEquipamentos(dados);
            
            this.ultimaAtualizacao = new Date();
            
        } catch (error) {
            console.error('❌ Erro ao atualizar resumo de equipamentos:', error);
        }
    }

    atualizarEstatisticas(dados) {
        // Carga
        const cargaElem = document.getElementById('resumoCarga');
        if (cargaElem) {
            let pesoAtual = dados.pesoAtual || 0;
            let pesoMax = dados.pesoMaximo || 60;
            
            // Se não encontrar no exportarDados, tenta acessar diretamente
            if (pesoAtual === 0 && this.sistemaEquipamentos.pesoAtual !== undefined) {
                pesoAtual = this.sistemaEquipamentos.pesoAtual;
            }
            if (pesoMax === 60 && this.sistemaEquipamentos.pesoMaximo !== undefined) {
                pesoMax = this.sistemaEquipamentos.pesoMaximo;
            }
            
            cargaElem.textContent = `${pesoAtual.toFixed(1)}/${pesoMax.toFixed(1)} kg`;
            
            // Adiciona classe baseada no nível de carga
            let nivelCarga = dados.nivelCargaAtual || 'nenhuma';
            if (!nivelCarga && this.sistemaEquipamentos.nivelCargaAtual) {
                nivelCarga = this.sistemaEquipamentos.nivelCargaAtual;
            }
            
            cargaElem.className = 'equipamento-stat-valor';
            
            if (nivelCarga.includes('média') || nivelCarga.includes('media')) {
                cargaElem.classList.add('carga-media');
            } else if (nivelCarga.includes('pesada')) {
                cargaElem.classList.add('carga-pesada');
            } else {
                cargaElem.classList.add('carga-normal');
            }
        }
        
        // Total de itens
        const totalItensElem = document.getElementById('resumoTotalItens');
        if (totalItensElem) {
            let totalItens = 0;
            
            if (dados.equipamentosAdquiridos) {
                totalItens = dados.equipamentosAdquiridos.length;
            } else if (this.sistemaEquipamentos.equipamentosAdquiridos) {
                totalItens = this.sistemaEquipamentos.equipamentosAdquiridos.length;
            }
            
            totalItensElem.textContent = totalItens;
        }
        
        // Itens equipados
        const equipadosElem = document.getElementById('resumoEquipados');
        if (equipadosElem) {
            let equipados = 0;
            
            if (dados.equipamentosAdquiridos) {
                equipados = dados.equipamentosAdquiridos.filter(item => item.equipado).length;
            } else if (this.sistemaEquipamentos.equipamentosAdquiridos) {
                equipados = this.sistemaEquipamentos.equipamentosAdquiridos.filter(item => item.equipado).length;
            }
            
            equipadosElem.textContent = equipados;
        }
    }

    atualizarMaos(dados) {
        const maosElem = document.getElementById('resumoMaos');
        if (!maosElem) return;
        
        // Calcula mãos ocupadas
        let maosOcupadas = 0;
        
        // Tenta acessar diretamente do sistema se disponível
        if (this.sistemaEquipamentos.calcularMaosOcupadas) {
            maosOcupadas = this.sistemaEquipamentos.calcularMaosOcupadas();
        } else {
            // Cálculo manual como fallback
            if (dados.equipamentosEquipados) {
                if (dados.equipamentosEquipados.armaduras) {
                    maosOcupadas += dados.equipamentosEquipados.armaduras
                        .filter(a => a.local === 'Mãos')
                        .reduce((total, item) => total + (item.maos || 0), 0);
                }
                
                if (dados.equipamentosEquipados.maos) {
                    maosOcupadas += dados.equipamentosEquipados.maos
                        .reduce((total, item) => total + (item.maos || 1), 0);
                }
                
                if (dados.equipamentosEquipados.escudos) {
                    maosOcupadas += dados.equipamentosEquipados.escudos
                        .reduce((total, item) => total + (item.maos || 1), 0);
                }
            }
        }
        
        const maosDisponiveis = dados.maosDisponiveis || this.sistemaEquipamentos.maosDisponiveis || 2;
        const maosLivres = Math.max(0, maosDisponiveis - maosOcupadas);
        
        // Atualiza display de mãos
        maosElem.innerHTML = '';
        
        for (let i = 0; i < maosOcupadas; i++) {
            const maoOcupada = document.createElement('div');
            maoOcupada.className = 'mao-icon mao-ocupada';
            maoOcupada.innerHTML = '👊';
            maoOcupada.title = 'Mão ocupada';
            maosElem.appendChild(maoOcupada);
        }
        
        for (let i = 0; i < maosLivres; i++) {
            const maoLivre = document.createElement('div');
            maoLivre.className = 'mao-icon mao-livre';
            maoLivre.innerHTML = '👐';
            maoLivre.title = 'Mão livre';
            maosElem.appendChild(maoLivre);
        }
    }

    atualizarListaEquipamentos(dados) {
        const listaElem = document.getElementById('listaEquipamentosResumo');
        if (!listaElem) return;
        
        let equipamentosAdquiridos = [];
        
        // Obtém a lista de equipamentos de várias formas possíveis
        if (dados.equipamentosAdquiridos) {
            equipamentosAdquiridos = dados.equipamentosAdquiridos;
        } else if (this.sistemaEquipamentos.equipamentosAdquiridos) {
            equipamentosAdquiridos = this.sistemaEquipamentos.equipamentosAdquiridos;
        }
        
        if (equipamentosAdquiridos.length === 0) {
            listaElem.innerHTML = `
                <div class="equipamento-vazio">
                    <i class="fas fa-box-open"></i>
                    <span>Inventário vazio</span>
                    <small>Adicione equipamentos na aba de Equipamentos</small>
                </div>
            `;
            return;
        }
        
        // Ordena: primeiro os equipados, depois os importantes, depois o resto
        const equipamentosOrdenados = [...equipamentosAdquiridos].sort((a, b) => {
            // Equipados primeiro
            if (a.equipado && !b.equipado) return -1;
            if (!a.equipado && b.equipado) return 1;
            
            // Itens no corpo em seguida
            if (a.status === 'no-corpo' && b.status !== 'no-corpo') return -1;
            if (a.status !== 'no-corpo' && b.status === 'no-corpo') return 1;
            
            // Itens no depósito por último
            if (a.status === 'deposito' && b.status !== 'deposito') return 1;
            if (a.status !== 'deposito' && b.status === 'deposito') return -1;
            
            // Ordena por tipo (armas primeiro, depois armaduras, etc.)
            const tipoPrioridade = {
                'arma-cc': 1,
                'arma-dist': 2,
                'armadura': 3,
                'escudo': 4,
                'geral': 5
            };
            
            const prioridadeA = tipoPrioridade[a.tipo] || 5;
            const prioridadeB = tipoPrioridade[b.tipo] || 5;
            
            return prioridadeA - prioridadeB || a.nome.localeCompare(b.nome);
        });
        
        // Limita a 10 itens para visualização (o GM pode rolar para ver mais)
        const equipamentosParaMostrar = equipamentosOrdenados.slice(0, 10);
        
        // Cria HTML da lista
        listaElem.innerHTML = equipamentosParaMostrar.map((item, index) => {
            const classeStatus = item.equipado ? 'equipado' : 
                               item.status === 'no-corpo' ? 'no-corpo' :
                               item.status === 'deposito' ? 'no-deposito' : 'na-mochila';
            
            // Determina ícone baseado no tipo
            let icone = 'fa-box';
            let classeIcone = 'icone-geral';
            
            if (item.tipo === 'arma-cc' || item.tipo === 'arma-dist') {
                icone = 'fa-gavel';
                classeIcone = 'icone-arma';
            } else if (item.tipo === 'armadura') {
                icone = 'fa-shield-alt';
                classeIcone = 'icone-armadura';
            } else if (item.tipo === 'escudo') {
                icone = 'fa-shield';
                classeIcone = 'icone-escudo';
            } else if (item.quantidade > 1) {
                icone = 'fa-boxes';
            }
            
            // Determina status emoji
            let statusEmoji = '';
            if (item.equipado) statusEmoji = '⚔️';
            else if (item.status === 'no-corpo') statusEmoji = '👤';
            else if (item.status === 'deposito') statusEmoji = '🏠';
            else statusEmoji = '🎒';
            
            return `
                <div class="equipamento-item-resumo ${classeStatus}" title="${item.descricao || 'Sem descrição'}">
                    <div class="equipamento-icone ${classeStatus}">
                        <i class="fas ${icone} ${classeIcone}"></i>
                    </div>
                    <div class="equipamento-info-micro">
                        <div class="equipamento-nome-micro">
                            ${statusEmoji} ${item.nome} ${item.quantidade > 1 ? `<span class="equipamento-detalhe quantidade">(${item.quantidade}x)</span>` : ''}
                        </div>
                        <div class="equipamento-detalhes-micro">
                            ${item.custoTotal || item.custo ? `<span class="equipamento-detalhe"><i class="fas fa-coins"></i> $${item.custoTotal || item.custo}</span>` : ''}
                            ${item.peso ? `<span class="equipamento-detalhe peso"><i class="fas fa-weight-hanging"></i> ${(item.peso * (item.quantidade || 1)).toFixed(1)}kg</span>` : ''}
                            ${item.dano ? `<span class="equipamento-detalhe"><i class="fas fa-bolt"></i> ${item.dano}</span>` : ''}
                            ${item.rd ? `<span class="equipamento-detalhe"><i class="fas fa-shield-alt"></i> RD${item.rd}</span>` : ''}
                            ${item.maos > 0 ? `<span class="equipamento-detalhe"><i class="fas fa-hands"></i> ${item.maos}m</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Se houver mais itens que os mostrados, adiciona indicador
        if (equipamentosOrdenados.length > 10) {
            const maisItens = document.createElement('div');
            maisItens.className = 'equipamento-vazio';
            maisItens.innerHTML = `
                <i class="fas fa-ellipsis-h"></i>
                <span>+${equipamentosOrdenados.length - 10} itens adicionais</span>
                <small>Role para ver mais ou clique em "Ver todos os equipamentos"</small>
            `;
            listaElem.appendChild(maisItens);
        }
    }
}

// Inicialização automática quando a aba Resumo é carregada
document.addEventListener('DOMContentLoaded', function() {
    // Aguarda um pouco para garantir que o sistema de equipamentos esteja carregado
    setTimeout(() => {
        // Inicializa apenas se estiver na aba Resumo
        if (document.querySelector('#resumo.tab-content.active')) {
            window.resumoEquipamentos = new ResumoEquipamentos();
        }
        
        // Observa mudanças de aba
        const abaResumoBtn = document.querySelector('[data-tab="resumo"]');
        if (abaResumoBtn) {
            abaResumoBtn.addEventListener('click', function() {
                setTimeout(() => {
                    if (!window.resumoEquipamentos) {
                        window.resumoEquipamentos = new ResumoEquipamentos();
                    } else {
                        window.resumoEquipamentos.atualizarResumoEquipamentos();
                    }
                }, 200);
            });
        }
    }, 1000);
});

// Adiciona evento global para mudanças de dinheiro
document.addEventListener('riquezaAlterada', function(e) {
    if (e.detail && e.detail.pontos !== undefined && window.resumoEquipamentos) {
        window.resumoEquipamentos.atualizarResumoEquipamentos();
    }
});