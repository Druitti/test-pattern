import { CheckoutService } from '../src/services/CheckoutService.js';
import { CarrinhoBuilder } from './builders/CarrinhoBuilder.js';
import { UserMother } from './builders/UserMother.js';
import { Item } from '../src/domain/Item.js';
import { Pedido } from '../src/domain/Pedido.js';

describe('quando o pagamento falha', () => {
	test('deve retornar null e não chamar repository nem email', async () => {
		const carrinho = new CarrinhoBuilder().build();

		const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: false }) };
		const repoDummy = { salvar: jest.fn() };
		const emailDummy = { enviarEmail: jest.fn() };

		const checkoutService = new CheckoutService(gatewayStub, repoDummy, emailDummy);

		const pedido = await checkoutService.processarPedido(carrinho, 'cartao-1');

		expect(pedido).toBeNull();
		expect(repoDummy.salvar).not.toHaveBeenCalled();
		expect(emailDummy.enviarEmail).not.toHaveBeenCalled();
	});
});

describe('quando um cliente Premium finaliza a compra', () => {
	test('deve cobrar com 10% de desconto e enviar email', async () => {
		const user = UserMother.umUsuarioPremium();
		const item = new Item('Produto X', 200);
		const carrinho = new CarrinhoBuilder().comUser(user).comItens([item]).build();

		const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: true }) };
		const savedPedido = new Pedido(42, carrinho, 180, 'PROCESSADO');
		const repoStub = { salvar: jest.fn().mockResolvedValue(savedPedido) };
		const emailMock = { enviarEmail: jest.fn().mockResolvedValue() };

		const checkoutService = new CheckoutService(gatewayStub, repoStub, emailMock);

		const pedido = await checkoutService.processarPedido(carrinho, 'cartao-2');

		// Verifica valor cobrado com desconto (10% para PREMIUM)
		expect(gatewayStub.cobrar).toHaveBeenCalledWith(180, 'cartao-2');

		// Verifica envio de e-mail
		expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
		expect(emailMock.enviarEmail).toHaveBeenCalledWith(
			user.email,
			'Seu Pedido foi Aprovado!',
			`Pedido ${savedPedido.id} no valor de R$${savedPedido.totalFinal}`
		);

		// Retorno do método deve ser o pedido salvo
		expect(pedido).toBe(savedPedido);
	});
});
