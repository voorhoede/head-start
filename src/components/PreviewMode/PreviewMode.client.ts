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
  #datocmsToken: string = '';
  #datocmsEnvironment: string = '';
  $connections = map<Connection>({});
  $connectionError = atom<boolean>(false);
  $connectionStatus = atom<ConnectionStatus>('closed');
  $updateCounts = map<{ [key: string]: number }>({});

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
      // so we wait for the second update to reload the page:
      const counts = Object.values(updateCounts);
      if (counts.some((count) => count >= 2)) {
        window.location.reload();
      }
    });

    const subscriptionConfigs = this.getSubscriptionConfigs();
    subscriptionConfigs.forEach(({ query, variables }) => {
      this.subscribe({ query, variables });
    });
  }

  getSubscriptionConfigs () {
    return this.subscriptionElements.map((element) => element.getConfig() as QueryVariables);
  }

  async subscribe ({ query, variables }: QueryVariables) {
    const key = JSON.stringify({ query, variables });
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
      return;
    }
  }
}

customElements.define('preview-mode-bar', PreviewModeBar);
customElements.define('preview-mode-subscription', PreviewModeSubscription);
customElements.define('preview-mode', PreviewMode);
