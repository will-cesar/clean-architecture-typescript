import { CacheStore } from "@/data/protocols/cache";
import { LocalSavePurchases } from "@/data/usecases";
import { SavePurchases } from "@/domain";

class CacheStoreSpy implements CacheStore {
  deleteCallsCount = 0;
  insertCallsCount = 0;
  deleteKey: string;
  insertKey: string;
  insertValues: SavePurchases.Params[] = [];

  delete(key: string): void {
    this.deleteCallsCount++;
    this.deleteKey = key;
  }

  insert(key: string, value: any): void {
    this.insertCallsCount++;
    this.insertKey = key;
    this.insertValues = value;
  }

  simulateDeleteError(): void {
    /**
     * Função para simular o erro do método delete.
     *
     * O método "jest.spyOn" basicamente cria uma função mockada fake.
     * Nesse caso essa função retorna um erro proposital sempre.
     */
    jest.spyOn(CacheStoreSpy.prototype, "delete").mockImplementationOnce(() => {
      throw new Error();
    });
  }
}

const mockPurchases = (): Array<SavePurchases.Params> => [
  {
    id: "1",
    date: new Date(),
    value: 50,
  },
  {
    id: "2",
    date: new Date(),
    value: 70,
  },
];

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
  test("Should not delete cache on sut.init", () => {
    const { cacheStore } = makeSut();
    new LocalSavePurchases(cacheStore);
    expect(cacheStore.deleteCallsCount).toBe(0);
  });

  test("Should delete old cache on sut.save", async () => {
    const { cacheStore, sut } = makeSut();
    await sut.save(mockPurchases());
    expect(cacheStore.deleteCallsCount).toBe(1);
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
    expect(cacheStore.insertCallsCount).toBe(0);
    expect(promise).rejects.toThrow();
  });

  test("Should insert new Cache if delete succeeds", async () => {
    /**
     * Teste para ter certeza quer um novo cache foi inserido caso
     * o delete tenha funcionado com sucesso.
     *
     * Valida se o método delete foi chamado
     * Valida se o método insert foi chamado
     * Valida se a key do insert é "purchases"
     * Valida se os novos valores foram inseridos
     */

    const { cacheStore, sut } = makeSut();
    const purchases = mockPurchases();
    await sut.save(purchases);
    expect(cacheStore.deleteCallsCount).toBe(1);
    expect(cacheStore.insertCallsCount).toBe(1);
    expect(cacheStore.insertKey).toBe("purchases");
    expect(cacheStore.insertValues).toBe(purchases);
  });
});
