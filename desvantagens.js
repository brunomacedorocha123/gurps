// desvantagens.js - Sistema de gerenciamento de desvantagens (LÓGICA PURA)

class SistemaDesvantagens {
    constructor() {
        this.desvantagensSelecionadas = new Map(); // id -> {desvantagem}
        this.peculiaridades = []; // Array de strings
        this.pontosGanhos = 0;
        this.maxPeculiaridades = 5;
        this.custoPeculiaridade = -1;
    }

    // ========== MÉTODOS PÚBLICOS ==========

    /**
     * Adiciona uma desvantagem SIMPLES
     * @param {Object} desvantagem - Desvantagem do catálogo
     * @returns {Object} - Resultado {sucesso: boolean, mensagem: string}
     */
    adicionarSimples(desvantagem) {
        if (this.desvantagensSelecionadas.has(desvantagem.id)) {
            return { sucesso: false, mensagem: "Desvantagem já selecionada" };
        }

        const desvantagemCompleta = {
            ...desvantagem,
            tipo: 'simples',
            dataAdicao: new Date().toISOString()
        };

        this.desvantagensSelecionadas.set(desvantagem.id, desvantagemCompleta);
        this.calcularPontos();
        
        return { 
            sucesso: true, 
            mensagem: `${desvantagem.nome} adicionada por ${desvantagem.custo} pontos`
        };
    }

    /**
     * Adiciona desvantagem com OPÇÃO selecionada
     * @param {Object} desvantagemBase - Desvantagem base do catálogo
     * @param {Object} opcaoEscolhida - Opção selecionada {id, nome, custo}
     * @returns {Object} - Resultado
     */
    adicionarComOpcao(desvantagemBase, opcaoEscolhida) {
        const idUnico = `${desvantagemBase.id}_${opcaoEscolhida.id}_${Date.now()}`;

        const desvantagemCompleta = {
            ...desvantagemBase,
            id: idUnico,
            opcaoEscolhida: opcaoEscolhida,
            custo: opcaoEscolhida.custo,
            nomeCompleto: `${desvantagemBase.nome}: ${opcaoEscolhida.nome}`,
            tipo: 'opcoes',
            dataAdicao: new Date().toISOString()
        };

        this.desvantagensSelecionadas.set(idUnico, desvantagemCompleta);
        this.calcularPontos();
        
        return { 
            sucesso: true, 
            mensagem: `${desvantagemCompleta.nomeCompleto} adicionada por ${opcaoEscolhida.custo} pontos`
        };
    }

    /**
     * Adiciona desvantagem com NÍVEL
     * @param {Object} desvantagemBase - Desvantagem base do catálogo
     * @param {number} nivel - Nível selecionado
     * @returns {Object} - Resultado
     */
    adicionarComNivel(desvantagemBase, nivel) {
        // Valida nível
        if (nivel < desvantagemBase.nivelMin || nivel > desvantagemBase.nivelMax) {
            return { 
                sucesso: false, 
                mensagem: `Nível deve estar entre ${desvantagemBase.nivelMin} e ${desvantagemBase.nivelMax}` 
            };
        }

        // Calcula custo base
        let custoFinal = desvantagemBase.custoBase + (nivel * desvantagemBase.custoPorNivel);
        const idUnico = `${desvantagemBase.id}_nivel${nivel}_${Date.now()}`;

        const desvantagemCompleta = {
            ...desvantagemBase,
            id: idUnico,
            nivel: nivel,
            custo: custoFinal,
            nomeCompleto: `${desvantagemBase.nome} Nível ${nivel}`,
            tipo: 'niveis',
            dataAdicao: new Date().toISOString()
        };

        this.desvantagensSelecionadas.set(idUnico, desvantagemCompleta);
        this.calcularPontos();
        
        return { 
            sucesso: true, 
            mensagem: `${desvantagemCompleta.nomeCompleto} adicionada por ${custoFinal} pontos`
        };
    }

    /**
     * Remove uma desvantagem selecionada
     * @param {string} id - ID da desvantagem
     * @returns {Object} - Resultado
     */
    removerDesvantagem(id) {
        if (!this.desvantagensSelecionadas.has(id)) {
            return { sucesso: false, mensagem: "Desvantagem não encontrada" };
        }

        const desvantagem = this.desvantagensSelecionadas.get(id);
        this.desvantagensSelecionadas.delete(id);
        this.calcularPontos();
        
        return { 
            sucesso: true, 
            mensagem: `${desvantagem.nomeCompleto || desvantagem.nome} removida`,
            pontosPerdidos: desvantagem.custo
        };
    }

    /**
     * Adiciona uma peculiaridade
     * @param {string} descricao - Descrição da peculiaridade
     * @param {number} indice - Índice (1-5)
     * @returns {Object} - Resultado
     */
    adicionarPeculiaridade(descricao, indice) {
        if (this.peculiaridades.length >= this.maxPeculiaridades) {
            return { 
                sucesso: false, 
                mensagem: `Limite de ${this.maxPeculiaridades} peculiaridades atingido` 
            };
        }

        if (!descricao || descricao.trim() === '') {
            return { 
                sucesso: false, 
                mensagem: "Descrição da peculiaridade não pode estar vazia" 
            };
        }

        const peculiaridade = {
            descricao: descricao.trim(),
            indice: indice,
            custo: this.custoPeculiaridade,
            dataAdicao: new Date().toISOString()
        };

        this.peculiaridades[indice - 1] = peculiaridade;
        this.calcularPontos();
        
        return { 
            sucesso: true, 
            mensagem: `Peculiaridade "${descricao.trim()}" adicionada`,
            peculiaridade: peculiaridade
        };
    }

    /**
     * Remove uma peculiaridade
     * @param {number} indice - Índice (1-5)
     * @returns {Object} - Resultado
     */
    removerPeculiaridade(indice) {
        if (indice < 1 || indice > this.maxPeculiaridades) {
            return { sucesso: false, mensagem: "Índice inválido" };
        }

        if (!this.peculiaridades[indice - 1]) {
            return { sucesso: false, mensagem: "Peculiaridade não encontrada" };
        }

        const peculiaridade = this.peculiaridades[indice - 1];
        this.peculiaridades[indice - 1] = null;
        this.calcularPontos();
        
        return { 
            sucesso: true, 
            mensagem: `Peculiaridade removida: "${peculiaridade.descricao}"`
        };
    }

    /**
     * Limpa todas as peculiaridades
     * @returns {Object} - Resultado
     */
    limparPeculiaridades() {
        const removidas = this.peculiaridades.filter(p => p !== null).length;
        this.peculiaridades = [];
        this.calcularPontos();
        
        return { 
            sucesso: true, 
            mensagem: `${removidas} peculiaridades removidas`
        };
    }

    /**
     * Calcula total de pontos ganhos
     * @private
     */
    calcularPontos() {
        // Pontos de desvantagens (valores negativos)
        let totalDesvantagens = 0;
        for (const desvantagem of this.desvantagensSelecionadas.values()) {
            totalDesvantagens += desvantagem.custo || 0;
        }

        // Pontos de peculiaridades (sempre -1 cada)
        const peculiaridadesAtivas = this.peculiaridades.filter(p => p !== null);
        const totalPeculiaridades = peculiaridadesAtivas.length * this.custoPeculiaridade;

        this.pontosGanhos = totalDesvantagens + totalPeculiaridades;
    }

    /**
     * Retorna lista de desvantagens selecionadas
     * @returns {Array} - Lista de desvantagens
     */
    getDesvantagensSelecionadas() {
        return Array.from(this.desvantagensSelecionadas.values());
    }

    /**
     * Retorna peculiaridades ativas (não nulas)
     * @returns {Array} - Lista de peculiaridades
     */
    getPeculiaridadesAtivas() {
        return this.peculiaridades.filter(p => p !== null);
    }

    /**
     * Verifica se já possui uma desvantagem (pelo ID base)
     * @param {string} desvantagemId - ID base da desvantagem
     * @returns {boolean}
     */
    possuiDesvantagem(desvantagemId) {
        for (const id of this.desvantagensSelecionadas.keys()) {
            if (id.startsWith(desvantagemId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Limpa todas as desvantagens selecionadas
     */
    limparTudo() {
        this.desvantagensSelecionadas.clear();
        this.peculiaridades = [];
        this.pontosGanhos = 0;
        return { sucesso: true, mensagem: "Todas as desvantagens e peculiaridades foram removidas" };
    }

    /**
     * Exporta dados para salvar
     * @returns {Object} - Dados serializáveis
     */
    exportarDados() {
        return {
            desvantagens: this.getDesvantagensSelecionadas(),
            peculiaridades: this.getPeculiaridadesAtivas(),
            pontosGanhos: this.pontosGanhos,
            dataExportacao: new Date().toISOString()
        };
    }

    /**
     * Importa dados salvos
     * @param {Object} dados - Dados exportados
     */
    importarDados(dados) {
        if (!dados) return false;
        
        this.desvantagensSelecionadas.clear();
        
        if (dados.desvantagens) {
            dados.desvantagens.forEach(desvantagem => {
                this.desvantagensSelecionadas.set(desvantagem.id, desvantagem);
            });
        }

        this.peculiaridades = [];
        if (dados.peculiaridades) {
            dados.peculiaridades.forEach(pec => {
                if (pec.indice && pec.indice <= this.maxPeculiaridades) {
                    this.peculiaridades[pec.indice - 1] = pec;
                }
            });
        }

        this.pontosGanhos = dados.pontosGanhos || 0;
        return true;
    }

    // ========== VALIDAÇÕES ==========

    /**
     * Verifica se pode adicionar mais peculiaridades
     * @returns {boolean}
     */
    podeAdicionarPeculiaridade() {
        return this.getPeculiaridadesAtivas().length < this.maxPeculiaridades;
    }

    /**
     * Verifica peculiaridade por índice
     * @param {number} indice - Índice (1-5)
     * @returns {Object|null} - Peculiaridade ou null
     */
    getPeculiaridadePorIndice(indice) {
        if (indice < 1 || indice > this.maxPeculiaridades) return null;
        return this.peculiaridades[indice - 1] || null;
    }

    // ========== GETTERS ==========
    
    getPontosGanhos() { return this.pontosGanhos; }
    
    getQuantidadeDesvantagens() { return this.desvantagensSelecionadas.size; }
    
    getQuantidadePeculiaridades() { return this.getPeculiaridadesAtivas().length; }
    
    getCategoriasSelecionadas() {
        const categorias = new Set();
        for (const desvantagem of this.desvantagensSelecionadas.values()) {
            categorias.add(desvantagem.categoria);
        }
        return Array.from(categorias);
    }

    getMaxPeculiaridades() { return this.maxPeculiaridades; }
    
    getCustoPeculiaridade() { return this.custoPeculiaridade; }
}

// Exportar para uso global
window.SistemaDesvantagens = SistemaDesvantagens;