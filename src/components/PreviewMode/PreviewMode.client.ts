import itemTypesJson from '@lib/datocms/itemTypes.json';
import type { ConnectionStatus as DatocmsConnectionStatus } from 'datocms-listen';
import { subscribeToQuery } from 'datocms-listen';
import { atom, map } from 'nanostores';

type ConnectionStatus = DatocmsConnectionStatus | 'error';
type Connection = { [key: string]: ConnectionStatus };
type Query = string;
type Variables = { [key: string]: string };
type QueryVariables = { query: Query; variables?: Variables };

/**
 * Each web page can have multiple preview mode subscriptions.
 * For example the page template and a menu component can both have a subscription.
 * This component listens to all subscriptions and displays the overall connection status in the preview mode bar.
 * If for any of the subscriptions new data is received, it automatically reloads the web page.
 */
class PreviewMode extends HTMLElement {
  barElement: PreviewModeBar;
  subscriptionElements: PreviewModeSubscription[];
  editableRecord: { id: string, type: string } | null;
  editLinkElement: HTMLAnchorElement;
  toggleBlockNamesButton: HTMLButtonElement;
  $connections = map<Connection>({});
  $connectionError = atom<boolean>(false);
  $connectionStatus = atom<ConnectionStatus>('closed');
  $updateCounts = map<{ [key: string]: number }>({});
  $showBlockNames = atom<boolean>(false);
  #datocmsToken: string = '';
  #datocmsEnvironment: string = '';
  #datocmsProject: string = '';

  /**
   * Generates a hashed key for the map tracking subscriptions.
   * This key is based on the query and variables of the subscription.
   */
  static subscriptionKey({ query, variables }: QueryVariables) {
    const string = JSON.stringify({ query, variables });
    // DJB2 by Daniel J. Bernstein @see http://www.cse.yorku.ca/~oz/hash.html
    let hash = 5381;
    for (let i = 0; i < string.length; i++) {
      hash = (hash >> 5) + hash + string.charCodeAt(i);
    }
    return hash.toString(36);
  }
  
  static getItemTypeId (typename?: string): string | null { 
    const key = typename as keyof typeof itemTypesJson;
    const value = itemTypesJson[key];
    if (typeof value === 'string') {
      return value;
    }
    return null;
  }
  
  constructor() { 
    super();

    this.barElement = this.querySelector('preview-mode-bar') as PreviewModeBar;
    this.subscriptionElements = [...this.querySelectorAll('preview-mode-subscription')] as PreviewModeSubscription[];
    this.editableRecord = JSON.parse(
      this.subscriptionElements.find((element) => element.dataset.record)?.dataset.record ?? 'null'
    );
    this.editLinkElement = this.querySelector('[data-edit-record]') as HTMLAnchorElement;
    this.toggleBlockNamesButton = this.querySelector('[data-toggle-block-names]') as HTMLButtonElement;

    const { datocmsEnvironment, datocmsToken, datocmsProject } = this.dataset;
    if (!datocmsEnvironment) {
      console.warn('PreviewMode: missing required data-datocms-environment attribute');
      return;
    }
    if (!datocmsToken) {
      console.warn('PreviewMode: missing required data-datocms-token attribute');
      return;
    }
    this.#datocmsEnvironment = datocmsEnvironment;
    this.#datocmsToken = datocmsToken;
    this.#datocmsProject = datocmsProject || '';

    this.$connections.listen((connections) => {
      // set overall connection status to lowest of all connections:
      const statuses: ConnectionStatus[] = Object.values(connections);
      if (statuses.includes('closed')) {
        this.$connectionStatus.set('closed');
      } else if (statuses.includes('connecting')) {
        this.$connectionStatus.set('connecting');
      } else if (statuses.includes('connected')) {
        this.$connectionStatus.set('connected');
      }
    });

    const updateBarStatus = () => {
      const status = this.$connectionStatus.get();
      const error = this.$connectionError.get();
      this.barElement.setStatus(error ? 'error' : status);
    };

    this.$connectionStatus.listen(() => updateBarStatus());
    this.$connectionError.listen(() => updateBarStatus());
    this.$updateCounts.listen((updateCounts) => {
      // each subscription directly triggers an update when connected,
      // so we wait for the update count to exceed the number of instances:
      const instances = this.getInstanceCounts();
      for (const [key, count] of Object.entries(updateCounts)) {
        const instanceCount = instances[key];
        if (count > instanceCount) {
          window.location.reload();
        }
      }
    });

    const subscriptionConfigs = this.getSubscriptionConfigs();
    subscriptionConfigs.forEach(({ query, variables }) => {
      this.subscribe({ query, variables });
    });

    const storedState = localStorage.getItem('preview-mode-show-block-names');
    const initialShowState = storedState === 'true';
    this.$showBlockNames.set(initialShowState);

    this.$showBlockNames.listen((show) => {
      localStorage.setItem('preview-mode-show-block-names', show.toString());
      if (this.toggleBlockNamesButton) {
        this.toggleBlockNamesButton.textContent = show ? 'hide blocks' : 'show blocks';
      }
      this.updateBlockNamesVisibility();
    });

    this.toggleBlockNamesButton?.addEventListener('click', () => {
      this.$showBlockNames.set(!this.$showBlockNames.get());
    });

    this.#initBlockLabelHover();
  }

  updateBlockNamesVisibility() {
    const show = this.$showBlockNames.get();
    document.documentElement.dataset.showBlockNames = show ? 'true' : 'false';
    
    if (show) {
      this.#positionBlockLabels();
      if (this.editableRecord?.id && this.editableRecord?.type && this.#datocmsProject) {
        const itemTypeId = PreviewMode.getItemTypeId(this.editableRecord.type);
        if (itemTypeId) {
          this.setBlockEditLinks(itemTypeId);
        }
      }
    }
  }

  #positionBlockLabels() {
    const labels = document.querySelectorAll<HTMLAnchorElement>('[data-edit-block]');
    labels.forEach((label) => {
      const block = label.nextElementSibling;
      if (!block) return;

      const rect = block.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      label.style.top = `${rect.top + window.scrollY}px`;
      label.style.left = `${rect.left + window.scrollX}px`;
      block.setAttribute('data-block-container', '');
    });
  }

  #initBlockLabelHover() {
    let currentLabel: HTMLAnchorElement | null = null;
    let currentBlock: Element | null = null;

    document.addEventListener(
      'pointermove',
      (e) => {
        if (document.documentElement.dataset.showBlockNames !== 'true') {
          currentLabel?.classList.remove('hover');
          currentBlock?.classList.remove('hover');
          currentLabel = null;
          currentBlock = null;
          return;
        }

        if (!(e.target instanceof Element)) {
          currentLabel?.classList.remove('hover');
          currentBlock?.classList.remove('hover');
          currentLabel = null;
          currentBlock = null;
          return;
        }

        const labels = document.querySelectorAll<HTMLAnchorElement>('[data-edit-block]');
        let deepest: HTMLAnchorElement | null = null;
        let deepestBlock: Element | null = null;

        for (const label of labels) {
          const block = label.nextElementSibling;
          if (block && (label.contains(e.target) || block.contains(e.target))) {
            deepest = label;
            deepestBlock = block;
          }
        }

        if (deepest === currentLabel) return;

        currentLabel?.classList.remove('hover');
        currentBlock?.classList.remove('hover');
        currentLabel = deepest;
        currentBlock = deepestBlock;
        currentLabel?.classList.add('hover');
        currentBlock?.classList.add('hover');
      },
      { passive: true }
    );

    window.addEventListener('resize', () => {
      if (document.documentElement.dataset.showBlockNames === 'true') {
        this.#positionBlockLabels();
      }
    }, { passive: true });

    window.addEventListener('load', () => {
      if (document.documentElement.dataset.showBlockNames === 'true') {
        this.#positionBlockLabels();
      }
    }, { passive: true });
  }

  getRecordEditUrl(itemTypeId: string, recordId: string) {
    return `https://${this.#datocmsProject}.admin.datocms.com/environments/${this.#datocmsEnvironment}/editor/item_types/${itemTypeId}/items/${recordId}/edit`;
  }

  withLocaleFieldPath(fieldPath: string) {
    const locale = document.documentElement.lang;
    if (!locale) {
      return fieldPath;
    }
    const parts = fieldPath.split('.');
    if (parts.length < 2) {
      return `${fieldPath}.${locale}`;
    }
    const [root, maybeLocale, ...rest] = parts;
    if (maybeLocale === locale) {
      return fieldPath;
    }
    return [root, locale, maybeLocale, ...rest].join('.');
  }

  setBlockEditLinks(itemTypeId: string) {
    const baseUrl = this.getRecordEditUrl(itemTypeId, this.editableRecord!.id);
    const anchors = document.querySelectorAll<HTMLAnchorElement>('[data-edit-block]');
    anchors.forEach((anchor) => {
      const fieldPath = anchor.dataset.fieldPath;
      if (!fieldPath) {
        return;
      }
      const url = new URL(baseUrl);
      url.hash = `fieldPath=${this.withLocaleFieldPath(fieldPath)}`;
      anchor.href = url.toString();
    });
  }

  getSubscriptionConfigs () {
    return this.subscriptionElements.map((element) => element.getConfig() as QueryVariables);
  }

  connectedCallback() {
    this.updateBlockNamesVisibility();
    
    if (!this.editableRecord?.id || !this.editableRecord?.type || !this.#datocmsProject) {
      return;
    }

    const itemTypeId = PreviewMode.getItemTypeId(this.editableRecord.type);
    if (!itemTypeId) {
      return;
    }

    this.editLinkElement.href = this.getRecordEditUrl(itemTypeId, this.editableRecord.id);
    this.setBlockEditLinks(itemTypeId);
  }
  
  getInstanceCounts () {
    return this.getSubscriptionConfigs()
      .reduce((instanceMap, { query, variables }: QueryVariables) => {
        const key = PreviewMode.subscriptionKey({ query, variables });
        const count = instanceMap?.[key] || 0;
        return {
          ...instanceMap,
          [key]: count + 1,
        };
      }, {} as { [key: string]: number });
  }

  async subscribe ({ query, variables }: QueryVariables) {
    const key = PreviewMode.subscriptionKey({ query, variables });
    this.$connections.setKey(key, 'closed');
    this.$updateCounts.setKey(key, 0);
    await subscribeToQuery({
      query,
      variables,
      environment: this.#datocmsEnvironment,
      token: this.#datocmsToken,
      preview: true,
      onUpdate: () => {
        const count = this.$updateCounts.get()[key];
        this.$updateCounts.setKey(key, count + 1);
      },
      onStatusChange: (status) => {
        this.$connections.setKey(key, status);
      },
      onChannelError: (error) => {
        this.$connectionError.set(true);
        console.error('PreviewMode subscription error:', { error, query, variables });
      },
    });
  }
}

class PreviewModeBar extends HTMLElement {
  #statusElement: HTMLElement;
  #statusMessages: { [key in ConnectionStatus]: string } = {
    closed: 'CMS disconnected (refresh for updates)',
    connecting: 'CMS connecting ...',
    connected: 'CMS connected, receiving live updates',
    error: 'CMS connection error (refresh for updates)',
  };

  constructor() {
    super();
    this.#statusElement = this.querySelector('[data-status]') as HTMLElement;
    this.setStatus('closed');
  }

  setStatus(status: ConnectionStatus) {
    this.#statusElement.dataset.status = status;
    this.#statusElement.innerHTML = this.#statusMessages[status];
  }
}

class PreviewModeSubscription extends HTMLElement {
  getConfig() {
    const script = this.querySelector('script');
    if (!script) {
      console.warn('PreviewModeSubscription: missing required script element', this);
      return;
    }
    try {
      const { query, variables }: QueryVariables = JSON.parse(script.innerText);
      return { query, variables };
    } catch (error) {
      console.warn('PreviewModeSubscription: script element does not contain valid JSON', script.innerText);
      return void error;
    }
  }
}

customElements.define('preview-mode-bar', PreviewModeBar);
customElements.define('preview-mode-subscription', PreviewModeSubscription);
customElements.define('preview-mode', PreviewMode);
