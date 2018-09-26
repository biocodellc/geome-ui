import angular from 'angular';

const excludeFilter = () => (collection, exclude) => {
  if (!exclude) return collection;

  const filter = Array.isArray
    ? item => !exclude.includes(item)
    : item => item !== exclude;

  return collection.filter(filter);
};

export default angular
  .module('fims.filters.exclude', [])
  .filter('exclude', excludeFilter).name;
