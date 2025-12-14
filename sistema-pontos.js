// sistema-pontos.js
class SistemaPontos {
    constructor() {
        this.pontos = {
            totais: 150,
            gastos: 0,
            disponiveis: 150,
            limiteDesvantagens: -50,
            desvantagensAtuais: 0
        };
        this.inicializarEventos();
    }
    
    inicializarEventos() {
        const atributos = ['ST', 'DX', 'IQ', 'HT'];
        atributos.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => this.calcularPontos());
            }
        });
    }
    
    setPontosTotais(valor) {
        this.pontos.totais = parseInt(valor) || 150;
        this.atualizarDisponiveis();
        this.atualizarUI();
    }
    
    setLimiteDesvantagens(valor) {
        this.pontos.limiteDesvantagens = parseInt(valor) || -50;
        this.atualizarUI();
    }
    
    calcularPontos() {
        let gastos = 0;
        
        gastos += this.calcularAtributos();
        gastos += this.calcularVantagensDesvantagens();
        gastos += this.calcularPericias();
        gastos += this.calcularMagias();
        gastos += this.calcularTecnicas();
        
        this.pontos.gastos = gastos;
        this.atualizarDisponiveis();
        this.atualizarUI();
    }
    
    calcularAtributos() {
        const ST = parseInt(document.getElementById('ST')?.value) || 10;
        const DX = parseInt(document.getElementById('DX')?.value) || 10;
        const IQ = parseInt(document.getElementById('IQ')?.value) || 10;
        const HT = parseInt(document.getElementById('HT')?.value) || 10;
        
        return ((ST - 10) * 10) + ((DX - 10) * 20) + ((IQ - 10) * 20) + ((HT - 10) * 10);
    }
    
    calcularVantagensDesvantagens() {
        let total = 0;
        
        const vantagens = document.querySelectorAll('.vantagem-adquirida');
        vantagens.forEach(v => {
            total += parseInt(v.getAttribute('data-pontos')) || 0;
        });
        
        const desvantagens = document.querySelectorAll('.desvantagem-adquirida');
        desvantagens.forEach(d => {
            total += parseInt(d.getAttribute('data-pontos')) || 0;
        });
        
        const peculiaridades = document.querySelectorAll('.peculiaridade-item');
        total += peculiaridades.length * -1;
        
        return total;
    }
    
    calcularPericias() {
        let total = 0;
        const pericias = document.querySelectorAll('.pericia-adquirida');
        pericias.forEach(p => {
            total += parseInt(p.getAttribute('data-pontos')) || 0;
        });
        return total;
    }
    
    calcularMagias() {
        let total = 0;
        const magias = document.querySelectorAll('.magia-adquirida');
        magias.forEach(m => {
            total += parseInt(m.getAttribute('data-pontos')) || 0;
        });
        
        const aptidao = parseInt(document.getElementById('aptidao-magica')?.value) || 0;
        total += aptidao * 15;
        
        return total;
    }
    
    calcularTecnicas() {
        let total = 0;
        const tecnicas = document.querySelectorAll('.tecnica-adquirida');
        tecnicas.forEach(t => {
            total += parseInt(t.getAttribute('data-pontos')) || 0;
        });
        return total;
    }
    
    atualizarDisponiveis() {
        this.pontos.disponiveis = this.pontos.totais - this.pontos.gastos;
    }
    
    atualizarUI() {
        const pontosTotaisInput = document.getElementById('pontosTotaisDashboard');
        const pontosGastosSpan = document.getElementById('pontosGastosDashboard');
        const saldoDisponivelSpan = document.getElementById('saldoDisponivelDashboard');
        const desvantagensAtuaisSpan = document.getElementById('desvantagensAtuais');
        const limiteDesvantagensInput = document.getElementById('limiteDesvantagens');
        
        if (pontosTotaisInput) pontosTotaisInput.value = this.pontos.totais;
        if (pontosGastosSpan) pontosGastosSpan.textContent = this.pontos.gastos;
        if (saldoDisponivelSpan) saldoDisponivelSpan.textContent = this.pontos.disponiveis;
        if (desvantagensAtuaisSpan) desvantagensAtuaisSpan.textContent = this.pontos.desvantagensAtuais;
        if (limiteDesvantagensInput) limiteDesvantagensInput.value = this.pontos.limiteDesvantagens;
        
        const pontosTotaisAttr = document.getElementById('pontosTotais');
        const pontosGastosAttr = document.getElementById('pontosGastos');
        const pontosSaldoAttr = document.getElementById('pontosSaldo');
        
        if (pontosTotaisAttr) pontosTotaisAttr.textContent = this.pontos.totais;
        if (pontosGastosAttr) pontosGastosAttr.textContent = this.pontos.gastos;
        if (pontosSaldoAttr) pontosSaldoAttr.textContent = this.pontos.disponiveis;
        
        const totalVantagens = document.getElementById('total-vantagens');
        const totalDesvantagens = document.getElementById('total-desvantagens');
        const saldoTotalVantagens = document.getElementById('saldo-total-vantagens');
        
        if (totalVantagens) totalVantagens.textContent = this.pontos.gastos > 0 ? `+${this.pontos.gastos} pts` : '0 pts';
        if (totalDesvantagens) totalDesvantagens.textContent = this.pontos.desvantagensAtuais < 0 ? `${this.pontos.desvantagensAtuais} pts` : '0 pts';
        if (saldoTotalVantagens) {
            const saldo = this.pontos.gastos + this.pontos.desvantagensAtuais;
            saldoTotalVantagens.textContent = saldo > 0 ? `+${saldo} pts` : `${saldo} pts`;
        }
        
        const resumos = {
            'gastosAtributos': this.calcularAtributos(),
            'gastosVantagens': this.calcularVantagensDesvantagens(),
            'gastosPericias': this.calcularPericias(),
            'gastosMagias': this.calcularMagias(),
            'gastosDesvantagens': this.pontos.desvantagensAtuais,
            'gastosTotal': this.pontos.gastos + this.pontos.desvantagensAtuais
        };
        
        Object.keys(resumos).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const valor = resumos[id];
                el.textContent = valor > 0 ? `+${valor}` : valor;
            }
        });
    }
}

const sistemaPontos = new SistemaPontos();