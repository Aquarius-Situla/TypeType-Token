export function installWebAuthnBypassOverrides(target: {
	PublicKeyCredential?: {
		isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean>;
		isConditionalMediationAvailable?: () => Promise<boolean>;
	};
	navigator?: {
		credentials?: {
			get?: (options?: CredentialRequestOptions) => Promise<Credential | null>;
			create?: (options?: CredentialCreationOptions) => Promise<Credential | null>;
		};
	};
}): void {
	try {
		if (target.PublicKeyCredential) {
			target.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = () =>
				Promise.resolve(false);
			target.PublicKeyCredential.isConditionalMediationAvailable = () => Promise.resolve(false);
		}
		if (target.navigator?.credentials) {
			const creds = target.navigator.credentials;
			const originalGet = creds.get?.bind(creds);
			const originalCreate = creds.create?.bind(creds);

			creds.get = (options?: CredentialRequestOptions) => {
				if (options?.publicKey) {
					return Promise.reject(
						new DOMException("The operation is not supported.", "NotSupportedError"),
					);
				}
				return originalGet ? originalGet(options) : Promise.resolve(null);
			};

			creds.create = (options?: CredentialCreationOptions) => {
				if (options?.publicKey) {
					return Promise.reject(
						new DOMException("The operation is not supported.", "NotSupportedError"),
					);
				}
				return originalCreate ? originalCreate(options) : Promise.resolve(null);
			};
		}
	} catch {}
}
