import {
  AnyObject,
  DefaultCrudRepository,
  Entity,
  Filter,
} from "@loopback/repository";
import { DeepFilterService } from "./../services/deep-filter.service";

export class DeepCrudRepository<
  T extends Entity,
  ID,
  Relations extends object = {}
> extends DefaultCrudRepository<T, ID, Relations> {
  protected deepFilterService: DeepFilterService = new DeepFilterService();

  async find(
    filter?: Filter<T>,
    options?: AnyObject
  ): Promise<(T & Relations)[]> {
    const filterOffset = this.deepFilterService.getWhereWithoutFormat(filter);
    const result = await super.find(
      {
        ...filter,
        where: filterOffset,
      },
      options
    );
    if (!filter) return result;
    // console.log(result);
    return this.deepFilterService.mapDeep(result, filter);
  }
}
