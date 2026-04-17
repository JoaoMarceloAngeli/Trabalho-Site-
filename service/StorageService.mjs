// Simula o banco de dados armazenando coleções no localStorage
export class StorageService {
    
    // Retorna todos os itens de uma tabela
    static getAll(table) {
        const data = localStorage.getItem(table);
        return data ? JSON.parse(data) : [];
    }

    // Salva a lista completa na tabela
    static saveAll(table, dataArray) {
        localStorage.setItem(table, JSON.stringify(dataArray));
    }

    // Adiciona um único item
    static insert(table, item) {
        const data = this.getAll(table);
        data.push(item);
        this.saveAll(table, data);
        return item;
    }

    // Atualiza um item buscando por uma propriedade chave (ex: id)
    static update(table, idKey, idValue, itemToUpdate) {
        let data = this.getAll(table);
        const index = data.findIndex(i => i[idKey] === idValue);
        if (index !== -1) {
            data[index] = { ...data[index], ...itemToUpdate };
            this.saveAll(table, data);
            return data[index];
        }
        return null;
    }

    // Deleta um item
    static delete(table, idKey, idValue) {
        let data = this.getAll(table);
        data = data.filter(i => i[idKey] !== idValue);
        this.saveAll(table, data);
    }

    // Utilizado apenas para popular dados base se vazio
    static initDb() {
        const initTable = (table, defaultData) => {
            if (!localStorage.getItem(table)) {
                this.saveAll(table, defaultData);
            }
        };

        initTable('TbUsuarios', [
            { ID_Usuario: 1, NomeCompleto: 'Admin Cursos com Curso', Email: 'admin@formapro.com', SenhaHash: '123456', Papel: 'Admin', DataCadastro: new Date().toISOString() },
            { ID_Usuario: 2, NomeCompleto: 'Aluno Teste', Email: 'aluno@formapro.com', SenhaHash: '123456', Papel: 'Aluno', DataCadastro: new Date().toISOString() }
        ]);
        initTable('TbCategorias', [
            { ID_Categoria: 1, Nome: 'Tecnologia', Descricao: 'Cursos de TI e Programação' }
        ]);
        initTable('TbCursos', [
            { ID_Curso: 1, Titulo: 'Lógica de Programação', Descricao: 'Aprenda os fundamentos.', ID_Instrutor: 1, ID_Categoria: 1, Nivel: 'Iniciante', DataPublicacao: new Date().toISOString(), TotalAulas: 10, TotalHoras: 5 }
        ]);
        initTable('TbAulas', []);
        initTable('TbModulos', []);
        initTable('TbMatriculas', []);
        initTable('TbProgressoAulas', []);
        initTable('TbTrilhas', []);
    }
}
