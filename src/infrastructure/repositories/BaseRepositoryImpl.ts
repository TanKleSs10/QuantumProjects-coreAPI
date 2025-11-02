import { DataSource } from '../../core/interfaces/DataSource';
import { Repository } from '../../core/interfaces/Repository';

/**
 * Generic repository implementation delegating persistence to a data source.
 * Extend this class for entity-specific repository behavior.
 */
export class BaseRepositoryImpl<T> implements Repository<T> {
  constructor(private readonly dataSource: DataSource<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.dataSource.findById(id);
  }

  async findAll(filter?: Partial<T>): Promise<T[]> {
    return this.dataSource.find(filter);
  }

  async create(entity: T): Promise<T> {
    return this.dataSource.insert(entity);
  }

  async update(id: string, entity: Partial<T>): Promise<T | null> {
    return this.dataSource.update(id, entity);
  }

  async delete(id: string): Promise<boolean> {
    return this.dataSource.remove(id);
  }
}
