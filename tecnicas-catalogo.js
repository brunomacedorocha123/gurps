// ===== CATÁLOGO DE TÉCNICAS - SÓ ARQUEARIA MONTADA =====
const catalogoTecnicas = {
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Permite usar arco eficientemente enquanto cavalga. Base: Arco-4.",
        dificuldade: "Difícil",
        basePericia: "arco",
        redutor: -4,
        limitePericia: null,
        preRequisitos: [
            { pericia: "arco" },
            { tipo: "cavalgar" }
        ]
    }
};

// ===== FUNÇÕES DO CATÁLOGO =====
window.catalogoTecnicas = {
    obterTodasTecnicas: function() {
        return Object.values(catalogoTecnicas).map(tecnica => ({
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
                        nivelMinimo: 0
                    };
                }
            }) : []
        }));
    },
    
    buscarTecnicaPorId: function(id) {
        const tecnica = catalogoTecnicas[id];
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
                        nivelMinimo: 0
                    };
                }
            }) : []
        };
    }
};

console.log("✅ Catálogo de técnicas carregado (Só Arquearia Montada)");