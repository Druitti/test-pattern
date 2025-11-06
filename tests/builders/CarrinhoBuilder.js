import { Carrinho } from '../../src/domain/Carrinho.js';
import { Item } from '../../src/domain/Item.js';
import { User } from '../../src/domain/User.js';

export class CarrinhoBuilder {
    constructor() {
        // valores padrão: usuário padrão e 1 item de R$100
        this.user = new User(1, 'Usuario Padrao', 'user@exemplo.com', 'PADRAO');
        this.itens = [new Item('Item Padrão', 100)];
    }

    comUser(user) {
        this.user = user;
        return this;
    }

    comItens(itens) {
        // aceita array de Item ou array de números/objetos simples
        this.itens = itens.map(i => {
            if (i instanceof Item) return i;
            if (typeof i === 'number') return new Item('Item', i);
            return new Item(i.nome ?? 'Item', i.preco ?? 0);
        });
        return this;
    }

    vazio() {
        this.itens = [];
        return this;
    }

    build() {
        return new Carrinho(this.user, this.itens);
    }
}
