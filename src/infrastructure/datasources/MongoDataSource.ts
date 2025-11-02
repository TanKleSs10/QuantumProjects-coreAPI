import { Model } from 'mongoose';
import { DataSource } from '../../core/interfaces/DataSource';

/**
 * Simple MongoDB data source backed by a Mongoose model.
 */
export class MongoDataSource<T> implements DataSource<T> {
  constructor(private readonly model: Model<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).lean<T>().exec();
  }

  async find(filter: Partial<T> = {}): Promise<T[]> {
    return this.model.find(filter).lean<T>().exec();
  }

  async insert(entity: T): Promise<T> {
    return this.model.create(entity);
  }

  async update(id: string, entity: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, entity, { new: true }).lean<T>().exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return Boolean(result);
  }
}
