import { StorageService } from './service/StorageService.mjs';
import { Usuario } from './model/Usuario.mjs';

// Inicialização da Aplicação
document.addEventListener('DOMContentLoaded', () => {
    console.log('App FormaPro Iniciado...');
    
    // Inicializar dados de demonstração ou tabelas vazias no localStorage
    StorageService.initDb();

    // Lógica para o Dashboard, se estiver no index.html
    const dashboardStats = document.getElementById('dashboard-stats');
    if (dashboardStats) {
        renderDashboard(dashboardStats);
    }
});

function renderDashboard(container) {
    const cursos = StorageService.getAll('TbCursos');
    const usuarios = StorageService.getAll('TbUsuarios');
    const aulas = StorageService.getAll('TbAulas');
    
    container.innerHTML = `
        <div class="col-md-4">
            <div class="card shadow-sm border-0 bg-white h-100 dash-card">
                <div class="card-body text-center p-4">
                    <div class="rounded-circle text-primary mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px; background-color: rgba(13, 110, 253, 0.1);">
                        <i class="bi bi-people-fill fs-3"></i>
                    </div>
                    <h5 class="card-title fw-bold">Alunos Registrados</h5>
                    <p class="card-text display-6 text-primary fw-bold">${usuarios.length}</p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card shadow-sm border-0 bg-white h-100 dash-card">
                <div class="card-body text-center p-4">
                    <div class="rounded-circle text-success mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px; background-color: rgba(25, 135, 84, 0.1);">
                        <i class="bi bi-book-half fs-3"></i>
                    </div>
                    <h5 class="card-title fw-bold">Cursos Ativos</h5>
                    <p class="card-text display-6 text-success fw-bold">${cursos.length}</p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card shadow-sm border-0 bg-white h-100 dash-card">
                <div class="card-body text-center p-4">
                    <div class="rounded-circle text-warning mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px; background-color: rgba(255, 193, 7, 0.1);">
                        <i class="bi bi-play-circle-fill fs-3"></i>
                    </div>
                    <h5 class="card-title fw-bold">Total de Aulas</h5>
                    <p class="card-text display-6 text-warning fw-bold">${aulas.length}</p>
                </div>
            </div>
        </div>
    `;
}
