import { map } from 'nanostores';
import { groups } from './config';

type GroupKey = string;
type ItemKey = string;
type ItemValue = boolean;
type ItemMap = {
  [key: ItemKey]: ItemValue;
}
type Item = {
  key: ItemKey;
  title: string;
  text: string;
  default: boolean;
  url: string | false;
  cookies: {
    key: string;
    url: string | false;
  }[];
};

const items = groups.flatMap((group) => group.items as Item[]);
const defaultItemMap = items.reduce((map, item) => ({ ...map, [item.key]: item.default }), {});
const $store = map<ItemMap>(defaultItemMap);

export const hasConsent = (itemKey: ItemKey) => {
  return $store.get()[itemKey] === true;
};

export const setConsent = (itemKey: ItemKey, value: ItemValue) => {
  $store.setKey(itemKey, value);
};

export const setConsentMap = (items: ItemMap) => {
  Object.entries(items).forEach(([key, value]) => {
    setConsent(key, value);
  });
};

export const setGroupConsent = (groupKey: GroupKey, value: ItemValue) => {
  const group = groups.find((group) => group.key === groupKey);
  if (!group) {
    console.warn('ConsentManager: group not found', groupKey);
    return;
  }
  return group.items.forEach((item) => {
    setConsent(item.key, value);
  });
};

export const onConsentChange = (itemKey: ItemKey, handler: (value: ItemValue) => void) => {
  return $store.listen((store, changed) => {
    if (changed === itemKey) {
      handler(store[itemKey]);
    }
  });
};
