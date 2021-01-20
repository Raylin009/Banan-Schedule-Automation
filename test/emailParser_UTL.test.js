const { getEmailMetaInfo } = require('../emailParser_UTL');

xtest('getEmailMetaInfo', () => {
  const data = {one: 1};
  data['two'] = 2;
  expect(getEmailMetaInfo).toBeDefined();
  expect(getEmailMetaInfo()).toEqual({one: 1, two: 2});
});