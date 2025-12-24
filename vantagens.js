// vantagens.js - Sistema de gerenciamento de vantagens (LÓGICA PURA)

class SistemaVantagens {
    constructor() {
        this.vantagensSelecionadas = new Map(); // id -> {vantagem}
        this.pontosGastos = 0;
    }

    // ========== MÉTODOS PÚBLICOS ==========

    /**
     * Adiciona uma vantagem SIMPLES
     * @param {Object} vantagem - Vantagem do catálogo
     * @returns {Object} - Resultado {sucesso: boolean, mensagem: string}
     */
    adicionarSimples(vantagem) {
        if (this.vantagensSelecionadas.has(vantagem.id)) {
            return { sucesso: false, mensagem: "Vantagem já selecionada" };
        }

        const vantagemCompleta = {
            ...vantagem,
            tipo: 'simples',
            dataAdicao: new Date().toISOString()
        };

        this.vantagensSelecionadas.set(vantagem.id, vantagemCompleta);
        this.calcularPontos();
        
        return { 
            sucesso: true, 
            mensagem: `${vantagem.nome} adicionada por ${vantagem.custo} pontos`
        };
    }

    /**
     * Adiciona vantagem com OPÇÃO selecionada
     * @param {Object} vantagemBase - Vantagem base do catálogo
     * @param {Object} opcaoEscolhida - Opção selecionada {id, nome, custo}
     * @returns {Object} - Resultado
     */
    adicionarComOpcao(vantagemBase, opcaoEscolhida) {
        const idUnico = `${vantagemBase.id}_${opcaoEscolhida.id}_${Date.now()}`;

        const vantagemCompleta = {
            ...vantagemBase,
            id: idUnico,
            opcaoEscolhida: opcaoEscolhida,
            custo: opcaoEscolhida.custo,
            nomeCompleto: `${vantagemBase.nome}: ${opcaoEscolhida.nome}`,
            tipo: 'opcoes',
            dataAdicao: new Date().toISOString()
        };

        this.vantagensSelecionadas.set(idUnico, vantagemCompleta);
        this.calcularPontos();
        
        return { 
            sucesso: true, 
            mensagem: `${vantagemCompleta.nomeCompleto} adicionada por ${opcaoEscolhida.custo} pontos`
        };
    }

    /**
     * Adiciona vantagem com NÍVEL e LIMITAÇÕES
     * @param {Object} vantagemBase - Vantagem base do catálogo
     * @param {number} nivel - Nível selecionado (0-5)
     * @param {Array} limitacoes - Limitações selecionadas
     * @returns {Object} - Resultado
     */
    adicionarComNivel(vantagemBase, nivel, limitacoes = []) {
        // Valida nível
        if (nivel < vantagemBase.nivelMin || nivel > vantagemBase.nivelMax) {
            return { 
                sucesso: false, 
                mensagem: `Nível deve estar entre ${vantagemBase.nivelMin} e ${vantagemBase.nivelMax}` 
            };
        }

        // Calcula custo base
        let custoBase = vantagemBase.custoBase;
        if (nivel > 0) {
            custoBase += (nivel * vantagemBase.custoPorNivel);
        }

        // Aplica descontos das limitações
        let descontoTotal = 0;
        if (limitacoes.length > 0) {
            descontoTotal = limitacoes.reduce((total, limit) => total + limit.desconto, 0);
        }

        const custoFinal = Math.round(custoBase * (1 - (descontoTotal / 100)));
        const idUnico = `${vantagemBase.id}_nivel${nivel}_${Date.now()}`;

        const vantagemCompleta = {
            ...vantagemBase,
            id: idUnico,
            nivel: nivel,
            limitacoes: [...limitacoes],
            descontoTotal: descontoTotal,
            custo: custoFinal,
            nomeCompleto: `${vantagemBase.nome} Nível ${nivel}`,
            tipo: 'niveis',
            dataAdicao: new Date().toISOString()
        };

        this.vantagensSelecionadas.set(idUnico, vantagemCompleta);
        this.calcularPontos();
        
        let msg = `${vantagemCompleta.nomeCompleto} adicionada por ${custoFinal} pontos`;
        if (descontoTotal > 0) {
            msg += ` (${descontoTotal}% de desconto por limitações)`;
        }
        
        return { sucesso: true, mensagem: msg };
    }

    /**
     * Remove uma vantagem selecionada
     * @param {string} id - ID da vantagem
     * @returns {Object} - Resultado
     */
    removerVantagem(id) {
        if (!this.vantagensSelecionadas.has(id)) {
            return { sucesso: false, mensagem: "Vantagem não encontrada" };
        }

        const vantagem = this.vantagensSelecionadas.get(id);
        this.vantagensSelecionadas.delete(id);
        this.calcularPontos();
        
        return { 
            sucesso: true, 
            mensagem: `${vantagem.nomeCompleto || vantagem.nome} removida`,
            pontosDevolvidos: vantagem.custo
        };
    }

    /**
     * Calcula total de pontos gastos
     * @private
     */
    calcularPontos() {
        let total = 0;
        for (const vantagem of this.vantagensSelecionadas.values()) {
            total += vantagem.custo || 0;
        }
        this.pontosGastos = total;
    }

    /**
     * Retorna lista de vantagens selecionadas
     * @returns {Array} - Lista de vantagens
     */
    getVantagensSelecionadas() {
        return Array.from(this.vantagensSelecionadas.values());
    }

    /**
     * Retorna vantagens agrupadas por categoria
     * @returns {Object} - {categoria: [vantagens]}
     */
    getVantagensPorCategoria() {
        const categorias = {};
        
        for (const vantagem of this.vantagensSelecionadas.values()) {
            const cat = vantagem.categoria;
            if (!categorias[cat]) categorias[cat] = [];
            categorias[cat].push(vantagem);
        }
        
        return categorias;
    }

    /**
     * Verifica se já possui uma vantagem (pelo ID base)
     * @param {string} vantagemId - ID base da vantagem
     * @returns {boolean}
     */
    possuiVantagem(vantagemId) {
        for (const id of this.vantagensSelecionadas.keys()) {
            if (id.startsWith(vantagemId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Limpa todas as vantagens selecionadas
     */
    limparTudo() {
        this.vantagensSelecionadas.clear();
        this.pontosGastos = 0;
        return { sucesso: true, mensagem: "Todas as vantagens foram removidas" };
    }

    /**
     * Exporta dados para salvar
     * @returns {Object} - Dados serializáveis
     */
    exportarDados() {
        return {
            vantagens: this.getVantagensSelecionadas(),
            pontosGastos: this.pontosGastos,
            dataExportacao: new Date().toISOString()
        };
    }

    /**
     * Importa dados salvos
     * @param {Object} dados - Dados exportados
     */
    importarDados(dados) {
        if (!dados || !dados.vantagens) return false;
        
        this.vantagensSelecionadas.clear();
        
        dados.vantagens.forEach(vantagem => {
            this.vantagensSelecionadas.set(vantagem.id, vantagem);
        });
        
        this.pontosGastos = dados.pontosGastos || 0;
        return true;
    }

    // ========== GETTERS ==========
    
    getPontosGastos() { return this.pontosGastos; }
    
    getQuantidadeVantagens() { return this.vantagensSelecionadas.size; }
    
    getCategoriasSelecionadas() {
        const categorias = new Set();
        for (const vantagem of this.vantagensSelecionadas.values()) {
            categorias.add(vantagem.categoria);
        }
        return Array.from(categorias);
    }
}