// CATÁLOGO DE VANTAGENS
const vantagens = [
    {
        id: "vantagem-001",
        nome: "Abençoado",
        tipo: "Vantagem",
        descricao: "O personagem está sintonizado com um deus, senhor demoníaco, grande espírito, poder cósmico, etc. O personagem perderá a vantagem se não conseguir agir de acordo com as regras e valores da entidade.",
        temOpcoes: true,
        opcoes: [
            {
                id: "opcao-001",
                nome: "Abençoado",
                custo: 10,
                descricao: "De vez em quando, o personagem recebe sabedoria da entidade. Após comungar por pelo menos uma hora, recebe visões ou presságios sobre eventos futuros. Teste de IQ secreto para informações úteis. Perde 10 PF após o ritual. Bônus de reação de +1 com seguidores da entidade."
            },
            {
                id: "opcao-002",
                nome: "Muito Abençoado",
                custo: 20,
                descricao: "Funciona como Abençoado, mas o teste de IQ recebe bônus de +5 e o bônus de reação dos seguidores é de +2."
            },
            {
                id: "opcao-003",
                nome: "Feitos Heroicos",
                custo: 10,
                descricao: "Uma vez a cada sessão de jogo, pode adicionar 1 dado à ST, DX ou HT (especificar ao comprar). O bônus dura 3d segundos. Após isso, habilidades voltam ao normal e o personagem fica sujeito a penalidades acumuladas."
            }
        ],
        prerequisitos: [],
        categoria: "Vantagem Sobrenatural",
        notas: "O Mestre pode estipular bênçãos adicionais."
    },
    {
        id: "vantagem-002",
        nome: "Ambidestria",
        tipo: "Vantagem",
        custo: 5,
        descricao: "O personagem é capaz de lutar e manusear igualmente bem com qualquer uma das mãos e nunca sofre a penalidade de -4 na DX por estar usando a mão inábil. Não permite ações adicionais durante o combate — para isso precisaria de um Ataque Adicional. Se um acidente ocorrer com qualquer um dos braços, assume-se que foi com o esquerdo.",
        temOpcoes: false,
        prerequisitos: [],
        categoria: "Vantagem Física",
        notas: "Útil para personagens que usam duas armas ou precisam de precisão com ambas as mãos."
    }
    // Mais vantagens serão adicionadas posteriormente
];

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.catalogoVantagens = vantagens;
}