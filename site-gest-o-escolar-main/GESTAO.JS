// ===== DADOS E CARREGAMENTO =====
let aulas = [];

async function carregarDados() {
    try {
        const response = await fetch('listar_aulas.php');
        aulas = await response.json();
        atualizarInterface();
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

function atualizarInterface() {
    if (typeof preencherFlitros === 'function') preencherFlitros();
    if (typeof exibirHorarios === 'function') exibirHorarios();
    if (typeof preencherTabela === 'function') preencherTabela();
}

document.addEventListener('DOMContentLoaded', carregarDados);

// ===== MENU MOBILE =====
const menuToggle = document.querySelector('.menu-toggle');
const headerNav = document.querySelector('.home-header nav');
if (menuToggle && headerNav) {
    menuToggle.addEventListener('click', function() {
        headerNav.classList.toggle('show');
    });
}

// ===== NAVEGAÇÃO ENTRE ABAS =====
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

        btn.classList.add('active');
        const viewId = btn.getAttribute('data-view');
        document.getElementById(viewId).classList.add('active');

        if (viewId === 'horarios') {
            preencherFlitros();
            exibirHorarios();
        } else if (viewId === 'gerenciar') {
            preencherTabela();
        }
    });
});

// ===== ADICIONAR AULA =====
document.getElementById('formAula').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dados = Object.fromEntries(formData.entries());

    try {
        const resposta = await fetch('salvar_aula.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(dados).toString()
        });
        const json = await resposta.json();
        if (json.status === 'success') {
            await carregarDados();
            e.target.reset();
            const msg = document.getElementById('mensagemSucesso');
            msg.style.display = 'block';
            setTimeout(() => (msg.style.display = 'none'), 3000);
        }
    } catch (err) {
        alert('Erro na comunicação com o servidor.');
    }
});

// ===== FUNÇÕES DE APOIO E FILTROS =====
function preencherFlitros() {
    const turmasUnicas = [...new Set(aulas.map(a => a.turma))].sort();
    const selectTurma = document.getElementById('filterTurma');
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

function calcularHorarioFim(horarioInicio, duracao) {
    const [horas, minutos] = horarioInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + parseInt(duracao);
    const horasFim = Math.floor(totalMinutos / 60) % 24;
    const minutosFim = totalMinutos % 60;
    return `${String(horasFim).padStart(2, '0')}:${String(minutosFim).padStart(2, '0')}`;
}

// ... (Restante das funções: exibirHorarios, preencherTabela, etc)