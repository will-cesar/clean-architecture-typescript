import { mockPurchases, CacheStoreSpy } from "@/data/tests";
import { LocalLoadPurchases } from "@/data/usecases";

type SutTypes = {
  sut: LocalLoadPurchases;
  cacheStore: CacheStoreSpy;
};

const makeSut = (timestamp = new Date()): SutTypes => {
  const cacheStore = new CacheStoreSpy();
  const sut = new LocalLoadPurchases(cacheStore, timestamp);
  return { sut, cacheStore };
};

describe("LocalLoadPurchases", () => {
  test("Should not delete or insert cache on sut.init", () => {
    const { cacheStore } = makeSut();
    expect(cacheStore.actions).toEqual([]);
  });

  test("Should not insert new Cache if delete fails", async () => {
    /**
     * Teste para garantir que o método insert não vai ser chamado
     * caso haja um erro ao deletar o cache
     */

    const { cacheStore, sut } = makeSut();
    cacheStore.simulateDeleteError();
    const promise = sut.save(mockPurchases());
    expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.delete]);
    await expect(promise).rejects.toThrow();
  });

  test("Should insert new Cache if delete succeeds", async () => {
    /**
     * Teste para ter certeza quer um novo cache foi inserido caso
     * o delete tenha funcionado com sucesso.
     *
     * - Se espera que a ordem dos métodos seja primeiro de deletar e logo após inserir
     * - Por isso foi criado um array em .actions", onde ele registra quando cada método
     * é chamado
     *
     * - Valida se os métodos foram chamados da forma e ordem correta
     * - Valida se a key do insert e delete é "purchases"
     * - Valida se o timestamp está correto e os valores foram inseridos no cache
     * - valida se a promise não retorna uma exceção
     */

    const timestamp = new Date();
    const { cacheStore, sut } = makeSut(timestamp);
    const purchases = mockPurchases();
    const promise = sut.save(purchases);
    expect(cacheStore.actions).toEqual([
      CacheStoreSpy.Action.delete,
      CacheStoreSpy.Action.insert,
    ]);
    expect(cacheStore.deleteKey).toBe("purchases");
    expect(cacheStore.insertKey).toBe("purchases");
    expect(cacheStore.insertValues).toEqual({
      timestamp,
      value: purchases,
    });
    await expect(promise).resolves.toBeFalsy();
  });

  test("Should throw if insert throws", async () => {
    /**
     * Teste para garantir que o método retorne uma exceção
     */

    const { cacheStore, sut } = makeSut();
    cacheStore.simulateInsertError();
    const promise = sut.save(mockPurchases());
    expect(cacheStore.actions).toEqual([
      CacheStoreSpy.Action.delete,
      CacheStoreSpy.Action.insert,
    ]);
    await expect(promise).rejects.toThrow();
  });
});
