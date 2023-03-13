/* eslint-disable @typescript-eslint/no-explicit-any */
import {AnyObject, Filter, InclusionFilter, Where} from '@loopback/repository';
import _ from 'lodash';

export class DeepFilterService {
  isFormat(where: Where<AnyObject> | undefined) {
    const properties = _.keys(where);
    if (properties.find(property => property === 'and' || property === 'or'))
      throw new Error('No support to condition and | or');
    return properties.find(property => property.match(/[.]/g));
  }

  getWhereWithoutFormat(filter: Filter | undefined) {
    const newWhere = {};
    if (!filter) return newWhere;
    const relations = this.getRelationsValue(filter.include);
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = filter.where;
    for (const key in filter.where) {
      if (!relations.find(relation => key.match(relation)))
        Object.assign(newWhere, {[key]: where[key]});
    }
    return newWhere;
  }

  getObjectConditionByRelation(
    filter: Filter,
  ): [AnyObject, AnyObject] | Array<AnyObject> {
    const {where, include} = filter;

    const relations = this.getRelationsValue(include);

    if (_.isEmpty(relations) && !this.isFormat(where)) return [];

    const attributes: Array<string> = [];
    const properties: Array<string> = _.keys(where).filter(key => {
      if (key.match(/[.]/g)) return key;
      if (!_.isEmpty(relations)) {
        const result = relations.find(relation => key === relation);
        if (result) attributes.push(result);
      }
    });
    return [_.pick(where, attributes), _.pick(where, properties)];
  }

  getRelationsValue(include: InclusionFilter[] | undefined) {
    return (include ?? []).map(model => {
      if (typeof model === 'string') return model;
      return model.relation;
    });
  }

  convertConditionalBy(
    properties: Object | AnyObject,
    relation?: string,
    callback?: (key: string) => string,
  ) {
    let obj = properties;
    if (relation) {
      const keys = _.keys(properties).filter(key => {
        if (key.match(relation)) return callback ? callback(key) : key;
      });
      obj = _.pick(properties, keys);
    }
    const convert = _.toPairs(obj) // [['a', 1], ['b', 2]]
      .map(item => `"${item.join('" === "')}"`); // ['a === 1', 'b === 2']

    return convert.join(' && ');
  }

  isIncludeWithScope(
    include: InclusionFilter[],
    relation: string,
  ): InclusionFilter | undefined {
    const entity = include.find((model: InclusionFilter) => {
      if (_.isObject(model) && model.relation === relation) return model;
    });
    return entity;
  }

  mapDeep(entities: any[], filter: Filter | AnyObject) {
    // FIXME: Avoid "Propertity": "undefined" to filter in the collections
    const {include} = filter;
    let clone = entities;
    let records: any[] = [];
    const [attributes, properties] = this.getObjectConditionByRelation(filter);

    let relations = this.getRelationsValue(include);

    if (_.isEmpty(attributes) && _.isEmpty(properties)) return clone;

    if (!_.isEmpty(attributes))
      clone.forEach(entity => {
        let formatCondition = this.convertConditionalBy(attributes);
        const value =
          _.keys(attributes).find(key => formatCondition.match(key)) ?? '';
        formatCondition = _.replace(formatCondition, value, entity[value]);
        const validateFunction = new Function(`return ${formatCondition};`);

        if (!validateFunction()) records.push(entity);
      });

    if (!_.isEmpty(records)) {
      clone = records;
      records = [];
    }

    if (
      (_.isEmpty(attributes) || !_.isEmpty(attributes)) &&
      !_.isEmpty(properties)
    )
      clone.forEach((entity: AnyObject) => {
        let formatCondition = '';
        let item = true;
        relations = relations.filter(relation => attributes[relation]);

        for (const relation of relations) {
          const collections = entity[relation];

          if (!_.isArray(entity[relation])) {
            const collection = entity[relation];
            formatCondition = this.convertConditionalBy(properties, relation);

            _.keys(properties).forEach(key => {
              const attribute = key.split('.').pop();
              if (attribute && formatCondition.match(key))
                formatCondition = _.replace(
                  formatCondition,
                  key,
                  collection[attribute],
                );
            });

            const validateFunction = new Function(
              `return ${formatCondition};`,
            );

            if (!validateFunction()) item = false;

          } else {

            const collectionsFilter = collections.filter(
              (collection: AnyObject) => {
                formatCondition = this.convertConditionalBy(properties, relation);

                _.keys(properties).forEach(key => {
                  const attribute = key.split('.').pop();
                  if (attribute && formatCondition.match(key))
                    formatCondition = _.replace(
                      formatCondition,
                      key,
                      collection[attribute],
                    );
                });

                const validateFunction = new Function(
                  `return ${formatCondition};`,
                );

                if (validateFunction()) return collection;
              },
            );

            // FIXME: Define type for Include Filter for recursion
            // // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // const includeFilter: any = this.isIncludeWithScope(filter.include ?? [], relation);
            // if (includeFilter) {
            //   const scope = includeFilter.scope;
            //   if (_.isObject(scope)) entity[relation] = this.mapDeep(entity[relation], scope);
            // }

            // collections = collectionsFilter;
            entity[relation] = collectionsFilter;

            // delete entity[relation];
            if (_.isEmpty(entity[relation])) item = false;
            // console.log(item, entity[relation])
          }
        }
        if (item) {
          records.push(entity);
        }
      });
    return records;
  }
}
