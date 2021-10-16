import { SavePurchases } from "@/domain/usecases";
import { CacheStore } from "@/data/protocols/cache";

export class CacheStoreSpy implements CacheStore {
  messages: CacheStoreSpy.Message[] = [];
  deleteCallsCount = 0;
  insertCallsCount = 0;
  deleteKey: string;
  insertKey: string;
  insertValues: SavePurchases.Params[] = [];

  delete(key: string): void {
    this.messages.push(CacheStoreSpy.Message.delete);
    this.deleteCallsCount++;
    this.deleteKey = key;
  }

  insert(key: string, value: any): void {
    this.messages.push(CacheStoreSpy.Message.insert);
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
      this.messages.push(CacheStoreSpy.Message.delete);
      throw new Error();
    });
  }

  simulateInsertError(): void {
    jest.spyOn(CacheStoreSpy.prototype, "insert").mockImplementationOnce(() => {
      this.messages.push(CacheStoreSpy.Message.insert);
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
  export enum Message {
    delete,
    insert,
  }
}
