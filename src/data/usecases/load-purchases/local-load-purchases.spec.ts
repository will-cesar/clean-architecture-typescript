import {
  CacheStoreSpy,
  mockPurchases,
  getCacheExpirationDate,
} from "@/data/tests";
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

    expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch]);
    expect(purchases).toEqual([]);
  });

  test("Should return a list of purchases if cache is valid", async () => {
    /**
     * Teste para garantir que retorne uma lista de purchases caso o cache tenha
     * menos de 3 dias de duração, ou seja, válido
     *
     * - é criada uma nova data com a data atual
     * - essa data é passada no método de getCacheExpirationDate(), onde fica
     * centralizada a regra sobre o tempo de validação do cache
     * - esse método retorna uma nova data com o prazo máximo de validade do cache
     * - é adicionado mais um segundo nessa data para ser uma data válida,
     * pois 3 dias + 1 segundo = 2 dias, 23 horas e 59 segundos de diferença,
     * ou seja, faltando apenas 1 segundo para chegar no período limite
     */

    const currentDate = new Date();
    const timestamp = getCacheExpirationDate(currentDate);
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

  test("Should return an empty list if cache is expired", async () => {
    /**
     * Teste para garantir que retorne uma lista vazia caso o cache tenha mais de 3 dias,
     * ou seja, inválido
     */

    const currentDate = new Date();
    const timestamp = getCacheExpirationDate(currentDate);
    timestamp.setSeconds(timestamp.getSeconds() - 1);

    const { cacheStore, sut } = makeSut(currentDate);
    cacheStore.fetchResult = {
      timestamp,
      value: mockPurchases(),
    };
    const purchases = await sut.loadAll();

    expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch]);
    expect(cacheStore.fetchKey).toBe("purchases");
    expect(purchases).toEqual([]);
  });

  test("Should return an empty list if cache is on expiration date", async () => {
    /**
     * Teste para garantir que retorne uma lista vazia caso o cache tenha
     * exatamente 3 dias, ou seja, inválido
     */

    const currentDate = new Date();
    const timestamp = getCacheExpirationDate(currentDate);

    const { cacheStore, sut } = makeSut(currentDate);
    cacheStore.fetchResult = {
      timestamp,
      value: mockPurchases(),
    };
    const purchases = await sut.loadAll();

    expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch]);
    expect(cacheStore.fetchKey).toBe("purchases");
    expect(purchases).toEqual([]);
  });

  test("Should return an empty list if cache is empty", async () => {
    /**
     * Teste para garantir que retorne uma lista vazia caso o cache seja vazio
     */

    const currentDate = new Date();
    const timestamp = getCacheExpirationDate(currentDate);
    timestamp.setSeconds(timestamp.getSeconds() + 1);

    const { cacheStore, sut } = makeSut(currentDate);
    cacheStore.fetchResult = {
      timestamp,
      value: [],
    };
    const purchases = await sut.loadAll();

    expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch]);
    expect(cacheStore.fetchKey).toBe("purchases");
    expect(purchases).toEqual([]);
  });
});
