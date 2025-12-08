window.catalogoTecnicas = {
    obterTodasTecnicas: function() {
        return [
            {
                id: "arquearia-montada",
                nome: "Arquearia Montada",
                descricao: "Permite usar arco eficientemente enquanto cavalga. Base: Arco-4.",
                dificuldade: "Difícil",
                baseCalculo: {
                    idPericia: "arco",
                    redutor: -4
                },
                limiteMaximo: null,
                preRequisitos: [
                    { idPericia: "arco" },
                    { verificarCavalgar: true }
                ]
            }
        ];
    },
    
    buscarTecnicaPorId: function(id) {
        if (id === "arquearia-montada") {
            return {
                id: "arquearia-montada",
                nome: "Arquearia Montada",
                descricao: "Permite usar arco eficientemente enquanto cavalga. Base: Arco-4.",
                dificuldade: "Difícil",
                baseCalculo: {
                    idPericia: "arco",
                    redutor: -4
                },
                limiteMaximo: null,
                preRequisitos: [
                    { idPericia: "arco" },
                    { verificarCavalgar: true }
                ]
            };
        }
        return null;
    }
};