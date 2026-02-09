import { Injectable, signal, computed } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak: Keycloak;
  private _authenticated = signal(false);
  private _username = signal('');
  private _roles = signal<string[]>([]);
  private _token = signal('');
  private _profile = signal<any>(null);
  private _initialized = signal(false);

  authenticated = this._authenticated.asReadonly();
  username = this._username.asReadonly();
  roles = this._roles.asReadonly();
  token = this._token.asReadonly();
  profile = this._profile.asReadonly();
  initialized = this._initialized.asReadonly();

  isProvider = computed(() => this._roles().includes('provider'));
  isCustomer = computed(() => this._roles().includes('customer'));

  constructor() {
    this.keycloak = new Keycloak({
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId
    });
  }

  async init(): Promise<boolean> {
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false
      });

      this._authenticated.set(authenticated);
      this._initialized.set(true);

      if (authenticated) {
        this._token.set(this.keycloak.token || '');
        this._username.set(this.keycloak.tokenParsed?.['preferred_username'] || '');
        const realmRoles = this.keycloak.tokenParsed?.['realm_access']?.['roles'] || [];
        const customRoles = this.keycloak.tokenParsed?.['realm_roles'] || [];
        this._roles.set([...realmRoles, ...customRoles]);
        this._profile.set(this.keycloak.tokenParsed);

        // Set up token refresh
        setInterval(async () => {
          try {
            const refreshed = await this.keycloak.updateToken(30);
            if (refreshed) {
              this._token.set(this.keycloak.token || '');
            }
          } catch {
            console.error('Failed to refresh token');
          }
        }, 30000);
      }

      return authenticated;
    } catch (error) {
      console.error('Keycloak init failed:', error);
      this._initialized.set(true);
      return false;
    }
  }

  login(): void {
    this.keycloak.login({ redirectUri: window.location.origin });
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  getToken(): string {
    return this.keycloak.token || '';
  }
}
