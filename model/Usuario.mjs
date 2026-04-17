export class Usuario {
    constructor(nomeCompleto, email, senhaHash, papel = 'Aluno') {
        this.ID_Usuario = Date.now(); // Simulação de PK
        this.NomeCompleto = nomeCompleto;
        this.Email = email;
        this.SenhaHash = senhaHash;
        this.Papel = papel; // 'Admin' ou 'Aluno'
        this.DataCadastro = new Date().toISOString();
    }
}
