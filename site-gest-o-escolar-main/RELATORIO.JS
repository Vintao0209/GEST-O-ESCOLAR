/**
 * LÓGICA DE RELATÓRIOS E COMPARTILHAMENTO DE DADOS
 */

let aulas = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    inicializarMenuMobile();
    
    // Só executa funções de interface se os elementos existirem na página
    if (document.getElementById('filterTurma')) preencherFlitros();
    if (document.getElementById('horariosGrid')) exibirHorarios();
    if (document.getElementById('tabelaCorpo')) preencherTabela();
});

// --- Gestão de Dados (LocalStorage) ---

function carregarDados() {
    const dadosArmazenados = localStorage.getItem('aulas');
    if (dadosArmazenados) {
        aulas = JSON.parse(dadosArmazenados);
    }
}

function salvarDados() {
    localStorage.setItem('aulas', JSON.stringify(aulas));
}

function gerarId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// --- Interface e Menu ---

function inicializarMenuMobile() {
    const menuToggle = document.querySelector('.menu-toggle');
    const headerNav = document.querySelector('.home-header nav');
    if (menuToggle && headerNav) {
        menuToggle.addEventListener('click', () => {
            headerNav.classList.toggle('show');
        });
    }
}

// --- Funções de Visualização (Usadas se houver Grid/Tabela) ---

function calcularHorarioFim(horarioInicio, duracao) {
    const [horas, minutos] = horarioInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + duracao;
    const horasFim = Math.floor(totalMinutos / 60) % 24;
    const minutosFim = totalMinutos % 60;
    return `${String(horasFim).padStart(2, '0')}:${String(minutosFim).padStart(2, '0')}`;
}

function preencherFlitros() {
    const selectTurma = document.getElementById('filterTurma');
    if (!selectTurma) return;

    const turmasUnicas = [...new Set(aulas.map(a => a.turma))].sort();
    const valorAtual = selectTurma.value;
    
    while (selectTurma.options.length > 1) selectTurma.remove(1);
    
    turmasUnicas.forEach(turma => {
        const option = document.createElement('option');
        option.value = turma;
        option.textContent = turma;
        selectTurma.appendChild(option);
    });
    selectTurma.value = valorAtual;
}

// Adicione aqui funções específicas para gerar gráficos ou PDF se desejar futuramente