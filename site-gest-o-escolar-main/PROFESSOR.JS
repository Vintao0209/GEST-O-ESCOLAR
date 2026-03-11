// ===== INICIALIZAÇÃO E DADOS =====
let aulas = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    if (document.getElementById('filterTurma')) preencherFlitros();
    if (document.getElementById('horariosGrid')) exibirHorarios();
});

// Carregar dados do localStorage
function carregarDados() {
    const dadosArmazenados = localStorage.getItem('aulas');
    if (dadosArmazenados) {
        aulas = JSON.parse(dadosArmazenados);
    }
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('aulas', JSON.stringify(aulas));
}

// Gerar ID único
function gerarId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// ===== MENU MÓVEL =====
const menuToggle = document.querySelector('.menu-toggle');
const headerNav = document.querySelector('.home-header nav');
if (menuToggle && headerNav) {
    menuToggle.addEventListener('click', function() {
        headerNav.classList.toggle('show');
    });
}

// ===== NAVEGAÇÃO INTERNA (TABS) =====
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

        btn.classList.add('active');
        const viewId = btn.getAttribute('data-view');
        const viewElement = document.getElementById(viewId);
        
        if (viewElement) {
            viewElement.classList.add('active');
            if (viewId === 'horarios') {
                preencherFlitros();
                exibirHorarios();
            } else if (viewId === 'gerenciar') {
                preencherTabela();
            }
        }
    });
});

// ===== FORMULÁRIO DE ADICIONAR AULA =====
const formAula = document.getElementById('formAula');
if (formAula) {
    formAula.addEventListener('submit', (e) => {
        e.preventDefault();
        const novaAula = {
            id: gerarId(),
            dia: document.getElementById('dia').value,
            horario: document.getElementById('horario').value,
            duracao: parseInt(document.getElementById('duracao').value),
            turma: document.getElementById('turma').value,
            professor: document.getElementById('professor').value,
            materia: document.getElementById('materia').value,
            sala: document.getElementById('sala').value,
            observacoes: document.getElementById('observacoes').value
        };

        aulas.push(novaAula);
        salvarDados();

        const msg = document.getElementById('mensagemSucesso');
        if (msg) {
            msg.style.display = 'block';
            setTimeout(() => { msg.style.display = 'none'; }, 3000);
        }
        formAula.reset();
    });
}

// ===== VISUALIZAR HORÁRIOS E FILTROS =====
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

function exibirHorarios() {
    const grid = document.getElementById('horariosGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    const turmaFiltro = document.getElementById('filterTurma').value;
    const diaFiltro = document.getElementById('filterDia').value;

    let aulasFiltradas = aulas.filter(a => {
        const matchTurma = !turmaFiltro || a.turma === turmaFiltro;
        const matchDia = !diaFiltro || a.dia === diaFiltro;
        return matchTurma && matchDia;
    });

    aulasFiltradas.sort((a, b) => {
        const diasOrder = { 'Segunda': 0, 'Terça': 1, 'Quarta': 2, 'Quinta': 3, 'Sexta': 4 };
        return diasOrder[a.dia] - diasOrder[b.dia] || a.horario.localeCompare(b.horario);
    });

    if (aulasFiltradas.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">Nenhuma aula encontrada</p>';
        return;
    }

    aulasFiltradas.forEach(aula => {
        const card = document.createElement('div');
        card.className = 'horario-card disponivel';
        card.innerHTML = `
            <div class="card-header"><span class="card-dia">${aula.dia}</span></div>
            <div class="card-horario">${aula.horario} - ${calcularHorarioFim(aula.horario, aula.duracao)}</div>
            <div class="card-campo"><div class="card-label">👤 Professor(a)</div><div class="card-valor">${aula.professor}</div></div>
            <div class="card-campo"><div class="card-label">📚 Matéria</div><div class="card-valor">${aula.materia}</div></div>
            <div class="card-campo"><div class="card-label">👥 Turma</div><div class="card-valor">${aula.turma}</div></div>
            <div class="card-campo"><div class="card-label">🚪 Sala</div><div class="card-valor">${aula.sala}</div></div>
        `;
        grid.appendChild(card);
    });
}

function calcularHorarioFim(horarioInicio, duracao) {
    const [horas, minutos] = horarioInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + duracao;
    return `${String(Math.floor(totalMinutos / 60) % 24).padStart(2, '0')}:${String(totalMinutos % 60).padStart(2, '0')}`;
}

// ===== GERENCIAR (TABELA E EDIÇÃO) =====
function preencherTabela() {
    const tbody = document.getElementById('tabelaCorpo');
    if (!tbody) return;
    tbody.innerHTML = aulas.map(aula => `
        <tr>
            <td>${aula.dia}</td>
            <td>${aula.horario}</td>
            <td>${aula.turma}</td>
            <td>${aula.professor}</td>
            <td>${aula.materia}</td>
            <td>${aula.sala}</td>
            <td>
                <div class="acoes-coluna">
                    <button class="btn btn-warning" onclick="editarAula('${aula.id}')">✏️</button>
                    <button class="btn btn-danger" onclick="deletarAula('${aula.id}')">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="7">Vazio</td></tr>';
}

function deletarAula(id) {
    if (confirm('Deletar aula?')) {
        aulas = aulas.filter(a => a.id !== id);
        salvarDados();
        preencherTabela();
        exibirHorarios();
    }
}