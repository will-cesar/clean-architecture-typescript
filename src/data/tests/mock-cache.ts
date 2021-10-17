import { LoadPurchases, SavePurchases } from "@/domain/usecases";
import { CacheStore } from "@/data/protocols/cache";

export class CacheStoreSpy implements CacheStore {
  actions: CacheStoreSpy.Action[] = [];
  deleteKey: string;
  insertKey: string;
  fetchKey: string;
  insertValues: SavePurchases.Params[] = [];
  fetchResult: any;

  fetch(key: string): any {
    this.actions.push(CacheStoreSpy.Action.fetch);
    this.fetchKey = key;
    return this.fetchResult;
  }

  delete(key: string): void {
    this.actions.push(CacheStoreSpy.Action.delete);
    this.deleteKey = key;
  }

  insert(key: string, value: any): void {
    this.actions.push(CacheStoreSpy.Action.insert);
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

  simulateFetchError(): void {
    jest.spyOn(CacheStoreSpy.prototype, "fetch").mockImplementationOnce(() => {
      this.actions.push(CacheStoreSpy.Action.fetch);
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
    fetch,
  }
}
