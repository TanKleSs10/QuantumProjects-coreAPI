/**
 * Defines the contract for data source implementations used by repositories.
 * Keep this interface simple to support multiple persistence strategies.
 */
export interface DataSource<T> {
  findById(id: string): Promise<T | null>;
  find(filter?: Partial<T>): Promise<T[]>;
  insert(entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T | null>;
  remove(id: string): Promise<boolean>;
}
