// ===== CATÁLOGO DE TÉCNICAS - VERSÃO CORRIGIDA =====
const catalogoTecnicas = {
    // TÉCNICA: ARQUEARIA MONTADA
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Permite usar arco eficientemente enquanto cavalga.",
        dificuldade: "Difícil",
        
        // BASE DE CÁLCULO (obrigatório)
        basePericia: "arco", // ID da perícia base
        redutor: -4,         // Redutor ao NH da perícia base
        
        // LIMITE MÁXIMO (opcional)
        limitePericia: "arco", // Não pode passar o NH desta perícia
        
        // PRÉ-REQUISITOS (array simples)
        preRequisitos: [
            { tipo: "pericia", pericia: "arco", nivelMin: 4 }, // Arco nível 4+
            { tipo: "cavalgar" } // Qualquer Cavalgar
        ]
    },
    
    // ADICIONAR MAIS TÉCNICAS AQUI DEPOIS
    /*
    "contra-ataque": {
        id: "contra-ataque",
        nome: "Contra-Ataque",
        descricao: "Ataca imediatamente após defender.",
        dificuldade: "Média",
        basePericia: "espadas-curtas",
        redutor: -2,
        limitePericia: "espadas-curtas",
        preRequisitos: [
            { tipo: "pericia", pericia: "espadas-curtas", nivelMin: 3 }
        ]
    }
    */
};

// ===== FUNÇÕES CORRIGIDAS PARA O CATÁLOGO =====
window.catalogoTecnicas = {
    // Pega todas as técnicas
    todas: function() {
        return Object.values(catalogoTecnicas);
    },
    
    // Busca uma técnica pelo ID
    buscar: function(id) {
        return catalogoTecnicas[id] || null;
    },
    
    // Converte para formato compatível com tecnicas.js
    obterTodasTecnicas: function() {
        return this.todas().map(tecnica => ({
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
            baseCalculo: {
                tipo: "pericia",
                idPericia: tecnica.basePericia,
                redutor: tecnica.redutor || 0
            },
            limiteMaximo: tecnica.limitePericia ? {
                tipo: "pericia",
                idPericia: tecnica.limitePericia
            } : null,
            preRequisitos: tecnica.preRequisitos ? tecnica.preRequisitos.map(prereq => {
                if (prereq.tipo === "cavalgar") {
                    return {
                        verificarCavalgar: true,
                        nomePericia: "Cavalgar",
                        nivelMinimo: 0
                    };
                } else {
                    return {
                        idPericia: prereq.pericia,
                        nomePericia: prereq.pericia,
                        nivelMinimo: prereq.nivelMin || 0
                    };
                }
            }) : []
        }));
    },
    
    buscarTecnicaPorId: function(id) {
        const tecnica = this.buscar(id);
        if (!tecnica) return null;
        
        return {
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
            baseCalculo: {
                tipo: "pericia",
                idPericia: tecnica.basePericia,
                redutor: tecnica.redutor || 0
            },
            limiteMaximo: tecnica.limitePericia ? {
                tipo: "pericia",
                idPericia: tecnica.limitePericia
            } : null,
            preRequisitos: tecnica.preRequisitos ? tecnica.preRequisitos.map(prereq => {
                if (prereq.tipo === "cavalgar") {
                    return {
                        verificarCavalgar: true,
                        nomePericia: "Cavalgar",
                        nivelMinimo: 0
                    };
                } else {
                    return {
                        idPericia: prereq.pericia,
                        nomePericia: prereq.pericia,
                        nivelMinimo: prereq.nivelMin || 0
                    };
                }
            }) : []
        };
    }
};

console.log("✅ Catálogo de técnicas corrigido e carregado");