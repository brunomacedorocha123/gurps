// equipamentos.js - SISTEMA SIMPLIFICADO DE EQUIPAMENTOS
class SistemaEquipamentos {
    constructor() {
        // Sistema de equipamentos
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
        
        // Sistema financeiro SIMPLIFICADO
        this.historicoTransacoes = [];
        this.ultimasTransacoes = [];
        
        // Sistema de criação de itens
        this.contadorItensPersonalizados = 10000;
        
        // Sistema de combate
        this.maosDisponiveis = 2;
        this.maosOcupadas = 0;
        
        // Estado do sistema
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
        this.configurarCriacaoItens();
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
        
        // Registrar transação simples
        this.registrarTransacaoSimples({
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
        const valorVenda = Math.floor(custoBase * 0.5);
        
        this.dinheiro += valorVenda;
        this.removerDeTodosOsLocais(itemId);
        this.equipamentosAdquiridos.splice(index, 1);
        this.deposito = this.deposito.filter(item => item.idUnico !== itemId);

        this.salvarDados();
        this.mostrarFeedback(`${equipamento.nome} vendido por $${valorVenda}`, 'sucesso');
        this.atualizarInterface();
        this.notificarDashboard();
        
        // Registrar transação simples
        this.registrarTransacaoSimples({
            tipo: 'receita',
            valor: valorVenda,
            descricao: `Venda: ${equipamento.nome}`
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
        
        // Registrar transação simples
        this.registrarTransacaoSimples({
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

    // ========== SISTEMA FINANCEIRO SIMPLIFICADO ==========
    registrarTransacaoSimples(dados) {
        const transacao = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            tipo: dados.tipo,
            valor: dados.valor,
            descricao: dados.descricao,
            data: new Date().toLocaleDateString('pt-BR'),
            timestamp: new Date().toISOString()
        };
        
        this.ultimasTransacoes.unshift(transacao);
        
        // Manter apenas as últimas 10 transações
        if (this.ultimasTransacoes.length > 10) {
            this.ultimasTransacoes = this.ultimasTransacoes.slice(0, 10);
        }
        
        // Atualizar histórico na interface
        this.atualizarHistoricoTransacoes();
    }

    adicionarDinheiro(valor) {
        if (isNaN(valor) || valor <= 0) {
            this.mostrarFeedback('Valor inválido!', 'erro');
            return;
        }
        
        this.dinheiro += valor;
        this.salvarDados();
        
        this.registrarTransacaoSimples({
            tipo: 'receita',
            valor: valor,
            descricao: 'Dinheiro adicionado'
        });
        
        this.mostrarFeedback(`Adicionado $${valor}`, 'sucesso');
        this.atualizarInterface();
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
        this.salvarDados();
        
        this.registrarTransacaoSimples({
            tipo: 'despesa',
            valor: valor,
            descricao: 'Dinheiro removido'
        });
        
        this.mostrarFeedback(`Removido $${valor}`, 'sucesso');
        this.atualizarInterface();
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
        this.salvarDados();
        
        if (diferenca > 0) {
            this.registrarTransacaoSimples({
                tipo: 'receita',
                valor: diferenca,
                descricao: 'Ajuste manual'
            });
        } else if (diferenca < 0) {
            this.registrarTransacaoSimples({
                tipo: 'despesa',
                valor: Math.abs(diferenca),
                descricao: 'Ajuste manual'
            });
        }
        
        this.mostrarFeedback(`Dinheiro ajustado para $${valorNumerico}`, 'sucesso');
        this.atualizarInterface();
        this.notificarDashboard();
    }

    abrirModalDinheiro(tipo) {
        const modal = document.getElementById('modal-dinheiro');
        if (!modal) return;
        
        // Atualizar saldo
        const saldoModal = document.getElementById('saldo-modal');
        if (saldoModal) {
            saldoModal.textContent = `$${this.dinheiro}`;
        }
        
        // Configurar título
        const titulo = document.getElementById('modal-dinheiro-titulo');
        if (titulo) {
            titulo.textContent = tipo === 'receber' ? 'Receber Dinheiro' : 'Gastar Dinheiro';
        }
        
        // Limpar campos
        const valorInput = document.getElementById('valor-dinheiro');
        const descricaoInput = document.getElementById('descricao-dinheiro');
        
        if (valorInput) valorInput.value = '';
        if (descricaoInput) descricaoInput.value = '';
        
        // Armazenar tipo da operação
        this.operacaoAtual = tipo;
        
        // Mostrar modal
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('aberto');
            if (valorInput) valorInput.focus();
        }, 10);
    }

    fecharModalDinheiro() {
        const modal = document.getElementById('modal-dinheiro');
        if (modal) {
            modal.classList.remove('aberto');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
        this.operacaoAtual = null;
    }

    confirmarTransacao() {
        const valorInput = document.getElementById('valor-dinheiro');
        const descricaoInput = document.getElementById('descricao-dinheiro');
        
        if (!valorInput || !descricaoInput) return;
        
        const valor = parseFloat(valorInput.value);
        const descricao = descricaoInput.value.trim();
        
        // Validações
        if (!valor || valor <= 0) {
            this.mostrarFeedback('Por favor, insira um valor válido!', 'erro');
            return;
        }
        
        if (!descricao) {
            this.mostrarFeedback('Por favor, insira uma descrição!', 'erro');
            return;
        }
        
        // Verificar saldo para gastos
        if (this.operacaoAtual === 'gastar') {
            if (valor > this.dinheiro) {
                this.mostrarFeedback('Dinheiro insuficiente!', 'erro');
                return;
            }
            this.dinheiro -= valor;
        } else {
            this.dinheiro += valor;
        }
        
        // Registrar transação
        this.registrarTransacaoSimples({
            tipo: this.operacaoAtual === 'gastar' ? 'despesa' : 'receita',
            valor: valor,
            descricao: descricao
        });
        
        this.salvarDados();
        this.fecharModalDinheiro();
        this.atualizarInterface();
        this.notificarDashboard();
        
        const mensagem = this.operacaoAtual === 'gastar' 
            ? `Gasto $${valor}: ${descricao}` 
            : `Recebido $${valor}: ${descricao}`;
        
        this.mostrarFeedback(mensagem, 'sucesso');
    }

    atualizarHistoricoTransacoes() {
        const historicoLista = document.getElementById('lista-transacoes');
        const historicoVazio = document.getElementById('historico-vazio');
        
        if (!historicoLista) return;
        
        if (this.ultimasTransacoes.length === 0) {
            if (historicoVazio) {
                historicoVazio.style.display = 'block';
            }
            historicoLista.innerHTML = '';
            return;
        }
        
        if (historicoVazio) {
            historicoVazio.style.display = 'none';
        }
        
        historicoLista.innerHTML = this.ultimasTransacoes.map(transacao => `
            <div class="transacao-item ${transacao.tipo}">
                <div class="transacao-info">
                    <div class="transacao-descricao">${transacao.descricao}</div>
                    <div class="transacao-data">${transacao.data}</div>
                </div>
                <div class="transacao-valor">
                    ${transacao.tipo === 'receita' ? '+' : '-'}$${transacao.valor}
                </div>
            </div>
        `).join('');
    }

    limparHistorico() {
        if (this.ultimasTransacoes.length === 0) {
            this.mostrarFeedback('Nenhuma transação para limpar!', 'aviso');
            return;
        }
        
        if (confirm('Tem certeza que deseja limpar o histórico de transações?')) {
            this.ultimasTransacoes = [];
            this.atualizarHistoricoTransacoes();
            this.mostrarFeedback('Histórico limpo', 'sucesso');
        }
    }

        // ========== SISTEMA DE CRIAR ITEM PERSONALIZADO ==========
    configurarCriacaoItens() {
        // Eventos para atualização em tempo real
        const formInputs = document.querySelectorAll('#subtab-criar input, #subtab-criar select, #subtab-criar textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', () => this.atualizarPreview());
            input.addEventListener('change', () => this.atualizarPreview());
        });
        
        // Evento específico para checkbox mágico
        const checkboxMagico = document.getElementById('item-magico');
        if (checkboxMagico) {
            checkboxMagico.addEventListener('change', () => this.atualizarCamposMagicos());
        }
        
        // Evento para tipo de item
        const selectTipo = document.getElementById('item-tipo');
        if (selectTipo) {
            selectTipo.addEventListener('change', () => this.atualizarCamposPorTipo());
        }
        
        // Inicializar campos
        this.atualizarCamposPorTipo();
        this.atualizarPreview();
    }

    atualizarCamposPorTipo() {
        const tipo = document.getElementById('item-tipo').value;
        const camposDiv = document.getElementById('campos-especificos');
        
        let camposHTML = '';
        
        switch(tipo) {
            case 'arma-cc':
                camposHTML = `
                    <div class="form-section">
                        <h4><i class="fas fa-sword"></i> Propriedades da Arma</h4>
                        <div class="form-group-duo">
                            <div class="form-group">
                                <label>Dano:</label>
                                <input type="text" id="item-dano" placeholder="Ex: 1d6+1" maxlength="20">
                            </div>
                            <div class="form-group">
                                <label>Tipo de Dano:</label>
                                <select id="item-tipo-dano">
                                    <option value="corte">Corte</option>
                                    <option value="perfuração">Perfuração</option>
                                    <option value="impacto">Impacto</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group-duo">
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
                                <input type="number" id="item-st" value="10" min="1" max="30">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Alcance:</label>
                            <input type="text" id="item-alcance" placeholder="Ex: Corpo-a-corpo" maxlength="30">
                        </div>
                    </div>
                `;
                break;
                
            case 'arma-dist':
                camposHTML = `
                    <div class="form-section">
                        <h4><i class="fas fa-bow-arrow"></i> Propriedades da Arma</h4>
                        <div class="form-group-duo">
                            <div class="form-group">
                                <label>Dano:</label>
                                <input type="text" id="item-dano" placeholder="Ex: 1d8" maxlength="20">
                            </div>
                            <div class="form-group">
                                <label>Tipo de Dano:</label>
                                <select id="item-tipo-dano">
                                    <option value="perfuração">Perfuração</option>
                                    <option value="impacto">Impacto</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group-duo">
                            <div class="form-group">
                                <label>Mãos Necessárias:</label>
                                <select id="item-maos">
                                    <option value="1">1 mão</option>
                                    <option value="2">2 mãos</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>ST Mínimo:</label>
                                <input type="number" id="item-st" value="10" min="1" max="30">
                            </div>
                        </div>
                        <div class="form-group-duo">
                            <div class="form-group">
                                <label>Alcance Mínimo:</label>
                                <input type="text" id="item-alcance-min" placeholder="Ex: 10m" maxlength="20">
                            </div>
                            <div class="form-group">
                                <label>Alcance Máximo:</label>
                                <input type="text" id="item-alcance-max" placeholder="Ex: 100m" maxlength="20">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Munição Necessária:</label>
                            <input type="text" id="item-municao" placeholder="Ex: Flecha" maxlength="30">
                        </div>
                    </div>
                `;
                break;
                
            case 'armadura':
                camposHTML = `
                    <div class="form-section">
                        <h4><i class="fas fa-shield-alt"></i> Propriedades da Armadura</h4>
                        <div class="form-group">
                            <label>Local da Armadura:</label>
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
                        <div class="form-group-duo">
                            <div class="form-group">
                                <label>RD (Resistência a Dano):</label>
                                <input type="number" id="item-rd" value="1" min="0" max="20">
                            </div>
                            <div class="form-group">
                                <label>BD (Bloqueio de Dano):</label>
                                <input type="number" id="item-bd" value="0" min="0" max="10">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Penalidade de Movimento:</label>
                            <select id="item-penalidade">
                                <option value="0">Nenhuma</option>
                                <option value="-1">-1 MOV</option>
                                <option value="-2">-2 MOV</option>
                                <option value="-3">-3 MOV</option>
                            </select>
                        </div>
                    </div>
                `;
                break;
                
            case 'escudo':
                camposHTML = `
                    <div class="form-section">
                        <h4><i class="fas fa-shield"></i> Propriedades do Escudo</h4>
                        <div class="form-group-duo">
                            <div class="form-group">
                                <label>BD (Bloqueio de Dano):</label>
                                <input type="number" id="item-bd" value="2" min="1" max="10">
                            </div>
                            <div class="form-group">
                                <label>Mãos Necessárias:</label>
                                <select id="item-maos">
                                    <option value="1">1 mão</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>RD/PV:</label>
                            <input type="number" id="item-rdpv" value="5" min="1" max="50">
                        </div>
                    </div>
                `;
                break;
                
            case 'consumivel':
                camposHTML = `
                    <div class="form-section">
                        <h4><i class="fas fa-wine-bottle"></i> Propriedades do Consumível</h4>
                        <div class="form-group">
                            <label>Efeito:</label>
                            <textarea id="item-efeito" rows="3" placeholder="Descreva o efeito do consumível..."></textarea>
                        </div>
                        <div class="form-group-duo">
                            <div class="form-group">
                                <label>Duração:</label>
                                <input type="text" id="item-duracao" placeholder="Ex: 1 hora" maxlength="30">
                            </div>
                            <div class="form-group">
                                <label>Tipo:</label>
                                <select id="item-tipo-consumivel">
                                    <option value="poção">Poção</option>
                                    <option value="veneno">Veneno</option>
                                    <option value="comida">Comida</option>
                                    <option value="bebida">Bebida</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'artefato':
                camposHTML = `
                    <div class="form-section">
                        <h4><i class="fas fa-gem"></i> Propriedades do Artefato</h4>
                        <div class="form-group">
                            <label>Poder Especial:</label>
                            <textarea id="item-poder" rows="3" placeholder="Descreva o poder especial..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Carga (se aplicável):</label>
                            <input type="number" id="item-carga" value="0" min="0" max="100">
                        </div>
                        <div class="form-group">
                            <label>Ativação:</label>
                            <select id="item-ativacao">
                                <option value="comando">Comando Verbal</option>
                                <option value="toque">Toque</option>
                                <option value="uso">Uso</option>
                                <option value="passiva">Passiva</option>
                            </select>
                        </div>
                    </div>
                `;
                break;
                
            case 'missao':
                camposHTML = `
                    <div class="form-section">
                        <h4><i class="fas fa-scroll"></i> Propriedades do Item de Missão</h4>
                        <div class="form-group">
                            <label>Missão Relacionada:</label>
                            <input type="text" id="item-missao" placeholder="Nome da missão" maxlength="50">
                        </div>
                        <div class="form-group">
                            <label>Importância:</label>
                            <select id="item-importancia">
                                <option value="chave">Chave</option>
                                <option value="importante">Importante</option>
                                <option value="secundario">Secundário</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Pista ou Informação:</label>
                            <textarea id="item-pista" rows="3" placeholder="Descreva a pista ou informação..."></textarea>
                        </div>
                    </div>
                `;
                break;
                
            default: // Equipamento Geral
                camposHTML = `
                    <div class="form-section">
                        <h4><i class="fas fa-toolbox"></i> Propriedades Específicas</h4>
                        <div class="form-group">
                            <label>Função/Utilidade:</label>
                            <textarea id="item-funcao" rows="3" placeholder="Descreva a função do equipamento..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Mãos Necessárias (se aplicável):</label>
                            <select id="item-maos">
                                <option value="0">Não usa mãos</option>
                                <option value="1">1 mão</option>
                                <option value="2">2 mãos</option>
                            </select>
                        </div>
                    </div>
                `;
        }
        
        camposDiv.innerHTML = camposHTML;
        
        // Reconfigurar eventos para novos campos
        setTimeout(() => {
            const novosInputs = camposDiv.querySelectorAll('input, select, textarea');
            novosInputs.forEach(input => {
                input.addEventListener('input', () => this.atualizarPreview());
                input.addEventListener('change', () => this.atualizarPreview());
            });
            this.atualizarPreview();
        }, 10);
    }

    atualizarCamposMagicos() {
        const isMagico = document.getElementById('item-magico').checked;
        const camposMagicos = document.getElementById('campos-magicos');
        
        if (isMagico) {
            camposMagicos.style.display = 'block';
        } else {
            camposMagicos.style.display = 'none';
            document.getElementById('item-efeito-magico').value = '';
        }
        
        this.atualizarPreview();
    }

    atualizarPreview() {
        const previewDiv = document.getElementById('preview-conteudo');
        
        // Obter valores do formulário
        const nome = document.getElementById('item-nome').value.trim();
        const tipo = document.getElementById('item-tipo').value;
        const peso = parseFloat(document.getElementById('item-peso').value) || 0;
        const custo = parseInt(document.getElementById('item-custo').value) || 0;
        const era = document.getElementById('item-era').value;
        const descricao = document.getElementById('item-descricao').value.trim();
        const isMagico = document.getElementById('item-magico').checked;
        const efeitoMagico = document.getElementById('item-efeito-magico').value.trim();
        
        if (!nome) {
            previewDiv.innerHTML = `
                <div class="preview-vazio">
                    <i class="fas fa-cube fa-3x"></i>
                    <p>As informações do item aparecerão aqui</p>
                    <small>Comece preenchendo o nome do item</small>
                </div>
            `;
            return;
        }
        
        // Traduzir tipo para português
        const tiposTraduzidos = {
            'geral': 'Equipamento Geral',
            'arma-cc': 'Arma Corpo-a-Corpo',
            'arma-dist': 'Arma à Distância',
            'armadura': 'Armadura',
            'escudo': 'Escudo',
            'consumivel': 'Consumível',
            'artefato': 'Artefato Mágico',
            'missao': 'Item de Missão'
        };
        
        let previewHTML = `
            <div class="preview-item">
                <h5>${nome}</h5>
                <span class="tipo-badge">${tiposTraduzidos[tipo] || tipo}</span>
                
                <div class="item-stats">
                    <div class="stat-item">
                        <span class="stat-label">Custo:</span>
                        <span class="stat-value">$${custo}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Peso:</span>
                        <span class="stat-value">${peso.toFixed(1)} kg</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Era:</span>
                        <span class="stat-value">${era === 'medieval' ? 'Medieval' : 'Moderna'}</span>
                    </div>
                    ${isMagico ? `
                    <div class="stat-item">
                        <span class="stat-label">Tipo:</span>
                        <span class="stat-value" style="color: var(--magico);">Mágico</span>
                    </div>
                    ` : ''}
        `;
        
        // Adicionar campos específicos baseados no tipo
        switch(tipo) {
            case 'arma-cc':
            case 'arma-dist':
                const dano = document.getElementById('item-dano')?.value || 'Não especificado';
                const tipoDano = document.getElementById('item-tipo-dano')?.value || 'Não especificado';
                const maos = document.getElementById('item-maos')?.value || '1';
                const st = document.getElementById('item-st')?.value || '10';
                const alcance = tipo === 'arma-cc' 
                    ? document.getElementById('item-alcance')?.value || 'Corpo-a-corpo'
                    : `${document.getElementById('item-alcance-min')?.value || '?'} - ${document.getElementById('item-alcance-max')?.value || '?'}`;
                
                previewHTML += `
                    <div class="stat-item">
                        <span class="stat-label">Dano:</span>
                        <span class="stat-value" style="color: var(--erro);">${dano}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Tipo:</span>
                        <span class="stat-value">${tipoDano}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Mãos:</span>
                        <span class="stat-value">${this.obterTextoMaos(parseFloat(maos))}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">ST Mín:</span>
                        <span class="stat-value">${st}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Alcance:</span>
                        <span class="stat-value">${alcance}</span>
                    </div>
                `;
                break;
                
            case 'armadura':
                const local = document.getElementById('item-local')?.value || 'Não especificado';
                const rd = document.getElementById('item-rd')?.value || '0';
                const bd = document.getElementById('item-bd')?.value || '0';
                const penalidade = document.getElementById('item-penalidade')?.value || '0';
                
                previewHTML += `
                    <div class="stat-item">
                        <span class="stat-label">Local:</span>
                        <span class="stat-value">${local}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">RD:</span>
                        <span class="stat-value">${rd}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">BD:</span>
                        <span class="stat-value">${bd}</span>
                    </div>
                    ${penalidade !== '0' ? `
                    <div class="stat-item">
                        <span class="stat-label">Penalidade:</span>
                        <span class="stat-value" style="color: var(--aviso);">MOV ${penalidade}</span>
                    </div>
                    ` : ''}
                `;
                break;
                
            case 'escudo':
                const bdEscudo = document.getElementById('item-bd')?.value || '2';
                const rdpv = document.getElementById('item-rdpv')?.value || '5';
                const maosEscudo = document.getElementById('item-maos')?.value || '1';
                
                previewHTML += `
                    <div class="stat-item">
                        <span class="stat-label">BD:</span>
                        <span class="stat-value">${bdEscudo}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">RD/PV:</span>
                        <span class="stat-value">${rdpv}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Mãos:</span>
                        <span class="stat-value">${this.obterTextoMaos(parseFloat(maosEscudo))}</span>
                    </div>
                `;
                break;
        }
        
        previewHTML += `
                </div>
                
                ${descricao ? `
                <div class="descricao">
                    <strong>Descrição:</strong><br>
                    ${descricao}
                </div>
                ` : ''}
                
                ${isMagico && efeitoMagico ? `
                <div class="efeito-magico">
                    <strong>✨ Efeito Mágico:</strong><br>
                    ${efeitoMagico}
                </div>
                ` : ''}
            </div>
        `;
        
        previewDiv.innerHTML = previewHTML;
    }

    limparFormCriacao() {
        // Limpar campos básicos
        document.getElementById('item-nome').value = '';
        document.getElementById('item-tipo').value = 'geral';
        document.getElementById('item-peso').value = '1.0';
        document.getElementById('item-custo').value = '0';
        document.getElementById('item-era').value = 'medieval';
        document.getElementById('item-descricao').value = '';
        document.getElementById('item-magico').checked = false;
        document.getElementById('item-efeito-magico').value = '';
        
        // Atualizar campos e preview
        this.atualizarCamposPorTipo();
        this.atualizarCamposMagicos();
        this.atualizarPreview();
        
        this.mostrarFeedback('Formulário limpo', 'sucesso');
    }

    criarItemPersonalizado() {
        // Validar campos obrigatórios
        const nome = document.getElementById('item-nome').value.trim();
        if (!nome) {
            this.mostrarFeedback('Por favor, insira um nome para o item!', 'erro');
            return;
        }
        
        const tipo = document.getElementById('item-tipo').value;
        const peso = parseFloat(document.getElementById('item-peso').value);
        const custo = parseInt(document.getElementById('item-custo').value) || 0;
        
        if (peso <= 0) {
            this.mostrarFeedback('O peso deve ser maior que zero!', 'erro');
            return;
        }
        
        // Verificar custo (se o item tem custo positivo, verificar dinheiro)
        if (custo > 0 && this.dinheiro < custo) {
            this.mostrarFeedback(`Dinheiro insuficiente! Necessário: $${custo}`, 'erro');
            return;
        }
        
        // Criar objeto do item
        const novoItem = {
            id: `personalizado_${this.contadorItensPersonalizados++}`,
            nome: nome,
            tipo: tipo,
            subtipo: this.obterSubtipoPorTipo(tipo),
            peso: peso,
            custo: custo,
            custoTotal: custo,
            era: document.getElementById('item-era').value,
            descricao: document.getElementById('item-descricao').value.trim() || 'Sem descrição',
            personalizado: true,
            criadoEm: new Date().toISOString(),
            status: 'na-mochila',
            equipado: false,
            quantidade: 1,
            idUnico: this.gerarIdUnico()
        };
        
        // Adicionar propriedades mágicas se necessário
        if (document.getElementById('item-magico').checked) {
            novoItem.magico = true;
            novoItem.efeitoMagico = document.getElementById('item-efeito-magico').value.trim();
        }
        
        // Adicionar campos específicos baseados no tipo
        this.adicionarCamposEspecificos(novoItem, tipo);
        
        // Deduzir custo se houver
        if (custo > 0) {
            this.dinheiro -= custo;
        }
        
        // Adicionar ao inventário
        this.equipamentosAdquiridos.push(novoItem);
        this.equipamentosEquipados.mochila.push(novoItem);
        
        // Salvar e atualizar
        this.salvarDados();
        this.mostrarFeedback(`${nome} criado com sucesso!`, 'sucesso');
        
        // Registrar transação se houver custo
        if (custo > 0) {
            this.registrarTransacaoSimples({
                tipo: 'despesa',
                valor: custo,
                descricao: `Criação: ${nome}`
            });
        }
        
        // Limpar formulário
        this.limparFormCriacao();
        
        // Atualizar interface e ir para inventário
        this.atualizarInterface();
        setTimeout(() => {
            alternarSubTab('inventario');
        }, 500);
    }

    obterSubtipoPorTipo(tipo) {
        const subtipos = {
            'arma-cc': 'arma',
            'arma-dist': 'arma',
            'armadura': 'armadura',
            'escudo': 'escudo',
            'consumivel': 'consumivel',
            'artefato': 'artefato',
            'missao': 'missao',
            'geral': 'equipamento'
        };
        return subtipos[tipo] || 'equipamento';
    }

    adicionarCamposEspecificos(item, tipo) {
        switch(tipo) {
            case 'arma-cc':
            case 'arma-dist':
                item.dano = document.getElementById('item-dano')?.value || '1d6';
                item.tipoDano = document.getElementById('item-tipo-dano')?.value || 'corte';
                item.maos = parseFloat(document.getElementById('item-maos')?.value) || 1;
                item.st = parseInt(document.getElementById('item-st')?.value) || 10;
                
                if (tipo === 'arma-cc') {
                    item.alcance = document.getElementById('item-alcance')?.value || 'Corpo-a-corpo';
                } else {
                    item.alcanceMin = document.getElementById('item-alcance-min')?.value || '10m';
                    item.alcanceMax = document.getElementById('item-alcance-max')?.value || '50m';
                    item.municao = document.getElementById('item-municao')?.value || '';
                }
                break;
                
            case 'armadura':
                item.local = document.getElementById('item-local')?.value || 'Torso';
                item.rd = parseInt(document.getElementById('item-rd')?.value) || 1;
                item.bd = parseInt(document.getElementById('item-bd')?.value) || 0;
                item.penalidadeMovimento = document.getElementById('item-penalidade')?.value || '0';
                break;
                
            case 'escudo':
                item.bd = parseInt(document.getElementById('item-bd')?.value) || 2;
                item.rdpv = parseInt(document.getElementById('item-rdpv')?.value) || 5;
                item.maos = parseFloat(document.getElementById('item-maos')?.value) || 1;
                break;
                
            case 'consumivel':
                item.efeito = document.getElementById('item-efeito')?.value || '';
                item.duracao = document.getElementById('item-duracao')?.value || '';
                item.tipoConsumivel = document.getElementById('item-tipo-consumivel')?.value || 'poção';
                break;
                
            case 'artefato':
                item.poder = document.getElementById('item-poder')?.value || '';
                item.carga = parseInt(document.getElementById('item-carga')?.value) || 0;
                item.ativacao = document.getElementById('item-ativacao')?.value || 'uso';
                break;
                
            case 'missao':
                item.missao = document.getElementById('item-missao')?.value || '';
                item.importancia = document.getElementById('item-importancia')?.value || 'chave';
                item.pista = document.getElementById('item-pista')?.value || '';
                break;
                
            case 'geral':
                item.funcao = document.getElementById('item-funcao')?.value || '';
                item.maos = parseFloat(document.getElementById('item-maos')?.value) || 0;
                break;
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

            // Eventos para botões financeiros simplificados
            const btnReceber = e.target.closest('[onclick*="abrirModalDinheiro(\'receber\')"]');
            if (btnReceber) {
                e.preventDefault();
                this.abrirModalDinheiro('receber');
            }

            const btnGastar = e.target.closest('[onclick*="abrirModalDinheiro(\'gastar\')"]');
            if (btnGastar) {
                e.preventDefault();
                this.abrirModalDinheiro('gastar');
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

            // Eventos para botões rápidos de dinheiro
            const btnRapidoReceber = e.target.closest('[onclick*="adicionarDinheiro("]');
            if (btnRapidoReceber) {
                e.preventDefault();
                const valor = btnRapidoReceber.getAttribute('onclick').match(/adicionarDinheiro\((\d+)\)/);
                if (valor && valor[1]) {
                    this.adicionarDinheiro(parseInt(valor[1]));
                }
            }

            const btnRapidoRemover = e.target.closest('[onclick*="removerDinheiro("]');
            if (btnRapidoRemover) {
                e.preventDefault();
                const valor = btnRapidoRemover.getAttribute('onclick').match(/removerDinheiro\((\d+)\)/);
                if (valor && valor[1]) {
                    this.removerDinheiro(parseInt(valor[1]));
                }
            }
        });

        // Evento de fechar modal ao clicar fora
        document.addEventListener('click', (e) => {
            const modalDinheiro = document.getElementById('modal-dinheiro');
            if (modalDinheiro && e.target === modalDinheiro) {
                this.fecharModalDinheiro();
            }
            
            const submenu = document.getElementById('submenu-quantidade');
            if (submenu && e.target === submenu) {
                this.fecharSubmenuQuantidade();
            }
        });

        // Evento de teclado
        document.addEventListener('keydown', (e) => {
            const modalDinheiro = document.getElementById('modal-dinheiro');
            if (modalDinheiro && modalDinheiro.classList.contains('aberto') && e.key === 'Escape') {
                this.fecharModalDinheiro();
            }
            
            const submenu = document.getElementById('submenu-quantidade');
            if (submenu && submenu.classList.contains('aberto') && e.key === 'Escape') {
                this.fecharSubmenuQuantidade();
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
                
                // Se for a aba financeira, atualizar histórico
                if (subtabId === 'financeiro') {
                    setTimeout(() => {
                        this.atualizarHistoricoTransacoes();
                    }, 100);
                }
                
                // Se for a aba criar, configurar eventos
                if (subtabId === 'criar') {
                    setTimeout(() => {
                        this.configurarCriacaoItens();
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
        
        // Atualizar texto
        const statusInfo = displayMaos.parentElement?.querySelector('.status-info small');
        if (statusInfo) {
            statusInfo.textContent = `${maosLivres} mãos disponíveis`;
        }
    }

    atualizarInterfaceForcada() {
        this.atualizarStatus();
        this.atualizarListaEquipamentosAdquiridos();
        this.atualizarInfoCarga();
        this.atualizarDisplayMaos();
        this.atualizarInterfaceDeposito();
        this.atualizarSistemaCombate();
        this.atualizarHistoricoTransacoes();
    }

    atualizarInterface() {
        this.atualizarStatus();
        this.atualizarListaEquipamentosAdquiridos();
        this.atualizarInfoCarga();
        this.atualizarDisplayMaos();
        this.atualizarInterfaceDeposito();
        this.atualizarHistoricoTransacoes();
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

        // Atualizar dinheiro disponível na aba financeiro
        const dinheiroDisponivel = document.getElementById('dinheiro-disponivel');
        if (dinheiroDisponivel) {
            dinheiroDisponivel.textContent = `$${this.dinheiro}`;
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
                            ${equipamento.personalizado ? `<span class="personalizado-info">✨ Personalizado</span>` : ''}
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
                ultimasTransacoes: this.ultimasTransacoes,
                contadorItensPersonalizados: this.contadorItensPersonalizados,
                ST: this.ST,
                nivelCargaAtual: this.nivelCargaAtual,
                penalidadesCarga: this.penalidadesCarga,
                sistemaRiqueza: this.sistemaRiqueza,
                timestamp: new Date().getTime(),
                version: '2.0'
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
            
            this.ultimasTransacoes = Array.isArray(dados.ultimasTransacoes) ? 
                dados.ultimasTransacoes : [];
            
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

// Funções para quantidade
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

// Funções para criação de itens
window.atualizarCamposPorTipo = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.atualizarCamposPorTipo();
    }
};

window.atualizarCamposMagicos = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.atualizarCamposMagicos();
    }
};

window.atualizarPreview = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.atualizarPreview();
    }
};

window.limparFormCriacao = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.limparFormCriacao();
    }
};

window.criarItemPersonalizado = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.criarItemPersonalizado();
    }
};

// Funções financeiras simplificadas
window.abrirModalDinheiro = function(tipo) {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.abrirModalDinheiro(tipo);
    }
};

window.confirmarTransacao = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.confirmarTransacao();
    }
};

window.fecharModalDinheiro = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.fecharModalDinheiro();
    }
};

window.adicionarDinheiro = function(valor) {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.adicionarDinheiro(valor);
    }
};

window.removerDinheiro = function(valor) {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.removerDinheiro(valor);
    }
};

window.ajustarDinheiroManual = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.ajustarDinheiroManual();
    }
};

window.limparHistorico = function() {
    if (window.sistemaEquipamentos) {
        window.sistemaEquipamentos.limparHistorico();
    }
};

// Funções de navegação
window.alternarSubTab = function(subtab) {
    document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
    
    const btn = document.querySelector(`[data-subtab="${subtab}"]`);
    const content = document.getElementById(`subtab-${subtab}`);
    
    if (btn) btn.classList.add('active');
    if (content) content.classList.add('active');
    
    // Se for a aba financeira, atualizar histórico
    if (subtab === 'financeiro' && window.sistemaEquipamentos) {
        setTimeout(() => {
            window.sistemaEquipamentos.atualizarHistoricoTransacoes();
        }, 100);
    }
    
    // Se for a aba criar, configurar eventos
    if (subtab === 'criar' && window.sistemaEquipamentos) {
        setTimeout(() => {
            window.sistemaEquipamentos.configurarCriacaoItens();
        }, 100);
    }
};

// Exportar para uso global
window.SistemaEquipamentos = SistemaEquipamentos;

// ========== INICIALIZAÇÃO AUTOMÁTICA ==========
function inicializarSistemaEquipamentos() {
    const intervalo = setInterval(() => {
        const abaEquipamento = document.getElementById('equipamento');
        if (abaEquipamento && abaEquipamento.classList.contains('active')) {
            if (!window.sistemaEquipamentos) {
                window.sistemaEquipamentos = new SistemaEquipamentos();
                window.sistemaEquipamentos.inicializarQuandoPronto();
            }
            clearInterval(intervalo);
        }
    }, 500);
}

// Iniciar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSistemaEquipamentos);
} else {
    inicializarSistemaEquipamentos();
}