import { getItemTypeId } from '@blocks/block-debug-utils';
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
  $connections = map<Connection>({});
  $connectionError = atom<boolean>(false);
  $connectionStatus = atom<ConnectionStatus>('closed');
  $updateCounts = map<{ [key: string]: number }>({});
  #datocmsToken: string = '';
  #datocmsEnvironment: string = '';

  // CMS debugging tools
  #datocmsProject: string = '';
  #editableRecord: { id: string; type: string } | null = null;
  #editLinkElement: HTMLAnchorElement | null = null;
  #toggleBlockNamesButton: HTMLButtonElement | null = null;
  #$showBlockNames = atom<boolean>(false);

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

  constructor() { 
    super();

    this.barElement = this.querySelector('preview-mode-bar') as PreviewModeBar;
    this.subscriptionElements = [...this.querySelectorAll('preview-mode-subscription')] as PreviewModeSubscription[];

    const { datocmsEnvironment, datocmsToken } = this.dataset;
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

    this.#setupCmsDebuggingTools(); // Optional: remove this to disable edit links and block overlays
  }

  getSubscriptionConfigs () {
    return this.subscriptionElements.map((element) => element.getConfig() as QueryVariables);
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

  /**
   * CMS debugging tools (edit links + block overlays)
   */

  #setupCmsDebuggingTools() {
    this.#datocmsProject = this.dataset.datocmsProject || '';
    if (!this.#datocmsProject) return;

    this.#editableRecord = JSON.parse(
      this.subscriptionElements.find((el) => el.dataset.record)?.dataset.record ?? 'null'
    );
    this.#editLinkElement = this.querySelector('[data-debug-edit-record]');
    this.#toggleBlockNamesButton = this.querySelector('[data-debug-toggle-blocks]');

    const stored = localStorage.getItem('preview-mode-show-block-names');
    this.#$showBlockNames.set(stored === 'true');

    this.#$showBlockNames.listen(() => this.#syncDebuggingToolsVisibility());
    this.#toggleBlockNamesButton?.addEventListener('click', () => {
      this.#$showBlockNames.set(!this.#$showBlockNames.get());
    });

    this.#syncDebuggingToolsVisibility();
    this.#setupBlockLabelHoverTracking();
  }

  #syncDebuggingToolsVisibility() {
    const show = this.#$showBlockNames.get();
    localStorage.setItem('preview-mode-show-block-names', show.toString());
    if (this.#toggleBlockNamesButton) {
      this.#toggleBlockNamesButton.textContent = show ? 'hide blocks' : 'show blocks';
    }
    document.documentElement.dataset.debugBlocksVisible = show ? 'true' : 'false';

    if (show) this.#positionBlockLabels();
    this.#applyEditLinks();
  }

  #applyEditLinks() {
    if (!this.#editableRecord?.id || !this.#editableRecord?.type) return;

    const itemTypeId = getItemTypeId(this.#editableRecord.type);
    if (!itemTypeId) return;

    if (this.#editLinkElement) {
      this.#editLinkElement.href = this.#buildRecordEditUrl(itemTypeId, this.#editableRecord.id);
    }

    if (document.documentElement.dataset.debugBlocksVisible === 'true') {
      this.#applyBlockEditLinks(itemTypeId);
    }
  }

  /**
   * Builds a DatoCMS editor URL for a specific record.
   * (itemTypeId = "LjXdkuCdQxCFT4hv8_ayew" (Page), recordId = "X_tZn3TxQY28ltSyjZUGHQ")
   * => https://my-project.admin.datocms.com/environments/main/editor/item_types/LjXdkuCdQxCFT4hv8_ayew/items/X_tZn3TxQY28ltSyjZUGHQ
   */
  #buildRecordEditUrl(itemTypeId: string, recordId: string) {
    return `https://${this.#datocmsProject}.admin.datocms.com/environments/${this.#datocmsEnvironment}/editor/item_types/${itemTypeId}/items/${recordId}`;
  }

  /**
   * Sets edit link hrefs on block label anchors by appending a #fieldPath hash.
   * e.g. https://my-project.admin.datocms.com/.../items/12345#fieldPath=body.en.0.title
   */
  #applyBlockEditLinks(itemTypeId: string) {
    const baseUrl = this.#buildRecordEditUrl(itemTypeId, this.#editableRecord!.id);
    document.querySelectorAll<HTMLAnchorElement>('[data-debug-edit-block]').forEach((anchor) => {
      const fieldPath = anchor.dataset.debugFieldPath;
      if (!fieldPath) return;

      const url = new URL(baseUrl);
      url.hash = `fieldPath=${this.#withLocaleFieldPath(fieldPath)}`;
      anchor.href = url.toString();
    });
  }

  /**
   * Inserts the current locale as the second segment of a field path.
   * "body" => "body.en", "body.0.title" => "body.en.0.title"
   */
  #withLocaleFieldPath(fieldPath: string) {
    const locale = document.documentElement.lang;
    if (!locale) return fieldPath;

    const parts = fieldPath.split('.');
    if (parts.length < 2) return `${fieldPath}.${locale}`;

    const [root, maybeLocale, ...rest] = parts;
    if (maybeLocale === locale) return fieldPath;

    return [root, locale, maybeLocale, ...rest].join('.');
  }

  #getBlockContainerForLabel(label: HTMLAnchorElement): Element | null {
    let el: Element | null = label.nextElementSibling;
    while (el) {
      if (el.tagName.toLowerCase() !== 'preview-mode-subscription') return el;
      el = el.nextElementSibling;
    }
    return null;
  }

  #positionBlockLabels() {
    document.querySelectorAll<HTMLAnchorElement>('[data-debug-edit-block]').forEach((label) => {
      const block = this.#getBlockContainerForLabel(label);
      if (!block) return;

      const blockRect = block.getBoundingClientRect();
      if (blockRect.width === 0 && blockRect.height === 0) return;

      const offsetParent = label.offsetParent || document.body;
      const parentRect = offsetParent.getBoundingClientRect();
      label.style.top = `${blockRect.top - parentRect.top}px`;
      label.style.left = `${blockRect.left - parentRect.left}px`;
      block.setAttribute('data-debug-block-container', '');
    });
  }

  #setupBlockLabelHoverTracking() {
    let currentLabel: HTMLAnchorElement | null = null;
    let currentBlock: Element | null = null;

    const clearHover = () => {
      currentLabel?.classList.remove('hover');
      currentBlock?.classList.remove('hover');
      currentLabel = null;
      currentBlock = null;
    };

    document.addEventListener(
      'pointermove',
      (e) => {
        if (document.documentElement.dataset.debugBlocksVisible !== 'true' || !(e.target instanceof Element)) {
          clearHover();
          return;
        }

        const labels = document.querySelectorAll<HTMLAnchorElement>('[data-debug-edit-block]');
        let deepest: HTMLAnchorElement | null = null;
        let deepestBlock: Element | null = null;

        for (const label of labels) {
          const block = this.#getBlockContainerForLabel(label);
          if (block && (label.contains(e.target) || block.contains(e.target))) {
            deepest = label;
            deepestBlock = block;
          }
        }

        if (deepest === currentLabel) return;

        clearHover();
        currentLabel = deepest;
        currentBlock = deepestBlock;
        currentLabel?.classList.add('hover');
        currentBlock?.classList.add('hover');
      },
      { passive: true }
    );

    let scrollRaf: number | null = null;
    const onReposition = () => {
      if (document.documentElement.dataset.debugBlocksVisible === 'true') {
        this.#positionBlockLabels();
      }
    };

    window.addEventListener('scroll', () => {
      if (scrollRaf !== null) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        onReposition();
      });
    }, { passive: true });

    window.addEventListener('resize', onReposition, { passive: true });
    window.addEventListener('load', onReposition, { passive: true });
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