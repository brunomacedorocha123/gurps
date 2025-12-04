// equipamentos.js - SISTEMA COMPLETO COM DINHEIRO POR RIQUEZA - VERSÃO FINAL
class SistemaEquipamentos {
    constructor() {
        this.equipamentosAdquiridos = [];
        this.deposito = [];
        this.dinheiro = 0;
        this.ultimasTransacoes = [];
        this.nivelRiquezaAtual = null;
        this.valorBaseRiqueza = 1000;
        this.multiplicadorAtual = 1;
        this.pontosRiquezaAtual = 0;
        this.primeiraInicializacao = true;
        this.ST = 10;
        this.pesoAtual = 0;
        this.capacidadeCarga = this.calcularCapacidadeCarga();
        this.pesoMaximo = this.capacidadeCarga.pesada;
        this.nivelCargaAtual = 'leve';
        this.penalidadesCarga = 'MOV +0 / DODGE +0';
        this.mochilaAtiva = true;
        this.equipamentosEquipados = {
            maos: [], armaduras: [], escudos: [], mochila: [], corpo: []
        };
        this.maosDisponiveis = 2;
        this.maosOcupadas = 0;
        this.armadurasCombate = {
            cabeca: null, torso: null, bracos: null, pernas: null,
            maos: null, pes: null, corpoInteiro: null
        };
        this.armasCombate = { maos: [], corpo: [] };
        this.escudoCombate = null;
        this.contadorItensPersonalizados = 10000;
        this.mapeamentoLocais = {
            'Cabeça': 'cabeca', 'Torso': 'torso', 'Braços': 'bracos',
            'Pernas': 'pernas', 'Mãos': 'maos', 'Pés': 'pes',
            'Corpo Inteiro': 'corpoInteiro'
        };
        this.catalogoPronto = false;
        this.inicializacaoEmAndamento = false;
        this.itemCompraQuantidade = null;
        this.quantidadeAtual = 1;
        this.operacaoAtual = null;
        this.sistemaRiquezaDisponivel = false;
    }

    async inicializarQuandoPronto() {
        if (this.inicializacaoEmAndamento) return;
        this.inicializacaoEmAndamento = true;
        
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }
        
        await this.aguardarSistemaRiqueza();
        await this.aguardarCatalogo();
        this.inicializarSistema();
        this.configurarObservadorRiqueza();
        this.inicializarDinheiroPorRiqueza();
        this.inicializacaoEmAndamento = false;
    }

    aguardarSistemaRiqueza() {
        return new Promise((resolve) => {
            let tentativas = 0;
            const verificarRiqueza = () => {
                tentativas++;
                if (window.sistemaRiqueza && typeof window.sistemaRiqueza.getPontosRiqueza === 'function') {
                    this.sistemaRiquezaDisponivel = true;
                    resolve();
                } else if (tentativas < 30) {
                    setTimeout(verificarRiqueza, 100);
                } else {
                    this.sistemaRiquezaDisponivel = false;
                    resolve();
                }
            };
            verificarRiqueza();
        });
    }

    aguardarCatalogo() {
        return new Promise((resolve) => {
            let tentativas = 0;
            const verificarCatalogo = () => {
                tentativas++;
                if (window.catalogoEquipamentos && typeof window.catalogoEquipamentos.obterEquipamentoPorId === 'function') {
                    this.catalogoPronto = true;
                    resolve();
                } else if (tentativas < 30) {
                    setTimeout(verificarCatalogo, 100);
                } else {
                    this.catalogoPronto = true;
                    resolve();
                }
            };
            verificarCatalogo();
        });
    }

    obterPontosRiquezaAtual() {
        if (window.sistemaRiqueza && typeof window.sistemaRiqueza.getPontosRiqueza === 'function') {
            return window.sistemaRiqueza.getPontosRiqueza();
        }
        
        const selectRiqueza = document.getElementById('nivelRiqueza');
        if (selectRiqueza) {
            return parseInt(selectRiqueza.value) || 0;
        }
        
        return 0;
    }

    obterMultiplicadorPorPontos(pontos) {
        const mapeamento = {
            '-25': 0, '-15': 0.2, '-10': 0.5, '0': 1,
            '10': 2, '20': 5, '30': 20, '50': 100
        };
        return mapeamento[pontos.toString()] || 1;
    }

    calcularDinheiroPorRiqueza(pontos) {
        const multiplicador = this.obterMultiplicadorPorPontos(pontos);
        return Math.floor(this.valorBaseRiqueza * multiplicador);
    }

    inicializarDinheiroPorRiqueza() {
        const pontos = this.obterPontosRiquezaAtual();
        const novoDinheiro = this.calcularDinheiroPorRiqueza(pontos);
        
        if (this.primeiraInicializacao) {
            this.dinheiro = novoDinheiro;
            this.pontosRiquezaAtual = pontos;
            this.multiplicadorAtual = this.obterMultiplicadorPorPontos(pontos);
            this.primeiraInicializacao = false;
        }
        
        this.atualizarInterfaceFinanceiro();
        this.notificarDashboard();
    }

    configurarObservadorRiqueza() {
        document.addEventListener('riquezaAlterada', (e) => {
            if (e.detail && e.detail.pontos !== undefined) {
                this.atualizarDinheiroPorMudancaRiqueza(e.detail.pontos);
            }
        });
        
        const selectRiqueza = document.getElementById('nivelRiqueza');
        if (selectRiqueza) {
            selectRiqueza.addEventListener('change', () => {
                setTimeout(() => {
                    const pontos = this.obterPontosRiquezaAtual();
                    this.atualizarDinheiroPorMudancaRiqueza(pontos);
                }, 100);
            });
        }
    }

    atualizarDinheiroPorMudancaRiqueza(novosPontos) {
        const novoDinheiro = this.calcularDinheiroPorRiqueza(novosPontos);
        const diferenca = novoDinheiro - this.dinheiro;
        
        this.dinheiro = novoDinheiro;
        this.pontosRiquezaAtual = novosPontos;
        this.multiplicadorAtual = this.obterMultiplicadorPorPontos(novosPontos);
        
        this.atualizarInterfaceFinanceiro();
        this.notificarDashboard();
        
        if (diferenca !== 0) {
            const sinal = diferenca > 0 ? '+' : '';
            const nivel = this.obterNomeNivelRiqueza(novosPontos);
            this.mostrarFeedback(
                `Riqueza alterada para ${nivel}: ${sinal}$${Math.abs(diferenca)}`, 
                diferenca > 0 ? 'sucesso' : 'aviso'
            );
        }
    }

    obterNomeNivelRiqueza(pontos) {
        const niveis = {
            '-25': 'Falido', '-15': 'Pobre', '-10': 'Batalhador',
            '0': 'Médio', '10': 'Confortável', '20': 'Rico',
            '30': 'Muito Rico', '50': 'Podre de Rico'
        };
        return niveis[pontos.toString()] || 'Desconhecido';
    }

    inicializarSistema() {
        this.configurarEventosGlobais();
        this.configurarSubAbas();
        this.configurarFiltrosInventario();
        this.configurarCriacaoItens();
        this.criarDisplayMaos();
        this.atualizarSistemaCombate();
        this.atualizarInterface();
        
        const btnMochila = document.getElementById('btn-liberar-mochila');
        if (btnMochila) {
            btnMochila.addEventListener('click', () => this.alternarMochila());
        }
        
        document.getElementById('btn-guardar-tudo-deposito')?.addEventListener('click', () => this.moverTudoParaDeposito());
        document.getElementById('btn-retirar-tudo-deposito')?.addEventListener('click', () => this.retirarTudoDoDeposito());
        document.getElementById('btn-limpar-deposito')?.addEventListener('click', () => this.limparDeposito());
    }

    atualizarInterfaceFinanceiro() {
        const dinheiroBanner = document.getElementById('dinheiroEquipamento');
        if (dinheiroBanner) {
            dinheiroBanner.textContent = `$${this.dinheiro}`;
            dinheiroBanner.style.color = this.dinheiro > 0 ? '#27ae60' : '#e74c3c';
            dinheiroBanner.style.fontWeight = 'bold';
        }
        
        const dinheiroDisponivel = document.getElementById('dinheiro-disponivel');
        if (dinheiroDisponivel) {
            dinheiroDisponivel.textContent = `$${this.dinheiro}`;
            dinheiroDisponivel.style.color = this.dinheiro > 0 ? '#27ae60' : '#e74c3c';
        }
        
        const saldoModal = document.getElementById('saldo-modal-atual');
        if (saldoModal) {
            saldoModal.textContent = `$${this.dinheiro}`;
        }
    }

    calcularCapacidadeCarga() {
        const ST = this.ST;
        const cargasTable = {
            1: { nenhuma: 0.1, leve: 0.2, media: 0.3, pesada: 0.6, muitoPesada: 1.0 },
            2: { nenhuma: 0.4, leve: 0.8, media: 1.2, pesada: 2.4, muitoPesada: 4.0 },
            3: { nenhuma: 0.9, leve: 1.8, media: 2.7, pesada: 5.4, muitoPesada: 9.0 },
            4: { nenhuma: 1.6, leve: 3.2, media: 4.8, pesada: 9.6, muitoPesada: 16.0 },
            5: { nenhuma: 2.5, leve: 5.0, media: 7.5, pesada: 15.0, muitoPesada: 25.5 },
            6: { nenhuma: 3.6, leve: 7.2, media: 10.8, pesada: 21.6, muitoPesada: 36.0 },
            7: { nenhuma: 4.9, leve: 9.8, media: 14.7, pesada: 29.4, muitoPesada: 49.0 },
            8: { nenhuma: 6.5, leve: 13.0, media: 19.5, pesada: 39.0, muitoPesada: 65.0 },
            9: { nenhuma: 8.0, leve: 16.0, media: 24.0, pesada: 48.0, muitoPesada: 80.0 },
            10: { nenhuma: 10.0, leve: 20.0, media: 30.0, pesada: 60.0, muitoPesada: 100.0 }
        };
        
        let stKey = ST;
        if (ST > 10) stKey = 10;
        if (ST < 1) stKey = 1;

        return cargasTable[stKey] || cargasTable[10];
    }

    atualizarNivelCarga() {
        const peso = this.pesoAtual;
        const { nenhuma, leve, media, pesada, muitoPesada } = this.capacidadeCarga;

        let novoNivel = 'leve';
        let novasPenalidades = 'MOV +0 / DODGE +0';

        if (peso <= nenhuma) {
            novoNivel = 'nenhuma';
            novasPenalidades = 'MOV +0 / DODGE +0';
        } else if (peso <= leve) {
            novoNivel = 'leve';
            novasPenalidades = 'MOV +0 / DODGE +0';
        } else if (peso <= media) {
            novoNivel = 'média';
            novasPenalidades = 'MOV -1 / DODGE -1';
        } else if (peso <= pesada) {
            novoNivel = 'pesada';
            novasPenalidades = 'MOV -2 / DODGE -2';
        } else if (peso <= muitoPesada) {
            novoNivel = 'muito pesada';
            novasPenalidades = 'MOV -3 / DODGE -3';
        } else {
            novoNivel = 'sobrecarregado';
            novasPenalidades = 'MOV -4 / DODGE -4 / Não pode correr';
        }

        if (this.nivelCargaAtual !== novoNivel || this.penalidadesCarga !== novasPenalidades) {
            this.nivelCargaAtual = novoNivel;
            this.penalidadesCarga = novasPenalidades;
        }
    }

    calcularPesoAtual() {
        let peso = 0;

        peso += this.equipamentosEquipados.maos.reduce((sum, item) => sum + (item.peso || 0), 0);
        peso += this.equipamentosEquipados.armaduras.reduce((sum, item) => sum + (item.peso || 0), 0);
        peso += this.equipamentosEquipados.escudos.reduce((sum, item) => sum + (item.peso || 0), 0);

        peso += this.equipamentosEquipados.corpo.reduce((sum, item) => {
            const quantidade = item.quantidade || 1;
            return sum + (item.peso * quantidade);
        }, 0);

        if (this.mochilaAtiva) {
            peso += this.equipamentosEquipados.mochila.reduce((sum, item) => {
                const quantidade = item.quantidade || 1;
                return sum + (item.peso * quantidade);
            }, 0);
        }

        return parseFloat(peso.toFixed(1));
    }

    atualizarPeso() {
        this.pesoAtual = this.calcularPesoAtual();
        this.atualizarNivelCarga();
    }

    alternarMochila() {
        this.mochilaAtiva = !this.mochilaAtiva;
        this.atualizarPeso();
        this.atualizarInterface();
        
        const mensagem = this.mochilaAtiva ? 
            'Mochila equipada' : 
            'Mochila liberada';
        
        this.mostrarFeedback(mensagem, this.mochilaAtiva ? 'sucesso' : 'aviso');
    }

    receberDinheiroRapido() {
        this.abrirModalDinheiroSimples('receber');
    }

    gastarDinheiroRapido() {
        this.abrirModalDinheiroSimples('gastar');
    }

    abrirModalDinheiroSimples(tipo) {
        this.operacaoAtual = tipo;
        
        const titulo = document.getElementById('modal-titulo');
        if (titulo) {
            titulo.textContent = tipo === 'receber' ? 'Receber Dinheiro' : 'Gastar Dinheiro';
        }
        
        const saldoAtual = document.getElementById('saldo-modal-atual');
        if (saldoAtual) {
            saldoAtual.textContent = `$${this.dinheiro}`;
        }
        
        const valorInput = document.getElementById('valor-operacao');
        const descricaoInput = document.getElementById('descricao-operacao');
        
        if (valorInput) {
            valorInput.value = '';
            valorInput.focus();
        }
        
        if (descricaoInput) {
            descricaoInput.value = '';
        }
        
        const modal = document.getElementById('modal-dinheiro-simples');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('aberto');
            }, 10);
        }
    }

    fecharModalSimples() {
        const modal = document.getElementById('modal-dinheiro-simples');
        if (modal) {
            modal.classList.remove('aberto');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
        this.operacaoAtual = null;
    }

    confirmarOperacao() {
        const valorInput = document.getElementById('valor-operacao');
        const descricaoInput = document.getElementById('descricao-operacao');
        
        if (!valorInput || !descricaoInput) return;
        
        const valor = parseFloat(valorInput.value);
        const descricao = descricaoInput.value.trim();
        
        if (!valor || isNaN(valor) || valor <= 0) {
            this.mostrarFeedback('Por favor, insira um valor válido!', 'erro');
            return;
        }
        
        if (!descricao) {
            this.mostrarFeedback('Por favor, insira um motivo!', 'erro');
            return;
        }
        
        if (this.operacaoAtual === 'gastar') {
            if (valor > this.dinheiro) {
                this.mostrarFeedback('Dinheiro insuficiente!', 'erro');
                return;
            }
            this.dinheiro -= valor;
        } else {
            this.dinheiro += valor;
        }
        
        this.registrarTransacao({
            tipo: this.operacaoAtual === 'gastar' ? 'despesa' : 'receita',
            valor: valor,
            descricao: descricao
        });
        
        this.fecharModalSimples();
        this.atualizarInterfaceFinanceiro();
        this.notificarDashboard();
        
        const mensagem = this.operacaoAtual === 'gastar' 
            ? `Gasto $${valor}: ${descricao}` 
            : `Recebido $${valor}: ${descricao}`;
        
        this.mostrarFeedback(mensagem, 'sucesso');
    }

    adicionarDinheiro(valor) {
        if (isNaN(valor) || valor <= 0) {
            this.mostrarFeedback('Valor inválido!', 'erro');
            return;
        }
        
        this.dinheiro += valor;
        this.registrarTransacao({
            tipo: 'receita',
            valor: valor,
            descricao: 'Dinheiro rápido adicionado'
        });
        
        this.mostrarFeedback(`Adicionado $${valor}`, 'sucesso');
        this.atualizarInterfaceFinanceiro();
        this.notificarDashboard();
    }

    removerDinheiro(valor) {
        if (isNaN(valor) || valor <= 0) {
            this.mostrarFeedback('Valor inválido!', 'erro');
            return;
        }
        
        if (valor > this.dinheiro) {
            this.mostrarFeedback('Dinheiro insuficiente!', 'erro');
            return;
        }
        
        this.dinheiro -= valor;
        this.registrarTransacao({
            tipo: 'despesa',
            valor: valor,
            descricao: 'Dinheiro rápido removido'
        });
        
        this.mostrarFeedback(`Removido $${valor}`, 'sucesso');
        this.atualizarInterfaceFinanceiro();
        this.notificarDashboard();
    }

    ajustarDinheiroManual() {
        const novoValor = prompt('Digite o novo valor de dinheiro:', this.dinheiro);
        if (novoValor === null) return;
        
        const valorNumerico = parseInt(novoValor);
        if (isNaN(valorNumerico)) {
            this.mostrarFeedback('Valor inválido!', 'erro');
            return;
        }
        
        const diferenca = valorNumerico - this.dinheiro;
        this.dinheiro = valorNumerico;
        
        if (diferenca > 0) {
            this.registrarTransacao({
                tipo: 'receita',
                valor: diferenca,
                descricao: 'Ajuste manual'
            });
        } else if (diferenca < 0) {
            this.registrarTransacao({
                tipo: 'despesa',
                valor: Math.abs(diferenca),
                descricao: 'Ajuste manual'
            });
        }
        
        this.mostrarFeedback(`Dinheiro ajustado para $${valorNumerico}`, 'sucesso');
        this.atualizarInterfaceFinanceiro();
        this.notificarDashboard();
    }

    registrarTransacao(dados) {
        const transacao = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            tipo: dados.tipo,
            valor: dados.valor,
            descricao: dados.descricao,
            data: new Date().toLocaleDateString('pt-BR'),
            timestamp: new Date().toISOString()
        };
        
        this.ultimasTransacoes.unshift(transacao);
        
        if (this.ultimasTransacoes.length > 10) {
            this.ultimasTransacoes = this.ultimasTransacoes.slice(0, 10);
        }
    }

        comprarEquipamento(itemId, elemento) {
        if (!this.catalogoPronto) {
            this.mostrarFeedback('Sistema ainda carregando...', 'erro');
            return;
        }

        const equipamento = this.obterEquipamentoPorId(itemId);
        if (!equipamento) {
            this.mostrarFeedback('Equipamento não encontrado!', 'erro');
            return;
        }

        if (equipamento.quantificavel === true) {
            this.abrirSubmenuQuantidade(itemId, elemento);
            return;
        }

        if (this.dinheiro < equipamento.custo) {
            this.mostrarFeedback(`Dinheiro insuficiente! Necessário: $${equipamento.custo}`, 'erro');
            return;
        }

        const novoEquipamento = {
            ...equipamento,
            adquiridoEm: new Date().toISOString(),
            status: 'na-mochila',
            equipado: false,
            idUnico: this.gerarIdUnico(),
            quantidade: 1
        };

        this.equipamentosAdquiridos.push(novoEquipamento);
        this.equipamentosEquipados.mochila.push(novoEquipamento);
        
        this.dinheiro -= equipamento.custo;

        this.mostrarFeedback(`${equipamento.nome} comprado com sucesso!`, 'sucesso');
        this.atualizarInterface();
        this.notificarDashboard();
        
        this.registrarTransacao({
            tipo: 'despesa',
            valor: equipamento.custo,
            descricao: `Compra: ${equipamento.nome}`
        });
    }

    venderEquipamento(itemId) {
        const index = this.equipamentosAdquiridos.findIndex(item => item.idUnico === itemId);
        if (index === -1) {
            this.mostrarFeedback('Equipamento não encontrado para venda!', 'erro');
            return;
        }

        const equipamento = this.equipamentosAdquiridos[index];
        const custoBase = equipamento.custoTotal || equipamento.custo;
        const quantidade = equipamento.quantidade || 1;
        const valorVenda = Math.floor(custoBase * 0.5 * quantidade);
        
        this.dinheiro += valorVenda;
        this.removerDeTodosOsLocais(itemId);
        this.equipamentosAdquiridos.splice(index, 1);
        this.deposito = this.deposito.filter(item => item.idUnico !== itemId);

        this.mostrarFeedback(`${equipamento.nome} vendido por $${valorVenda}`, 'sucesso');
        this.atualizarInterface();
        this.notificarDashboard();
        
        this.registrarTransacao({
            tipo: 'receita',
            valor: valorVenda,
            descricao: `Venda: ${equipamento.nome}`
        });
    }

    configurarEventosGlobais() {
        document.addEventListener('click', (e) => {
            const btnComprar = e.target.closest('.btn-comprar');
            if (btnComprar) {
                const itemId = btnComprar.getAttribute('data-item');
                if (itemId) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.comprarEquipamento(itemId, btnComprar);
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            const modalDinheiro = document.getElementById('modal-dinheiro-simples');
            if (modalDinheiro && modalDinheiro.classList.contains('aberto') && e.key === 'Escape') {
                this.fecharModalSimples();
            }
        });

        document.addEventListener('click', (e) => {
            const modalDinheiro = document.getElementById('modal-dinheiro-simples');
            if (modalDinheiro && e.target === modalDinheiro) {
                this.fecharModalSimples();
            }
        });
    }

    configurarSubAbas() {
        document.querySelectorAll('.subtab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                const subtabId = btn.getAttribute('data-subtab');
                const subtabElement = document.getElementById(`subtab-${subtabId}`);
                if (subtabElement) subtabElement.classList.add('active');
                
                if (subtabId === 'financeiro') {
                    setTimeout(() => {
                        this.atualizarInterfaceFinanceiro();
                    }, 100);
                }
            });
        });
    }

    atualizarInterface() {
        this.atualizarStatus();
        this.atualizarListaEquipamentosAdquiridos();
        this.atualizarInfoCarga();
        this.atualizarDisplayMaos();
        this.atualizarInterfaceDeposito();
        this.atualizarInterfaceFinanceiro();
    }

    atualizarStatus() {
        this.atualizarPeso();

        const pesoAtualElem = document.getElementById('pesoAtual');
        if (pesoAtualElem) pesoAtualElem.textContent = this.pesoAtual.toFixed(1);

        const pesoMaximoElem = document.getElementById('pesoMaximo');
        if (pesoMaximoElem) pesoMaximoElem.textContent = this.pesoMaximo.toFixed(1);

        const nivelCargaElem = document.getElementById('nivelCarga');
        if (nivelCargaElem) {
            nivelCargaElem.textContent = this.nivelCargaAtual.toUpperCase();
            nivelCargaElem.className = `carga-${this.nivelCargaAtual.replace(' ', '-')}`;
        }

        const penalidadesElem = document.getElementById('penalidadesCarga');
        if (penalidadesElem) penalidadesElem.textContent = this.penalidadesCarga;

        const contadorMochila = document.getElementById('contadorMochila');
        if (contadorMochila) {
            const itensNaMochila = this.equipamentosAdquiridos.filter(item => 
                item.status === 'na-mochila' && !item.equipado
            ).length;
            contadorMochila.textContent = itensNaMochila;
        }
    }

    notificarDashboard() {
        const event = new CustomEvent('equipamentosAtualizados', {
            detail: {
                dinheiro: this.dinheiro,
                pesoAtual: this.pesoAtual,
                pesoMaximo: this.pesoMaximo,
                nivelCargaAtual: this.nivelCargaAtual,
                penalidadesCarga: this.penalidadesCarga,
                totalEquipamentos: this.equipamentosAdquiridos.length,
                gastoTotal: this.calcularGastoTotalEquipamentos()
            }
        });
        document.dispatchEvent(event);
    }

    obterEquipamentoPorId(itemId) {
        if (!this.catalogoPronto || !window.catalogoEquipamentos) {
            return null;
        }
        return window.catalogoEquipamentos.obterEquipamentoPorId(itemId);
    }

    gerarIdUnico() {
        return 'eq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    mostrarFeedback(mensagem, tipo) {
        const feedback = document.createElement('div');
        feedback.className = `feedback-message feedback-${tipo}`;
        feedback.innerHTML = `
            <i class="fas fa-${tipo === 'sucesso' ? 'check-circle' : tipo === 'erro' ? 'times-circle' : 'exclamation-triangle'}"></i>
            <span>${mensagem}</span>
        `;
        
        feedback.style.cssText = `
            position: fixed;
            top: 25px;
            right: 25px;
            padding: 18px 30px;
            border-radius: 12px;
            color: white;
            font-weight: 700;
            z-index: 10000;
            opacity: 0;
            transform: translateX(150px);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.1);
            max-width: 400px;
            font-size: 1rem;
            display: flex;
            align-items: center;
            gap: 15px;
        `;
        
        if (tipo === 'sucesso') {
            feedback.style.background = 'linear-gradient(135deg, rgba(39, 174, 96, 0.95), rgba(46, 204, 113, 0.95))';
            feedback.style.borderLeft = '5px solid #27ae60';
        } else if (tipo === 'erro') {
            feedback.style.background = 'linear-gradient(135deg, rgba(231, 76, 60, 0.95), rgba(192, 57, 43, 0.95))';
            feedback.style.borderLeft = '5px solid #e74c3c';
        } else if (tipo === 'aviso') {
            feedback.style.background = 'linear-gradient(135deg, rgba(243, 156, 18, 0.95), rgba(230, 126, 34, 0.95))';
            feedback.style.borderLeft = '5px solid #f39c12';
        }
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateX(150px)';
            setTimeout(() => {
                if (feedback.parentNode) feedback.parentNode.removeChild(feedback);
            }, 300);
        }, 3000);
    }

    exportarDados() {
        return {
            equipamentosAdquiridos: this.equipamentosAdquiridos,
            dinheiro: this.dinheiro,
            pesoAtual: this.pesoAtual,
            mochilaAtiva: this.mochilaAtiva,
            equipamentosEquipados: this.equipamentosEquipados,
            deposito: this.deposito,
            ultimasTransacoes: this.ultimasTransacoes,
            contadorItensPersonalizados: this.contadorItensPersonalizados,
            ST: this.ST,
            nivelCargaAtual: this.nivelCargaAtual,
            penalidadesCarga: this.penalidadesCarga,
            nivelRiquezaAtual: this.pontosRiquezaAtual,
            valorBaseRiqueza: this.valorBaseRiqueza,
            timestamp: new Date().getTime(),
            version: '1.0-integrado'
        };
    }

    abrirSubmenuQuantidade(itemId, elemento) {
        const equipamento = this.obterEquipamentoPorId(itemId);
        if (!equipamento) return;

        this.itemCompraQuantidade = equipamento;
        this.quantidadeAtual = 1;

        const nomeItem = document.getElementById('quantidade-nome-item');
        const custoUnitario = document.getElementById('quantidade-custo-unitario');
        const pesoUnitario = document.getElementById('quantidade-peso-unitario');
        
        if (nomeItem) nomeItem.textContent = equipamento.nome;
        if (custoUnitario) custoUnitario.textContent = `Custo: $${equipamento.custo}`;
        if (pesoUnitario) pesoUnitario.textContent = `Peso: ${equipamento.peso} kg`;

        const inputQuantidade = document.getElementById('input-quantidade');
        if (inputQuantidade) {
            inputQuantidade.value = this.quantidadeAtual;
            inputQuantidade.focus();
        }

        this.atualizarTotaisQuantidade();

        const submenu = document.getElementById('submenu-quantidade');
        if (!submenu) return;

        submenu.style.display = 'flex';
        setTimeout(() => {
            submenu.classList.add('aberto');
        }, 10);
    }

    aumentarQuantidade() {
        this.quantidadeAtual = Math.min(this.quantidadeAtual + 1, 99);
        const inputQuantidade = document.getElementById('input-quantidade');
        if (inputQuantidade) {
            inputQuantidade.value = this.quantidadeAtual;
        }
        this.atualizarTotaisQuantidade();
    }

    diminuirQuantidade() {
        this.quantidadeAtual = Math.max(this.quantidadeAtual - 1, 1);
        const inputQuantidade = document.getElementById('input-quantidade');
        if (inputQuantidade) {
            inputQuantidade.value = this.quantidadeAtual;
        }
        this.atualizarTotaisQuantidade();
    }

    atualizarTotaisQuantidade() {
        if (!this.itemCompraQuantidade) return;

        const custoTotal = this.itemCompraQuantidade.custo * this.quantidadeAtual;
        const pesoTotal = this.itemCompraQuantidade.peso * this.quantidadeAtual;

        const custoTotalElem = document.getElementById('quantidade-custo-total');
        const pesoTotalElem = document.getElementById('quantidade-peso-total');
        
        if (custoTotalElem) custoTotalElem.textContent = `$${custoTotal}`;
        if (pesoTotalElem) pesoTotalElem.textContent = `${pesoTotal.toFixed(1)} kg`;
    }

    confirmarCompraQuantidade() {
        if (!this.itemCompraQuantidade) return;
        
        const equipamento = this.itemCompraQuantidade;
        const quantidade = this.quantidadeAtual;
        const custoTotal = equipamento.custo * quantidade;
        const pesoTotal = equipamento.peso * quantidade;

        if (this.dinheiro < custoTotal) {
            this.mostrarFeedback(`Dinheiro insuficiente! Necessário: $${custoTotal}`, 'erro');
            return;
        }

        if (equipamento.quantificavel === true) {
            const itemExistente = this.equipamentosAdquiridos.find(item => 
                item.id === equipamento.id &&
                item.status === 'na-mochila' &&
                !item.equipado &&
                item.quantificavel === true
            );
            
            if (itemExistente) {
                itemExistente.quantidade = (itemExistente.quantidade || 1) + quantidade;
                itemExistente.custoTotal = (itemExistente.custoTotal || itemExistente.custo) + custoTotal;
            } else {
                const novoEquipamento = {
                    ...equipamento,
                    quantidade: quantidade,
                    custoTotal: custoTotal,
                    adquiridoEm: new Date().toISOString(),
                    status: 'na-mochila',
                    equipado: false,
                    idUnico: this.gerarIdUnico()
                };

                this.equipamentosAdquiridos.push(novoEquipamento);
                this.equipamentosEquipados.mochila.push(novoEquipamento);
            }
        } else {
            for (let i = 0; i < quantidade; i++) {
                const novoEquipamento = {
                    ...equipamento,
                    adquiridoEm: new Date().toISOString(),
                    status: 'na-mochila',
                    equipado: false,
                    idUnico: this.gerarIdUnico(),
                    quantidade: 1
                };
                
                this.equipamentosAdquiridos.push(novoEquipamento);
                this.equipamentosEquipados.mochila.push(novoEquipamento);
            }
        }

        this.dinheiro -= custoTotal;
        this.mostrarFeedback(`${quantidade}x ${equipamento.nome} comprado(s) com sucesso!`, 'sucesso');
        
        this.fecharSubmenuQuantidade();
        this.atualizarInterface();
        this.notificarDashboard();
        
        this.registrarTransacao({
            tipo: 'despesa',
            valor: custoTotal,
            descricao: `Compra: ${quantidade}x ${equipamento.nome}`
        });
    }

    fecharSubmenuQuantidade() {
        const submenu = document.getElementById('submenu-quantidade');
        if (submenu) {
            submenu.classList.remove('aberto');
            setTimeout(() => {
                submenu.style.display = 'none';
            }, 300);
        }
        this.itemCompraQuantidade = null;
        this.quantidadeAtual = 1;
    }

        equiparItem(itemId) {
        const equipamento = this.equipamentosAdquiridos.find(item => item.idUnico === itemId);
        if (!equipamento) {
            this.mostrarFeedback('Equipamento não encontrado!', 'erro');
            return;
        }

        if (equipamento.equipado) {
            this.mostrarFeedback(`${equipamento.nome} já está equipado!`, 'aviso');
            return;
        }

        if (equipamento.quantidade && equipamento.quantidade > 1) {
            this.mostrarFeedback('Não é possível equipar itens em quantidade!', 'erro');
            return;
        }

        switch(equipamento.tipo) {
            case 'arma-cc':
            case 'arma-dist':
                if (!this.podeEquiparArma(equipamento)) {
                    this.mostrarFeedback('Não há mãos suficientes!', 'erro');
                    return;
                }
                this.equiparArma(itemId);
                break;
                
            case 'armadura':
                if (!this.podeEquiparArmadura(equipamento)) {
                    this.mostrarFeedback('Não é possível equipar esta armadura!', 'erro');
                    return;
                }
                this.equiparArmadura(itemId);
                break;
                
            case 'escudo':
                if (!this.podeEquiparEscudo(equipamento)) {
                    this.mostrarFeedback('Não é possível equipar este escudo!', 'erro');
                    return;
                }
                this.equiparEscudo(itemId);
                break;
                
            default:
                this.equiparItemGeral(itemId);
        }

        this.atualizarInterface();
        this.atualizarSistemaCombate();
    }

    podeEquiparArma(arma) {
        const maosOcupadas = this.calcularMaosOcupadas();
        const maosNecessarias = arma.maos || 1;
        
        if (maosOcupadas + maosNecessarias > this.maosDisponiveis) {
            return false;
        }
        
        return true;
    }

    podeEquiparArmadura(armadura) {
        const local = armadura.local;
        if (!local) return false;
        
        const localCombate = this.mapeamentoLocais[local];
        if (!localCombate) return false;
        
        const armaduraAtual = this.equipamentosEquipados.armaduras.find(a => a.local === local);
        return !armaduraAtual;
    }

    podeEquiparEscudo(escudo) {
        const maosOcupadas = this.calcularMaosOcupadas();
        const maosNecessarias = escudo.maos || 1;
        
        if (this.equipamentosEquipados.escudos.length > 0) {
            return false;
        }
        
        return maosOcupadas + maosNecessarias <= this.maosDisponiveis;
    }

    equiparArma(itemId) {
        const equipamento = this.equipamentosAdquiridos.find(item => item.idUnico === itemId);
        if (!equipamento) return;

        this.removerDeTodosOsLocais(itemId);
        equipamento.status = 'equipado';
        equipamento.equipado = true;
        this.equipamentosEquipados.maos.push(equipamento);
        
        this.mostrarFeedback(`${equipamento.nome} equipado`, 'sucesso');
        this.atualizarDisplayMaos();
    }

    equiparArmadura(itemId) {
        const equipamento = this.equipamentosAdquiridos.find(item => item.idUnico === itemId);
        if (!equipamento) return;

        this.removerDeTodosOsLocais(itemId);
        equipamento.status = 'equipado';
        equipamento.equipado = true;
        this.equipamentosEquipados.armaduras.push(equipamento);
        
        this.mostrarFeedback(`${equipamento.nome} equipado`, 'sucesso');
    }

    equiparEscudo(itemId) {
        const equipamento = this.equipamentosAdquiridos.find(item => item.idUnico === itemId);
        if (!equipamento) return;

        this.removerDeTodosOsLocais(itemId);
        equipamento.status = 'equipado';
        equipamento.equipado = true;
        this.equipamentosEquipados.escudos.push(equipamento);
        
        this.mostrarFeedback(`${equipamento.nome} equipado`, 'sucesso');
        this.atualizarDisplayMaos();
    }

    equiparItemGeral(itemId) {
        const equipamento = this.equipamentosAdquiridos.find(item => item.idUnico === itemId);
        if (!equipamento) return;

        this.removerDeTodosOsLocais(itemId);
        equipamento.status = 'equipado';
        equipamento.equipado = true;
        this.equipamentosEquipados.mochila.push(equipamento);
        
        this.mostrarFeedback(`${equipamento.nome} preparado`, 'sucesso');
        
        if (equipamento.maos > 0) {
            this.atualizarDisplayMaos();
        }
    }

    desequiparItem(itemId) {
        const equipamento = this.equipamentosAdquiridos.find(item => item.idUnico === itemId);
        if (!equipamento) {
            this.mostrarFeedback('Equipamento não encontrado!', 'erro');
            return;
        }

        if (!equipamento.equipado) {
            this.mostrarFeedback(`${equipamento.nome} não está equipado!`, 'aviso');
            return;
        }

        this.removerDeTodosOsLocais(itemId);
        equipamento.status = 'na-mochila';
        equipamento.equipado = false;
        this.equipamentosEquipados.mochila.push(equipamento);

        this.mostrarFeedback(`${equipamento.nome} guardado`, 'sucesso');
        this.atualizarInterface();
        this.atualizarDisplayMaos();
        this.atualizarSistemaCombate();
    }

    colocarNoCorpo(itemId) {
        const equipamento = this.equipamentosAdquiridos.find(item => item.idUnico === itemId);
        if (!equipamento) {
            this.mostrarFeedback('Equipamento não encontrado!', 'erro');
            return;
        }

        if (equipamento.equipado) {
            this.mostrarFeedback('Não é possível colocar no corpo um item equipado!', 'erro');
            return;
        }

        if (equipamento.status === 'deposito') {
            this.mostrarFeedback('Não é possível colocar no corpo um item no depósito!', 'erro');
            return;
        }

        this.removerDeTodosOsLocais(itemId);
        equipamento.status = 'no-corpo';
        equipamento.equipado = false;
        this.equipamentosEquipados.corpo.push(equipamento);

        this.mostrarFeedback(`${equipamento.nome} colocado no corpo`, 'sucesso');
        this.atualizarInterface();
        this.atualizarSistemaCombate();
    }

    removerDoCorpo(itemId) {
        const equipamento = this.equipamentosAdquiridos.find(item => item.idUnico === itemId);
        if (!equipamento) {
            this.mostrarFeedback('Equipamento não encontrado!', 'erro');
            return;
        }

        if (equipamento.status !== 'no-corpo') {
            this.mostrarFeedback(`${equipamento.nome} não está no corpo!`, 'erro');
            return;
        }

        this.removerDeTodosOsLocais(itemId);
        equipamento.status = 'na-mochila';
        equipamento.equipado = false;
        this.equipamentosEquipados.mochila.push(equipamento);

        this.mostrarFeedback(`${equipamento.nome} removido do corpo`, 'sucesso');
        this.atualizarInterface();
        this.atualizarSistemaCombate();
    }

    moverParaDeposito(itemId) {
        const equipamento = this.equipamentosAdquiridos.find(item => item.idUnico === itemId);
        if (!equipamento) {
            this.mostrarFeedback('Equipamento não encontrado!', 'erro');
            return false;
        }

        if (equipamento.status === 'deposito') {
            this.mostrarFeedback(`${equipamento.nome} já está no depósito!`, 'aviso');
            return false;
        }

        this.removerDeTodosOsLocais(itemId);
        equipamento.status = 'deposito';
        equipamento.equipado = false;
        this.deposito.push(equipamento);

        this.mostrarFeedback(`${equipamento.nome} guardado no depósito`, 'sucesso');
        this.atualizarInterface();
        return true;
    }

    retirarDoDeposito(itemId) {
        const index = this.deposito.findIndex(item => item.idUnico === itemId);
        if (index === -1) {
            this.mostrarFeedback('Item não encontrado no depósito!', 'erro');
            return false;
        }

        const equipamento = this.deposito[index];
        this.deposito.splice(index, 1);
        equipamento.status = 'na-mochila';
        equipamento.equipado = false;
        this.equipamentosEquipados.mochila.push(equipamento);

        this.mostrarFeedback(`${equipamento.nome} retirado do depósito`, 'sucesso');
        this.atualizarInterface();
        return true;
    }

    moverTudoParaDeposito() {
        const equipamentosNaMochila = this.equipamentosAdquiridos.filter(
            item => item.status === 'na-mochila' && !item.equipado
        );

        if (equipamentosNaMochila.length === 0) {
            this.mostrarFeedback('Nenhum equipamento na mochila para guardar!', 'aviso');
            return;
        }

        equipamentosNaMochila.forEach(equipamento => {
            this.removerDeTodosOsLocais(equipamento.idUnico);
            equipamento.status = 'deposito';
            equipamento.equipado = false;
            this.deposito.push(equipamento);
        });

        this.mostrarFeedback(`${equipamentosNaMochila.length} itens guardados no depósito`, 'sucesso');
        this.atualizarInterface();
    }

    retirarTudoDoDeposito() {
        if (this.deposito.length === 0) {
            this.mostrarFeedback('Depósito vazio!', 'aviso');
            return;
        }

        const totalItens = this.deposito.length;
        this.deposito.forEach(equipamento => {
            equipamento.status = 'na-mochila';
            equipamento.equipado = false;
            this.equipamentosEquipados.mochila.push(equipamento);
        });

        this.deposito = [];
        this.mostrarFeedback(`${totalItens} itens retirados do depósito`, 'sucesso');
        this.atualizarInterface();
    }

    limparDeposito() {
        if (this.deposito.length === 0) {
            this.mostrarFeedback('Depósito já está vazio!', 'aviso');
            return;
        }

        const totalLimpos = this.deposito.length;
        
        this.equipamentosAdquiridos = this.equipamentosAdquiridos.filter(
            item => item.status !== 'deposito'
        );

        this.deposito = [];
        this.mostrarFeedback(`${totalLimpos} itens removidos do depósito`, 'sucesso');
        this.atualizarInterface();
    }

    criarDisplayMaos() {
        const statusBar = document.querySelector('.banner-grid');
        if (!statusBar || document.getElementById('displayMaos')) return;
        
        const maosContainer = document.createElement('div');
        maosContainer.className = 'status-card';
        maosContainer.innerHTML = `
            <div class="status-header">
                <i class="fas fa-hands"></i>
                <h4>Mãos Livres</h4>
            </div>
            <div class="status-value" id="displayMaos">
                <span class="mao-livre">👐</span><span class="mao-livre">👐</span>
            </div>
            <div class="status-info">
                <small>${this.maosDisponiveis} mãos disponíveis</small>
            </div>
        `;
        statusBar.appendChild(maosContainer);
    }

    calcularMaosOcupadas() {
        let maosOcupadas = 0;
        
        maosOcupadas += this.equipamentosEquipados.maos.reduce((total, arma) => {
            return total + (arma.maos || 1);
        }, 0);
        
        maosOcupadas += this.equipamentosEquipados.escudos.reduce((total, escudo) => {
            return total + (escudo.maos || 1);
        }, 0);
        
        maosOcupadas += this.equipamentosEquipados.mochila
            .filter(item => item.equipado && item.maos > 0)
            .reduce((total, item) => total + item.maos, 0);
        
        this.maosOcupadas = maosOcupadas;
        return maosOcupadas;
    }

    atualizarDisplayMaos() {
        const displayMaos = document.getElementById('displayMaos');
        if (!displayMaos) return;
        
        const maosOcupadas = this.calcularMaosOcupadas();
        const maosLivres = this.maosDisponiveis - maosOcupadas;
        
        let html = '';
        
        for (let i = 0; i < maosOcupadas; i++) {
            html += `<span class="mao-ocupada" title="Mão ocupada">👊</span>`;
        }
        
        for (let i = 0; i < maosLivres; i++) {
            html += `<span class="mao-livre" title="Mão livre">👐</span>`;
        }
        
        displayMaos.innerHTML = html;
        
        const statusInfo = displayMaos.parentElement?.querySelector('.status-info small');
        if (statusInfo) {
            statusInfo.textContent = `${maosLivres} mãos disponíveis`;
        }
    }

        atualizarListaEquipamentosAdquiridos(equipamentosFiltrados = null) {
        const lista = document.getElementById('lista-equipamentos-adquiridos');
        if (!lista) return;

        const equipamentosParaExibir = equipamentosFiltrados || this.equipamentosAdquiridos;

        if (equipamentosParaExibir.length === 0) {
            lista.innerHTML = `
                <div class="inventario-vazio">
                    <i class="fas fa-inbox fa-3x"></i>
                    <h4>Inventário Vazio</h4>
                    <p>Adquira equipamentos no catálogo para começar</p>
                    <button class="btn-ir-catalogo" onclick="sistemaEquipamentos.alternarSubTab('catalogo')">
                        <i class="fas fa-store"></i> Ir para Catálogo
                    </button>
                </div>
            `;
            return;
        }

        const equipamentosOrdenados = [...equipamentosParaExibir].sort((a, b) => {
            if (a.equipado && !b.equipado) return -1;
            if (!a.equipado && b.equipado) return 1;
            if (a.status === 'no-corpo' && b.status !== 'no-corpo') return -1;
            if (a.status !== 'no-corpo' && b.status === 'no-corpo') return 1;
            if (a.status === 'deposito' && b.status !== 'deposito') return 1;
            if (a.status !== 'deposito' && b.status === 'deposito') return -1;
            return a.nome.localeCompare(b.nome);
        });

        lista.innerHTML = equipamentosOrdenados.map(equipamento => `
            <div class="equipamento-adquirido-item ${equipamento.equipado ? 'equipado' : equipamento.status === 'deposito' ? 'no-deposito' : equipamento.status === 'no-corpo' ? 'no-corpo' : 'na-mochila'}">
                <div class="equipamento-info">
                    <div class="equipamento-detalhes">
                        <h4>${equipamento.nome} ${equipamento.quantidade > 1 ? `<span class="quantidade-badge">(${equipamento.quantidade}x)</span>` : ''}
                            ${equipamento.personalizado ? '✨' : ''}
                            ${equipamento.equipado ? '⚔️' : equipamento.status === 'deposito' ? '🏠' : equipamento.status === 'no-corpo' ? '👤' : '🎒'}
                        </h4>
                        <div class="equipamento-stats">
                            <span>Custo: $${equipamento.custoTotal || equipamento.custo}</span>
                            ${equipamento.dano ? `<span>Dano: ${equipamento.dano}</span>` : ''}
                            ${equipamento.tipoDano ? `<span>Tipo: ${equipamento.tipoDano}</span>` : ''}
                            ${equipamento.alcance ? `<span>Alcance: ${equipamento.alcance}</span>` : ''}
                            ${equipamento.rd ? `<span>RD: ${equipamento.rd}</span>` : ''}
                            ${equipamento.bd ? `<span>BD: ${equipamento.bd}</span>` : ''}
                            ${equipamento.local ? `<span>Local: ${equipamento.local}</span>` : ''}
                            ${equipamento.maos > 0 ? `<span>Mãos: ${this.obterTextoMaos(equipamento.maos)}</span>` : ''}
                            ${equipamento.quantidade > 1 ? `<span class="quantidade-info">Quantidade: ${equipamento.quantidade}</span>` : ''}
                        </div>
                    </div>
                    <div class="equipamento-controles">
                        ${this.gerarBotoesControle(equipamento)}
                    </div>
                </div>
                <div class="equipamento-status">
                    <span class="status-badge ${equipamento.equipado ? 'equipado' : equipamento.status === 'deposito' ? 'no-deposito' : equipamento.status === 'no-corpo' ? 'no-corpo' : 'na-mochila'}">
                        ${equipamento.equipado ? '⚔️ EQUIPADO' : equipamento.status === 'deposito' ? '🏠 DEPÓSITO' : equipamento.status === 'no-corpo' ? '👤 NO CORPO' : '🎒 NA MOCHILA'}
                    </span>
                    <div class="equipamento-peso">Peso: ${(equipamento.peso * (equipamento.quantidade || 1)).toFixed(1)}kg</div>
                    ${equipamento.maos > 0 ? `<div class="equipamento-maos">Mãos: ${this.obterTextoMaos(equipamento.maos)}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    gerarBotoesControle(equipamento) {
        let botoes = '';
        
        if (equipamento.status === 'deposito') {
            botoes += `
                <button class="btn-equipamento-acao" onclick="sistemaEquipamentos.retirarDoDeposito('${equipamento.idUnico}')">
                    <i class="fas fa-download"></i> Retirar
                </button>
            `;
        } else if (equipamento.equipado) {
            botoes += `
                <button class="btn-equipamento-acao" onclick="sistemaEquipamentos.desequiparItem('${equipamento.idUnico}')">
                    <i class="fas fa-box"></i> Guardar
                </button>
                <button class="btn-equipamento-acao" onclick="sistemaEquipamentos.moverParaDeposito('${equipamento.idUnico}')">
                    <i class="fas fa-home"></i> Depósito
                </button>
            `;
        } else {
            if (equipamento.status === 'na-mochila') {
                if (!equipamento.quantidade || equipamento.quantidade === 1) {
                    botoes += `
                        <button class="btn-equipamento-acao equipar" onclick="sistemaEquipamentos.equiparItem('${equipamento.idUnico}')">
                            <i class="fas fa-tshirt"></i> Equipar
                        </button>
                    `;
                }
                
                botoes += `
                    <button class="btn-equipamento-acao no-corpo" onclick="sistemaEquipamentos.colocarNoCorpo('${equipamento.idUnico}')">
                        <i class="fas fa-user"></i> No Corpo
                    </button>
                `;
            }
            else if (equipamento.status === 'no-corpo') {
                botoes += `
                    <button class="btn-equipamento-acao" onclick="sistemaEquipamentos.removerDoCorpo('${equipamento.idUnico}')">
                        <i class="fas fa-backpack"></i> Para Mochila
                    </button>
                `;
            }
            
            if (equipamento.quantidade && equipamento.quantidade > 1) {
                botoes += `
                    <button class="btn-equipamento-acao consumir" onclick="sistemaEquipamentos.consumirItem('${equipamento.idUnico}', 1)">
                        <i class="fas fa-utensils"></i> Usar 1
                    </button>
                `;
            }
            
            botoes += `
                <button class="btn-equipamento-acao" onclick="sistemaEquipamentos.moverParaDeposito('${equipamento.idUnico}')">
                    <i class="fas fa-home"></i> Depósito
                </button>
            `;
        }
        
        botoes += `
            <button class="btn-equipamento-acao remover" onclick="sistemaEquipamentos.venderEquipamento('${equipamento.idUnico}')">
                <i class="fas fa-coins"></i> Vender
            </button>
        `;
        
        return botoes;
    }

    obterTextoMaos(maos) {
        switch(maos) {
            case 1: return '1 mão';
            case 1.5: return '1 ou 2 mãos';
            case 2: return '2 mãos';
            case 0: return 'Não usa mãos';
            default: return `${maos} mãos`;
        }
    }

    atualizarInterfaceDeposito() {
        this.atualizarListaDeposito();
        this.atualizarResumoDeposito();
    }

    atualizarListaDeposito() {
        const listaDeposito = document.getElementById('lista-deposito');
        if (!listaDeposito) return;

        if (this.deposito.length === 0) {
            listaDeposito.innerHTML = `
                <div class="deposito-vazio">
                    <i class="fas fa-home fa-3x"></i>
                    <h4>Depósito Vazio</h4>
                    <p>Itens guardados no depósito não contam peso e não podem ser usados.</p>
                </div>
            `;
            return;
        }

        listaDeposito.innerHTML = this.deposito.map(equipamento => `
            <div class="item-deposito">
                <div class="info-item-deposito">
                    <div class="nome-item-deposito">${equipamento.nome}${equipamento.quantidade > 1 ? ` (${equipamento.quantidade}x)` : ''} ${equipamento.personalizado ? '✨' : ''}</div>
                    <div class="detalhes-item-deposito">
                        <span>Peso: ${(equipamento.peso * (equipamento.quantidade || 1)).toFixed(1)}kg</span>
                        <span>Custo: $${equipamento.custoTotal || equipamento.custo}</span>
                        ${equipamento.maos > 0 ? `<span>Mãos: ${this.obterTextoMaos(equipamento.maos)}</span>` : ''}
                    </div>
                </div>
                <div class="controles-item-deposito">
                    <button class="btn-deposito retirar" onclick="sistemaEquipamentos.retirarDoDeposito('${equipamento.idUnico}')">
                        <i class="fas fa-download"></i> Retirar
                    </button>
                    <button class="btn-deposito" onclick="sistemaEquipamentos.venderEquipamento('${equipamento.idUnico}')">
                        <i class="fas fa-coins"></i> Vender
                    </button>
                </div>
            </div>
        `).join('');
    }

    atualizarResumoDeposito() {
        const contadorDeposito = document.getElementById('contador-deposito');
        const pesoLiberado = document.getElementById('peso-liberado');
        const valorDeposito = document.getElementById('valor-deposito');
        
        if (contadorDeposito) {
            contadorDeposito.textContent = `${this.deposito.length} itens guardados`;
        }
        
        if (pesoLiberado) {
            const pesoTotalDeposito = this.deposito.reduce((sum, item) => 
                sum + (item.peso * (item.quantidade || 1)), 0
            );
            pesoLiberado.textContent = `${pesoTotalDeposito.toFixed(1)} kg liberados`;
        }
        
        if (valorDeposito) {
            const valorTotalDeposito = this.deposito.reduce((sum, item) => 
                sum + (item.custoTotal || item.custo), 0
            );
            valorDeposito.textContent = `$${valorTotalDeposito}`;
        }
    }

    atualizarSistemaCombate() {
        this.atualizarArmadurasCombate();
        this.atualizarArmasCombate();
        this.atualizarEscudoCombate();
    }

    atualizarArmadurasCombate() {
        this.armadurasCombate = {
            cabeca: null, torso: null, bracos: null, pernas: null,
            maos: null, pes: null, corpoInteiro: null
        };

        this.equipamentosEquipados.armaduras.forEach(armadura => {
            const localCombate = this.mapeamentoLocais[armadura.local];
            if (localCombate) {
                this.armadurasCombate[localCombate] = {
                    nome: armadura.nome,
                    rd: armadura.rd || 0,
                    local: armadura.local,
                    peso: armadura.peso
                };
            }
        });
    }

    atualizarArmasCombate() {
        this.armasCombate = { maos: [], corpo: [] };

        this.equipamentosEquipados.maos.forEach(arma => {
            this.armasCombate.maos.push({
                nome: arma.nome,
                dano: arma.dano,
                tipoDano: arma.tipoDano,
                alcance: arma.alcance,
                maos: arma.maos,
                st: arma.st
            });
        });

        this.equipamentosEquipados.corpo.forEach(item => {
            if (item.tipo === 'arma-cc' || item.tipo === 'arma-dist') {
                this.armasCombate.corpo.push({
                    nome: item.nome,
                    dano: item.dano,
                    tipoDano: item.tipoDano,
                    alcance: item.alcance,
                    maos: item.maos,
                    st: item.st,
                    status: 'no-corpo'
                });
            }
        });
    }

    atualizarEscudoCombate() {
        this.escudoCombate = null;

        if (this.equipamentosEquipados.escudos.length > 0) {
            const escudo = this.equipamentosEquipados.escudos[0];
            this.escudoCombate = {
                nome: escudo.nome,
                bd: escudo.bd,
                rdpv: escudo.rdpv,
                maos: escudo.maos,
                peso: escudo.peso
            };
        }
    }

    calcularGastoTotalEquipamentos() {
        return this.equipamentosAdquiridos.reduce((total, item) => {
            return total + (item.custoTotal || item.custo);
        }, 0);
    }

    removerDeTodosOsLocais(itemId) {
        this.equipamentosEquipados.maos = this.equipamentosEquipados.maos.filter(item => item.idUnico !== itemId);
        this.equipamentosEquipados.armaduras = this.equipamentosEquipados.armaduras.filter(item => item.idUnico !== itemId);
        this.equipamentosEquipados.escudos = this.equipamentosEquipados.escudos.filter(item => item.idUnico !== itemId);
        this.equipamentosEquipados.mochila = this.equipamentosEquipados.mochila.filter(item => item.idUnico !== itemId);
        this.equipamentosEquipados.corpo = this.equipamentosEquipados.corpo.filter(item => item.idUnico !== itemId);
    }

    consumirItem(itemId, quantidade = 1) {
        const equipamento = this.equipamentosAdquiridos.find(item => item.idUnico === itemId);
        if (!equipamento) return;

        if (!equipamento.quantidade || equipamento.quantidade <= 1) {
            this.mostrarFeedback('Este item não pode ser consumido!', 'erro');
            return;
        }

        equipamento.quantidade -= quantidade;

        if (equipamento.quantidade <= 0) {
            this.removerDeTodosOsLocais(itemId);
            this.equipamentosAdquiridos = this.equipamentosAdquiridos.filter(item => item.idUnico !== itemId);
            this.mostrarFeedback(`${equipamento.nome} consumido completamente`, 'sucesso');
        } else {
            this.mostrarFeedback(`${equipamento.nome} consumido (${equipamento.quantidade} restantes)`, 'sucesso');
        }

        this.atualizarInterface();
    }

    configurarFiltrosInventario() {
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
                
                btn.classList.add('active');
                const filtro = btn.getAttribute('data-filtro');
                this.filtrarListaEquipamentos(filtro);
            });
        });
    }

    filtrarListaEquipamentos(filtro) {
        const lista = document.getElementById('lista-equipamentos-adquiridos');
        if (!lista) return;

        let equipamentosFiltrados = [];

        switch(filtro) {
            case 'todos':
                equipamentosFiltrados = this.equipamentosAdquiridos;
                break;
            case 'equipados':
                equipamentosFiltrados = this.equipamentosAdquiridos.filter(item => item.equipado);
                break;
            case 'corpo':
                equipamentosFiltrados = this.equipamentosAdquiridos.filter(item => item.status === 'no-corpo');
                break;
            case 'mochila':
                equipamentosFiltrados = this.equipamentosAdquiridos.filter(item => 
                    item.status === 'na-mochila' && !item.equipado
                );
                break;
            default:
                equipamentosFiltrados = this.equipamentosAdquiridos;
        }

        this.atualizarListaEquipamentosAdquiridos(equipamentosFiltrados);
    }

    alternarSubTab(subtab) {
        document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
        
        const btn = document.querySelector(`[data-subtab="${subtab}"]`);
        const content = document.getElementById(`subtab-${subtab}`);
        
        if (btn) btn.classList.add('active');
        if (content) content.classList.add('active');
        
        if (subtab === 'financeiro') {
            setTimeout(() => {
                this.atualizarInterfaceFinanceiro();
            }, 100);
        }
    }

    configurarCriacaoItens() {
        const itemTipoSelect = document.getElementById('item-tipo');
        if (itemTipoSelect) {
            itemTipoSelect.addEventListener('change', () => {
                this.atualizarCamposPorTipo();
            });
        }
        
        const itemMagicoCheckbox = document.getElementById('item-magico');
        if (itemMagicoCheckbox) {
            itemMagicoCheckbox.addEventListener('change', () => {
                this.atualizarCamposMagicos();
            });
        }
        
        const inputs = ['item-nome', 'item-peso', 'item-custo', 'item-descricao'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    this.atualizarPreviewItem();
                });
            }
        });
    }

    atualizarCamposPorTipo() {
        const camposEspecificos = document.getElementById('campos-especificos');
        if (!camposEspecificos) return;
        
        const tipo = document.getElementById('item-tipo').value;
        
        let camposHTML = '';
        
        switch(tipo) {
            case 'arma-cc':
                camposHTML = `
                    <div class="form-section">
                        <h4><i class="fas fa-gavel"></i> Detalhes da Arma</h4>
                        <div class="form-group">
                            <label>Dano:</label>
                            <input type="text" id="item-dano" placeholder="Ex: 1d+2 corte">
                        </div>
                        <div class="form-group">
                            <label>Tipo de Dano:</label>
                            <select id="item-tipo-dano">
                                <option value="corte">Corte</option>
                                <option value="perf">Perfuração</option>
                                <option value="contusao">Contusão</option>
                                <option value="esmag">Esmagamento</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Mãos Necessárias:</label>
                            <select id="item-maos">
                                <option value="1">1 mão</option>
                                <option value="1.5">1 ou 2 mãos</option>
                                <option value="2">2 mãos</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>ST Mínimo:</label>
                            <input type="number" id="item-st" value="10" min="1">
                        </div>
                    </div>
                `;
                break;
                
            case 'arma-dist':
                camposHTML = `
                    <div class="form-section">
                        <h4><i class="fas fa-bullseye"></i> Detalhes da Arma</h4>
                        <div class="form-group">
                            <label>Dano:</label>
                            <input type="text" id="item-dano" placeholder="Ex: 1d+2 perf">
                        </div>
                        <div class="form-group">
                            <label>Alcance:</label>
                            <input type="text" id="item-alcance" placeholder="Ex: 100/200">
                        </div>
                        <div class="form-group">
                            <label>Mãos Necessárias:</label>
                            <select id="item-maos">
                                <option value="1">1 mão</option>
                                <option value="2">2 mãos</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>ST Mínimo:</label>
                            <input type="number" id="item-st" value="10" min="1">
                        </div>
                    </div>
                `;
                break;
                
            case 'armadura':
                camposHTML = `
                    <div class="form-section">
                        <h4><i class="fas fa-shield-alt"></i> Detalhes da Armadura</h4>
                        <div class="form-group">
                            <label>RD (Resistência a Dano):</label>
                            <input type="number" id="item-rd" value="2" min="0">
                        </div>
                        <div class="form-group">
                            <label>Local Protegido:</label>
                            <select id="item-local">
                                <option value="Cabeça">Cabeça</option>
                                <option value="Torso">Torso</option>
                                <option value="Braços">Braços</option>
                                <option value="Pernas">Pernas</option>
                                <option value="Mãos">Mãos</option>
                                <option value="Pés">Pés</option>
                                <option value="Corpo Inteiro">Corpo Inteiro</option>
                            </select>
                        </div>
                    </div>
                `;
                break;
                
            case 'escudo':
                camposHTML = `
                    <div class="form-section">
                        <h4><i class="fas fa-shield-virus"></i> Detalhes do Escudo</h4>
                        <div class="form-group">
                            <label>BD (Bônus de Defesa):</label>
                            <input type="number" id="item-bd" value="1" min="0">
                        </div>
                        <div class="form-group">
                            <label>RD/PV:</label>
                            <input type="number" id="item-rdpv" value="20" min="1">
                        </div>
                        <div class="form-group">
                            <label>Mãos Necessárias:</label>
                            <select id="item-maos">
                                <option value="1">1 mão</option>
                                <option value="2">2 mãos</option>
                            </select>
                        </div>
                    </div>
                `;
                break;
                
            default:
                camposHTML = '';
        }
        
        camposEspecificos.innerHTML = camposHTML;
        this.atualizarPreviewItem();
    }

    atualizarCamposMagicos() {
        const camposMagicos = document.getElementById('campos-magicos');
        const itemMagicoCheckbox = document.getElementById('item-magico');
        
        if (!camposMagicos || !itemMagicoCheckbox) return;
        
        if (itemMagicoCheckbox.checked) {
            camposMagicos.style.display = 'block';
        } else {
            camposMagicos.style.display = 'none';
        }
        
        this.atualizarPreviewItem();
    }

    atualizarPreviewItem() {
        const preview = document.getElementById('preview-conteudo');
        if (!preview) return;
        
        const nome = document.getElementById('item-nome')?.value || 'Novo Item';
        const tipo = document.getElementById('item-tipo')?.value || 'geral';
        const peso = document.getElementById('item-peso')?.value || '0';
        const custo = document.getElementById('item-custo')?.value || '0';
        const descricao = document.getElementById('item-descricao')?.value || 'Sem descrição';
        const era = document.getElementById('item-era')?.value || 'medieval';
        const magico = document.getElementById('item-magico')?.checked || false;
        
        const tipoText = {
            'geral': 'Equipamento Geral',
            'arma-cc': 'Arma Corpo-a-Corpo',
            'arma-dist': 'Arma à Distância',
            'armadura': 'Armadura',
            'escudo': 'Escudo'
        }[tipo] || 'Equipamento';
        
        const eraText = era === 'medieval' ? 'Medieval/Fantasia' : 'Moderna/Cyberpunk';
        
        let detalhesHTML = '';
        
        if (tipo === 'arma-cc' || tipo === 'arma-dist') {
            const dano = document.getElementById('item-dano')?.value || '1d';
            const tipoDano = document.getElementById('item-tipo-dano')?.value || 'contusao';
            const maos = document.getElementById('item-maos')?.value || '1';
            const st = document.getElementById('item-st')?.value || '10';
            const alcance = tipo === 'arma-dist' ? document.getElementById('item-alcance')?.value || '-' : '-';
            
            detalhesHTML = `
                <div><strong>Dano:</strong> ${dano} (${tipoDano})</div>
                <div><strong>Mãos:</strong> ${maos === '1' ? '1 mão' : maos === '2' ? '2 mãos' : '1 ou 2 mãos'}</div>
                ${tipo === 'arma-dist' ? `<div><strong>Alcance:</strong> ${alcance}</div>` : ''}
                <div><strong>ST Mínimo:</strong> ${st}</div>
            `;
        } else if (tipo === 'armadura') {
            const rd = document.getElementById('item-rd')?.value || '0';
            const local = document.getElementById('item-local')?.value || 'Torso';
            
            detalhesHTML = `
                <div><strong>RD:</strong> ${rd}</div>
                <div><strong>Local:</strong> ${local}</div>
            `;
        } else if (tipo === 'escudo') {
            const bd = document.getElementById('item-bd')?.value || '1';
            const rdpv = document.getElementById('item-rdpv')?.value || '20';
            const maos = document.getElementById('item-maos')?.value || '1';
            
            detalhesHTML = `
                <div><strong>BD:</strong> +${bd}</div>
                <div><strong>RD/PV:</strong> ${rdpv}</div>
                <div><strong>Mãos:</strong> ${maos === '1' ? '1 mão' : '2 mãos'}</div>
            `;
        }
        
        preview.innerHTML = `
            <div class="preview-item">
                <div class="preview-header">
                    <h4>${nome}</h4>
                    <span class="preview-tipo">${tipoText} ${magico ? '✨' : ''}</span>
                </div>
                <div class="preview-info">
                    <div><strong>Tipo:</strong> ${tipoText}</div>
                    <div><strong>Era:</strong> ${eraText}</div>
                    <div><strong>Peso:</strong> ${peso} kg</div>
                    <div><strong>Custo:</strong> $${custo}</div>
                    ${detalhesHTML}
                    <div class="preview-descricao">
                        <strong>Descrição:</strong>
                        <p>${descricao || 'Sem descrição'}</p>
                    </div>
                    ${magico ? `<div class="preview-magico"><strong>✨ Efeito Mágico:</strong><p>${document.getElementById('item-efeito-magico')?.value || 'Efeito não especificado'}</p></div>` : ''}
                </div>
            </div>
        `;
    }

    criarItemPersonalizado() {
        const nome = document.getElementById('item-nome')?.value;
        if (!nome || nome.trim() === '') {
            this.mostrarFeedback('Digite um nome para o item!', 'erro');
            return;
        }
        
        const tipo = document.getElementById('item-tipo')?.value || 'geral';
        const peso = parseFloat(document.getElementById('item-peso')?.value) || 0;
        const custo = parseInt(document.getElementById('item-custo')?.value) || 0;
        const descricao = document.getElementById('item-descricao')?.value || '';
        const era = document.getElementById('item-era')?.value || 'medieval';
        const magico = document.getElementById('item-magico')?.checked || false;
        const efeitoMagico = magico ? document.getElementById('item-efeito-magico')?.value : '';
        
        const novoItem = {
            id: `personalizado_${this.contadorItensPersonalizados++}`,
            nome: nome.trim(),
            tipo: tipo,
            peso: peso,
            custo: custo,
            descricao: descricao,
            era: era,
            personalizado: true,
            adquiridoEm: new Date().toISOString(),
            status: 'na-mochila',
            equipado: false,
            idUnico: this.gerarIdUnico(),
            quantidade: 1
        };
        
        if (tipo === 'arma-cc' || tipo === 'arma-dist') {
            novoItem.dano = document.getElementById('item-dano')?.value || '1d';
            novoItem.tipoDano = document.getElementById('item-tipo-dano')?.value || 'contusao';
            novoItem.maos = parseFloat(document.getElementById('item-maos')?.value) || 1;
            novoItem.st = parseInt(document.getElementById('item-st')?.value) || 10;
            if (tipo === 'arma-dist') {
                novoItem.alcance = document.getElementById('item-alcance')?.value || '-';
            }
        } else if (tipo === 'armadura') {
            novoItem.rd = parseInt(document.getElementById('item-rd')?.value) || 0;
            novoItem.local = document.getElementById('item-local')?.value || 'Torso';
        } else if (tipo === 'escudo') {
            novoItem.bd = parseInt(document.getElementById('item-bd')?.value) || 1;
            novoItem.rdpv = parseInt(document.getElementById('item-rdpv')?.value) || 20;
            novoItem.maos = parseFloat(document.getElementById('item-maos')?.value) || 1;
        }
        
        if (magico) {
            novoItem.magico = true;
            novoItem.efeitoMagico = efeitoMagico;
        }
        
        this.equipamentosAdquiridos.push(novoItem);
        this.equipamentosEquipados.mochila.push(novoItem);
        
        this.mostrarFeedback(`Item "${nome}" criado com sucesso!`, 'sucesso');
        this.limparFormCriacao();
        this.atualizarInterface();
    }

    limparFormCriacao() {
        document.getElementById('item-nome').value = '';
        document.getElementById('item-peso').value = '1.0';
        document.getElementById('item-custo').value = '0';
        document.getElementById('item-descricao').value = '';
        document.getElementById('item-era').value = 'medieval';
        document.getElementById('item-magico').checked = false;
        document.getElementById('item-efeito-magico').value = '';
        
        const camposEspecificos = document.getElementById('campos-especificos');
        if (camposEspecificos) camposEspecificos.innerHTML = '';
        
        const camposMagicos = document.getElementById('campos-magicos');
        if (camposMagicos) camposMagicos.style.display = 'none';
        
        this.atualizarPreviewItem();
    }

    atualizarInfoCarga() {
        const totalItensInventario = document.getElementById('totalItensInventario');
        const pesoInventario = document.getElementById('pesoInventario');
        
        if (totalItensInventario) {
            totalItensInventario.textContent = this.equipamentosAdquiridos.length;
        }
        
        if (pesoInventario) {
            pesoInventario.textContent = this.pesoAtual.toFixed(1);
        }
    }

    iniciarMonitoramentoST() {
        const inputST = document.getElementById('ST');
        if (inputST) {
            inputST.addEventListener('change', () => {
                this.atualizarST(parseInt(inputST.value) || 10);
            });
            
            inputST.addEventListener('input', () => {
                this.atualizarST(parseInt(inputST.value) || 10);
            });
            
            this.atualizarST(parseInt(inputST.value) || 10);
        }
        
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail && e.detail.ST !== undefined) {
                this.atualizarST(e.detail.ST);
            }
        });
    }

    atualizarST(novoST) {
        if (this.ST !== novoST) {
            this.ST = novoST;
            this.capacidadeCarga = this.calcularCapacidadeCarga();
            this.pesoMaximo = this.capacidadeCarga.pesada;
            this.atualizarNivelCarga();
            this.atualizarInterface();
        }
    }
}

// ========== INICIALIZAÇÃO GLOBAL ==========
let sistemaEquipamentos;

if (!window.sistemaEquipamentosInicializado) {
    window.sistemaEquipamentosInicializado = false;
    
    document.addEventListener('DOMContentLoaded', function() {
        const verificarAbaEquipamento = () => {
            const abaEquipamento = document.getElementById('equipamento');
            if (abaEquipamento && !window.sistemaEquipamentosInicializado) {
                window.sistemaEquipamentosInicializado = true;
                
                sistemaEquipamentos = new SistemaEquipamentos();
                window.sistemaEquipamentos = sistemaEquipamentos;
                sistemaEquipamentos.inicializarQuandoPronto();
            }
        };
        
        verificarAbaEquipamento();
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const tab = mutation.target;
                    if (tab.id === 'equipamento' && tab.classList.contains('active')) {
                        setTimeout(verificarAbaEquipamento, 100);
                    }
                }
            });
        });
        
        document.querySelectorAll('.tab-content').forEach(tab => {
            observer.observe(tab, { attributes: true });
        });
    });
}

// ========== FUNÇÕES GLOBAIS ==========
window.aumentarQuantidade = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.aumentarQuantidade) {
        window.sistemaEquipamentos.aumentarQuantidade();
    }
};

window.diminuirQuantidade = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.diminuirQuantidade) {
        window.sistemaEquipamentos.diminuirQuantidade();
    }
};

window.fecharSubmenuQuantidade = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.fecharSubmenuQuantidade) {
        window.sistemaEquipamentos.fecharSubmenuQuantidade();
    }
};

window.confirmarCompraQuantidade = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.confirmarCompraQuantidade) {
        window.sistemaEquipamentos.confirmarCompraQuantidade();
    }
};

window.receberDinheiroRapido = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.receberDinheiroRapido) {
        window.sistemaEquipamentos.receberDinheiroRapido();
    }
};

window.gastarDinheiroRapido = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.gastarDinheiroRapido) {
        window.sistemaEquipamentos.gastarDinheiroRapido();
    }
};

window.adicionarDinheiro = function(valor) { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.adicionarDinheiro) {
        window.sistemaEquipamentos.adicionarDinheiro(valor);
    }
};

window.removerDinheiro = function(valor) { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.removerDinheiro) {
        window.sistemaEquipamentos.removerDinheiro(valor);
    }
};

window.ajustarDinheiroManual = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.ajustarDinheiroManual) {
        window.sistemaEquipamentos.ajustarDinheiroManual();
    }
};

window.confirmarOperacao = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.confirmarOperacao) {
        window.sistemaEquipamentos.confirmarOperacao();
    }
};

window.fecharModalSimples = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.fecharModalSimples) {
        window.sistemaEquipamentos.fecharModalSimples();
    }
};

window.alternarSubTab = function(subtab) { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.alternarSubTab) {
        window.sistemaEquipamentos.alternarSubTab(subtab);
    }
};

window.comprarEquipamento = function(itemId, elemento) { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.comprarEquipamento) {
        window.sistemaEquipamentos.comprarEquipamento(itemId, elemento);
    }
};

window.venderEquipamento = function(itemId) { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.venderEquipamento) {
        window.sistemaEquipamentos.venderEquipamento(itemId);
    }
};

window.equiparItem = function(itemId) { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.equiparItem) {
        window.sistemaEquipamentos.equiparItem(itemId);
    }
};

window.desequiparItem = function(itemId) { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.desequiparItem) {
        window.sistemaEquipamentos.desequiparItem(itemId);
    }
};

window.colocarNoCorpo = function(itemId) { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.colocarNoCorpo) {
        window.sistemaEquipamentos.colocarNoCorpo(itemId);
    }
};

window.removerDoCorpo = function(itemId) { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.removerDoCorpo) {
        window.sistemaEquipamentos.removerDoCorpo(itemId);
    }
};

window.moverParaDeposito = function(itemId) { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.moverParaDeposito) {
        window.sistemaEquipamentos.moverParaDeposito(itemId);
    }
};

window.retirarDoDeposito = function(itemId) { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.retirarDoDeposito) {
        window.sistemaEquipamentos.retirarDoDeposito(itemId);
    }
};

window.moverTudoParaDeposito = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.moverTudoParaDeposito) {
        window.sistemaEquipamentos.moverTudoParaDeposito();
    }
};

window.retirarTudoDoDeposito = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.retirarTudoDoDeposito) {
        window.sistemaEquipamentos.retirarTudoDoDeposito();
    }
};

window.limparDeposito = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.limparDeposito) {
        window.sistemaEquipamentos.limparDeposito();
    }
};

window.consumirItem = function(itemId, quantidade) { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.consumirItem) {
        window.sistemaEquipamentos.consumirItem(itemId, quantidade);
    }
};

window.atualizarCamposPorTipo = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.atualizarCamposPorTipo) {
        window.sistemaEquipamentos.atualizarCamposPorTipo();
    }
};

window.atualizarCamposMagicos = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.atualizarCamposMagicos) {
        window.sistemaEquipamentos.atualizarCamposMagicos();
    }
};

window.criarItemPersonalizado = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.criarItemPersonalizado) {
        window.sistemaEquipamentos.criarItemPersonalizado();
    }
};

window.limparFormCriacao = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.limparFormCriacao) {
        window.sistemaEquipamentos.limparFormCriacao();
    }
};

window.atualizarPreviewItem = function() { 
    if (window.sistemaEquipamentos && window.sistemaEquipamentos.atualizarPreviewItem) {
        window.sistemaEquipamentos.atualizarPreviewItem();
    }
};

window.SistemaEquipamentos = SistemaEquipamentos;