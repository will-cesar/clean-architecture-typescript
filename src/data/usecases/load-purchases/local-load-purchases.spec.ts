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
});
