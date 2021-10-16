import { SavePurchases } from "@/domain/usecases";
import { CacheStore } from "@/data/protocols/cache";

export class CacheStoreSpy implements CacheStore {
  actions: CacheStoreSpy.Action[] = [];
  deleteCallsCount = 0;
  insertCallsCount = 0;
  deleteKey: string;
  insertKey: string;
  insertValues: SavePurchases.Params[] = [];

  delete(key: string): void {
    this.actions.push(CacheStoreSpy.Action.delete);
    this.deleteCallsCount++;
    this.deleteKey = key;
  }

  insert(key: string, value: any): void {
    this.actions.push(CacheStoreSpy.Action.insert);
    this.insertCallsCount++;
    this.insertKey = key;
    this.insertValues = value;
  }

  replace(key: string, value: any): void {
    this.delete(key);
    this.insert(key, value);
  }

  simulateDeleteError(): void {
    /**
     * Função para simular o erro do método delete.
     *
     * O método "jest.spyOn" basicamente cria uma função mockada fake.
     * Nesse caso essa função retorna um erro proposital sempre.
     */
    jest.spyOn(CacheStoreSpy.prototype, "delete").mockImplementationOnce(() => {
      this.actions.push(CacheStoreSpy.Action.delete);
      throw new Error();
    });
  }

  simulateInsertError(): void {
    jest.spyOn(CacheStoreSpy.prototype, "insert").mockImplementationOnce(() => {
      this.actions.push(CacheStoreSpy.Action.insert);
      throw new Error();
    });
  }
}

export namespace CacheStoreSpy {
  /**
   * Esse enum foi criado para definir uma ordem específica para chamar cada método
   *
   * É necessário primeiro chamar o método de "delete" obrigatóriamente, e logo
   * após chamar o método de "insert"
   */
  export enum Action {
    delete,
    insert,
  }
}
