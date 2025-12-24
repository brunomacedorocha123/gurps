    // ===========================================
    // SISTEMA VANTAGENS/DESVANTAGENS - ADICIONE ISSO NO FINAL
    // ===========================================

    // Instâncias dos sistemas
    let sistemaVantagens = null;
    let sistemaDesvantagens = null;
    let modalTipoAtual = '';
    let modalIdAtual = '';
    let opcaoSelecionada = null;

    // ===== FUNÇÕES BÁSICAS =====

    function atualizarResumoPontos() {
        if (!sistemaVantagens || !sistemaDesvantagens) return;
        
        const pontosVantagens = sistemaVantagens.getPontosGastos();
        const pontosDesvantagens = sistemaDesvantagens.getPontosGanhos();
        const peculiaridadesAtivas = sistemaDesvantagens.getPeculiaridadesAtivas().length;
        const saldo = pontosVantagens + pontosDesvantagens;
        
        const vantagemTotalEl = document.querySelector('.vantagem-total');
        const desvantagemTotalEl = document.querySelector('.desvantagem-total');
        const peculiaridadesTotalEl = document.querySelector('.peculiaridades-total');
        const peculiaridadesContadorEl = document.querySelector('.peculiaridades-contador');
        const saldoFinalEl = document.querySelector('.saldo-final');
        
        if (vantagemTotalEl) vantagemTotalEl.textContent = pontosVantagens;
        if (desvantagemTotalEl) desvantagemTotalEl.textContent = Math.abs(pontosDesvantagens);
        if (peculiaridadesTotalEl) peculiaridadesTotalEl.textContent = peculiaridadesAtivas;
        if (peculiaridadesContadorEl) peculiaridadesContadorEl.textContent = `(${peculiaridadesAtivas}/5)`;
        if (saldoFinalEl) saldoFinalEl.textContent = saldo;
    }

    function atualizarPeculiaridade(indice, valor) {
        if (!sistemaDesvantagens) return;
        
        if (valor && valor.trim() !== '') {
            sistemaDesvantagens.adicionarPeculiaridade(valor, indice);
        } else {
            sistemaDesvantagens.removerPeculiaridade(indice);
        }
        atualizarResumoPontos();
    }

    // ===== FUNÇÕES DE VANTAGENS =====

    function adicionarVantagem(id) {
        if (!sistemaVantagens || !window.CatalogoVantagens) {
            alert("Sistema de vantagens não carregado");
            return;
        }
        
        const vantagem = window.CatalogoVantagens.getPorId(id);
        if (!vantagem) {
            alert("Vantagem não encontrada");
            return;
        }
        
        const resultado = sistemaVantagens.adicionarSimples(vantagem);
        if (resultado.sucesso) {
            atualizarVantagensAdquiridas();
            atualizarResumoPontos();
            alert(resultado.mensagem);
        } else {
            alert(resultado.mensagem);
        }
    }

    function mostrarOpcoesVantagem(id) {
        if (!window.CatalogoVantagens) {
            alert("Catálogo não carregado");
            return;
        }
        
        const vantagem = window.CatalogoVantagens.getPorId(id);
        if (!vantagem || !vantagem.opcoes) {
            alert("Esta vantagem não tem opções");
            return;
        }
        
        modalTipoAtual = 'vantagem';
        modalIdAtual = id;
        abrirModal(vantagem);
    }

    function atualizarVantagensAdquiridas() {
        if (!sistemaVantagens) return;
        
        const container = document.getElementById('vantagens-adquiridas');
        if (!container) return;
        
        const vantagens = sistemaVantagens.getVantagensSelecionadas();
        
        if (vantagens.length === 0) {
            container.innerHTML = `
                <div class="vazio-mensagem">
                    <i class="fas fa-info-circle"></i>
                    <p>Nenhuma vantagem selecionada ainda</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        vantagens.forEach(vantagem => {
            html += `
                <div class="adquirida-card vantagem-adquirida" data-id="${vantagem.id}">
                    <button class="btn-remover" onclick="removerVantagem('${vantagem.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="adquirida-header">
                        <h4 class="adquirida-titulo">${vantagem.nomeCompleto || vantagem.nome}</h4>
                        <div class="adquirida-pontos">+${vantagem.custo}</div>
                    </div>
                    <div class="adquirida-info">
                        <span>Categoria: ${vantagem.categoria}</span>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    function removerVantagem(id) {
        if (!sistemaVantagens) return;
        
        const resultado = sistemaVantagens.removerVantagem(id);
        if (resultado.sucesso) {
            atualizarVantagensAdquiridas();
            atualizarResumoPontos();
            alert(resultado.mensagem);
        } else {
            alert(resultado.mensagem);
        }
    }

    // ===== FUNÇÕES DE DESVANTAGENS =====

    function adicionarDesvantagem(id) {
        if (!sistemaDesvantagens || !window.CatalogoDesvantagens) {
            alert("Sistema de desvantagens não carregado");
            return;
        }
        
        const desvantagem = window.CatalogoDesvantagens.getPorId(id);
        if (!desvantagem) {
            alert("Desvantagem não encontrada");
            return;
        }
        
        const resultado = sistemaDesvantagens.adicionarSimples(desvantagem);
        if (resultado.sucesso) {
            atualizarDesvantagensAdquiridas();
            atualizarResumoPontos();
            alert(resultado.mensagem);
        } else {
            alert(resultado.mensagem);
        }
    }

    function mostrarOpcoesDesvantagem(id) {
        if (!window.CatalogoDesvantagens) {
            alert("Catálogo não carregado");
            return;
        }
        
        const desvantagem = window.CatalogoDesvantagens.getPorId(id);
        if (!desvantagem || !desvantagem.opcoes) {
            alert("Esta desvantagem não tem opções");
            return;
        }
        
        modalTipoAtual = 'desvantagem';
        modalIdAtual = id;
        abrirModal(desvantagem);
    }

    function atualizarDesvantagensAdquiridas() {
        if (!sistemaDesvantagens) return;
        
        const container = document.getElementById('desvantagens-adquiridas');
        if (!container) return;
        
        const desvantagens = sistemaDesvantagens.getDesvantagensSelecionadas();
        
        if (desvantagens.length === 0) {
            container.innerHTML = `
                <div class="vazio-mensagem">
                    <i class="fas fa-info-circle"></i>
                    <p>Nenhuma desvantagem selecionada ainda</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        desvantagens.forEach(desvantagem => {
            const custo = Math.abs(desvantagem.custo);
            html += `
                <div class="adquirida-card desvantagem-adquirida" data-id="${desvantagem.id}">
                    <button class="btn-remover" onclick="removerDesvantagem('${desvantagem.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="adquirida-header">
                        <h4 class="adquirida-titulo">${desvantagem.nomeCompleto || desvantagem.nome}</h4>
                        <div class="adquirida-pontos">-${custo}</div>
                    </div>
                    <div class="adquirida-info">
                        <span>Categoria: ${desvantagem.categoria}</span>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    function removerDesvantagem(id) {
        if (!sistemaDesvantagens) return;
        
        const resultado = sistemaDesvantagens.removerDesvantagem(id);
        if (resultado.sucesso) {
            atualizarDesvantagensAdquiridas();
            atualizarResumoPontos();
            alert(resultado.mensagem);
        } else {
            alert(resultado.mensagem);
        }
    }

    // ===== FUNÇÕES DO MODAL =====

    function abrirModal(item) {
        if (!item) return;
        
        const modal = document.getElementById('opcoes-modal');
        const titulo = document.getElementById('modal-titulo');
        const descricao = document.getElementById('modal-descricao');
        const container = document.getElementById('opcoes-container');
        const pontosTotal = document.getElementById('modal-pontos-total');
        
        if (!modal || !titulo || !descricao || !container) return;
        
        titulo.textContent = item.nome;
        descricao.innerHTML = `
            <p><strong>Descrição:</strong> ${item.descricao}</p>
            ${item.detalhes ? `<p><strong>Detalhes:</strong> ${item.detalhes}</p>` : ''}
        `;
        
        container.innerHTML = '';
        item.opcoes.forEach((opcao, index) => {
            const div = document.createElement('div');
            div.className = 'opcao-item';
            div.innerHTML = `
                <div class="opcao-header">
                    <h4 class="opcao-titulo">${opcao.nome}</h4>
                    <div class="opcao-pontos">${opcao.custo > 0 ? '+' : ''}${opcao.custo}</div>
                </div>
                <div class="opcao-descricao">${opcao.descricao}</div>
            `;
            div.addEventListener('click', () => selecionarOpcao(opcao, index));
            container.appendChild(div);
        });
        
        pontosTotal.textContent = '0';
        modal.style.display = 'flex';
        opcaoSelecionada = null;
        atualizarBotoesModal();
    }

    function selecionarOpcao(opcao, index) {
        document.querySelectorAll('.opcao-item').forEach(el => {
            el.classList.remove('selecionada');
        });
        
        const items = document.querySelectorAll('.opcao-item');
        if (items[index]) {
            items[index].classList.add('selecionada');
        }
        
        opcaoSelecionada = opcao;
        const pontosTotal = document.getElementById('modal-pontos-total');
        if (pontosTotal) {
            pontosTotal.textContent = opcao.custo;
        }
        atualizarBotoesModal();
    }

    function atualizarBotoesModal() {
        const btnConfirmar = document.querySelector('.btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.disabled = !opcaoSelecionada;
        }
    }

    function confirmarSelecao() {
        if (!opcaoSelecionada) return;
        
        if (modalTipoAtual === 'vantagem') {
            const vantagem = window.CatalogoVantagens.getPorId(modalIdAtual);
            if (vantagem && sistemaVantagens) {
                const resultado = sistemaVantagens.adicionarComOpcao(vantagem, opcaoSelecionada);
                if (resultado.sucesso) {
                    atualizarVantagensAdquiridas();
                    atualizarResumoPontos();
                    alert(resultado.mensagem);
                }
            }
        } else if (modalTipoAtual === 'desvantagem') {
            const desvantagem = window.CatalogoDesvantagens.getPorId(modalIdAtual);
            if (desvantagem && sistemaDesvantagens) {
                const resultado = sistemaDesvantagens.adicionarComOpcao(desvantagem, opcaoSelecionada);
                if (resultado.sucesso) {
                    atualizarDesvantagensAdquiridas();
                    atualizarResumoPontos();
                    alert(resultado.mensagem);
                }
            }
        }
        
        fecharModal();
    }

    function fecharModal() {
        const modal = document.getElementById('opcoes-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        modalTipoAtual = '';
        modalIdAtual = '';
        opcaoSelecionada = null;
    }

    // ===== INICIALIZAÇÃO =====

    // Modifique o DOMContentLoaded existente para incluir isso:
    document.addEventListener('DOMContentLoaded', function() {
        console.log(' Criar Personagem - Em desenvolvimento');
        
        // Inicializa sistemas de Vantagens/Desvantagens
        try {
            // Verifica se as classes estão disponíveis
            if (typeof SistemaVantagens !== 'undefined' && typeof SistemaDesvantagens !== 'undefined') {
                sistemaVantagens = new SistemaVantagens();
                sistemaDesvantagens = new SistemaDesvantagens();
                console.log('✅ Sistemas de Vantagens/Desvantagens inicializados');
            } else {
                console.warn('⚠️ Classes de Vantagens/Desvantagens não encontradas');
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar sistemas:', error);
        }
        
        // Configura eventos do modal (se existir)
        const modal = document.getElementById('opcoes-modal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    fecharModal();
                }
            });
            
            const btnCancelar = modal.querySelector('.btn-cancelar');
            const btnFechar = modal.querySelector('.modal-close');
            
            if (btnCancelar) {
                btnCancelar.addEventListener('click', fecharModal);
            }
            if (btnFechar) {
                btnFechar.addEventListener('click', fecharModal);
            }
        }
        
        // Configura eventos dos filtros (se existirem)
        document.querySelectorAll('.btn-categoria').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.btn-categoria').forEach(b => b.classList.remove('ativo'));
                this.classList.add('ativo');
                console.log(`Filtrando por: ${this.dataset.categoria}`);
            });
        });
    });

    // ===========================================
    // FIM DO SISTEMA VANTAGENS/DESVANTAGENS
    // ===========================================