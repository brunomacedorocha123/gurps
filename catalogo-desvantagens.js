// CATÁLOGO DE DESVANTAGENS
const desvantagens = [
    {
        id: "desvantagem-001",
        nome: "Alcoolismo",
        tipo: "Desvantagem",
        descricao: "O personagem é um viciado em álcool. Considerado um Vício que é barato, incapacitante e (normalmente) legal.",
        temOpcoes: true,
        opcoes: [
            {
                id: "opcao-101",
                nome: "Alcoolismo (Normal)",
                custo: -15,
                descricao: "Em circunstâncias normais, pode limitar o uso ao período noturno. Toda vez que se vir frente a frente com álcool, precisa de sucesso em teste de Vontade para não sucumbir. Fracasso significa porre de 2d horas + ressaca. Alcoólatras numa bebedeira oscilam de humor (cordialidade à hostilidade) e podem atacar inimigos, falar demais ou cometer erros."
            },
            {
                id: "opcao-102",
                nome: "Alcoolismo (Ilegal/Severo)",
                custo: -20,
                descricao: "Versão mais severa ou quando o álcool é ilegal no contexto da campanha. Mesmos efeitos, mas com consequências mais graves quando descoberto."
            }
        ],
        prerequisitos: [],
        categoria: "Vício",
        notas: "Difícil se libertar. Quando 'regenerado', ainda precisa de teste de Vontade (+4) na presença de álcool. Três porres em uma semana trazem o vício de volta. Alcoolismo prolongado causa perda anual de ponto de atributo (teste HT+2, fracasso perde ponto aleatório)."
    },
    {
        id: "desvantagem-002",
        nome: "Altruísmo",
        tipo: "Desvantagem",
        custo: -5,
        descricao: "O personagem é altruísta — ele se sacrifica por outras pessoas e pouco se importa com fama ou riqueza pessoal.",
        temOpcoes: false,
        prerequisitos: [],
        categoria: "Desvantagem Psicológica",
        notas: "Precisa de sucesso em teste de autocontrole para colocar suas necessidades — até mesmo sua própria sobrevivência — na frente de outras pessoas. Uma raça altruísta possui uma 'mentalidade de colmeia'."
    }
    // Mais desvantagens serão adicionadas posteriormente
];

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.catalogoDesvantagens = desvantagens;
}