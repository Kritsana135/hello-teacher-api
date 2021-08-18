import * as _ from "lodash";

export const removeFalsy = function (obj) {
  return _.pickBy(obj, _.identity);
};
