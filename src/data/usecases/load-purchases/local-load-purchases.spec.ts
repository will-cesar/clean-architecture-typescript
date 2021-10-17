import { CacheStoreSpy } from "@/data/tests";
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
  /**
   * Teste para garantir que não será inserido ou deletado nenhum
   * cache sem chamar os respectivos métodos
   */

  test("Should not delete or insert cache on sut.init", () => {
    const { cacheStore } = makeSut();
    expect(cacheStore.actions).toEqual([]);
  });

  test("Should call correct key on load", async () => {
    /**
     * Teste para garantir que o loadAll() está sendo chamado pelo método correto,
     * e que está sendo chamada a key correta
     */

    const { cacheStore, sut } = makeSut();
    await sut.loadAll();
    expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch]);
    expect(cacheStore.fetchKey).toBe("purchases");
  });

  test("Should return empty list if load fails", async () => {
    /**
     * Teste para garantir que seja retornada uma lista vazia caso o
     * método loadAll() falhe
     *
     * - Se espera que primeiro chame o método fetch() do CacheStore e falhe,
     * logo em seguida chame o método delete()
     * - Se espera que a key seja "purchases"
     * - Se espera que o retorno do método loadAll() seja um array vazio
     */

    const { cacheStore, sut } = makeSut();
    cacheStore.simulateFetchError();
    const purchases = await sut.loadAll();
    expect(cacheStore.actions).toEqual([
      CacheStoreSpy.Action.fetch,
      CacheStoreSpy.Action.delete,
    ]);
    expect(cacheStore.deleteKey).toBe("purchases");
    expect(purchases).toEqual([]);
  });
});
