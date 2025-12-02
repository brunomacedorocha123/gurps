// equipamentos.js - SISTEMA COMPLETO DE EQUIPAMENTOS + FINANCEIRO
class SistemaEquipamentos {
    constructor() {
        this.equipamentosAdquiridos = [];
        this.sistemaRiqueza = {
            nivelAtual: 'medio',
            dinheiroBase: 1000,
            multiplicadores: {
                'falido': 0, 'pobre': 0.2, 'batalhador': 0.5, 'medio': 1,
                'confortavel': 2, 'rico': 5, 'muito-rico': 20, 'podre-rico': 100
            }
        };
        this.dinheiro = this.calcularDinheiroPorRiqueza();
        this.pesoAtual = 0;
        this.ST = 10;
        this.capacidadeCarga = this.calcularCapacidadeCarga();
        this.pesoMaximo = this.capacidadeCarga.pesada;
        this.nivelCargaAtual = 'leve';
        this.penalidadesCarga = 'MOV +0 / DODGE +0';
        this.mochilaAtiva = true;
        this.equipamentosEquipados = {
            armas: [], armaduras: [], escudos: [], maos: [], mochila: [], corpo: []
        };
        this.armadurasCombate = {
            cabeca: null, torso: null, bracos: null, pernas: null,
            maos: null, pes: null, corpoInteiro: null
        };
        this.armasCombate = { maos: [], corpo: [] };
        this.escudoCombate = null;
        this.mapeamentoLocais = {
            'Cabeça': 'cabeca', 'Torso': 'torso', 'Braços': 'bracos',
            'Pernas': 'pernas', 'Mãos': 'maos', 'Pés': 'pes', 'Corpo Inteiro': 'corpoInteiro'
        };
        this.deposito = [];
        this.itemCompraQuantidade = null;
        this.quantidadeAtual = 1;
        
        // ========== NOVO: SISTEMA FINANCEIRO ==========
        this.historicoTransacoes = [];
        this.transacaoAtual = {
            tipo: 'receita',
            valor: 0,
            categoria: '',
            descricao: '',
            data: new Date().toISOString().split('T')[0],
            responsavel: 'Jogador',
            notas: ''
        };
        
        this.categorias = {
            receita: [
                'Missões', 'Recompensas', 'Comércio', 'Herança', 'Presente',
                'Tesouro', 'Trabalho', 'Aluguel', 'Investimento', 'Outros'
            ],
            despesa: [
                'Alimentação', 'Hospedagem', 'Transporte', 'Armas', 'Armaduras',
                'Poções', 'Pergaminhos', 'Serviços', 'Impostos', 'Multas', 'Outros'
            ],
            transferencia: [
                'Para Personagem', 'Para NPC', 'Empréstimo', 'Pagamento', 'Outros'
            ],
            doacao: [
                'Templo', 'Órfãos', 'Pobres', 'Caridade', 'Causa Nobre',
                'Mendigos', 'Artistas', 'Pesquisa', 'Outros'
            ]
        };
        
        this.filtrosAtivos = {
            tipo: 'todos',
            busca: ''
        };
        
        this.contadorItensPersonalizados = 10000;
        this.maosDisponiveis = 2;
        this.maosOcupadas = 0;
        this.catalogoPronto = false;
        this.inicializacaoEmAndamento = false;
        this.dadosCarregados = false;
    }

    // ========== INICIALIZAÇÃO ==========
    async inicializarQuandoPronto() {
        if (this.inicializacaoEmAndamento) return;
        this.inicializacaoEmAndamento = true;
        
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }
        
        this.carregarDadosSalvos();
        this.dadosCarregados = true;
        
        await this.aguardarCatalogo();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.inicializarSistema();
        this.iniciarMonitoramentoST();
        this.configurarObservadorRiqueza();
    }

    aguardarCatalogo() {
        return new Promise((resolve) => {
            let tentativas = 0;
            const verificarCatalogo = () => {
                tentativas++;
                if (window.catalogoEquipamentos && 
                    typeof window.catalogoEquipamentos.obterEquipamentoPorId === 'function') {
                    this.catalogoPronto = true;
                    resolve();
                } else if (tentativas < 50) {
                    setTimeout(verificarCatalogo, 100);
                } else {
                    this.catalogoPronto = true;
                    resolve();
                }
            };
            verificarCatalogo();
        });
    }

    inicializarSistema() {
        this.configurarEventosGlobais();
        this.configurarSubAbas();
        this.configurarFiltrosInventario();
        this.configurarEventosFinanceiro();
        this.criarDisplayMaos();
        this.atualizarSistemaCombate();
        this.atualizarInterface();
        
        setTimeout(() => {
            this.notificarDashboard();
            this.atualizarInterfaceForcada();
        }, 300);
    }

    // ========== SISTEMA DE RIQUEZA ==========
    calcularDinheiroPorRiqueza() {
        let nivelRiqueza = this.sistemaRiqueza.nivelAtual;
        
        if (window.sistemaRiqueza && typeof window.sistemaRiqueza.getPontosRiqueza === 'function') {
            const pontos = window.sistemaRiqueza.getPontosRiqueza();
            nivelRiqueza = this.mapearPontosParaNivel(pontos);
            this.sistemaRiqueza.nivelAtual = nivelRiqueza;
        }
        
        const multiplicador = this.sistemaRiqueza.multiplicadores[nivelRiqueza] || 1;
        const gastoAtual = this.calcularGastoTotalEquipamentos();
        const dinheiroBase = Math.floor(this.sistemaRiqueza.dinheiroBase * multiplicador);
        
        return Math.max(0, dinheiroBase - gastoAtual);
    }

    mapearPontosParaNivel(pontos) {
        const mapeamento = {
            '-25': 'falido', '-15': 'pobre', '-10': 'batalhador',
            '0': 'medio', '10': 'confortavel', '20': 'rico',
            '30': 'muito-rico', '50': 'podre-rico'
        };
        return mapeamento[pontos] || 'medio';
    }

    configurarObservadorRiqueza() {
        document.addEventListener('riquezaAlterada', (e) => {
            this.atualizarDinheiroPorRiqueza();
            this.atualizarInterface();
            this.notificarDashboard();
        });
        
        const selectRiqueza = document.getElementById('nivelRiqueza');
        if (selectRiqueza) {
            selectRiqueza.addEventListener('change', () => {
                setTimeout(() => {
                    this.atualizarDinheiroPorRiqueza();
                    this.atualizarInterface();
                    this.notificarDashboard();
                }, 100);
            });
        }
    }

    atualizarDinheiroPorRiqueza() {
        const dinheiroAnterior = this.dinheiro;
        this.dinheiro = this.calcularDinheiroPorRiqueza();
        
        if (dinheiroAnterior !== this.dinheiro) {
            this.salvarDados();
        }
    }

    // ========== SISTEMA DE CARGA ==========
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
            this.salvarDados();
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
            10: { nenhuma: 10.0, leve: 20.0, media: 30.0, pesada: 60.0, muitoPesada: 100.0 },
            11: { nenhuma: 12.0, leve: 24.0, media: 36.0, pesada: 72.0, muitoPesada: 120.0 },
            12: { nenhuma: 14.5, leve: 29.0, media: 43.5, pesada: 87.0, muitoPesada: 145.0 },
            13: { nenhuma: 17.0, leve: 34.0, media: 51.0, pesada: 102.0, muitoPesada: 170.0 },
            14: { nenhuma: 19.5, leve: 39.0, media: 58.5, pesada: 117.0, muitoPesada: 195.0 },
            15: { nenhuma: 22.5, leve: 45.0, media: 67.5, pesada: 135.0, muitoPesada: 225.0 },
            16: { nenhuma: 25.5, leve: 51.0, media: 76.5, pesada: 153.0, muitoPesada: 255.0 },
            17: { nenhuma: 29.0, leve: 58.0, media: 87.0, pesada: 174.0, muitoPesada: 294.0 },
            18: { nenhuma: 32.5, leve: 65.0, media: 97.5, pesada: 195.0, muitoPesada: 325.0 },
            19: { nenhuma: 36.0, leve: 72.0, media: 108.0, pesada: 216.0, muitoPesada: 360.0 },
            20: { nenhuma: 40.0, leve: 80.0, media: 120.0, pesada: 240.0, muitoPesada: 400.0 }
        };

        let stKey = ST;
        if (ST > 20) stKey = 20;
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

    // ========== SISTEMA DE MOCHILA ==========
    alternarMochila() {
        this.mochilaAtiva = !this.mochilaAtiva;
        this.salvarDados();
        this.atualizarPeso();
        this.atualizarInterface();
        
        const mensagem = this.mochilaAtiva ? 
            'Mochila equipada' : 
            'Mochila liberada';
        
        this.mostrarFeedback(mensagem, this.mochilaAtiva ? 'sucesso' : 'aviso');
    }

    // ========== COMPRA E VENDA DE EQUIPAMENTOS ==========
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

        if (this.isQuantificavel(itemId)) {
            this.abrirSubmenuQuantidade(itemId, elemento);
            return;
        }

        if (this.dinheiro < equipamento.custo) {
            this.mostrarFeedback(`Dinheiro insuficiente! Necessário: $${equipamento.custo}`, 'erro');
            return;
        }

        this.dinheiro -= equipamento.custo;
        const novoEquipamento = {
            ...equipamento,
            adquiridoEm: new Date().toISOString(),
            status: 'na-mochila',
            equipado: false,
            idUnico: this.gerarIdUnico()
        };

        this.equipamentosAdquiridos.push(novoEquipamento);
        this.equipamentosEquipados.mochila.push(novoEquipamento);

        this.salvarDados();
        this.mostrarFeedback(`${equipamento.nome} comprado com sucesso!`, 'sucesso');
        this.atualizarInterface();
        this.notificarDashboard();
        
        // Registrar transação financeira
        this.registrarTransacao({
            tipo: 'despesa',
            valor: equipamento.custo,
            categoria: equipamento.tipo === 'arma' ? 'Armas' : 'Equipamentos',
            descricao: `Compra: ${equipamento.nome}`,
            responsavel: 'Jogador'
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
        const valorVenda = Math.floor(custoBase * 0.5);
        
        this.dinheiro += valorVenda;
        this.removerDeTodosOsLocais(itemId);
        this.equipamentosAdquiridos.splice(index, 1);
        this.deposito = this.deposito.filter(item => item.idUnico !== itemId);

        this.salvarDados();
        this.mostrarFeedback(`${equipamento.nome} vendido por $${valorVenda}`, 'sucesso');
        this.atualizarInterface();
        this.notificarDashboard();
        
        // Registrar transação financeira
        this.registrarTransacao({
            tipo: 'receita',
            valor: valorVenda,
            categoria: 'Venda',
            descricao: `Venda: ${equipamento.nome}`,
            responsavel: 'Jogador'
        });
    }

    // ========== SUBMENU DE QUANTIDADE ==========
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
        }

        this.atualizarTotaisQuantidade();

        const submenu = document.getElementById('submenu-quantidade');
        if (!submenu) return;

        submenu.style.top = '';
        submenu.style.left = '';
        submenu.classList.add('aberto');
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

        const itemExistente = this.equipamentosAdquiridos.find(item => 
            item.id === equipamento.id && item.status === 'na-mochila' && !item.equipado
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

        this.dinheiro -= custoTotal;
        this.salvarDados();
        this.mostrarFeedback(`${quantidade}x ${equipamento.nome} comprado(s) com sucesso!`, 'sucesso');
        
        this.fecharSubmenuQuantidade();
        this.atualizarInterface();
        this.notificarDashboard();
        
        // Registrar transação financeira
        this.registrarTransacao({
            tipo: 'despesa',
            valor: custoTotal,
            categoria: equipamento.tipo === 'consumivel' ? 'Consumíveis' : 'Equipamentos',
            descricao: `Compra: ${quantidade}x ${equipamento.nome}`,
            responsavel: 'Jogador'
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

    // ========== EQUIPAR/DESEQUIPAR ==========
    equiparItem(itemId) {
        const equipamento = this.equipamentosAdquiridos.find(item => item.idUnico === itemId);
        if (!equipamento) return;

        if (equipamento.equipado) {
            this.mostrarFeedback(`${equipamento.nome} já está equipado!`, 'aviso');
            return;
        }

        if (equipamento.quantidade && equipamento.quantidade > 1) {
            this.mostrarFeedback('Não é possível equipar itens em quantidade!', 'erro');
            return;
        }

        if (equipamento.tipo === 'arma-cc' || equipamento.tipo === 'arma-dist') {
            if (!this.podeEquiparArma(equipamento)) {
                this.mostrarFeedback('Não há mãos suficientes!', 'erro');
                return;
            }
            this.equiparArma(itemId);
        } else if (equipamento.tipo === 'armadura') {
            this.equiparArmadura(itemId);
        } else if (equipamento.tipo === 'escudo') {
            if (!this.podeEquiparEscudo(equipamento)) {
                this.mostrarFeedback('Não é possível equipar este escudo!', 'erro');
                return;
            }
            this.equiparEscudo(itemId);
        } else {
            this.equiparItemGeral(itemId);
        }

        this.salvarDados();
        this.atualizarInterface();
        this.atualizarSistemaCombate();
    }

    podeEquiparArma(arma) {
        const maosOcupadas = this.calcularMaosOcupadas();
        const maosNecessarias = arma.maos || 1;
        
        if (maosOcupadas + maosNecessarias > this.maosDisponiveis) {
            return false;
        }
        
        if (maosNecessarias === 2 && maosOcupadas > 0) {
            return false;
        }
        
        return true;
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

        const armaduraAtual = this.equipamentosEquipados.armaduras.find(a => a.local === equipamento.local);
        if (armaduraAtual) {
            this.mostrarFeedback(`Já existe ${armaduraAtual.nome} equipado no ${equipamento.local}`, 'aviso');
            return;
        }

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
        if (!equipamento) return;

        this.removerDeTodosOsLocais(itemId);
        equipamento.status = 'na-mochila';
        equipamento.equipado = false;
        this.equipamentosEquipados.mochila.push(equipamento);

        this.salvarDados();
        this.mostrarFeedback(`${equipamento.nome} guardado`, 'sucesso');
        this.atualizarInterface();
        this.atualizarDisplayMaos();
        this.atualizarSistemaCombate();
    }

    colocarNoCorpo(itemId) {
        const equipamento = this.equipamentosAdquiridos.find(item => item.idUnico === itemId);
        if (!equipamento) return;

        if (equipamento.equipado) {
            this.mostrarFeedback(`Não é possível colocar no corpo um item equipado!`, 'erro');
            return;
        }

        if (equipamento.status === 'deposito') {
            this.mostrarFeedback(`Não é possível colocar no corpo um item no depósito!`, 'erro');
            return;
        }

        this.removerDeTodosOsLocais(itemId);
        equipamento.status = 'no-corpo';
        equipamento.equipado = false;
        this.equipamentosEquipados.corpo.push(equipamento);

        this.salvarDados();
        this.mostrarFeedback(`${equipamento.nome} colocado no corpo`, 'sucesso');
        this.atualizarInterface();
        this.atualizarSistemaCombate();
    }

    removerDoCorpo(itemId) {
        const equipamento = this.equipamentosAdquiridos.find(item => item.idUnico === itemId);
        if (!equipamento) return;

        if (equipamento.status !== 'no-corpo') {
            this.mostrarFeedback(`${equipamento.nome} não está no corpo!`, 'erro');
            return;
        }

        this.removerDeTodosOsLocais(itemId);
        equipamento.status = 'na-mochila';
        equipamento.equipado = false;
        this.equipamentosEquipados.mochila.push(equipamento);

        this.salvarDados();
        this.mostrarFeedback(`${equipamento.nome} removido do corpo`, 'sucesso');
        this.atualizarInterface();
        this.atualizarSistemaCombate();
    }

    // ========== SISTEMA DE DEPÓSITO ==========
    moverParaDeposito(itemId) {
        const equipamento = this.equipamentosAdquiridos.find(item => item.idUnico === itemId);
        if (!equipamento) return false;

        if (equipamento.status === 'deposito') {
            this.mostrarFeedback(`${equipamento.nome} já está no depósito!`, 'aviso');
            return false;
        }

        this.removerDeTodosOsLocais(itemId);
        equipamento.status = 'deposito';
        equipamento.equipado = false;
        this.deposito.push(equipamento);

        this.salvarDados();
        this.mostrarFeedback(`${equipamento.nome} guardado no depósito`, 'sucesso');
        this.atualizarInterface();
        return true;
    }

    retirarDoDeposito(itemId) {
        const index = this.deposito.findIndex(item => item.idUnico === itemId);
        if (index === -1) return false;

        const equipamento = this.deposito[index];
        this.deposito.splice(index, 1);
        equipamento.status = 'na-mochila';
        equipamento.equipado = false;
        this.equipamentosEquipados.mochila.push(equipamento);

        this.salvarDados();
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

        this.salvarDados();
        this.mostrarFeedback(`${equipamentosNaMochila.length} itens guardados`, 'sucesso');
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
        this.salvarDados();
        this.mostrarFeedback(`${totalItens} itens retirados`, 'sucesso');
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
        this.salvarDados();
        this.mostrarFeedback(`${totalLimpos} itens removidos`, 'sucesso');
        this.atualizarInterface();
    }

    // ========== SISTEMA FINANCEIRO COMPLETO ==========
    configurarEventosFinanceiro() {
        // Eventos para tipos de transação
        document.querySelectorAll('.tipo-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const tipo = e.currentTarget.dataset.tipo;
                this.selecionarTipoTransacao(tipo);
            });
        });

        // Eventos para valores sugeridos
        document.querySelectorAll('.btn-valor-sugerido').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const valor = parseFloat(e.currentTarget.dataset.valor);
                this.usarValorSugerido(valor);
            });
        });

        // Evento para categoria personalizada
        const inputCategoriaPersonalizada = document.getElementById('categoria-personalizada-modal');
        if (inputCategoriaPersonalizada) {
            inputCategoriaPersonalizada.addEventListener('input', (e) => {
                this.transacaoAtual.categoria = e.target.value;
                document.querySelectorAll('.categoria-option').forEach(opt => 
                    opt.classList.remove('selecionado'));
            });
        }

        // Eventos para campos do modal
        ['valor-transacao-modal', 'descricao-transacao-modal', 
         'data-transacao-modal', 'responsavel-transacao-modal', 
         'notas-transacao-modal'].forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('input', (e) => {
                    this.atualizarCampoTransacao(id.replace('-modal', ''), e.target.value);
                });
            }
        });

        // Configurar data atual como padrão
        const dataInput = document.getElementById('data-transacao-modal');
        if (dataInput) {
            const hoje = new Date().toISOString().split('T')[0];
            dataInput.value = hoje;
            this.transacaoAtual.data = hoje;
        }
    }

    abrirModalTransacao(tipo) {
        this.transacaoAtual.tipo = tipo;
        
        const modal = document.getElementById('modal-transacao');
        if (!modal) return;
        
        // Atualizar saldo no modal
        this.atualizarSaldoModal();
        
        // Selecionar tipo automaticamente
        this.selecionarTipoTransacao(tipo);
        
        // Configurar data atual
        const hoje = new Date().toISOString().split('T')[0];
        const dataInput = document.getElementById('data-transacao-modal');
        if (dataInput) {
            dataInput.value = hoje;
            this.transacaoAtual.data = hoje;
        }
        
        // Limpar campos
        this.limparCamposTransacao();
        
        // Configurar categorias
        this.configurarCategoriasModal(tipo);
        
        // Mostrar modal
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('aberto');
            document.getElementById('valor-transacao-modal')?.focus();
        }, 10);
    }

    fecharModalTransacao() {
        const modal = document.getElementById('modal-transacao');
        if (modal) {
            modal.classList.remove('aberto');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
        this.transacaoAtual = {
            tipo: 'receita',
            valor: 0,
            categoria: '',
            descricao: '',
            data: new Date().toISOString().split('T')[0],
            responsavel: 'Jogador',
            notas: ''
        };
    }

    selecionarTipoTransacao(tipo) {
        document.querySelectorAll('.tipo-option').forEach(option => {
            option.classList.remove('selecionado');
            if (option.dataset.tipo === tipo) {
                option.classList.add('selecionado');
            }
        });
        
        this.transacaoAtual.tipo = tipo;
        this.configurarCategoriasModal(tipo);
    }

    atualizarSaldoModal() {
        const saldoModal = document.getElementById('saldo-transacao-modal');
        const nivelRiqueza = document.getElementById('nivel-riqueza-modal');
        const patrimonio = document.getElementById('patrimonio-modal');
        
        if (saldoModal) {
            saldoModal.textContent = `$${this.dinheiro}`;
            // Colorir baseado no saldo
            if (this.dinheiro < 0) {
                saldoModal.style.color = '#e74c3c';
            } else if (this.dinheiro < 100) {
                saldoModal.style.color = '#f39c12';
            } else {
                saldoModal.style.color = '#27ae60';
            }
        }
        
        if (nivelRiqueza) {
            nivelRiqueza.textContent = this.sistemaRiqueza.nivelAtual.toUpperCase();
        }
        
        if (patrimonio) {
            const patrimonioTotal = this.calcularPatrimonioTotal();
            patrimonio.textContent = `$${patrimonioTotal}`;
        }
    }

    configurarCategoriasModal(tipo) {
        const container = document.getElementById('categorias-modal');
        if (!container) return;
        
        const categorias = this.categorias[tipo] || [];
        
        container.innerHTML = categorias.map(categoria => `
            <div class="categoria-option" data-categoria="${categoria}">
                ${categoria}
            </div>
        `).join('');
        
        // Adicionar evento de clique nas categorias
        setTimeout(() => {
            document.querySelectorAll('.categoria-option').forEach(option => {
                option.addEventListener('click', () => {
                    document.querySelectorAll('.categoria-option').forEach(opt => 
                        opt.classList.remove('selecionado'));
                    option.classList.add('selecionado');
                    this.transacaoAtual.categoria = option.dataset.categoria;
                    document.getElementById('categoria-personalizada-modal').value = '';
                });
            });
        }, 10);
    }

    usarValorSugerido(valor) {
        const inputValor = document.getElementById('valor-transacao-modal');
        if (inputValor) {
            inputValor.value = valor;
            this.transacaoAtual.valor = valor;
        }
    }

    atualizarCampoTransacao(campo, valor) {
        this.transacaoAtual[campo] = valor;
    }

    limparCamposTransacao() {
        // Limpar valor
        const inputValor = document.getElementById('valor-transacao-modal');
        if (inputValor) inputValor.value = '';
        this.transacaoAtual.valor = 0;
        
        // Limpar descrição
        const inputDescricao = document.getElementById('descricao-transacao-modal');
        if (inputDescricao) inputDescricao.value = '';
        this.transacaoAtual.descricao = '';
        
        // Limpar categoria personalizada
        const inputCatPersonalizada = document.getElementById('categoria-personalizada-modal');
        if (inputCatPersonalizada) inputCatPersonalizada.value = '';
        
        // Limpar responsável
        const inputResponsavel = document.getElementById('responsavel-transacao-modal');
        if (inputResponsavel) inputResponsavel.value = 'Jogador';
        this.transacaoAtual.responsavel = 'Jogador';
        
        // Limpar notas
        const inputNotas = document.getElementById('notas-transacao-modal');
        if (inputNotas) inputNotas.value = '';
        this.transacaoAtual.notas = '';
        
        // Desmarcar categorias
        document.querySelectorAll('.categoria-option').forEach(opt => 
            opt.classList.remove('selecionado'));
        this.transacaoAtual.categoria = '';
    }

    confirmarTransacao() {
        // Validar campos
        const inputValor = document.getElementById('valor-transacao-modal');
        const inputDescricao = document.getElementById('descricao-transacao-modal');
        
        if (!inputValor || !inputDescricao) return;
        
        const valor = parseFloat(inputValor.value);
        const descricao = inputDescricao.value.trim();
        const categoria = this.transacaoAtual.categoria || 
                         document.getElementById('categoria-personalizada-modal')?.value || 
                         'Outros';
        
        // Validações
        if (!valor || valor <= 0) {
            this.mostrarFeedback('Por favor, insira um valor válido!', 'erro');
            return;
        }
        
        if (!descricao) {
            this.mostrarFeedback('Por favor, insira uma descrição!', 'erro');
            return;
        }
        
        if (!categoria) {
            this.mostrarFeedback('Por favor, selecione ou digite uma categoria!', 'erro');
            return;
        }
        
        // Verificar saldo para despesas, transferências e doações
        if (['despesa', 'transferencia', 'doacao'].includes(this.transacaoAtual.tipo)) {
            if (valor > this.dinheiro) {
                this.mostrarFeedback('Saldo insuficiente!', 'erro');
                return;
            }
        }
        
        // Processar transação
        this.processarTransacao(valor, descricao, categoria);
    }

    processarTransacao(valor, descricao, categoria) {
        const tipo = this.transacaoAtual.tipo;
        
        // Atualizar dinheiro baseado no tipo
        switch(tipo) {
            case 'receita':
                this.dinheiro += valor;
                break;
            case 'despesa':
                this.dinheiro -= valor;
                break;
            case 'transferencia':
                this.dinheiro -= valor;
                // Aqui poderia adicionar lógica para transferir para outro personagem
                break;
            case 'doacao':
                this.dinheiro -= valor;
                break;
        }
        
        // Criar objeto de transação
        const transacao = {
            id: this.gerarIdTransacao(),
            tipo: tipo,
            valor: valor,
            categoria: categoria,
            descricao: descricao,
            data: this.transacaoAtual.data || new Date().toISOString().split('T')[0],
            responsavel: this.transacaoAtual.responsavel || 'Jogador',
            notas: this.transacaoAtual.notas || '',
            timestamp: new Date().toISOString()
        };
        
        // Adicionar ao histórico
        this.historicoTransacoes.unshift(transacao);
        
        // Limitar histórico aos últimos 1000 registros
        if (this.historicoTransacoes.length > 1000) {
            this.historicoTransacoes = this.historicoTransacoes.slice(0, 1000);
        }
        
        // Salvar e atualizar
        this.salvarDados();
        this.fecharModalTransacao();
        this.atualizarInterface();
        this.atualizarResumoFinanceiro();
        this.atualizarHistorico();
        
        // Feedback
        const tiposMensagem = {
            'receita': `Recebido $${valor}`,
            'despesa': `Gasto $${valor}`,
            'transferencia': `Transferido $${valor}`,
            'doacao': `Doação de $${valor} realizada`
        };
        
        this.mostrarFeedback(tiposMensagem[tipo], 'sucesso');
        this.notificarDashboard();
    }

    registrarTransacao(dados) {
        const transacao = {
            id: this.gerarIdTransacao(),
            tipo: dados.tipo,
            valor: dados.valor,
            categoria: dados.categoria,
            descricao: dados.descricao,
            data: new Date().toISOString().split('T')[0],
            responsavel: dados.responsavel || 'Jogador',
            notas: dados.notas || '',
            timestamp: new Date().toISOString()
        };
        
        this.historicoTransacoes.unshift(transacao);
        
        if (this.historicoTransacoes.length > 1000) {
            this.historicoTransacoes = this.historicoTransacoes.slice(0, 1000);
        }
        
        this.salvarDados();
        this.atualizarResumoFinanceiro();
        this.atualizarHistorico();
    }

    gerarIdTransacao() {
        return 'trans_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ========== HISTÓRICO E FILTROS ==========
    filtrarHistorico() {
        const filtroTipo = document.getElementById('filtro-tipo-transacao')?.value || 'todos';
        const busca = document.getElementById('busca-transacao')?.value.toLowerCase() || '';
        
        this.filtrosAtivos.tipo = filtroTipo;
        this.filtrosAtivos.busca = busca;
        
        this.atualizarHistorico();
    }

    limparFiltros() {
        const filtroTipo = document.getElementById('filtro-tipo-transacao');
        const busca = document.getElementById('busca-transacao');
        
        if (filtroTipo) filtroTipo.value = 'todos';
        if (busca) busca.value = '';
        
        this.filtrosAtivos.tipo = 'todos';
        this.filtrosAtivos.busca = '';
        
        this.atualizarHistorico();
    }

    atualizarHistorico() {
        const tabela = document.getElementById('tabela-historico');
        const tbody = tabela?.querySelector('tbody');
        const totalTransacoes = document.getElementById('total-transacoes');
        const saldoInicial = document.getElementById('saldo-inicial');
        
        if (!tbody) return;
        
        // Filtrar transações
        let transacoesFiltradas = this.historicoTransacoes;
        
        if (this.filtrosAtivos.tipo !== 'todos') {
            transacoesFiltradas = transacoesFiltradas.filter(t => t.tipo === this.filtrosAtivos.tipo);
        }
        
        if (this.filtrosAtivos.busca) {
            const busca = this.filtrosAtivos.busca.toLowerCase();
            transacoesFiltradas = transacoesFiltradas.filter(t => 
                t.descricao.toLowerCase().includes(busca) ||
                t.categoria.toLowerCase().includes(busca) ||
                t.responsavel.toLowerCase().includes(busca)
            );
        }
        
        // Atualizar contadores
        if (totalTransacoes) {
            totalTransacoes.textContent = transacoesFiltradas.length;
        }
        
        if (saldoInicial) {
            saldoInicial.textContent = `$${this.calcularSaldoInicial()}`;
        }
        
        // Atualizar tabela
        if (transacoesFiltradas.length === 0) {
            tbody.innerHTML = `
                <tr class="historico-vazio">
                    <td colspan="7">
                        <i class="fas fa-receipt"></i>
                        <p>Nenhuma transação encontrada</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = transacoesFiltradas.map(transacao => {
            const dataFormatada = this.formatarData(transacao.data);
            const valorFormatado = `$${transacao.valor.toFixed(2)}`;
            const tipoFormatado = this.formatarTipo(transacao.tipo);
            const classeValor = transacao.tipo === 'receita' ? 'positivo' : 'negativo';
            
            return `
                <tr>
                    <td>${dataFormatada}</td>
                    <td>${transacao.descricao}</td>
                    <td>${transacao.categoria}</td>
                    <td><span class="badge-tipo badge-${transacao.tipo}">${tipoFormatado}</span></td>
                    <td class="${classeValor}">${valorFormatado}</td>
                    <td>${transacao.responsavel}</td>
                    <td>
                        <button class="btn-acao" onclick="sistemaEquipamentos.verDetalhesTransacao('${transacao.id}')" title="Detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-acao" onclick="sistemaEquipamentos.editarTransacao('${transacao.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-acao btn-remover" onclick="sistemaEquipamentos.removerTransacao('${transacao.id}')" title="Remover">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    formatarData(dataString) {
        if (!dataString) return '-';
        const data = new Date(dataString);
        if (isNaN(data.getTime())) return dataString;
        return data.toLocaleDateString('pt-BR');
    }

    formatarTipo(tipo) {
        const tipos = {
            'receita': 'Receita',
            'despesa': 'Despesa',
            'transferencia': 'Transferência',
            'doacao': 'Doação'
        };
        return tipos[tipo] || tipo;
    }

    calcularSaldoInicial() {
        // Implementar lógica para calcular saldo inicial baseado no nível de riqueza
        const nivel = this.sistemaRiqueza.nivelAtual;
        const multiplicador = this.sistemaRiqueza.multiplicadores[nivel] || 1;
        return Math.floor(this.sistemaRiqueza.dinheiroBase * multiplicador);
    }

    verDetalhesTransacao(id) {
        const transacao = this.historicoTransacoes.find(t => t.id === id);
        if (!transacao) return;
        
        alert(`Detalhes da Transação:\n\n` +
              `Tipo: ${this.formatarTipo(transacao.tipo)}\n` +
              `Valor: $${transacao.valor.toFixed(2)}\n` +
              `Categoria: ${transacao.categoria}\n` +
              `Descrição: ${transacao.descricao}\n` +
              `Data: ${this.formatarData(transacao.data)}\n` +
              `Responsável: ${transacao.responsavel}\n` +
              `Notas: ${transacao.notas || 'Nenhuma'}\n` +
              `Registrada em: ${new Date(transacao.timestamp).toLocaleString('pt-BR')}`);
    }

    editarTransacao(id) {
        const transacao = this.historicoTransacoes.find(t => t.id === id);
        if (!transacao) return;
        
        // Para simplificar, vamos abrir o modal com os dados da transação
        this.transacaoAtual = { ...transacao };
        this.abrirModalTransacao(transacao.tipo);
        
        // Preencher campos
        setTimeout(() => {
            const valorInput = document.getElementById('valor-transacao-modal');
            const descricaoInput = document.getElementById('descricao-transacao-modal');
            const dataInput = document.getElementById('data-transacao-modal');
            const responsavelInput = document.getElementById('responsavel-transacao-modal');
            const notasInput = document.getElementById('notas-transacao-modal');
            
            if (valorInput) valorInput.value = transacao.valor;
            if (descricaoInput) descricaoInput.value = transacao.descricao;
            if (dataInput) dataInput.value = transacao.data;
            if (responsavelInput) responsavelInput.value = transacao.responsavel;
            if (notasInput) notasInput.value = transacao.notas || '';
            
            // Marcar categoria
            setTimeout(() => {
                document.querySelectorAll('.categoria-option').forEach(option => {
                    if (option.dataset.categoria === transacao.categoria) {
                        option.classList.add('selecionado');
                    }
                });
            }, 100);
        }, 100);
        

        // ========== ADICIONAR APENAS ESTAS 3 FUNÇÕES NO FINAL DO ARQUIVO ==========

// Estas funções permitem que os botões do HTML funcionem
window.abrirModalTransacao = function(tipo) {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.abrirModalTransacao(tipo);
    } else {
        console.error('Sistema não inicializado');
    }
};

window.confirmarTransacao = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.confirmarTransacao();
    }
};

window.fecharModalTransacao = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.fecharModalTransacao();
    }
};
        // Marcar transação para edição
        this.transacaoEditando = id;
    }

    removerTransacao(id) {
        if (!confirm('Tem certeza que deseja remover esta transação?')) return;
        
        const index = this.historicoTransacoes.findIndex(t => t.id === id);
        if (index === -1) return;
        
        const transacao = this.historicoTransacoes[index];
        
        // Ajustar saldo se necessário
        if (transacao.tipo === 'receita') {
            this.dinheiro -= transacao.valor;
        } else {
            this.dinheiro += transacao.valor;
        }
        
        this.historicoTransacoes.splice(index, 1);
        this.salvarDados();
        this.atualizarInterface();
        this.atualizarHistorico();
        this.mostrarFeedback('Transação removida', 'sucesso');
    }

    exportarHistorico(formato) {
        const dados = this.historicoTransacoes;
        
        if (dados.length === 0) {
            this.mostrarFeedback('Nenhuma transação para exportar', 'aviso');
            return;
        }
        
        if (formato === 'csv') {
            this.exportarParaCSV(dados);
        } else if (formato === 'pdf') {
            this.mostrarFeedback('Exportação PDF em desenvolvimento', 'aviso');
            // this.exportarParaPDF(dados);
        }
    }

    exportarParaCSV(dados) {
        const cabecalhos = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Responsável', 'Notas'];
        const linhas = dados.map(transacao => [
            transacao.data,
            this.formatarTipo(transacao.tipo),
            transacao.categoria,
            transacao.descricao,
            transacao.valor.toFixed(2),
            transacao.responsavel,
            transacao.notas || ''
        ]);
        
        const csvContent = [
            cabecalhos.join(','),
            ...linhas.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `historico-financeiro_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.mostrarFeedback('Histórico exportado como CSV', 'sucesso');
    }

    // ========== ESTATÍSTICAS FINANCEIRAS ==========
    calcularEstatisticas() {
        const hoje = new Date();
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(hoje.getDate() - 30);
        
        const transacoesPeriodo = this.historicoTransacoes.filter(transacao => {
            const dataTransacao = new Date(transacao.data);
            return dataTransacao >= trintaDiasAtras;
        });
        
        const receitas = transacoesPeriodo
            .filter(t => t.tipo === 'receita')
            .reduce((sum, t) => sum + t.valor, 0);
        
        const despesas = transacoesPeriodo
            .filter(t => t.tipo === 'despesa')
            .reduce((sum, t) => sum + t.valor, 0);
        
        // Maiores gastos
        const maioresGastos = transacoesPeriodo
            .filter(t => t.tipo === 'despesa')
            .sort((a, b) => b.valor - a.valor)
            .slice(0, 5);
        
        // Gastos por categoria
        const gastosPorCategoria = {};
        transacoesPeriodo
            .filter(t => t.tipo === 'despesa')
            .forEach(t => {
                gastosPorCategoria[t.categoria] = (gastosPorCategoria[t.categoria] || 0) + t.valor;
            });
        
        // Últimas transações
        const ultimasTransacoes = this.historicoTransacoes.slice(0, 5);
        
        return {
            receitasMes: receitas,
            despesasMes: despesas,
            saldoDisponivel: this.dinheiro,
            maioresGastos: maioresGastos,
            gastosPorCategoria: gastosPorCategoria,
            ultimasTransacoes: ultimasTransacoes,
            patrimonioTotal: this.calcularPatrimonioTotal()
        };
    }

    calcularPatrimonioTotal() {
        const valorEquipamentos = this.equipamentosAdquiridos.reduce((sum, item) => 
            sum + (item.custoTotal || item.custo), 0);
        return this.dinheiro + valorEquipamentos;
    }

    atualizarResumoFinanceiro() {
        const estatisticas = this.calcularEstatisticas();
        
        // Atualizar cards de resumo
        const saldoDisponivel = document.getElementById('saldo-disponivel');
        const receitasMes = document.getElementById('receitas-mes');
        const despesasMes = document.getElementById('despesas-mes');
        const patrimonioTotal = document.getElementById('patrimonio-total');
        const saldoStatus = document.getElementById('saldo-status');
        
        if (saldoDisponivel) {
            saldoDisponivel.textContent = `$${estatisticas.saldoDisponivel}`;
            if (estatisticas.saldoDisponivel < 0) {
                saldoDisponivel.style.color = '#e74c3c';
            } else if (estatisticas.saldoDisponivel < 100) {
                saldoDisponivel.style.color = '#f39c12';
            } else {
                saldoDisponivel.style.color = '#27ae60';
            }
        }
        
        if (receitasMes) {
            receitasMes.textContent = `$${estatisticas.receitasMes}`;
        }
        
        if (despesasMes) {
            despesasMes.textContent = `$${estatisticas.despesasMes}`;
        }
        
        if (patrimonioTotal) {
            patrimonioTotal.textContent = `$${estatisticas.patrimonioTotal}`;
        }
        
        if (saldoStatus) {
            if (estatisticas.saldoDisponivel < 0) {
                saldoStatus.textContent = 'Saldo negativo';
                saldoStatus.style.color = '#e74c3c';
            } else if (estatisticas.saldoDisponivel < 100) {
                saldoStatus.textContent = 'Saldo baixo';
                saldoStatus.style.color = '#f39c12';
            } else {
                saldoStatus.textContent = 'Saldo saudável';
                saldoStatus.style.color = '#27ae60';
            }
        }
        
        // Atualizar maiores gastos
        const maioresGastosContainer = document.getElementById('maiores-gastos');
        if (maioresGastosContainer) {
            if (estatisticas.maioresGastos.length === 0) {
                maioresGastosContainer.innerHTML = `
                    <div class="estatistica-vazia">
                        <i class="fas fa-receipt"></i>
                        <p>Nenhuma despesa registrada</p>
                    </div>
                `;
            } else {
                maioresGastosContainer.innerHTML = estatisticas.maioresGastos.map(gasto => `
                    <div class="gasto-item">
                        <div class="gasto-descricao">${gasto.descricao}</div>
                        <div class="gasto-valor">$${gasto.valor.toFixed(2)}</div>
                    </div>
                `).join('');
            }
        }
        
        // Atualizar gastos por categoria
        const gastosCategoriasContainer = document.getElementById('gastos-categorias');
        if (gastosCategoriasContainer) {
            const categorias = Object.entries(estatisticas.gastosPorCategoria);
            
            if (categorias.length === 0) {
                gastosCategoriasContainer.innerHTML = `
                    <div class="estatistica-vazia">
                        <i class="fas fa-tag"></i>
                        <p>Nenhuma categoria registrada</p>
                    </div>
                `;
            } else {
                gastosCategoriasContainer.innerHTML = categorias.map(([categoria, valor]) => `
                    <div class="categoria-item">
                        <div class="categoria-nome">${categoria}</div>
                        <div class="categoria-valor">$${valor.toFixed(2)}</div>
                    </div>
                `).join('');
            }
        }
        
        // Atualizar últimas transações
        const ultimasTransacoesContainer = document.getElementById('ultimas-transacoes');
        if (ultimasTransacoesContainer) {
            if (estatisticas.ultimasTransacoes.length === 0) {
                ultimasTransacoesContainer.innerHTML = `
                    <div class="estatistica-vazia">
                        <i class="fas fa-exchange-alt"></i>
                        <p>Nenhuma transação registrada</p>
                    </div>
                `;
            } else {
                ultimasTransacoesContainer.innerHTML = estatisticas.ultimasTransacoes.map(transacao => `
                    <div class="transacao-rapida">
                        <div class="transacao-icon ${transacao.tipo}">
                            ${transacao.tipo === 'receita' ? '📥' : 
                              transacao.tipo === 'despesa' ? '📤' :
                              transacao.tipo === 'transferencia' ? '🔄' : '❤️'}
                        </div>
                        <div class="transacao-info">
                            <div class="transacao-descricao">${transacao.descricao}</div>
                            <div class="transacao-detalhes">
                                <span class="transacao-categoria">${transacao.categoria}</span>
                                <span class="transacao-valor ${transacao.tipo}">
                                    ${transacao.tipo === 'receita' ? '+' : '-'}$${transacao.valor.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    // ========== CONFIGURAÇÃO DE EVENTOS GLOBAIS ==========
    configurarEventosGlobais() {
        document.addEventListener('click', (e) => {
            const btnComprar = e.target.closest('.btn-comprar');
            if (btnComprar) {
                const itemId = btnComprar.getAttribute('data-item');
                if (itemId) {
                    e.stopPropagation();
                    this.comprarEquipamento(itemId, btnComprar);
                }
            }

            // Eventos para botões financeiros
            const btnReceber = e.target.closest('[onclick*="abrirModalTransacao(\'receita\')"]');
            if (btnReceber) {
                e.preventDefault();
                this.abrirModalTransacao('receita');
            }

            const btnGastar = e.target.closest('[onclick*="abrirModalTransacao(\'despesa\')"]');
            if (btnGastar) {
                e.preventDefault();
                this.abrirModalTransacao('despesa');
            }

            const btnTransferir = e.target.closest('[onclick*="abrirModalTransacao(\'transferencia\')"]');
            if (btnTransferir) {
                e.preventDefault();
                this.abrirModalTransacao('transferencia');
            }

            const btnDoar = e.target.closest('[onclick*="abrirModalTransacao(\'doacao\')"]');
            if (btnDoar) {
                e.preventDefault();
                this.abrirModalTransacao('doacao');
            }

            // Botões de exportação
            const btnExportarCSV = e.target.closest('[onclick*="exportarHistorico(\'csv\')"]');
            if (btnExportarCSV) {
                e.preventDefault();
                this.exportarHistorico('csv');
            }

            const btnExportarPDF = e.target.closest('[onclick*="exportarHistorico(\'pdf\')"]');
            if (btnExportarPDF) {
                e.preventDefault();
                this.exportarHistorico('pdf');
            }

            // Botão de mochila
            const btnLiberar = document.getElementById('btn-liberar-mochila');
            if (e.target === btnLiberar || (btnLiberar && btnLiberar.contains(e.target))) {
                this.alternarMochila();
            }

            // Botões de depósito
            const btnGuardarTudo = document.getElementById('btn-guardar-tudo-deposito');
            if (e.target === btnGuardarTudo || (btnGuardarTudo && btnGuardarTudo.contains(e.target))) {
                this.moverTudoParaDeposito();
            }

            const btnRetirarTudo = document.getElementById('btn-retirar-tudo-deposito');
            if (e.target === btnRetirarTudo || (btnRetirarTudo && btnRetirarTudo.contains(e.target))) {
                this.retirarTudoDoDeposito();
            }

            const btnLimparDeposito = document.getElementById('btn-limpar-deposito');
            if (e.target === btnLimparDeposito || (btnLimparDeposito && btnLimparDeposito.contains(e.target))) {
                if (confirm('Tem certeza que deseja limpar todo o depósito?')) {
                    this.limparDeposito();
                }
            }
        });

        // Evento de fechar modal ao clicar fora
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('modal-transacao');
            if (modal && e.target === modal) {
                this.fecharModalTransacao();
            }
        });

        // Evento de teclado
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('modal-transacao');
            if (modal && modal.classList.contains('aberto') && e.key === 'Escape') {
                this.fecharModalTransacao();
            }
            
            if (modal && modal.classList.contains('aberto') && e.key === 'Enter' && e.ctrlKey) {
                this.confirmarTransacao();
            }
        });
    }

    // ========== FUNÇÕES DE APOIO ==========
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
                
                // Se for a aba financeira, atualizar estatísticas
                if (subtabId === 'financeiro') {
                    setTimeout(() => {
                        this.atualizarResumoFinanceiro();
                        this.atualizarHistorico();
                    }, 100);
                }
            });
        });
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
            html += `<span class="mao mao-ocupada" title="Mão ocupada">👊</span>`;
        }
        
        for (let i = 0; i < maosLivres; i++) {
            html += `<span class="mao mao-livre" title="Mão livre">👐</span>`;
        }
        
        displayMaos.innerHTML = html;
    }

    atualizarInterfaceForcada() {
        this.atualizarStatus();
        this.atualizarListaEquipamentosAdquiridos();
        this.atualizarResumoFinanceiro();
        this.atualizarInfoCarga();
        this.atualizarDisplayMaos();
        this.atualizarInterfaceDeposito();
        this.atualizarEstatisticas();
        this.atualizarSistemaCombate();
        this.atualizarHistorico();
    }

    atualizarInterface() {
        this.atualizarStatus();
        this.atualizarListaEquipamentosAdquiridos();
        this.atualizarResumoFinanceiro();
        this.atualizarInfoCarga();
        this.atualizarDisplayMaos();
        this.atualizarInterfaceDeposito();
    }

    atualizarStatus() {
        this.atualizarPeso();

        const dinheiroElem = document.getElementById('dinheiroEquipamento');
        if (dinheiroElem) dinheiroElem.textContent = `$${this.dinheiro}`;

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

        const btnMochila = document.getElementById('btn-liberar-mochila');
        if (btnMochila) {
            if (this.mochilaAtiva) {
                btnMochila.innerHTML = '<i class="fas fa-suitcase-rolling"></i> Liberar Mochila';
            } else {
                btnMochila.innerHTML = '<i class="fas fa-suitcase"></i> Usar Mochila';
            }
        }
    }

    // [CONTINUA NO PRÓXIMO COMENTÁRIO...]
        // ...continuação do equipamentos.js

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
                    <button class="btn-ir-catalogo" onclick="alternarSubTab('catalogo')">
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
                    <div class="nome-item-deposito">${equipamento.nome}${equipamento.quantidade > 1 ? ` (${equipamento.quantidade}x)` : ''}</div>
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

    atualizarInfoCarga() {
        // Implementação já feita em atualizarStatus()
    }

    atualizarEstatisticas() {
        const totalItens = document.getElementById('total-itens');
        if (totalItens) totalItens.textContent = this.equipamentosAdquiridos.length;
        
        const itensEquipados = document.getElementById('itens-equipados');
        if (itensEquipados) {
            itensEquipados.textContent = this.equipamentosAdquiridos.filter(item => item.equipado).length;
        }
        
        const itensMochila = document.getElementById('itens-mochila');
        if (itensMochila) {
            itensMochila.textContent = this.equipamentosAdquiridos.filter(item => 
                item.status === 'na-mochila' && !item.equipado
            ).length;
        }
        
        const itensDeposito = document.getElementById('itens-deposito');
        if (itensDeposito) itensDeposito.textContent = this.deposito.length;
        
        const itensCorpo = document.getElementById('itens-corpo');
        if (itensCorpo) {
            itensCorpo.textContent = this.equipamentosAdquiridos.filter(item => item.status === 'no-corpo').length;
        }
    }

    // ========== SISTEMA DE COMBATE ==========
    atualizarSistemaCombate() {
        this.atualizarArmadurasCombate();
        this.atualizarArmasCombate();
        this.atualizarEscudoCombate();
    }

    atualizarArmadurasCombate() {
        this.armadurasCombate = {
            cabeca: null, torso: null, bracos: null, 
            pernas: null, maos: null, pes: null, corpoInteiro: null
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

    // ========== FUNÇÕES AUXILIARES ==========
    obterTextoMaos(maos) {
        switch(maos) {
            case 1: return '1 mão';
            case 1.5: return '1 ou 2 mãos';
            case 2: return '2 mãos';
            case 0: return 'Não usa mãos';
            default: return `${maos} mãos`;
        }
    }

    gerarIdUnico() {
        return 'eq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    obterEquipamentoPorId(itemId) {
        if (!this.catalogoPronto || !window.catalogoEquipamentos) {
            return null;
        }
        return window.catalogoEquipamentos.obterEquipamentoPorId(itemId);
    }

    isQuantificavel(itemId) {
        if (!this.catalogoPronto || !window.catalogoEquipamentos) return false;
        return window.catalogoEquipamentos.isQuantificavel(itemId);
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

        this.salvarDados();
        this.atualizarInterface();
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

    // ========== FEEDBACK E NOTIFICAÇÕES ==========
    mostrarFeedback(mensagem, tipo) {
        const feedback = document.createElement('div');
        feedback.className = `feedback-message feedback-${tipo}`;
        feedback.textContent = mensagem;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        if (tipo === 'sucesso') feedback.style.background = '#27ae60';
        if (tipo === 'erro') feedback.style.background = '#e74c3c';
        if (tipo === 'aviso') feedback.style.background = '#f39c12';
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateX(100px)';
            setTimeout(() => {
                if (feedback.parentNode) feedback.parentNode.removeChild(feedback);
            }, 300);
        }, 3000);
    }

    // ========== SALVAR E CARREGAR DADOS ==========
    salvarDados() {
        try {
            const dados = {
                equipamentosAdquiridos: this.equipamentosAdquiridos,
                dinheiro: this.dinheiro,
                pesoAtual: this.pesoAtual,
                mochilaAtiva: this.mochilaAtiva,
                equipamentosEquipados: this.equipamentosEquipados,
                armadurasCombate: this.armadurasCombate,
                armasCombate: this.armasCombate,
                escudoCombate: this.escudoCombate,
                deposito: this.deposito,
                capacidadeCarga: this.capacidadeCarga,
                historicoTransacoes: this.historicoTransacoes,
                contadorItensPersonalizados: this.contadorItensPersonalizados,
                ST: this.ST,
                nivelCargaAtual: this.nivelCargaAtual,
                penalidadesCarga: this.penalidadesCarga,
                sistemaRiqueza: this.sistemaRiqueza,
                timestamp: new Date().getTime(),
                version: '3.0'
            };
            
            localStorage.setItem('sistemaEquipamentos_data', JSON.stringify(dados));
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
        }
    }

    carregarDadosSalvos() {
        try {
            const dadosSalvos = localStorage.getItem('sistemaEquipamentos_data');
            
            if (!dadosSalvos) {
                return;
            }

            const dados = JSON.parse(dadosSalvos);
            
            this.equipamentosAdquiridos = Array.isArray(dados.equipamentosAdquiridos) ? 
                dados.equipamentosAdquiridos : [];
            
            this.dinheiro = typeof dados.dinheiro === 'number' ? dados.dinheiro : this.calcularDinheiroPorRiqueza();
            this.pesoAtual = typeof dados.pesoAtual === 'number' ? dados.pesoAtual : 0;
            this.mochilaAtiva = typeof dados.mochilaAtiva === 'boolean' ? dados.mochilaAtiva : true;
            
            if (dados.equipamentosEquipados && typeof dados.equipamentosEquipados === 'object') {
                this.equipamentosEquipados = {
                    armas: Array.isArray(dados.equipamentosEquipados.armas) ? dados.equipamentosEquipados.armas : [],
                    armaduras: Array.isArray(dados.equipamentosEquipados.armaduras) ? dados.equipamentosEquipados.armaduras : [],
                    escudos: Array.isArray(dados.equipamentosEquipados.escudos) ? dados.equipamentosEquipados.escudos : [],
                    maos: Array.isArray(dados.equipamentosEquipados.maos) ? dados.equipamentosEquipados.maos : [],
                    mochila: Array.isArray(dados.equipamentosEquipados.mochila) ? dados.equipamentosEquipados.mochila : [],
                    corpo: Array.isArray(dados.equipamentosEquipados.corpo) ? dados.equipamentosEquipados.corpo : []
                };
            }
            
            if (dados.armadurasCombate) this.armadurasCombate = dados.armadurasCombate;
            if (dados.armasCombate) this.armasCombate = dados.armasCombate;
            if (dados.escudoCombate) this.escudoCombate = dados.escudoCombate;
            
            this.deposito = Array.isArray(dados.deposito) ? dados.deposito : [];
            
            this.historicoTransacoes = Array.isArray(dados.historicoTransacoes) ? 
                dados.historicoTransacoes : [];
            
            this.contadorItensPersonalizados = typeof dados.contadorItensPersonalizados === 'number' ? 
                dados.contadorItensPersonalizados : 10000;
            
            this.ST = typeof dados.ST === 'number' ? dados.ST : 10;
            this.nivelCargaAtual = dados.nivelCargaAtual || 'leve';
            this.penalidadesCarga = dados.penalidadesCarga || 'MOV +0 / DODGE +0';
            
            this.capacidadeCarga = dados.capacidadeCarga && typeof dados.capacidadeCarga === 'object' ? 
                dados.capacidadeCarga : this.calcularCapacidadeCarga();
            
            this.pesoMaximo = this.capacidadeCarga.pesada;
            
            if (dados.sistemaRiqueza) {
                this.sistemaRiqueza = { ...this.sistemaRiqueza, ...dados.sistemaRiqueza };
            }
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            localStorage.removeItem('sistemaEquipamentos_data');
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
}

// ========== INICIALIZAÇÃO GLOBAL ==========
let sistemaEquipamentos;

document.addEventListener('DOMContentLoaded', function() {
    const verificarAbaEquipamento = () => {
        const abaEquipamento = document.getElementById('equipamento');
        if (abaEquipamento && abaEquipamento.classList.contains('active')) {
            if (!sistemaEquipamentos) {
                sistemaEquipamentos = new SistemaEquipamentos();
                window.sistemaEquipamentos = sistemaEquipamentos;
                sistemaEquipamentos.inicializarQuandoPronto();
            } else {
                sistemaEquipamentos.atualizarInterfaceForcada();
            }
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

// ========== FUNÇÕES GLOBAIS PARA HTML ==========
window.aumentarQuantidade = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.aumentarQuantidade();
    }
};

window.diminuirQuantidade = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.diminuirQuantidade();
    }
};

window.fecharSubmenuQuantidade = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.fecharSubmenuQuantidade();
    }
};

window.confirmarCompraQuantidade = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.confirmarCompraQuantidade();
    }
};

window.fecharModalTransacao = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.fecharModalTransacao();
    }
};

window.confirmarTransacao = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.confirmarTransacao();
    }
};

window.filtrarHistorico = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.filtrarHistorico();
    }
};

window.limparFiltros = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.limparFiltros();
    }
};

window.exportarHistorico = function(formato) {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.exportarHistorico(formato);
    }
};

window.alternarSubTab = function(subtab) {
    document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
    
    const btn = document.querySelector(`[data-subtab="${subtab}"]`);
    const content = document.getElementById(`subtab-${subtab}`);
    
    if (btn) btn.classList.add('active');
    if (content) content.classList.add('active');
    
    // Se for a aba financeira, atualizar estatísticas
    if (subtab === 'financeiro' && window.sistemaEquipamentos) {
        setTimeout(() => {
            window.sistemaEquipamentos.atualizarResumoFinanceiro();
            window.sistemaEquipamentos.atualizarHistorico();
        }, 100);
    }
};

// Exportar para uso global
window.SistemaEquipamentos = SistemaEquipamentos;