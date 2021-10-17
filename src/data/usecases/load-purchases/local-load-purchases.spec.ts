import { CacheStoreSpy, mockPurchases } from "@/data/tests";
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

  test("Should return a list of purchases if cache is less than 3 days old", async () => {
    /**
     * Teste para garantir que retorne uma lista de purchases caso o cache tenha
     * menos de 3 dias de duração
     *
     * - é passado um timestamp no limite do tempo máximo permitido, ou seja,
     * 2 dias, 23 horas e 59 segundos.
     * - primeiro é criado uma nova data com a data atual
     * - depois subtrai 3 dias da data atual
     * - logo em seguida adiciona 1 segundo na data, assim formando a data limite esperada
     */

    const currentDate = new Date();
    const timestamp = new Date(currentDate);
    timestamp.setDate(timestamp.getDate() - 3);
    timestamp.setSeconds(timestamp.getSeconds() + 1);
    const { cacheStore, sut } = makeSut(currentDate);
    cacheStore.fetchResult = {
      timestamp,
      value: mockPurchases(),
    };
    const purchases = await sut.loadAll();
    expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch]);
    expect(cacheStore.fetchKey).toBe("purchases");
    expect(purchases).toEqual(cacheStore.fetchResult.value);
  });

  test("Should return an empty list if cache is more than 3 days old", async () => {
    /**
     * Teste para garantir que retorne uma lista vazia caso o cache tenha mais de 3 dias
     */

    const currentDate = new Date();
    const timestamp = new Date(currentDate);
    timestamp.setDate(timestamp.getDate() - 3);
    timestamp.setSeconds(timestamp.getSeconds() - 1);
    const { cacheStore, sut } = makeSut(currentDate);
    cacheStore.fetchResult = {
      timestamp,
      value: mockPurchases(),
    };
    const purchases = await sut.loadAll();
    expect(cacheStore.actions).toEqual([
      CacheStoreSpy.Action.fetch,
      CacheStoreSpy.Action.delete,
    ]);
    expect(cacheStore.fetchKey).toBe("purchases");
    expect(cacheStore.deleteKey).toBe("purchases");
    expect(purchases).toEqual([]);
  });
});
