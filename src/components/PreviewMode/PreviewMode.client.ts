import type { ConnectionStatus as DatocmsConnectionStatus } from 'datocms-listen';
import { subscribeToQuery } from 'datocms-listen';
import { atom, map } from 'nanostores';

type ConnectionStatus = DatocmsConnectionStatus | 'error' | 'updating';
type Connection = { [key: string]: ConnectionStatus };
type Query = string;
type Variables = { [key: string]: string };
type QueryVariables = { query: Query; variables?: Variables };

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

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
  /** The page as the server rendered it on load, to tell a stale render from a fresh one before reloading */
  #renderedHtml: Promise<string | null> = Promise.resolve(null);
  #reloading = false;

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
    if (window.self !== window.top) {
      this.querySelector('[data-edit-mode-toggle]')?.remove();
    }

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
    this.#renderedHtml = this.#fetchHtml();

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
          this.reloadWhenChanged();
        }
      }
    });

    const subscriptionConfigs = this.getSubscriptionConfigs();
    subscriptionConfigs.forEach(({ query, variables }) => {
      this.subscribe({ query, variables });
    });

  }

  /**
   * Reloads the page once the server renders it differently from the version on screen.
   * The Real-time Updates API pushes a change before the Content Delivery API, which the
   * server renders from, serves it. Reloading right away then shows the page as it was
   * before the change, and as the new subscription only reports changes after that, the
   * page stays stale until a manual refresh. So the page is fetched (same URL, no cache)
   * until its HTML differs from the HTML rendered on load, for at most ~20 seconds.
   */
  async reloadWhenChanged () {
    if (this.#reloading) return;
    this.#reloading = true;
    this.barElement.setStatus('updating');
    const renderedHtml = await this.#renderedHtml;
    const delays = [0, 1000, 1000, 2000, 2000, 3000, 3000, 4000, 4000];
    for (const delay of delays) {
      if (delay) await wait(delay);
      const html = await this.#fetchHtml();
      // without a baseline or a response there is nothing to compare: reload as before
      if (!renderedHtml || !html || html !== renderedHtml) break;
    }
    window.location.reload();
  }

  async #fetchHtml () {
    try {
      const response = await fetch(window.location.href, { cache: 'no-store', credentials: 'same-origin' });
      return response.ok ? await response.text() : null;
    } catch {
      return null;
    }
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

}

class PreviewModeBar extends HTMLElement {
  #statusElement: HTMLElement;
  #statusMessages: { [key in ConnectionStatus]: string } = {
    closed: 'CMS disconnected (refresh for updates)',
    connecting: 'CMS connecting ...',
    connected: 'CMS connected, receiving live updates',
    error: 'CMS connection error (refresh for updates)',
    updating: 'CMS updated, reloading when the change is available ...',
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