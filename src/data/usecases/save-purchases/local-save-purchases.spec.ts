import { mockPurchases, CacheStoreSpy } from "@/data/tests";
import { LocalSavePurchases } from "@/data/usecases";

type SutTypes = {
  sut: LocalSavePurchases;
  cacheStore: CacheStoreSpy;
};

const makeSut = (): SutTypes => {
  const cacheStore = new CacheStoreSpy();
  const sut = new LocalSavePurchases(cacheStore);
  return { sut, cacheStore };
};

describe("LocalSavePurchases", () => {
  /**
   * Teste para garantir que não será inserido ou deletado nenhum
   * cache sem chamar os respectivos métodos
   */

  test("Should not delete or insert cache on sut.init", () => {
    const { cacheStore } = makeSut();
    expect(cacheStore.messages).toEqual([]);
  });

  test("Should delete old cache on sut.save", async () => {
    /**
     * Teste para deletar o Cache antigo quando salvar os novos dados
     *
     * - Se espera que a ordem dos métodos seja primeiro de deletar e logo após inserir
     * - Por isso foi criado um array em "messages", onde ele registra quando cada método
     * é chamado
     */

    const { cacheStore, sut } = makeSut();
    await sut.save(mockPurchases());
    expect(cacheStore.messages).toEqual([
      CacheStoreSpy.Message.delete,
      CacheStoreSpy.Message.insert,
    ]);
    expect(cacheStore.deleteKey).toBe("purchases");
  });

  test("Should not insert new Cache if delete fails", () => {
    /**
     * Teste para garantir que o método insert não vai ser chamado
     * caso haja um erro ao deletar o cache
     */

    const { cacheStore, sut } = makeSut();
    cacheStore.simulateDeleteError();
    const promise = sut.save(mockPurchases());
    expect(cacheStore.messages).toEqual([CacheStoreSpy.Message.delete]);
    expect(promise).rejects.toThrow();
  });

  test("Should insert new Cache if delete succeeds", async () => {
    /**
     * Teste para ter certeza quer um novo cache foi inserido caso
     * o delete tenha funcionado com sucesso.
     *
     * - Valida se o método delete foi chamado
     * - Valida se o método insert foi chamado
     * - Valida se a key do insert é "purchases"
     * - Valida se os novos valores foram inseridos
     */

    const { cacheStore, sut } = makeSut();
    const purchases = mockPurchases();
    await sut.save(purchases);
    expect(cacheStore.messages).toEqual([
      CacheStoreSpy.Message.delete,
      CacheStoreSpy.Message.insert,
    ]);
    expect(cacheStore.insertKey).toBe("purchases");
    expect(cacheStore.insertValues).toBe(purchases);
  });

  test("Should throw if insert throws", () => {
    /**
     * Teste para garantir que o método retorne uma exceção
     */

    const { cacheStore, sut } = makeSut();
    cacheStore.simulateInsertError();
    const promise = sut.save(mockPurchases());
    expect(cacheStore.messages).toEqual([
      CacheStoreSpy.Message.delete,
      CacheStoreSpy.Message.insert,
    ]);
    expect(promise).rejects.toThrow();
  });
});
